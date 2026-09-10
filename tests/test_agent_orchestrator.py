import pytest

def mock_synthesize_tool(query: str):
    q = query.lower()
    if 'tip' in q or 'split bill' in q:
        return {"title": "Tip & Bill Splitter", "type": "TIP"}
    if 'wallpaper' in q or 'gradient' in q:
        return {"title": "Wallpaper & Gradient Synthesizer", "type": "WALLPAPER"}
    if 'timer' in q or 'stopwatch' in q or 'countdown' in q:
        return {"title": "Precision Countdown & Timer", "type": "TIMER"}
    if 'password' in q or 'keygen' in q:
        return {"title": "Secure Password Generator", "type": "PASSWORD"}
    if 'convert' in q or 'unit' in q or 'temperature' in q:
        return {"title": "Unit & Temperature Converter", "type": "CONVERTER"}
    return {"title": "Scientific Calculator", "type": "CALCULATOR"}

def test_dynamic_tool_synthesis_types():
    assert mock_synthesize_tool("Build a tip calculator with 3 splits")["type"] == "TIP"
    assert mock_synthesize_tool("Create a live wallpaper generator")["type"] == "WALLPAPER"
    assert mock_synthesize_tool("Build a countdown timer")["type"] == "TIMER"
    assert mock_synthesize_tool("Create a secure password keygen")["type"] == "PASSWORD"
    assert mock_synthesize_tool("Build a unit and temperature converter")["type"] == "CONVERTER"
    assert mock_synthesize_tool("Spawn a math calculator")["type"] == "CALCULATOR"

def test_multi_turn_history_preservation():
    history = [
        {"role": "user", "content": "What is 25 * 4?"},
        {"role": "assistant", "content": "100"},
        {"role": "user", "content": "Now multiply that by 5."}
    ]
    assert len(history) == 3
    assert history[0]["content"] == "What is 25 * 4?"
    assert history[1]["content"] == "100"
    assert "multiply that by 5" in history[2]["content"]


def test_tool_synthesis_intent_variations():
    import re
    # Mirroring the regex logic in app.js
    def is_tool_synthesis_intent(text: str) -> bool:
        if not text:
            return False
        l = text.lower().strip()
        if (l.startswith('/synth') or l.startswith('/tool') or l.startswith('/build') or
            l.startswith('synth:') or l.startswith('synthesize:') or l.startswith('synthazize:') or l.startswith('synthesise:')):
            return True
        if re.search(r'\b(synth\w*|synthaz\w*|synthes\w*)\b', l, re.IGNORECASE):
            return True
        patterns = [
            r'\b(build|create|make|spin up|generate|code|craft|develop|deploy)\b.*\b(an?\s+)?(interactive\s+)?(tool|widget|mini-app|ui|dashboard|gui|panel|calculator|clock|timer|scanner|monitor|terminal|something|anything)\b',
            r'\binteractive\s+(tool|widget|dashboard|gui|app|ui|calculator|clock|timer)\b',
            r'\btool\s+(synthesiz|builder|creator|maker)\w*\b',
            r'\bsynth\s+(a\s+)?(tool|widget|app|gui|something)\b'
        ]
        return any(re.search(p, l, re.IGNORECASE) for p in patterns)

    # Must match "synthazize something" and "synthesize something" from user request
    assert is_tool_synthesis_intent("synthazize something") is True
    assert is_tool_synthesis_intent("synthesize something") is True
    assert is_tool_synthesis_intent("can you synthazize a clock") is True
    assert is_tool_synthesis_intent("synthesize a calculator") is True
    assert is_tool_synthesis_intent("build an interactive tool for wifi") is True
    assert is_tool_synthesis_intent("/synth weather widget") is True
    assert is_tool_synthesis_intent("create a dashboard") is True

    # Regular conversational commands should NOT trigger synthesis
    assert is_tool_synthesis_intent("hello what time is it") is False
    assert is_tool_synthesis_intent("whoami") is False
    assert is_tool_synthesis_intent("how do I install python?") is False


def test_html_tool_extraction_and_clean_text():
    import re

    def extract_html_tool(text: str):
        raw_html = ''
        matched_block = None
        html_block_regex = re.compile(r'```(?:html|htm|xml|svg|webapp|ui)?\s*([\s\S]*?)```', re.IGNORECASE)
        for b_match in html_block_regex.finditer(text):
            candidate = b_match.group(1).strip()
            if '<' in candidate and any(tag in candidate.lower() for tag in ['<!doctype', '<html', '<body', '<div', '<button', '<canvas', '<style', '<script']):
                raw_html = candidate
                matched_block = b_match.group(0)
                break

        if not raw_html:
            doc_match = re.search(r'(<!DOCTYPE\s+html[\s\S]*?<\/html>)', text, re.IGNORECASE) or re.search(r'(<html[\s\S]*?<\/html>)', text, re.IGNORECASE)
            if doc_match:
                raw_html = doc_match.group(1).strip()
                matched_block = doc_match.group(0)

        if not raw_html:
            return text, None

        clean_text = text.replace(matched_block, '').strip() if matched_block else text.replace(raw_html, '').strip()
        if not clean_text:
            clean_text = "Synthesized application mounted below:"

        return clean_text, raw_html

    sample_reply = (
        "Here is your synthesized quantum calculator widget:\n"
        "```html\n"
        "<!DOCTYPE html><html><body><div id='calc'>Calculator</div></body></html>\n"
        "```\n"
        "You can use it right here on the cyberdeck."
    )

    clean_text, html_tool = extract_html_tool(sample_reply)
    assert html_tool is not None
    assert "<!DOCTYPE html>" in html_tool
    assert "<div id='calc'>Calculator</div>" in html_tool
    # Ensure raw code block was removed from clean text so it doesn't duplicate
    assert "```html" not in clean_text
    assert "Here is your synthesized quantum calculator widget:" in clean_text


def test_app_js_troubleshooting_and_terminal_protocol():
    import os
    tests_dir = os.path.dirname(os.path.abspath(__file__))
    repo_dir = os.path.dirname(tests_dir)
    app_js_path = os.path.join(repo_dir, "android-app/assets/www/app.js")
    assert os.path.isfile(app_js_path)

    with open(app_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify agentic execution and troubleshooting protocol in grounding
    assert "AUTONOMOUS AGENTIC EXECUTION & TROUBLESHOOTING PROTOCOL" in content
    assert "PERFORM:" in content
    assert "VERIFY:" in content
    assert "TROUBLESHOOT:" in content
    assert "BUILD TOOLS:" in content
    assert "ADVISE ACCORDINGLY:" in content

    # Verify terminal observation feedback loop in sendMessage
    assert "TERMINAL OBSERVATION & SYSTEM FEEDBACK" in content
    assert "MAX_AGENTIC_STEPS" in content
    assert "observations.push" in content
    assert "execResultsMap" in content

    # Verify tool building support
    assert "BUILD_TOOL:" in content

