import os
import subprocess
import pytest

TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_DIR = os.path.dirname(TESTS_DIR)
APP_DIR = os.path.join(REPO_DIR, "android-app") if os.path.isdir(os.path.join(REPO_DIR, "android-app")) else "/root/agentic-essence-android"
APK_PATH = os.path.join(APP_DIR, "bin/AgenticEssence-Android.apk")

def test_apk_exists_and_signed():
    # If APK hasn't been built yet in this directory, build it
    if not os.path.isfile(APK_PATH):
        build_script = os.path.join(REPO_DIR, "build_apk.sh") if os.path.isfile(os.path.join(REPO_DIR, "build_apk.sh")) else "/root/agentic-essence-android/build_apk.sh"
        subprocess.run(["bash", build_script], check=True)

    assert os.path.isfile(APK_PATH), f"Built APK does not exist at {APK_PATH}"
    assert os.path.getsize(APK_PATH) > 10000, "APK is unusually small"

    # Verify signature with apksigner
    res = subprocess.run(["apksigner", "verify", "--verbose", APK_PATH], capture_output=True, text=True)
    assert res.returncode == 0, f"apksigner verification failed: {res.stderr}"

def test_apk_badging():
    res = subprocess.run(["aapt", "dump", "badging", APK_PATH], capture_output=True, text=True)
    assert res.returncode == 0, f"aapt dump failed: {res.stderr}"
    stdout = res.stdout
    assert "package: name='org.antigravity.agenticessence'" in stdout
    assert "application-label:'Agentic Essence'" in stdout
    assert "uses-permission: name='android.permission.INTERNET'" in stdout
    assert "uses-permission: name='android.permission.CAMERA'" in stdout
    assert "uses-permission: name='android.permission.VIBRATE'" in stdout

def test_download_destinations_updated():
    dest2 = "/root/Downloads/AgenticEssence-Android.apk"
    dest3 = "/root/AgenticEssence-Android.apk"

    assert os.path.isfile(dest2), f"{dest2} missing"
    assert os.path.isfile(dest3), f"{dest3} missing"
