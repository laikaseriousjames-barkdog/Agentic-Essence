# Agentic Essence

> **Autonomous AI, Untethered.**  
> A local-first Tri-Agent AI orchestration console and mobile cyberdeck. Zero cloud lock-in.

[![Version](https://img.shields.io/badge/release-beta-06b6d4?style=for-the-badge&logo=github)](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/)
[![Platform](https://img.shields.io/badge/platform-Windows_%2B_Android-0078D6?style=for-the-badge)](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/)
[![Live Site](https://img.shields.io/badge/live_site-visit-10b981?style=for-the-badge&logo=netlify)](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/)
[![Build Status](https://github.com/laikaseriousjames-barkdog/Agentic-Essence/actions/workflows/build-apk.yml/badge.svg)](https://github.com/laikaseriousjames-barkdog/Agentic-Essence/actions/workflows/build-apk.yml)

---

## 🌐 Official Downloads & Website

- **Official Website & Downloads**: [https://laikaseriousjames-barkdog.github.io/Agentic-Essence/](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/)
- **Direct Cyberdeck APK Download**: [AgenticEssence-Android.apk](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/downloads/AgenticEssence-Android.apk)
- **Direct Agentic Vox APK Download (Voice Edition)**: [AgenticVox-Android.apk](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/downloads/AgenticVox-Android.apk)

---

## 🔑 Free Google Gemini API Key Guide

Both Agentic Essence and Agentic Vox operate local-first with zero telemetry or middleman servers. By connecting your own free Google Gemini API key:
1. Go to **Google AI Studio**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. Sign in with any standard Google account.
3. Click **"+ Create API key"** (free tier gives 15 RPM with zero billing or credit card required).
4. Copy the key and launch the app:
   - In **Agentic Vox**: Tap the **⚙ Settings** icon, paste your key into the **Google Gemini API Key** field, and tap **SAVE**.
   - In **Agentic Essence**: Open the settings drawer, paste into the API key field, and tap save.
5. All 12 personas and real-time voice orchestration are immediately active!

---

## 🎙️ Agentic Vox — Holographic Voice Cyberdeck

Agentic Vox is a pure voice-first spatial holodeck with 3D animated physical avatar holograms, audio lip-sync, and zero chat boxes:
- **100% Voice-First Turn-Taking**: Continuous listening and turn-taking with audio equalizer visualization.
- **12 Specialized Personas**: 3D geometric avatars for Swarm, Turing, Knuth, Lovelace, Shadow, Sentry, Cipher, Valkyrie, Matrix, Ghost, Glitch, and Archon.
- **Spatial Tool Materialization**: Spawns floating interactive tools (port scanners, payload generators, hash decoders, MITRE ATT&CK matrix, Wi-Fi analyzers) out of thin air.
- **Hardware Integration**: Full Kali NetHunter root bridge and Android hardware control (Wi-Fi, torch, battery, vibration).

```
holo-app/
├── AndroidManifest.xml       # Audio recording, camera, location, network permissions
├── assets/www/               # 🌌 SPATIAL HOLODECK COCKPIT
│   ├── index.html            # Holographic chamber, voice core, HUD, settings modal
│   ├── styles.css            # 3D spatial styles, glowing emitter floor, animated orb
│   ├── holo-renderer.js      # 3D real-time canvas renderer for 12 physical avatars
│   ├── voice-engine.js       # Voice turn-taking, speech synthesis, persona voice profiles
│   ├── spatial-tasks.js      # Spawns 3D floating task & security tool cards
│   └── app.js                # Cognitive swarm router, Gemini 2.0 Flash engine
├── src/org/antigravity/agenticholo/
│   ├── MainActivity.java     # WebView hardware acceleration, audio permissions
│   └── HoloBridgeInterface.java # Android bridge for TTS, SpeechRecognizer, shell, hardware
└── bin/
    └── AgenticVox-Android.apk # Signed, verified ready-to-install Android APK
```

This repository contains the complete, editable source code for the Agentic Essence Android Cyberdeck app.

```
android-app/
├── AndroidManifest.xml       # App permissions (Termux, Shizuku, Internet, Telephony), SDK target 34, screen config
├── assets/www/               # 🖥️ CYBERDECK UI (HTML, CSS, JavaScript)
│   ├── index.html            # Main Cyberdeck UI layout, terminal screens, agent cards
│   ├── styles.css            # Holographic neon cyberdeck styling, responsive layouts
│   └── app.js                # Agent swarm loop, tool synthesis, WebAppInterface bridge calls
├── src/                      # ☕ NATIVE JAVA ENGINE & BRIDGES
│   └── org/antigravity/agenticessence/
│       ├── MainActivity.java # WebView initialization, permissions requester, hardware settings
│       └── WebAppInterface.java # AndroidBridge: Termux/NetHunter bridge, Shizuku ADB, TTS, Haptics, Flashlight
├── res/                      # 🎨 ANDROID RESOURCES
│   ├── drawable/ic_launcher.png # Application icon
│   ├── layout/activity_main.xml # Activity view layout
│   └── values/               # Strings, colors, styles, themes
├── app/                      # 🚀 JETPACK COMPOSE KOTLIN ARCHITECTURE
│   ├── build.gradle.kts      # Gradle Kotlin DSL configuration
│   └── src/main/java/org/antigravity/agenticessence/
│       ├── MainActivity.kt   # Native Compose entrypoint
│       ├── core/automation/  # Accessibility & Shizuku automation
│       ├── core/provider/    # Universal LLM client (OpenRouter, Ollama, OpenAI, Pollinations)
│       ├── core/swarm/       # Tri-Agent definition & SwarmManager
│       ├── core/synthesis/   # Dynamic tool synthesis & registry
│       └── ui/               # ChatScreen, SettingsScreen, ToolRegistryScreen
├── build_apk.sh              # Local build script for android-app directory
└── bin/
    └── AgenticEssence-Android.apk # Signed, verified ready-to-install Android APK

build_apk.sh                  # Root standalone build script (builds, verifies, & distributes APK)
tests/                        # PyTest validation suite (tests build pipeline, assets, manifest, agent engine)
.github/workflows/build-apk.yml # Continuous Integration workflow (builds APK & publishes on every push)
website/                      # Landing page assets and docs
```

---

## ✏️ How to Edit the Android App

1. **To modify the Cyberdeck interface or agent behavior**:
   - Edit [index.html](file:///root/repos/Angetic-Essence/android-app/assets/www/index.html), [styles.css](file:///root/repos/Angetic-Essence/android-app/assets/www/styles.css), or [app.js](file:///root/repos/Angetic-Essence/android-app/assets/www/app.js).
2. **To add or customize native Android capabilities (Termux, Kali NetHunter, Shell, TTS, Shizuku)**:
   - Edit [WebAppInterface.java](file:///root/repos/Angetic-Essence/android-app/src/org/antigravity/agenticessence/WebAppInterface.java) or [MainActivity.java](file:///root/repos/Angetic-Essence/android-app/src/org/antigravity/agenticessence/MainActivity.java).
3. **To add permissions or app metadata**:
   - Edit [AndroidManifest.xml](file:///root/repos/Angetic-Essence/android-app/AndroidManifest.xml).
4. **To work with the modern Jetpack Compose Kotlin architecture**:
   - Open the project in Android Studio and edit files in `android-app/app/`.

---

## 🛠️ How to Build the APK

### Automated Cloud Builds (GitHub Actions)
Whenever you push code changes to either the `master` or `android-app` branch:
1. GitHub Actions automatically executes `.github/workflows/build-apk.yml`.
2. Runs the full test suite (`pytest tests/`).
3. Compiles the Java/Kotlin sources, packages assets, generates DEX, zipaligns, and cryptographically signs the APK.
4. Publishes the updated APK directly to the website download folder on `gh-pages` and provides downloadable artifacts.

### Local Builds
To build the Cyberdeck APK locally:
```bash
./build_apk.sh
```
The output APK is generated at `android-app/bin/AgenticEssence-Android.apk`.

To build the Agentic Vox Holographic APK locally:
```bash
./build_holo_apk.sh
```
The output APK is generated at `holo-app/bin/AgenticVox-Android.apk` (and `AgenticHolo-Android.apk`).

### Run Test Suite:
```bash
pytest tests/
```

---

## 📧 Contact & Support

- **Email**: [laikaseriousjames@gmail.com](mailto:laikaseriousjames@gmail.com)
- **Website**: [https://agentic-essence.com/](https://agentic-essence.com/)

