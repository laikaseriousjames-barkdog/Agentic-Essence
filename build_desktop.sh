#!/bin/bash
set -e

echo "=========================================================="
echo "  AGENTIC ESSENCE — DESKTOP ASSET SYNC & LOCAL BUILD"
echo "=========================================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESKTOP_DIR="$SCRIPT_DIR/desktop-app"
WWW_DIR="$DESKTOP_DIR/src/www"

echo "[1/4] Ensuring target directories exist..."
mkdir -p "$WWW_DIR"
mkdir -p "$SCRIPT_DIR/downloads"

echo "[2/4] Syncing Cyberdeck web assets..."
cp -u "$SCRIPT_DIR/android-app/assets/www/app.js" "$WWW_DIR/app.js" 2>/dev/null || cp "$SCRIPT_DIR/android-app/assets/www/app.js" "$WWW_DIR/app.js"
cp -u "$SCRIPT_DIR/android-app/assets/www/styles.css" "$WWW_DIR/styles.css" 2>/dev/null || cp "$SCRIPT_DIR/android-app/assets/www/styles.css" "$WWW_DIR/styles.css"
cp -u "$SCRIPT_DIR/android-app/assets/www/icon.png" "$WWW_DIR/icon.png" 2>/dev/null || cp "$SCRIPT_DIR/android-app/assets/www/icon.png" "$WWW_DIR/icon.png"

echo "[3/4] Validating desktop server & bridge scripts..."
python3 -c "import py_compile; py_compile.compile('$DESKTOP_DIR/desktop_server.py', doraise=True)"
python3 -c "import py_compile; py_compile.compile('$DESKTOP_DIR/launcher.py', doraise=True)"
python3 -c "import py_compile; py_compile.compile('$DESKTOP_DIR/main.py', doraise=True)"

echo "[4/5] Building Windows NSIS Setup Installer..."
if command -v makensis >/dev/null 2>&1; then
    if [ ! -f "$DESKTOP_DIR/icon.ico" ]; then
        python3 -c "from PIL import Image; im=Image.open('$WWW_DIR/icon.png').convert('RGBA'); im.save('$DESKTOP_DIR/icon.ico', format='ICO', sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])"
    fi
    if [ ! -d "$DESKTOP_DIR/runtime" ] || [ ! -f "$DESKTOP_DIR/runtime/pythonw.exe" ]; then
        echo "  → Downloading Python Embed Runtime..."
        python3 -c "import urllib.request, zipfile, os; urllib.request.urlretrieve('https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip', '/tmp/py-embed.zip'); os.makedirs('$DESKTOP_DIR/runtime', exist_ok=True); zipfile.ZipFile('/tmp/py-embed.zip').extractall('$DESKTOP_DIR/runtime')"
        python3 -c "with open('$DESKTOP_DIR/runtime/python311._pth', 'w') as f: f.write('python311.zip\n.\n..\nimport site\n')"
    fi
    makensis "$DESKTOP_DIR/installer.nsi"
    echo "  ✓ Generated: downloads/Agentic-Essence-Desktop-Setup.exe"
else
    echo "  [SKIP] makensis not found. Install nsis to build Setup.exe"
fi

echo "[5/5] Desktop package validated and ready."
echo "  → Test run: python3 $DESKTOP_DIR/launcher.py --server-only"
echo "  → Direct access: http://127.0.0.1:52400/index.html"
