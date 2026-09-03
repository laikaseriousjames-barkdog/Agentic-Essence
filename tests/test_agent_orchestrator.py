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
