import os
import re
import json
import pytest

TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_DIR = os.path.dirname(TESTS_DIR)
HOLO_DIR = os.path.join(REPO_DIR, "holo-app")
APP_DIR = os.path.join(REPO_DIR, "android-app")

EXPECTED_PERSONAS = [
    "swarm", "turing", "knuth", "lovelace",
    "shadow", "sentry", "cipher", "valkyrie",
    "matrix", "ghost", "glitch", "archon"
]

def test_holo_personas_completeness():
    """Verify all 12 personas are defined in holo-app app.js."""
    app_js_path = os.path.join(HOLO_DIR, "assets/www/app.js")
    assert os.path.isfile(app_js_path)
    with open(app_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    for p in EXPECTED_PERSONAS:
        assert f"{p}: {{" in content or f'"{p}": {{' in content, f"Missing persona {p} in holo-app app.js"


def test_voice_engine_acoustic_profiles_and_triggers():
    """Verify acoustic profiles and spoken triggers exist in voice-engine.js."""
    voice_js_path = os.path.join(HOLO_DIR, "assets/www/voice-engine.js")
    assert os.path.isfile(voice_js_path)
    with open(voice_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify all 12 personas have defined acoustic tuning in PERSONA_VOICES
    assert "PERSONA_VOICES" in content
    for p in EXPECTED_PERSONAS:
        assert p in content, f"Persona {p} missing in voice-engine.js"

    # Verify voice triggers
    assert "switch to shadow" in content
    assert "switch to sentry" in content
    assert "switch to cipher" in content
    assert "switch to valkyrie" in content
    assert "switch to matrix" in content
    assert "switch to ghost" in content
    assert "switch to glitch" in content
    assert "switch to archon" in content

    # Verify cyber operation triggers
    assert "scan port" in content
    assert "reverse shell" in content
    assert "hash analyzer" in content
    assert "mitre attack" in content
    assert "security audit" in content

    # Verify voice selection APIs
    assert "getAvailableVoices" in content
    assert "setSelectedVoice" in content
    assert "setVoicePitch" in content
    assert "setVoiceRate" in content
    assert "auditionVoice" in content


def test_spatial_tasks_cyber_cards():
    """Verify cybersecurity floating cards are implemented in spatial-tasks.js."""
    spatial_js_path = os.path.join(HOLO_DIR, "assets/www/spatial-tasks.js")
    assert os.path.isfile(spatial_js_path)
    with open(spatial_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    assert "spawnPortScannerCard" in content
    assert "spawnPayloadGeneratorCard" in content
    assert "spawnHashAnalyzerCard" in content
    assert "spawnWifiReconCard" in content
    assert "spawnMitreAttackCard" in content
    assert "spawnSecurityPostureCard" in content
    assert "executePortScan" in content


def test_holo_renderer_all_persona_drawers():
    """Verify 3D avatars exist for all personas in holo-renderer.js."""
    renderer_js_path = os.path.join(HOLO_DIR, "assets/www/holo-renderer.js")
    assert os.path.isfile(renderer_js_path)
    with open(renderer_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Original required personas
    assert "drawSwarm" in content
    assert "drawTuring" in content
    assert "drawKnuth" in content
    assert "drawLovelace" in content

    # Cyber professional personas
    assert "drawShadow" in content
    assert "drawSentry" in content
    assert "drawCipher" in content
    assert "drawValkyrie" in content
    assert "drawMatrix" in content
    assert "drawGhost" in content
    assert "drawGlitch" in content
    assert "drawArchon" in content


def test_native_bridge_cyber_and_voice_methods():
    """Verify native Java bridge has voice and security posture methods."""
    holo_java = os.path.join(HOLO_DIR, "src/org/antigravity/agenticholo/HoloBridgeInterface.java")
    app_java = os.path.join(APP_DIR, "src/org/antigravity/agenticessence/WebAppInterface.java")

    for path in [holo_java, app_java]:
        assert os.path.isfile(path)
        with open(path, "r", encoding="utf-8") as f:
            code = f.read()
        assert "getAvailableVoices" in code
        assert "setVoice" in code
        assert "setVoicePitch" in code
        assert "setVoiceSpeechRate" in code
        assert "getDeviceSecurityPosture" in code
        assert "runPortScan" in code


def test_cyberdeck_personas_and_cyber_tools():
    """Verify android-app cyberdeck includes personas and cyber tools."""
    app_js_path = os.path.join(APP_DIR, "assets/www/app.js")
    assert os.path.isfile(app_js_path)
    with open(app_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    for p in EXPECTED_PERSONAS:
        assert p in content, f"Persona {p} missing in android-app app.js"

    assert "openCyberTool" in content
    assert "runDeckPortScan" in content
    assert "updateDeckPayload" in content
    assert "analyzeDeckHash" in content
