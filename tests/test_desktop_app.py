import os
import sys
import json
import time
import urllib.request
import pytest
from pathlib import Path

TESTS_DIR = Path(__file__).resolve().parent
REPO_DIR = TESTS_DIR.parent
DESKTOP_DIR = REPO_DIR / "desktop-app"
WWW_DIR = DESKTOP_DIR / "src" / "www"

sys.path.insert(0, str(DESKTOP_DIR))


def test_desktop_assets_exist():
    """Verify all desktop web assets and scripts exist."""
    assert (DESKTOP_DIR / "desktop_server.py").is_file()
    assert (DESKTOP_DIR / "launcher.py").is_file()
    assert (DESKTOP_DIR / "main.py").is_file()
    assert (DESKTOP_DIR / "package.json").is_file()
    assert (DESKTOP_DIR / "electron-main.js").is_file()
    assert (DESKTOP_DIR / "preload.js").is_file()
    assert (DESKTOP_DIR / "build_exe.py").is_file()
    assert (WWW_DIR / "index.html").is_file()
    assert (WWW_DIR / "desktop-bridge.js").is_file()
    assert (WWW_DIR / "app.js").is_file()
    assert (WWW_DIR / "styles.css").is_file()


def test_desktop_bridge_methods():
    """Verify desktop-bridge.js implements essential bridge methods."""
    bridge_code = (WWW_DIR / "desktop-bridge.js").read_text(encoding="utf-8")
    
    expected_methods = [
        "runShellCommand",
        "runKaliCommand",
        "getVmStatus",
        "startVm",
        "stopVm",
        "showToast",
        "vibrate",
        "speakText",
        "getAvailableVoices",
        "copyToClipboard",
        "getClipboardText",
        "getDeviceSecurityPosture",
        "runPortScan"
    ]
    for method in expected_methods:
        assert method in bridge_code, f"Missing method {method} in desktop-bridge.js"

    # Must expose both DesktopBridge and AndroidBridge for backward compatibility
    assert "window.DesktopBridge = DesktopBridge;" in bridge_code
    assert "window.AndroidBridge = DesktopBridge;" in bridge_code
    assert "window.Bridge = DesktopBridge;" in bridge_code


def test_desktop_index_html_wiring():
    """Verify index.html loads desktop-bridge.js before app.js and embeds Kali VM console."""
    html = (WWW_DIR / "index.html").read_text(encoding="utf-8")
    
    bridge_pos = html.find('src="desktop-bridge.js"')
    app_pos = html.find('src="app.js"')
    
    assert bridge_pos != -1, "desktop-bridge.js not included in index.html"
    assert app_pos != -1, "app.js not included in index.html"
    assert bridge_pos < app_pos, "desktop-bridge.js must be loaded before app.js"

    # Verify embedded Kali Linux VM Console is present
    assert "KALI LINUX VM (HEADLESS WSL2)" in html
    assert "execKaliVmDirect" in html
    assert "checkKaliHealth" in html


def test_desktop_server_endpoints():
    """Launch DesktopServer on a test port and exercise all REST API endpoints."""
    from desktop_server import DesktopServer
    
    server = DesktopServer(port=52488)
    port = server.start()
    base_url = f"http://127.0.0.1:{port}"

    try:
        # 1. Health
        with urllib.request.urlopen(f"{base_url}/api/health") as res:
            assert res.status == 200
            data = json.loads(res.read().decode())
            assert data["status"] == "ok"
            assert data["version"] == "3.0.0"
            assert "platform" in data

        # 2. System info
        with urllib.request.urlopen(f"{base_url}/api/system/info") as res:
            assert res.status == 200
            data = json.loads(res.read().decode())
            assert data["posture"] == "SECURE"

        # 3. VM Status (Headless inspection)
        with urllib.request.urlopen(f"{base_url}/api/vm/status") as res:
            assert res.status == 200
            data = json.loads(res.read().decode())
            assert data["mode"] == "headless"
            assert "installed" in data
            assert "running" in data

        # 4. Shell Execution
        req = urllib.request.Request(
            f"{base_url}/api/shell",
            data=json.dumps({"command": "echo AGY_TEST_OK"}).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as res:
            assert res.status == 200
            data = json.loads(res.read().decode())
            assert "AGY_TEST_OK" in data["stdout"]
            assert data["exit_code"] == 0

        # 5. Kali VM Command Execution (Headless mode)
        req = urllib.request.Request(
            f"{base_url}/api/vm/exec",
            data=json.dumps({"command": "echo KALI_HEADLESS_OK"}).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as res:
            assert res.status == 200
            data = json.loads(res.read().decode())
            assert data["mode"] == "headless"

        # 6. Clipboard read and write
        req = urllib.request.Request(
            f"{base_url}/api/clipboard",
            data=json.dumps({"text": "CLIP_DATA_123"}).encode(),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as res:
            assert res.status == 200

        with urllib.request.urlopen(f"{base_url}/api/clipboard") as res:
            assert res.status == 200
            data = json.loads(res.read().decode())
            assert data["text"] == "CLIP_DATA_123"

        # 7. Static asset serving
        with urllib.request.urlopen(f"{base_url}/desktop-bridge.js") as res:
            assert res.status == 200
            content = res.read().decode()
            assert "DesktopBridge" in content

    finally:
        server.stop()


def test_website_desktop_v3_synced():
    """Verify website index.html features the v3.0 Windows Desktop release."""
    website_html = (REPO_DIR / "website" / "index.html").read_text(encoding="utf-8")
    
    assert "Windows PC App (v3.0)" in website_html
    assert "Windows Desktop</h3>" in website_html
    assert "v3.0</div>" in website_html
    assert "Standalone Desktop · ~65 MB Fast Download" in website_html
    assert "Embedded Headless Kali VM console (no window hijacking)" in website_html
    assert "Lightweight ~65 MB installer (no 1.5 GB OS bloat)" in website_html
    assert "Agentic-Essence-Desktop-Setup.exe" in website_html
