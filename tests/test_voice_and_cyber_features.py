import os
import re
import json
import pytest

TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_DIR = os.path.dirname(TESTS_DIR)
HOLO_DIR = os.path.join(REPO_DIR, "holo-app")
APP_DIR = os.path.join(REPO_DIR, "android-app")

EXPECTED_PERSONAS = [
    "swarm", "turing", "knuth", "lovelace"
]

PRUNED_LEGACY_PERSONAS = [
    "shadow", "sentry", "cipher", "valkyrie",
    "matrix", "ghost", "glitch", "archon"
]

def test_holo_personas_completeness():
    """Verify only the 4 core personas are defined in holo-app app.js."""
    app_js_path = os.path.join(HOLO_DIR, "assets/www/app.js")
    assert os.path.isfile(app_js_path)
    with open(app_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    for p in EXPECTED_PERSONAS:
        assert f"{p}: {{" in content or f'"{p}": {{' in content, f"Missing persona {p} in holo-app app.js"
    for p in PRUNED_LEGACY_PERSONAS:
        assert f"{p}: {{" not in content and f'"{p}": {{' not in content, f"Pruned persona {p} should not be in holo-app app.js"


def test_voice_engine_acoustic_profiles_and_triggers():
    """Verify acoustic profiles exist in voice-engine.js for core personas."""
    voice_js_path = os.path.join(HOLO_DIR, "assets/www/voice-engine.js")
    assert os.path.isfile(voice_js_path)
    with open(voice_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify core personas have defined acoustic tuning in PERSONA_VOICES
    assert "PERSONA_VOICES" in content
    for p in EXPECTED_PERSONAS:
        assert p in content, f"Persona {p} missing in voice-engine.js"
    for p in PRUNED_LEGACY_PERSONAS:
        assert f"switch to {p}" not in content, f"Pruned voice trigger for {p} found"

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
    holo_java = os.path.join(HOLO_DIR, "src/org/antigravity/agenticvox/HoloBridgeInterface.java")
    app_java = os.path.join(APP_DIR, "src/org/antigravity/agenticdeck/WebAppInterface.java")

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


def test_tri_agent_dock_and_voice_studio_ui():
    """Verify Tri-Agent floating dock and Voice Studio modal in index.html."""
    html_path = os.path.join(HOLO_DIR, "assets/www/index.html")
    assert os.path.isfile(html_path)
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    # Verify Tri-Agent dock
    assert "holo-agent-dock" in html
    assert 'data-persona="swarm"' in html
    assert 'data-persona="turing"' in html
    assert 'data-persona="knuth"' in html
    assert "PLANNER" in html
    assert "BUILDER" in html
    assert "AUDITOR" in html

    # Verify Voice Studio modal and controls
    assert 'id="voiceModal"' in html
    assert "VOICE STUDIO" in html
    assert "voice-studio-agent-tabs" in html
    assert 'id="vsTab-swarm"' in html
    assert 'id="vsTab-turing"' in html
    assert 'id="vsTab-knuth"' in html
    assert "voice-presets-grid" in html
    assert 'id="studioVoiceSelect"' in html
    assert 'id="studioPitchSlider"' in html
    assert 'id="studioRateSlider"' in html
    assert "auditionStudioVoice" in html
    assert "saveStudioVoice" in html


def test_voice_engine_presets_and_agent_tuning():
    """Verify acoustic presets and per-agent configuration in voice-engine.js."""
    voice_js_path = os.path.join(HOLO_DIR, "assets/www/voice-engine.js")
    with open(voice_js_path, "r", encoding="utf-8") as f:
        code = f.read()

    assert "VOICE_PRESETS" in code
    assert "getVoicePresets" in code
    assert "getAgentVoiceConfig" in code
    assert "setAgentVoiceConfig" in code
    assert "auditionAgentVoice" in code

    # Spoken triggers for Tri-Agent and Voice Studio
    assert "switch to planner" in code
    assert "switch to builder" in code
    assert "switch to auditor" in code
    assert "voice studio" in code


def test_translucent_glass_hud_styles():
    """Verify translucent frosted glass HUD styles in styles.css."""
    css_path = os.path.join(HOLO_DIR, "assets/www/styles.css")
    with open(css_path, "r", encoding="utf-8") as f:
        css = f.read()

    assert ".holo-agent-dock" in css
    assert ".agent-dock-tab" in css
    assert ".holo-modal-glass" in css
    assert "backdrop-filter: blur" in css
    assert ".voice-studio-agent-tabs" in css
    assert ".voice-preset-card" in css


def test_tri_agent_profiles_and_personalities():
    """Verify Tri-Agent profiles metadata, bios, and personalities in app.js and index.html."""
    app_js_path = os.path.join(HOLO_DIR, "assets/www/app.js")
    with open(app_js_path, "r", encoding="utf-8") as f:
        app_js = f.read()

    assert "AGENT_PROFILES" in app_js
    assert "Alan Turing" in app_js
    assert "Donald Knuth" in app_js
    assert "Ada Lovelace" in app_js
    assert "openProfilesModal" in app_js
    assert "closeProfilesModal" in app_js
    assert "renderAgentProfiles" in app_js
    assert "personality" in app_js

    html_path = os.path.join(HOLO_DIR, "assets/www/index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    assert 'id="profilesModal"' in html
    assert 'id="agentProfilesList"' in html
    assert "openProfilesModal" in html


def test_dynamic_gemini_models_and_google_api_sync():
    """Verify Gemini dynamic model registry and live Google AI Studio API sync."""
    app_js_path = os.path.join(HOLO_DIR, "assets/www/app.js")
    with open(app_js_path, "r", encoding="utf-8") as f:
        app_js = f.read()

    assert "DEFAULT_GEMINI_MODELS" in app_js
    assert "gemini-2.5-flash" in app_js
    assert "gemini-2.5-pro" in app_js
    assert "gemini-2.0-flash" in app_js
    assert "refreshGeminiModelsFromGoogle" in app_js
    assert "populateGeminiModelOptions" in app_js
    assert "onModelSelectChange" in app_js
    assert "https://generativelanguage.googleapis.com/v1beta/models" in app_js

    html_path = os.path.join(HOLO_DIR, "assets/www/index.html")
    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    assert 'id="geminiModelGroup"' in html
    assert 'id="modelSelect"' in html
    assert "refreshGeminiModelsFromGoogle" in html
    assert "gemini-2.5-flash" in html


def test_speech_noise_filtering_and_tts_handshake():
    """Verify ambient noise filtering and native TTS completion handshake."""
    voice_js_path = os.path.join(HOLO_DIR, "assets/www/voice-engine.js")
    with open(voice_js_path, "r", encoding="utf-8") as f:
        voice_js = f.read()

    assert "isLikelyNoise" in voice_js
    assert "onNativeSpeechFinished" in voice_js

    holo_java = os.path.join(HOLO_DIR, "src/org/antigravity/agenticvox/HoloBridgeInterface.java")
    with open(holo_java, "r", encoding="utf-8") as f:
        java_code = f.read()

    assert "onNativeSpeechFinished" in java_code
    assert "onDone" in java_code

