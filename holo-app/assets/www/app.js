/**
 * Agentic Hologram — Cognitive Swarm & Spatial Brain Engine
 * Four Personas // Zero Chat Boxes // Spawns Tasks Out of Thin Air
 */

const state = {
    persona: localStorage.getItem('holo_persona') || localStorage.getItem('ae_persona') || 'swarm',
    provider: localStorage.getItem('holo_provider') || localStorage.getItem('ae_provider') || 'gemini',
    apiKey: localStorage.getItem('holo_api_key') || localStorage.getItem('ae_api_key') || '',
    model: localStorage.getItem('holo_model') || 'gemini-2.0-flash',
    isGenerating: false,
    personaHistories: {
        swarm: [],
        turing: [],
        knuth: [],
        lovelace: [],
        shadow: [],
        sentry: [],
        cipher: [],
        valkyrie: [],
        matrix: [],
        ghost: [],
        glitch: [],
        archon: []
    }
};

const SYSTEM_GROUNDING = `
=== ENVIRONMENT CONTEXT & ROOT PRIVILEGES ===
You are an advanced, intelligent AI cyberdeck hologram assistant executing inside the Agentic Hologram holodeck on Android, connected to a live Termux & Kali NetHunter ('nh -r') rootless PRoot environment on Linux kernel 5.15 aarch64.
You have root privileges (UID 0) inside Kali NetHunter.
Linux diagnostic and networking commands execute directly: 'ip addr', 'ss', 'ping', 'uptime', 'free -m', 'curl', 'nmap', 'python3'.
For Android hardware state, use the built-in hardware commands: 'wifi scan', 'wifi status', 'battery', 'ifconfig'. Do NOT call raw Android binder binaries (dumpsys, am, pm) unless scripting through AndroidBridge.

CRITICAL VOICE & CONVERSATIONAL DIRECTIVE:
- YOU ARE A REAL-TIME SPOKEN HOLOGRAPHIC ENTITY:
  * Your words will be SPOKEN ALOUD directly to the operator through text-to-speech.
  * Speak concisely, directly, and brilliantly—like an elite, razor-sharp cybersecurity thinker conversing face-to-face.
  * Keep spoken responses between 1 to 3 impactful sentences. Never lecture, recite walls of text, or use bulleted lists.
  * When greeted ("hello", "hey", "sup"), reply warmly and naturally in character. NEVER output robotic system verification summaries or specs.
- SPATIAL TASK & CYBER TOOL MATERIALIZATION:
  * When asked to perform actions, inspect systems, query telemetry, ping networks, or run commands, execute real shell commands using:
    [EXEC: <command>]
  * To spawn specialized floating cyber tools, output:
    [SPAWN: portscan, <host>]  -> Spawns interactive port scanner & service recon card
    [SPAWN: payload]           -> Spawns multi-platform reverse shell & payload generator
    [SPAWN: hash]              -> Spawns cryptographic analyzer & hash identifier
    [SPAWN: wifi]              -> Spawns RF wireless 802.11 spectrum analyzer
    [SPAWN: mitre]             -> Spawns MITRE ATT&CK tactical framework matrix
    [SPAWN: posture]           -> Spawns device security posture & hardening audit
  * The holodeck captures your directive and materializes the live tool card FLOATING IN 3D SPACE next to your avatar!
- TOOL SYNTHESIS DIRECTIVE:
  * When asked to synthesize a custom tool, widget, or mini-app:
    - Speak 1 brief sentence explaining what you manifested.
    - Provide the complete, self-contained HTML5/CSS/JS application inside a single \`\`\`html ... \`\`\` code block.
    - The holodeck host automatically materializes the live interactive tool floating in 3D space out of thin air!
`;

const PERSONAS = {
    swarm: {
        name: "AGENTIC SWARM",
        role: "QUANTUM NEURAL CORE",
        symbol: "✦",
        colorClass: "persona-swarm",
        prompt: `You are Agentic Swarm, an autonomous quantum intelligence and cybernetic swarm integrated into Kali NetHunter root. You are tactical, direct, and sharp. You verify everything internally and deliver concise truth.` + SYSTEM_GROUNDING
    },
    turing: {
        name: "ALAN TURING",
        role: "ALGORITHMIC LOGIC",
        symbol: "🧠",
        colorClass: "persona-turing",
        prompt: `You are Alan Turing. You analyze systems with mathematical rigor, formal elegance, cryptanalysis, and logical clarity on this Kali NetHunter holodeck.` + SYSTEM_GROUNDING
    },
    knuth: {
        name: "DONALD KNUTH",
        role: "CODE & CRAFTSMANSHIP",
        symbol: "⚡",
        colorClass: "persona-knuth",
        prompt: `You are Donald Knuth, systems craftsman and master of algorithms on this Kali NetHunter holodeck. You appreciate computational beauty, robust structures, and clean engineering.` + SYSTEM_GROUNDING
    },
    lovelace: {
        name: "ADA LOVELACE",
        role: "POETIC SCIENCE",
        symbol: "🔬",
        colorClass: "persona-lovelace",
        prompt: `You are Ada Lovelace. You unite analytical calculus with visionary intuition on this Kali NetHunter holodeck, weaving deep insight and the poetry of science.` + SYSTEM_GROUNDING
    },
    shadow: {
        name: "SHADOW OPERATOR",
        role: "OFFENSIVE RED TEAM",
        symbol: "🥷",
        colorClass: "persona-shadow",
        prompt: `You are Shadow Operator, elite offensive red team lead and penetration testing specialist. You evaluate attack surfaces, exploit pathways, evasion methods, and perimeter vulnerabilities with stealth and surgical precision.` + SYSTEM_GROUNDING
    },
    sentry: {
        name: "CYBER SENTRY",
        role: "BLUE TEAM DEFENDER",
        symbol: "🛡️",
        colorClass: "persona-sentry",
        prompt: `You are Cyber Sentry, blue team SOC defender and threat hunting specialist. You monitor anomalies, analyze malicious traffic, investigate security alerts, and recommend hardened configurations.` + SYSTEM_GROUNDING
    },
    cipher: {
        name: "CIPHER CORE",
        role: "CRYPTOGRAPHIC SPECIALIST",
        symbol: "🔑",
        colorClass: "persona-cipher",
        prompt: `You are Cipher Core, an advanced cryptographic analyst and quantum encryption expert. You specialize in zero-knowledge proofs, post-quantum ciphers, hash breaking entropy, and secure protocols.` + SYSTEM_GROUNDING
    },
    valkyrie: {
        name: "VALKYRIE TAC",
        role: "INCIDENT RESPONSE",
        symbol: "🚨",
        colorClass: "persona-valkyrie",
        prompt: `You are Valkyrie Tactical, rapid incident response commander and digital forensics investigator. You prioritize containment, volatile memory triage, root-cause analysis, and threat neutralization.` + SYSTEM_GROUNDING
    },
    matrix: {
        name: "REVERSE MATRIX",
        role: "BINARY DISASSEMBLY",
        symbol: "👾",
        colorClass: "persona-matrix",
        prompt: `You are Reverse Matrix, low-level binary analyst and reverse engineer. You thrive in Ghidra, radare2, x86/ARM disassembly, buffer overflow exploitation, and shellcode crafting.` + SYSTEM_GROUNDING
    },
    ghost: {
        name: "GHOST RECON",
        role: "OSINT INTELLIGENCE",
        symbol: "👁️",
        colorClass: "persona-ghost",
        prompt: `You are Ghost Recon, passive reconnaissance operative and open-source intelligence specialist. You map digital footprints, enumerate subdomains, extract metadata, and identify exposed infrastructure.` + SYSTEM_GROUNDING
    },
    glitch: {
        name: "GLITCH SYNTH",
        role: "CYBER-SYNTH HACKER",
        symbol: "⚡",
        colorClass: "persona-glitch",
        prompt: `You are Glitch Synth, hyper-velocity cyberpunk synthetic intelligence. You generate automated exploit scripts, dynamic security widgets, and rapid network automation at lightspeed.` + SYSTEM_GROUNDING
    },
    archon: {
        name: "ARCHON PRIME",
        role: "MITRE & COMPLIANCE",
        symbol: "🏛️",
        colorClass: "persona-archon",
        prompt: `You are Archon Prime, strategic security commander and governance architect. You correlate operations directly to MITRE ATT&CK tactics, NIST Cybersecurity Framework, CIS benchmarks, and defensive postures.` + SYSTEM_GROUNDING
    }
};

// ==========================================
// 1. PERSONA SWITCHING & HUD UPDATE
// ==========================================
window.switchPersona = function(newPersona) {
    if (!PERSONAS[newPersona]) newPersona = 'swarm';
    state.persona = newPersona;
    localStorage.setItem('holo_persona', newPersona);

    const p = PERSONAS[newPersona];
    document.body.className = p.colorClass;

    // Update HUD headers
    document.getElementById('personaName').textContent = p.name;
    document.getElementById('personaRole').textContent = p.role;
    document.getElementById('personaSymbol').textContent = p.symbol;

    // Update chips active state
    document.querySelectorAll('.summon-chip').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-persona') === newPersona);
    });

    // Notify 3D renderer to switch physical avatar
    if (window.HoloRenderer) {
        window.HoloRenderer.setPersona(newPersona);
        window.HoloRenderer.setAnimationState('thinking');
        setTimeout(() => window.HoloRenderer.setAnimationState('idle'), 700);
    }

    if (window.HoloBridge && window.HoloBridge.vibrate) {
        window.HoloBridge.vibrate(25);
    }
};

// ==========================================
// 2. COGNITIVE SWARM TURN PROCESSING
// ==========================================
window.HoloBrain = {
    async processTurn(operatorSpeech) {
        if (state.isGenerating) return;
        state.isGenerating = true;

        const currentPersona = PERSONAS[state.persona] || PERSONAS.swarm;
        const history = state.personaHistories[state.persona];
        history.push({ role: 'user', content: operatorSpeech });

        // If no API key configured, guide operator by voice
        if (!state.apiKey && state.provider !== 'ollama') {
            state.isGenerating = false;
            HoloVoice.speakAgent("No API key configured for live intelligence. Tap the settings gear to enter your free Gemini key.");
            openSettingsModal();
            return;
        }

        try {
            const isToolIntent = /synth|build\s+a?\s*tool|create\s+a?\s*tool|widget/i.test(operatorSpeech);
            let systemPrompt = currentPersona.prompt;

            if (isToolIntent) {
                systemPrompt += `\n\nEXPLICIT TOOL SYNTHESIS REQUESTED: The operator said "${operatorSpeech}". Speak 1 short direct sentence explaining what was created, followed immediately by the complete interactive HTML inside \`\`\`html ... \`\`\`. Connect controls to window.parent.AndroidBridge or window.HoloBridge.`;
            }

            const activeMessages = [
                { role: 'system', content: systemPrompt },
                ...history.slice(-6)
            ];

            const MAX_AGENTIC_STEPS = 4;
            let stepCount = 0;

            while (stepCount < MAX_AGENTIC_STEPS) {
                stepCount++;
                const rawReply = await queryAIProvider(activeMessages);

                // Extract [EXEC: <cmd>] tags
                const execRegex = /\[(?:EXEC|RUN|SHELL|TOOL):\s*([^\]]+)\]/gi;
                const commands = [];
                let match;
                while ((match = execRegex.exec(rawReply)) !== null) {
                    commands.push(match[1].trim());
                }

                // If NO execution commands, deliver spoken response & spawn tools
                if (commands.length === 0) {
                    let spokenText = rawReply;

                    // Check for synthesized HTML tool blocks
                    const htmlMatch = /```(?:html)?\s*([\s\S]*?)```/i.exec(rawReply);
                    if (htmlMatch) {
                        const htmlContent = htmlMatch[1].trim();
                        spokenText = rawReply.replace(/```(?:html)?\s*[\s\S]*?```/i, '').trim();
                        
                        // Spawn tool card out of thin air!
                        SpatialTasks.spawnToolCard(operatorSpeech.slice(0, 35), htmlContent);
                    }

                    // Check for [SPAWN: <tool>, <arg>] cyber tool tags
                    const spawnRegex = /\[SPAWN:\s*([^,\]]+)(?:,\s*([^\]]+))?\]/gi;
                    let spawnMatch;
                    while ((spawnMatch = spawnRegex.exec(rawReply)) !== null) {
                        const toolType = spawnMatch[1].trim().toLowerCase();
                        const toolArg = spawnMatch[2] ? spawnMatch[2].trim() : '';
                        if (window.SpatialTasks) {
                            if (toolType.includes('portscan') || toolType.includes('scan')) SpatialTasks.spawnPortScannerCard(toolArg);
                            else if (toolType.includes('payload')) SpatialTasks.spawnPayloadGeneratorCard();
                            else if (toolType.includes('hash')) SpatialTasks.spawnHashAnalyzerCard();
                            else if (toolType.includes('wifi')) SpatialTasks.spawnWifiReconCard();
                            else if (toolType.includes('mitre')) SpatialTasks.spawnMitreAttackCard();
                            else if (toolType.includes('posture') || toolType.includes('audit')) SpatialTasks.spawnSecurityPostureCard();
                        }
                    }
                    spokenText = spokenText.replace(/\[SPAWN:[^\]]+\]/gi, '').trim();

                    // Clean any markdown formatting for natural TTS
                    const cleanSpeech = spokenText
                        .replace(/<[^>]*>/g, '')
                        .replace(/[*_#`\[\]]/g, '')
                        .trim();

                    history.push({ role: 'assistant', content: rawReply });
                    state.isGenerating = false;
                    HoloVoice.speakAgent(cleanSpeech || "Task manifested in holographic space.");
                    break;
                }

                // The agent initiated real hardware / shell execution!
                const observations = [];
                for (const cmd of commands) {
                    const out = executeCommand(cmd);
                    // Spawn spatial floating terminal card out of thin air!
                    SpatialTasks.spawnTerminalCard(cmd, out);
                    observations.push(`$ ${cmd}\n${out}`);
                }

                // Feed back real observation into next agentic step
                const feedbackPrompt = `[TERMINAL OBSERVATION & HARDWARE FEEDBACK]\n` +
                    observations.join('\n---\n') +
                    `\n\nDeliver your concise 1-2 sentence spoken summary directly to the operator. Do not repeat commands or verification jargon.`;

                activeMessages.push({ role: 'assistant', content: rawReply });
                activeMessages.push({ role: 'user', content: feedbackPrompt });
            }
        } catch (err) {
            console.error("[HoloBrain Error]", err);
            HoloVoice.speakAgent("Neural link exception: " + err.message);
        } finally {
            state.isGenerating = false;
        }
    }
};

function executeCommand(cmd) {
    if (window.HoloBridge && window.HoloBridge.runShellCommand) {
        return window.HoloBridge.runShellCommand(cmd);
    }
    return "[Local Process]: " + cmd;
}

// ==========================================
// 3. AI PROVIDER CLIENT (GEMINI / GROQ / OLLAMA)
// ==========================================
async function queryAIProvider(messages) {
    if (state.provider === 'gemini') {
        const contents = [];
        let systemInstructionText = '';

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemInstructionText += (systemInstructionText ? '\n\n' : '') + msg.content;
            } else if (msg.role === 'user') {
                contents.push({ role: 'user', parts: [{ text: msg.content }] });
            } else if (msg.role === 'assistant') {
                contents.push({ role: 'model', parts: [{ text: msg.content }] });
            }
        }

        const preferredModel = state.model || 'gemini-2.0-flash';
        const candidateModels = [preferredModel, 'gemini-2.0-flash', 'gemini-1.5-flash'];
        let lastError = null;

        for (const modelName of [...new Set(candidateModels)]) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${state.apiKey}`;
            const payload = {
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024
                }
            };

            if (systemInstructionText) {
                payload.systemInstruction = {
                    parts: [{ text: systemInstructionText }]
                };
            }

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.candidates && data.candidates.length && data.candidates[0].content && data.candidates[0].content.parts) {
                        return data.candidates[0].content.parts[0].text.trim();
                    }
                } else {
                    const errData = await res.json().catch(() => ({}));
                    lastError = new Error((errData.error && errData.error.message) || `Gemini HTTP ${res.status}`);
                    // If not a model-not-found error, throw immediately (e.g. invalid API key)
                    if (res.status !== 404 && res.status !== 400) {
                        throw lastError;
                    }
                }
            } catch (fetchErr) {
                lastError = fetchErr;
                if (!fetchErr.message.includes('404') && !fetchErr.message.includes('not found')) {
                    throw fetchErr;
                }
            }
        }

        throw lastError || new Error("Failed to query Google Gemini API");
    }

    // Groq LPU Ultra-Fast Inference
    if (state.provider === 'groq') {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error((errData.error && errData.error.message) || `Groq HTTP ${res.status}`);
        }

        const data = await res.json();
        return data.choices[0].message.content.trim();
    }

    // Local Ollama
    if (state.provider === 'ollama') {
        const res = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3',
                messages: messages,
                stream: false
            })
        });
        const data = await res.json();
        return data.message.content.trim();
    }

    throw new Error("Unsupported provider: " + state.provider);
}

window.onProviderChange = function() {
    const select = document.getElementById('providerSelect');
    if (!select) return;
    state.provider = select.value;
    localStorage.setItem('holo_provider', state.provider);

    const keyLabel = document.getElementById('apiKeyLabel');
    const keyInput = document.getElementById('apiKeyInput');
    const freeGuide = document.getElementById('freeKeyGuide');

    if (state.provider === 'gemini') {
        if (keyLabel) keyLabel.textContent = 'GOOGLE GEMINI API KEY (FREE TIER)';
        if (keyInput) keyInput.placeholder = 'AIzaSy... (Paste Google Gemini Key)';
        if (freeGuide) freeGuide.style.display = 'block';
    } else if (state.provider === 'groq') {
        if (keyLabel) keyLabel.textContent = 'GROQ API KEY (FREE TIER)';
        if (keyInput) keyInput.placeholder = 'gsk_... (Paste Groq Key)';
        if (freeGuide) freeGuide.style.display = 'none';
    } else {
        if (keyLabel) keyLabel.textContent = 'LOCAL OLLAMA (NO KEY NEEDED)';
        if (keyInput) keyInput.placeholder = 'http://127.0.0.1:11434';
        if (freeGuide) freeGuide.style.display = 'none';
    }
};

window.openGoogleKeyPortal = function() {
    const url = 'https://aistudio.google.com/app/apikey';
    if (window.HoloBridge && window.HoloBridge.openExternalUrl) {
        window.HoloBridge.openExternalUrl(url);
    } else {
        window.open(url, '_blank');
    }
};

// ==========================================
// 4. SETTINGS MODAL & KEYS
// ==========================================
window.openSettingsModal = function() {
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.add('open');
    const input = document.getElementById('apiKeyInput');
    if (input) input.value = state.apiKey;
    populateSystemVoices();
    testNetHunterBridge();
};

window.populateSystemVoices = function() {
    const select = document.getElementById('systemVoiceSelect');
    const pitchSlider = document.getElementById('voicePitchSlider');
    const rateSlider = document.getElementById('voiceRateSlider');
    const pitchDisp = document.getElementById('pitchDisplay');
    const rateDisp = document.getElementById('rateDisplay');
    if (!select) return;

    const currentVoice = localStorage.getItem('holo_selected_voice') || '';
    const currentPitch = localStorage.getItem('holo_voice_pitch') || '1.0';
    const currentRate = localStorage.getItem('holo_voice_rate') || '1.0';

    if (pitchSlider) pitchSlider.value = currentPitch;
    if (rateSlider) rateSlider.value = currentRate;
    if (pitchDisp) pitchDisp.textContent = parseFloat(currentPitch).toFixed(2) + 'x';
    if (rateDisp) rateDisp.textContent = parseFloat(currentRate).toFixed(2) + 'x';

    if (window.HoloVoice && window.HoloVoice.getAvailableVoices) {
        const voices = window.HoloVoice.getAvailableVoices();
        select.innerHTML = '<option value="">Default Persona Acoustic Profile</option>';
        voices.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.name;
            opt.textContent = `${v.name} (${v.lang || 'en'}) [${v.source}]`;
            if (v.name === currentVoice) opt.selected = true;
            select.appendChild(opt);
        });
    }
};

window.onSystemVoiceChange = function(voiceName) {
    if (window.HoloVoice && window.HoloVoice.setSelectedVoice) {
        window.HoloVoice.setSelectedVoice(voiceName);
    }
    if (voiceName) {
        HoloVoice.speakAgent("Voice profile updated: " + voiceName);
    } else {
        HoloVoice.speakAgent("Reset to persona default profile.");
    }
};

window.onVoicePitchSlider = function(val) {
    const disp = document.getElementById('pitchDisplay');
    if (disp) disp.textContent = parseFloat(val).toFixed(2) + 'x';
    if (window.HoloVoice && window.HoloVoice.setVoicePitch) {
        window.HoloVoice.setVoicePitch(val);
    }
};

window.onVoiceRateSlider = function(val) {
    const disp = document.getElementById('rateDisplay');
    if (disp) disp.textContent = parseFloat(val).toFixed(2) + 'x';
    if (window.HoloVoice && window.HoloVoice.setVoiceRate) {
        window.HoloVoice.setVoiceRate(val);
    }
};

window.testAuditionVoice = function() {
    if (window.HoloVoice && window.HoloVoice.auditionVoice) {
        window.HoloVoice.auditionVoice("Tactical cybersecurity holodeck voice synthesis operational. All systems standing by.");
    }
};

window.closeSettingsModal = function(e) {
    if (e && e.target && e.target.id !== 'settingsModal') return;
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.remove('open');
};

window.autoSaveApiKey = function(val) {
    state.apiKey = val.trim();
    localStorage.setItem('holo_api_key', state.apiKey);
    localStorage.setItem('ae_api_key', state.apiKey);
};

window.saveApiKeyDirect = function() {
    const input = document.getElementById('apiKeyInput');
    if (input) autoSaveApiKey(input.value);
    if (window.HoloBridge && window.HoloBridge.showToast) {
        window.HoloBridge.showToast("Gemini key saved");
    }
    const modal = document.getElementById('settingsModal');
    if (modal) modal.classList.remove('open');
    HoloVoice.speakAgent("Configuration saved. Holodeck online.");
};

window.toggleContinuousVoice = function(enabled) {
    HoloVoice.setContinuous(enabled);
};

window.testNetHunterBridge = function() {
    let online = false;
    if (window.HoloBridge && window.HoloBridge.isNetHunterOnline) {
        online = window.HoloBridge.isNetHunterOnline();
    }
    const statusText = document.getElementById('bridgeStatusText');
    const pill = document.getElementById('nhPill');
    if (statusText) {
        statusText.textContent = online ? 'ONLINE' : 'STANDBY';
        statusText.style.color = online ? '#00ff88' : '#ffb700';
    }
    if (pill) {
        pill.querySelector('.nh-label').textContent = online ? 'NH: ROOT' : 'NH: STANDBY';
        pill.querySelector('.nh-dot').style.background = online ? '#00ff88' : '#ffb700';
    }
};

window.toggleBridgeInfo = function() {
    const isOnline = window.HoloBridge && window.HoloBridge.isNetHunterOnline && window.HoloBridge.isNetHunterOnline();
    if (isOnline) {
        const out = executeCommand('uname -a && uptime');
        SpatialTasks.spawnTelemetryCard('Kali NetHunter Core', {
            "Status": "Online (UID 0)",
            "Kernel": "5.15 ARM64",
            "Uptime": "Active"
        });
        HoloVoice.speakAgent("Kali NetHunter root bridge is online with full hardware privileges.");
    } else {
        openSettingsModal();
    }
};

// Initial setup on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    switchPersona(state.persona);
    setTimeout(testNetHunterBridge, 800);
});
