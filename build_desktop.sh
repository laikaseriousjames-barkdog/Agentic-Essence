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

echo "[4/4] Desktop package validated successfully."
echo "  → Test run: python3 $DESKTOP_DIR/launcher.py --server-only"
echo "  → Direct access: http://127.0.0.1:52400/index.html"
