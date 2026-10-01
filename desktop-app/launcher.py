#!/usr/bin/env python3
"""
Agentic Essence Desktop Launcher v3.0
Double-click launcher for Windows / Linux / macOS.
Starts the local background daemon and opens the Cyberdeck HUD in dedicated App Mode.
"""

import os
import sys
import time
import shutil
import platform
import subprocess
import webbrowser
from pathlib import Path

# Ensure desktop-app is on sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from desktop_server import DesktopServer, DEFAULT_PORT


def find_app_mode_browser():
    """Find Microsoft Edge, Google Chrome, or Brave to run in dedicated --app window mode."""
    if platform.system() == "Windows":
        candidates = [
            os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
            os.path.expandvars(r"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
            os.path.expandvars(r"%LocalAppData%\Microsoft\Edge\Application\msedge.exe"),
            os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%LocalAppData%\Google\Chrome\Application\chrome.exe"),
            os.path.expandvars(r"%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"),
        ]
        for p in candidates:
            if os.path.isfile(p):
                return p
    elif platform.system() == "Linux":
        candidates = [
            shutil.which("google-chrome"),
            shutil.which("google-chrome-stable"),
            shutil.which("chromium"),
            shutil.which("chromium-browser"),
            shutil.which("microsoft-edge"),
            shutil.which("brave-browser"),
        ]
        for c in candidates:
            if c:
                return c
    elif platform.system() == "Darwin":
        candidates = [
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
            "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
        ]
        for p in candidates:
            if os.path.isfile(p):
                return p
    return None


def launch_desktop(server_only=False):
    print("=" * 65)
    print("   AGENTIC ESSENCE — Autonomous Cyberdeck Desktop v3.0")
    print("=" * 65)
    print()

    # 1. Start Server
    server = DesktopServer(port=DEFAULT_PORT)
    port = server.start()
    app_url = f"http://127.0.0.1:{port}/index.html"
    print(f"  → Host Daemon online at {app_url}")

    if server_only:
        print("  → Running in server-only mode. Press Ctrl+C to exit.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            server.stop()
        return

    # 2. Open Dedicated Desktop Window
    browser_bin = find_app_mode_browser()
    window_proc = None

    if browser_bin:
        print(f"  → Launching native Cyberdeck window via: {os.path.basename(browser_bin)}")
        user_data = BASE_DIR / ".ae_desktop_profile"
        user_data.mkdir(exist_ok=True)
        cmd = [
            browser_bin,
            f"--app={app_url}",
            "--window-size=1360,860",
            f"--user-data-dir={user_data}",
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-background-networking"
        ]
        try:
            window_proc = subprocess.Popen(cmd)
        except Exception as e:
            print(f"  [WARN] Native window spawn failed ({e}), opening default browser...")
            webbrowser.open(app_url)
    else:
        print("  → Native app-mode browser not found. Opening standard browser...")
        webbrowser.open(app_url)

    print()
    print("  ✓ Cyberdeck Active.")
    print("  ✓ Tri-Agent Swarm (Planner, Builder, Auditor) online.")
    print("  ✓ Headless WSL2 Kali Linux VM integration active.")
    print("  Close the application window or press Ctrl+C in this terminal to exit.")
    print("-" * 65)

    try:
        if window_proc:
            window_proc.wait()
        else:
            while True:
                time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        print("\nShutting down Agentic Essence...")
        if window_proc and window_proc.poll() is None:
            window_proc.terminate()
        server.stop()
        print("Done.")


if __name__ == "__main__":
    is_server_only = "--server-only" in sys.argv or "--headless" in sys.argv
    launch_desktop(server_only=is_server_only)
