import re
import pytest

def parse_intent(text: str):
    """Mirror of the client-side intent parsing engine."""
    clean = text.strip()
    lower = clean.lower()

    # 1. Call Intent
    call_match = re.search(r"(?:call|phone|ring|dial)\s+([a-zA-Z0-9\s\+\-\(\)]+)", clean, re.IGNORECASE)
    if call_match and "what can" not in lower and "how to" not in lower:
        return {"intent": "CALL", "target": call_match.group(1).strip()}

    # 2. SMS Intent
    sms_match = re.search(r"(?:text|sms|message|msg)\s+([a-zA-Z0-9\s\+\-]+?)\s+(?:that|saying|to\s+say|:)\s+(.+)", clean, re.IGNORECASE)
    if not sms_match:
        sms_match = re.search(r"(?:text|sms|message|msg)\s+([a-zA-Z0-9\s\+\-]+?)\s+(.+)", clean, re.IGNORECASE)
    if sms_match and "what" not in lower and "how" not in lower:
        return {"intent": "SMS", "recipient": sms_match.group(1).strip(), "body": sms_match.group(2).strip()}

    # 3. Alarm Intent
    alarm_match = re.search(r"(?:set\s+)?alarm\s+(?:for\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", clean, re.IGNORECASE)
    if not alarm_match:
        alarm_match = re.search(r"wake\s+me\s+up\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", clean, re.IGNORECASE)
    if alarm_match:
        hour = int(alarm_match.group(1))
        minute = int(alarm_match.group(2)) if alarm_match.group(2) else 0
        ampm = alarm_match.group(3).lower() if alarm_match.group(3) else ""
        if ampm == "pm" and hour < 12:
            hour += 12
        if ampm == "am" and hour == 12:
            hour = 0
        return {"intent": "ALARM", "hour": hour, "minute": minute}

    # 4. App Launch Intent
    app_match = re.search(r"(?:open|launch|start|run)\s+([a-zA-Z0-9\s]+)", clean, re.IGNORECASE)
    if app_match and "door" not in lower and "setting" not in lower:
        return {"intent": "OPEN_APP", "app": app_match.group(1).strip()}

    # 5. Navigation Intent
    nav_match = re.search(r"(?:navigate|directions|take\s+me|drive|route)\s+(?:to\s+)?(.+)", clean, re.IGNORECASE)
    if nav_match:
        return {"intent": "NAVIGATE", "destination": nav_match.group(1).strip()}

    # 6. Hardware Controls
    if "flashlight on" in lower or "torch on" in lower:
        return {"intent": "TORCH", "state": True}
    if "flashlight off" in lower or "torch off" in lower:
        return {"intent": "TORCH", "state": False}
    if "battery" in lower:
        return {"intent": "BATTERY"}

    return {"intent": "GENERAL_AI", "query": clean}


def test_phone_call_intent():
    res1 = parse_intent("Call Mom")
    assert res1["intent"] == "CALL"
    assert res1["target"] == "Mom"

    res2 = parse_intent("Dial +1-555-0199 right now")
    assert res2["intent"] == "CALL"
    assert "+1-555-0199" in res2["target"]


def test_sms_intent():
    res1 = parse_intent("Text Sarah that I'm on my way")
    assert res1["intent"] == "SMS"
    assert res1["recipient"] == "Sarah"
    assert "on my way" in res1["body"]

    res2 = parse_intent("Send SMS to 555-9876 saying Hello there")
    assert res2["intent"] == "SMS"
    assert "555-9876" in res2["recipient"]
    assert "Hello there" in res2["body"]


def test_alarm_intent():
    res1 = parse_intent("Set alarm for 7:30 AM")
    assert res1["intent"] == "ALARM"
    assert res1["hour"] == 7
    assert res1["minute"] == 30

    res2 = parse_intent("Wake me up at 6:00 PM")
    assert res2["intent"] == "ALARM"
    assert res2["hour"] == 18
    assert res2["minute"] == 0


def test_app_and_navigation_intent():
    res_app = parse_intent("Open YouTube")
    assert res_app["intent"] == "OPEN_APP"
    assert res_app["app"] == "YouTube"

    res_nav = parse_intent("Navigate to Central Park")
    assert res_nav["intent"] == "NAVIGATE"
    assert "Central Park" in res_nav["destination"]


def test_hardware_intent():
    res_torch = parse_intent("Turn flashlight on")
    assert res_torch["intent"] == "TORCH"
    assert res_torch["state"] is True

    res_bat = parse_intent("What is my current battery level?")
    assert res_bat["intent"] == "BATTERY"


def test_general_ai_intent():
    res = parse_intent("Explain quantum computing in simple terms")
    assert res["intent"] == "GENERAL_AI"
