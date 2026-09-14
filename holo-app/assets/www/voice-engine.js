/**
 * Agentic Hologram — Voice Control & Real-Time Conversational Engine
 * Continuous Voice-First Turn-Taking // Audio Reactive Lip-Sync // Speech Recognition
 */

window.HoloVoice = (function() {
    let recognition = null;
    let isListening = false;
    let isSpeaking = false;
    let isContinuous = true;
    let currentSpeechText = '';
    let speechSilenceTimer = null;
    let audioAnimInterval = null;

    // Operator Voice Preferences & Acoustic Profiles
    let selectedSystemVoiceName = localStorage.getItem('holo_selected_voice') || '';
    let userVoicePitch = parseFloat(localStorage.getItem('holo_voice_pitch') || '1.0');
    let userVoiceRate = parseFloat(localStorage.getItem('holo_voice_rate') || '1.0');

    const PERSONA_VOICES = {
        swarm: { pitch: 0.85, rate: 1.05, phrase: "Agentic Swarm online. Ready for tactical directives." },
        turing: { pitch: 1.00, rate: 0.98, phrase: "Alan Turing online. What formal system shall we analyze?" },
        knuth: { pitch: 0.92, rate: 0.95, phrase: "Donald Knuth online. What algorithms shall we craft?" },
        lovelace: { pitch: 1.18, rate: 1.02, phrase: "Ada Lovelace online. What poetry of science shall we explore?" },
        shadow: { pitch: 0.72, rate: 1.10, phrase: "Shadow Operator online. Attack surface reconnaissance active." },
        sentry: { pitch: 0.88, rate: 1.08, phrase: "Cyber Sentry standing guard. Threat hunting matrix engaged." },
        cipher: { pitch: 1.06, rate: 0.92, phrase: "Cipher Core decrypted and active. Ready for cryptographic operations." },
        valkyrie: { pitch: 1.22, rate: 1.14, phrase: "Valkyrie Tactical initialized. Emergency triage standing by." },
        matrix: { pitch: 0.62, rate: 0.96, phrase: "Reverse Matrix engaged. Disassembler and shellcode engine ready." },
        ghost: { pitch: 0.78, rate: 0.96, phrase: "Ghost Recon cloaked. Passive OSINT collection started." },
        glitch: { pitch: 1.38, rate: 1.22, phrase: "Glitch Synth booted! High-velocity cyber automation spinning up." },
        archon: { pitch: 0.75, rate: 0.90, phrase: "Archon Prime commanding. Framework compliance and threat posture active." }
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
        
        // Auto-start continuous listening after brief pause
        setTimeout(() => {
            if (isContinuous && !isListening && !isSpeaking) {
                startListening();
            }
        }, 1200);
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
                pulseEqualizer(false);
            };

            recognition.onend = () => {
                isListening = false;
                pulseEqualizer(false);
                // If continuous mode is on and we are not currently speaking, re-open listening
                if (isContinuous && !isSpeaking) {
                    setTimeout(() => {
                        try {
                            if (!isListening && !isSpeaking) recognition.start();
                        } catch (e) {}
                    }, 400);
                } else if (!isSpeaking) {
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

    // ========================================================
    // VOICE TURN DISPATCHER & NATURAL INTENT ROUTING
    // ========================================================
    async function handleVoiceInput(rawText) {
        const text = rawText.trim();
        if (!text) return;

        stopListening();
        updateVoiceState('processing');
        showTranscript('OPERATOR', text);

        const lower = text.toLowerCase();

        // 1. Direct voice persona switching (12 Personas)
        if (lower.includes('switch to shadow') || lower === 'shadow' || lower.includes('activate shadow') || lower.includes('red team')) {
            window.switchPersona('shadow');
            speakAgent(PERSONA_VOICES.shadow.phrase);
            return;
        }
        if (lower.includes('switch to sentry') || lower === 'sentry' || lower.includes('activate sentry') || lower.includes('blue team')) {
            window.switchPersona('sentry');
            speakAgent(PERSONA_VOICES.sentry.phrase);
            return;
        }
        if (lower.includes('switch to cipher') || lower === 'cipher' || lower.includes('activate cipher') || lower.includes('cryptography')) {
            window.switchPersona('cipher');
            speakAgent(PERSONA_VOICES.cipher.phrase);
            return;
        }
        if (lower.includes('switch to valkyrie') || lower === 'valkyrie' || lower.includes('activate valkyrie') || lower.includes('incident response')) {
            window.switchPersona('valkyrie');
            speakAgent(PERSONA_VOICES.valkyrie.phrase);
            return;
        }
        if (lower.includes('switch to matrix') || lower === 'matrix' || lower.includes('activate matrix') || lower.includes('reverse engineer')) {
            window.switchPersona('matrix');
            speakAgent(PERSONA_VOICES.matrix.phrase);
            return;
        }
        if (lower.includes('switch to ghost') || lower === 'ghost' || lower.includes('activate ghost') || lower.includes('osint')) {
            window.switchPersona('ghost');
            speakAgent(PERSONA_VOICES.ghost.phrase);
            return;
        }
        if (lower.includes('switch to glitch') || lower === 'glitch' || lower.includes('activate glitch')) {
            window.switchPersona('glitch');
            speakAgent(PERSONA_VOICES.glitch.phrase);
            return;
        }
        if (lower.includes('switch to archon') || lower === 'archon' || lower.includes('activate archon') || lower.includes('framework commander')) {
            window.switchPersona('archon');
            speakAgent(PERSONA_VOICES.archon.phrase);
            return;
        }
        if (lower.includes('switch to turing') || lower === 'turing' || lower.includes('activate turing')) {
            window.switchPersona('turing');
            speakAgent(PERSONA_VOICES.turing.phrase);
            return;
        }
        if (lower.includes('switch to swarm') || lower === 'swarm' || lower.includes('activate swarm') || lower.includes('hey swarm')) {
            window.switchPersona('swarm');
            speakAgent(PERSONA_VOICES.swarm.phrase);
            return;
        }
        if (lower.includes('switch to knuth') || lower === 'knuth' || lower.includes('activate knuth')) {
            window.switchPersona('knuth');
            speakAgent(PERSONA_VOICES.knuth.phrase);
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
        isSpeaking = true;
        updateVoiceState('speaking');
        
        const persona = window.state ? window.state.persona : 'swarm';
        const personaName = (persona || 'Swarm').toUpperCase();
        showTranscript(personaName, text);

        // Animate 3D hologram lip-sync & audio energy
        startHoloLipSync();

        const profile = PERSONA_VOICES[persona] || PERSONA_VOICES.swarm;
        const targetPitch = Math.max(0.4, Math.min(2.0, profile.pitch * userVoicePitch));
        const targetRate = Math.max(0.5, Math.min(2.0, profile.rate * userVoiceRate));

        // 1. Native Android TTS via HoloBridge
        if (window.HoloBridge && window.HoloBridge.speakPersona) {
            if (window.HoloBridge.setVoicePitch) window.HoloBridge.setVoicePitch(targetPitch);
            if (window.HoloBridge.setVoiceSpeechRate) window.HoloBridge.setVoiceSpeechRate(targetRate);
            if (selectedSystemVoiceName && window.HoloBridge.setVoice) {
                window.HoloBridge.setVoice(selectedSystemVoiceName);
            }

            window.HoloBridge.speakPersona(text, persona);

            // Poll for when speaking ends
            const checkEnd = setInterval(() => {
                if (window.HoloBridge.isSpeaking && !window.HoloBridge.isSpeaking()) {
                    clearInterval(checkEnd);
                    onSpeechFinished();
                }
            }, 250);

            // Safety timeout based on word count
            const words = text.split(/\s+/).length;
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
            const clean = text.replace(/<[^>]*>/g, '').replace(/```[\s\S]*?```/g, '').replace(/[#*_`]/g, '');
            const utterance = new SpeechSynthesisUtterance(clean);
            
            utterance.pitch = targetPitch;
            utterance.rate = targetRate;

            // Apply selected system voice if specified
            if (selectedSystemVoiceName) {
                const voices = window.speechSynthesis.getVoices();
                const matched = voices.find(v => v.name === selectedSystemVoiceName || v.voiceURI === selectedSystemVoiceName);
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
        handleVoiceInput(text);
    }
    function onNativeSpeechDetected() {
        updateVoiceState('listening');
        pulseEqualizer(true);
    }
    function onNativePartialResult(partial) {
        if (partial && partial.trim()) {
            showTranscript('OPERATOR', partial.trim());
            pulseEqualizer(true);
        }
    }
    function onNativeError(errorCode) {
        console.log("[HoloVoice] Native speech error code:", errorCode);
        pulseEqualizer(false);
        updateVoiceState('idle');
        if (isContinuous && !isSpeaking) {
            setTimeout(() => {
                if (!isListening && !isSpeaking) {
                    startListening();
                }
            }, 800);
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
        localStorage.setItem('holo_selected_voice', selectedSystemVoiceName);
        if (window.HoloBridge && window.HoloBridge.setVoice) {
            window.HoloBridge.setVoice(selectedSystemVoiceName);
        }
    }

    function getSelectedVoice() {
        return selectedSystemVoiceName;
    }

    function setVoicePitch(p) {
        userVoicePitch = parseFloat(p) || 1.0;
        localStorage.setItem('holo_voice_pitch', userVoicePitch);
        if (window.HoloBridge && window.HoloBridge.setVoicePitch) {
            window.HoloBridge.setVoicePitch(userVoicePitch);
        }
    }

    function setVoiceRate(r) {
        userVoiceRate = parseFloat(r) || 1.0;
        localStorage.setItem('holo_voice_rate', userVoiceRate);
        if (window.HoloBridge && window.HoloBridge.setVoiceSpeechRate) {
            window.HoloBridge.setVoiceSpeechRate(userVoiceRate);
        }
    }

    function auditionVoice(sampleText) {
        const text = sampleText || "Acoustic voice synthesis active. All cybersecurity telemetry systems operational.";
        speakAgent(text);
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
        onNativeError: onNativeError,
        onNativeAudioLevel: onNativeAudioLevel,
        onNativeStateChange: onNativeStateChange,
        setContinuous: function(val) { isContinuous = val; },
        getAvailableVoices: getAvailableVoices,
        setSelectedVoice: setSelectedVoice,
        getSelectedVoice: getSelectedVoice,
        setVoicePitch: setVoicePitch,
        setVoiceRate: setVoiceRate,
        auditionVoice: auditionVoice,
        getPersonaVoices: function() { return PERSONA_VOICES; }
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    window.HoloVoice.init();
});
