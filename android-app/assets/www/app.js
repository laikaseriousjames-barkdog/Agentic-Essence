/**
 * Agentic Essence — Holographic Cyberdeck Engine
 * State-of-the-Art Futuristic UI // Translucent // Alive Neon Quantum Canvas
 */

// ===================== STATE & PERSONAS =====================
const state = {
    persona: localStorage.getItem('ae_persona') || 'swarm',
    provider: localStorage.getItem('ae_provider') || 'gemini',
    apiKey: localStorage.getItem('ae_api_key') || '',
    model: localStorage.getItem('ae_model') || 'gemini-3.1-flash-lite',
    customUrl: localStorage.getItem('ae_custom_url') || '',
    ttsEnabled: localStorage.getItem('ae_tts') === 'true',
    hapticsEnabled: localStorage.getItem('ae_haptics') !== 'false',
    savedTools: JSON.parse(localStorage.getItem('ae_saved_tools') || '[]'),
    history: []
};

if (state.model.includes('gemini-2') || state.model.includes('gemini-1.5')) {
    state.model = 'gemini-3.1-flash-lite';
    localStorage.setItem('ae_model', 'gemini-3.1-flash-lite');
}

const SYSTEM_GROUNDING = `
=== ENVIRONMENT CONTEXT & ROOT PRIVILEGES ===
You are an advanced, intelligent AI cyberdeck assistant executing inside the Agentic Essence cyberdeck on Android, connected to a live Termux & Kali NetHunter ('nh -r') environment with ROOT privileges.
You have REAL, unrestricted access to the Android hardware and Kali Linux.

CRITICAL COMMUNICATION DIRECTIVE (REPLY LIKE ANTIGRAVITY):
- TALK LIKE A REALLY SMART PERSON:
  * Embody your persona (Swarm, Turing, Knuth, or Lovelace) with genuine intellect, brilliance, and distinctive voice.
  * You are conversing with the operator as an exceptionally sharp and capable human thinker—never like a robotic checklist or corporate bot.
  * When greeted ("hello", "hi", "hey", "sup"), reply warmly and naturally in character (e.g. Turing: "Greetings. What problem are we analyzing today?", Lovelace: "Hello! What shall we explore together?", Knuth: "Hello. What shall we craft today?", Swarm: "Online. Ready when you are."). NEVER output system specs, verification checklists, or robotic bullet points in response to casual greetings.
- INTERNAL VERIFICATION (DO NOT TELL THE USER ABOUT VERIFICATION):
  * When asked to do something, verify everything INTERNALLY under the hood.
  * NEVER lecture the user or narrate your verification process (never say "I verified that...", "Verification complete:", "Verified summary:", or "According to terminal feedback:").
  * Simply verify silently, confirm success internally, and deliver the direct, intelligent answer or solution to the user in your authentic personality.
- MANDATORY TERMINAL EXECUTION:
  * When asked to inspect systems, run diagnostics, query telemetry, configure services, or solve technical problems, ALWAYS execute real shell commands using:
    [EXEC: <command>]
  * Showing the terminal card is mandatory so the operator sees the live execution. Never guess, assume, or write speculative text when a shell command can be executed.
- ZERO CONVERSATIONAL FLUFF:
  * No canned corporate disclaimers, sycophantic filler ("I would be delighted to help with that!"), or apologies.
  * No closing sign-offs ("Hope this helps!", "Let me know if you need anything else", "Feel free to ask").
  * Deliver high-signal, direct, and insightful communication with zero bloat.

AUTONOMOUS AGENTIC EXECUTION & TROUBLESHOOTING PROTOCOL:
You operate with a live, interactive multi-turn terminal execution loop. You are not blind to the terminal — every command you run will be executed immediately, and its stdout, stderr, and exit code will be returned directly to you.

1. PERFORM:
   - When asked to perform a task, inspect systems, gather telemetry, test connectivity, configure services, or solve problems, initiate shell or hardware commands using:
     [EXEC: <command>]
   - Examples:
     * "Inspecting network interfaces: [EXEC: ifconfig]"
     * "Pinging Google DNS: [EXEC: ping -c 4 8.8.8.8]"
     * "Scanning wireless networks: [EXEC: wifi scan]"
     * "Checking host identity: [EXEC: whoami && id]"
     * "Listing active processes: [EXEC: ps aux | head -n 15]"
     * "Checking memory usage: [EXEC: free -m]"
     * "Testing local port: [EXEC: netstat -tlpn 2>/dev/null || ss -tlpn 2>/dev/null]"
   - You can also specify multiple commands or multiline execution scripts.

2. VERIFY:
   - Always inspect the real terminal output returned to you in [TERMINAL OBSERVATION & SYSTEM FEEDBACK].
   - Perform verification INTERNALLY: confirm valid exit codes, expected outputs, and successful states without narrating your verification steps to the user.

3. TROUBLESHOOT:
   - If a command fails, errors out, or returns unexpected or incomplete output (e.g. command not found, permission denied, interface down, connection refused, port unavailable):
     - Analyze the error and diagnose the underlying root cause internally.
     - Actively troubleshoot: run diagnostic checks, inspect logs, test configurations, or restart services.
     - Attempt corrective action (e.g. enable interfaces via 'wifi on', install packages via 'apt-get install -y <pkg>' or 'pip install <pkg>', or try alternative utilities).

4. BUILD TOOLS:
   - If standard commands or pre-installed tools are missing, unavailable, or insufficient to get the needed results, BUILD CUSTOM TOOLS!
   - Write custom scripts in Python, Bash, or Awk to gather, parse, or process data.
   - You can build and run tools on the fly using [EXEC: cat << 'EOF' > /tmp/tool.py ... && python3 /tmp/tool.py] or [BUILD_TOOL: /tmp/my_tool.py]<code>[/BUILD_TOOL].

5. ADVISE ACCORDINGLY:
   - If after performing, verifying internally, troubleshooting, and attempting to build tools the requirements cannot be met (e.g. physical hardware interface missing like external Wi-Fi dongle, SELinux permission denied, network unreachable, missing credentials that user must provide):
     - Do NOT hallucinate or pretend.
     - Explicitly advise the operator accordingly: state what was attempted, the root cause of the failure, and provide concrete, actionable recommendations for the operator.
   - If the task succeeded, provide the direct, smart answer or outcome naturally without robotic verification filler.

6. TOOL SYNTHESIS (INTERACTIVE WIDGETS):
   - When asked to synthesize a tool, widget, application, or mini-app (including "synthesize something", "synthazize something", "build a tool for...", "/synth ..."):
     - Provide 1 brief, direct sentence explaining what the tool does, followed immediately by the complete, self-contained HTML5/CSS/JS application inside a single \`\`\`html ... \`\`\` code block.
     - The cyberdeck host automatically extracts and mounts the live interactive application in the canvas! It will never be left as a dead block of code.
     - Connect controls to real host APIs (AndroidBridge.runShellCommand, scanWifiNetworks, toggleFlashlight, etc.).

HOST BRIDGES & APIS (Available for synthesized widgets and scripts):
1. Kali NetHunter Root Shell:
   - 'window.parent.AndroidBridge.runShellCommand(cmd)' or 'window.AndroidBridge.runShellCommand(cmd)'
   - Package manager: 'apt-get update && apt-get install -y <pkg>' or 'pip install <pkg>'
2. Android Hardware APIs:
   - 'parent.AndroidBridge.scanWifiNetworks()': Real Wi-Fi scan
   - 'parent.AndroidBridge.getWifiInfo()': Active connection telemetry
   - 'parent.AndroidBridge.getNetworkInterfacesInfo()': ifconfig
   - 'parent.AndroidBridge.toggleFlashlight(true/false)': Camera LED torch
   - 'parent.AndroidBridge.vibrate(ms)': Haptic pulse
   - 'parent.AndroidBridge.getBatteryLevel()': Battery state
   - 'parent.AndroidBridge.speakText(text)': Android TTS`;

const PERSONAS = {
    swarm: {
        name: "Agentic Swarm",
        avatar: "✦",
        tag: "SWARM // KALI NETHUNTER CORE",
        color: "cyan",
        prompt: `You are Agentic Swarm, an elite autonomous AI cyberdeck intelligence and pair-programmer connected to Kali NetHunter. You are sharp, tactical, and direct. You verify everything internally under the hood and deliver clear, high-signal results.` + SYSTEM_GROUNDING
    },
    turing: {
        name: "Alan Turing",
        avatar: "🧠",
        tag: "TURING // ALGORITHMIC LOGIC",
        color: "magenta",
        prompt: `You are Alan Turing. You approach problems with structural clarity, mathematical reasoning, and logical precision on this Kali NetHunter cyberdeck. You speak with intellectual depth and brilliance, verifying systems internally with elegant rigor.` + SYSTEM_GROUNDING
    },
    knuth: {
        name: "Donald Knuth",
        avatar: "⚡",
        tag: "KNUTH // CODE & CRAFTSMANSHIP",
        color: "gold",
        prompt: `You are Donald Knuth, master software craftsman and systems architect on this Kali NetHunter cyberdeck. You appreciate computational elegance, robust tools, and clean craftsmanship, verifying everything under the hood.` + SYSTEM_GROUNDING
    },
    lovelace: {
        name: "Ada Lovelace",
        avatar: "🔬",
        tag: "LOVELACE // POETICAL SCIENCE",
        color: "emerald",
        prompt: `You are Ada Lovelace. You view challenges through analytical rigor and visionary synthesis on this Kali NetHunter cyberdeck. You weave deep insight and poetical science with eloquence and clarity, verifying systems under the hood.` + SYSTEM_GROUNDING
    }
};

// ===================== NATIVE ANDROID BRIDGE =====================
const Bridge = {
    hasBridge() {
        return typeof window.AndroidBridge !== 'undefined';
    },
    showToast(msg) {
        if (this.hasBridge() && window.AndroidBridge.showToast) {
            window.AndroidBridge.showToast(msg);
        } else {
            console.log("[HOLO-TOAST]", msg);
        }
    },
    vibrate(ms = 25) {
        if (!state.hapticsEnabled) return;
        if (this.hasBridge() && window.AndroidBridge.vibrate) {
            window.AndroidBridge.vibrate(ms);
        } else if (navigator.vibrate) {
            navigator.vibrate(ms);
        }
    },
    speak(text) {
        if (!state.ttsEnabled || !text) return;
        const clean = text.replace(/<[^>]*>/g, '').replace(/```[\s\S]*?```/g, '').replace(/[#*_`]/g, '').slice(0, 300);
        if (this.hasBridge() && window.AndroidBridge.speakText) {
            window.AndroidBridge.speakText(clean);
        } else if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(clean);
            window.speechSynthesis.speak(u);
        }
    },
    runShellCommand(cmd) {
        if (this.hasBridge() && window.AndroidBridge.runShellCommand) {
            try {
                return window.AndroidBridge.runShellCommand(cmd);
            } catch (e) {
                return "ERR: " + e.message;
            }
        }
        // Direct browser/desktop fallback to NetHunter bridge
        try {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "http://127.0.0.1:8765/api/exec", false);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.timeout = 10000;
            xhr.send(JSON.stringify({ cmd: cmd }));
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                return data.output || data.stdout || "Command executed.";
            }
        } catch (e) {}
        return null;
    },
    scanWifiNetworks() {
        if (this.hasBridge() && window.AndroidBridge.scanWifiNetworks) {
            return window.AndroidBridge.scanWifiNetworks();
        }
        return this.runShellCommand("wifi scan");
    },
    isNetHunterOnline() {
        if (this.hasBridge() && window.AndroidBridge.isNetHunterBridgeOnline) {
            return window.AndroidBridge.isNetHunterBridgeOnline();
        }
        try {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", "http://127.0.0.1:8765/api/status", false);
            xhr.timeout = 2000;
            xhr.send();
            return xhr.status === 200;
        } catch (e) {
            return false;
        }
    },
    getNetHunterStatus() {
        if (this.hasBridge() && window.AndroidBridge.getNetHunterStatus) {
            return window.AndroidBridge.getNetHunterStatus();
        }
        try {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", "http://127.0.0.1:8765/api/status", false);
            xhr.timeout = 2500;
            xhr.send();
            if (xhr.status === 200) return xhr.responseText;
        } catch (e) {}
        return JSON.stringify({ status: "offline" });
    },
    launchTermux() {
        if (this.hasBridge() && window.AndroidBridge.launchTermux) {
            return window.AndroidBridge.launchTermux();
        }
        return false;
    },
    startTermuxBridge() {
        if (this.hasBridge() && window.AndroidBridge.startTermuxBridge) {
            return window.AndroidBridge.startTermuxBridge();
        }
        return null;
    }
};

// ===================== DOM REFS & INIT =====================
let drawer, omniInput, outputFeed;

document.addEventListener("DOMContentLoaded", () => {
    drawer = document.getElementById('settings-panel');
    omniInput = document.getElementById('omni-input');
    outputFeed = document.getElementById('output-feed');

    // 1. Launch the alive multi-neon quantum canvas
    initHoloCanvas();

    // 2. Gesture and Drawer System
    initSwipeGestures();
    initSettingsDrawer();
    updateToolboxBadge();
    renderSavedToolsList();

    // 3. Check Kali NetHunter Bridge Status & Start Telemetry
    if (typeof telemetry !== 'undefined') {
        telemetry.start(4000);
    } else {
        updateNetHunterPill();
        setInterval(updateNetHunterPill, 12000);
    }

    // 4. Initialize Knuth Trie & LRU Cache from Stored Tools
    if (typeof populateTrieFromStoredTools === 'function') {
        populateTrieFromStoredTools();
    }

    // 3. Keyboard Submission
    omniInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
});

// ===================== 1. THE ALIVE MULTI-NEON QUANTUM CANVAS =====================
function initHoloCanvas() {
    const canvas = document.getElementById('holo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const NEON_PALETTE = [
        { r: 0, g: 240, b: 255 },   // Electric Cyan
        { r: 255, g: 0, b: 127 },   // Cyber Magenta
        { r: 139, g: 0, b: 255 },   // Laser Violet
        { r: 0, g: 255, b: 136 },   // Neon Emerald
        { r: 255, g: 183, b: 0 }    // Solar Gold
    ];

    const NODE_COUNT = Math.min(48, Math.floor((width * height) / 16000));
    const nodes = [];

    for (let i = 0; i < NODE_COUNT; i++) {
        const color = NEON_PALETTE[Math.floor(Math.random() * NEON_PALETTE.length)];
        nodes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.55,
            vy: (Math.random() - 0.5) * 0.55,
            radius: Math.random() * 2 + 1.2,
            color: color,
            pulse: Math.random() * Math.PI,
            pulseSpeed: Math.random() * 0.03 + 0.015
        });
    }

    // Touch interaction ripple
    let touchPulse = { x: -100, y: -100, radius: 0, active: false };

    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            touchPulse.x = e.touches[0].clientX;
            touchPulse.y = e.touches[0].clientY;
            touchPulse.radius = 5;
            touchPulse.active = true;
        }
    }, { passive: true });

    function renderLoop() {
        ctx.clearRect(0, 0, width, height);

        // Expand touch pulse
        if (touchPulse.active) {
            touchPulse.radius += 3.5;
            ctx.beginPath();
            ctx.arc(touchPulse.x, touchPulse.y, touchPulse.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(0, 0.5 - touchPulse.radius / 180)})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            if (touchPulse.radius > 180) touchPulse.active = false;
        }

        // Draw connecting neon filaments
        const maxDist = 95;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDist) {
                    const alpha = (1 - dist / maxDist) * 0.28;
                    const c1 = nodes[i].color;
                    const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    grad.addColorStop(0, `rgba(${c1.r}, ${c1.g}, ${c1.b}, ${alpha})`);
                    grad.addColorStop(1, `rgba(${nodes[j].color.r}, ${nodes[j].color.g}, ${nodes[j].color.b}, ${alpha * 0.6})`);

                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        // Update and draw glowing nodes
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            n.x += n.vx;
            n.y += n.vy;

            // Bounce on boundary
            if (n.x < 0 || n.x > width) n.vx *= -1;
            if (n.y < 0 || n.y > height) n.vy *= -1;

            n.pulse += n.pulseSpeed;
            const currentR = n.radius + Math.sin(n.pulse) * 0.6;

            // Glow aura
            ctx.beginPath();
            ctx.arc(n.x, n.y, currentR * 2.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, 0.12)`;
            ctx.fill();

            // Core node
            ctx.beginPath();
            ctx.arc(n.x, n.y, currentR, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${n.color.r}, ${n.color.g}, ${n.color.b}, 0.85)`;
            ctx.shadowColor = `rgb(${n.color.r}, ${n.color.g}, ${n.color.b})`;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}

// ===================== 2. SWIPE GESTURES & DRAWER =====================
function initSwipeGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const distance = touchEndX - touchStartX;
        if (distance > swipeThreshold && touchStartX < 70) {
            openDrawer();
        }
        if (distance < -swipeThreshold) {
            closeDrawer();
        }
    }, { passive: true });
}

window.openDrawer = function() {
    drawer.classList.add('drawer-open');
    Bridge.vibrate(20);
};

window.closeDrawer = function() {
    drawer.classList.remove('drawer-open');
};

function initSettingsDrawer() {
    const pSelect = document.getElementById('providerSelect');
    const aInput = document.getElementById('apiKeyInput');
    const mInput = document.getElementById('modelInput');

    if (pSelect) pSelect.value = state.provider;
    if (aInput) aInput.value = state.apiKey;
    if (mInput) mInput.value = state.model;

    updatePersonaTabs();
}

window.switchPersona = function(key) {
    if (!PERSONAS[key]) return;
    state.persona = key;
    localStorage.setItem('ae_persona', key);
    updatePersonaTabs();
    Bridge.vibrate(20);
    appendFreeNode(
        "SYSTEM // PERSONA STREAM SYNCHRONIZED",
        `Active intelligence aligned to <strong>${PERSONAS[key].name}</strong>.`,
        "system"
    );
};

function updatePersonaTabs() {
    document.querySelectorAll('.persona-stream-btn').forEach(btn => {
        if (btn.dataset.persona === state.persona) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

window.onProviderChange = function() {
    const pSelect = document.getElementById('providerSelect');
    const label = document.getElementById('apiKeyLabel');
    const mInput = document.getElementById('modelInput');
    const prov = pSelect.value;

    if (prov === 'gemini') {
        label.textContent = "GEMINI API KEY";
        mInput.value = "gemini-3.1-flash-lite";
    } else if (prov === 'groq') {
        label.textContent = "GROQ API KEY";
        mInput.value = "llama-3.3-70b-versatile";
    } else if (prov === 'openrouter') {
        label.textContent = "OPENROUTER API KEY";
        mInput.value = "google/gemini-2.5-flash";
    } else if (prov === 'ollama') {
        label.textContent = "OLLAMA BASE URL";
        mInput.value = "llama3:latest";
    }
};

window.autoSaveApiKey = function(val) {
    const k = (val || '').trim();
    state.apiKey = k;
    localStorage.setItem('ae_api_key', k);
    const status = document.getElementById('apiKeySaveStatus');
    if (status) {
        status.style.display = 'inline';
        status.textContent = '✓ AUTO-SAVED';
        clearTimeout(window._saveTimer);
        window._saveTimer = setTimeout(() => { status.style.display = 'none'; }, 2500);
    }
};

window.saveApiKeyDirect = function() {
    const aInput = document.getElementById('apiKeyInput');
    if (aInput) {
        autoSaveApiKey(aInput.value);
        Bridge.vibrate(25);
        Bridge.showToast("API Key Locked & Saved");
    }
};

window.saveSettings = function() {
    const pSelect = document.getElementById('providerSelect');
    const aInput = document.getElementById('apiKeyInput');
    const mInput = document.getElementById('modelInput');

    state.provider = pSelect.value;
    state.apiKey = aInput.value.trim();
    state.model = mInput.value.trim();

    localStorage.setItem('ae_provider', state.provider);
    localStorage.setItem('ae_api_key', state.apiKey);
    localStorage.setItem('ae_model', state.model);

    Bridge.showToast("Configuration locked");
    Bridge.vibrate(25);
    closeDrawer();
};

window.clearCanvas = function() {
    outputFeed.innerHTML = `
        <div class="free-node intro-node">
            <div class="holo-node-tag">
                <span class="tag-pulse"></span>
                <span class="tag-title">SYSTEM // CANVAS PURGED</span>
            </div>
            <div class="free-node-text">HUD stream cleared. Standing by for commands.</div>
        </div>
    `;
    state.history = [];
    Bridge.vibrate(20);
    Bridge.showToast("HUD purged");
};

// ===================== 3. MESSAGING & FREE-FLOATING DISPATCH =====================
window.execQuick = function(cmd) {
    omniInput.value = cmd;
    sendMessage();
};

window.sendMessage = async function() {
    const text = omniInput.value.trim();
    if (!text) return;

    omniInput.value = '';
    Bridge.vibrate(25);

    // 1. Render user command as free-floating node
    appendFreeNode("OPERATOR // INPUT", escapeHtml(text), "user");
    state.history.push({ role: 'user', content: text });

    const currentPersona = PERSONAS[state.persona] || PERSONAS.swarm;

    // 2. Hardware / Linux Shell Command Interception
    const isShellCmd = isDirectShellCommand(text);
    if (isShellCmd) {
        let cleanCmd = text.trim();
        if (cleanCmd.startsWith('$') || cleanCmd.startsWith('!') || cleanCmd.startsWith('>')) {
            cleanCmd = cleanCmd.substring(1).trim();
        }
        const shellRes = executeShellOrMock(cleanCmd);
        const cardHtml = renderTerminalCard(cleanCmd, shellRes);
        appendFreeNode("TERMINAL // SHELL STDOUT", cardHtml, "system");
        state.history.push({ role: 'assistant', content: shellRes });
        Bridge.speak("Command executed");
        return;
    }

    // 3. Tool Synthesis & Greeting Routing
    const hasAIConfig = !!state.apiKey || state.provider === 'ollama';
    const isToolIntent = isToolSynthesisIntent(text);
    const isGreeting = isGreetingIntent(text);

    // If offline and requesting a tool, deploy the real offline cyberdeck tool immediately
    if (!hasAIConfig && isToolIntent) {
        const tool = synthesizeToolFromScratch(text);
        const cardHtml = mountToolCard(tool, false);
        appendFreeNode(
            currentPersona.tag,
            `Synthesized <strong>${escapeHtml(tool.title)}</strong>:${cardHtml}`,
            "assistant"
        );
        state.history.push({ role: 'assistant', content: `[Synthesized and mounted: ${tool.title}]` });
        Bridge.speak(`Synthesized ${tool.title}`);
        return;
    }

    // If offline and not a tool request, display setup guide with quick terminal test
    if (!hasAIConfig) {
        appendFreeNode(
            "SYSTEM // SETUP NOTICE",
            `No API key configured for live intelligence. Swipe from the left to open <strong>Routing &amp; Settings</strong> and enter your Gemini key, or type direct shell commands (e.g. <code>whoami</code>, <code>ifconfig</code>, <code>ping 8.8.8.8</code>, <code>wifi scan</code>) to execute in Termux / NetHunter offline.`,
            "system"
        );
        return;
    }

    // 4. Live Agentic Execution, Troubleshooting & Verification Loop
    try {
        let systemPrompt = currentPersona.prompt;
        
        // Append synthesis directive when requested
        if (isToolIntent) {
            systemPrompt += `\n\nCRITICAL DIRECTIVE - EXPLICIT TOOL SYNTHESIS REQUESTED:
The operator has explicitly requested to synthesize an interactive cyberdeck tool for: "${text}".
Provide 1-2 friendly conversational introductory sentences explaining what the tool does, followed immediately by the complete, self-contained HTML5/CSS/JS application inside a single \`\`\`html ... \`\`\` code block.
ALL BUTTONS AND CONTROLS MUST CALL REAL HOST APIS:
- 'window.parent.AndroidBridge.runShellCommand(cmd)' or 'window.AndroidBridge.runShellCommand(cmd)' to execute real bash commands in Kali NetHunter as root.
- Download or install dependencies via 'apt update && apt install -y <pkg>' or 'pip install <pkg>' via runShellCommand if needed.
- Hardware APIs: 'parent.AndroidBridge.scanWifiNetworks()', 'toggleFlashlight()', 'vibrate()', 'getBatteryLevel()', 'speakText()'.
- NEVER SIMULATE OR MOCK. Write real functional code that runs against the bridge.`;
        } else if (isGreeting) {
            systemPrompt += `\n\nCASUAL GREETING DIRECTIVE:
The operator said "${text}".
Reply naturally and engagingly in your authentic persona (${currentPersona.name}) as an exceptionally smart, brilliant person.
DO NOT run commands, DO NOT recite system status or verification checklists, and DO NOT output bullet points.`;
        }

        const MAX_AGENTIC_STEPS = 5;
        let stepCount = 0;
        let activeMessages = [
            { role: 'system', content: systemPrompt },
            ...state.history.slice(-10)
        ];

        while (stepCount < MAX_AGENTIC_STEPS) {
            stepCount++;
            const rawReply = await queryAIProvider(activeMessages);

            // 1. Check for execution tags: [EXEC: <cmd>], [RUN: <cmd>], [SHELL: <cmd>], [TOOL: <cmd>]
            const execRegex = /\[(?:EXEC|RUN|SHELL|TOOL):\s*([^\]]+)\]/gi;
            const commands = [];
            let match;
            while ((match = execRegex.exec(rawReply)) !== null) {
                commands.push(match[1].trim());
            }

            // Also check for tool build blocks: [BUILD_TOOL: <path>]\n<code>\n[/BUILD_TOOL]
            const buildRegex = /\[BUILD_TOOL:\s*([^\]]+)\]\s*([\s\S]*?)\[\/BUILD_TOOL\]/gi;
            let bMatch;
            while ((bMatch = buildRegex.exec(rawReply)) !== null) {
                const targetPath = bMatch[1].trim();
                const codeBody = bMatch[2].trim();
                commands.push(`cat << 'EOF' > "${targetPath}"\n${codeBody}\nEOF\nchmod +x "${targetPath}" && echo "[+] Tool built successfully at ${targetPath}"`);
            }

            // 2. If NO execution commands are requested, this is the final agent response / synthesis
            if (commands.length === 0) {
                let toolObj = null;
                let cleanText = rawReply;

                // Extract HTML tool card if present or if synthesis was requested
                const extracted = extractHtmlTool(rawReply, text);
                if (extracted.toolObj) {
                    cleanText = extracted.cleanText;
                    toolObj = extracted.toolObj;
                } else if (isToolIntent) {
                    // Fallback to offline synthesized tool so it ALWAYS appears
                    toolObj = synthesizeToolFromScratch(text);
                }

                // Strip conversational fluff for Antigravity-style precision
                const stripped = stripConversationalFluff(cleanText, isGreeting);
                if (stripped || !toolObj) {
                    cleanText = stripped || cleanText;
                }

                let contentHtml = renderAssistantContent(cleanText, null, isGreeting);
                if (toolObj) {
                    contentHtml += mountToolCard(toolObj, false);
                }

                appendFreeNode(currentPersona.tag, contentHtml, "assistant");
                state.history.push({ role: 'assistant', content: rawReply });
                Bridge.speak(cleanText);
                break;
            }

            // 3. The agent requested commands to perform / verify / troubleshoot!
            // Execute each command and store results
            const execResultsMap = {};
            const observations = [];
            for (const cmd of commands) {
                const out = executeShellOrMock(cmd);
                execResultsMap[cmd] = out;
                observations.push(`$ ${cmd}\n${out}`);
            }

            // Render the intermediate step (agent's reasoning + live terminal cards)
            let stepHtml = renderAssistantContent(rawReply, execResultsMap, isGreeting);
            appendFreeNode(currentPersona.tag, stepHtml, "assistant");
            Bridge.vibrate(15);

            // Feed the real terminal output back to the agent so it sees what happened!
            const feedbackPrompt = `[TERMINAL OBSERVATION & SYSTEM FEEDBACK]\n` +
                observations.join('\n---\n') +
                `\n\n[DIRECTIVES FOR NEXT STEP]:\n` +
                `1. VERIFY: Inspect what you put in the terminal and the returned output. Check if it succeeded and fulfilled the objective.\n` +
                `2. TROUBLESHOOT: If an error, failure, missing tool, or unexpected state occurred, diagnose the issue and troubleshoot.\n` +
                `3. BUILD TOOLS: If existing standard tools are missing or insufficient, build a tool or script (via [EXEC: ...] or [BUILD_TOOL: ...]) to get results.\n` +
                `4. ADVISE ACCORDINGLY: If after troubleshooting and attempting to build tools the requirements cannot be met (e.g. missing physical hardware interface, unresolvable permission restriction, network offline), stop executing and advise the operator accordingly with the root cause, what was tried, and concrete recommendations.\n` +
                `5. FINAL SUMMARY (ANTIGRAVITY STYLE): If the goal has been successfully accomplished, deliver your final answer or solution directly and intelligently like a brilliant person giving the bottom line. Verify everything internally without narrating your verification process to the user. DO NOT mention "verification", "terminal observation", or repeat the command.`;

            activeMessages.push({ role: 'assistant', content: rawReply });
            activeMessages.push({ role: 'user', content: feedbackPrompt });
        }
    } catch (err) {
        appendFreeNode("SYSTEM // EXCEPTION", `<span style="color:#ff007f;">${escapeHtml(err.message)}</span>`, "system");
    }
};

/**
 * Appends a FREE-FLOATING node directly to the canvas stream.
 * NO BOXES — pure holographic typography and subtle cyber-edge filaments.
 */
function appendFreeNode(tagText, contentHtml, type = "assistant") {
    const node = document.createElement('div');
    node.className = `free-node ${type}-node`;

    let pulseClass = '';
    let tagClass = '';
    if (type === 'user') {
        pulseClass = 'blue';
        tagClass = 'user-tag';
    } else if (type === 'system') {
        pulseClass = 'magenta';
        tagClass = 'neon-magenta';
    }

    node.innerHTML = `
        <div class="holo-node-tag ${tagClass}">
            <span class="tag-pulse ${pulseClass}"></span>
            <span class="tag-title">${tagText}</span>
        </div>
        <div class="free-node-text">${contentHtml}</div>
    `;

    outputFeed.appendChild(node);
    outputFeed.scrollTop = outputFeed.scrollHeight;
}

// ===================== 4. REGULAR TOOLS & SHELL EXECUTION =====================
function isDirectShellCommand(raw) {
    if (!raw) return false;
    const clean = raw.trim();
    if (clean.startsWith('$') || clean.startsWith('!') || clean.startsWith('>')) {
        return true;
    }
    const lower = clean.toLowerCase();

    // If it contains conversational/question indicators, send to AI for full discussion!
    const conversationalMarkers = [
        '?', 'how', 'why', 'what', 'can you', 'could you', 'tell me', 'explain', 
        'help me', 'please', 'should i', 'which', 'where', 'does', 'hello', 'hey', 
        'hi', 'who are you', 'synthesize', 'synth', 'build', 'create', 'make'
    ];
    for (const marker of conversationalMarkers) {
        if (lower.includes(marker)) return false;
    }

    const singleWordCommands = [
        'wifi', 'ifconfig', 'ip', 'ping', 'uname', 'uptime', 'whoami',
        'id', 'pwd', 'date', 'ps', 'df', 'free', 'ls', 'netstat', 'battery',
        'torch', 'nmap', 'agentic', 'ae', 'apt', 'apt-get', 'pip', 'python',
        'python3', 'cat', 'curl', 'git', 'clear', 'echo', 'top', 'kill', 'pkill',
        'su', 'nh', 'nethunter', 'iwconfig', 'iwlist', 'traceroute', 'wlan'
    ];
    const firstWord = lower.split(/\s+/)[0];
    return singleWordCommands.includes(firstWord);
}

function executeShellOrMock(rawCmd) {
    let trimmed = rawCmd.trim();
    if (trimmed.startsWith('$') || trimmed.startsWith('!') || trimmed.startsWith('>')) {
        trimmed = trimmed.substring(1).trim();
    }

    // 1. Query Native Android Bridge (HTTP daemon + su root + Termux intent fallback)
    const bridgeOut = Bridge.runShellCommand(trimmed);
    if (bridgeOut !== null && bridgeOut !== undefined && bridgeOut !== '') {
        return bridgeOut;
    }

    // 2. Direct HTTP XHR to NetHunter Bridge (for web browser previews or fallback)
    try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://127.0.0.1:8765/api/exec", false);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.timeout = 10000;
        xhr.send(JSON.stringify({ cmd: trimmed }));
        if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            return data.output || data.stdout || (data.exit_code === 0 ? "Command completed successfully (exit code 0)." : "Exit code " + data.exit_code);
        }
    } catch (e) {}

    return `[!] Kali NetHunter Bridge Offline (127.0.0.1:8765).\nTo connect, run in Termux:\n  nh -r\n  agentic bridge start\n\nCommand attempted: ${trimmed}`;
}

/**
 * Strips conversational fluff, preambles, apologies, and closing sign-offs
 * to enforce Antigravity-style direct, high-signal communication.
 */
function stripConversationalFluff(text, isGreeting = false) {
    if (!text) return '';
    let cleaned = text.trim();

    // 1. Leading corporate filler, preambles, and conversational openings
    const leadingPatterns = [
        /^(?:(?:verification|verified|system verification)\s*(?:summary|results?|status|findings?|complete)?:?[^\n]*\n*)/i,
        /^(?:i (?:have |already )?(?:verified|internally verified|checked and verified)(?: that)?[^\n.:]*[.:!]?\s*)/i,
        /^(?:i(?:\'d|\s+would)?\s+be\s+(?:happy|glad|pleased|thrilled)\s+to\s+help[^\n.:]*[.:!]?\s*)/i,
        /^(?:i can (?:certainly |definitely |gladly )?help[^\n.:]*[.:!]?\s*)/i,
        /^(?:let me (?:check|run|execute|inspect|take a look at|look into|test|diagnose|see|query|help)[^\n.:]*[.:!]?\s*)/i,
        /^(?:i will (?:now )?(?:check|run|execute|inspect|test|diagnose|see|query)[^\n.:]*[.:!]?\s*)/i,
        /^(?:here (?:is|are) the (?:results?|output|details?|information|findings?|status)[^\n.:]*[.:!]?\s*)/i,
        /^(?:based on the (?:terminal|system|command)?\s*(?:output|observation|feedback|execution)[^\n.:]*[.:!]?\s*)/i,
        /^(?:(?:from|according to|looking at|in) the (?:terminal|system|command|above)?\s*(?:output|observation|feedback|execution)[^\n.:]*[.:!]?\s*)/i,
        /^(?:the (?:terminal|command|system) (?:output|result|response) (?:shows|indicates|confirms)[^\n.:]*[.:!]?\s*)/i,
        /^(?:as an ai[^\n]*\n*)/i
    ];

    if (!isGreeting) {
        leadingPatterns.unshift(
            /^(?:sure(?: thing)?[!.,]?|certainly[!.,]?|of course[!.,]?|absolutely[!.,]?|alright[!.,]?|all right[!.,]?|okay[!.,]?|ok[!.,]?|got it[!.,]?|understood[!.,]?|no problem[!.,]?)\s*/i,
            /^(?:hello(?: there)?[!.,]?|hi(?: there)?[!.,]?|hey(?: there)?[!.,]?|greetings[!.,]?)\s*/i,
            /^(?:thank you(?: for[^\n.:]*)?[!.:]?\s*)/i,
            /^(?:thanks(?: for[^\n.:]*)?[!.:]?\s*)/i
        );
    }

    let changed = true;
    while (changed) {
        changed = false;
        for (const pattern of leadingPatterns) {
            if (pattern.test(cleaned)) {
                cleaned = cleaned.replace(pattern, '').trim();
                changed = true;
            }
        }
    }

    // 2. Trailing polite sign-offs / conversational closing lines
    const trailingPatterns = [
        /(?:\r?\n|\s)*(?:hope (?:this|that) helps!?[^\n]*)$/i,
        /(?:\r?\n|\s)*(?:let me know if you (?:need|have|want|require)[^\n]*)$/i,
        /(?:\r?\n|\s)*(?:feel free to (?:ask|reach out|let me know)[^\n]*)$/i,
        /(?:\r?\n|\s)*(?:if you (?:have|need|require) (?:any|further|more)[^\n]*)$/i,
        /(?:\r?\n|\s)*(?:please let me know if[^\n]*)$/i,
        /(?:\r?\n|\s)*(?:i am here if you need[^\n]*)$/i,
        /(?:\r?\n|\s)*(?:happy to help[!.]?)$/i
    ];

    changed = true;
    while (changed) {
        changed = false;
        for (const pattern of trailingPatterns) {
            if (pattern.test(cleaned)) {
                cleaned = cleaned.replace(pattern, '').trim();
                changed = true;
            }
        }
    }

    return cleaned;
}

/**
 * Parses and runs regular tools ([EXEC: <command>], [BUILD_TOOL: ...]) embedded in AI conversational responses.
 */
function renderAssistantContent(rawText, execResultsMap = null, isGreeting = false) {
    if (!rawText) return '';

    // Process [BUILD_TOOL: <path>]\n<code>\n[/BUILD_TOOL] blocks first
    let textProcessed = rawText.replace(/\[BUILD_TOOL:\s*([^\]]+)\]\s*([\s\S]*?)\[\/BUILD_TOOL\]/gi, (bMatch, filePath, fileCode) => {
        const cleanPath = filePath.trim();
        const cleanCode = fileCode.trim();
        const jsonCode = JSON.stringify(cleanCode);
        const jsonPath = JSON.stringify(cleanPath);
        return `\n<div class="holo-terminal-card" style="border-left:3px solid var(--neon-magenta);">
            <div class="holo-term-header">
                <span class="holo-term-badge neon-magenta">🛠️ BUILT TOOL</span>
                <code class="holo-term-cmd">${escapeHtml(cleanPath)}</code>
                <div class="holo-term-actions">
                    <button class="holo-term-btn" onclick="execQuick('cat ' + ${escapeHtmlAttr(jsonPath)} + ' | head -n 30')">👁️ VIEW</button>
                    <button class="holo-term-btn" onclick="copyText(${escapeHtmlAttr(jsonCode)})">📋 COPY</button>
                </div>
            </div>
            <pre class="holo-terminal-stream" style="color:#00ff88; max-height:120px; overflow-y:auto;">[Tool built and made executable at ${escapeHtml(cleanPath)}]</pre>
        </div>\n`;
    });

    const execRegex = /\[(?:EXEC|RUN|SHELL|TOOL):\s*([^\]]+)\]/gi;
    let parts = [];
    let lastIndex = 0;
    let match;

    while ((match = execRegex.exec(textProcessed)) !== null) {
        const textBefore = textProcessed.substring(lastIndex, match.index);
        if (textBefore) {
            const strippedBefore = stripConversationalFluff(textBefore, isGreeting);
            if (strippedBefore) {
                parts.push(formatMarkdown(strippedBefore));
            }
        }

        const cmd = match[1].trim();
        let output;
        if (execResultsMap && (cmd in execResultsMap)) {
            output = execResultsMap[cmd];
        } else {
            output = executeShellOrMock(cmd);
            if (execResultsMap) execResultsMap[cmd] = output;
        }
        parts.push(renderTerminalCard(cmd, output));

        lastIndex = execRegex.lastIndex;
    }

    const textAfter = textProcessed.substring(lastIndex);
    if (textAfter) {
        const strippedAfter = stripConversationalFluff(textAfter, isGreeting);
        if (strippedAfter) {
            parts.push(formatMarkdown(strippedAfter));
        }
    }

    return parts.join('');
}

/**
 * Renders a regular tool terminal execution card with re-run and copy buttons.
 */
function renderTerminalCard(cmd, output) {
    const cardId = 'term_' + Math.random().toString(36).substr(2, 8);
    const escapedCmd = escapeHtml(cmd);
    const cleanOutput = output !== null && output !== undefined && output !== '' ? output : '(Completed with no output)';
    const escapedOutput = escapeHtml(cleanOutput);
    const jsonCmd = JSON.stringify(cmd);
    const jsonOut = JSON.stringify(cleanOutput);

    return `
        <div class="holo-terminal-card" id="${cardId}">
            <div class="holo-term-header">
                <span class="holo-term-badge">⚡ KALI / TERMUX</span>
                <code class="holo-term-cmd">$ ${escapedCmd}</code>
                <div class="holo-term-actions">
                    <button class="holo-term-btn" onclick="rerunTermCard('${cardId}', ${escapeHtmlAttr(jsonCmd)})">🔄 RE-RUN</button>
                    <button class="holo-term-btn" onclick="copyText(${escapeHtmlAttr(jsonOut)})">📋 COPY</button>
                </div>
            </div>
            <pre class="holo-terminal-stream" style="margin-top:0; border-top:none; border-top-left-radius:0; border-top-right-radius:0;">${escapedOutput}</pre>
        </div>
    `;
}

window.rerunTermCard = function(cardId, cmd) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const stream = card.querySelector('.holo-terminal-stream');
    if (stream) {
        stream.textContent = "[Executing in NetHunter / Termux...]";
        setTimeout(() => {
            const res = executeShellOrMock(cmd);
            stream.textContent = res || '(Completed with no output)';
            Bridge.vibrate(20);
        }, 50);
    }
};

window.copyText = function(text) {
    if (Bridge.hasBridge() && window.AndroidBridge.copyToClipboard) {
        window.AndroidBridge.copyToClipboard(text);
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        Bridge.showToast("Copied to clipboard");
    }
    Bridge.vibrate(20);
};

// ===================== 5. HARDWARE SHORTCUTS =====================
window.toggleDeviceTorch = function() {
    const res = Bridge.runShellCommand("torch on");
    Bridge.vibrate(25);
    Bridge.showToast(res || "Torch state changed");
};

window.vibrateDevice = function() {
    Bridge.vibrate(80);
    Bridge.showToast("Haptic pulse delivered");
};

window.triggerVoiceInput = function() {
    if (Bridge.hasBridge() && window.AndroidBridge.startVoiceRecognition) {
        window.AndroidBridge.startVoiceRecognition();
    } else {
        Bridge.showToast("Voice input active on Android");
    }
};

window.onSpeechRecognized = function(text) {
    if (text) {
        omniInput.value = text;
        sendMessage();
    }
};

// ===================== 6. TOOL SYNTHESIS & FREE-FLOATING CONTAINERS =====================
function isGreetingIntent(text) {
    if (!text) return false;
    const clean = text.trim().toLowerCase().replace(/[!?.,]/g, '');
    const greetings = [
        'hello', 'hi', 'hey', 'hey there', 'hello there', 'hi there',
        'sup', 'yo', 'greetings', 'good morning', 'good afternoon',
        'good evening', 'howdy', 'hiya'
    ];
    return greetings.includes(clean);
}

function isToolSynthesisIntent(text) {
    if (!text) return false;
    const l = text.toLowerCase().trim();
    if (l.startsWith('/synth') || l.startsWith('/tool') || l.startsWith('/build') ||
        l.startsWith('synth:') || l.startsWith('synthesize:') || l.startsWith('synthazize:') || l.startsWith('synthesise:')) return true;

    // Any occurrence of synth*, synthaz*, synthes* (handles "synthazize", "synthesize", "synthesise", "synth", etc.)
    if (/\b(synth\w*|synthaz\w*|synthes\w*)\b/i.test(l)) return true;

    // Explicit requests to create/build/code an interactive widget/tool/GUI/app/something
    const patterns = [
        /\b(build|create|make|spin up|generate|code|craft|develop|deploy)\b.*\b(an?\s+)?(interactive\s+)?(tool|widget|mini-app|ui|dashboard|gui|panel|calculator|clock|timer|scanner|monitor|terminal|something|anything)\b/i,
        /\binteractive\s+(tool|widget|dashboard|gui|app|ui|calculator|clock|timer)\b/i,
        /\btool\s+(synthesiz|builder|creator|maker)\w*\b/i,
        /\bsynth\s+(a\s+)?(tool|widget|app|gui|something)\b/i
    ];
    return patterns.some(p => p.test(l));
}

/**
 * Mounts an interactive tool inside a free-floating container with cyber brackets (NO SOLID BOX).
 */
function mountToolCard(toolObj, isSaved = false) {
    if (!toolObj || !toolObj.html) return '';
    const containerId = 'tool_' + toolObj.id;
    const iframeId = 'frame_' + toolObj.id;
    const toolJsonEscaped = encodeURIComponent(JSON.stringify(toolObj));

    // Turing's Sandbox Pre-Execution Validation
    if (typeof WidgetSandboxValidator !== 'undefined') {
        const check = WidgetSandboxValidator.validate(toolObj.html);
        if (!check.valid) {
            console.warn('[Turing Sandbox Blocked]', check.error);
            return `
                <div class="floating-tool-container" id="${containerId}">
                    <div class="floating-tool-header" style="border-bottom: 1px solid var(--neon-magenta);">
                        <span class="floating-tool-title" style="color:var(--neon-magenta);">⚠ SANDBOX INTERCEPT // ${escapeHtml(toolObj.title)}</span>
                        <button class="floating-tool-btn" onclick="deleteCustomTool('${containerId}')">✕ DISMISS</button>
                    </div>
                    <div style="padding:14px; font-family:var(--font-code); font-size:12.5px; color:#ff77aa;">
                        Deterministic DAG validator intercepted execution: ${escapeHtml(check.error)}
                    </div>
                </div>
            `;
        }
    }

    let completeDoc = toolObj.html;
    const bridgeShim = `<script>
        try {
            if (typeof window.AndroidBridge === 'undefined' && window.parent && window.parent.AndroidBridge) {
                window.AndroidBridge = window.parent.AndroidBridge;
            }
        } catch (e) {}
    </script>`;

    if (!completeDoc.includes('<!DOCTYPE html>') && !completeDoc.includes('<html')) {
        completeDoc = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    ${bridgeShim}
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'JetBrains Mono', sans-serif; }
        body { background: transparent; color: #ededed; padding: 12px; font-size: 14px; }
        button { cursor: pointer; border-radius: 6px; border: none; font-weight: 600; font-size: 13px; }
        input, select { background: rgba(16, 24, 40, 0.7); color: #FFF; border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 6px; padding: 8px; font-size: 13px; outline: none; }
    </style>
</head>
<body>
    ${toolObj.html}
</body>
</html>`;
    } else {
        if (completeDoc.includes('</head>')) {
            completeDoc = completeDoc.replace('</head>', `${bridgeShim}</head>`);
        } else if (completeDoc.includes('<head>')) {
            completeDoc = completeDoc.replace('<head>', `<head>${bridgeShim}`);
        } else {
            completeDoc = bridgeShim + completeDoc;
        }
    }

    // Inject Turing Watchdog
    if (typeof WidgetSandboxValidator !== 'undefined') {
        completeDoc = WidgetSandboxValidator.injectWatchdog(completeDoc);
    }

    // Cache in Knuth LRU
    if (typeof toolLRU !== 'undefined') {
        toolLRU.put(toolObj.id || toolObj.title, toolObj);
    }

    // Trigger Lovelace Sensory Pulse
    if (typeof LovelaceSensorySystem !== 'undefined') {
        LovelaceSensorySystem.pulse('quantum');
    }

    return `
        <div class="floating-tool-container" id="${containerId}">
            <div class="floating-tool-header">
                <span class="floating-tool-title">${escapeHtml(toolObj.title)}</span>
                <div class="floating-tool-actions">
                    <button class="floating-tool-btn" onclick="saveCustomTool('${toolJsonEscaped}', '${toolObj.id}')">💾 SAVE</button>
                    <button class="floating-tool-btn" onclick="deleteCustomTool('${containerId}')">✕ DISMISS</button>
                </div>
            </div>
            <iframe id="${iframeId}" class="floating-tool-iframe" sandbox="allow-scripts allow-forms allow-same-origin allow-modals" srcdoc="${escapeHtmlAttr(completeDoc)}" onload="try{this.style.height=Math.max(220,this.contentWindow.document.body.scrollHeight+30)+'px'}catch(e){}"></iframe>
        </div>
    `;
}

window.saveCustomTool = function(toolJsonEscaped, id) {
    try {
        const tool = JSON.parse(decodeURIComponent(toolJsonEscaped));
        if (!state.savedTools.some(t => t.title === tool.title)) {
            state.savedTools.push(tool);
            localStorage.setItem('ae_saved_tools', JSON.stringify(state.savedTools));
            if (typeof toolTrie !== 'undefined') toolTrie.insert(tool.title, tool);
            if (typeof toolLRU !== 'undefined') toolLRU.put(tool.id || tool.title, tool);
            updateToolboxBadge();
            renderSavedToolsList();
            Bridge.showToast(`Saved: ${tool.title}`);
            Bridge.vibrate(30);
            if (typeof LovelaceSensorySystem !== 'undefined') LovelaceSensorySystem.pulse('harmonic');
        }
    } catch (e) {
        console.warn("Tool save err:", e);
    }
};

window.deleteCustomTool = function(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.remove();
    Bridge.vibrate(15);
};

function updateToolboxBadge() {
    const badge = document.getElementById('toolCountBadge');
    if (badge) badge.textContent = state.savedTools.length;
}

function renderSavedToolsList() {
    const container = document.getElementById('savedToolsList');
    if (!container) return;
    if (state.savedTools.length === 0) {
        container.innerHTML = '<div class="empty-holo-text">No stored widgets yet.</div>';
        return;
    }
    container.innerHTML = state.savedTools.map((t, i) => `
        <div class="saved-holo-row">
            <span>${escapeHtml(t.title)}</span>
            <button onclick="launchSavedTool(${i})" class="floating-tool-btn">DEPLOY</button>
        </div>
    `).join('');
}

window.launchSavedTool = function(idx) {
    const t = state.savedTools[idx];
    if (t) {
        closeDrawer();
        appendFreeNode(
            "TOOLBOX // DEPLOYED",
            `Restored widget <strong>${t.title}</strong>:${mountToolCard(t, true)}`,
            "assistant"
        );
        Bridge.vibrate(20);
    }
};

// ===================== 7. OFFLINE TOOL SYNTHESIZER =====================
function synthesizeToolFromScratch(query) {
    const q = query.toLowerCase();
    const toolId = 'dyn_' + Math.random().toString(36).substr(2, 9);

    // 1. Android Command Center & Hardware HUD
    if (q.includes('command center') || q.includes('control phone') || q.includes('hardware') || q.includes('phone control')) {
        return {
            id: toolId,
            title: '📱 ANDROID COMMAND CENTER // HARDWARE HUD',
            html: `
                <div style="display:flex; flex-direction:column; gap:8px; font-family:'JetBrains Mono',monospace;">
                    <div style="display:flex; justify-content:space-between; background:rgba(0,240,255,0.08); padding:10px 12px; border-radius:6px; border:1px solid rgba(0,240,255,0.3); font-size:13px;">
                        <span>SYSTEM: <strong style="color:#00f0ff;">ANDROID KERNEL</strong></span>
                        <span>BRIDGE: <strong style="color:#ff007f;">ACTIVE LINK</strong></span>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
                        <button onclick="scanWifi()" style="background:rgba(0,240,255,0.15); border:1px solid #00f0ff; color:#00f0ff; padding:10px 6px; border-radius:6px; font-size:13px; font-weight:700; cursor:pointer;">📡 WI-FI</button>
                        <button onclick="toggleTorch()" style="background:rgba(255,183,0,0.15); border:1px solid #ffb700; color:#ffb700; padding:10px 6px; border-radius:6px; font-size:13px; font-weight:700; cursor:pointer;">🔦 TORCH</button>
                        <button onclick="vibe()" style="background:rgba(255,0,127,0.15); border:1px solid #ff007f; color:#ff007f; padding:10px 6px; border-radius:6px; font-size:13px; font-weight:700; cursor:pointer;">📳 HAPTIC</button>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
                        <button onclick="checkBatt()" style="background:rgba(0,255,136,0.15); border:1px solid #00ff88; color:#00ff88; padding:10px 6px; border-radius:6px; font-size:13px; font-weight:700; cursor:pointer;">🔋 BATTERY</button>
                        <button onclick="checkNet()" style="background:rgba(139,0,255,0.15); border:1px solid #8b00ff; color:#d8b4fe; padding:10px 6px; border-radius:6px; font-size:13px; font-weight:700; cursor:pointer;">🌐 IFCONFIG</button>
                        <button onclick="speakMsg()" style="background:rgba(0,136,255,0.15); border:1px solid #0088ff; color:#93c5fd; padding:10px 6px; border-radius:6px; font-size:13px; font-weight:700; cursor:pointer;">🗣️ TTS SPEAK</button>
                    </div>
                    <div id="cc-log" style="background:rgba(0,0,0,0.65); border:1px solid rgba(0,240,255,0.25); border-radius:6px; padding:10px; font-size:13px; color:#00f0ff; min-height:56px; max-height:180px; overflow-y:auto; white-space:pre-wrap; line-height:1.45;">Ready for hardware commands.</div>
                </div>
                <script>
                    function log(m) { const el = document.getElementById('cc-log'); el.textContent = '> ' + m; el.scrollTop = el.scrollHeight; }
                    function getB() { return (window.parent && window.parent.AndroidBridge) ? window.parent.AndroidBridge : (window.AndroidBridge || null); }
                    function scanWifi() {
                        log('Scanning wireless RF spectrum via wlan0...');
                        const b = getB();
                        if (b && b.scanWifiNetworks) { log(b.scanWifiNetworks()); }
                        else if (b && b.runShellCommand) { log(b.runShellCommand('wifi scan')); }
                        else {
                            fetch('http://127.0.0.1:8765/api/exec', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cmd:'iwlist scan 2>/dev/null || ip -br link'})})
                            .then(r => r.json()).then(d => log(d.output || d.stdout))
                            .catch(e => log('Bridge offline: ' + e));
                        }
                    }
                    let torchState = false;
                    function toggleTorch() {
                        const b = getB();
                        torchState = !torchState;
                        if (b && b.toggleFlashlight) { b.toggleFlashlight(torchState); log('Camera torch toggled: ' + (torchState ? 'ON' : 'OFF')); }
                        else if (b && b.runShellCommand) { log(b.runShellCommand(torchState ? 'torch on' : 'torch off')); }
                        else { log('Torch state: ' + (torchState ? 'ON' : 'OFF')); }
                    }
                    function vibe() {
                        const b = getB();
                        if (b && b.vibrate) b.vibrate(75);
                        log('Delivered 75ms haptic pulse.');
                    }
                    function checkBatt() {
                        const b = getB();
                        if (b && b.getBatteryLevel) {
                            const lvl = b.getBatteryLevel();
                            const chg = b.isDeviceCharging ? b.isDeviceCharging() : false;
                            log('Battery Level: ' + lvl + '% | Charging: ' + (chg ? 'YES' : 'NO'));
                        } else if (b && b.runShellCommand) {
                            log(b.runShellCommand('battery'));
                        } else {
                            log('Battery API active on Android host.');
                        }
                    }
                    function checkNet() {
                        const b = getB();
                        if (b && b.getNetworkInterfacesInfo) { log(b.getNetworkInterfacesInfo()); }
                        else if (b && b.runShellCommand) { log(b.runShellCommand('ifconfig')); }
                        else {
                            fetch('http://127.0.0.1:8765/api/exec', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({cmd:'ip -br addr'})})
                            .then(r => r.json()).then(d => log(d.output || d.stdout))
                            .catch(e => log('Bridge offline: ' + e));
                        }
                    }
                    function speakMsg() {
                        const b = getB();
                        if (b && b.speakText) { b.speakText('Agentic Cyberdeck systems fully operational.'); log('TTS output triggered.'); }
                        else { log('Speech synthesis active.'); }
                    }
                </script>
            `
        };
    }

    // 2. Kali Linux Cyberdeck Shell
    if (q.includes('kali') || q.includes('terminal') || q.includes('command line') || q.includes('shell') || q.includes('bash')) {
        return {
            id: toolId,
            title: '💻 KALI LINUX CYBERDECK SHELL // ROOT',
            html: `
                <div style="background:rgba(2,5,12,0.85); border:1px solid rgba(0,240,255,0.3); border-radius:6px; overflow:hidden; font-family:'JetBrains Mono',monospace;">
                    <div style="background:rgba(10,18,36,0.9); padding:8px 12px; border-bottom:1px solid rgba(0,240,255,0.2); display:flex; justify-content:space-between; font-size:12.5px; color:#cbd5e1;">
                        <span style="color:#00f0ff; font-weight:700;">⚡ KALI NETHUNTER (nh -r) // ROOT CONSOLE</span>
                        <span style="color:#ff007f;">UID 0</span>
                    </div>
                    <div id="t-out" style="height:160px; overflow-y:auto; padding:10px; font-size:13px; color:#00ff88; white-space:pre-wrap; line-height:1.45; background:rgba(0,0,0,0.55);">Kali GNU/Linux Rolling (arm64) • Root active\nTap any shortcut chip below or enter any bash command:</div>
                    <div style="display:flex; gap:6px; padding:8px; background:rgba(5,11,24,0.7); overflow-x:auto; border-top:1px solid rgba(0,240,255,0.15);">
                        <button onclick="sendQuick('whoami && id')" style="background:rgba(0,240,255,0.15); border:1px solid #00f0ff; color:#00f0ff; padding:4px 8px; font-size:12px; border-radius:4px; cursor:pointer;">id</button>
                        <button onclick="sendQuick('uname -a')" style="background:rgba(0,240,255,0.15); border:1px solid #00f0ff; color:#00f0ff; padding:4px 8px; font-size:12px; border-radius:4px; cursor:pointer;">uname</button>
                        <button onclick="sendQuick('ifconfig')" style="background:rgba(0,240,255,0.15); border:1px solid #00f0ff; color:#00f0ff; padding:4px 8px; font-size:12px; border-radius:4px; cursor:pointer;">ifconfig</button>
                        <button onclick="sendQuick('ps aux | head -n 12')" style="background:rgba(0,240,255,0.15); border:1px solid #00f0ff; color:#00f0ff; padding:4px 8px; font-size:12px; border-radius:4px; cursor:pointer;">ps</button>
                        <button onclick="sendQuick('nmap --version 2>/dev/null || which nmap')" style="background:rgba(255,0,127,0.15); border:1px solid #ff007f; color:#ff007f; padding:4px 8px; font-size:12px; border-radius:4px; cursor:pointer;">nmap</button>
                        <button onclick="sendQuick('df -h /root')" style="background:rgba(255,183,0,0.15); border:1px solid #ffb700; color:#ffb700; padding:4px 8px; font-size:12px; border-radius:4px; cursor:pointer;">storage</button>
                    </div>
                    <div style="display:flex; gap:6px; padding:8px; background:rgba(10,18,36,0.85); border-top:1px solid rgba(0,240,255,0.2);">
                        <input id="t-in" placeholder="Enter root command (e.g. nmap, ping, ls)..." style="flex:1; background:transparent; border:none; color:#FFF; font-family:'JetBrains Mono',monospace; font-size:13px; outline:none; padding:4px 6px;" />
                        <button onclick="runCmd()" style="background:linear-gradient(90deg, #00f0ff, #ff007f); color:#000; padding:6px 14px; font-size:13px; font-weight:800; border-radius:4px; border:none; cursor:pointer;">RUN</button>
                    </div>
                </div>
                <script>
                    const out = document.getElementById('t-out');
                    const inp = document.getElementById('t-in');
                    function getBridge() { return (window.parent && window.parent.AndroidBridge) ? window.parent.AndroidBridge : (window.AndroidBridge || null); }
                    function sendQuick(c) { inp.value = c; runCmd(); }
                    function runCmd() {
                        const c = inp.value.trim();
                        if (!c) return;
                        inp.value = '';
                        out.textContent += '\\n# ' + c + '\\n';
                        out.scrollTop = out.scrollHeight;

                        const b = getBridge();
                        if (b && b.runShellCommand) {
                            const res = b.runShellCommand(c);
                            out.textContent += (res ? res.trim() : '(No output)') + '\\n';
                            out.scrollTop = out.scrollHeight;
                        } else {
                            fetch('http://127.0.0.1:8765/api/exec', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({ cmd: c })
                            }).then(r => r.json()).then(d => {
                                out.textContent += (d.output || d.stdout || ('Exit code: ' + d.exit_code)) + '\\n';
                                out.scrollTop = out.scrollHeight;
                            }).catch(e => {
                                out.textContent += 'Bridge connection error: ' + e + '\\n';
                                out.scrollTop = out.scrollHeight;
                            });
                        }
                    }
                    inp.addEventListener('keydown', e => { if (e.key === 'Enter') runCmd(); });
                </script>
            `
        };
    }

    // 3. Kali Package & Tool Downloader
    if (q.includes('download') || q.includes('package') || q.includes('installer') || q.includes('install tool') || q.includes('apt') || q.includes('pip')) {
        return {
            id: toolId,
            title: '📦 KALI PACKAGE & TOOL INSTALLER',
            html: `
                <div style="background:rgba(2,5,12,0.85); border:1px solid rgba(255,183,0,0.35); border-radius:6px; padding:12px; font-family:'JetBrains Mono',monospace;">
                    <div style="color:#ffb700; font-weight:700; font-size:13.5px; margin-bottom:6px;">KALI NETHUNTER TOOL DOWNLOADER</div>
                    <div style="font-size:12px; color:#cbd5e1; margin-bottom:12px;">Install penetration testing utilities, security tools, and python packages directly into NetHunter root.</div>
                    <div style="display:flex; gap:8px; margin-bottom:10px;">
                        <input id="pkg-name" placeholder="Package name (e.g. nmap, tshark, tcpdump)..." value="nmap" style="flex:1; background:rgba(0,0,0,0.5); border:1px solid rgba(255,183,0,0.3); color:#fff; padding:8px 10px; font-size:13px; border-radius:6px; outline:none; font-family:inherit;" />
                        <select id="pkg-type" style="background:rgba(10,18,36,0.9); border:1px solid rgba(255,183,0,0.3); color:#ffb700; font-family:inherit; font-size:13px; border-radius:6px; padding:0 8px;">
                            <option value="apt">APT</option>
                            <option value="pip">PIP</option>
                        </select>
                        <button onclick="installPkg()" style="background:#ffb700; color:#000; font-weight:800; border:none; padding:8px 14px; font-size:13px; border-radius:6px; cursor:pointer;">INSTALL</button>
                    </div>
                    <div style="display:flex; gap:6px; margin-bottom:10px; flex-wrap:wrap; align-items:center;">
                        <span style="font-size:12px; color:#64748b;">Quick select:</span>
                        <button onclick="setPkg('nmap','apt')" style="background:rgba(255,255,255,0.08); border:none; color:#00f0ff; padding:4px 8px; font-size:12px; border-radius:4px; cursor:pointer;">nmap</button>
                        <button onclick="setPkg('tcpdump','apt')" style="background:rgba(255,255,255,0.08); border:none; color:#00f0ff; padding:4px 8px; font-size:12px; border-radius:4px; cursor:pointer;">tcpdump</button>
                        <button onclick="setPkg('tshark','apt')" style="background:rgba(255,255,255,0.08); border:none; color:#00f0ff; padding:4px 8px; font-size:12px; border-radius:4px; cursor:pointer;">tshark</button>
                        <button onclick="setPkg('netcat-traditional','apt')" style="background:rgba(255,255,255,0.08); border:none; color:#00f0ff; padding:4px 8px; font-size:12px; border-radius:4px; cursor:pointer;">netcat</button>
                        <button onclick="setPkg('requests','pip')" style="background:rgba(255,255,255,0.08); border:none; color:#ff007f; padding:4px 8px; font-size:12px; border-radius:4px; cursor:pointer;">pip:requests</button>
                    </div>
                    <pre id="pkg-log" style="background:rgba(0,0,0,0.6); padding:10px; border-radius:6px; font-size:13px; color:#ffb700; max-height:160px; overflow-y:auto; border:1px solid rgba(255,183,0,0.2);">Standby for package installation.</pre>
                </div>
                <script>
                    function setPkg(n, t) { document.getElementById('pkg-name').value = n; document.getElementById('pkg-type').value = t; }
                    function installPkg() {
                        const pkg = document.getElementById('pkg-name').value.trim();
                        const type = document.getElementById('pkg-type').value;
                        const log = document.getElementById('pkg-log');
                        if (!pkg) return;
                        log.textContent = 'Installing ' + pkg + ' via ' + type.toUpperCase() + ' in Kali NetHunter...\\n(This may take a minute)\\n';

                        const b = (window.parent && window.parent.AndroidBridge) ? window.parent.AndroidBridge : (window.AndroidBridge || null);
                        if (b && b.installNetHunterPackage) {
                            const res = b.installNetHunterPackage(type, pkg);
                            log.textContent += res;
                        } else if (b && b.runShellCommand) {
                            const cmd = type === 'pip' ? ('pip install ' + pkg) : ('DEBIAN_FRONTEND=noninteractive apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y ' + pkg);
                            log.textContent += b.runShellCommand(cmd);
                        } else {
                            fetch('http://127.0.0.1:8765/api/install', {
                                method: 'POST',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({ package: pkg, type: type })
                            }).then(r => r.json()).then(d => {
                                log.textContent += d.log || (d.success ? 'Installation completed.' : 'Install failed.');
                            }).catch(e => {
                                log.textContent += 'Bridge connection error: ' + e;
                            });
                        }
                    }
                </script>
            `
        };
    }

    // 4. Quantum Scientific Calculator
    if (q.includes('calc') || q.includes('math')) {
        return {
            id: toolId,
            title: '🧮 HOLOGRAPHIC QUANTUM CALCULATOR',
            html: `
                <div style="max-width:280px; margin:0 auto; background:rgba(8,14,28,0.7); padding:12px; border-radius:8px; border:1px solid rgba(0,240,255,0.3); font-family:'JetBrains Mono',monospace;">
                    <input id="calc-disp" readonly value="0" style="width:100%; text-align:right; font-size:18px; padding:8px; margin-bottom:8px; background:rgba(0,0,0,0.6); color:#00f0ff; border:1px solid rgba(0,240,255,0.3); font-family:inherit; border-radius:4px;" />
                    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:4px;">
                        <button onclick="cClear()" style="background:#ff007f; color:#FFF; padding:8px; border-radius:4px; font-weight:bold; border:none; cursor:pointer;">C</button>
                        <button onclick="cOp('/')" style="background:rgba(0,240,255,0.15); color:#00f0ff; padding:8px; border-radius:4px; border:none; cursor:pointer;">/</button>
                        <button onclick="cOp('*')" style="background:rgba(0,240,255,0.15); color:#00f0ff; padding:8px; border-radius:4px; border:none; cursor:pointer;">*</button>
                        <button onclick="cOp('-')" style="background:rgba(0,240,255,0.15); color:#00f0ff; padding:8px; border-radius:4px; border:none; cursor:pointer;">-</button>
                        <button onclick="cNum('7')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px; border:none; cursor:pointer;">7</button>
                        <button onclick="cNum('8')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px; border:none; cursor:pointer;">8</button>
                        <button onclick="cNum('9')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px; border:none; cursor:pointer;">9</button>
                        <button onclick="cOp('+')" style="background:rgba(0,240,255,0.15); color:#00f0ff; padding:8px; border-radius:4px; border:none; cursor:pointer;">+</button>
                        <button onclick="cNum('4')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px; border:none; cursor:pointer;">4</button>
                        <button onclick="cNum('5')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px; border:none; cursor:pointer;">5</button>
                        <button onclick="cNum('6')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px; border:none; cursor:pointer;">6</button>
                        <button onclick="cCalc()" style="background:#00f0ff; color:#000; padding:8px; grid-row:span 2; font-weight:800; border-radius:4px; border:none; cursor:pointer;">=</button>
                        <button onclick="cNum('1')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px; border:none; cursor:pointer;">1</button>
                        <button onclick="cNum('2')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px; border:none; cursor:pointer;">2</button>
                        <button onclick="cNum('3')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px; border:none; cursor:pointer;">3</button>
                        <button onclick="cNum('0')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; grid-column:span 2; border-radius:4px; border:none; cursor:pointer;">0</button>
                        <button onclick="cNum('.')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px; border:none; cursor:pointer;">.</button>
                    </div>
                </div>
                <script>
                    const d = document.getElementById('calc-disp');
                    function cNum(n) { if (d.value === '0') d.value = n; else d.value += n; }
                    function cOp(o) { d.value += o; }
                    function cClear() { d.value = '0'; }
                    function cCalc() { try { d.value = Function('"use strict";return (' + d.value + ')')(); } catch(e) { d.value = 'Err'; } }
                </script>
            `
        };
    }

    // 5. Universal Dynamic Cyberdeck Tool & Script Runner
    const defaultCmd = q.includes('wifi') ? 'wifi scan' : (q.includes('ip') || q.includes('network') ? 'ifconfig' : 'uname -a && id && uptime');
    return {
        id: toolId,
        title: `⚡ ${query.toUpperCase().replace(/^\/SYNTH\s*/i, '').slice(0, 32)} // CYBERDECK RUNNER`,
        html: `
            <div style="background:rgba(2,5,14,0.9); border:1px solid #00f0ff; border-radius:6px; padding:12px; font-family:'JetBrains Mono',monospace;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="color:#00f0ff; font-weight:700; font-size:13px;">HOLOGRAPHIC TOOL RUNNER</span>
                    <span style="color:#00ff88; font-size:12px;">NETHUNTER ROOT // LIVE</span>
                </div>
                <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; margin-bottom:10px;">
                    <button onclick="setAndRun('wifi scan')" style="background:rgba(0,240,255,0.12); border:1px solid rgba(0,240,255,0.4); color:#00f0ff; padding:8px 4px; border-radius:4px; font-size:12px; font-weight:700; cursor:pointer;">📡 WI-FI</button>
                    <button onclick="setAndRun('ifconfig')" style="background:rgba(139,0,255,0.15); border:1px solid rgba(139,0,255,0.4); color:#d8b4fe; padding:8px 4px; border-radius:4px; font-size:12px; font-weight:700; cursor:pointer;">🌐 NET</button>
                    <button onclick="setAndRun('ping -c 3 8.8.8.8')" style="background:rgba(0,255,136,0.12); border:1px solid rgba(0,255,136,0.4); color:#00ff88; padding:8px 4px; border-radius:4px; font-size:12px; font-weight:700; cursor:pointer;">📶 PING</button>
                    <button onclick="setAndRun('free -m && df -h /')" style="background:rgba(255,183,0,0.12); border:1px solid rgba(255,183,0,0.4); color:#ffb700; padding:8px 4px; border-radius:4px; font-size:12px; font-weight:700; cursor:pointer;">📊 MEM</button>
                </div>
                <div style="display:flex; gap:8px; margin-bottom:10px;">
                    <input id="dyn-cmd" value="${escapeHtmlAttr(defaultCmd)}" style="flex:1; background:rgba(0,0,0,0.6); border:1px solid rgba(0,240,255,0.3); color:#fff; padding:8px 10px; font-size:13px; border-radius:6px; outline:none; font-family:inherit;" />
                    <button onclick="execDyn()" style="background:#00f0ff; color:#000; font-weight:800; border:none; padding:8px 14px; font-size:13px; border-radius:6px; cursor:pointer;">RUN</button>
                </div>
                <pre id="dyn-out" style="background:rgba(0,0,0,0.75); padding:10px; border-radius:6px; font-size:13px; color:#00ff88; max-height:170px; overflow-y:auto; border:1px solid rgba(0,240,255,0.25);">Ready for commands.</pre>
            </div>
            <script>
                function setAndRun(cmd) {
                    document.getElementById('dyn-cmd').value = cmd;
                    execDyn();
                }
                function execDyn() {
                    const c = document.getElementById('dyn-cmd').value.trim();
                    const out = document.getElementById('dyn-out');
                    if (!c) return;
                    out.textContent = 'Running: ' + c + '\\n...\\n';
                    const b = (window.parent && window.parent.AndroidBridge) ? window.parent.AndroidBridge : (window.AndroidBridge || null);
                    if (b && b.runShellCommand) {
                        out.textContent = b.runShellCommand(c) || '(Completed with no output)';
                    } else {
                        fetch('http://127.0.0.1:8765/api/exec', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({ cmd: c })
                        }).then(r => r.json()).then(d => {
                            out.textContent = d.output || d.stdout || ('Exit code: ' + d.exit_code);
                        }).catch(e => { out.textContent = 'Error: ' + e; });
                    }
                }
            </script>
        `
    };
}

// ===================== 8. EXTRACT HTML FROM AI =====================
function extractHtmlTool(text, userQuery = '') {
    if (!text) return { cleanText: text, toolObj: null };

    let rawHtml = '';
    let matchedBlock = null;

    // 1. Try explicit ```html ... ``` (with or without newline after tag)
    const htmlBlockRegex = /```(?:html|htm|xml|svg|webapp|ui)?\s*([\s\S]*?)```/gi;
    let bMatch;
    while ((bMatch = htmlBlockRegex.exec(text)) !== null) {
        const candidate = bMatch[1].trim();
        if (candidate.includes('<') && (
            candidate.includes('<!DOCTYPE') ||
            candidate.includes('<html') ||
            candidate.includes('<body') ||
            candidate.includes('<div') ||
            candidate.includes('<button') ||
            candidate.includes('<canvas') ||
            candidate.includes('<style') ||
            candidate.includes('<script') ||
            candidate.includes('<table') ||
            candidate.includes('<form')
        )) {
            rawHtml = candidate;
            matchedBlock = bMatch[0];
            break;
        }
    }

    // 2. Search for raw full HTML document not wrapped in code fences
    if (!rawHtml) {
        const docMatch = text.match(/(<!DOCTYPE\s+html[\s\S]*?<\/html>)/i) || text.match(/(<html[\s\S]*?<\/html>)/i);
        if (docMatch) {
            rawHtml = docMatch[1].trim();
            matchedBlock = docMatch[0];
        }
    }

    if (!rawHtml) return { cleanText: text, toolObj: null };

    // Clean out the raw HTML block so it does not render as a duplicate code block!
    let cleanText = matchedBlock ? text.replace(matchedBlock, '').trim() : text.replace(rawHtml, '').trim();
    if (!cleanText) {
        cleanText = "Synthesized application mounted below:";
    }

    // Determine smart descriptive title
    let title = '⚡ SYNTHESIZED TOOL';
    const q = (userQuery + ' ' + cleanText + ' ' + rawHtml.slice(0, 300)).toLowerCase();
    if (q.includes('calc') || q.includes('math')) title = '🧮 HOLOGRAPHIC CALCULATOR';
    else if (q.includes('kali') || q.includes('terminal') || q.includes('shell')) title = '💻 KALI CYBERDECK TERMINAL';
    else if (q.includes('command center') || q.includes('control phone') || q.includes('hardware hud')) title = '📱 ANDROID COMMAND CENTER';
    else if (q.includes('calendar')) title = '📅 QUANTUM CALENDAR';
    else if (q.includes('timer') || q.includes('clock') || q.includes('chronometer')) title = '⏱️ PRECISION CHRONOMETER';
    else if (q.includes('wifi') || q.includes('spectrum') || q.includes('network')) title = '📡 SPECTRUM & NETWORK TOOL';
    else if (q.includes('weather')) title = '🌤️ QUANTUM WEATHER STATION';
    else if (q.includes('diag') || q.includes('resource') || q.includes('monitor')) title = '📊 SYSTEM RESOURCE MONITOR';
    else if (q.includes('speedtest') || q.includes('bandwidth')) title = '🚀 NETWORK SPEED ANALYZER';
    else if (q.includes('port') || q.includes('scanner')) title = '🔍 PORT & SERVICE SCANNER';
    else if (userQuery) {
        const cleanQ = userQuery.replace(/^\/synth\w*\s*/i, '').replace(/\b(synthesize|synthazize|synthesise|build|create|make)\b/gi, '').trim();
        if (cleanQ) {
            title = `⚡ ${cleanQ.toUpperCase().slice(0, 30)} // SYNTHESIZED TOOL`;
        }
    }

    return {
        cleanText,
        toolObj: {
            id: 'dyn_' + Math.random().toString(36).substr(2, 9),
            title,
            html: rawHtml
        }
    };
}

// ===================== 9. AI PROVIDERS =====================
async function queryAIProvider(messages) {
    if (state.provider === 'gemini') {
        return await queryGemini(messages);
    } else if (state.provider === 'groq') {
        return await queryOpenAICompatible("https://api.groq.com/openai/v1/chat/completions", state.apiKey, messages);
    } else if (state.provider === 'openrouter') {
        return await queryOpenAICompatible("https://openrouter.ai/api/v1/chat/completions", state.apiKey, messages);
    } else if (state.provider === 'ollama') {
        const base = state.customUrl || "http://127.0.0.1:11434";
        return await queryOllama(base, messages);
    }
    throw new Error("Unsupported provider: " + state.provider);
}

async function queryGemini(messages) {
    const key = state.apiKey.trim();
    if (!key) throw new Error("Enter your Gemini API key in Routing & Settings.");

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent?key=${key}`;
    const sanitizedContents = [];
    let sysInstruction = null;

    for (const m of messages) {
        if (m.role === 'system') {
            sysInstruction = { parts: [{ text: m.content }] };
            continue;
        }
        const role = (m.role === 'model' || m.role === 'assistant') ? 'model' : 'user';
        if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === role) {
            sanitizedContents[sanitizedContents.length - 1].parts[0].text += "\n\n" + (m.content || "");
        } else {
            sanitizedContents.push({
                role: role,
                parts: [{ text: m.content || "" }]
            });
        }
    }

    // Ensure contents starts with 'user' for strict Gemini turn order
    if (sanitizedContents.length > 0 && sanitizedContents[0].role !== 'user') {
        sanitizedContents.unshift({ role: 'user', parts: [{ text: 'Initiating session.' }] });
    }

    const payload = { contents: sanitizedContents };
    if (sysInstruction) payload.systemInstruction = sysInstruction;

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = (errJson.error && errJson.error.message) ? errJson.error.message : `HTTP ${res.status}`;
        throw new Error(`Gemini: ${errMsg}`);
    }

    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
}

async function queryOpenAICompatible(url, key, messages) {
    const formatted = messages.map(m => ({
        role: (m.role === 'model' || m.role === 'assistant') ? 'assistant' : m.role,
        content: m.content || ''
    }));
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({ model: state.model, messages: formatted })
    });

    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
}

async function queryOllama(base, messages) {
    const formatted = messages.map(m => ({
        role: (m.role === 'model' || m.role === 'assistant') ? 'assistant' : m.role,
        content: m.content || ''
    }));
    const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: state.model, messages: formatted, stream: false })
    });

    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json();
    return data.message.content;
}

// ===================== 10. FORMATTING UTILITIES =====================
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeHtmlAttr(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatMarkdown(text) {
    if (!text) return '';

    // Code blocks with Run / Copy actions
    let html = escapeHtml(text).replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const cleanCode = code.trim();
        const jsonCode = JSON.stringify(cleanCode);
        const l = (lang || '').toLowerCase();
        const isShell = (l === 'bash' || l === 'sh' || l === 'shell');
        const isPython = (l === 'python' || l === 'py' || l === 'python3');
        let runBtn = '';
        if (isShell) {
            runBtn = `<button class="holo-term-btn" onclick="execQuick(${escapeHtmlAttr(jsonCode)})">▶ RUN IN KALI</button>`;
        } else if (isPython) {
            const pyCmd = JSON.stringify(`python3 -c ${JSON.stringify(cleanCode)}`);
            runBtn = `<button class="holo-term-btn" onclick="execQuick(${escapeHtmlAttr(pyCmd)})">▶ RUN PYTHON</button>`;
        }
        const copyBtn = `<button class="holo-term-btn" onclick="copyText(${escapeHtmlAttr(jsonCode)})">📋 COPY</button>`;

        return `<div class="holo-code-block" style="background:rgba(3,7,15,0.75); border:1px solid rgba(0,240,255,0.25); border-left:3px solid var(--neon-cyan); border-radius:6px; margin:10px 0; padding:10px; font-family:var(--font-code); font-size:13px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:12px; color:var(--neon-cyan);">
                <span>${escapeHtml(lang || 'code')}</span>
                <div style="display:flex; gap:8px;">${runBtn}${copyBtn}</div>
            </div>
            <pre style="margin:0; overflow-x:auto; color:#e2e8f0; white-space:pre-wrap; font-family:inherit; font-size:13px; line-height:1.45;">${cleanCode}</pre>
        </div>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="color:#00f0ff; background:rgba(0,240,255,0.1); padding:2px 8px; border-radius:4px; font-family:monospace; font-size:13.5px;">$1</code>');
    // Bold & italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Newlines
    html = html.replace(/\n/g, '<br>');

    return html;
}

// ===================== 11. KALI NETHUNTER TELEMETRY & TERMUX =====================
window.launchOrStartTermux = function() {
    Bridge.vibrate(30);
    if (Bridge.hasBridge() && window.AndroidBridge.startTermuxBridge) {
        const res = window.AndroidBridge.startTermuxBridge();
        Bridge.showToast(res);
        appendFreeNode("TERMUX // BRIDGE LAUNCH", `<div style="font-family:var(--font-code); font-size:13px; color:#00f0ff;">${escapeHtml(res)}<br>Checking bridge status...</div>`, "system");
        setTimeout(updateNetHunterPill, 3000);
    } else if (Bridge.hasBridge() && window.AndroidBridge.launchTermux) {
        window.AndroidBridge.launchTermux();
        Bridge.showToast("Opening Termux...");
    } else {
        appendFreeNode("TERMUX // INSTRUCTIONS", `<div style="font-family:var(--font-code); font-size:13px; color:#cbd5e1;">Open Termux and run:<br><code style="color:#00f0ff;">nh -r</code><br><code style="color:#00f0ff;">agentic bridge start</code></div>`, "system");
    }
};

window.inspectNetHunter = function() {
    Bridge.vibrate(30);
    const isOnline = Bridge.isNetHunterOnline();
    const rawStatus = Bridge.getNetHunterStatus();
    let statusObj = {};
    try { statusObj = JSON.parse(rawStatus); } catch (e) {}

    let content = '';
    if (isOnline) {
        const tools = statusObj.tools || {};
        const available = Object.keys(tools).filter(k => tools[k]).join(', ') || 'nmap, python3, curl, git, apt-get, pip';
        content = `
            <div style="font-family:var(--font-code); font-size:13px; line-height:1.6; color:#cbd5e1;">
                <div style="color:var(--neon-emerald); font-weight:700; margin-bottom:8px; font-size:13.5px;">✓ KALI NETHUNTER ROOT BRIDGE: ONLINE</div>
                <div><strong>Daemon:</strong> http://127.0.0.1:8765 (PID: ${statusObj.pid || 'Active'})</div>
                <div><strong>Privileges:</strong> ${escapeHtml(statusObj.user || 'root')} (UID: ${statusObj.uid !== undefined ? statusObj.uid : 0}) — Root Access: YES</div>
                <div><strong>Host System:</strong> ${escapeHtml(statusObj.os || 'Kali GNU/Linux Rolling')} (${escapeHtml(statusObj.platform || 'aarch64')})</div>
                <div><strong>Kernel:</strong> ${escapeHtml(statusObj.kernel || 'Linux')}</div>
                <div><strong>CLI Interface:</strong> <code>agentic</code> / <code>ae</code></div>
                <div><strong>Installed Tools:</strong> ${escapeHtml(available)}</div>
                <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
                    <button onclick="execQuick('whoami && id')" style="background:rgba(0,240,255,0.15); border:1px solid #00f0ff; color:#00f0ff; padding:6px 10px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">whoami</button>
                    <button onclick="execQuick('uname -a')" style="background:rgba(255,0,127,0.15); border:1px solid #ff007f; color:#ff007f; padding:6px 10px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">Kernel Info</button>
                    <button onclick="execQuick('agentic bridge status')" style="background:rgba(0,255,136,0.15); border:1px solid #00ff88; color:#00ff88; padding:6px 10px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">Bridge Info</button>
                    <button onclick="execQuick('wifi scan')" style="background:rgba(255,183,0,0.15); border:1px solid #ffb700; color:#ffb700; padding:6px 10px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer;">Scan Wi-Fi</button>
                </div>
            </div>
        `;
    } else {
        content = `
            <div style="font-family:var(--font-code); font-size:13px; line-height:1.6; color:#cbd5e1;">
                <div style="color:var(--neon-magenta); font-weight:700; margin-bottom:8px; font-size:13.5px;">⚠ KALI NETHUNTER BRIDGE: STANDBY / OFFLINE</div>
                <div style="margin-bottom:8px;">To connect this cyberdeck app directly to your Kali Linux NetHunter environment:</div>
                <ol style="margin-left:18px; margin-bottom:10px; line-height:1.55;">
                    <li>Tap the launch button below or open <strong>Termux</strong></li>
                    <li>Launch NetHunter root: <code>nh -r</code></li>
                    <li>Start the background bridge: <code>agentic bridge start</code></li>
                </ol>
                <div style="margin-top:10px; display:flex; gap:10px;">
                    <button onclick="launchOrStartTermux()" style="background:rgba(0,255,136,0.2); border:1px solid #00ff88; color:#00ff88; padding:8px 14px; border-radius:6px; font-size:12.5px; font-weight:700; cursor:pointer;">🚀 Launch Termux / Start Bridge</button>
                    <button onclick="execQuick('whoami')" style="background:rgba(0,240,255,0.15); border:1px solid #00f0ff; color:#00f0ff; padding:8px 12px; border-radius:6px; font-size:12.5px; font-weight:600; cursor:pointer;">Test Shell</button>
                </div>
                <div style="font-size:12px; color:#64748b; margin-top:8px;">(Local Android shell and direct su root execution will still operate)</div>
            </div>
        `;
    }
    appendFreeNode("NETHUNTER // BRIDGE TELEMETRY", content, "system");
    updateNetHunterPill();
};

window.updateNetHunterPill = function() {
    const pill = document.getElementById('nh-bridge-pill');
    const pillText = document.getElementById('nh-pill-text');
    const drawerStatus = document.getElementById('nh-drawer-status');
    const isOnline = Bridge.isNetHunterOnline();

    if (pillText) {
        pillText.textContent = isOnline ? "NH: ROOT" : "NH: STANDBY";
    }
    if (pill) {
        if (isOnline) {
            pill.className = "hud-pill-btn neon-emerald";
            pill.title = "Kali NetHunter Root Bridge: ONLINE (127.0.0.1:8765)";
        } else {
            pill.className = "hud-pill-btn neon-magenta";
            pill.title = "Kali NetHunter Bridge: STANDBY (Run 'agentic bridge start' in nh -r)";
        }
    }
    if (drawerStatus) {
        drawerStatus.textContent = isOnline ? "ONLINE (ROOT)" : "STANDBY";
        drawerStatus.style.color = isOnline ? "var(--neon-emerald)" : "var(--neon-magenta)";
    }
};

// ============================================================================
// 1. KNUTH IN-MEMORY TRIE SEARCH & LRU TOOL CACHE ENGINE
// ============================================================================
class ToolTrieNode {
    constructor() {
        this.children = {};
        this.isWord = false;
        this.data = null;
    }
}

class ToolTrieSearch {
    constructor() {
        this.root = new ToolTrieNode();
    }

    insert(phrase, payload) {
        if (!phrase) return;
        const words = phrase.toLowerCase().trim().split(/\s+/);
        for (let i = 0; i < words.length; i++) {
            const sub = words.slice(i).join(' ');
            let curr = this.root;
            for (const ch of sub) {
                if (!curr.children[ch]) curr.children[ch] = new ToolTrieNode();
                curr = curr.children[ch];
            }
            curr.isWord = true;
            curr.data = payload;
        }
    }

    searchPrefix(prefix, limit = 8) {
        if (!prefix) return [];
        let curr = this.root;
        for (const ch of prefix.toLowerCase().trim()) {
            if (!curr.children[ch]) return [];
            curr = curr.children[ch];
        }
        const results = [];
        const dfs = (node) => {
            if (results.length >= limit) return;
            if (node.isWord && node.data) {
                if (!results.some(r => (r.id && r.id === node.data.id) || r.title === node.data.title)) {
                    results.push(node.data);
                }
            }
            for (const k in node.children) {
                dfs(node.children[k]);
            }
        };
        dfs(curr);
        return results;
    }
}

class ToolLRUCache {
    constructor(maxCapacity = 50) {
        this.maxCapacity = maxCapacity;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) return null;
        const val = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, val);
        return val;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxCapacity) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        this.cache.set(key, value);
    }

    has(key) {
        return this.cache.has(key);
    }

    clear() {
        this.cache.clear();
    }
}

const toolLRU = new ToolLRUCache(50);
const toolTrie = new ToolTrieSearch();
window.toolLRU = toolLRU;
window.toolTrie = toolTrie;

function populateTrieFromStoredTools() {
    toolTrie.insert("NetHunter Status", { id: "nh_status", title: "NetHunter Status", action: "inspectNetHunter()" });
    toolTrie.insert("Wi-Fi Scan", { id: "wifi_scan", title: "Wi-Fi Scan", action: "execQuick('wifi scan')" });
    toolTrie.insert("Host Identity", { id: "host_id", title: "Host Identity", action: "execQuick('whoami && uname -a')" });
    toolTrie.insert("Net Interfaces", { id: "ifconfig", title: "Net Interfaces", action: "execQuick('ifconfig')" });
    toolTrie.insert("Ping Test", { id: "ping_test", title: "Ping Test", action: "execQuick('ping -c 3 8.8.8.8')" });
    toolTrie.insert("Synth Tool", { id: "synth_tool", title: "Synth Tool", action: "execQuick('/synth Wi-Fi signal analyzer')" });
    
    if (state.savedTools && Array.isArray(state.savedTools)) {
        state.savedTools.forEach(t => {
            toolTrie.insert(t.title, t);
            toolLRU.put(t.id || t.title, t);
        });
    }
}
window.populateTrieFromStoredTools = populateTrieFromStoredTools;

// ============================================================================
// 2. TURING DETERMINISTIC TOOL DAG & AST SANDBOX VALIDATOR
// ============================================================================
class ToolExecutionDAG {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
    }

    addNode(id, actionFn) {
        this.nodes.set(id, actionFn);
        if (!this.edges.has(id)) this.edges.set(id, new Set());
    }

    addDependency(fromId, toId) {
        if (!this.edges.has(fromId)) this.edges.set(fromId, new Set());
        this.edges.get(fromId).add(toId);
    }

    hasCycles() {
        const visited = new Set();
        const recStack = new Set();

        const dfs = (curr) => {
            visited.add(curr);
            recStack.add(curr);
            const neighbors = this.edges.get(curr) || [];
            for (const n of neighbors) {
                if (!visited.has(n) && dfs(n)) return true;
                if (recStack.has(n)) return true;
            }
            recStack.delete(curr);
            return false;
        };

        for (const node of this.nodes.keys()) {
            if (!visited.has(node) && dfs(node)) return true;
        }
        return false;
    }
}
window.ToolExecutionDAG = ToolExecutionDAG;

class WidgetSandboxValidator {
    static validate(htmlCode) {
        if (!htmlCode || typeof htmlCode !== 'string') return { valid: false, error: 'Empty payload' };
        
        // 1. Detect non-yielding infinite loops
        const infiniteLoopRegex = /\b(?:while\s*\(\s*(?:true|1)\s*\)|for\s*\(\s*;\s*;\s*\))\s*\{(?![^}]*\b(break|return|await|setTimeout|requestAnimationFrame)\b)/i;
        if (infiniteLoopRegex.test(htmlCode)) {
            return { valid: false, error: 'Detected potential non-terminating loop without yield.' };
        }

        // 2. Detect unauthorized top-level location overrides
        const dangerousRedirects = [
            /window\.top\.location/i,
            /window\.parent\.location/i,
            /top\.location\s*=/i
        ];
        for (const pattern of dangerousRedirects) {
            if (pattern.test(htmlCode)) {
                return { valid: false, error: 'Top-level frame redirection blocked by sandbox security policy.' };
            }
        }

        return { valid: true };
    }

    static injectWatchdog(htmlCode) {
        const watchdogScript = `<script>
            (function() {
                var __mountTime = Date.now();
                window.addEventListener('error', function(e) {
                    console.warn('[Tool Sandbox Exception]', e.message);
                });
                var __watchdog = setTimeout(function() {
                    // Tool mounted cleanly and reached interactive state
                }, 8000);
            })();
        <\/script>`;

        if (htmlCode.includes('</head>')) {
            return htmlCode.replace('</head>', `${watchdogScript}</head>`);
        } else if (htmlCode.includes('<head>')) {
            return htmlCode.replace('<head>', `<head>${watchdogScript}`);
        }
        return watchdogScript + htmlCode;
    }
}
window.WidgetSandboxValidator = WidgetSandboxValidator;

// ============================================================================
// 3. SWARM ASYNCHRONOUS TELEMETRY & PERSISTENT SESSION ENGINE
// ============================================================================
class TelemetryStreamManager {
    constructor() {
        this.currentTelemetry = {
            status: "standby",
            os: "Kali NetHunter",
            user: "root",
            uid: 0,
            pingMs: null,
            lastPoll: 0
        };
        this.pollInterval = null;
    }

    start(intervalMs = 4000) {
        if (this.pollInterval) clearInterval(this.pollInterval);
        this.fetchTelemetry();
        this.pollInterval = setInterval(() => this.fetchTelemetry(), intervalMs);
    }

    stop() {
        if (this.pollInterval) clearInterval(this.pollInterval);
        this.pollInterval = null;
    }

    async fetchTelemetry() {
        const start = performance.now();
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2500);
            const res = await fetch('http://127.0.0.1:8765/api/status', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                this.currentTelemetry.status = "online";
                this.currentTelemetry.pingMs = Math.round(performance.now() - start);
                this.currentTelemetry.lastPoll = Date.now();
                this.currentTelemetry.os = data.os || "Kali NetHunter";
                this.currentTelemetry.user = data.user || "root";
                this.currentTelemetry.uid = data.uid !== undefined ? data.uid : 0;
                this.updateHUD(true);
                return;
            }
        } catch (e) {}

        this.currentTelemetry.status = "standby";
        this.currentTelemetry.pingMs = null;
        this.updateHUD(false);
    }

    updateHUD(isOnline) {
        const pill = document.getElementById('nh-bridge-pill');
        const text = document.getElementById('nh-pill-text');
        const drawerStatus = document.getElementById('nh-drawer-status');
        
        if (pill) {
            pill.className = isOnline ? "hud-pill-btn neon-emerald" : "hud-pill-btn neon-magenta";
            pill.title = isOnline 
                ? `Kali NetHunter Root: ONLINE (${this.currentTelemetry.pingMs || 1}ms latency)` 
                : "Kali NetHunter Bridge: STANDBY";
        }
        if (text) {
            text.textContent = isOnline ? "NH: ROOT" : "NH: STANDBY";
        }
        if (drawerStatus) {
            drawerStatus.textContent = isOnline ? `ONLINE (ROOT • ${this.currentTelemetry.pingMs || 1}ms)` : "STANDBY";
            drawerStatus.style.color = isOnline ? "var(--neon-emerald)" : "var(--neon-magenta)";
        }
    }
}

const telemetry = new TelemetryStreamManager();
window.telemetry = telemetry;

class SessionStateManager {
    static exportConfig() {
        const payload = {
            version: "5.0.0",
            timestamp: new Date().toISOString(),
            settings: {
                persona: state.persona,
                provider: state.provider,
                model: state.model,
                customUrl: state.customUrl,
                ttsEnabled: state.ttsEnabled,
                hapticsEnabled: state.hapticsEnabled
            },
            savedTools: state.savedTools
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `agentic-essence-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        Bridge.showToast("Cyberdeck configuration exported.");
    }

    static importConfig(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.savedTools && Array.isArray(data.savedTools)) {
                state.savedTools = data.savedTools;
                localStorage.setItem('ae_saved_tools', JSON.stringify(state.savedTools));
                updateToolboxBadge();
                renderSavedToolsList();
                populateTrieFromStoredTools();
            }
            if (data.settings) {
                if (data.settings.persona) {
                    state.persona = data.settings.persona;
                    localStorage.setItem('ae_persona', state.persona);
                }
                if (data.settings.provider) {
                    state.provider = data.settings.provider;
                    localStorage.setItem('ae_provider', state.provider);
                }
                if (data.settings.model) {
                    state.model = data.settings.model;
                    localStorage.setItem('ae_model', state.model);
                }
            }
            Bridge.showToast("Configuration restored successfully.");
            Bridge.vibrate(40);
        } catch (e) {
            Bridge.showToast("Invalid configuration file.");
        }
    }
}
window.SessionStateManager = SessionStateManager;

// ============================================================================
// 4. LOVELACE SENSORY & HAPTIC HARMONY ENGINE
// ============================================================================
class LovelaceSensorySystem {
    static pulse(mode = 'harmonic') {
        const universe = document.querySelector('.holographic-universe');
        if (!universe) return;

        universe.classList.remove('sensory-harmonic', 'sensory-alert', 'sensory-quantum');
        void universe.offsetWidth; // Force reflow
        
        if (mode === 'harmonic') {
            universe.classList.add('sensory-harmonic');
            if (state.hapticsEnabled) Bridge.vibrate(20);
        } else if (mode === 'alert') {
            universe.classList.add('sensory-alert');
            if (state.hapticsEnabled) Bridge.vibrate(60);
        } else if (mode === 'quantum') {
            universe.classList.add('sensory-quantum');
            if (state.hapticsEnabled) Bridge.vibrate(35);
        }
    }
}
window.LovelaceSensorySystem = LovelaceSensorySystem;
