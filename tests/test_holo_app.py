import os
import re
import pytest

TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_DIR = os.path.dirname(TESTS_DIR)
HOLO_DIR = os.path.join(REPO_DIR, "holo-app")

def test_holo_manifest_and_resources():
    manifest_path = os.path.join(HOLO_DIR, "AndroidManifest.xml")
    assert os.path.isfile(manifest_path), "holo-app/AndroidManifest.xml missing"
    with open(manifest_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "package=\"org.antigravity.agenticvox\"" in content
    assert "android.permission.RECORD_AUDIO" in content
    assert "android.permission.INTERNET" in content
    assert "MainActivity" in content

def test_holo_web_assets_integrity():
    assets_dir = os.path.join(HOLO_DIR, "assets/www")
    assert os.path.isdir(assets_dir), "assets/www directory missing in holo-app"

    index_html = os.path.join(assets_dir, "index.html")
    styles_css = os.path.join(assets_dir, "styles.css")
    renderer_js = os.path.join(assets_dir, "holo-renderer.js")
    voice_js = os.path.join(assets_dir, "voice-engine.js")
    spatial_js = os.path.join(assets_dir, "spatial-tasks.js")
    app_js = os.path.join(assets_dir, "app.js")

    for p in [index_html, styles_css, renderer_js, voice_js, spatial_js, app_js]:
        assert os.path.isfile(p), f"Missing holo-app asset: {p}"

    with open(index_html, "r", encoding="utf-8") as f:
        html = f.read()
    # Confirm NO chat boxes / omnibars in voice-only holographic stage
    assert "id=\"omniinput\"" not in html.lower()
    assert "id=\"chatinput\"" not in html.lower()
    assert "id=\"modelinput\"" in html.lower()
    assert "holo-stage-canvas" in html
    assert "spatial-task-viewport" in html
    assert "voice-orb-container" in html

def test_holo_renderer_personas():
    renderer_js = os.path.join(HOLO_DIR, "assets/www/holo-renderer.js")
    with open(renderer_js, "r", encoding="utf-8") as f:
        js = f.read()

    assert "drawSwarm" in js
    assert "drawTuring" in js
    assert "drawKnuth" in js
    assert "drawLovelace" in js
    assert "FRAME_INTERVAL" in js

def test_agentic_vox_branding_and_resources():
    strings_path = os.path.join(HOLO_DIR, "res/values/strings.xml")
    assert os.path.isfile(strings_path)
    with open(strings_path, "r", encoding="utf-8") as f:
        strings_content = f.read()
    assert "Agentic Vox" in strings_content

    manifest_path = os.path.join(HOLO_DIR, "AndroidManifest.xml")
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest_content = f.read()
    assert "android.permission.ACCESS_FINE_LOCATION" in manifest_content
    assert "android.permission.ACCESS_COARSE_LOCATION" in manifest_content
    assert "@drawable/ic_launcher" in manifest_content

    # Logo assets
    launcher_icon = os.path.join(HOLO_DIR, "res/drawable/ic_launcher.png")
    app_icon = os.path.join(HOLO_DIR, "assets/www/icon.png")
    app_favicon = os.path.join(HOLO_DIR, "assets/www/favicon.png")
    assert os.path.isfile(launcher_icon), "ic_launcher.png missing"
    assert os.path.isfile(app_icon), "assets/www/icon.png missing"
    assert os.path.isfile(app_favicon), "assets/www/favicon.png missing"

    # In-app brand header
    holo_index = os.path.join(HOLO_DIR, "assets/www/index.html")
    with open(holo_index, "r", encoding="utf-8") as f:
        html = f.read()
    assert "holo-vox-brand" in html
    assert "vox-logo-img" in html
    assert "modal-brand-banner" in html

def test_google_api_key_portal_and_links():
    # Verify in holo-app index.html
    holo_index = os.path.join(HOLO_DIR, "assets/www/index.html")
    with open(holo_index, "r", encoding="utf-8") as f:
        holo_html = f.read()
    assert "Agentic Vox" in holo_html
    assert "openGoogleKeyPortal" in holo_html
    assert "GOOGLE GEMINI API KEY" in holo_html

    # Verify in website index.html
    site_index = os.path.join(REPO_DIR, "website/index.html")
    with open(site_index, "r", encoding="utf-8") as f:
        site_html = f.read()
    assert "Agentic Vox" in site_html
    assert "https://aistudio.google.com/app/apikey" in site_html
    assert "Free Google API Key" in site_html
    assert "AgenticVox-Android.apk" in site_html

def test_native_voice_engine_callbacks_and_providers():
    voice_js = os.path.join(HOLO_DIR, "assets/www/voice-engine.js")
    with open(voice_js, "r", encoding="utf-8") as f:
        v_code = f.read()
    assert "onNativeSpeechDetected" in v_code
    assert "onNativePartialResult" in v_code
    assert "onNativeError" in v_code
    assert "onNativeTTSFallback" in v_code

    app_js = os.path.join(HOLO_DIR, "assets/www/app.js")
    with open(app_js, "r", encoding="utf-8") as f:
        a_code = f.read()
    assert "onProviderChange" in a_code
    assert "openGoogleKeyPortal" in a_code
    assert "gemini-2.0-flash" in a_code

    java_bridge = os.path.join(HOLO_DIR, "src/org/antigravity/agenticvox/HoloBridgeInterface.java")
    with open(java_bridge, "r", encoding="utf-8") as f:
        j_code = f.read()
    assert "openExternalUrl" in j_code

def test_vox_apk_binaries():
    bin_apk = os.path.join(HOLO_DIR, "bin/AgenticVox-Android.apk")
    download_apk = os.path.join(REPO_DIR, "downloads/AgenticVox-Android.apk")
    assert os.path.isfile(bin_apk), "holo-app/bin/AgenticVox-Android.apk missing"
    assert os.path.isfile(download_apk), "downloads/AgenticVox-Android.apk missing"
    assert os.path.getsize(bin_apk) > 10000
    assert os.path.getsize(download_apk) > 10000
