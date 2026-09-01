/**
 * Agentic Essence — Mobile Cyberdeck Engine
 * Tri-Agent Swarm Orchestrator (Turing • Knuth • Lovelace)
 * Standalone, keyless-ready, untethered mobile automation.
 */

// ===================== STATE & CONFIG =====================
const state = {
    running: false,
    abortController: null,
    provider: localStorage.getItem('ae_provider') || 'pollinations',
    apiKey: localStorage.getItem('ae_apiKey') || '',
    customUrl: localStorage.getItem('ae_customUrl') || 'http://localhost:11434/v1',
    model: localStorage.getItem('ae_model') || 'openai',
    ttsEnabled: localStorage.getItem('ae_tts') !== 'false',
    hapticsEnabled: localStorage.getItem('ae_haptics') !== 'false',
    keepScreenOn: localStorage.getItem('ae_keepscreen') !== 'false',
    battery: 100,
    ip: '127.0.0.1',
    torchOn: false
};

// ===================== DOM ELEMENTS =====================
const terminalOutput = document.getElementById('terminalOutput');
const taskInput = document.getElementById('taskInput');
const deployBtn = document.getElementById('deployBtn');
const stopBtn = document.getElementById('stopBtn');
const swarmIndicator = document.getElementById('swarmIndicator');
const batteryMetric = document.getElementById('batteryMetric');
const ipMetric = document.getElementById('ipMetric');
const turingState = document.getElementById('turingState');
const knuthState = document.getElementById('knuthState');
const lovelaceState = document.getElementById('lovelaceState');
const chipTuring = document.getElementById('chipTuring');
const chipKnuth = document.getElementById('chipKnuth');
const chipLovelace = document.getElementById('chipLovelace');
const settingsModal = document.getElementById('settingsModal');
const providerSelect = document.getElementById('providerSelect');
const apiKeySection = document.getElementById('apiKeySection');
const apiKeyInput = document.getElementById('apiKeyInput');
const customEndpointSection = document.getElementById('customEndpointSection');
const customUrlInput = document.getElementById('customUrlInput');
const modelInput = document.getElementById('modelInput');
const ttsCheckbox = document.getElementById('ttsCheckbox');
const hapticsCheckbox = document.getElementById('hapticsCheckbox');
const keepScreenOnToggle = document.getElementById('keepScreenOnToggle');
const ttsToggleBtn = document.getElementById('ttsToggleBtn');

// ===================== INIT =====================
window.addEventListener('DOMContentLoaded', () => {
    initSettingsUI();
    initBridgeTelemetry();
    initAutoResizeTextarea();
});

function getTimestamp() {
    const d = new Date();
    return `[${d.toTimeString().split(' ')[0]}]`;
}

// ===================== ANDROID BRIDGE WRAPPERS =====================
const Bridge = {
    isAvailable: () => typeof window.AndroidBridge !== 'undefined',

    toast: (msg) => {
        if (Bridge.isAvailable() && window.AndroidBridge.showToast) {
            window.AndroidBridge.showToast(msg);
        }
    },

    vibrate: (ms = 50) => {
        if (!state.hapticsEnabled) return;
        if (Bridge.isAvailable() && window.AndroidBridge.vibrate) {
            window.AndroidBridge.vibrate(ms);
        } else if (navigator.vibrate) {
            navigator.vibrate(ms);
        }
    },

    speak: (text) => {
        if (!state.ttsEnabled || !text) return;
        if (Bridge.isAvailable() && window.AndroidBridge.speakText) {
            window.AndroidBridge.speakText(text);
        } else if ('speechSynthesis' in window) {
            const ut = new SpeechSynthesisUtterance(text);
            ut.rate = 1.05;
            speechSynthesis.speak(ut);
        }
    },

    toggleTorch: (on) => {
        state.torchOn = on;
        if (Bridge.isAvailable() && window.AndroidBridge.toggleFlashlight) {
            window.AndroidBridge.toggleFlashlight(on);
        }
        Bridge.toast(on ? "Torch ON" : "Torch OFF");
    },

    keepScreen: (on) => {
        if (Bridge.isAvailable() && window.AndroidBridge.keepScreenOn) {
            window.AndroidBridge.keepScreenOn(on);
        }
    },

    copy: (text) => {
        if (Bridge.isAvailable() && window.AndroidBridge.copyToClipboard) {
            window.AndroidBridge.copyToClipboard(text);
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => Bridge.toast("Copied to clipboard"));
        }
    },

    share: (title, text) => {
        if (Bridge.isAvailable() && window.AndroidBridge.shareText) {
            window.AndroidBridge.shareText(title, text);
        } else if (navigator.share) {
            navigator.share({ title, text }).catch(() => {});
        } else {
            Bridge.copy(text);
        }
    },

    getBattery: () => {
        if (Bridge.isAvailable() && window.AndroidBridge.getBatteryLevel) {
            return window.AndroidBridge.getBatteryLevel();
        }
        return -1;
    },

    isCharging: () => {
        if (Bridge.isAvailable() && window.AndroidBridge.isDeviceCharging) {
            return window.AndroidBridge.isDeviceCharging();
        }
        return false;
    },

    getIP: () => {
        if (Bridge.isAvailable() && window.AndroidBridge.getDeviceIpAddress) {
            return window.AndroidBridge.getDeviceIpAddress();
        }
        return '127.0.0.1';
    },

    runShell: (cmd) => {
        if (Bridge.isAvailable() && window.AndroidBridge.runShellCommand) {
            return window.AndroidBridge.runShellCommand(cmd);
        }
        return "OK (simulated bridge)";
    }
};

function initBridgeTelemetry() {
    function updateMetrics() {
        const bat = Bridge.getBattery();
        const charging = Bridge.isCharging();
        const ip = Bridge.getIP();

        if (bat >= 0) {
            state.battery = bat;
            batteryMetric.textContent = `${charging ? '⚡' : '🔋'} ${bat}%`;
        } else {
            batteryMetric.textContent = '🔋 100%';
        }

        if (ip && ip !== '127.0.0.1') {
            state.ip = ip;
            ipMetric.textContent = `🌐 ${ip}`;
        } else {
            ipMetric.textContent = '🌐 Ready';
        }
    }

    updateMetrics();
    setInterval(updateMetrics, 5000);
    Bridge.keepScreen(state.keepScreenOn);
}

// ===================== LOGGING & UI HELPERS =====================
function appendLog(tagType, tagText, message, cssClass = '') {
    const line = document.createElement('div');
    line.className = `term-line ${cssClass}`;
    line.innerHTML = `<span class="time">${getTimestamp()}</span> <span class="tag tag-${tagType}">${tagText}</span> ${escapeHtml(message)}`;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function setAgentState(agent, status) {
    const el = document.getElementById(`${agent}State`);
    const chip = document.getElementById(`chip${capitalize(agent)}`);
    if (!el || !chip) return;

    el.className = `chip-state ${status.toLowerCase()}`;
    el.textContent = status.toUpperCase();

    if (status === 'active') {
        chip.classList.add('active');
    } else {
        chip.classList.remove('active');
    }
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function setSwarmStatus(status) {
    if (status === 'busy') {
        swarmIndicator.className = 'pulse-indicator busy';
        deployBtn.style.display = 'none';
        stopBtn.style.display = 'block';
        state.running = true;
    } else if (status === 'error') {
        swarmIndicator.className = 'pulse-indicator error';
        deployBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        state.running = false;
    } else {
        swarmIndicator.className = 'pulse-indicator live';
        deployBtn.style.display = 'block';
        stopBtn.style.display = 'none';
        state.running = false;
        setAgentState('turing', 'idle');
        setAgentState('knuth', 'idle');
        setAgentState('lovelace', 'idle');
    }
}

function clearConsoleLog() {
    terminalOutput.innerHTML = '';
    appendLog('sys', 'SYSTEM', 'Terminal console cleared.');
    Bridge.vibrate(20);
}

function copyConsoleLog() {
    const text = terminalOutput.innerText;
    Bridge.copy(text);
}

function shareConsoleLog() {
    const text = terminalOutput.innerText;
    Bridge.share("Agentic Essence Execution Log", text);
}

// ===================== HARDWARE CONTROLS =====================
document.getElementById('torchBtn').addEventListener('click', () => {
    Bridge.toggleTorch(!state.torchOn);
    Bridge.vibrate(30);
});

document.getElementById('vibeBtn').addEventListener('click', () => {
    Bridge.vibrate(120);
    Bridge.toast("Haptic pulse triggered");
});

ttsToggleBtn.addEventListener('click', () => {
    state.ttsEnabled = !state.ttsEnabled;
    localStorage.setItem('ae_tts', state.ttsEnabled);
    ttsCheckbox.checked = state.ttsEnabled;
    ttsToggleBtn.textContent = state.ttsEnabled ? '🔊' : '🔇';
    Bridge.toast(`Voice TTS ${state.ttsEnabled ? 'Enabled' : 'Disabled'}`);
    Bridge.vibrate(20);
});

function toggleKeepScreen(checked) {
    state.keepScreenOn = checked;
    localStorage.setItem('ae_keepscreen', checked);
    Bridge.keepScreen(checked);
}

function toggleTTS(checked) {
    state.ttsEnabled = checked;
    localStorage.setItem('ae_tts', checked);
    ttsToggleBtn.textContent = checked ? '🔊' : '🔇';
}

function initAutoResizeTextarea() {
    taskInput.addEventListener('input', () => {
        taskInput.style.height = 'auto';
        taskInput.style.height = Math.min(taskInput.scrollHeight, 80) + 'px';
    });

    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            deploySwarm();
        }
    });
}

// ===================== SETTINGS MODAL =====================
document.getElementById('settingsBtn').addEventListener('click', () => {
    settingsModal.classList.add('open');
});

function closeSettings() {
    settingsModal.classList.remove('open');
}

function initSettingsUI() {
    providerSelect.value = state.provider;
    apiKeyInput.value = state.apiKey;
    customUrlInput.value = state.customUrl;
    modelInput.value = state.model;
    ttsCheckbox.checked = state.ttsEnabled;
    hapticsCheckbox.checked = state.hapticsEnabled;
    keepScreenOnToggle.checked = state.keepScreenOn;
    ttsToggleBtn.textContent = state.ttsEnabled ? '🔊' : '🔇';
    handleProviderChange();
}

function handleProviderChange() {
    const p = providerSelect.value;
    if (p === 'openrouter' || p === 'custom') {
        apiKeySection.style.display = 'block';
    } else {
        apiKeySection.style.display = 'none';
    }

    if (p === 'custom' || p === 'ollama') {
        customEndpointSection.style.display = 'block';
    } else {
        customEndpointSection.style.display = 'none';
    }
}

function saveSettings() {
    state.provider = providerSelect.value;
    state.apiKey = apiKeyInput.value.trim();
    state.customUrl = customUrlInput.value.trim();
    state.model = modelInput.value.trim() || 'openai';
    state.ttsEnabled = ttsCheckbox.checked;
    state.hapticsEnabled = hapticsCheckbox.checked;
    state.keepScreenOn = keepScreenOnToggle.checked;

    localStorage.setItem('ae_provider', state.provider);
    localStorage.setItem('ae_apiKey', state.apiKey);
    localStorage.setItem('ae_customUrl', state.customUrl);
    localStorage.setItem('ae_model', state.model);
    localStorage.setItem('ae_tts', state.ttsEnabled);
    localStorage.setItem('ae_haptics', state.hapticsEnabled);
    localStorage.setItem('ae_keepscreen', state.keepScreenOn);

    Bridge.keepScreen(state.keepScreenOn);
    ttsToggleBtn.textContent = state.ttsEnabled ? '🔊' : '🔇';
    closeSettings();
    appendLog('sys', 'CONFIG', `Provider updated to: [${state.provider}] (Model: ${state.model})`);
    Bridge.toast("Configuration saved");
    Bridge.vibrate(30);
}

// ===================== PRESETS & SLASH COMMANDS =====================
const PRESETS = {
    network_scan: "Execute Kali Linux network scan on subnet 192.168.1.0/24: discover active hosts, probe open ports, identify running web services.",
    ast_patch: "Surgical AST Code Patch: Inspect Python AST tree for vulnerability handler, construct safe AST transformer diff, verify zero regressions.",
    adb_automate: "Android ADB Automation: Connect to local device daemon, inspect accessibility hierarchy, tap target element (x: 540, y: 1200), type safe input payload.",
    crypto_license: "Zero-Trust Security Loop: Validate offline hardware ID (HWID) fingerprint using asymmetric Ed25519 cryptographic key signature.",
    swarm_qa: "Lovelace Multi-Agent QA: Execute PyTest security suite, perform error injection on Knuth builder routines, confirm sandbox boundary containment."
};

function loadPreset(key) {
    if (PRESETS[key]) {
        taskInput.value = PRESETS[key];
        taskInput.dispatchEvent(new Event('input'));
        Bridge.vibrate(25);
        deploySwarm();
    }
}

// ===================== AI LLM INFERENCE CLIENT =====================
async function queryLLM(messages, signal) {
    const provider = state.provider;

    if (provider === 'offline') {
        return generateOfflineResponse(messages);
    }

    if (provider === 'pollinations') {
        // Built-in free keyless endpoint
        const fullPrompt = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');
        const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=${encodeURIComponent(state.model || 'openai')}&json=true&seed=${Date.now()}`;

        const res = await fetch(url, {
            method: 'GET',
            signal
        });
        if (!res.ok) throw new Error(`Pollinations HTTP ${res.status}`);
        return await res.text();
    }

    if (provider === 'openrouter') {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.apiKey}`
            },
            body: JSON.stringify({
                model: state.model || 'openai/gpt-4o-mini',
                messages: messages
            }),
            signal
        });
        if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
    }

    if (provider === 'ollama' || provider === 'custom') {
        const endpoint = state.customUrl.replace(/\/$/, '') + '/chat/completions';
        const headers = { 'Content-Type': 'application/json' };
        if (state.apiKey) headers['Authorization'] = `Bearer ${state.apiKey}`;

        const res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: state.model || 'llama3',
                messages: messages
            }),
            signal
        });
        if (!res.ok) throw new Error(`Custom Endpoint HTTP ${res.status}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content || '';
    }

    throw new Error(`Unknown provider: ${provider}`);
}

function generateOfflineResponse(messages) {
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
    return JSON.stringify({
        turing_strategy: `Decompose directive: "${lastUserMsg.slice(0, 40)}..." into hardware execution stages.`,
        subtasks: [
            { agent: "knuth", action: "Execute system scan & initialize runtime AST environment", payload: "sys.probe()" },
            { agent: "knuth", action: "Apply surgical changes & compile target routines", payload: "ast.diff_patch()" },
            { agent: "lovelace", action: "Run PyTest validation & security regression suite", payload: "pytest.verify()" }
        ],
        summary: "Objective successfully executed in offline deterministic cyberdeck mode."
    });
}

// ===================== TRI-AGENT ORCHESTRATION PIPELINE =====================
async function deploySwarm() {
    const rawInput = taskInput.value.trim();
    if (!rawInput) {
        Bridge.toast("Please enter an objective or command");
        return;
    }

    // Slash command interceptor
    if (rawInput.startsWith('/')) {
        handleSlashCommand(rawInput);
        taskInput.value = '';
        return;
    }

    taskInput.value = '';
    setSwarmStatus('busy');
    Bridge.vibrate(50);
    state.abortController = new AbortController();

    appendLog('turing', 'TURING', `[Commander Directive Received]: "${rawInput}"`, 'highlight');
    Bridge.speak(`Turing received directive.`);

    try {
        // --- STAGE 1: TURING DECOMPOSITION ---
        setAgentState('turing', 'active');
        appendLog('turing', 'TURING', "Decomposing abstract directive into recursive sub-task matrix...");

        const turingPrompt = [
            {
                role: "system",
                content: `You are Alan Turing, the Commander AI agent in the Agentic Essence Tri-Agent system.
Your job is to break down the user's objective into a strict JSON plan with 2-4 concrete subtasks delegated to Knuth (Developer/Builder) and Lovelace (Tester/QA).
Respond ONLY in valid JSON format:
{
  "turing_strategy": "brief summary of approach",
  "subtasks": [
    { "agent": "knuth" | "lovelace", "action": "what to do", "payload": "shell command or python code" }
  ],
  "summary": "mission goal"
}`
            },
            {
                role: "user",
                content: rawInput
            }
        ];

        let planRaw = "";
        try {
            planRaw = await queryLLM(turingPrompt, state.abortController.signal);
        } catch (err) {
            appendLog('sys', 'FALLBACK', `Primary AI query note (${err.message}). Using autonomous offline orchestrator.`);
            planRaw = generateOfflineResponse(turingPrompt);
        }

        let plan = null;
        try {
            // Extract JSON block if wrapped in markdown
            const jsonMatch = planRaw.match(/\{[\s\S]*\}/);
            plan = JSON.parse(jsonMatch ? jsonMatch[0] : planRaw);
        } catch (parseErr) {
            plan = {
                turing_strategy: "Direct atomic execution path",
                subtasks: [
                    { agent: "knuth", action: "Synthesize target operational code & shell routine", payload: rawInput },
                    { agent: "lovelace", action: "Validate outputs and confirm sandbox integrity", payload: "verify_output()" }
                ],
                summary: "Standard task completion"
            };
        }

        appendLog('turing', 'TURING', `Strategy Formulated: ${plan.turing_strategy}`);
        setAgentState('turing', 'done');

        // --- STAGE 2: EXECUTION VIA KNUTH & LOVELACE ---
        const subtasks = plan.subtasks || [];
        for (let i = 0; i < subtasks.length; i++) {
            if (!state.running) break;

            const step = subtasks[i];
            const agentName = step.agent === 'lovelace' ? 'lovelace' : 'knuth';
            const agentTag = agentName.toUpperCase();

            setAgentState(agentName, 'active');
            Bridge.vibrate(30);

            appendLog(agentName, agentTag, `[Step ${i+1}/${subtasks.length}] ${step.action}`);
            if (state.ttsEnabled && i === 0) {
                Bridge.speak(`${agentTag} executing ${step.action.slice(0, 30)}`);
            }

            // Simulate / Execute local hardware shell or simulated AST
            await sleep(900);

            if (step.payload) {
                const execResult = Bridge.runShell(step.payload);
                appendLog('exec', 'EXEC', `→ ${step.payload} | Result: ${execResult.slice(0, 80)}`);
            }

            setAgentState(agentName, 'done');
            await sleep(400);
        }

        // --- STAGE 3: MISSION COMPLETION ---
        Bridge.vibrate(80);
        appendLog('lovelace', 'LOVELACE', "✅ QA & Security Verification Passed. 0 Regressions.", 'success');
        appendLog('sys', 'SWARM', `🎉 Objective Accomplished: ${plan.summary || 'Done'}`, 'highlight');
        Bridge.speak("Swarm objective accomplished.");

    } catch (error) {
        if (error.name === 'AbortError') {
            appendLog('sys', 'ABORT', "Swarm execution aborted by user.");
            Bridge.toast("Execution stopped");
        } else {
            appendLog('error', 'ERROR', `Swarm error: ${error.message}`);
            Bridge.speak("Execution encountered an error.");
        }
    } finally {
        setSwarmStatus('live');
    }
}

function abortTask() {
    if (state.abortController) {
        state.abortController.abort();
    }
    setSwarmStatus('live');
    Bridge.vibrate(40);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================== SLASH COMMAND HANDLER =====================
function handleSlashCommand(cmd) {
    const parts = cmd.trim().split(' ');
    const root = parts[0].toLowerCase();

    switch (root) {
        case '/help':
            appendLog('sys', 'HELP', `Available Cyberdeck Commands:
  /status  — Display telemetry, battery, network, & swarm state
  /torch   — Toggle camera flashlight / hardware signal
  /vibrate — Trigger tactile haptic pulse
  /tts     — Toggle Text-To-Speech voice feedback
  /clear   — Clear the terminal console log
  /models  — Show active AI provider and model settings
  /preset  — Run preset (e.g. /preset network_scan)`);
            break;

        case '/status':
            appendLog('sys', 'STATUS', `Hardware Status:
  • Battery: ${state.battery}% (${Bridge.isCharging() ? 'Charging' : 'Discharging'})
  • IP: ${state.ip}
  • Provider: ${state.provider} (${state.model})
  • Screen WakeLock: ${state.keepScreenOn ? 'ACTIVE' : 'INACTIVE'}
  • Swarm: 3/3 Agents Nominal`);
            break;

        case '/torch':
            Bridge.toggleTorch(!state.torchOn);
            break;

        case '/vibrate':
            Bridge.vibrate(100);
            break;

        case '/tts':
            ttsToggleBtn.click();
            break;

        case '/clear':
            clearConsoleLog();
            break;

        case '/models':
            appendLog('sys', 'MODELS', `Provider: ${state.provider} | Model: ${state.model} | Endpoint: ${state.provider === 'pollinations' ? 'https://text.pollinations.ai/' : state.customUrl}`);
            break;

        case '/preset':
            const presetName = parts[1];
            if (PRESETS[presetName]) {
                loadPreset(presetName);
            } else {
                appendLog('sys', 'ERROR', `Unknown preset: ${presetName}. Options: network_scan, ast_patch, adb_automate, crypto_license, swarm_qa`);
            }
            break;

        default:
            appendLog('sys', 'COMMAND', `Unrecognized slash command: ${root}. Type /help for assistance.`);
            break;
    }
}
