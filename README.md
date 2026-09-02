<div align="center">

<img src="https://raw.githubusercontent.com/laikaseriousjames-barkdog/Agentic-Essence/main/agentic-logo.svg" alt="Agentic Essence" width="80" />

# Agentic Essence

**Autonomous AI, Untethered.**

A local-first Tri-Agent AI orchestration console. Hybrid cloud/local LLM routing, an on-device model manager, and an embedded Kali Linux VM pane — all in one command center.

[![Version](https://img.shields.io/badge/release-beta-06b6d4?style=for-the-badge&logo=github)](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/)
[![License](https://img.shields.io/badge/license-proprietary-8b5cf6?style=for-the-badge)](#license)
[![Platform](https://img.shields.io/badge/platform-Windows_%2B_Android-0078D6?style=for-the-badge)](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/)
[![Live Site](https://img.shields.io/badge/live_site-visit-10b981?style=for-the-badge&logo=netlify)](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/)

</div>

> **All downloads are served from the official website:**  
> 👉 [https://laikaseriousjames-barkdog.github.io/Agentic-Essence/](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/)

---

## What is Agentic Essence?

Agentic Essence is a **local-first Tri-Agent AI orchestration console** that deploys three specialized agents working in concert — a **Planner**, **Builder**, and **Auditor** — to tackle complex, long-horizon tasks on your own hardware.

The desktop app for Windows and the Android app both bring this swarm to life, with no cloud lock-in. **Your hardware, your swarm.**

---

## Desktop App (Windows · v2.5.0 · Release Beta)

The Windows desktop app is a full orchestration console that includes:

- **Tri-Agent orchestration** — Planner, Builder, and Auditor each routed to their own model, coordinated toward your goal.
- **Hybrid cloud/local LLM routing** — Blend premium cloud models with fully on-device inference, switching seamlessly.
- **On-device model manager** — Download, verify (SHA-256), load, swap, and delete local GGUF models right from the UI. Run the entire swarm offline.
- **Embedded Kali Linux VM pane** — A built-in noVNC pane drops you straight into a Kali Linux VM for tool-building and testing, without leaving the console.
- **Self-evolving hot reload** — The engine restarts its own backend and reloads its UI on the fly, letting the swarm reshape and refine itself continuously.
- **Zero-trust license** — Optional offline HWID-locked activation via asymmetric key validation.

---

## Android App (Release Beta)

The Android app is a true on-device Tri-Agent orchestration UI:

- **Tri-Agent orchestration** — Planner, Builder, and Auditor on device.
- **Provider-agnostic AI routing** — Pollinations (keyless by default), OpenRouter, OpenAI, local Ollama, or offline simulation.
- **Shizuku / ADB automation** — Root-free on-device screen taps, swiping, typing, and app launching.
- **Deep hardware integration** — Haptics, camera flash, text-to-speech, alarms, battery & network discovery, wake-lock, and native clipboard/intent sharing.

---

## Getting Started

### 1. Download the app

Downloads are hosted on the official website only, so you always get the latest build:

[![Download on the website](https://img.shields.io/badge/Download_from_the_website-0d1222?style=for-the-badge&logo=windows&logoColor=06b6d4)](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/)

- **Windows desktop** — `Agentic-Essence-Setup-2.5.0.exe`
- **Android** — `AgenticEssence-Android.apk`

### 2. Optional: purchase a Pro license

[![Buy License](https://img.shields.io/badge/Buy_License_$29.99-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/bJe3cv6GCcll5O38qT6g800)

The license is HWID-locked to your machine and works fully offline after activation.

---

## System Requirements

| Requirement | Minimum |
|-------------|---------|
| OS (Desktop) | Windows 10/11 (64-bit) |
| OS (Android) | Android 8.0+ |
| RAM | 8 GB recommended |
| Storage | 2 GB free |
| Optional | Local GGUF models for offline inference |

---

## Security & Privacy

- **Local-first** — Prompts and data stay on your machine by default.
- **No telemetry** — No hidden outbound connections or data collection.
- **Zero-trust licensing** — Offline HWID-locked activation via asymmetric key validation; no license server handshake required after activation.

---

## Contact & Support

- 📧 Email: [laikaseriousjames@gmail.com](mailto:laikaseriousjames@gmail.com)
- 🌐 Website: [https://laikaseriousjames-barkdog.github.io/Agentic-Essence/](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/)

---

## Repository Structure

```
Agentic-Essence/
├── index.html          # Website landing page
├── styles.css          # Site styles
├── downloads/          # Release binaries (installer + APK)
└── docs/
    └── EULA.md         # End User License Agreement
```

---

## License

Agentic Essence is proprietary software. All rights reserved.  
See [EULA](docs/EULA.md) for terms of use.

© 2026 Agentic Essence.