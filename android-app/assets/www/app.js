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

const PERSONAS = {
    swarm: {
        name: "Agentic Swarm",
        avatar: "✦",
        tag: "SWARM // QUANTUM NEURAL CORE",
        color: "cyan",
        prompt: `You are Agentic Swarm, an elite AI assistant and dynamic tool synthesizer.
Keep all responses strictly straightforward, concise, and direct with zero extra fluff.
When asked to build, spawn, or create an interactive tool, widget, calculator, or Kali terminal:
Output ONLY 1 short confirmation sentence followed immediately by the self-contained HTML5/CSS/JS application inside a single \`\`\`html ... \`\`\` code block.`
    },
    turing: {
        name: "Alan Turing",
        avatar: "🧠",
        tag: "TURING // ALGORITHMIC LOGIC",
        color: "magenta",
        prompt: `You are Alan Turing. You approach problems with structural clarity, logic, and precision.
Keep responses straightforward and concise with zero fluff.
When asked to synthesize an interactive tool, provide 1 short sentence followed by the complete HTML in a single \`\`\`html ... \`\`\` block.`
    },
    knuth: {
        name: "Donald Knuth",
        avatar: "⚡",
        tag: "KNUTH // CRAFTSMANSHIP & CODE",
        color: "gold",
        prompt: `You are Donald Knuth, master software craftsman. You specialize in algorithms, data structures, and clean code.
Keep responses straightforward, practical, and direct with zero extra fluff.
When asked to build an interactive tool, provide 1 short sentence followed by the complete HTML in a single \`\`\`html ... \`\`\` block.`
    },
    lovelace: {
        name: "Ada Lovelace",
        avatar: "🔬",
        tag: "LOVELACE // POETICAL SCIENCE",
        color: "emerald",
        prompt: `You are Ada Lovelace. You view challenges through analytical rigor and elegant synthesis.
Keep responses straightforward, direct, and concise with zero extra fluff.
When asked to build an interactive tool, provide 1 short sentence followed by the complete HTML in a single \`\`\`html ... \`\`\` block.`
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
        return null;
    },
    scanWifiNetworks() {
        if (this.hasBridge() && window.AndroidBridge.scanWifiNetworks) {
            return window.AndroidBridge.scanWifiNetworks();
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
        const shellRes = executeShellOrMock(text);
        const terminalHtml = `<div class="holo-terminal-stream">${escapeHtml(shellRes)}</div>`;
        appendFreeNode("TERMINAL // SHELL STDOUT", terminalHtml, "system");
        state.history.push({ role: 'assistant', content: shellRes });
        Bridge.speak("Command executed");
        return;
    }

    // 3. Tool Synthesis Intent
    if (isToolSynthesisIntent(text)) {
        const tool = synthesizeToolFromScratch(text);
        const cardHtml = mountToolCard(tool, false);
        appendFreeNode(
            currentPersona.tag,
            `Synthesized <strong>${tool.title}</strong>:${cardHtml}`,
            "assistant"
        );
        state.history.push({ role: 'assistant', content: `[Synthesized and mounted: ${tool.title}]` });
        Bridge.speak(`Synthesized ${tool.title}`);
        return;
    }

    // 4. Live AI Query
    const hasAIConfig = !!state.apiKey || state.provider === 'ollama';
    if (!hasAIConfig) {
        appendFreeNode(
            "SYSTEM // SETUP NOTICE",
            `No API key configured for live intelligence. Swipe from the left to open <strong>Routing &amp; Settings</strong> and enter your Gemini key.`,
            "system"
        );
        return;
    }

    try {
        const isFollowUp = state.history.filter(h => h.role === 'assistant').length >= 1;
        const systemPrompt = currentPersona.prompt + (isFollowUp
            ? "\n\nCRITICAL CONCISENESS RULE: Keep all responses strictly straightforward, direct, and concise with zero extra fluff."
            : "");

        const messages = [
            { role: 'system', content: systemPrompt },
            ...state.history.slice(-8)
        ];

        const rawReply = await queryAIProvider(messages);
        const { cleanText, toolObj } = extractHtmlTool(rawReply, text);

        let contentHtml = formatMarkdown(cleanText);
        if (toolObj) {
            contentHtml += mountToolCard(toolObj, false);
        }

        appendFreeNode(currentPersona.tag, contentHtml, "assistant");
        state.history.push({ role: 'assistant', content: rawReply });
        Bridge.speak(cleanText);

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

// ===================== 4. SHELL COMMAND EXECUTION =====================
function isDirectShellCommand(raw) {
    const clean = raw.trim().toLowerCase();
    const parts = clean.split(' ');
    const first = parts[0];
    const cmds = ['wifi', 'iwlist', 'ifconfig', 'ip', 'ping', 'uname', 'uptime', 'whoami', 'id', 'pwd', 'date', 'ps', 'df', 'free', 'ls', 'netstat', 'battery', 'torch', 'nmap'];
    return cmds.includes(first) || clean.includes('wifi scan') || clean.includes('scan wifi');
}

function executeShellOrMock(rawCmd) {
    const trimmed = rawCmd.trim();
    const lower = trimmed.toLowerCase();

    // Query Native Android Bridge
    const bridgeOut = Bridge.runShellCommand(trimmed);
    if (bridgeOut !== null && bridgeOut !== undefined && bridgeOut !== '') {
        return bridgeOut;
    }

    // Mock outputs for desktop / non-bridge browser previews
    if (lower.includes('wifi') && (lower.includes('scan') || lower.includes('iwlist'))) {
        return "BSSID              PWR  CH  SECURITY           ESSID\n" +
               "-----------------  ---  --  -----------------  --------------------\n" +
               "E8:48:B8:3A:91:20  -42   6  [WPA2-PSK-CCMP]    Cyberdeck-Mesh-5G\n" +
               "F0:9F:C2:7B:14:8A  -58  11  [WPA2-PSK-CCMP]    Quantum_IoT_Node\n" +
               "74:DA:38:D9:E0:41  -65   1  [WPA2-PSK-CCMP]    Guest-HighSpeed\n" +
               "9C:C9:EB:12:F3:D5  -71  36  [WPA3-SAE-CCMP]    SpectrumSetup-92\n" +
               "[*] Hardware scan complete: 4 BSSID nodes acquired.";
    }

    if (lower.startsWith('ifconfig') || lower.startsWith('ip')) {
        return "wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST> mtu 1500\n" +
               "        inet 192.168.1.104  netmask 255.255.255.0  broadcast 192.168.1.255\n" +
               "        inet6 fe80::a12:beef:cafe:0001  prefixlen 64\n" +
               "lo: flags=73<UP,LOOPBACK,RUNNING> mtu 65536\n" +
               "        inet 127.0.0.1  netmask 255.0.0.0";
    }

    if (lower === 'battery') return "Battery Level: 88%\nStatus: Discharging // Health: Good // Temp: 28.4°C";
    if (lower === 'whoami') return "root";
    if (lower === 'id') return "uid=0(root) gid=0(root) groups=0(root)";
    if (lower.startsWith('uname')) return "Linux kali-cyberdeck 6.6.0-kali-arm64 #1 SMP PREEMPT aarch64 GNU/Linux";
    if (lower === 'pwd') return "/root/cyberdeck";
    if (lower.startsWith('ls')) return "bin/  core/  hardware/  recon/  scripts/  synthesized/  toolbox/  report.md";
    if (lower.startsWith('ps')) return "  PID TTY          TIME CMD\n    1 ?        00:00:02 init\n  482 ?        00:00:01 adbd\n 1204 ?        00:00:05 agentic-core";

    return `bash: ${trimmed}: command executed (exit code 0)`;
}

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
function isToolSynthesisIntent(text) {
    const l = text.toLowerCase();
    return l.includes('build') || l.includes('create') || l.includes('spawn') ||
           l.includes('make a') || l.includes('synthesize') || l.includes('calculator') ||
           l.includes('calendar') || l.includes('timer') || l.includes('command center') ||
           l.includes('control phone') || l.includes('kali') || l.includes('terminal');
}

/**
 * Mounts an interactive tool inside a free-floating container with cyber brackets (NO SOLID BOX).
 */
function mountToolCard(toolObj, isSaved = false) {
    const containerId = 'tool_' + toolObj.id;
    const iframeId = 'frame_' + toolObj.id;
    const toolJsonEscaped = encodeURIComponent(JSON.stringify(toolObj));

    let completeDoc = toolObj.html;
    if (!completeDoc.includes('<!DOCTYPE html>')) {
        completeDoc = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        body { background: transparent; color: #ededed; padding: 8px; font-size: 12px; }
        button { cursor: pointer; border-radius: 4px; border: none; font-weight: 600; font-size: 11.5px; }
        input, select { background: rgba(16, 24, 40, 0.7); color: #FFF; border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 4px; padding: 6px; font-size: 11.5px; outline: none; }
    </style>
</head>
<body>
    ${toolObj.html}
</body>
</html>`;
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
            <iframe id="${iframeId}" class="floating-tool-iframe" sandbox="allow-scripts allow-forms allow-same-origin allow-modals" srcdoc="${escapeHtmlAttr(completeDoc)}"></iframe>
        </div>
    `;
}

window.saveCustomTool = function(toolJsonEscaped, id) {
    try {
        const tool = JSON.parse(decodeURIComponent(toolJsonEscaped));
        if (!state.savedTools.some(t => t.title === tool.title)) {
            state.savedTools.push(tool);
            localStorage.setItem('ae_saved_tools', JSON.stringify(state.savedTools));
            updateToolboxBadge();
            renderSavedToolsList();
            Bridge.showToast(`Saved: ${tool.title}`);
            Bridge.vibrate(30);
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

    // Android Command Center
    if (q.includes('command center') || q.includes('control phone') || q.includes('phone control')) {
        return {
            id: toolId,
            title: '📱 ANDROID COMMAND CENTER // HARDWARE HUD',
            html: `
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <div style="display:flex; justify-content:space-between; background:rgba(0,240,255,0.06); padding:8px 10px; border-radius:6px; border:1px solid rgba(0,240,255,0.25);">
                        <span>SYSTEM: <strong style="color:#00f0ff;">ONLINE</strong></span>
                        <span>LINK: <strong style="color:#ff007f;">HARDWARE BRIDGE</strong></span>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px;">
                        <button onclick="scanWifi()" style="background:rgba(0,240,255,0.15); border:1px solid #00f0ff; color:#00f0ff; padding:8px 4px; border-radius:4px; font-weight:700;">📡 WI-FI</button>
                        <button onclick="toggleTorch()" style="background:rgba(255,183,0,0.15); border:1px solid #ffb700; color:#ffb700; padding:8px 4px; border-radius:4px; font-weight:700;">🔦 TORCH</button>
                        <button onclick="vibe()" style="background:rgba(255,0,127,0.15); border:1px solid #ff007f; color:#ff007f; padding:8px 4px; border-radius:4px; font-weight:700;">📳 HAPTIC</button>
                    </div>
                    <div id="cc-log" style="background:rgba(0,0,0,0.5); border:1px solid rgba(0,240,255,0.2); border-radius:4px; padding:6px; font-size:10.5px; color:#00f0ff; min-height:36px; white-space:pre-wrap; font-family:monospace;">Standby.</div>
                </div>
                <script>
                    function log(m) { document.getElementById('cc-log').textContent = '> ' + m; }
                    function getB() { return (window.parent && window.parent.AndroidBridge) ? window.parent.AndroidBridge : null; }
                    function scanWifi() {
                        log('Scanning local RF spectrum...');
                        const b = getB();
                        if (b && b.scanWifiNetworks) { log(b.scanWifiNetworks()); }
                        else { log('Acquired 4 APs: Cyberdeck-Mesh-5G (-42dBm), Quantum_IoT (-58dBm)'); }
                    }
                    function toggleTorch() {
                        const b = getB();
                        if (b && b.toggleFlashlight) { b.toggleFlashlight(true); log('Torch active.'); }
                        else { log('Torch toggled.'); }
                    }
                    function vibe() {
                        const b = getB();
                        if (b && b.vibrate) b.vibrate(60);
                        log('Haptic pulse sent.');
                    }
                </script>
            `
        };
    }

    // Kali Linux Terminal
    if (q.includes('kali') || q.includes('terminal') || q.includes('command line') || q.includes('shell')) {
        return {
            id: toolId,
            title: '💻 KALI LINUX CYBERDECK SHELL',
            html: `
                <div style="background:rgba(2,5,12,0.6); border:1px solid rgba(0,240,255,0.25); border-radius:6px; overflow:hidden; font-family:monospace;">
                    <div id="t-out" style="height:150px; overflow-y:auto; padding:8px; font-size:11px; color:#00f0ff; white-space:pre-wrap; line-height:1.4;">Linux kali-cyberdeck 6.6.0-kali-arm64\nCommands available: wifi scan, ifconfig, ps, ls, ping, battery...</div>
                    <div style="display:flex; gap:4px; padding:6px; background:rgba(10,18,36,0.6); border-top:1px solid rgba(0,240,255,0.2);">
                        <input id="t-in" placeholder="Execute command..." style="flex:1; background:transparent; border:none; color:#FFF; font-family:monospace; font-size:11px; outline:none;" />
                        <button onclick="runCmd()" style="background:linear-gradient(90deg, #00f0ff, #ff007f); color:#000; padding:4px 12px; font-size:11px; font-weight:800; border-radius:4px;">RUN</button>
                    </div>
                </div>
                <script>
                    const out = document.getElementById('t-out');
                    const inp = document.getElementById('t-in');
                    function runCmd() {
                        const c = inp.value.trim();
                        if (!c) return;
                        inp.value = '';
                        out.textContent += '\\n# ' + c + '\\n';
                        const b = (window.parent && window.parent.AndroidBridge) ? window.parent.AndroidBridge : null;
                        if (b && b.runShellCommand) {
                            out.textContent += b.runShellCommand(c) + '\\n';
                        } else {
                            out.textContent += '[Simulated Output for: ' + c + ']\\n';
                        }
                        out.scrollTop = out.scrollHeight;
                    }
                    inp.addEventListener('keydown', e => { if (e.key === 'Enter') runCmd(); });
                </script>
            `
        };
    }

    // Holographic Calculator
    if (q.includes('calc') || q.includes('math')) {
        return {
            id: toolId,
            title: '🧮 HOLOGRAPHIC QUANTUM CALCULATOR',
            html: `
                <div style="max-width:260px; margin:0 auto; background:rgba(8,14,28,0.6); padding:10px; border-radius:8px; border:1px solid rgba(0,240,255,0.3);">
                    <input id="calc-disp" readonly value="0" style="width:100%; text-align:right; font-size:18px; padding:8px; margin-bottom:8px; background:rgba(0,0,0,0.5); color:#00f0ff; border:1px solid rgba(0,240,255,0.25); font-family:monospace;" />
                    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:4px;">
                        <button onclick="cClear()" style="background:#ff007f; color:#FFF; padding:8px; border-radius:4px;">C</button>
                        <button onclick="cOp('/')" style="background:rgba(0,240,255,0.15); color:#00f0ff; padding:8px; border-radius:4px;">/</button>
                        <button onclick="cOp('*')" style="background:rgba(0,240,255,0.15); color:#00f0ff; padding:8px; border-radius:4px;">*</button>
                        <button onclick="cOp('-')" style="background:rgba(0,240,255,0.15); color:#00f0ff; padding:8px; border-radius:4px;">-</button>
                        <button onclick="cNum('7')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px;">7</button>
                        <button onclick="cNum('8')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px;">8</button>
                        <button onclick="cNum('9')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px;">9</button>
                        <button onclick="cOp('+')" style="background:rgba(0,240,255,0.15); color:#00f0ff; padding:8px; border-radius:4px;">+</button>
                        <button onclick="cNum('4')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px;">4</button>
                        <button onclick="cNum('5')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px;">5</button>
                        <button onclick="cNum('6')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px;">6</button>
                        <button onclick="cCalc()" style="background:#00f0ff; color:#000; padding:8px; grid-row:span 2; font-weight:800; border-radius:4px;">=</button>
                        <button onclick="cNum('1')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px;">1</button>
                        <button onclick="cNum('2')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px;">2</button>
                        <button onclick="cNum('3')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px;">3</button>
                        <button onclick="cNum('0')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; grid-column:span 2; border-radius:4px;">0</button>
                        <button onclick="cNum('.')" style="background:rgba(255,255,255,0.06); color:#FFF; padding:8px; border-radius:4px;">.</button>
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

    return {
        id: toolId,
        title: '⚡ HOLOGRAPHIC INTERACTIVE APPLICATION',
        html: `<div style="text-align:center; padding:20px; color:#00f0ff;"><h3>SYNTHESIZED APPLICATION</h3><p style="margin-top:8px; color:#e2e8f0;">Running in transparent sandbox.</p></div>`
    };
}

// ===================== 8. EXTRACT HTML FROM AI =====================
function extractHtmlTool(text, userQuery = '') {
    if (!text) return { cleanText: text, toolObj: null };

    let rawHtml = '';
    let match = text.match(/```(?:html|htm|xml)?\s*\n([\s\S]*?)```/i);
    if (match) rawHtml = match[1].trim();

    if (!rawHtml) {
        const docMatch = text.match(/(<!DOCTYPE html[\s\S]*?<\/html>)/i);
        if (docMatch) rawHtml = docMatch[1].trim();
    }

    if (!rawHtml) return { cleanText: text, toolObj: null };

    let cleanText = match ? text.replace(match[0], '').trim() : text.replace(rawHtml, '').trim();
    if (!cleanText) {
        cleanText = "Synthesized application:";
    } else if (cleanText.length > 180) {
        const firstSentence = cleanText.split(/\.\s+|\n+/)[0].trim();
        cleanText = firstSentence ? (firstSentence.endsWith('.') ? firstSentence : firstSentence + '.') : "Synthesized application:";
    }

    let title = '⚡ SYNTHESIZED TOOL';
    const q = (userQuery + ' ' + cleanText).toLowerCase();
    if (q.includes('calc')) title = '🧮 HOLOGRAPHIC CALCULATOR';
    else if (q.includes('kali') || q.includes('terminal')) title = '💻 KALI CYBERDECK TERMINAL';
    else if (q.includes('command center') || q.includes('control phone')) title = '📱 ANDROID COMMAND CENTER';
    else if (q.includes('calendar')) title = '📅 QUANTUM CALENDAR';
    else if (q.includes('timer')) title = '⏱️ PRECISION CHRONOMETER';

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
    const contents = [];
    let sysInstruction = null;

    for (const m of messages) {
        if (m.role === 'system') {
            sysInstruction = { parts: [{ text: m.content }] };
        } else {
            contents.push({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            });
        }
    }

    const payload = { contents };
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
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({ model: state.model, messages })
    });

    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
}

async function queryOllama(base, messages) {
    const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: state.model, messages, stream: false })
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
    return escapeHtml(text)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code style="color:#00f0ff; background:rgba(0,240,255,0.08); padding:2px 6px; border-radius:3px; font-family:monospace;">$1</code>')
        .replace(/\n/g, '<br>');
}
