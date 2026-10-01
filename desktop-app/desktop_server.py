#!/usr/bin/env python3
"""
Agentic Essence Desktop Server v3.0
Lightweight, zero-dependency local daemon & static asset host.
Powers the Cyberdeck UI, headless WSL2 Kali VM orchestration, and Ollama integration.
"""

import os
import sys
import json
import time
import socket
import platform
import subprocess
import threading
import urllib.request
import urllib.error
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
WWW_DIR = BASE_DIR / "src" / "www"

DEFAULT_PORT = 52400
FALLBACK_PORTS = [52400, 52401, 52402, 8765, 8080]

_CLIPBOARD_TEXT = ""


def get_platform_info():
    sys_name = platform.system()
    return {
        "os": sys_name,
        "release": platform.release(),
        "arch": platform.machine(),
        "processor": platform.processor(),
        "python": sys.version.split()[0],
        "node_name": platform.node()
    }


def is_wsl_available():
    """Detect if WSL2 is installed on the host."""
    if platform.system() == "Windows":
        try:
            res = subprocess.run(
                ["wsl.exe", "-l", "-v"],
                capture_output=True,
                text=True,
                timeout=5
            )
            return res.returncode == 0
        except Exception:
            return False
    elif platform.system() == "Linux":
        # Check if already running inside WSL or Linux container
        if os.path.exists("/proc/sys/fs/binfmt_misc/WSL"):
            return True
        return True
    return False


def get_kali_vm_status():
    """Inspect Kali Linux VM / WSL status headlessly."""
    is_win = platform.system() == "Windows"
    distro = "kali-linux"
    installed = False
    running = False

    if is_win:
        try:
            res = subprocess.run(
                ["wsl.exe", "-l", "-v"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if res.returncode == 0:
                output = res.stdout
                for line in output.splitlines():
                    if "kali" in line.lower():
                        installed = True
                        if "running" in line.lower():
                            running = True
                        break
        except Exception:
            pass
    else:
        # On Linux / NetHunter host
        installed = True
        running = True
        distro = "linux-native"

    return {
        "installed": installed,
        "running": running,
        "distro": distro,
        "mode": "headless",
        "timestamp": time.time()
    }


def exec_shell_command(cmd, timeout=30):
    """Execute host shell command safely."""
    if not cmd or not cmd.strip():
        return {"stdout": "", "stderr": "Empty command", "output": "", "exit_code": 1}

    trimmed = cmd.strip()
    is_win = platform.system() == "Windows"

    # Route specialized queries
    lower = trimmed.lower()
    if lower in ("wifi scan", "wifiscan", "iwlist scan"):
        if is_win:
            run_cmd = ["netsh", "wlan", "show", "networks", "mode=bssid"]
        else:
            run_cmd = ["bash", "-c", "nmcli dev wifi 2>/dev/null || iw dev wlan0 scan 2>/dev/null || ip link"]
    elif lower in ("ifconfig", "ip a", "ip addr"):
        if is_win:
            run_cmd = ["ipconfig", "/all"]
        else:
            run_cmd = ["bash", "-c", "ip -br addr || ifconfig"]
    elif lower in ("battery", "battery status"):
        if is_win:
            run_cmd = ["powershell", "-NoProfile", "-Command", "Get-CimInstance Win32_Battery | Select-Object EstimatedChargeRemaining, BatteryStatus"]
        else:
            run_cmd = ["bash", "-c", "cat /sys/class/power_supply/battery/capacity 2>/dev/null || echo 100%"]
    elif lower.startswith("kali ") or lower.startswith("wsl "):
        sub = trimmed[trimmed.find(" ") + 1:].strip()
        return exec_kali_vm_command(sub, timeout=timeout)
    else:
        if is_win:
            run_cmd = ["powershell", "-NoProfile", "-NonInteractive", "-Command", trimmed]
        else:
            run_cmd = ["bash", "-c", trimmed]

    try:
        proc = subprocess.run(
            run_cmd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        out = proc.stdout.strip()
        err = proc.stderr.strip()
        combined = out if out else err
        return {
            "stdout": out,
            "stderr": err,
            "output": combined,
            "exit_code": proc.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": f"Command timed out after {timeout} seconds",
            "output": f"Command timed out after {timeout}s",
            "exit_code": 124
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": str(e),
            "output": f"Execution error: {e}",
            "exit_code": 1
        }


def exec_kali_vm_command(cmd, timeout=30):
    """Execute command headlessly inside Kali Linux WSL2 (No GUI window)."""
    if not cmd or not cmd.strip():
        return {"stdout": "", "stderr": "Empty command", "output": "", "exit_code": 1}

    is_win = platform.system() == "Windows"
    if is_win:
        # Crucial: invoke bash directly via wsl.exe without triggering WSLg X11/Wayland
        run_cmd = ["wsl.exe", "-d", "kali-linux", "--", "bash", "-c", cmd]
    else:
        # On Linux/NetHunter host
        run_cmd = ["bash", "-c", cmd]

    try:
        proc = subprocess.run(
            run_cmd,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        out = proc.stdout.strip()
        err = proc.stderr.strip()
        combined = out if out else err
        return {
            "stdout": out,
            "stderr": err,
            "output": combined,
            "exit_code": proc.returncode,
            "mode": "headless"
        }
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": f"Kali command timed out after {timeout}s",
            "output": "Timed out",
            "exit_code": 124
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": str(e),
            "output": f"Kali error: {e}",
            "exit_code": 1
        }


def check_ollama_models(timeout=2):
    """Fetch locally running Ollama models."""
    url = "http://127.0.0.1:11434/api/tags"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "AgenticEssenceDesktop/3.0"})
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status == 200:
                data = json.loads(response.read().decode())
                models = [m.get("name") for m in data.get("models", [])]
                return {"online": True, "models": models}
    except Exception:
        pass
    return {"online": False, "models": []}


def run_tcp_port_scan(host="127.0.0.1", ports=None, timeout=0.25):
    """Scan ports quickly using non-blocking/threaded sockets."""
    if ports is None:
        ports = [21, 22, 80, 443, 11434, 8080, 8765, 3389, 5900]

    open_ports = []
    def _check_port(p):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(timeout)
                if s.connect_ex((host, p)) == 0:
                    open_ports.append(p)
        except Exception:
            pass

    threads = []
    for p in ports:
        t = threading.Thread(target=_check_port, args=(p,))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    return sorted(open_ports)


class AgenticDesktopHandler(SimpleHTTPRequestHandler):
    """HTTP Request Handler serving www assets and REST API endpoints."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WWW_DIR), **kwargs)

    def end_headers(self):
        # Enable CORS and disable aggressive caching for dev
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]

        if path == "/api/health":
            self._send_json({
                "status": "ok",
                "app": "Agentic Essence Desktop",
                "version": "3.0.0",
                "platform": get_platform_info(),
                "wsl_available": is_wsl_available(),
                "ollama": check_ollama_models()
            })
            return

        if path == "/api/system/info":
            self._send_json({
                "os": platform.system(),
                "release": platform.release(),
                "arch": platform.machine(),
                "posture": "SECURE",
                "wsl_available": is_wsl_available(),
                "kali_status": get_kali_vm_status()
            })
            return

        if path == "/api/vm/status":
            self._send_json(get_kali_vm_status())
            return

        if path == "/api/models":
            self._send_json(check_ollama_models())
            return

        if path == "/api/clipboard":
            global _CLIPBOARD_TEXT
            self._send_json({"text": _CLIPBOARD_TEXT})
            return

        # Default static file serving from WWW_DIR
        return super().do_GET()

    def do_POST(self):
        path = self.path.split("?")[0]
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8", errors="ignore") if content_length > 0 else "{}"

        try:
            payload = json.loads(body) if body else {}
        except Exception:
            payload = {}

        if path in ("/api/shell", "/api/exec"):
            cmd = payload.get("command") or payload.get("cmd") or ""
            res = exec_shell_command(cmd)
            self._send_json(res)
            return

        if path == "/api/vm/exec":
            cmd = payload.get("command") or payload.get("cmd") or ""
            res = exec_kali_vm_command(cmd)
            self._send_json(res)
            return

        if path == "/api/vm/start":
            is_win = platform.system() == "Windows"
            if is_win:
                try:
                    subprocess.Popen(["wsl.exe", "-d", "kali-linux", "--", "exec", "true"])
                except Exception:
                    pass
            self._send_json({"status": "running", "mode": "headless"})
            return

        if path == "/api/vm/stop":
            is_win = platform.system() == "Windows"
            if is_win:
                try:
                    subprocess.run(["wsl.exe", "--terminate", "kali-linux"], timeout=5)
                except Exception:
                    pass
            self._send_json({"status": "stopped", "mode": "headless"})
            return

        if path == "/api/portscan":
            host = payload.get("host", "127.0.0.1")
            ports = payload.get("ports", [21, 22, 80, 443, 11434, 8080, 8765])
            open_ports = run_tcp_port_scan(host, ports)
            self._send_json(open_ports)
            return

        if path == "/api/clipboard":
            global _CLIPBOARD_TEXT
            _CLIPBOARD_TEXT = payload.get("text", "")
            self._send_json({"success": True})
            return

        self.send_error(404, "Endpoint not found")

    def _send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def find_free_port(preferred=DEFAULT_PORT):
    for p in [preferred] + FALLBACK_PORTS:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", p))
                return p
            except OSError:
                continue
    # Let OS assign
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class DesktopServer:
    def __init__(self, host="127.0.0.1", port=DEFAULT_PORT):
        self.host = host
        self.port = find_free_port(port)
        self.httpd = None
        self._thread = None

    def start(self):
        self.httpd = ThreadingHTTPServer((self.host, self.port), AgenticDesktopHandler)
        self._thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)
        self._thread.start()
        print(f"⚡ [Agentic Essence Desktop Server] Listening on http://{self.host}:{self.port}")
        return self.port

    def stop(self):
        if self.httpd:
            self.httpd.shutdown()
            self.httpd.server_close()
            print("⚡ [Agentic Essence Desktop Server] Stopped.")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Agentic Essence Desktop Server")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Port to bind to")
    parser.add_argument("--host", default="127.0.0.1", help="Host address to bind to")
    args = parser.parse_args()

    srv = DesktopServer(host=args.host, port=args.port)
    actual_port = srv.start()
    print(f"Cyberdeck URL: http://{args.host}:{actual_port}/index.html")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        srv.stop()
        print("\nShutdown complete.")
