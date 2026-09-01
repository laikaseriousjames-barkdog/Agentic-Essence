import os
import subprocess
import pytest

APP_DIR = "/root/agentic-essence-android"
APK_PATH = os.path.join(APP_DIR, "bin/AgenticEssence-Android.apk")

def test_apk_exists_and_signed():
    assert os.path.isfile(APK_PATH), "Built APK does not exist"
    assert os.path.getsize(APK_PATH) > 10000, "APK is unusually small"

    # Verify signature with apksigner
    res = subprocess.run(["apksigner", "verify", "--verbose", APK_PATH], capture_output=True, text=True)
    assert res.returncode == 0, f"apksigner verification failed: {res.stderr}"
    assert "Verifies" in res.stdout or res.returncode == 0

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
    dest1 = "/root/repos/Angetic-Essence/downloads/AgenticEssence-Android.apk"
    dest2 = "/root/Downloads/AgenticEssence-Android.apk"
    dest3 = "/root/AgenticEssence-Android.apk"

    assert os.path.isfile(dest1), f"{dest1} missing"
    assert os.path.isfile(dest2), f"{dest2} missing"
    assert os.path.isfile(dest3), f"{dest3} missing"
    assert os.path.getsize(dest1) == os.path.getsize(APK_PATH)
