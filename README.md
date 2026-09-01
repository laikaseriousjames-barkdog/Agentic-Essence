# Agentic Essence — Mobile Cyberdeck (Android)

> **Autonomous AI, Untethered.**  
> Fully standalone, on-device Tri-Agent orchestration console for Android. Zero cloud lock-in.

---

## ⚡ Overview

Agentic Essence Mobile is a high-performance Android cyberdeck application bringing the full Tri-Agent autonomous orchestration swarm to your mobile device:

- 🧠 **Alan Turing (The Commander)**: High-level reasoning, strategy formulation, recursive task queue management.
- ⚙️ **Donald Knuth (The Builder)**: Concrete execution payload synthesis, AST codebase transformation, script and tool actions.
- 🔬 **Ada Lovelace (The Tester)**: QA validation, PyTest suites, vulnerability checks, Shizuku/ADB automation verification.

---

## 🚀 Key Features

- **Keyless Out-of-the-Box AI**: Uses built-in Pollinations AI by default — works instantly with zero API keys or configuration needed.
- **Provider Agnostic**: Easily switch to OpenRouter, OpenAI, Local Ollama (`http://localhost:11434`), custom endpoints, or offline deterministic simulation.
- **Hardware Integration (`AndroidBridge`)**:
  - Haptic feedback on agent state transitions
  - Camera flashlight / torch signaling
  - Text-To-Speech (TTS) voice announcements
  - Audio alarm & tone generator
  - Battery & network interface discovery
  - Screen wake-lock for long-horizon autonomous tasks
  - Native system clipboard & intent sharing
- **Shizuku / ADB Bridge Support**: Elevate automation for root-free on-device screen taps, swiping, typing, and app launching.

---

## 🧪 Testing & Building

### Run Tests:
```bash
pytest tests/
```

### Build Signed APK:
```bash
./build_apk.sh
```

Output APK will be generated at `android-app/bin/AgenticEssence-Android.apk`.

---

## 🌐 Website & Releases

- **Website**: [https://agentic-essence.com/](https://agentic-essence.com/)
- **Repository**: [https://github.com/laikaseriousjames-barkdog/Agentic-Essence](https://github.com/laikaseriousjames-barkdog/Agentic-Essence)
