/**
 * Agentic Essence — Autonomous Multi-Agent Mobile Assistant
 * Full on-device calling, texting, alarms, app launching, hardware controls, and conversational swarm.
 */

// ===================== STATE & CONFIG =====================
const state = {
    provider: localStorage.getItem('ae_provider') || 'pollinations',
    apiKey: localStorage.getItem('ae_apiKey') || '',
    customUrl: localStorage.getItem('ae_customUrl') || 'http://localhost:11434/v1',
    model: localStorage.getItem('ae_model') || 'openai',
    ttsEnabled: localStorage.getItem('ae_tts') !== 'false',
    hapticsEnabled: localStorage.getItem('ae_haptics') !== 'false',
    keepScreenOn: localStorage.getItem('ae_keepscreen') !== 'false',
    isListening: false,
    torchOn: false,
    battery: 100,
    chatHistory: []
};

// ===================== DOM ELEMENTS =====================
const chatViewport = document.getElementById('chatViewport');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');
const ttsBtn = document.getElementById('ttsBtn');
const batteryBadge = document.getElementById('batteryBadge');
const typingIndicator = document.getElementById('typingIndicator');
const typingText = document.getElementById('typingText');
const pillTuring = document.getElementById('pillTuring');
const pillKnuth = document.getElementById('pillKnuth');
const pillLovelace = document.getElementById('pillLovelace');
const swarmPulse = document.getElementById('swarmPulse');
const settingsModal = document.getElementById('settingsModal');
const providerSelect = document.getElementById('providerSelect');
const apiKeySection = document.getElementById('apiKeySection');
const apiKeyInput = document.getElementById('apiKeyInput');
const customEndpointSection = document.getElementById('customEndpointSection');
const customUrlInput = document.getElementById('customUrlInput');
const modelInput = document.getElementById('modelInput');
const ttsToggle = document.getElementById('ttsToggle');
const hapticsToggle = document.getElementById('hapticsToggle');
const screenWakeToggle = document.getElementById('screenWakeToggle');

// ===================== INIT =====================
window.addEventListener('DOMContentLoaded', () => {
    initSettingsUI();
    initBridgeTelemetry();
    initInputHandlers();
});

function getFormattedTime() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ===================== NATIVE ANDROID BRIDGE =====================
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
        // Clean markdown and card tags from speech
        const clean = text.replace(/[#*`_\[\]]/g, '').replace(/http\S+/g, '').slice(0, 150);
        if (Bridge.isAvailable() && window.AndroidBridge.speakText) {
            window.AndroidBridge.speakText(clean);
        } else if ('speechSynthesis' in window) {
            const ut = new SpeechSynthesisUtterance(clean);
            ut.rate = 1.05;
            speechSynthesis.speak(ut);
        }
    },

    makeCall: (phone) => {
        if (Bridge.isAvailable() && window.AndroidBridge.makePhoneCall) {
            return window.AndroidBridge.makePhoneCall(phone);
        }
        window.open(`tel:${phone}`);
        return "Calling " + phone;
    },

    sendSms: (phone, message) => {
        if (Bridge.isAvailable() && window.AndroidBridge.sendSmsDirect) {
            return window.AndroidBridge.sendSmsDirect(phone, message);
        }
        window.open(`sms:${phone}?body=${encodeURIComponent(message)}`);
        return "SMS sent to " + phone;
    },

    findContact: (name) => {
        if (Bridge.isAvailable() && window.AndroidBridge.findContactNumber) {
            return window.AndroidBridge.findContactNumber(name);
        }
        return "";
    },

    openApp: (appName) => {
        if (Bridge.isAvailable() && window.AndroidBridge.openAppByName) {
            return window.AndroidBridge.openAppByName(appName);
        }
        Bridge.toast("Opening " + appName);
        return "Launched " + appName;
    },

    setAlarm: (hour, minute, label) => {
        if (Bridge.isAvailable() && window.AndroidBridge.setDeviceAlarm) {
            return window.AndroidBridge.setDeviceAlarm(hour, minute, label);
        }
        Bridge.toast(`Alarm set for ${hour}:${minute}`);
        return `Alarm set for ${hour}:${minute}`;
    },

    setTimer: (seconds, label) => {
        if (Bridge.isAvailable() && window.AndroidBridge.setDeviceTimer) {
            return window.AndroidBridge.setDeviceTimer(seconds, label);
        }
        Bridge.toast(`Timer set for ${seconds}s`);
        return `Timer set for ${seconds}s`;
    },

    openMaps: (destination) => {
        if (Bridge.isAvailable() && window.AndroidBridge.openMapsNavigation) {
            return window.AndroidBridge.openMapsNavigation(destination);
        }
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`);
        return "Navigating to " + destination;
    },

    toggleTorch: (on) => {
        state.torchOn = on;
        if (Bridge.isAvailable() && window.AndroidBridge.toggleFlashlight) {
            window.AndroidBridge.toggleFlashlight(on);
        }
        Bridge.toast(on ? "Torch ON" : "Torch OFF");
    },

    getBattery: () => {
        if (Bridge.isAvailable() && window.AndroidBridge.getBatteryLevel) {
            return window.AndroidBridge.getBatteryLevel();
        }
        return 100;
    },

    isCharging: () => {
        if (Bridge.isAvailable() && window.AndroidBridge.isDeviceCharging) {
            return window.AndroidBridge.isDeviceCharging();
        }
        return false;
    },

    keepScreen: (on) => {
        if (Bridge.isAvailable() && window.AndroidBridge.keepScreenOn) {
            window.AndroidBridge.keepScreenOn(on);
        }
    },

    startSpeechRecognition: () => {
        if (Bridge.isAvailable() && window.AndroidBridge.startVoiceRecognition) {
            window.AndroidBridge.startVoiceRecognition();
        } else if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.onstart = () => setListeningUI(true);
            recognition.onend = () => setListeningUI(false);
            recognition.onresult = (e) => {
                const text = e.results[0][0].transcript;
                handleUserMessage(text);
            };
            recognition.start();
        } else {
            Bridge.toast("Speech recognition not supported on this device");
        }
    }
};

// Global hook called by Android MainActivity when native speech intent returns
window.onSpeechResult = function(spokenText) {
    if (spokenText) {
        handleUserMessage(spokenText);
    }
};

function initBridgeTelemetry() {
    function refresh() {
        const bat = Bridge.getBattery();
        const charging = Bridge.isCharging();
        if (bat >= 0) {
            batteryBadge.textContent = `${charging ? '⚡' : '🔋'} ${bat}%`;
        }
    }
    refresh();
    setInterval(refresh, 8000);
    Bridge.keepScreen(state.keepScreenOn);
}

// ===================== UI CHAT RENDERING =====================
function appendUserMessage(text) {
    const group = document.createElement('div');
    group.className = 'msg-group user-msg';
    group.innerHTML = `
        <div class="msg-bubble">
            <div class="msg-text">${escapeHtml(text)}</div>
            <div class="msg-time">${getFormattedTime()}</div>
        </div>
    `;
    chatViewport.appendChild(group);
    scrollToBottom();
}

function appendAgentMessage(agent, text, actionCardHtml = '') {
    const group = document.createElement('div');
    group.className = 'msg-group agent-msg';

    let avatar = '🧠';
    let avatarClass = 'turing-bg';
    let nameColor = 'turing-color';
    let senderName = 'Alan Turing';
    let roleName = 'Commander';

    if (agent === 'knuth') {
        avatar = '⚡';
        avatarClass = 'knuth-bg';
        nameColor = 'knuth-color';
        senderName = 'Donald Knuth';
        roleName = 'Executor';
    } else if (agent === 'lovelace') {
        avatar = '🔬';
        avatarClass = 'lovelace-bg';
        nameColor = 'lovelace-color';
        senderName = 'Ada Lovelace';
        roleName = 'Tester';
    }

    group.innerHTML = `
        <div class="msg-avatar ${avatarClass}">${avatar}</div>
        <div class="msg-bubble">
            <div class="msg-sender"><span class="name ${nameColor}">${senderName}</span> <span class="badge-role">${roleName}</span></div>
            <div class="msg-text">${formatMarkdownText(text)}</div>
            ${actionCardHtml}
            <div class="msg-time">${getFormattedTime()}</div>
        </div>
    `;
    chatViewport.appendChild(group);
    scrollToBottom();
}

function scrollToBottom() {
    chatViewport.scrollTop = chatViewport.scrollHeight;
}

function showTyping(agentName, text) {
    typingText.textContent = `${agentName} is ${text}...`;
    typingIndicator.style.display = 'flex';
    swarmPulse.className = 'status-pulse busy';
    scrollToBottom();
}

function hideTyping() {
    typingIndicator.style.display = 'none';
    swarmPulse.className = 'status-pulse active';
}

function setAgentActivePill(agent) {
    pillTuring.classList.toggle('active', agent === 'turing');
    pillKnuth.classList.toggle('active', agent === 'knuth');
    pillLovelace.classList.toggle('active', agent === 'lovelace');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatMarkdownText(str) {
    if (!str) return '';
    return escapeHtml(str)
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

// ===================== AUTONOMOUS INTENT PARSER & AGENT ROUTER =====================
async function handleUserMessage(rawInput) {
    const text = rawInput.trim();
    if (!text) return;

    chatInput.value = '';
    chatInput.style.height = 'auto';
    appendUserMessage(text);
    state.chatHistory.push({ role: 'user', content: text });

    setAgentActivePill('turing');
    showTyping('Turing', 'analyzing intent');
    Bridge.vibrate(30);

    // 1. Check for Direct Phone Action Intents
    const lower = text.toLowerCase();

    // ------------------- A. PHONE CALL INTENT -------------------
    const callMatch = text.match(/(?:call|phone|ring|dial)\s+([a-zA-Z0-9\s\+\-\(\)]+)/i);
    if (callMatch && !lower.includes('what can') && !lower.includes('how to')) {
        const target = callMatch[1].trim();
        let phoneNumber = target;

        // If target contains letters, try resolving contact
        if (/[a-zA-Z]/.test(target)) {
            const found = Bridge.findContact(target);
            if (found) {
                phoneNumber = found;
            }
        }

        hideTyping();
        setAgentActivePill('knuth');
        Bridge.vibrate(50);
        Bridge.speak(`Calling ${target}`);

        const actionResult = Bridge.makeCall(phoneNumber);
        const cardHtml = `
            <div class="action-card">
                <div class="card-header-row">
                    <span class="card-title">📞 Outgoing Call</span>
                    <span class="card-tag tag-call">CALL ACTION</span>
                </div>
                <div class="card-detail">Target: <strong>${escapeHtml(target)}</strong> (${escapeHtml(phoneNumber)})</div>
                <button class="card-action-btn" onclick="Bridge.makeCall('${escapeHtml(phoneNumber)}')">Redial Call</button>
            </div>
        `;
        appendAgentMessage('knuth', `Initiating call to **${target}** (${phoneNumber})...`, cardHtml);
        return;
    }

    // ------------------- B. SMS / TEXTING INTENT -------------------
    const textMatch = text.match(/(?:text|sms|message|msg)\s+([a-zA-Z0-9\s\+\-]+?)\s+(?:that|saying|to\s+say|:)\s+(.+)/i) ||
                      text.match(/(?:text|sms|message|msg)\s+([a-zA-Z0-9\s\+\-]+?)\s+(.+)/i);
    if (textMatch && !lower.includes('what') && !lower.includes('how')) {
        const recipient = textMatch[1].trim();
        const msgBody = textMatch[2].trim();
        let phoneNumber = recipient;

        if (/[a-zA-Z]/.test(recipient)) {
            const found = Bridge.findContact(recipient);
            if (found) {
                phoneNumber = found;
            }
        }

        hideTyping();
        setAgentActivePill('knuth');
        Bridge.vibrate(60);
        Bridge.speak(`Sending text to ${recipient}`);

        const smsResult = Bridge.sendSms(phoneNumber, msgBody);
        const cardHtml = `
            <div class="action-card">
                <div class="card-header-row">
                    <span class="card-title">💬 SMS Dispatched</span>
                    <span class="card-tag tag-sms">SENT ✓</span>
                </div>
                <div class="card-detail">To: <strong>${escapeHtml(recipient)}</strong> (${escapeHtml(phoneNumber)})</div>
                <div class="card-detail">Body: "${escapeHtml(msgBody)}"</div>
            </div>
        `;
        appendAgentMessage('knuth', `Message successfully sent to **${recipient}**.`, cardHtml);
        return;
    }

    // ------------------- C. ALARM & TIMER INTENT -------------------
    const alarmMatch = text.match(/(?:set\s+)?alarm\s+(?:for\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i) ||
                       text.match(/wake\s+me\s+up\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (alarmMatch) {
        let hour = parseInt(alarmMatch[1]);
        let minute = alarmMatch[2] ? parseInt(alarmMatch[2]) : 0;
        const ampm = alarmMatch[3] ? alarmMatch[3].toLowerCase() : '';

        if (ampm === 'pm' && hour < 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;

        hideTyping();
        setAgentActivePill('knuth');
        Bridge.vibrate(50);
        const formatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        Bridge.speak(`Setting alarm for ${hour} ${minute > 0 ? minute : 'o clock'}`);

        Bridge.setAlarm(hour, minute, "Agentic Assistant");
        const cardHtml = `
            <div class="action-card">
                <div class="card-header-row">
                    <span class="card-title">⏰ Alarm Configured</span>
                    <span class="card-tag tag-alarm">ALARM ACTIVE</span>
                </div>
                <div class="card-detail">Time: <strong>${formatted}</strong></div>
            </div>
        `;
        appendAgentMessage('knuth', `Alarm configured for **${formatted}**.`, cardHtml);
        return;
    }

    // ------------------- D. APP LAUNCH INTENT -------------------
    const appMatch = text.match(/(?:open|launch|start|run)\s+([a-zA-Z0-9\s]+)/i);
    if (appMatch && !lower.includes('door') && !lower.includes('setting')) {
        const appName = appMatch[1].trim();
        hideTyping();
        setAgentActivePill('knuth');
        Bridge.vibrate(40);
        Bridge.speak(`Opening ${appName}`);

        const res = Bridge.openApp(appName);
        const cardHtml = `
            <div class="action-card">
                <div class="card-header-row">
                    <span class="card-title">📱 App Launched</span>
                    <span class="card-tag tag-app">EXECUTE</span>
                </div>
                <div class="card-detail">Application: <strong>${escapeHtml(appName)}</strong></div>
            </div>
        `;
        appendAgentMessage('knuth', `${res}`, cardHtml);
        return;
    }

    // ------------------- E. MAPS & NAVIGATION INTENT -------------------
    const navMatch = text.match(/(?:navigate|directions|take\s+me|drive|route)\s+(?:to\s+)?(.+)/i);
    if (navMatch) {
        const dest = navMatch[1].trim();
        hideTyping();
        setAgentActivePill('knuth');
        Bridge.vibrate(40);
        Bridge.speak(`Navigating to ${dest}`);

        Bridge.openMaps(dest);
        const cardHtml = `
            <div class="action-card">
                <div class="card-header-row">
                    <span class="card-title">🧭 Navigation Route</span>
                    <span class="card-tag tag-map">GPS ACTIVE</span>
                </div>
                <div class="card-detail">Destination: <strong>${escapeHtml(dest)}</strong></div>
            </div>
        `;
        appendAgentMessage('knuth', `Opening live navigation for **${dest}**.`, cardHtml);
        return;
    }

    // ------------------- F. HARDWARE CONTROLS INTENT -------------------
    if (lower.includes('flashlight on') || lower.includes('torch on') || lower.includes('turn on light')) {
        hideTyping();
        Bridge.toggleTorch(true);
        Bridge.speak("Flashlight turned on");
        appendAgentMessage('knuth', "🔦 Flashlight has been turned **ON**.");
        return;
    }
    if (lower.includes('flashlight off') || lower.includes('torch off') || lower.includes('turn off light')) {
        hideTyping();
        Bridge.toggleTorch(false);
        Bridge.speak("Flashlight turned off");
        appendAgentMessage('knuth', "Flashlight has been turned **OFF**.");
        return;
    }
    if (lower.includes('battery')) {
        hideTyping();
        const bat = Bridge.getBattery();
        const charging = Bridge.isCharging();
        const msg = `Current battery level is **${bat}%** (${charging ? 'Charging ⚡' : 'On battery 🔋'}).`;
        Bridge.speak(`Battery is at ${bat} percent`);
        appendAgentMessage('turing', msg);
        return;
    }

    // ------------------- G. GENERAL CONVERSATIONAL AI SWARM -------------------
    try {
        showTyping('Turing', 'reasoning with swarm');
        const systemPrompt = `You are Agentic Essence, a powerful, autonomous on-device AI assistant with direct access to the user's phone.
You are concise, direct, helpful, and speak as the Commander of the Tri-Agent swarm (Turing, Knuth, Lovelace).
Give crisp, helpful answers formatted nicely with markdown.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            ...state.chatHistory.slice(-6)
        ];

        const aiResponse = await queryLLM(messages);
        hideTyping();
        setAgentActivePill('turing');
        appendAgentMessage('turing', aiResponse);
        Bridge.speak(aiResponse);
        state.chatHistory.push({ role: 'assistant', content: aiResponse });

    } catch (err) {
        hideTyping();
        setAgentActivePill('turing');
        const fallback = `I understand your request: "${text}". I can call contacts, send SMS messages, set alarms, open any app on your phone, navigate, or control hardware directly.`;
        appendAgentMessage('turing', fallback);
        Bridge.speak(fallback);
    }
}

// ===================== LLM QUERY CLIENT =====================
async function queryLLM(messages) {
    if (state.provider === 'deterministic') {
        const lastMsg = messages[messages.length - 1].content;
        return `Understood. Ready to orchestrate autonomous action for: "${lastMsg}".`;
    }

    if (state.provider === 'pollinations') {
        const fullPrompt = messages.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');
        const url = `https://text.pollinations.ai/${encodeURIComponent(fullPrompt)}?model=${encodeURIComponent(state.model || 'openai')}&seed=${Date.now()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP " + res.status);
        return await res.text();
    }

    if (state.provider === 'openrouter') {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.apiKey}`
            },
            body: JSON.stringify({
                model: state.model || 'openai/gpt-4o-mini',
                messages: messages
            })
        });
        if (!res.ok) throw new Error("OpenRouter HTTP " + res.status);
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
    }

    if (state.provider === 'ollama' || state.provider === 'custom') {
        const endpoint = state.customUrl.replace(/\/$/, '') + '/chat/completions';
        const headers = { 'Content-Type': 'application/json' };
        if (state.apiKey) headers['Authorization'] = `Bearer ${state.apiKey}`;

        const res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: state.model || 'llama3',
                messages: messages
            })
        });
        if (!res.ok) throw new Error("Custom Endpoint HTTP " + res.status);
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
    }

    throw new Error("Unknown provider");
}

// ===================== INPUT & EVENT LISTENERS =====================
function initInputHandlers() {
    sendBtn.addEventListener('click', () => {
        handleUserMessage(chatInput.value);
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserMessage(chatInput.value);
        }
    });

    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + 'px';
    });

    micBtn.addEventListener('click', () => {
        Bridge.vibrate(40);
        Bridge.startSpeechRecognition();
    });

    ttsBtn.addEventListener('click', () => {
        state.ttsEnabled = !state.ttsEnabled;
        localStorage.setItem('ae_tts', state.ttsEnabled);
        ttsToggle.checked = state.ttsEnabled;
        ttsBtn.textContent = state.ttsEnabled ? '🔊' : '🔇';
        Bridge.toast(`Voice TTS ${state.ttsEnabled ? 'Enabled' : 'Disabled'}`);
        Bridge.vibrate(25);
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
        settingsModal.classList.add('open');
    });
}

function setListeningUI(listening) {
    state.isListening = listening;
    if (listening) {
        micBtn.classList.add('listening');
        Bridge.toast("Listening...");
    } else {
        micBtn.classList.remove('listening');
    }
}

function quickPrompt(prefix) {
    chatInput.value = prefix;
    chatInput.focus();
    chatInput.dispatchEvent(new Event('input'));
    Bridge.vibrate(20);
}

function toggleTorch() {
    Bridge.toggleTorch(!state.torchOn);
    Bridge.vibrate(30);
}

function triggerHaptic() {
    Bridge.vibrate(100);
    Bridge.toast("Haptic pulse triggered");
}

// ===================== SETTINGS MODAL =====================
function closeSettings() {
    settingsModal.classList.remove('open');
}

function initSettingsUI() {
    providerSelect.value = state.provider;
    apiKeyInput.value = state.apiKey;
    customUrlInput.value = state.customUrl;
    modelInput.value = state.model;
    ttsToggle.checked = state.ttsEnabled;
    hapticsToggle.checked = state.hapticsEnabled;
    screenWakeToggle.checked = state.keepScreenOn;
    ttsBtn.textContent = state.ttsEnabled ? '🔊' : '🔇';
    handleProviderChange();
}

function handleProviderChange() {
    const p = providerSelect.value;
    apiKeySection.style.display = (p === 'openrouter' || p === 'custom') ? 'block' : 'none';
    customEndpointSection.style.display = (p === 'custom' || p === 'ollama') ? 'block' : 'none';
}

function saveSettings() {
    state.provider = providerSelect.value;
    state.apiKey = apiKeyInput.value.trim();
    state.customUrl = customUrlInput.value.trim();
    state.model = modelInput.value.trim() || 'openai';
    state.ttsEnabled = ttsToggle.checked;
    state.hapticsEnabled = hapticsToggle.checked;
    state.keepScreenOn = screenWakeToggle.checked;

    localStorage.setItem('ae_provider', state.provider);
    localStorage.setItem('ae_apiKey', state.apiKey);
    localStorage.setItem('ae_customUrl', state.customUrl);
    localStorage.setItem('ae_model', state.model);
    localStorage.setItem('ae_tts', state.ttsEnabled);
    localStorage.setItem('ae_haptics', state.hapticsEnabled);
    localStorage.setItem('ae_keepscreen', state.keepScreenOn);

    Bridge.keepScreen(state.keepScreenOn);
    ttsBtn.textContent = state.ttsEnabled ? '🔊' : '🔇';
    closeSettings();
    Bridge.toast("Settings saved");
    Bridge.vibrate(30);
}

function clearChat() {
    chatViewport.innerHTML = '';
    state.chatHistory = [];
    closeSettings();
    appendAgentMessage('turing', 'Chat history cleared. How can I assist you with your phone?');
    Bridge.vibrate(20);
}
