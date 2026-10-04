import os
import json
import re
from pathlib import Path
import pytest

TESTS_DIR = Path(__file__).resolve().parent
REPO_DIR = TESTS_DIR.parent
WEBSITE_DIR = REPO_DIR / "website"

def test_website_core_files_exist():
    """Verify all critical files for the website exist and are non-empty."""
    core_files = [
        "index.html",
        "styles.css",
        "manifest.json",
        "sw.js",
        "favicon.svg",
        "vox-logo.png",
        "docs/eula.html",
        "docs/privacy.html",
        "assets/AgenticVoxPromo.mp4",
        "assets/AgenticEssencePromo.mp4",
        "assets/vox-preview.jpg",
        "assets/cyberdeck-preview.jpg",
        "assets/vox_tts.mp3",
        "assets/cyber_tts.mp3",
        "assets/icon-192.png",
        "assets/icon-512.png",
        "assets/og-banner.jpg",
    ]
    for rel_path in core_files:
        p = WEBSITE_DIR / rel_path
        assert p.is_file(), f"Expected website file missing: {rel_path}"
        assert p.stat().st_size > 0, f"Website file is empty: {rel_path}"

def test_manifest_pwa_compliance():
    """Verify manifest.json is valid JSON with icons and theme colors."""
    manifest_path = WEBSITE_DIR / "manifest.json"
    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data.get("name")
    assert data.get("short_name")
    assert "icons" in data and len(data["icons"]) >= 2
    sizes = [icon.get("sizes") for icon in data["icons"]]
    assert "192x192" in sizes
    assert "512x512" in sizes
    assert data.get("theme_color")
    assert data.get("background_color")

def test_index_html_internal_and_doc_links():
    """Verify all internal document and anchor links in index.html resolve properly."""
    html_content = (WEBSITE_DIR / "index.html").read_text(encoding="utf-8")

    # Document links
    assert 'href="docs/eula.html"' in html_content
    assert (WEBSITE_DIR / "docs" / "eula.html").is_file()
    assert 'href="docs/privacy.html"' in html_content
    assert (WEBSITE_DIR / "docs" / "privacy.html").is_file()

    # Anchor targets
    anchors = re.findall(r'href="#([a-zA-Z0-9_-]+)"', html_content)
    assert len(anchors) > 0
    for target in set(anchors):
        if target in ["top", ""]:
            continue
        assert f'id="{target}"' in html_content, f"Anchor #{target} target id not found in index.html"

def test_index_html_features_and_personas():
    """Verify key features, 12 personas, and interactive showcases are present."""
    html = (WEBSITE_DIR / "index.html").read_text(encoding="utf-8")

    # The 12 avatars/personas
    personas = [
        "Agentic Swarm", "Alan Turing", "Donald Knuth", "Ada Lovelace",
        "Vox Prime", "Cyber Valkyrie", "Sentinel", "Cipher",
        "Phantom", "Oracle", "Nova", "Aegis"
    ]
    for persona in personas:
        assert persona in html, f"Persona '{persona}' missing in index.html"

    # Interactive components
    assert "switchShowcaseTab" in html
    assert "validateGeminiKey" in html
    assert "toggleTerminalPlayback" in html
    assert "toggleAudioPreview" in html
    assert "filterDownloads" in html
    assert "toggleFaq" in html

    # Verified SHA-256 checksums
    assert "ef67c447aedfabd25c94d1135504629290f9af75e91fa753ed6e6d66807039ac" in html
    assert "432c666741fa613040f2dc0b7c818acee23b871126be55648b866f40ce7a078b" in html
    assert "9c7990eb5f0267875762270c7e173ee2f36dc1f9c574e9f1c3e34232c92947b0" in html

def test_service_worker_integrity():
    """Verify sw.js registers v9.0 and includes legal docs in cache list."""
    sw_code = (WEBSITE_DIR / "sw.js").read_text(encoding="utf-8")
    assert "agentic-essence-v9.0" in sw_code
    assert "/docs/eula.html" in sw_code
    assert "/docs/privacy.html" in sw_code
