#!/usr/bin/env python3
"""
PyInstaller build script for Agentic Essence Desktop on Windows.
Produces a single standalone executable (~65 MB) without bundling raw 1.5 GB Linux VM images.
"""

import os
import sys
import shutil
import subprocess
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR / "dist"
BUILD_DIR = BASE_DIR / "build"
ENTRY_POINT = BASE_DIR / "launcher.py"


def clean():
    for d in [DIST_DIR, BUILD_DIR]:
        if d.exists():
            shutil.rmtree(d)
            print(f"[CLEAN] Removed {d}")


def build():
    clean()
    print("=" * 60)
    print("  BUILDING AGENTIC ESSENCE DESKTOP EXECUTABLE")
    print("=" * 60)

    cmd = [
        sys.executable,
        "-m",
        "PyInstaller",
        "--noconfirm",
        "--onefile",
        "--name",
        "AgenticEssence-Desktop",
        "--distpath",
        str(DIST_DIR),
        "--workpath",
        str(BUILD_DIR),
        "--add-data",
        f"{BASE_DIR / 'src' / 'www'}{os.pathsep}src/www",
        "--add-data",
        f"{BASE_DIR / 'desktop_server.py'}{os.pathsep}.",
        str(ENTRY_POINT)
    ]

    icon_path = BASE_DIR / "src" / "www" / "icon.png"
    if icon_path.exists():
        # If .ico exists, add --icon
        ico_path = BASE_DIR / "src" / "www" / "icon.ico"
        if ico_path.exists():
            cmd.extend(["--icon", str(ico_path)])

    print(f"[CMD] {' '.join(cmd)}")
    res = subprocess.run(cmd, cwd=str(BASE_DIR))
    if res.returncode == 0:
        print("\n[SUCCESS] Desktop executable built in dist/ directory.")
    else:
        print(f"\n[ERROR] Build failed with code {res.returncode}")
        sys.exit(res.returncode)


if __name__ == "__main__":
    build()
