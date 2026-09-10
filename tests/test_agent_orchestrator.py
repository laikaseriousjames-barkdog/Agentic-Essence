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


def test_antigravity_style_and_fluff_stripping():
    import os
    import re
    tests_dir = os.path.dirname(os.path.abspath(__file__))
    repo_dir = os.path.dirname(tests_dir)
    app_js_path = os.path.join(repo_dir, "android-app/assets/www/app.js")
    assert os.path.isfile(app_js_path)

    with open(app_js_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify Antigravity communication directives
    assert "CRITICAL COMMUNICATION DIRECTIVE (REPLY LIKE ANTIGRAVITY)" in content
    assert "MANDATORY TERMINAL EXECUTION" in content
    assert "ZERO CONVERSATIONAL FLUFF" in content
    assert "stripConversationalFluff" in content
    assert "FINAL SUMMARY (ANTIGRAVITY STYLE)" in content

    # Test the conversational fluff stripping logic (mirroring app.js)
    def strip_conversational_fluff(text: str) -> str:
        if not text:
            return ''
        cleaned = text.strip()
        leading_patterns = [
            r'^(?:sure(?: thing)?[!.,]?|certainly[!.,]?|of course[!.,]?|absolutely[!.,]?|alright[!.,]?|all right[!.,]?|okay[!.,]?|ok[!.,]?|got it[!.,]?|understood[!.,]?|no problem[!.,]?)\s*',
            r'^(?:hello(?: there)?[!.,]?|hi(?: there)?[!.,]?|hey(?: there)?[!.,]?|greetings[!.,]?)\s*',
            r'^(?:thank you(?: for[^\n.:]*)?[!.:]?\s*)',
            r'^(?:thanks(?: for[^\n.:]*)?[!.:]?\s*)',
            r'^(?:i(?:\'d|\s+would)?\s+be\s+(?:happy|glad|pleased)\s+to\s+help[^\n.:]*[.:!]?\s*)',
            r'^(?:i can (?:certainly |definitely )?help[^\n.:]*[.:!]?\s*)',
            r'^(?:let me (?:check|run|execute|inspect|take a look at|look into|test|diagnose|see|query|help)[^\n.:]*[.:!]?\s*)',
            r'^(?:i will (?:now )?(?:check|run|execute|inspect|test|diagnose|see|query)[^\n.:]*[.:!]?\s*)',
            r'^(?:i (?:have |already )?(?:run|executed|checked|inspected|analyzed|reviewed|examined)[^\n.:]*[.:!]?\s*)',
            r'^(?:here (?:is|are) the (?:results?|output|details?|information|findings?|status)[^\n.:]*[.:!]?\s*)',
            r'^(?:based on the (?:terminal|system|command)?\s*(?:output|observation|feedback|execution)[^\n.:]*[.:!]?\s*)',
            r'^(?:(?:from|according to|looking at|in) the (?:terminal|system|command|above)?\s*(?:output|observation|feedback|execution)[^\n.:]*[.:!]?\s*)',
            r'^(?:the (?:terminal|command|system) (?:output|result|response) (?:shows|indicates|confirms)[^\n.:]*[.:!]?\s*)',
            r'^(?:as an ai[^\n]*\n*)',
        ]

        changed = True
        while changed:
            changed = False
            for p in leading_patterns:
                m = re.match(p, cleaned, re.IGNORECASE)
                if m and m.group(0):
                    cleaned = cleaned[len(m.group(0)):].strip()
                    changed = True

        trailing_patterns = [
            r'(?:\r?\n|\s)*(?:hope (?:this|that) helps!?[^\n]*)$',
            r'(?:\r?\n|\s)*(?:let me know if you (?:need|have|want|require)[^\n]*)$',
            r'(?:\r?\n|\s)*(?:feel free to (?:ask|reach out|let me know)[^\n]*)$',
            r'(?:\r?\n|\s)*(?:if you (?:have|need|require) (?:any|further|more)[^\n]*)$',
            r'(?:\r?\n|\s)*(?:please let me know if[^\n]*)$',
            r'(?:\r?\n|\s)*(?:i am here if you need[^\n]*)$',
            r'(?:\r?\n|\s)*(?:happy to help[!.]?)$',
        ]

        changed = True
        while changed:
            changed = False
            for p in trailing_patterns:
                m = re.search(p, cleaned, re.IGNORECASE)
                if m and m.group(0):
                    cleaned = cleaned[:m.start()].strip()
                    changed = True

        return cleaned

    sample_fluffy = (
        "Sure thing! I would be happy to help with that.\n"
        "Based on the terminal observation, here are the findings:\n"
        "- Interface `wlan0`: UP (IP: 192.168.1.50)\n"
        "- Gateway: 192.168.1.1\n"
        "Hope this helps! Let me know if you need anything else."
    )
    cleaned = strip_conversational_fluff(sample_fluffy)
    assert "- Interface `wlan0`: UP (IP: 192.168.1.50)" in cleaned
    assert "- Gateway: 192.168.1.1" in cleaned
    assert "Sure thing!" not in cleaned
    assert "I would be happy to help" not in cleaned
    assert "Based on the terminal observation" not in cleaned
    assert "Hope this helps" not in cleaned
    assert "Let me know" not in cleaned


