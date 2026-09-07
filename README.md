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
- **Direct Android APK Download**: [AgenticEssence-Android.apk](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/downloads/AgenticEssence-Android.apk)

---

## 📱 Android Cyberdeck Source Code & Architecture

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

### Local One-Command Build
To build the APK locally:
```bash
./build_apk.sh
```
The output APK is generated at `android-app/bin/AgenticEssence-Android.apk`.

### Run Test Suite:
```bash
pytest tests/
```

---

## 📧 Contact & Support

- **Email**: [laikaseriousjames@gmail.com](mailto:laikaseriousjames@gmail.com)
- **Website**: [https://agentic-essence.com/](https://agentic-essence.com/)

