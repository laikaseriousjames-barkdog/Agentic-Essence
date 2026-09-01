import os
import xml.etree.ElementTree as ET
import pytest

TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_DIR = os.path.dirname(TESTS_DIR)
APP_DIR = os.path.join(REPO_DIR, "android-app") if os.path.isdir(os.path.join(REPO_DIR, "android-app")) else "/root/agentic-essence-android"

def test_manifest_structure():
    manifest_path = os.path.join(APP_DIR, "AndroidManifest.xml")
    assert os.path.isfile(manifest_path), "AndroidManifest.xml missing"

    tree = ET.parse(manifest_path)
    root = tree.getroot()

    assert root.tag == "manifest"
    assert root.attrib.get("package") == "org.antigravity.agenticessence"

    app = root.find("application")
    assert app is not None, "<application> missing in AndroidManifest.xml"
    assert app.attrib.get("{http://schemas.android.com/apk/res/android}label") == "@string/app_name"

    # Check MainActivity
    activities = app.findall("activity")
    main_activity = None
    for act in activities:
        if act.attrib.get("{http://schemas.android.com/apk/res/android}name") == ".MainActivity":
            main_activity = act
            break
    assert main_activity is not None, "MainActivity not defined in manifest"
    assert main_activity.attrib.get("{http://schemas.android.com/apk/res/android}exported") == "true"

    # Check telephony, SMS, contacts, alarm, and hardware permissions
    permissions = [elem.attrib.get("{http://schemas.android.com/apk/res/android}name") for elem in root.findall("uses-permission")]
    assert "android.permission.CALL_PHONE" in permissions
    assert "android.permission.SEND_SMS" in permissions
    assert "android.permission.READ_SMS" in permissions
    assert "android.permission.READ_CONTACTS" in permissions
    assert "android.permission.SET_ALARM" in permissions
    assert "android.permission.INTERNET" in permissions
    assert "android.permission.CAMERA" in permissions
    assert "android.permission.RECORD_AUDIO" in permissions
    assert "android.permission.VIBRATE" in permissions


def test_resource_files():
    strings_path = os.path.join(APP_DIR, "res/values/strings.xml")
    colors_path = os.path.join(APP_DIR, "res/values/colors.xml")
    themes_path = os.path.join(APP_DIR, "res/values/themes.xml")
    layout_path = os.path.join(APP_DIR, "res/layout/activity_main.xml")
    icon_path = os.path.join(APP_DIR, "res/drawable/ic_launcher.png")

    assert os.path.isfile(strings_path)
    assert os.path.isfile(colors_path)
    assert os.path.isfile(themes_path)
    assert os.path.isfile(layout_path)
    assert os.path.isfile(icon_path)

    with open(icon_path, "rb") as f:
        header = f.read(8)
        assert header.startswith(b"\x89PNG\r\n\x1a\n"), "Icon is not a valid PNG"
