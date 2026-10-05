// ===================== SAFE STORAGE WRAPPER =====================
const SafeStorage = {
    _mem: {},
    _hasLs: null,
    _checkLs() {
        if (this._hasLs !== null) return this._hasLs;
        try {
            if (typeof window !== 'undefined' && 'localStorage' in window && window.localStorage !== null) {
                const probe = '__ae_storage_probe__';
                window.localStorage.setItem(probe, probe);
                const val = window.localStorage.getItem(probe);
                window.localStorage.removeItem(probe);
                this._hasLs = (val === probe);
                return this._hasLs;
            }
        } catch (e) {
            this._hasLs = false;
        }
        this._hasLs = false;
        return false;
    },
    getItem(k) {
        if (this._checkLs()) {
            try {
                const v = window.localStorage.getItem(k);
                if (v !== null && v !== undefined) return v;
            } catch (e) {}
        }
        return Object.prototype.hasOwnProperty.call(this._mem, k) ? this._mem[k] : null;
    },
    setItem(k, v) {
        const str = String(v);
        this._mem[k] = str;
        if (this._checkLs()) {
            try {
                window.localStorage.setItem(k, str);
            } catch (e) {}
        }
    },
    removeItem(k) {
        delete this._mem[k];
        if (this._checkLs()) {
            try {
                window.localStorage.removeItem(k);
            } catch (e) {}
        }
    },
    clear() {
        this._mem = {};
        if (this._checkLs()) {
            try {
                window.localStorage.clear();
            } catch (e) {}
        }
    }
};
if (typeof window !== 'undefined') {
    window.SafeStorage = SafeStorage;
}

/**
 * Agentic Hologram — Voice Control & Real-Time Conversational Engine
 * Continuous Voice-First Turn-Taking // Audio Reactive Lip-Sync // Speech Recognition
 */

window.HoloVoice = (function() {
    let recognition = null;
    let isListening = false;
    let isSpeaking = false;
    let isContinuous = false;
    try {
        isContinuous = (localStorage.getItem('holo_continuous_voice') === 'true');
    } catch (e) {
        isContinuous = (SafeStorage.getItem('holo_continuous_voice') === 'true');
    }
    let consecutiveTimeouts = 0;
    let currentSpeechText = '';
    let speechSilenceTimer = null;
    let audioAnimInterval = null;

    // Operator Voice Preferences & Acoustic Profiles
    let selectedSystemVoiceName = SafeStorage.getItem('holo_selected_voice') || '';
    let userVoicePitch = parseFloat(SafeStorage.getItem('holo_voice_pitch') || '1.0');
    let userVoiceRate = parseFloat(SafeStorage.getItem('holo_voice_rate') || '1.0');

    // Canonical Tri-Agent Acoustic Presets & Audio Personas
    const VOICE_PRESETS = {
        cyber: { id: "cyber", name: "Cyber Operator", style: "Calm British Operator", pitch: 0.88, rate: 1.05, icon: "🎙️", tag: "Cyber" },
        nova: { id: "nova", name: "Nova Neural", style: "Smooth Melodic Female", pitch: 1.16, rate: 1.02, icon: "✨", tag: "Nova" },
        sentinel: { id: "sentinel", name: "Deep Sentinel", style: "Resonant Low Baritone", pitch: 0.72, rate: 0.95, icon: "🛡️", tag: "Sentinel" },
        vocoder: { id: "vocoder", name: "Quantum Vocoder", style: "Cybernetic Synth Vocoder", pitch: 1.35, rate: 1.18, icon: "⚡", tag: "Vocoder" },
        crisp: { id: "crisp", name: "Architect Crisp", style: "Clean Formal Neutral", pitch: 1.00, rate: 1.00, icon: "🧠", tag: "Crisp" },
        warm: { id: "warm", name: "Warm Natural", style: "Conversational Human", pitch: 1.05, rate: 0.96, icon: "🌟", tag: "Warm" }
    };

    const DEFAULT_AGENT_VOICES = {
        swarm: { preset: 'cyber', pitch: 0.88, rate: 1.05, voiceName: '' },
        turing: { preset: 'crisp', pitch: 1.00, rate: 1.00, voiceName: '' },
        knuth: { preset: 'sentinel', pitch: 0.80, rate: 0.95, voiceName: '' },
        lovelace: { preset: 'nova', pitch: 1.10, rate: 1.02, voiceName: '' }
    };

    function canonicalAgentKey(k) {
        const lower = (k || 'swarm').toLowerCase();
        if (lower === 'planner') return 'turing';
        if (lower === 'builder') return 'knuth';
        if (lower === 'auditor' || lower === 'executor') return 'lovelace';
        if (lower === 'orchestrator') return 'swarm';
        return lower;
    }

    function getAgentVoiceConfig(agentKey) {
        const canonical = canonicalAgentKey(agentKey);
        const stored = SafeStorage.getItem('holo_agent_voice_' + canonical);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {}
        }
        return DEFAULT_AGENT_VOICES[canonical] || { preset: 'cyber', pitch: 1.0, rate: 1.0, voiceName: '' };
    }

    function setAgentVoiceConfig(agentKey, config) {
        const canonical = canonicalAgentKey(agentKey);
        SafeStorage.setItem('holo_agent_voice_' + canonical, JSON.stringify(config));
        if (window.updateDockVoiceTags) window.updateDockVoiceTags();
    }

    const PERSONA_VOICES = {
        swarm: { pitch: 0.88, rate: 1.05, phrase: "Quantum Swarm Core synchronized. Multi-agent neural fabric online." },
        turing: { pitch: 1.00, rate: 1.00, phrase: "Alan Turing online. Strategy and planning matrix initialized." },
        knuth: { pitch: 0.88, rate: 0.96, phrase: "Donald Knuth standing by. Algorithmic synthesis and code tools active." },
        lovelace: { pitch: 1.12, rate: 1.02, phrase: "Ada Lovelace engaged. Systems ready for execution and verification." }
    };

    // DOM References
    let orbContainer, orbCore, voiceStatusLabel, transcriptText, transcriptSpeaker, eqBars;

    function init() {
        orbContainer = document.querySelector('.voice-orb-container');
        orbCore = document.getElementById('orbCore');
        voiceStatusLabel = document.getElementById('voiceStatusLabel');
        transcriptText = document.getElementById('transcriptText');
        transcriptSpeaker = document.getElementById('transcriptSpeaker');
        eqBars = document.getElementById('eqBars');

        initSpeechRecognition();
        // Set to standby idle on app boot. Listening starts upon operator tap.
        updateVoiceState('idle');
    }

    function initSpeechRecognition() {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
            recognition = new SpeechRec();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                isListening = true;
                updateVoiceState('listening');
            };

            recognition.onresult = (event) => {
                consecutiveTimeouts = 0;
                let interim = '';
                let final = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        final += event.results[i][0].transcript;
                    } else {
                        interim += event.results[i][0].transcript;
                    }
                }

                const spoken = (final || interim).trim();
                if (spoken) {
                    showTranscript('OPERATOR', spoken);
                    pulseEqualizer(true);

                    // Silence detection timeout for auto-dispatching speech turns
                    clearTimeout(speechSilenceTimer);
                    speechSilenceTimer = setTimeout(() => {
                        if (spoken.length > 1) {
                            handleVoiceInput(spoken);
                        }
                    }, 1400);
                }
            };

            recognition.onerror = (event) => {
                if (event.error !== 'no-speech') {
                    console.log("[HoloVoice] Speech error:", event.error);
                }
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    isContinuous = false;
                    isListening = false;
                    showTranscript('SYSTEM', 'Microphone access denied. Tap to speak.');
                }
                pulseEqualizer(false);
            };

            recognition.onend = () => {
                isListening = false;
                pulseEqualizer(false);
                // In continuous mode, back off if repeated silence occurs
                if (isContinuous && !isSpeaking && consecutiveTimeouts < 2) {
                    consecutiveTimeouts++;
                    setTimeout(() => {
                        try {
                            if (!isListening && !isSpeaking && isContinuous) recognition.start();
                        } catch (e) {}
                    }, 1200);
                } else {
                    updateVoiceState('idle');
                }
            };
        } else {
            console.log("[HoloVoice] Web Speech API not supported; using native bridge fallback.");
        }
    }

    function startListening() {
        if (isSpeaking) {
            stopSpeaking();
        }
        consecutiveTimeouts = 0;

        // Native Android Bridge SpeechRecognizer
        if (window.HoloBridge && window.HoloBridge.startNativeVoiceRecognition) {
            window.HoloBridge.startNativeVoiceRecognition();
            isListening = true;
            updateVoiceState('listening');
            return;
        }

        // Browser Web Speech API
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                // If already started, ignore
            }
        } else {
            updateVoiceState('listening');
            showTranscript('OPERATOR', 'Listening...');
            // Fallback prompt for desktop / test environments without microphone hardware
            setTimeout(() => {
                if (isListening && !window.HoloBridge) {
                    const promptText = prompt("Vocal input unavailable. Enter text command for Hologram Swarm:");
                    if (promptText && promptText.trim()) {
                        handleVoiceInput(promptText.trim());
                    } else {
                        stopListening();
                    }
                }
            }, 600);
        }
    }
    function stopListening() {
        if (window.HoloBridge && window.HoloBridge.stopNativeVoiceRecognition) {
            window.HoloBridge.stopNativeVoiceRecognition();
        }
        if (recognition) {
            try { recognition.stop(); } catch (e) {}
        }
        isListening = false;
        pulseEqualizer(false);
        updateVoiceState('idle');
    }

    function toggleListening() {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }

    function isLikelyNoise(input) {
        if (!input) return true;
        const clean = input.trim().toLowerCase().replace(/[.,!?;:'\"-]/g, '');
        if (clean.length < 2) return true;

        const allowedShort = new Set(['hi', 'ok', 'go', 'no', 'up', 'on', 'yo', 'me']);
        if (clean.length === 2 && !allowedShort.has(clean)) return true;

        const noiseSet = new Set([
            'uh', 'um', 'ah', 'oh', 'er', 'mm', 'hmm', 'hm', 'mhm',
            'huh', 'shh', 'sh', 'ha', 'heh', 'psst', 'cough', 'sniff', 'gasp'
        ]);
        if (noiseSet.has(clean)) return true;

        // Repeated single letter like "aaaa", "...."
        if (/^(.)\1+$/.test(clean) && clean.length <= 4) return true;

        return false;
    }

    // ========================================================
    // VOICE TURN DISPATCHER & NATURAL INTENT ROUTING
    // ========================================================
    async function handleVoiceInput(rawText) {
        const text = rawText.trim();
        if (!text) return;

        // Filter out small noises, breaths, coughs, and filler phonemes
        if (isLikelyNoise(text)) {
            console.log("[HoloVoice] Ignored ambient noise:", text);
            pulseEqualizer(false);
            updateVoiceState('idle');
            if (isContinuous && !isSpeaking) {
                setTimeout(() => {
                    if (!isListening && !isSpeaking) startListening();
                }, 350);
            }
            return;
        }

        stopListening();
        updateVoiceState('processing');
        showTranscript('OPERATOR', text);

        const lower = text.toLowerCase();

        // 0. Agent Profiles Modal Trigger
        if (lower.includes('agent profile') || lower.includes('show profile') || lower.includes('profiles') || lower.includes('personalities') || lower.includes('who are you') || lower.includes('list agents')) {
            if (window.openProfilesModal) window.openProfilesModal();
            speakAgent("Tri-agent profiles and cognitive personalities displayed.");
            return;
        }

        // 1. Direct Tri-Agent Voice Summoning
        if (lower.includes('switch to planner') || lower.includes('activate planner') || lower === 'planner' || lower.includes('hey planner') || lower.includes('switch to turing') || lower === 'turing' || lower.includes('activate turing') || lower.includes('hey turing') || lower.includes('alan turing')) {
            window.switchPersona('turing');
            speakAgent(PERSONA_VOICES.turing.phrase);
            return;
        }
        if (lower.includes('switch to builder') || lower.includes('activate builder') || lower === 'builder' || lower.includes('hey builder') || lower.includes('switch to knuth') || lower === 'knuth' || lower.includes('activate knuth') || lower.includes('hey knuth') || lower.includes('donald knuth')) {
            window.switchPersona('knuth');
            speakAgent(PERSONA_VOICES.knuth.phrase);
            return;
        }
        if (lower.includes('switch to auditor') || lower.includes('activate auditor') || lower === 'auditor' || lower.includes('hey auditor') || lower.includes('switch to lovelace') || lower === 'lovelace' || lower.includes('activate lovelace') || lower.includes('hey lovelace') || lower.includes('ada lovelace') || lower.includes('executor')) {
            window.switchPersona('lovelace');
            speakAgent(PERSONA_VOICES.lovelace.phrase);
            return;
        }
        if (lower.includes('switch to swarm') || lower === 'swarm' || lower.includes('activate swarm') || lower.includes('hey swarm') || lower.includes('orchestrator')) {
            window.switchPersona('swarm');
            speakAgent(PERSONA_VOICES.swarm.phrase);
            return;
        }

        // Voice Studio trigger
        if (lower.includes('voice studio') || lower.includes('change voice') || lower.includes('switch voice') || lower.includes('voice settings') || lower.includes('choose voice')) {
            if (window.openVoiceModal) window.openVoiceModal();
            speakAgent("Voice Studio opened. Select an acoustic profile or voice for your agents.");
            return;
        }
        if (lower.includes('switch to lovelace') || lower === 'lovelace' || lower.includes('activate lovelace')) {
            window.switchPersona('lovelace');
            speakAgent(PERSONA_VOICES.lovelace.phrase);
            return;
        }

        // 2. Spatial card dismissal by voice
        if (lower.includes('dismiss') || lower.includes('clear tasks') || lower.includes('clear cards') || lower === 'close') {
            if (window.SpatialTasks) SpatialTasks.clearAll();
            speakAgent("Spatial tasks dismissed.");
            return;
        }

        // 3. Cyber Security Tactical Operations & Spatial Cards
        if (lower.includes('scan port') || lower.includes('port scan') || lower.includes('scan ports') || lower.includes('port scanner') || lower.includes('probe ports')) {
            let target = '127.0.0.1';
            const match = lower.match(/(?:on|at|for|target)\s+([0-9a-z.-]+)/i);
            if (match) target = match[1];
            if (window.SpatialTasks && window.SpatialTasks.spawnPortScannerCard) {
                SpatialTasks.spawnPortScannerCard(target);
                speakAgent("Port scanner and service reconnaissance matrix materialized.");
                return;
            }
        }

        if (lower.includes('reverse shell') || lower.includes('generate payload') || lower.includes('payload generator') || lower.includes('payloads') || lower.includes('shellcode')) {
            if (window.SpatialTasks && window.SpatialTasks.spawnPayloadGeneratorCard) {
                SpatialTasks.spawnPayloadGeneratorCard();
                speakAgent("Offensive reverse shell payload generator active.");
                return;
            }
        }

        if (lower.includes('hash analyzer') || lower.includes('identify hash') || lower.includes('decode base64') || lower.includes('crypto tool') || lower.includes('hash decoder') || lower.includes('analyze hash')) {
            if (window.SpatialTasks && window.SpatialTasks.spawnHashAnalyzerCard) {
                SpatialTasks.spawnHashAnalyzerCard();
                speakAgent("Cryptographic analyzer and hash identifier online.");
                return;
            }
        }

        if (lower.includes('scan wifi') || lower.includes('wi-fi scan') || lower.includes('scan networks') || lower.includes('wireless recon')) {
            if (window.SpatialTasks && window.SpatialTasks.spawnWifiReconCard) {
                SpatialTasks.spawnWifiReconCard();
                speakAgent("Scanning 802.11 wireless spectrum. Access points mapped.");
                return;
            }
            const res = executeHardware('wifi scan');
            if (window.SpatialTasks) SpatialTasks.spawnTerminalCard('wifi scan', res);
            speakAgent("Scanning wireless environment. Telemetry card materialized.");
            return;
        }

        if (lower.includes('mitre attack') || lower.includes('mitre matrix') || lower.includes('threat tactics') || lower.includes('mitre')) {
            if (window.SpatialTasks && window.SpatialTasks.spawnMitreAttackCard) {
                SpatialTasks.spawnMitreAttackCard();
                speakAgent("MITRE ATT&CK tactical matrix materialized.");
                return;
            }
        }

        if (lower.includes('security audit') || lower.includes('check posture') || lower.includes('device hardening') || lower.includes('security posture') || lower.includes('audit device')) {
            if (window.SpatialTasks && window.SpatialTasks.spawnSecurityPostureCard) {
                SpatialTasks.spawnSecurityPostureCard();
                speakAgent("Device security posture audit complete.");
                return;
            }
        }

        if (lower.includes('mission report') || lower.includes('generate report') || lower.includes('export report') || lower.includes('incident report')) {
            if (window.SpatialTasks && window.SpatialTasks.spawnMissionReportCard) {
                SpatialTasks.spawnMissionReportCard();
                speakAgent("Tactical mission incident report generated.");
                return;
            }
        }

        if (lower.includes('diagnostics') || lower.includes('subsystem health') || lower.includes('system diagnostics') || lower.includes('telemetry check')) {
            if (window.SpatialTasks && window.SpatialTasks.spawnDiagnosticsCard) {
                SpatialTasks.spawnDiagnosticsCard();
                speakAgent("Subsystem telemetry and diagnostics materialized.");
                return;
            }
        }

        // 4. Direct hardware query interception
        if (lower.includes('battery') || lower.includes('power state')) {
            const res = executeHardware('battery');
            if (window.SpatialTasks) SpatialTasks.spawnTelemetryCard('Power Subsystem', { "Battery State": res, "Charging": "USB", "Status": "Optimal" });
            speakAgent(res);
            return;
        }
        if (lower.includes('flashlight on') || lower.includes('torch on')) {
            executeHardware('torch on');
            speakAgent("Torch enabled.");
            return;
        }
        if (lower.includes('flashlight off') || lower.includes('torch off')) {
            executeHardware('torch off');
            speakAgent("Torch disabled.");
            return;
        }

        // 5. Conversational Turn & Tool Synthesis via Cognitive Swarm
        if (window.HoloBrain && window.HoloBrain.processTurn) {
            await window.HoloBrain.processTurn(text);
        } else {
            speakAgent("Online and standing by.");
        }
    }

    function executeHardware(cmd) {
        if (window.HoloBridge && window.HoloBridge.runShellCommand) {
            return window.HoloBridge.runShellCommand(cmd);
        }
        return "Hardware command executed: " + cmd;
    }

    // ========================================================
    // PHYSICAL AGENT VOICE SYNTHESIS & LIP-SYNC
    // ========================================================
    function speakAgent(text) {
        if (!text) return;

        // Clean any markdown formatting, bracket tags, and raw URLs for natural speech
        const cleanText = text
            .replace(/<[^>]*>/g, '')
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`[^`]*`/g, '')
            .replace(/\[(?:EXEC|RUN|SPAWN|TOOL|SHELL)[^\]]*\]/gi, '')
            .replace(/https?:\/\/\S+/gi, '')
            .replace(/[*_#~]/g, '')
            .trim();
        if (!cleanText) return;

        isSpeaking = true;
        updateVoiceState('speaking');
        
        const persona = window.state ? window.state.persona : 'swarm';
        const agentConfig = getAgentVoiceConfig(persona);
        const personaName = (persona === 'swarm' ? 'SWARM CORE' : persona === 'turing' ? 'ALAN TURING' : persona === 'knuth' ? 'DONALD KNUTH' : persona === 'lovelace' ? 'ADA LOVELACE' : (persona || 'Agent')).toUpperCase();
        showTranscript(personaName, cleanText);

        // Animate 3D hologram lip-sync & audio energy
        startHoloLipSync();

        const profile = PERSONA_VOICES[persona] || PERSONA_VOICES.swarm;
        const configPitch = (agentConfig && agentConfig.pitch !== undefined) ? agentConfig.pitch : profile.pitch;
        const configRate = (agentConfig && agentConfig.rate !== undefined) ? agentConfig.rate : profile.rate;
        const activeVoiceName = (agentConfig && agentConfig.voiceName) ? agentConfig.voiceName : selectedSystemVoiceName;

        // Realistic pitch and rate bounds to prevent metallic/alien distortion
        const targetPitch = Math.max(0.70, Math.min(1.35, configPitch * userVoicePitch));
        const targetRate = Math.max(0.80, Math.min(1.25, configRate * userVoiceRate));

        // 1. Native Android TTS via HoloBridge
        if (window.HoloBridge && window.HoloBridge.speakPersona) {
            if (window.HoloBridge.setVoicePitch) window.HoloBridge.setVoicePitch(targetPitch);
            if (window.HoloBridge.setVoiceSpeechRate) window.HoloBridge.setVoiceSpeechRate(targetRate);
            if (activeVoiceName && window.HoloBridge.setVoice) {
                window.HoloBridge.setVoice(activeVoiceName);
            }

            window.HoloBridge.speakPersona(cleanText, persona);

            // Poll for when speaking ends
            const checkEnd = setInterval(() => {
                if (window.HoloBridge.isSpeaking && !window.HoloBridge.isSpeaking()) {
                    clearInterval(checkEnd);
                    onSpeechFinished();
                }
            }, 250);

            // Safety timeout based on word count
            const words = cleanText.split(/\s+/).length;
            const approxDurationMs = Math.max(1600, words * 380);
            setTimeout(() => {
                clearInterval(checkEnd);
                onSpeechFinished();
            }, approxDurationMs);
            return;
        }

        // 2. Fallback Web Speech Synthesis
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(cleanText);
            
            utterance.pitch = targetPitch;
            utterance.rate = targetRate;

            // Apply selected system voice if specified
            if (activeVoiceName) {
                const voices = window.speechSynthesis.getVoices();
                const matched = voices.find(v => v.name === activeVoiceName || v.voiceURI === activeVoiceName);
                if (matched) utterance.voice = matched;
            }

            utterance.onend = () => { onSpeechFinished(); };
            utterance.onerror = () => { onSpeechFinished(); };

            window.speechSynthesis.speak(utterance);
        } else {
            setTimeout(onSpeechFinished, 2000);
        }
    }

    function stopSpeaking() {
        isSpeaking = false;
        if (window.HoloBridge && window.HoloBridge.stopSpeaking) {
            window.HoloBridge.stopSpeaking();
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        stopHoloLipSync();
        updateVoiceState('idle');
    }

    function onSpeechFinished() {
        if (!isSpeaking) return;
        isSpeaking = false;
        stopHoloLipSync();
        updateVoiceState('idle');

        // Automatically resume continuous voice listening for natural turn-taking
        if (isContinuous) {
            setTimeout(() => {
                if (!isListening && !isSpeaking) {
                    startListening();
                }
            }, 600);
        }
    }

    // Audio reactive hologram modulation
    function startHoloLipSync() {
        stopHoloLipSync();
        audioAnimInterval = setInterval(() => {
            // Simulated dynamic speech modulation wave (0.25 to 0.85)
            const level = 0.35 + Math.sin(Date.now() * 0.015) * 0.28 + Math.random() * 0.2;
            if (window.HoloRenderer) {
                window.HoloRenderer.setAudioLevel(level);
            }
            animateEqualizerBars(level);
        }, 60);
    }

    function stopHoloLipSync() {
        if (audioAnimInterval) clearInterval(audioAnimInterval);
        audioAnimInterval = null;
        if (window.HoloRenderer) window.HoloRenderer.setAudioLevel(0);
        animateEqualizerBars(0);
    }

    function animateEqualizerBars(energy) {
        if (!eqBars) return;
        const bars = eqBars.querySelectorAll('.bar');
        bars.forEach((b, i) => {
            if (energy <= 0.05) {
                b.style.height = '4px';
            } else {
                const h = Math.max(4, Math.min(26, Math.sin(Date.now() * 0.02 + i) * 14 * energy + energy * 18));
                b.style.height = `${h}px`;
            }
        });
    }

    function pulseEqualizer(active) {
        if (!eqBars) return;
        const bars = eqBars.querySelectorAll('.bar');
        bars.forEach((b, i) => {
            b.style.height = active ? `${Math.random() * 18 + 6}px` : '4px';
        });
    }

    function updateVoiceState(state) {
        if (!orbContainer || !voiceStatusLabel) return;
        orbContainer.classList.remove('listening', 'speaking', 'processing');

        if (state === 'listening') {
            orbContainer.classList.add('listening');
            voiceStatusLabel.textContent = 'LISTENING...';
            if (window.HoloRenderer) window.HoloRenderer.setAnimationState('listening');
        } else if (state === 'speaking') {
            orbContainer.classList.add('speaking');
            voiceStatusLabel.textContent = 'SPEAKING';
            if (window.HoloRenderer) window.HoloRenderer.setAnimationState('speaking');
        } else if (state === 'processing') {
            orbContainer.classList.add('processing');
            voiceStatusLabel.textContent = 'COMPUTING...';
            if (window.HoloRenderer) window.HoloRenderer.setAnimationState('thinking');
        } else {
            voiceStatusLabel.textContent = 'TAP OR SPEAK';
            if (window.HoloRenderer) window.HoloRenderer.setAnimationState('idle');
        }
    }

    function showTranscript(speaker, text) {
        if (transcriptSpeaker) transcriptSpeaker.textContent = speaker.toUpperCase();
        if (transcriptText) transcriptText.textContent = text;
    }

    // Native bridge callbacks
    function onNativeSpeechResult(text) {
        consecutiveTimeouts = 0;
        handleVoiceInput(text);
    }
    function onNativeSpeechDetected() {
        consecutiveTimeouts = 0;
        updateVoiceState('listening');
        pulseEqualizer(true);
    }
    function onNativePartialResult(partial) {
        consecutiveTimeouts = 0;
        if (partial && partial.trim()) {
            showTranscript('OPERATOR', partial.trim());
            pulseEqualizer(true);
        }
    }
    function onNativeSpeechFinished() {
        onSpeechFinished();
    }
    function onNativeError(errorCode) {
        console.log("[HoloVoice] Native speech error code:", errorCode);
        pulseEqualizer(false);
        updateVoiceState('idle');
        isListening = false;

        // Permissions error (9) or Audio recording error (3) or Client error (5)
        if (errorCode === 9) {
            console.warn("[HoloVoice] Microphone permission denied. Halting speech recognition.");
            if (window.HoloBridge && window.HoloBridge.showToast) {
                window.HoloBridge.showToast("Microphone permission required for voice");
            }
            showTranscript('SYSTEM', 'Microphone permission needed. Tap to speak.');
            return;
        }

        if (errorCode === 3 || errorCode === 4 || errorCode === 5) {
            console.warn("[HoloVoice] Recognizer error " + errorCode + ", waiting for operator tap.");
            return;
        }

        // Timeouts (6) or No Match (7)
        consecutiveTimeouts++;
        if (consecutiveTimeouts >= 2) {
            console.log("[HoloVoice] Pausing voice listening after idle timeouts.");
            showTranscript('SYSTEM', 'Voice standby. Tap orb to speak.');
            return;
        }

        // Only retry if continuous mode is explicitly enabled by the operator
        if (isContinuous && !isSpeaking) {
            const restartDelay = (errorCode === 8) ? 2000 : 1500;
            setTimeout(() => {
                if (!isListening && !isSpeaking && isContinuous) {
                    startListening();
                }
            }, restartDelay);
        }
    }
    function onNativeAudioLevel(rmsdB) {
        const normalized = Math.max(0, Math.min(1, (rmsdB + 2) / 14));
        if (window.HoloRenderer) window.HoloRenderer.setAudioLevel(normalized);
        animateEqualizerBars(normalized);
    }
    function onNativeStateChange(state) {
        updateVoiceState(state);
    }

    // Native TTS fallback when Java TTS is not ready
    window.onNativeTTSFallback = function(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const clean = (text || '').replace(/<[^>]*>/g, '').replace(/[#*_`]/g, '');
            const utterance = new SpeechSynthesisUtterance(clean);
            utterance.pitch = userVoicePitch;
            utterance.rate = userVoiceRate;
            utterance.onend = () => { onSpeechFinished(); };
            utterance.onerror = () => { onSpeechFinished(); };
            window.speechSynthesis.speak(utterance);
        } else {
            setTimeout(onSpeechFinished, 1800);
        }
    };

    if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
            if (window.populateSystemVoices) window.populateSystemVoices();
        };
    }

    function getAvailableVoices() {
        let list = [];
        if ('speechSynthesis' in window) {
            const browserVoices = window.speechSynthesis.getVoices();
            if (browserVoices && browserVoices.length) {
                list = browserVoices.map(v => ({
                    name: v.name,
                    lang: v.lang,
                    source: 'WebSpeech',
                    default: v.default
                }));
            }
        }
        if (window.HoloBridge && window.HoloBridge.getAvailableVoices) {
            try {
                const nativeVoices = JSON.parse(window.HoloBridge.getAvailableVoices());
                if (nativeVoices && nativeVoices.length) {
                    nativeVoices.forEach(nv => {
                        list.push({
                            name: nv.name,
                            lang: nv.locale,
                            source: 'AndroidTTS',
                            default: false
                        });
                    });
                }
            } catch (e) {}
        }
        return list;
    }

    function setSelectedVoice(name) {
        selectedSystemVoiceName = name || '';
        SafeStorage.setItem('holo_selected_voice', selectedSystemVoiceName);
        if (window.HoloBridge && window.HoloBridge.setVoice) {
            window.HoloBridge.setVoice(selectedSystemVoiceName);
        }
    }

    function getSelectedVoice() {
        return selectedSystemVoiceName;
    }

    function setVoicePitch(p) {
        userVoicePitch = parseFloat(p) || 1.0;
        SafeStorage.setItem('holo_voice_pitch', userVoicePitch);
        if (window.HoloBridge && window.HoloBridge.setVoicePitch) {
            window.HoloBridge.setVoicePitch(userVoicePitch);
        }
    }

    function setVoiceRate(r) {
        userVoiceRate = parseFloat(r) || 1.0;
        SafeStorage.setItem('holo_voice_rate', userVoiceRate);
        if (window.HoloBridge && window.HoloBridge.setVoiceSpeechRate) {
            window.HoloBridge.setVoiceSpeechRate(userVoiceRate);
        }
    }

    function auditionVoice(sampleText) {
        const text = sampleText || "Acoustic voice synthesis active. All cybersecurity telemetry systems operational.";
        speakAgent(text);
    }

    function auditionAgentVoice(agentKey, sample) {
        const canonical = canonicalAgentKey(agentKey);
        const defaultPhrases = {
            swarm: "Quantum Swarm Core synchronized. Multi-agent neural fabric online.",
            turing: "Alan Turing online. Strategy and planning matrix initialized.",
            knuth: "Donald Knuth standing by. Algorithmic synthesis and code tools active.",
            lovelace: "Ada Lovelace engaged. Systems ready for execution and verification."
        };
        const phrase = sample || defaultPhrases[canonical] || PERSONA_VOICES[canonical]?.phrase || "Acoustic voice calibrated.";
        
        const prevPersona = window.state ? window.state.persona : 'swarm';
        if (window.state) window.state.persona = canonical;
        speakAgent(phrase);
        setTimeout(() => {
            if (window.state) window.state.persona = prevPersona;
        }, 1600);
    }

    return {
        init: init,
        startListening: startListening,
        stopListening: stopListening,
        toggleListening: toggleListening,
        speakAgent: speakAgent,
        stopSpeaking: stopSpeaking,
        injectCommand: function(cmd) { handleVoiceInput(cmd); },
        onNativeSpeechResult: onNativeSpeechResult,
        onNativeSpeechDetected: onNativeSpeechDetected,
        onNativePartialResult: onNativePartialResult,
        onNativeSpeechFinished: onNativeSpeechFinished,
        onNativeError: onNativeError,
        onNativeAudioLevel: onNativeAudioLevel,
        setContinuous: function(val) {
            isContinuous = !!val;
            SafeStorage.setItem('holo_continuous_voice', isContinuous ? 'true' : 'false');
            consecutiveTimeouts = 0;
            if (!isContinuous && isListening) {
                stopListening();
            }
        },
        getContinuous: function() { return isContinuous; },
        setSelectedVoice: setSelectedVoice,
        getSelectedVoice: getSelectedVoice,
        setVoicePitch: setVoicePitch,
        setVoiceRate: setVoiceRate,
        auditionVoice: auditionVoice,
        auditionAgentVoice: auditionAgentVoice,
        getPersonaVoices: function() { return PERSONA_VOICES; },
        getVoicePresets: function() { return VOICE_PRESETS; },
        getAgentVoiceConfig: getAgentVoiceConfig,
        setAgentVoiceConfig: setAgentVoiceConfig,
        canonicalAgentKey: canonicalAgentKey
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    window.HoloVoice.init();
});
