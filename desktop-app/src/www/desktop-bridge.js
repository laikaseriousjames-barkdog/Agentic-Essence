/**
 * Agentic Essence — Desktop Native Bridge
 * Bridges the Cyberdeck UI to local host APIs, Ollama, and Headless Kali Linux (WSL2).
 * Compatible with AndroidBridge interface so all Cyberdeck features work out of the box.
 */

(function () {
    const API_BASE = window.location.origin;

    const DesktopBridge = {
        _isDesktop: true,
        _voices: [],

        // 1. Toast notifications
        showToast(msg) {
            console.log("[DESKTOP-TOAST]", msg);
            let toastEl = document.getElementById("desktop-toast-banner");
            if (!toastEl) {
                toastEl = document.createElement("div");
                toastEl.id = "desktop-toast-banner";
                toastEl.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(11,12,16,0.95);border:1px solid #00f0ff;color:#00f0ff;padding:10px 20px;border-radius:8px;font-family:monospace;font-size:13px;z-index:99999;box-shadow:0 0 20px rgba(0,240,255,0.4);pointer-events:none;transition:opacity 0.3s ease;";
                document.body.appendChild(toastEl);
            }
            toastEl.textContent = "⚡ " + msg;
            toastEl.style.opacity = "1";
            clearTimeout(toastEl._timer);
            toastEl._timer = setTimeout(() => {
                toastEl.style.opacity = "0";
            }, 3000);
        },

        // 2. Haptics / Visual Chime
        vibrate(ms = 25) {
            if (navigator.vibrate) {
                try { navigator.vibrate(ms); } catch (e) {}
            }
        },

        // 3. Speech Synthesis
        speakText(text) {
            if (!text || !('speechSynthesis' in window)) return;
            try {
                window.speechSynthesis.cancel();
                const clean = text.replace(/<[^>]*>/g, '').replace(/```[\s\S]*?```/g, '').replace(/[#*_`]/g, '').slice(0, 300);
                const utter = new SpeechSynthesisUtterance(clean);
                utter.rate = 1.0;
                utter.pitch = 1.0;
                window.speechSynthesis.speak(utter);
            } catch (e) {
                console.warn("[TTS] Error:", e);
            }
        },

        setVoicePitch(p) {},
        setVoiceSpeechRate(r) {},
        setVoice(v) {},

        getAvailableVoices() {
            if (!('speechSynthesis' in window)) return "[]";
            const voices = window.speechSynthesis.getVoices();
            return JSON.stringify(voices.map(v => ({ name: v.name, lang: v.lang })));
        },

        // 4. Synchronous & Asynchronous Shell Execution
        runShellCommand(cmd) {
            if (!cmd || !cmd.trim()) return "ERR: empty command";
            try {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", API_BASE + "/api/shell", false); // Synchronous
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(JSON.stringify({ command: cmd }));
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    return data.output || data.stdout || (data.stderr ? "ERR: " + data.stderr : "[Completed with exit code 0]");
                }
                return "ERR: HTTP " + xhr.status + " - " + xhr.statusText;
            } catch (err) {
                console.error("[DesktopBridge] Shell error:", err);
                return "ERR: " + err.message;
            }
        },

        // 5. Asynchronous Kali VM execution (WSL2 Headless)
        async runKaliCommand(cmd) {
            if (!cmd || !cmd.trim()) return { error: "Empty command" };
            try {
                const res = await fetch(API_BASE + "/api/vm/exec", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ command: cmd })
                });
                return await res.json();
            } catch (err) {
                return { error: err.message };
            }
        },

        // 6. Kali VM Status & Controls
        async getVmStatus() {
            try {
                const res = await fetch(API_BASE + "/api/vm/status");
                return await res.json();
            } catch (e) {
                return { installed: false, running: false, error: e.message };
            }
        },

        async startVm() {
            try {
                const res = await fetch(API_BASE + "/api/vm/start", { method: "POST" });
                return await res.json();
            } catch (e) {
                return { error: e.message };
            }
        },

        async stopVm() {
            try {
                const res = await fetch(API_BASE + "/api/vm/stop", { method: "POST" });
                return await res.json();
            } catch (e) {
                return { error: e.message };
            }
        },

        // 7. Shizuku / ADB execution
        runShizukuCommand(cmd) {
            return this.runShellCommand("adb " + cmd);
        },

        // 8. Clipboard operations
        copyToClipboard(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).catch(() => {});
            }
            // Also notify backend
            try {
                fetch(API_BASE + "/api/clipboard", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text })
                }).catch(() => {});
            } catch (e) {}
            this.showToast("Copied to clipboard");
        },

        getClipboardText() {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", API_BASE + "/api/clipboard", false);
                xhr.send();
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    return data.text || "";
                }
            } catch (e) {}
            return "";
        },

        // 9. Hardware & System Posture
        getDeviceSecurityPosture() {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", API_BASE + "/api/system/info", false);
                xhr.send();
                if (xhr.status === 200) {
                    return xhr.responseText;
                }
            } catch (e) {}
            return JSON.stringify({
                os: "Desktop (Windows/Linux)",
                arch: "x64",
                posture: "SECURE",
                wsl_active: true
            });
        },

        runPortScan(host, ports) {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", API_BASE + "/api/portscan", false);
                xhr.setRequestHeader("Content-Type", "application/json");
                xhr.send(JSON.stringify({ host, ports }));
                if (xhr.status === 200) {
                    return xhr.responseText;
                }
            } catch (e) {}
            return JSON.stringify([]);
        },

        scanWifiNetworks() {
            return this.runShellCommand("wifi scan");
        },

        getWifiInfo() {
            return this.runShellCommand("wifi status");
        },

        getNetworkInterfacesInfo() {
            return this.runShellCommand("ifconfig");
        },

        getBatteryLevel() {
            return 100;
        },

        isDeviceCharging() {
            return true;
        },

        isNetHunterBridgeOnline() {
            return true;
        },

        isTermuxBridgeOnline() {
            return true;
        },

        startTermuxBridge() {
            return "Desktop Bridge Online (Host Native)";
        },

        launchTermux() {
            this.showToast("Desktop Host Shell Active");
        },

        toggleFlashlight(state) {
            this.showToast("Flashlight: Not available on desktop host");
            return false;
        }
    };

    // Attach as standard bridges
    window.DesktopBridge = DesktopBridge;
    window.AndroidBridge = DesktopBridge;
    window.Bridge = DesktopBridge;

    console.log("⚡ [Agentic Essence] Desktop Native Bridge Initialized (WSL2 Headless Ready)");
})();
