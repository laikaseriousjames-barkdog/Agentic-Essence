# Agentic Essence — Mobile Cyberdeck (Android)

> **Autonomous AI, Untethered.**  
> Fully standalone, on-device Tri-Agent orchestration console for Android. Zero cloud lock-in.

---

## ⚡ Overview

Agentic Essence Mobile is a high-performance Android cyberdeck application bringing the full Tri-Agent autonomous orchestration swarm to your mobile device:

- 🧠 **Planner (The Commander)**: High-level reasoning, strategy formulation, recursive task queue management.
- ⚙️ **Builder (The Developer)**: Concrete execution payload synthesis, script and tool actions.
- 🔬 **Auditor (The Tester)**: Validation, QA checks, and Shizuku/ADB automation verification.

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

## 📁 Source Code Structure & How to Edit the APK

The Android app source code is organized into two interoperable layers:

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
```

### ✏️ How to Edit the App:
1. **To modify the Cyberdeck interface or agent behavior**:
   - Edit [index.html](file:///root/repos/Angetic-Essence/android-app/assets/www/index.html), [styles.css](file:///root/repos/Angetic-Essence/android-app/assets/www/styles.css), or [app.js](file:///root/repos/Angetic-Essence/android-app/assets/www/app.js).
2. **To add or customize native Android capabilities (Termux, Kali NetHunter, Shell, TTS, Shizuku)**:
   - Edit [WebAppInterface.java](file:///root/repos/Angetic-Essence/android-app/src/org/antigravity/agenticessence/WebAppInterface.java) or [MainActivity.java](file:///root/repos/Angetic-Essence/android-app/src/org/antigravity/agenticessence/MainActivity.java).
3. **To add permissions or app metadata**:
   - Edit [AndroidManifest.xml](file:///root/repos/Angetic-Essence/android-app/AndroidManifest.xml).
4. **To work with the modern Jetpack Compose Kotlin architecture**:
   - Open the project in Android Studio and edit files in `android-app/app/`.

---

## 🛠️ How to Build and Deploy the APK

### Method 1: Cloud Build (Zero Setup — Automatic via GitHub Actions)
Whenever you push changes to `android-app` or `master`:
1. GitHub Actions automatically checks out your code.
2. Runs the full test suite (`pytest tests/`).
3. Compiles Java/Kotlin, packages assets, generates DEX, zipaligns, and cryptographically signs the APK.
4. Generates an artifact and publishes the updated APK directly to the website download path on `gh-pages`!

### Method 2: Local One-Command Build
In the repository root, run:
```bash
./build_apk.sh
```
The script will:
- Generate `R.java` from resources
- Compile Java sources with `javac`
- Compile bytecode to `classes.dex` using Android D8
- Package assets, resources, and DEX into APK with `aapt`
- 4-byte zipalign the package
- Sign with `apksigner` using RSA-2048 key
- Verify signature integrity

The fresh, signed APK is saved at:
`android-app/bin/AgenticEssence-Android.apk`

---

## 🌐 Website & Downloads

All downloads are served from the official website so you always get the latest build:

- **Website**: [https://laikaseriousjames-barkdog.github.io/Agentic-Essence/](https://laikaseriousjames-barkdog.github.io/Agentic-Essence/)
- **Repository**: [https://github.com/laikaseriousjames-barkdog/Agentic-Essence](https://github.com/laikaseriousjames-barkdog/Agentic-Essence)

---

## 📧 Contact & Support

- **Email**: [laikaseriousjames@gmail.com](mailto:laikaseriousjames@gmail.com)
- **Website**: [https://agentic-essence.com/](https://agentic-essence.com/)

