import os
import re
import pytest

TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_DIR = os.path.dirname(TESTS_DIR)
APP_DIR = os.path.join(REPO_DIR, "android-app") if os.path.isdir(os.path.join(REPO_DIR, "android-app")) else "/root/agentic-essence-android"

def test_no_legacy_cloud_in_codebase():
    """Verify that zero references to legacy cloud backend exist in app source code."""
    for root, dirs, files in os.walk(APP_DIR):
        if any(skip in root for skip in ["bin", "obj", ".pytest_cache", "tests", ".git"]):
            continue
        for file in files:
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                assert "base44" not in content.lower(), f"Found legacy cloud reference in {path}"
                assert "superagent" not in content.lower(), f"Found legacy cloud reference in {path}"


def test_asset_files_integrity():
    index_html = os.path.join(APP_DIR, "assets/www/index.html")
    styles_css = os.path.join(APP_DIR, "assets/www/styles.css")
    app_js = os.path.join(APP_DIR, "assets/www/app.js")

    assert os.path.isfile(index_html)
    assert os.path.isfile(styles_css)
    assert os.path.isfile(app_js)

    with open(index_html, "r", encoding="utf-8") as f:
        html = f.read()
        assert "chatContainer" in html
        assert "messageInput" in html
        assert "sendBtn" in html
        assert "micBtn" in html
        assert "toolsModal" in html
        assert "toolCountBadge" in html

    with open(app_js, "r", encoding="utf-8") as f:
        js = f.read()
        assert "synthesizeToolFromScratch" in js
        assert "mountToolCard" in js
        assert "saveCustomTool" in js
        assert "deleteCustomTool" in js
        assert "state.history" in js
        assert "PERSONAS" in js


def test_bridge_methods_consistency():
    java_bridge = os.path.join(APP_DIR, "src/org/antigravity/agenticdeck/WebAppInterface.java")
    with open(java_bridge, "r", encoding="utf-8") as f:
        java_content = f.read()

    js_interfaces = re.findall(r"@JavascriptInterface\s+public\s+[\w<>]+\s+(\w+)\s*\(", java_content)

    expected_methods = [
        "makePhoneCall",
        "sendSmsDirect",
        "findContactNumber",
        "openAppByName",
        "setDeviceAlarm",
        "startVoiceRecognition",
        "showToast",
        "vibrate",
        "speakText",
        "getBatteryLevel",
        "checkShizukuPermission",
        "requestShizukuPermission",
        "isShizukuAvailable",
        "isShizukuReady",
        "getExecutiveEnvironmentStatus",
        "executeExecutiveCommand",
        "inspectSystem",
        "sendScreenInput",
        "runShizukuCommand"
    ]

    for m in expected_methods:
        assert m in js_interfaces, f"Method {m} missing from WebAppInterface.java"


def test_executive_binaries_and_shizuku_dex_exist():
    """Verify that both android-app and holo-app bundle rish_shizuku.dex and busybox."""
    for sub in ["android-app", "holo-app"]:
        base = os.path.join(REPO_DIR, sub)
        dex = os.path.join(base, "assets/rish_shizuku.dex")
        busybox = os.path.join(base, "assets/bin/busybox")
        rish = os.path.join(base, "assets/rish")

        assert os.path.isfile(dex), f"{sub} missing assets/rish_shizuku.dex"
        assert os.path.getsize(dex) > 10000, f"{sub} rish_shizuku.dex is too small"
        assert os.path.isfile(busybox), f"{sub} missing assets/bin/busybox"
        assert os.path.getsize(busybox) > 1000000, f"{sub} busybox binary is too small"
        assert os.path.isfile(rish), f"{sub} missing assets/rish"
