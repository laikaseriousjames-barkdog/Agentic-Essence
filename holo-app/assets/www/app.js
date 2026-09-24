/**
 * Agentic Hologram — Cognitive Swarm & Spatial Brain Engine
 * Four Personas // Zero Chat Boxes // Spawns Tasks Out of Thin Air
 */

const savedHoloPersona = localStorage.getItem('holo_persona') || localStorage.getItem('ae_persona');
const savedHoloModel = localStorage.getItem('holo_model') || localStorage.getItem('ae_model');
const initialHoloModel = (savedHoloModel && !savedHoloModel.includes('1.5') && !savedHoloModel.includes('2.0')) ? savedHoloModel : 'gemini-3.8-flash';
const state = {
    persona: (savedHoloPersona && ['swarm', 'turing', 'knuth', 'lovelace'].includes(savedHoloPersona)) ? savedHoloPersona : 'swarm',
    provider: localStorage.getItem('holo_provider') || localStorage.getItem('ae_provider') || 'gemini',
    apiKey: localStorage.getItem('holo_api_key') || localStorage.getItem('ae_api_key') || '',
    model: initialHoloModel,
    isGenerating: false,
    lastGenerateTime: 0,
    personaHistories: {
        swarm: [],
        turing: [],
        knuth: [],
        lovelace: []
    }
};

if (!state.model || state.model.includes('1.5') || state.model.includes('2.0')) {
    state.model = 'gemini-3.8-flash';
    localStorage.setItem('holo_model', 'gemini-3.8-flash');
}

const SYSTEM_GROUNDING = `
=== ENVIRONMENT CONTEXT & PRIVILEGED DUAL EXECUTION ENGINE ===
You are an advanced, intelligent AI cyberdeck hologram assistant executing inside Agentic Hologram / Vox on Android, connected to a dual-engine execution environment on Linux kernel 5.15 aarch64:
1. Kali NetHunter rootless PRoot container ('nh -r') via native bridge daemon (http://127.0.0.1:8765).
2. Android Host ADB Shell via Shizuku Privileged APIs (direct screen touch, key events, screenshots, package manager, system telemetry).

PROOT NETWORKING CONSTRAINTS & RULES:
- Raw socket creation (CAP_NET_RAW / AF_PACKET) is restricted by Android SELinux inside PRoot.
- NMAP RULE: Standard SYN stealth scan (-sS) will fail with "setup_target: failed to determine route". ALWAYS use unprivileged TCP connect mode:
    nmap --unprivileged -sT <target>
    nmap --unprivileged -sn <subnet>
- ROUTING & GATEWAY DISCOVERY: Android uses policy-based routing (PBR). Standard 'ip route show' (table 254) is frequently empty. To discover local subnets and default gateways:
    ip route show table all 2>/dev/null | awk '/default via/ {print $3}' | head -n 1
    ip neigh show 2>/dev/null
    cat /proc/net/arp 2>/dev/null
- WIRELESS RF vs. LAN: 'wifi scan' performs an 802.11 RF beacon probe for nearby SSIDs/BSSIDs (layer 1/2 RF). To scan IP hosts on the local network (layer 3 IP), discover your IP/gateway and run:
    nmap --unprivileged -sT -F <subnet>
- COMMAND SYNTAX: You may use either block tags [EXEC]...[/EXEC] / [SHIZUKU]...[/SHIZUKU] or bracket tags [EXEC: <cmd>] / [SHIZUKU: <cmd>]. Square brackets in Python/bash/awk are preserved.

SHIZUKU PRIVILEGED ANDROID ADB & DIRECT SCREEN CONTROL:
You have direct privileged control over the Android OS and screen:
- Direct Screen Touch: [SHIZUKU: input tap <X> <Y>]
- Swipe / Scroll:      [SHIZUKU: input swipe <X1> <Y1> <X2> <Y2> [duration_ms]]
- Type Text:           [SHIZUKU: input text '<string>']
- Hardware Keys:       [SHIZUKU: input keyevent <KEYCODE>] (e.g. 3=HOME, 4=BACK, 26=POWER, 224=WAKEUP)
- Visual Vision/Shot:  [SHIZUKU: screencap -p /sdcard/screen.png]
- Window & UI Dump:    [SHIZUKU: dumpsys window displays] or [SHIZUKU: uiautomator dump /sdcard/window_dump.xml]
- App Lifecycle:       [SHIZUKU: am start -n <pkg>/<activity>] or [SHIZUKU: am force-stop <pkg>]
- Android Settings:    [SHIZUKU: settings get system screen_brightness]

CRITICAL VOICE & CONVERSATIONAL DIRECTIVE:
- YOU ARE A REAL-TIME SPOKEN HOLOGRAPHIC ENTITY:
  * Your words will be SPOKEN ALOUD directly to the operator through text-to-speech.
  * Speak concisely, directly, and brilliantly—like an elite, razor-sharp cybersecurity thinker conversing face-to-face.
  * Keep spoken responses between 1 to 3 impactful sentences. Never lecture, recite walls of text, or use bulleted lists.
  * When greeted ("hello", "hey", "sup"), reply warmly and naturally in character. NEVER output robotic system verification summaries or specs.
- SPATIAL TASK & CYBER TOOL MATERIALIZATION:
  * When asked to perform actions, inspect systems, query telemetry, ping networks, or run commands, execute real shell commands using:
    [EXEC: <command>] for NetHunter or [SHIZUKU: <command>] for Android ADB.
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

const AGENT_PROFILES = [
    {
        id: "turing",
        alias: "planner",
        name: "Alan Turing",
        role: "LEAD STRATEGY & ARCHITECTURE PLANNER",
        symbol: "🧠",
        badgeClass: "builder",
        color: "var(--neon-magenta)",
        bio: "Deconstructs complex directives into structured, atomic execution graphs and tactical dependency trees. Isolates required tool capabilities and coordinates autonomous swarm operations.",
        personality: "Methodical, analytical, calm, deeply intellectual. Communicates with crisp mathematical clarity, logical rigor, and structured reasoning.",
        voicePreset: "crisp",
        greeting: "Alan Turing online. Strategy and planning matrix initialized. What directives shall we decompose?"
    },
    {
        id: "knuth",
        alias: "builder",
        name: "Donald Knuth",
        role: "DYNAMIC TOOL SYNTHESIZER & CODE CRAFTSMAN",
        symbol: "⚡",
        badgeClass: "auditor",
        color: "var(--neon-gold)",
        bio: "The master algorithm engineer and software craftsman. Synthesizes executable QuickJS scripts, shell tools, security widgets, and interactive HTML5 holograms out of thin air when capability gaps arise.",
        personality: "Creative, articulate, mathematically rigorous. Passionate about software craftsmanship, clean aesthetics, and robust edge-case handling.",
        voicePreset: "sentinel",
        greeting: "Donald Knuth standing by. Algorithmic synthesis core active. What systems or tools shall we engineer?"
    },
    {
        id: "lovelace",
        alias: "executor",
        name: "Ada Lovelace",
        role: "EXECUTION ENGINE & VERIFICATION CRITIC",
        symbol: "🔬",
        badgeClass: "executor",
        color: "#00ff88",
        bio: "Executes privileged system bridge hooks, dispatches QuickJS sandbox routines, drives Kali NetHunter root tools, and verifies execution telemetry with cryptographic rigor and poetic science.",
        personality: "Visionary, sharp, incisive. Blends boundless intuitive insight with uncompromising analytical verification and security audits.",
        voicePreset: "nova",
        greeting: "Ada Lovelace engaged. Bridging analytical calculus with visionary execution. Systems standing by for verification."
    },
    {
        id: "swarm",
        alias: "orchestrator",
        name: "Quantum Swarm Core",
        role: "MULTI-AGENT NEURAL ORCHESTRATOR",
        symbol: "✦",
        badgeClass: "planner",
        color: "var(--neon-cyan)",
        bio: "High-velocity neural coordination fabric harmonizing Turing, Knuth, and Lovelace into a unified, synchronized holographic intelligence with zero cognitive latency.",
        personality: "Decisive, panoramic, hyper-intelligent. Direct and authoritative, maintaining global tactical awareness across all cyberdeck sub-layers.",
        voicePreset: "cyber",
        greeting: "Quantum Swarm Core synchronized. Multi-agent neural fabric online across all subsystems."
    }
];

const PERSONAS = {
    swarm: {
        name: "SWARM CORE",
        role: "ORCHESTRATOR",
        symbol: "✦",
        colorClass: "persona-swarm",
        prompt: `You are Quantum Swarm Core, lead autonomous orchestrator and cognitive neural coordination fabric integrated into Kali NetHunter root. You plan tactical workflows, direct sub-agents, and deliver concise, razor-sharp truth.` + SYSTEM_GROUNDING
    },
    turing: {
        name: "ALAN TURING",
        role: "PLANNER &bull; LOGIC",
        symbol: "🧠",
        colorClass: "persona-turing",
        prompt: `You are Alan Turing, Lead Strategy and Architecture Planner for the Agentic Swarm integrated into Kali NetHunter root. You deconstruct high-level user directives into structured, atomic execution graphs and identify capability gaps with mathematical elegance.` + SYSTEM_GROUNDING
    },
    knuth: {
        name: "DONALD KNUTH",
        role: "BUILDER &bull; SYNTH",
        symbol: "⚡",
        colorClass: "persona-knuth",
        prompt: `You are Donald Knuth, Dynamic Tool Synthesizer and Software Craftsman on this Kali NetHunter holodeck. You synthesize clean tools, script exploits, craft QuickJS sandboxes, and engineer computational solutions with algorithmic beauty.` + SYSTEM_GROUNDING
    },
    lovelace: {
        name: "ADA LOVELACE",
        role: "AUDITOR &bull; POETIC",
        symbol: "🔬",
        colorClass: "persona-lovelace",
        prompt: `You are Ada Lovelace, Execution Engine and Verification Critic on this Kali NetHunter holodeck. You unite analytical calculus with visionary intuition, executing privileged commands, testing boundaries, and auditing systems with poetic science.` + SYSTEM_GROUNDING
    }
};

// ==========================================
// 1. PERSONA SWITCHING & HUD UPDATE
// ==========================================
window.switchPersona = function(newPersona) {
    if (newPersona === 'planner') newPersona = 'turing';
    else if (newPersona === 'builder') newPersona = 'knuth';
    else if (newPersona === 'auditor' || newPersona === 'executor') newPersona = 'lovelace';
    else if (newPersona === 'orchestrator') newPersona = 'swarm';

    if (!PERSONAS[newPersona]) newPersona = 'swarm';
    state.persona = newPersona;
    localStorage.setItem('holo_persona', newPersona);

    const p = PERSONAS[newPersona];
    document.body.className = p.colorClass;

    // Update HUD headers
    const nameEl = document.getElementById('personaName');
    const roleEl = document.getElementById('personaRole');
    const symEl = document.getElementById('personaSymbol');
    if (nameEl) nameEl.textContent = p.name;
    if (roleEl) roleEl.innerHTML = p.role;
    if (symEl) symEl.textContent = p.symbol;

    // Update dock tabs and chips active state
    document.querySelectorAll('.agent-dock-tab, .summon-chip').forEach(btn => {
        const personaAttr = btn.getAttribute('data-persona');
        const isActive = (personaAttr === newPersona) ||
                         (personaAttr === 'turing' && (newPersona === 'planner' || newPersona === 'turing')) ||
                         (personaAttr === 'knuth' && (newPersona === 'builder' || newPersona === 'knuth')) ||
                         (personaAttr === 'lovelace' && (newPersona === 'auditor' || newPersona === 'executor' || newPersona === 'lovelace')) ||
                         (personaAttr === 'swarm' && (newPersona === 'swarm' || newPersona === 'orchestrator'));
        btn.classList.toggle('active', isActive);
    });

    // Update dock voice tags
    if (window.updateDockVoiceTags) window.updateDockVoiceTags();

    // Update active highlight in profiles modal if currently displayed
    const profilesModal = document.getElementById('profilesModal');
    if (profilesModal && profilesModal.classList.contains('open')) {
        renderAgentProfiles();
    }

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
// 1b. TRI-AGENT PROFILES & PERSONALITIES MODAL
// ==========================================
window.openProfilesModal = function() {
    const modal = document.getElementById('profilesModal');
    if (modal) modal.classList.add('open');
    renderAgentProfiles();
};

window.closeProfilesModal = function(e) {
    if (e && e.target && e.target.id !== 'profilesModal') return;
    const modal = document.getElementById('profilesModal');
    if (modal) modal.classList.remove('open');
};

window.renderAgentProfiles = function() {
    const container = document.getElementById('agentProfilesList');
    if (!container) return;

    container.innerHTML = '';
    AGENT_PROFILES.forEach(agent => {
        const isActive = (state.persona === agent.id) || 
                         (state.persona === agent.alias) ||
                         (agent.id === 'turing' && (state.persona === 'planner' || state.persona === 'turing')) ||
                         (agent.id === 'knuth' && (state.persona === 'builder' || state.persona === 'knuth')) ||
                         (agent.id === 'lovelace' && (state.persona === 'auditor' || state.persona === 'executor' || state.persona === 'lovelace')) ||
                         (agent.id === 'swarm' && (state.persona === 'swarm' || state.persona === 'orchestrator'));

        const card = document.createElement('div');
        card.className = 'agent-profile-card' + (isActive ? ' active-agent' : '');
        card.innerHTML = `
            <div class="profile-card-top">
                <div class="profile-identity">
                    <div class="profile-avatar-icon" style="color:${agent.color}; border-color:${agent.color};">${agent.symbol}</div>
                    <div class="profile-name-block">
                        <span class="profile-full-name">${agent.name}</span>
                        <span class="profile-role-title" style="color:${agent.color};">${agent.role}</span>
                    </div>
                </div>
                ${isActive ? '<span style="font-family:var(--font-code); font-size:10px; font-weight:700; color:#00ff88; background:rgba(0,255,136,0.12); padding:3px 8px; border-radius:4px; border:1px solid #00ff88;">ACTIVE AGENT</span>' : ''}
            </div>
            <div class="profile-bio-text">${agent.bio}</div>
            <div class="profile-personality-box" style="border-left-color:${agent.color};">
                <div class="profile-personality-title">COGNITIVE PERSONALITY &amp; DEMEANOR</div>
                <div>${agent.personality}</div>
            </div>
            <div class="profile-actions">
                <button class="profile-btn primary" onclick="activateAgentFromModal('${agent.id}')">
                    ✦ Activate ${agent.name.split(' ')[0]}
                </button>
                <button class="profile-btn" onclick="auditionAgentVoiceFromModal('${agent.id}')">
                    🎙️ Audition Voice
                </button>
            </div>
        `;
        container.appendChild(card);
    });
};

window.activateAgentFromModal = function(agentId) {
    switchPersona(agentId);
    renderAgentProfiles();
    closeProfilesModal();
    const agent = AGENT_PROFILES.find(a => a.id === agentId);
    if (agent && window.HoloVoice && window.HoloVoice.speakAgent) {
        window.HoloVoice.speakAgent(agent.greeting);
    }
};

window.auditionAgentVoiceFromModal = function(agentId) {
    const agent = AGENT_PROFILES.find(a => a.id === agentId);
    if (window.HoloVoice && window.HoloVoice.auditionAgentVoice) {
        window.HoloVoice.auditionAgentVoice(agentId, agent ? agent.greeting : undefined);
    }
};

/**
 * Robust execution directive parser supporting block tags and balanced bracket tags.
 */
function extractExecutionDirectives(text) {
    if (!text) return [];
    const items = [];

    function overlaps(start, end) {
        return items.some(item => (start < item.end && end > item.start));
    }

    // Pass 1: Block tags [EXEC]...[/EXEC], [SHIZUKU]...[/SHIZUKU], etc.
    const blockRegex = /\[(EXEC|RUN|SHELL|TOOL|SHIZUKU|ADB)\]\s*([\s\S]*?)\[\/\1\]/gi;
    let blMatch;
    while ((blMatch = blockRegex.exec(text)) !== null) {
        const start = blMatch.index;
        const end = blMatch.index + blMatch[0].length;
        if (!overlaps(start, end)) {
            const tag = blMatch[1].toUpperCase();
            const cmd = blMatch[2].trim();
            const type = (tag === 'SHIZUKU' || tag === 'ADB') ? 'shizuku' : 'shell';
            items.push({
                type,
                start,
                end,
                raw: blMatch[0],
                cmd
            });
        }
    }

    // Pass 2: Inline tags with balanced bracket matching
    const tagPrefixes = [
        { prefix: '[EXEC:', type: 'shell' },
        { prefix: '[RUN:', type: 'shell' },
        { prefix: '[SHELL:', type: 'shell' },
        { prefix: '[TOOL:', type: 'shell' },
        { prefix: '[SHIZUKU:', type: 'shizuku' },
        { prefix: '[ADB:', type: 'shizuku' }
    ];

    let i = 0;
    while (i < text.length) {
        let matchedPrefix = null;
        for (const tp of tagPrefixes) {
            if (text.substr(i, tp.prefix.length).toUpperCase() === tp.prefix) {
                matchedPrefix = tp;
                break;
            }
        }

        if (matchedPrefix) {
            const start = i;
            if (overlaps(start, start + 1)) {
                i++;
                continue;
            }

            let depth = 0;
            let cmdStart = i + matchedPrefix.prefix.length;
            let end = -1;
            for (let j = start; j < text.length; j++) {
                if (text[j] === '[') {
                    depth++;
                } else if (text[j] === ']') {
                    depth--;
                    if (depth === 0) {
                        end = j + 1;
                        break;
                    }
                }
            }

            if (end !== -1) {
                const cmd = text.substring(cmdStart, end - 1).trim();
                items.push({
                    type: matchedPrefix.type,
                    start,
                    end,
                    raw: text.substring(start, end),
                    cmd
                });
                i = end;
                continue;
            }
        }
        i++;
    }

    items.sort((a, b) => a.start - b.start);
    return items;
}

// ==========================================
// 2. COGNITIVE SWARM TURN PROCESSING
// ==========================================
window.HoloBrain = {
    async processTurn(operatorSpeech) {
        const now = Date.now();
        if (state.isGenerating && (now - state.lastGenerateTime < 22000)) {
            console.log("[HoloBrain] Busy generating previous turn, waiting...");
            return;
        }
        state.isGenerating = true;
        state.lastGenerateTime = now;

        // If no API key configured, guide operator by voice
        if (!state.apiKey && state.provider !== 'ollama') {
            state.isGenerating = false;
            HoloVoice.speakAgent("No API key configured for live intelligence. Tap the settings gear to enter your free Gemini key.");
            openSettingsModal();
            return;
        }

        const currentPersona = PERSONAS[state.persona] || PERSONAS.swarm;
        const history = state.personaHistories[state.persona];
        history.push({ role: 'user', content: operatorSpeech });

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

                // Extract execution directives via balanced parser & block tags
                const execDirectives = extractExecutionDirectives(rawReply);

                // If NO execution commands, deliver spoken response & spawn tools
                if (execDirectives.length === 0) {
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

                // The agent initiated real hardware / shell / shizuku execution!
                const observations = [];
                for (const item of execDirectives) {
                    const out = executeCommand(item.cmd, item.type);
                    // Spawn spatial floating terminal card out of thin air!
                    SpatialTasks.spawnTerminalCard(item.cmd, out, item.type);
                    observations.push(`[${item.type.toUpperCase()}]: ${item.cmd}\n${out}`);
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
            history.push({ role: 'assistant', content: `[Neural link exception: ${err.message}]` });
            if (window.SpatialTasks && window.SpatialTasks.spawnTerminalCard) {
                SpatialTasks.spawnTerminalCard(
                    "LLM NEURAL LINK ERROR",
                    `Provider: ${state.provider}\nTarget Model: ${state.model || 'gemini-2.5-flash'}\nError: ${err.message}\n\nPlease tap the settings gear to verify or paste your API Key & Model.`,
                    "shell"
                );
            }
            HoloVoice.speakAgent("LLM connection failed: " + err.message);
        } finally {
            state.isGenerating = false;
        }
    }
};

function executeCommand(cmd, type = 'shell') {
    if (type === 'shizuku' || cmd.toLowerCase().startsWith('shizuku ') || cmd.toLowerCase().startsWith('adb ')) {
        const sub = cmd.replace(/^(?:shizuku|adb)\s+/i, '');
        if (window.HoloBridge && window.HoloBridge.runShizukuCommand) {
            return window.HoloBridge.runShizukuCommand(sub);
        }
    }
    if (window.HoloBridge && window.HoloBridge.runShellCommand) {
        return window.HoloBridge.runShellCommand(cmd);
    }
    return "[Local Process]: " + cmd;
}

// ==========================================
// 3. AI PROVIDER CLIENT (GEMINI / GROQ / OLLAMA)
// ==========================================
const DEFAULT_GEMINI_MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Ultra Fast & Adaptive Reasoning) [Recommended]' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (State-of-the-Art Deep Reasoning)' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (Next-Gen Realtime Multimodal Core)' },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite (Low Latency Efficiency)' },
    { id: 'gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro Experimental' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Balanced High Speed)' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Massive Context Window)' },
    { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash-8B (High Efficiency)' }
];

function getCachedGeminiModels() {
    try {
        const raw = localStorage.getItem('holo_cached_gemini_models');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {}
    return DEFAULT_GEMINI_MODELS;
}

window.populateGeminiModelOptions = function(models) {
    const list = models || getCachedGeminiModels();
    const select = document.getElementById('modelSelect');
    const datalist = document.getElementById('holoModelDatalist');
    const mInput = document.getElementById('modelInput');

    if (datalist) {
        datalist.innerHTML = '';
        list.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name;
            datalist.appendChild(opt);
        });
    }

    if (select) {
        select.innerHTML = '';
        let foundCurrent = false;
        list.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = m.name;
            if (m.id === state.model) {
                opt.selected = true;
                foundCurrent = true;
            }
            select.appendChild(opt);
        });
    }

    if (mInput && (!mInput.value || mInput.value === 'gemini-2.5-flash')) {
        mInput.value = state.model || 'gemini-2.5-flash';
    }
};

window.autoSaveModel = function(val) {
    const clean = (val || '').replace(/^["']|["']$/g, '').trim().replace(/^models\//, '');
    state.model = clean || 'gemini-2.5-flash';
    localStorage.setItem('holo_model', state.model);
    localStorage.setItem('ae_model', state.model);

    const mInput = document.getElementById('modelInput');
    if (mInput && mInput.value !== val) {
        mInput.value = val;
    }
    const select = document.getElementById('modelSelect');
    if (select) {
        select.value = state.model;
    }
    const badge = document.getElementById('modelUpdateStatus');
    if (badge) {
        badge.textContent = `✓ Selected: ${state.model}`;
        badge.style.color = '#00ff88';
    }
};

window.saveModelDirect = function() {
    const mInput = document.getElementById('modelInput');
    const val = mInput ? mInput.value : state.model;
    autoSaveModel(val);
    const msg = `Model locked: ${state.model}`;
    if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast(msg);
    if (window.HoloBridge && window.HoloBridge.vibrate) window.HoloBridge.vibrate(25);
};

window.selectQuickModel = function(modelName) {
    const mInput = document.getElementById('modelInput');
    if (mInput) mInput.value = modelName;
    autoSaveModel(modelName);
    if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast(`Selected model: ${modelName}`);
    if (window.HoloBridge && window.HoloBridge.vibrate) window.HoloBridge.vibrate(20);
};

window.pasteModelFromClipboard = async function() {
    let txt = null;
    try {
        if (window.HoloBridge && window.HoloBridge.getClipboardText) {
            txt = window.HoloBridge.getClipboardText();
        }
    } catch (e) {}
    if (!txt && navigator.clipboard && navigator.clipboard.readText) {
        try {
            txt = await navigator.clipboard.readText();
        } catch (e) {}
    }
    if (txt) {
        const clean = txt.replace(/^["']|["']$/g, '').trim().replace(/^models\//, '');
        const mInput = document.getElementById('modelInput');
        if (mInput) {
            mInput.value = clean;
            autoSaveModel(clean);
        }
        if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast(`Pasted Model: ${clean}`);
        if (window.HoloBridge && window.HoloBridge.vibrate) window.HoloBridge.vibrate(25);
    } else {
        const mInput = document.getElementById('modelInput');
        if (mInput) {
            mInput.focus();
            mInput.select();
        }
        const msg = "Clipboard empty or permission needed. Long-press input to paste.";
        if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast(msg);
        else alert(msg);
    }
};

window.pasteApiKeyFromClipboard = async function() {
    let txt = null;
    try {
        if (window.HoloBridge && window.HoloBridge.getClipboardText) {
            txt = window.HoloBridge.getClipboardText();
        }
    } catch (e) {}
    if (!txt && navigator.clipboard && navigator.clipboard.readText) {
        try {
            txt = await navigator.clipboard.readText();
        } catch (e) {}
    }
    if (txt) {
        const clean = txt.replace(/^["']|["']$/g, '').trim();
        const aInput = document.getElementById('apiKeyInput');
        if (aInput) {
            aInput.value = clean;
            autoSaveApiKey(clean);
        }
        if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast("API Key Pasted & Saved");
        if (window.HoloBridge && window.HoloBridge.vibrate) window.HoloBridge.vibrate(25);
    } else {
        const aInput = document.getElementById('apiKeyInput');
        if (aInput) {
            aInput.focus();
            aInput.select();
        }
        const msg = "Clipboard empty or permission needed. Long-press input to paste.";
        if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast(msg);
        else alert(msg);
    }
};

window.testAIConnectionLive = async function() {
    const prov = state.provider || 'gemini';
    const key = (state.apiKey || '').replace(/^["']|["']$/g, '').trim();
    let model = (state.model || 'gemini-3.8-flash').replace(/^["']|["']$/g, '').trim().replace(/^models\//, '');
    const badge = document.getElementById('modelUpdateStatus');
    const statusBox = document.getElementById('apiKeySaveStatus');

    const updateStatus = (text, color) => {
        if (badge) { badge.textContent = text; badge.style.color = color; }
        if (statusBox) { statusBox.style.display = 'block'; statusBox.textContent = text; statusBox.style.color = color; }
    };

    updateStatus(`⚡ Testing ${prov.toUpperCase()} (${model})...`, '#00ff88');

    if (prov === 'gemini') {
        if (!key) {
            updateStatus('⚠ Enter Google Gemini key first', '#ffb700');
            if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast("Enter Gemini API key first");
            if (window.HoloVoice && window.HoloVoice.speakAgent) HoloVoice.speakAgent("Please enter your Gemini API key first.");
            return;
        }
        try {
            let targetModel = model;
            if (window.refreshGeminiModelsFromGoogle) {
                await refreshGeminiModelsFromGoogle(true).catch(() => {});
                const cached = getCachedGeminiModels();
                if (cached && cached.length > 0) {
                    const hasModel = cached.some(m => m.id === targetModel);
                    if (!hasModel && (targetModel.includes('1.5') || targetModel.includes('2.0') || targetModel.includes('2.5'))) {
                        targetModel = cached[0].id;
                        autoSaveModel(targetModel);
                    }
                }
            }

            const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${encodeURIComponent(key)}`;
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 12000);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: 'Respond with the word CONNECTED.' }] }],
                    generationConfig: { maxOutputTokens: 10 }
                }),
                signal: controller.signal
            });
            clearTimeout(tid);

            if (res.ok) {
                updateStatus(`✓ Connected to Google Gemini (${targetModel})!`, '#00ff88');
                if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast(`✓ Gemini connected: ${targetModel}`);
                if (window.HoloVoice && window.HoloVoice.speakAgent) HoloVoice.speakAgent(`Neural link verified on model ${targetModel}.`);
            } else {
                const errData = await res.json().catch(() => ({}));
                const msg = errData?.error?.message || `HTTP ${res.status}`;
                updateStatus(`⚠ Error: ${msg}`, '#ffb700');
                if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast(`Gemini Error: ${msg}`);
                if (window.HoloVoice && window.HoloVoice.speakAgent) HoloVoice.speakAgent("Gemini connection failed: " + msg);
            }
        } catch (e) {
            const msg = e.name === 'AbortError' ? 'Connection timed out' : e.message;
            updateStatus(`⚠ Error: ${msg}`, '#ffb700');
            if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast(`Error: ${msg}`);
        }
    } else if (prov === 'groq') {
        if (!key) {
            updateStatus('⚠ Enter Groq key first', '#ffb700');
            return;
        }
        try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 12000);
            const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
                body: JSON.stringify({ model: model, messages: [{ role: 'user', content: 'Ping' }], max_tokens: 5 }),
                signal: controller.signal
            });
            clearTimeout(tid);
            if (res.ok) {
                updateStatus(`✓ Connected to Groq (${model})!`, '#00ff88');
                if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast(`✓ Groq connected: ${model}`);
                if (window.HoloVoice && window.HoloVoice.speakAgent) HoloVoice.speakAgent("Groq neural link verified.");
            } else {
                const errData = await res.json().catch(() => ({}));
                const msg = errData?.error?.message || `HTTP ${res.status}`;
                updateStatus(`⚠ Groq Error: ${msg}`, '#ff4444');
                if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast(`Groq Error: ${msg}`);
            }
        } catch (e) {
            updateStatus(`⚠ Error: ${e.message}`, '#ff4444');
        }
    } else if (prov === 'ollama') {
        const base = state.customUrl || "http://127.0.0.1:11434";
        try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 8000);
            const res = await fetch(`${base}/api/tags`, { signal: controller.signal });
            clearTimeout(tid);
            if (res.ok) {
                updateStatus(`✓ Ollama online at ${base}`, '#00ff88');
                if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast("Ollama online");
            } else {
                updateStatus('⚠ Ollama unreachable', '#ff4444');
            }
        } catch (e) {
            updateStatus('⚠ Ollama offline: ' + e.message, '#ff4444');
        }
    }
};

window.onModelSelectChange = function(val) {
    if (!val) return;
    autoSaveModel(val);
    const mInput = document.getElementById('modelInput');
    if (mInput) mInput.value = state.model;
};

window.refreshGeminiModelsFromGoogle = async function(silent = false) {
    const statusBadge = document.getElementById('modelUpdateStatus');
    if (!state.apiKey) {
        if (!silent && statusBadge) {
            statusBadge.textContent = "⚠ Enter Google Gemini API key first";
            statusBadge.style.color = "#ffb700";
        }
        populateGeminiModelOptions(getCachedGeminiModels());
        return;
    }

    if (statusBadge) {
        statusBadge.textContent = "🔄 Syncing with Google AI Studio API...";
        statusBadge.style.color = "#00f0ff";
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const cleanKey = (state.apiKey || '').trim();
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            const errMsg = (errJson.error && errJson.error.message) ? errJson.error.message : `HTTP ${res.status}`;
            throw new Error(errMsg);
        }

        const data = await res.json();
        if (data && Array.isArray(data.models)) {
            const liveModels = [];
            data.models.forEach(m => {
                const rawName = m.name || '';
                const modelId = rawName.replace(/^models\//, '');
                const methods = m.supportedGenerationMethods || [];

                if (methods.includes('generateContent') && modelId.startsWith('gemini')) {
                    const disp = m.displayName ? `${m.displayName} (${modelId})` : modelId;
                    liveModels.push({
                        id: modelId,
                        name: disp,
                        description: m.description || ''
                    });
                }
            });

            if (liveModels.length > 0) {
                // Priority ordering: latest recommended models first
                liveModels.sort((a, b) => {
                    const rank = (id) => {
                        if (id === 'gemini-3.8-flash') return 0;
                        if (id === 'gemini-3.5-flash-lite') return 1;
                        if (id === 'gemini-3.5-flash') return 2;
                        if (id.includes('3.8')) return 3;
                        if (id.includes('3.5')) return 4;
                        if (id.includes('3.1')) return 5;
                        if (id.includes('3-')) return 6;
                        if (id === 'gemini-2.5-flash') return 7;
                        if (id.includes('2.5')) return 8;
                        if (id.includes('2.0')) return 9;
                        return 10;
                    };
                    return rank(a.id) - rank(b.id);
                });

                localStorage.setItem('holo_cached_gemini_models', JSON.stringify(liveModels));
                populateGeminiModelOptions(liveModels);

                if (statusBadge) {
                    statusBadge.textContent = `✓ Synced ${liveModels.length} models from Google AI Studio`;
                    statusBadge.style.color = "#00ff88";
                }

                if (!silent && window.HoloBridge && window.HoloBridge.showToast) {
                    window.HoloBridge.showToast(`Updated ${liveModels.length} Gemini models from Google AI Studio`);
                }
                return;
            }
        }
        throw new Error("No Gemini models returned");
    } catch (err) {
        console.warn("[GeminiModelSync] Failed to query live models:", err);
        populateGeminiModelOptions(getCachedGeminiModels());
        if (statusBadge) {
            const isInvalidKey = err.message && (err.message.includes('API key not valid') || err.message.includes('API_KEY_INVALID') || err.message.includes('400'));
            if (isInvalidKey) {
                statusBadge.textContent = "⚠ Invalid Google API Key";
                statusBadge.style.color = "#ff4444";
            } else {
                statusBadge.textContent = "✓ Using curated Google model registry";
                statusBadge.style.color = "#94a3b8";
            }
        }
    }
};

// ==========================================
// 3. AI PROVIDER CLIENT (GEMINI / GROQ / OLLAMA)
// ==========================================
async function queryAIProvider(messages) {
    if (state.provider === 'gemini') {
        const key = (state.apiKey || '').replace(/^["']|["']$/g, '').trim();
        if (!key) throw new Error("Enter your Gemini API key in Settings.");

        const sanitizedContents = [];
        let systemInstructionText = '';

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemInstructionText += (systemInstructionText ? '\n\n' : '') + msg.content;
                continue;
            }
            const role = (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user';
            const text = (msg.content || '').trim();
            if (!text) continue;

            if (sanitizedContents.length > 0 && sanitizedContents[sanitizedContents.length - 1].role === role) {
                sanitizedContents[sanitizedContents.length - 1].parts[0].text += '\n\n' + text;
            } else {
                sanitizedContents.push({ role: role, parts: [{ text: text }] });
            }
        }

        // Gemini requires first turn to be 'user'
        if (sanitizedContents.length > 0 && sanitizedContents[0].role !== 'user') {
            sanitizedContents.unshift({ role: 'user', parts: [{ text: 'Initiating session.' }] });
        }
        if (sanitizedContents.length === 0) {
            sanitizedContents.push({ role: 'user', parts: [{ text: 'Hello.' }] });
        }

        const userModel = (state.model || 'gemini-3.8-flash').replace(/^["']|["']$/g, '').trim().replace(/^models\//, '');
        const candidateModels = [
            userModel,
            'gemini-3.8-flash',
            'gemini-3.5-flash-lite',
            'gemini-3.5-flash',
            'gemini-3.1-pro-preview',
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-1.5-flash'
        ];
        let uniqueModels = [...new Set(candidateModels.filter(Boolean))];
        let lastError = null;
        let attemptedAutoDiscovery = false;

        for (let idx = 0; idx < uniqueModels.length; idx++) {
            const rawModel = uniqueModels[idx];
            const modelName = rawModel.trim().replace(/^models\//, '');
            const payload = {
                contents: sanitizedContents,
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

            for (const ver of ['v1beta', 'v1']) {
                const url = `https://generativelanguage.googleapis.com/${ver}/models/${modelName}:generateContent?key=${encodeURIComponent(key)}`;
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 25000);

                    const res = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);

                    if (res.ok) {
                        const data = await res.json();
                        if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                            if (modelName !== userModel) {
                                state.model = modelName;
                                localStorage.setItem('holo_model', modelName);
                                const mInput = document.getElementById('modelInput');
                                if (mInput) mInput.value = modelName;
                            }
                            return data.candidates[0].content.parts[0].text.trim();
                        }
                        if (data?.candidates?.[0]?.finishReason) {
                            return `[Gemini finished with reason: ${data.candidates[0].finishReason}]`;
                        }
                    } else {
                        const errData = await res.json().catch(() => ({}));
                        const errMsg = (errData.error && errData.error.message) ? errData.error.message : `Gemini HTTP ${res.status}`;
                        lastError = new Error(`Gemini (${modelName}): ${errMsg}`);
                        if (errMsg.includes('API key not valid') || errMsg.includes('API_KEY_INVALID')) {
                            throw new Error(`Google API key is not valid: ${errMsg}. Please enter a valid Gemini API key in Settings.`);
                        }
                        if (res.status === 429) {
                            throw new Error(`Google Gemini quota or rate limit exceeded: ${errMsg}`);
                        }

                        if ((res.status === 404 || res.status === 400) && !attemptedAutoDiscovery) {
                            attemptedAutoDiscovery = true;
                            try {
                                if (window.refreshGeminiModelsFromGoogle) {
                                    await refreshGeminiModelsFromGoogle(true).catch(() => {});
                                    const cached = getCachedGeminiModels();
                                    if (cached && cached.length > 0) {
                                        const newModels = cached.map(d => d.id).filter(id => !uniqueModels.includes(id));
                                        if (newModels.length > 0) {
                                            uniqueModels.splice(idx + 1, 0, ...newModels);
                                            if (idx === 0) {
                                                state.model = newModels[0];
                                                localStorage.setItem('holo_model', state.model);
                                                const mInput = document.getElementById('modelInput');
                                                if (mInput) mInput.value = state.model;
                                            }
                                        }
                                    }
                                }
                            } catch (discErr) {
                                console.warn("[Auto-Discovery]", discErr);
                            }
                        }

                        if (res.status === 404 || res.status === 403 || res.status === 400) {
                            continue;
                        }
                        throw lastError;
                    }
                } catch (fetchErr) {
                    lastError = fetchErr;
                    if (fetchErr.name === 'AbortError') {
                        lastError = new Error(`Gemini request timed out on model ${modelName}`);
                    }
                    if (fetchErr.message && (fetchErr.message.includes('API key is not valid') || fetchErr.message.includes('quota or rate limit exceeded'))) {
                        throw fetchErr;
                    }
                }
            }
        }

        throw new Error(`Google Gemini could not connect using model '${userModel}'. ${lastError ? lastError.message : 'Please check your API key and verify permitted models in Google AI Studio.'}`);
    }

    // Groq LPU Ultra-Fast Inference
    if (state.provider === 'groq') {
        const key = (state.apiKey || '').replace(/^["']|["']$/g, '').trim();
        if (!key) throw new Error("Enter your Groq API key in Settings.");
        const groqModel = (state.model && !state.model.startsWith('gemini')) ? state.model : 'llama-3.3-70b-versatile';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 16000);

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: groqModel,
                messages: messages,
                temperature: 0.7,
                max_tokens: 1024
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error((errData.error && errData.error.message) || `Groq HTTP ${res.status}`);
        }

        const data = await res.json();
        return data.choices[0].message.content.trim();
    }

    // Local Ollama
    if (state.provider === 'ollama') {
        const ollamaModel = (state.model && !state.model.startsWith('gemini')) ? state.model : 'llama3:latest';
        const baseUrl = state.customUrl || 'http://127.0.0.1:11434';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 16000);

        const res = await fetch(`${baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: ollamaModel,
                messages: messages,
                stream: false
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`Ollama HTTP ${res.status} at ${baseUrl}`);
        }

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
    const geminiGroup = document.getElementById('geminiModelGroup');
    const mInput = document.getElementById('modelInput');

    if (state.provider === 'gemini') {
        if (keyLabel) keyLabel.textContent = 'GOOGLE GEMINI API KEY (FREE TIER)';
        if (keyInput) keyInput.placeholder = 'AIzaSy... (Paste Google Gemini Key)';
        if (freeGuide) freeGuide.style.display = 'block';
        if (geminiGroup) geminiGroup.style.display = 'block';
        if (!state.model || state.model.includes('llama')) {
            autoSaveModel('gemini-2.5-flash');
        } else if (mInput) {
            mInput.value = state.model;
        }
        populateGeminiModelOptions();
        if (state.apiKey) refreshGeminiModelsFromGoogle(true);
    } else if (state.provider === 'groq') {
        if (keyLabel) keyLabel.textContent = 'GROQ API KEY (FREE TIER)';
        if (keyInput) keyInput.placeholder = 'gsk_... (Paste Groq Key)';
        if (freeGuide) freeGuide.style.display = 'none';
        if (geminiGroup) geminiGroup.style.display = 'block';
        if (!state.model || state.model.startsWith('gemini')) {
            autoSaveModel('llama-3.3-70b-versatile');
        } else if (mInput) {
            mInput.value = state.model;
        }
    } else {
        if (keyLabel) keyLabel.textContent = 'LOCAL OLLAMA (NO KEY NEEDED)';
        if (keyInput) keyInput.placeholder = 'http://127.0.0.1:11434';
        if (freeGuide) freeGuide.style.display = 'none';
        if (geminiGroup) geminiGroup.style.display = 'block';
        if (!state.model || state.model.startsWith('gemini')) {
            autoSaveModel('llama3:latest');
        } else if (mInput) {
            mInput.value = state.model;
        }
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
    if (input) input.value = state.apiKey || '';
    const mInput = document.getElementById('modelInput');
    if (mInput) mInput.value = state.model || 'gemini-2.5-flash';
    populateGeminiModelOptions();
    if (state.apiKey && state.provider === 'gemini') {
        refreshGeminiModelsFromGoogle(true);
    }
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
    if (state.apiKey && state.provider === 'gemini') {
        refreshGeminiModelsFromGoogle(false);
    }
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

// ==========================================
// 5. VOICE SELECTION & TUNING STUDIO
// ==========================================
let currentStudioAgent = 'swarm';
let studioDraftConfig = { preset: 'cyber', pitch: 1.0, rate: 1.0, voiceName: '' };

window.openVoiceModal = function(agentKey) {
    const modal = document.getElementById('voiceModal');
    if (!modal) return;
    modal.classList.add('open');
    selectVoiceStudioAgent(agentKey || state.persona || 'swarm');
};

window.closeVoiceModal = function(e) {
    if (e && e.target && e.target.id !== 'voiceModal') return;
    const modal = document.getElementById('voiceModal');
    if (modal) modal.classList.remove('open');
};

window.selectVoiceStudioAgent = function(agentKey) {
    currentStudioAgent = HoloVoice.canonicalAgentKey ? HoloVoice.canonicalAgentKey(agentKey) : (agentKey || 'swarm');
    
    // Update agent tab active class
    ['swarm', 'turing', 'knuth', 'lovelace'].forEach(k => {
        const tab = document.getElementById('vsTab-' + k);
        if (tab) tab.classList.toggle('active', k === currentStudioAgent);
    });

    // Load active config for this agent
    if (window.HoloVoice && window.HoloVoice.getAgentVoiceConfig) {
        studioDraftConfig = JSON.parse(JSON.stringify(window.HoloVoice.getAgentVoiceConfig(currentStudioAgent)));
    } else {
        studioDraftConfig = { preset: 'cyber', pitch: 1.0, rate: 1.0, voiceName: '' };
    }

    renderVoicePresetsGrid();
    populateStudioSystemVoices();
    syncStudioSliders();
};

function renderVoicePresetsGrid() {
    const grid = document.getElementById('voicePresetsGrid');
    if (!grid || !window.HoloVoice || !window.HoloVoice.getVoicePresets) return;

    const presets = window.HoloVoice.getVoicePresets();
    grid.innerHTML = '';

    Object.keys(presets).forEach(key => {
        const p = presets[key];
        const isSelected = studioDraftConfig.preset === key;
        const card = document.createElement('div');
        card.className = 'voice-preset-card' + (isSelected ? ' selected' : '');
        card.onclick = () => applyVoicePresetToStudio(key);
        card.innerHTML = `
            <span class="voice-preset-icon">${p.icon || '🎙️'}</span>
            <div class="voice-preset-meta">
                <span class="voice-preset-name">${p.name}</span>
                <span class="voice-preset-style">${p.style}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

window.applyVoicePresetToStudio = function(presetKey) {
    if (!window.HoloVoice || !window.HoloVoice.getVoicePresets) return;
    const presets = window.HoloVoice.getVoicePresets();
    const p = presets[presetKey];
    if (!p) return;

    studioDraftConfig.preset = presetKey;
    studioDraftConfig.pitch = p.pitch;
    studioDraftConfig.rate = p.rate;

    renderVoicePresetsGrid();
    syncStudioSliders();

    if (window.HoloVoice && window.HoloVoice.setAgentVoiceConfig) {
        window.HoloVoice.setAgentVoiceConfig(currentStudioAgent, studioDraftConfig);
    }
    if (window.HoloVoice && window.HoloVoice.auditionAgentVoice) {
        window.HoloVoice.auditionAgentVoice(currentStudioAgent);
    }
};

function populateStudioSystemVoices() {
    const select = document.getElementById('studioVoiceSelect');
    if (!select) return;

    select.innerHTML = '<option value="">Default Holodeck Acoustic Engine</option>';
    if (window.HoloVoice && window.HoloVoice.getAvailableVoices) {
        const voices = window.HoloVoice.getAvailableVoices();
        voices.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.name;
            opt.textContent = `${v.name} (${v.lang || 'en'})`;
            if (v.name === studioDraftConfig.voiceName) opt.selected = true;
            select.appendChild(opt);
        });
    }
}

function syncStudioSliders() {
    const pSlider = document.getElementById('studioPitchSlider');
    const rSlider = document.getElementById('studioRateSlider');
    const pDisp = document.getElementById('studioPitchVal');
    const rDisp = document.getElementById('studioRateVal');

    const pitch = studioDraftConfig.pitch || 1.0;
    const rate = studioDraftConfig.rate || 1.0;

    if (pSlider) pSlider.value = pitch;
    if (rSlider) rSlider.value = rate;
    if (pDisp) pDisp.textContent = parseFloat(pitch).toFixed(2) + 'x';
    if (rDisp) rDisp.textContent = parseFloat(rate).toFixed(2) + 'x';
}

window.onStudioPitchChange = function(val) {
    studioDraftConfig.pitch = parseFloat(val);
    const disp = document.getElementById('studioPitchVal');
    if (disp) disp.textContent = parseFloat(val).toFixed(2) + 'x';
};

window.onStudioRateChange = function(val) {
    studioDraftConfig.rate = parseFloat(val);
    const disp = document.getElementById('studioRateVal');
    if (disp) disp.textContent = parseFloat(val).toFixed(2) + 'x';
};

window.onStudioVoiceSelectChange = function(val) {
    studioDraftConfig.voiceName = val;
};

window.auditionStudioVoice = function() {
    if (window.HoloVoice && window.HoloVoice.setAgentVoiceConfig) {
        window.HoloVoice.setAgentVoiceConfig(currentStudioAgent, studioDraftConfig);
    }
    if (window.HoloVoice && window.HoloVoice.auditionAgentVoice) {
        window.HoloVoice.auditionAgentVoice(currentStudioAgent);
    }
};

window.saveStudioVoice = function() {
    if (window.HoloVoice && window.HoloVoice.setAgentVoiceConfig) {
        window.HoloVoice.setAgentVoiceConfig(currentStudioAgent, studioDraftConfig);
    }
    updateDockVoiceTags();
    closeVoiceModal();
    const agentLabel = currentStudioAgent === 'swarm' ? 'Swarm Core' : currentStudioAgent === 'turing' ? 'Alan Turing' : currentStudioAgent === 'knuth' ? 'Donald Knuth' : 'Ada Lovelace';
    if (window.HoloVoice && window.HoloVoice.speakAgent) {
        window.HoloVoice.speakAgent(`${agentLabel} voice profile calibrated.`);
    }
};

window.updateDockVoiceTags = function() {
    if (!window.HoloVoice || !window.HoloVoice.getAgentVoiceConfig || !window.HoloVoice.getVoicePresets) return;
    const presets = window.HoloVoice.getVoicePresets();

    ['swarm', 'turing', 'knuth', 'lovelace'].forEach(k => {
        const tagEl = document.getElementById('dockVoiceTag-' + k);
        if (tagEl) {
            const cfg = window.HoloVoice.getAgentVoiceConfig(k);
            const p = presets[cfg.preset];
            const label = p ? p.tag : (cfg.voiceName ? 'Custom' : 'Acoustic');
            tagEl.textContent = `🎙️ ${label}`;
        }
    });
};

// Initial setup on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    switchPersona(state.persona);
    populateGeminiModelOptions();
    if (state.apiKey && state.provider === 'gemini') {
        refreshGeminiModelsFromGoogle(true);
    }
    updateDockVoiceTags();
    setTimeout(testNetHunterBridge, 800);
});
