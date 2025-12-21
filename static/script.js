document.addEventListener('DOMContentLoaded', () => {
    // ========== 0. MOBILE WARNING CHECK ==========
    const mobileWarning = document.getElementById('mobile-warning');
    const closeMobileWarningBtn = document.getElementById('close-mobile-warning');

    if (mobileWarning && closeMobileWarningBtn) {
        // Check if screen width is less than 768px (standard mobile/tablet breakpoint)
        if (window.innerWidth < 768) {
            mobileWarning.classList.remove('hidden');
            // Ensure it uses flex when visible (overriding hidden's display: none)
            mobileWarning.style.display = 'flex';
        } else {
            // Ensure it is hidden on desktop (in case of resize loops or cache)
            mobileWarning.style.display = 'none';
        }

        closeMobileWarningBtn.addEventListener('click', () => {
            mobileWarning.style.opacity = '0';
            mobileWarning.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                mobileWarning.style.display = 'none';
            }, 500);
        });
    }

    // ========== 1. MAIN TAB NAVIGATION ==========
    const mainTabBtns = document.querySelectorAll('.nav-tab-btn');
    const mainTabPanels = document.querySelectorAll('.main-tab-panel');

    // Load saved main tab or default
    const savedMainTab = localStorage.getItem('activeMainTab') || 'constructor';
    switchMainTab(savedMainTab);

    mainTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchMainTab(tabName);
            localStorage.setItem('activeMainTab', tabName);
        });
    });

    function switchMainTab(tabName) {
        mainTabBtns.forEach(btn => btn.classList.remove('active'));
        mainTabPanels.forEach(panel => panel.classList.remove('active'));

        const activeBtn = document.querySelector(`.nav-tab-btn[data-tab="${tabName}"]`);
        const activePanel = document.getElementById(`tab-${tabName}`);

        if (activeBtn && activePanel) {
            activeBtn.classList.add('active');
            activePanel.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            console.log(`✅ Main Tab Switched: ${tabName}`);
        }
    }

    // ========== 2. INTERNAL SUB-TAB NAVIGATION (Text Crypto) ==========
    const subTabBtns = document.querySelectorAll('.sub-tab-btn');
    const subTabPanels = document.querySelectorAll('.sub-tab-content');

    // Default sub-tab
    switchSubTab('encryption');

    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchSubTab(btn.dataset.subtab);
        });
    });

    function switchSubTab(subTabName) {
        subTabBtns.forEach(btn => btn.classList.remove('active'));

        // Hide all panels strictly
        subTabPanels.forEach(panel => {
            panel.classList.remove('active');
            panel.classList.add('hidden');
        });

        const activeBtn = document.querySelector(`.sub-tab-btn[data-subtab="${subTabName}"]`);
        const activePanel = document.getElementById(`subtab-${subTabName}`);

        if (activeBtn && activePanel) {
            activeBtn.classList.add('active');
            activePanel.classList.remove('hidden');
            activePanel.classList.add('active');
            console.log(`🔹 Sub-Tab Switched: ${subTabName}`);
        }
    }

    // Expose globally
    window.switchMainTab = switchMainTab;
    window.switchSubTab = switchSubTab;

    // Anime.js Page Load Animations
    if (typeof anime !== 'undefined') {
        // Header fade in and slide down
        anime({
            targets: 'header',
            opacity: [0, 1],
            translateY: [-30, 0],
            duration: 800,
            easing: 'easeOutExpo'
        });

        // Title words stagger animation
        anime({
            targets: '.title-word',
            opacity: [0, 1],
            translateY: [-20, 0],
            delay: anime.stagger(100, { start: 300 }),
            duration: 600,
            easing: 'easeOutExpo'
        });

        // Sections fade in
        anime({
            targets: '.controls, .constructor-section',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: anime.stagger(150, { start: 500 }),
            duration: 700,
            easing: 'easeOutExpo'
        });

        // ==========================================
        // 1. ANIME.JS HOMEPAGE STYLE: STAGGERED GRID
        // ==========================================
        const staggerVisualizerEl = document.querySelector('.stagger-visualizer');

        if (staggerVisualizerEl) {
            const fragment = document.createDocumentFragment();
            const grid = [20, 10]; // Default grid size
            const col = 20;
            const row = 10;
            const numberOfElements = col * row;

            // Generate Grid
            for (let i = 0; i < numberOfElements; i++) {
                const el = document.createElement('div');
                el.classList.add('stagger-cell');
                fragment.appendChild(el);
            }
            staggerVisualizerEl.appendChild(fragment);

            // Stagger Animation
            const animation = anime.timeline({
                targets: '.stagger-cell',
                easing: 'easeInOutSine',
                delay: anime.stagger(50),
                loop: true,
                autoplay: false
            })
                .add({
                    translateX: [
                        { value: anime.stagger('-.1rem', { grid: grid, from: 'center', axis: 'x' }) },
                        { value: anime.stagger('.1rem', { grid: grid, from: 'center', axis: 'x' }) }
                    ],
                    translateY: [
                        { value: anime.stagger('-.1rem', { grid: grid, from: 'center', axis: 'y' }) },
                        { value: anime.stagger('.1rem', { grid: grid, from: 'center', axis: 'y' }) }
                    ],
                    duration: 1000,
                    scale: .5,
                    delay: anime.stagger(100, { grid: grid, from: 'center' })
                })
                .add({
                    translateX: () => anime.random(-10, 10),
                    translateY: () => anime.random(-10, 10),
                    delay: anime.stagger(8, { from: 'last' })
                })
                .add({
                    translateX: 0,
                    translateY: 0,
                    scale: 1,
                    rotate: 0,
                    duration: 2000,
                    delay: anime.stagger(50, { grid: grid, from: 'center' })
                });

            // Initial Play
            animation.play();

            // Cursor Ripple Effect
            document.addEventListener('mousemove', function (e) {
                if (Math.random() > 0.8) { // Performance check
                    anime({
                        targets: '.stagger-cell',
                        scale: [
                            { value: .1, easing: 'easeOutSine', duration: 500 },
                            { value: 1, easing: 'easeInOutQuad', duration: 1200 }
                        ],
                        delay: anime.stagger(200, { grid: grid, from: 'center' }),
                        // Note: Real cursor tracking requires mapping cursor X/Y to grid index
                        // For this implementation, we use a simple center stagger on move for visual effect
                    });
                }
            });
        }

        // ==========================================
        // 2. BUTTON RIPPLE EFFECT
        // ==========================================
        document.addEventListener('click', function (e) {
            if (e.target.closest('button') || e.target.closest('.btn')) {
                const btn = e.target.closest('button') || e.target.closest('.btn');
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('div');
                ripple.style.position = 'absolute';
                ripple.style.top = `${y}px`;
                ripple.style.left = `${x}px`;
                ripple.style.width = '0px';
                ripple.style.height = '0px';
                ripple.style.borderRadius = '50%';
                ripple.style.background = 'rgba(255, 255, 255, 0.4)';
                ripple.style.pointerEvents = 'none';
                ripple.style.transform = 'translate(-50%, -50%)';
                btn.style.position = 'relative';
                btn.style.overflow = 'hidden';
                btn.appendChild(ripple);

                anime({
                    targets: ripple,
                    width: [0, 500],
                    height: [0, 500],
                    opacity: [0.5, 0],
                    easing: 'easeOutExpo',
                    duration: 600,
                    complete: () => ripple.remove()
                });
            }
        });
    }

    // Loading overlay helper
    const loadingOverlay = document.getElementById('loading-overlay');

    function showLoading(text = 'Processing...') {
        if (loadingOverlay) {
            loadingOverlay.querySelector('.loading-text').textContent = text;
            loadingOverlay.classList.remove('hidden');
        }
    }

    function hideLoading() {
        if (loadingOverlay) {
            loadingOverlay.classList.add('hidden');
        }
    }

    const sboxSelect = document.getElementById('sbox-select');
    const customInputContainer = document.getElementById('custom-input-container');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultsSection = document.getElementById('results-section');
    const sboxGrid = document.getElementById('sbox-grid');
    const bijectiveStatus = document.getElementById('bijective-status');
    const balanceTbody = document.getElementById('balance-tbody');

    // Encryption elements
    const encryptionSection = document.getElementById('encryption-section');
    const textInput = document.getElementById('text-input');
    const encryptBtn = document.getElementById('encrypt-btn');
    const encryptedOutput = document.getElementById('encrypted-output');
    const encryptionKeyInput = document.getElementById('encryption-key-input');

    // Decryption elements
    const ciphertextInput = document.getElementById('ciphertext-input');
    const decryptBtn = document.getElementById('decrypt-btn');
    const decryptedOutput = document.getElementById('decrypted-output');
    const decryptionKeyInput = document.getElementById('decryption-key-input');

    // Tab Switching Logic with Anime.js animation
    // [REMOVED] Old Tab Logic


    // Toggle custom input visibility with smooth transition
    const uploadInputContainer = document.getElementById('upload-input-container');
    let constructedSbox = null; // Store constructed S-Box for download

    sboxSelect.addEventListener('change', () => {
        if (sboxSelect.value === 'custom') {
            customInputContainer.classList.remove('hidden');
            uploadInputContainer.classList.add('hidden');
        } else if (sboxSelect.value === 'upload') {
            uploadInputContainer.classList.remove('hidden');
            customInputContainer.classList.add('hidden');
        } else {
            customInputContainer.classList.add('hidden');
            uploadInputContainer.classList.add('hidden');
        }
    });

    // Analyze button click handler
    analyzeBtn.addEventListener('click', async () => {
        const type = sboxSelect.value;
        const customSbox = document.getElementById('custom-sbox').value;

        const payload = {
            type: type,
            custom_sbox: type === 'custom' ? customSbox : null
        };

        try {
            showLoading('Analyzing S-Box...');
            analyzeBtn.disabled = true;

            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            hideLoading();
            analyzeBtn.disabled = false;

            if (!response.ok) {
                alert(data.error || 'An error occurred');
                return;
            }

            displayResults(data);

            // Store metrics globally for comparison tool
            window.lastAnalysisMetrics = data;

            // Show encryption section after successful analysis with smooth scroll
            encryptionSection.classList.remove('hidden');
            setTimeout(() => {
                encryptionSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 300);

        } catch (error) {
            console.error('Error:', error);
            hideLoading();
            analyzeBtn.disabled = false;
            alert('Failed to fetch analysis results.');
        }
    });

    // [MODIFIED] Client-Side Encryption Implementation
    encryptBtn.addEventListener('click', async () => {
        const text = textInput.value;
        if (!text) {
            alert('Please enter text to encrypt.');
            return;
        }

        const key = encryptionKeyInput.value || '000102030405060708090a0b0c0d0e0f';
        const sBox = window.currentSBox; // Use loaded S-Box

        try {
            const originalText = encryptBtn.textContent;
            encryptBtn.textContent = 'Encrypting (Client-Side)...';
            encryptBtn.disabled = true;

            // 1. Initialize Client-Side AES
            const aes = new AES_Client(key, sBox); // sBox can be null (uses default)
            console.log("🔒 Running Client-Side AES...");

            // 2. Encrypt
            const startTime = performance.now();
            const result = aes.encryptText(text);
            const endTime = performance.now();
            console.log(`✅ Encryption complete in ${(endTime - startTime).toFixed(2)}ms`);

            // 3. Display Result
            encryptedOutput.value = result.hex;
            ciphertextInput.value = result.hex; // Auto-fill decrypt

            // 4. Process Trace Data for Visualization
            if (result.trace) {
                // Convert 1D arrays to 4x4 matrices for displayEncryptionProcess
                const formattedTrace = formatTraceForDisplay(result.trace);
                displayEncryptionProcess(formattedTrace);

                // Store for Avalanche visualizer
                window.lastTrace = result.trace; // Raw trace with numeric 1D arrays
                updateAvalancheVisualization(0); // Show Round 0
            }

            encryptBtn.textContent = originalText;
            encryptBtn.disabled = false;

        } catch (error) {
            console.error('Encryption Error:', error);
            alert('Client-Side Encryption Failed: ' + error.message);
            encryptBtn.textContent = 'Encrypt Text';
            encryptBtn.disabled = false;
        }
    });

    // Helper: Convert AES_Client trace to 4x4 format
    function formatTraceForDisplay(clientTrace) {
        const steps = [];

        // Helper to chop 16-byte array into 4x4 grid (Row-Major or Column-Major?)
        // Standard AES is Column-Major state, but our arrays are flat 0..15.
        // displayEncryptionProcess expects item.state[row][col].
        // Usually index = col * 4 + row (Column Major) or row * 4 + col (Row Major).
        // AES_Client uses flat array. Let's assume Row-Major for simple visualization unless we want strict AES state.
        // Let's use simple row-filling 0,1,2,3 -> row 0.
        const toGrid = (arr) => {
            const grid = [];
            for (let r = 0; r < 4; r++) {
                const row = [];
                for (let c = 0; c < 4; c++) row.push(arr[r + c * 4]); // Column-Major mapping (standard AES)
                grid.push(row);
            }
            return grid;
        };

        clientTrace.forEach(t => {
            if (t.round === 0) {
                // Round 0
                steps.push({ round: 'Init', step: 'Initial State', state: toGrid(t.finalState || t.state || t.start) });
            } else if (t.round <= 10) {
                // SubBytes
                if (t.afterSub) steps.push({ round: t.round, step: 'SubBytes', state: toGrid(t.afterSub) });
                // ShiftRows
                if (t.afterShift) steps.push({ round: t.round, step: 'ShiftRows', state: toGrid(t.afterShift) });
                // MixColumns (Skip for Round 10)
                if (t.afterMix) steps.push({ round: t.round, step: 'MixColumns', state: toGrid(t.afterMix) });

                // AddRoundKey
                // Recalculate Key: FinalState XOR InputState
                let inputState = t.afterMix;
                if (t.round === 10) inputState = t.afterShift;

                const derivedKey = (t.finalState && inputState)
                    ? t.finalState.map((v, i) => v ^ inputState[i])
                    : new Array(16).fill(0);

                steps.push({
                    round: t.round,
                    step: 'AddRoundKey',
                    state: toGrid(t.finalState),
                    key: toGrid(derivedKey)
                });
            }
        });
        return steps;
    }

    // [MODIFIED] Client-Side Decryption Implementation
    decryptBtn.addEventListener('click', async () => {
        const ciphertext = ciphertextInput.value;
        if (!ciphertext) {
            alert('Please enter ciphertext to decrypt.');
            return;
        }

        const key = decryptionKeyInput.value || '000102030405060708090a0b0c0d0e0f';

        // Use loaded S-Box or default to AES S-Box
        let sBox = window.currentSBox;
        if (!sBox) {
            console.warn('⚠️ No S-Box loaded, using default AES S-Box');
            // Default AES S-Box
            sBox = [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
                0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
                0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
                0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
                0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
                0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
                0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
                0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
                0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
                0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
                0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
                0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
                0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
                0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
                0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
                0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16];
        }

        try {
            const originalText = decryptBtn.textContent;
            decryptBtn.textContent = 'Decrypting (Client-Side)...';
            decryptBtn.disabled = true;

            // 1. Initialize Client-Side AES
            const aes = new AES_Client(key, sBox);
            console.log("🔓 Running Client-Side Decryption...");

            // 2. Decrypt
            const startTime = performance.now();
            const plaintext = aes.decryptText(ciphertext);
            const endTime = performance.now();
            console.log(`✅ Decryption complete in ${(endTime - startTime).toFixed(2)}ms`);

            // 3. Display Result
            decryptedOutput.value = plaintext;

            decryptBtn.textContent = originalText;
            decryptBtn.disabled = false;

        } catch (error) {
            console.error('Decryption Error:', error);
            alert('Client-Side Decryption Failed: ' + error.message);
            decryptBtn.textContent = 'Decrypt Text';
            decryptBtn.disabled = false;
        }
    });

    // Download Detailed Report
    const downloadReportBtn = document.getElementById('download-report-btn');
    downloadReportBtn.addEventListener('click', async () => {
        const text = textInput.value;
        if (!text) {
            alert('Please enter text to encrypt first.');
            return;
        }

        const type = sboxSelect.value;
        const customSbox = document.getElementById('custom-sbox').value;
        const key = encryptionKeyInput.value;

        const formData = new FormData();
        formData.append('text_input', text);
        formData.append('type', type);
        formData.append('key', key);
        if (type === 'custom') {
            formData.append('custom_sbox', customSbox);
        }

        try {
            const originalText = downloadReportBtn.textContent;
            downloadReportBtn.textContent = 'Generating...';
            downloadReportBtn.disabled = true;

            const response = await fetch('/encrypt_detailed', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.error || 'Report generation failed');
                downloadReportBtn.textContent = originalText;
                downloadReportBtn.disabled = false;
                return;
            }

            // Trigger download
            const blob = await response.blob();
            // Force the correct MIME type
            const newBlob = new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(newBlob);

            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.setAttribute('download', 'aes_detailed_trace.xlsx');
            document.body.appendChild(a);

            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            downloadReportBtn.textContent = originalText;
            downloadReportBtn.disabled = false;

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate report.');
            downloadReportBtn.textContent = 'Download Detailed Report (Excel)';
            downloadReportBtn.disabled = false;
        }
    });

    function displayResults(data) {
        resultsSection.classList.remove('hidden');

        // Anime.js Card Entrance Animations
        if (typeof anime !== 'undefined') {
            anime({
                targets: '.status-card',
                opacity: [0, 1],
                scale: [0.8, 1],
                delay: anime.stagger(50),
                duration: 500,
                easing: 'easeOutElastic(1, .6)'
            });
        }

        // 1. Display Bijective Status
        bijectiveStatus.textContent = data.is_bijective ? 'YES' : 'NO';
        bijectiveStatus.className = 'status-value ' + (data.is_bijective ? 'valid' : 'invalid');

        // 2. Display Advanced Metrics
        if (data.metrics) {
            document.getElementById('nl-value').textContent = data.metrics.nl;
            document.getElementById('sac-value').textContent = typeof data.metrics.sac === 'number' ? data.metrics.sac.toFixed(4) : data.metrics.sac;
            document.getElementById('bic-nl-value').textContent = data.metrics.bic_nl;
            document.getElementById('bic-sac-value').textContent = typeof data.metrics.bic_sac === 'number' ? data.metrics.bic_sac.toFixed(4) : data.metrics.bic_sac;
            document.getElementById('lap-value').textContent = typeof data.metrics.lap === 'number' ? data.metrics.lap.toFixed(4) : data.metrics.lap;
            document.getElementById('dap-value').textContent = typeof data.metrics.dap === 'number' ? data.metrics.dap.toFixed(4) : data.metrics.dap;
            document.getElementById('du-value').textContent = data.metrics.du;
            document.getElementById('ad-value').textContent = data.metrics.ad;
            document.getElementById('to-value').textContent = typeof data.metrics.to === 'number' ? data.metrics.to.toFixed(4) : data.metrics.to;
            document.getElementById('ci-value').textContent = data.metrics.ci;
        }

        // 3. Display Balance Table
        balanceTbody.innerHTML = '';
        if (data.balance_results) {
            data.balance_results.forEach(res => {
                const row = document.createElement('tr');
                const statusClass = res.is_balanced ? 'valid' : 'invalid';
                const statusText = res.is_balanced ? 'Balanced' : 'Unbalanced';

                row.innerHTML = `
                    <td>${res.bit}</td>
                    <td>${res.count_0}</td>
                    <td>${res.count_1}</td>
                    <td class="status-value ${statusClass}">${statusText}</td>
                `;
                balanceTbody.appendChild(row);
            });
        }

        // 4. Render S-Box Grid
        sboxGrid.innerHTML = '';
        data.sbox.forEach((val, index) => {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = val;
            cell.title = `Index: ${index} (0x${index.toString(16).toUpperCase()})`;
            sboxGrid.appendChild(cell);
        });

        // Anime.js S-Box Grid Animation
        if (typeof anime !== 'undefined') {
            anime({
                targets: '.grid-cell',
                opacity: [0, 1],
                scale: [0, 1],
                delay: anime.stagger(2, { grid: [16, 16], from: 'center' }),
                duration: 400,
                easing: 'easeOutExpo'
            });
        }

        // [NEW] Capture active S-Box for Client-Side AES
        window.currentSBox = data.sbox;
        console.log("✅ Custom S-Box Loaded for Client-Side AES");
    }

    // =============== S-BOX CONSTRUCTOR ===============
    const PRESET_MATRICES = {
        'K4': [
            [0, 0, 0, 0, 0, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1, 1],
            [1, 1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 1, 0, 0],
            [0, 0, 0, 0, 1, 1, 1, 0]
        ],
        'K44': [
            [0, 1, 0, 1, 0, 1, 1, 1],
            [1, 0, 1, 0, 1, 0, 1, 1],
            [1, 1, 0, 1, 0, 1, 0, 1],
            [1, 1, 1, 0, 1, 0, 1, 0],
            [0, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0],
            [0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 1, 1, 1, 0]
        ],
        'K81': [
            [1, 0, 1, 0, 0, 0, 0, 1],
            [1, 1, 0, 1, 0, 0, 0, 0],
            [0, 1, 1, 0, 1, 0, 0, 0],
            [0, 0, 1, 1, 0, 1, 0, 0],
            [0, 0, 0, 1, 1, 0, 1, 0],
            [0, 0, 0, 0, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 1, 0],
            [0, 1, 0, 0, 0, 0, 1, 1]
        ],
        'K111': [
            [1, 1, 0, 1, 1, 1, 0, 0],
            [0, 1, 1, 0, 1, 1, 1, 0],
            [0, 0, 1, 1, 0, 1, 1, 1],
            [1, 0, 0, 1, 1, 0, 1, 1],
            [1, 1, 0, 0, 1, 1, 0, 1],
            [1, 1, 1, 0, 0, 1, 1, 0],
            [0, 1, 1, 1, 0, 0, 1, 1],
            [1, 0, 1, 1, 1, 0, 0, 1]
        ],
        'K128': [
            [1, 1, 1, 1, 1, 1, 1, 0],
            [0, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 1, 1, 1, 1, 1, 1],
            [1, 1, 0, 1, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 1, 1],
            [1, 1, 1, 1, 0, 1, 1, 1],
            [1, 1, 1, 1, 1, 0, 1, 1],
            [1, 1, 1, 1, 1, 1, 0, 1]
        ],
        'K_AES': [
            [1, 0, 0, 0, 1, 1, 1, 1],
            [1, 1, 0, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 0, 1, 1],
            [1, 1, 1, 1, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 0, 0],
            [0, 0, 1, 1, 1, 1, 1, 0],
            [0, 0, 0, 1, 1, 1, 1, 1]
        ]
    };

    let currentMatrix = PRESET_MATRICES['K44'];
    let currentPolynomial = '0x11B'; // Default to Standard AES

    const methodSelect = document.getElementById('research-method-select');
    if (methodSelect) {
        methodSelect.addEventListener('change', (e) => {
            const method = e.target.value;
            if (method === 'paper2023') {
                currentPolynomial = '0x1F3';
                // Switch Dropdown to NEW_PAPER_MATRICES
                if (typeof NEW_PAPER_MATRICES !== 'undefined') {
                    populateMatrixDropdown(NEW_PAPER_MATRICES);
                    // Select first one (A0) by default
                    if (NEW_PAPER_MATRICES.length > 0) {
                        currentMatrix = NEW_PAPER_MATRICES[0].matrix;
                        loadMatrixEditor(currentMatrix);
                        if (selectedText) selectedText.textContent = `${NEW_PAPER_MATRICES[0].name} (Val: ${NEW_PAPER_MATRICES[0].val})`;
                    }
                }
                // Disable/Fade standard buttons
                presetButtons.forEach(btn => btn.classList.add('disabled-btn'));
            } else {
                currentPolynomial = '0x11B';
                // Switch Dropdown to AFFINE_MATRICES
                if (typeof AFFINE_MATRICES !== 'undefined') {
                    populateMatrixDropdown(AFFINE_MATRICES);
                }
                presetButtons.forEach(btn => btn.classList.remove('disabled-btn'));
            }
        });
    }

    const matrixEditor = document.getElementById('matrix-editor');
    const matrixGrid = document.getElementById('matrix-grid');
    const constructBtn = document.getElementById('construct-btn');
    const constructorResults = document.getElementById('constructor-results');

    // Preset buttons
    const presetButtons = document.querySelectorAll('.preset-btn');
    const matrixDropdown = document.getElementById('matrix-preset-select');

    presetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Highlight active button
            presetButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Clear dropdown
            if (matrixDropdown) matrixDropdown.value = "";

            const matrixName = btn.dataset.matrix;
            if (matrixName && PRESET_MATRICES[matrixName]) {
                currentMatrix = PRESET_MATRICES[matrixName]; // Use deep copy if needed, but presets are const
                loadMatrixEditor(currentMatrix);
                matrixEditor.classList.remove('hidden');
            } else if (btn.classList.contains('custom-matrix-btn')) {
                // Custom matrix - initialize with zeros
                currentMatrix = Array(8).fill(null).map(() => Array(8).fill(0));
                loadMatrixEditor(currentMatrix);
                matrixEditor.classList.remove('hidden');
            }
        });
    });

    // Set default active button (K44 - Best)
    const defaultBtn = document.querySelector('[data-matrix="K44"]');
    if (defaultBtn) {
        defaultBtn.classList.add('active');
        // Trigger click to load the matrix
        defaultBtn.click();
    }
    // Removing the early closing of DOMContentLoaded here
    // }); 

    // --- Custom Dropdown Logic for K1-K128 ---
    const dropdown = document.getElementById('matrix-dropdown');
    const dropdownTrigger = document.getElementById('matrix-trigger');
    const dropdownMenu = document.getElementById('matrix-menu');
    const dropdownItems = document.getElementById('matrix-items');
    const dropdownSearch = document.getElementById('matrix-search');
    const selectedText = document.getElementById('matrix-selected-text');

    function populateMatrixDropdown(matrices) {
        if (!dropdownItems) return;
        dropdownItems.innerHTML = '';

        matrices.forEach(item => {
            const div = document.createElement('div');
            div.className = 'dropdown-item';

            let badges = '';
            if (item.name === 'K44') badges = '<span class="item-badge best">BEST</span>';
            else if (['K4', 'K81', 'K111', 'K128'].includes(item.name)) badges = '<span class="item-badge paper">PAPER</span>';
            else if (['A0', 'A1', 'A2'].includes(item.name)) badges = '<span class="item-badge new-paper">NEW (2023)</span>';
            else if (item.val === 143) badges = '<span class="item-badge aes">AES</span>';

            div.innerHTML = `<span>${item.name} ${badges}</span><span class="item-val">Val: ${item.val}</span>`;

            div.onclick = function () {
                selectedText.textContent = `${item.name} (Val: ${item.val})`;
                selectedText.style.color = 'var(--primary-color)';
                dropdownMenu.classList.remove('active');

                presetButtons.forEach(b => b.classList.remove('active'));
                currentMatrix = JSON.parse(JSON.stringify(item.matrix));
                window.currentMatrixName = item.name; // Store matrix name for download
                loadMatrixEditor(currentMatrix);
                matrixEditor.classList.remove('hidden');
            };

            dropdownItems.appendChild(div);
        });
    }

    if (dropdown && dropdownTrigger && typeof AFFINE_MATRICES !== 'undefined') {
        console.log("✅ Dropdown elements found, initializing...");

        // Initial population
        populateMatrixDropdown(AFFINE_MATRICES);

        // Toggle on click
        dropdownTrigger.onclick = function (e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        };

        // Search
        dropdownSearch.oninput = function (e) {
            const filter = e.target.value.toLowerCase();
            Array.from(dropdownItems.children).forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(filter) ? '' : 'none';
            });
        };

        // Close on outside click
        document.onclick = function (e) {
            if (!dropdown.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        };

        console.log("✅ Dropdown initialized successfully");
    } else {
        console.error("❌ Dropdown initialization failed");
    }

    // End of Dropdown Logic

    function loadMatrixEditor(matrix) {
        matrixGrid.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'matrix-cell';
                input.value = matrix[i][j];
                input.maxLength = 1;
                input.dataset.row = i;
                input.dataset.col = j;
                input.addEventListener('input', (e) => {
                    const val = e.target.value;
                    if (val !== '0' && val !== '1' && val !== '') {
                        e.target.value = matrix[i][j];
                        return;
                    }
                    if (val === '') {
                        currentMatrix[i][j] = 0;
                    } else {
                        currentMatrix[i][j] = parseInt(val);
                    }
                });
                matrixGrid.appendChild(input);
            }
        }
    }

    // Construct S-box
    constructBtn.addEventListener('click', async () => {
        constructBtn.textContent = 'Constructing...';
        constructBtn.disabled = true;

        try {
            const response = await fetch('/construct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    affine_matrix: currentMatrix,
                    polynomial: currentPolynomial,
                    sample_inputs: [0, 15, 255]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Construction failed');
                return;
            }

            // Store affine matrix for specific input checker
            data.affine_matrix = currentMatrix;
            data.c_constant = null; // Will use default C_AES

            displayConstructorResults(data);
            constructorResults.classList.remove('hidden');

            // Store constructed S-Box for download
            constructedSbox = data.sbox;

            // Show download button
            const downloadBtn = document.getElementById('download-sbox-excel-btn');
            downloadBtn.classList.remove('hidden');

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to construct S-box.');
        } finally {
            constructBtn.textContent = 'Construct S-Box';
            constructBtn.disabled = false;
        }
    });

    function renderMatrix(matrix) {
        let html = '<div class="matrix-display">';
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                const val = matrix[i][j];
                html += `<div class="bit-cell ${val ? 'active' : ''}">${val}</div>`;
            }
        }
        html += '</div>';
        return html;
    }

    function renderVector(vector) {
        let html = '<div class="vector-display">';
        vector.forEach(val => {
            html += `<div class="bit-cell ${val ? 'active' : ''}">${val}</div>`;
        });
        html += '</div>';
        return html;
    }

    function displayConstructorResults(data) {
        // Store data globally for specific input checker
        window.lastConstructionData = data;

        // Validity badge
        const validityBadge = document.getElementById('validity-badge');
        validityBadge.textContent = data.valid ? '✓ VALID S-BOX' : '✗ INVALID S-BOX';
        validityBadge.className = 'badge ' + (data.valid ? 'badge-success' : 'badge-error');

        // Bijective & Balanced
        document.getElementById('const-bijective').textContent = data.is_bijective ? 'YES' : 'NO';
        document.getElementById('const-bijective').className = 'stat-value ' + (data.is_bijective ? 'valid' : 'invalid');

        const allBalanced = data.balance_results.every(r => r.is_balanced);
        document.getElementById('const-balanced').textContent = allBalanced ? 'YES' : 'NO';
        document.getElementById('const-balanced').className = 'stat-value ' + (allBalanced ? 'valid' : 'invalid');

        // S-box grid
        const sboxGridContainer = document.getElementById('constructed-sbox-grid');
        sboxGridContainer.innerHTML = '';
        data.sbox.forEach((val, idx) => {
            const cell = document.createElement('div');
            cell.className = 'grid-cell-small';
            cell.textContent = val;
            cell.title = `Index: ${idx}`;
            sboxGridContainer.appendChild(cell);
        });

        // Construction steps with MAXIMUM DETAIL
        const stepsContainer = document.getElementById('steps-container');
        stepsContainer.innerHTML = '';
        data.construction_steps.forEach((step, stepIdx) => {
            const stepCard = document.createElement('div');
            stepCard.className = 'step-card';

            const matrixHtml = renderMatrix(currentMatrix);
            const invVecHtml = renderVector(step.inverse_vector);
            const resVecHtml = renderVector(step.matrix_mult_result);
            const constVecHtml = renderVector(step.constant);
            const finalVecHtml = renderVector(step.final_vector);

            // Build row-by-row matrix multiplication details
            let rowDetailsHtml = '';
            step.matrix_rows_detail.forEach((rowDetail, idx) => {
                const dotProductStr = rowDetail.dot_products.map((val, i) => {
                    return `(${rowDetail.row[i]} × ${rowDetail.vector[i]} = ${val})`;
                }).join(' + ');

                rowDetailsHtml += `
                    <div class="row-detail">
                        <strong>Row ${idx}:</strong><br>
                        [${rowDetail.row.join(', ')}] · [${rowDetail.vector.join(', ')}]<br>
                        = ${dotProductStr}<br>
                        = ${rowDetail.sum} mod 2 = <strong>${rowDetail.result_bit}</strong>
                    </div>
                `;
            });

            // Build XOR details table
            let xorTableHtml = `
                <table class="calc-table">
                    <thead>
                        <tr>
                            <th>Bit</th>
                            <th>Matrix Result</th>
                            <th>C_AES</th>
                            <th>XOR (mod 2)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            step.xor_details.forEach(xor => {
                xorTableHtml += `
                    <tr>
                        <td>b${xor.index}</td>
                        <td>${xor.matrix_bit}</td>
                        <td>${xor.constant_bit}</td>
                        <td><strong>${xor.result_bit}</strong></td>
                    </tr>
                `;
            });
            xorTableHtml += `
                    </tbody>
                </table>
            `;

            stepCard.innerHTML = `
                <div class="step-header-collapsible" onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.collapse-icon').classList.toggle('rotated');">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-chevron-right collapse-icon" style="transition: transform 0.3s ease; font-size: 0.8rem;"></i>
                        <span>Input: ${step.input} (0x${step.input.toString(16).toUpperCase().padStart(2, '0')} = 0b${step.input_binary})</span>
                    </div>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">Click to expand</span>
                </div>
                <div class="step-body hidden" style="transition: max-height 0.3s ease;">
                   <div class="step-item">
                        <span class="step-label">Step 1: Multiplicative Inverse in GF(2^8)</span>
                        <div class="step-value" style="margin-top: 0.5rem; font-size: 1.1rem;">
                            GF_Inverse(${step.input}) = <strong>${step.inverse}</strong> (0x${step.inverse.toString(16).toUpperCase().padStart(2, '0')}, 0b${step.inverse_binary})
                        </div>
                        <div class="verification-box">
                            ✓ Verification: ${step.input} × ${step.inverse} = ${step.inverse_verification} (mod 0x11B) in GF(2^8)
                        </div>
                    </div>

                    <div class="step-item">
                        <span class="step-label">Step 2: Affine Transformation (Matrix Multiplication)</span>
                        <div class="step-explanation">K × X⁻¹ = Result (mod 2)</div>
                        <div class="math-container">
                            ${matrixHtml}
                            <div class="math-operator">×</div>
                            ${invVecHtml}
                            <div class="math-operator">=</div>
                            ${resVecHtml}
                        </div>

                        <div class="details-toggle" data-target="matrix-detail-${stepIdx}">
                            Show detailed row-by-row calculation
                        </div>
                        <div class="details-content" id="matrix-detail-${stepIdx}">
                            <h4 style="margin: 0 0 0.5rem 0; color: var(--primary-color);">Row-by-Row Dot Product Calculation:</h4>
                            ${rowDetailsHtml}
                            <div style="margin-top: 1rem; padding: 0.5rem; background: rgba(52, 152, 219, 0.1); border-radius: 4px;">
                                <strong>Final Result:</strong> [${step.matrix_mult_result.join(', ')}]
                            </div>
                        </div>
                    </div>

                    <div class="step-item">
                        <span class="step-label">Step 3: Add Constant C_AES (XOR / mod 2 addition)</span>
                        <div class="step-explanation">Result + C_AES = Final Output (mod 2)</div>
                        <div class="math-container">
                            ${resVecHtml}
                            <div class="math-operator">⊕</div>
                            ${constVecHtml}
                            <div class="math-operator">=</div>
                            ${finalVecHtml}
                        </div>

                        <div class="details-toggle" data-target="xor-detail-${stepIdx}">
                            Show bit-by-bit XOR calculation
                        </div>
                        <div class="details-content" id="xor-detail-${stepIdx}">
                            <h4 style="margin: 0 0 0.5rem 0; color: var(--primary-color);">Bit-by-Bit XOR:</h4>
                            ${xorTableHtml}
                        </div>
                    </div>

                    <div class="step-item">
                        <span class="step-label">Final S-Box Output:</span>
                        <div class="step-result-highlight">
                            S-Box(${step.input}) = 0x${step.output.toString(16).toUpperCase().padStart(2, '0')} = ${step.output} (0b${step.output_binary})
                        </div>
                    </div>
                </div>
            `;
            stepsContainer.appendChild(stepCard);
        });

        // Anime.js Constructor Results Animation
        if (typeof anime !== 'undefined') {
            anime({
                targets: '.step-card',
                opacity: [0, 1],
                translateY: [30, 0],
                delay: anime.stagger(100),
                duration: 600,
                easing: 'easeOutExpo'
            });
        }

        // Add event listeners for toggle buttons
        document.querySelectorAll('.details-toggle').forEach(toggle => {
            toggle.addEventListener('click', function () {
                const targetId = this.dataset.target;
                const content = document.getElementById(targetId);
                this.classList.toggle('active');
                content.classList.toggle('active');
            });
        });
    }

    // Specific Input Checker for Constructor
    const checkSpecificInputBtn = document.getElementById('check-specific-input-btn');
    if (checkSpecificInputBtn) {
        checkSpecificInputBtn.addEventListener('click', async () => {
            const inputValue = parseInt(document.getElementById('specific-input').value);
            const resultDiv = document.getElementById('specific-input-result');

            if (isNaN(inputValue) || inputValue < 0 || inputValue > 255) {
                alert('Please enter a valid input value between 0 and 255');
                return;
            }

            // Get the current affine matrix and constant (from last construct)
            if (!window.lastConstructionData || !window.lastConstructionData.affine_matrix) {
                alert('Please construct an S-Box first before checking specific inputs');
                return;
            }

            // Show loading
            checkSpecificInputBtn.disabled = true;
            checkSpecificInputBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';

            try {
                // Call backend to get construction steps for this specific input
                const response = await fetch('/trace_input', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        input_value: inputValue,
                        affine_matrix: window.lastConstructionData.affine_matrix,
                        c_constant: window.lastConstructionData.c_constant
                    })
                });

                const data = await response.json();

                if (!response.ok || data.error) {
                    throw new Error(data.error || 'Failed to trace input');
                }

                const specificStep = data.construction_step;

                // Display the construction process for this specific input
                resultDiv.innerHTML = '';
                resultDiv.classList.remove('hidden');

                const stepCard = document.createElement('div');
                stepCard.className = 'step-card';
                stepCard.style.animation = 'fadeIn 0.5s ease';

                const matrixHtml = renderMatrix(window.lastConstructionData.affine_matrix);
                const invVecHtml = renderVector(specificStep.inverse_vector);
                const resVecHtml = renderVector(specificStep.matrix_mult_result);
                const constVecHtml = renderVector(specificStep.constant);
                const finalVecHtml = renderVector(specificStep.final_vector);

                // Build row-by-row details
                let rowDetailsHtml = '';
                specificStep.matrix_rows_detail.forEach((rowDetail, idx) => {
                    const dotProductStr = rowDetail.dot_products.map((val, i) => {
                        return `(${rowDetail.row[i]} × ${rowDetail.vector[i]} = ${val})`;
                    }).join(' + ');

                    rowDetailsHtml += `
                    <div class="row-detail">
                        <strong>Row ${idx}:</strong><br>
                        [${rowDetail.row.join(', ')}] · [${rowDetail.vector.join(', ')}]<br>
                        = ${dotProductStr}<br>
                        = ${rowDetail.sum} mod 2 = <strong>${rowDetail.result_bit}</strong>
                    </div>
                `;
                });

                // Build XOR table
                let xorTableHtml = `
                <table class="calc-table">
                    <thead>
                        <tr>
                            <th>Bit</th>
                            <th>Matrix Result</th>
                            <th>C_AES</th>
                            <th>XOR (mod 2)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
                specificStep.xor_details.forEach(xor => {
                    xorTableHtml += `
                    <tr>
                        <td>b${xor.index}</td>
                        <td>${xor.matrix_bit}</td>
                        <td>${xor.constant_bit}</td>
                        <td><strong>${xor.result_bit}</strong></td>
                    </tr>
                `;
                });
                xorTableHtml += `
                    </tbody>
                </table>
            `;

                stepCard.innerHTML = `
                <div class="step-header" style="background: linear-gradient(135deg, rgba(0, 242, 255, 0.15), rgba(112, 0, 255, 0.1)); font-size: 1.1rem;">
                    Construction Process for Input: ${specificStep.input} → Output: ${specificStep.output}
                </div>
                <div class="step-body">
                    <div style="background: rgba(0, 242, 255, 0.1); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; border-left: 4px solid var(--primary-color);">
                        <strong style="color: var(--primary-color);">Summary:</strong> Input <strong>${specificStep.input}</strong> (0x${specificStep.input.toString(16).toUpperCase().padStart(2, '0')}) → Output <strong>${specificStep.output}</strong> (0x${specificStep.output.toString(16).toUpperCase().padStart(2, '0')})
                    </div>
                    
                    <div class="step-item">
                        <span class="step-label">Step 1: Multiplicative Inverse in GF(2^8)</span>
                        <div class="step-value" style="margin-top: 0.5rem; font-size: 1.1rem;">
                            GF_Inverse(${specificStep.input}) = <strong>${specificStep.inverse}</strong> (0x${specificStep.inverse.toString(16).toUpperCase().padStart(2, '0')}, 0b${specificStep.inverse_binary})
                        </div>
                        <div class="verification-box">
                            ✓ Verification: ${specificStep.input} × ${specificStep.inverse} = ${specificStep.inverse_verification} (mod 0x11B) in GF(2^8)
                        </div>
                    </div>

                    <div class="step-item">
                        <span class="step-label">Step 2: Affine Transformation (Matrix Multiplication)</span>
                        <div class="step-explanation">K × X⁻¹ = Result (mod 2)</div>
                        <div class="math-container">
                            ${matrixHtml}
                            <div class="math-operator">×</div>
                            ${invVecHtml}
                            <div class="math-operator">=</div>
                            ${resVecHtml}
                        </div>

                        <details style="margin-top: 1rem;">
                            <summary style="cursor: pointer; color: var(--primary-color); font-weight: 600;">Show detailed row-by-row calculation</summary>
                            <div style="margin-top: 1rem;">
                                <h4 style="margin: 0 0 0.5rem 0; color: var(--primary-color);">Row-by-Row Dot Product Calculation:</h4>
                                ${rowDetailsHtml}
                                <div style="margin-top: 1rem; padding: 0.5rem; background: rgba(52, 152, 219, 0.1); border-radius: 4px;">
                                    <strong>Final Result:</strong> [${specificStep.matrix_mult_result.join(', ')}]
                                </div>
                            </div>
                        </details>
                    </div>

                    <div class="step-item">
                        <span class="step-label">Step 3: Add Constant C_AES (XOR / mod 2  addition)</span>
                        <div class="step-explanation">Result + C_AES = Final Output (mod 2)</div>
                        <div class="math-container">
                            ${resVecHtml}
                            <div class="math-operator">⊕</div>
                            ${constVecHtml}
                            <div class="math-operator">=</div>
                            ${finalVecHtml}
                        </div>

                        <details style="margin-top: 1rem;">
                            <summary style="cursor: pointer; color: var(--primary-color); font-weight: 600;">Show XOR bit-by-bit</summary>
                            <div style="margin-top: 1rem;">
                                ${xorTableHtml}
                            </div>
                        </details>
                    </div>

                    <div style="background: linear-gradient(135deg, rgba(0, 242, 255, 0.1), rgba(16, 185, 129, 0.1)); padding: 1.5rem; border-radius: 0.75rem; margin-top: 1.5rem; border: 2px solid rgba(0, 242, 255, 0.3);">
                        <h4 style="margin: 0 0 1rem 0; color: var(--primary-color);">
                            <i class="fas fa-check-circle"></i> Final Result
                        </h4>
                        <div style="font-size: 1.2rem;">
                            <strong>Input ${specificStep.input}</strong> (0x${specificStep.input.toString(16).toUpperCase().padStart(2, '0')}) 
                            → 
                            <strong style="color: #10b981;">Output ${specificStep.output}</strong> (0x${specificStep.output.toString(16).toUpperCase().padStart(2, '0')})
                        </div>
                        <div style="margin-top: 0.75rem; font-size: 0.9rem; color: var(--text-muted);">
                            Binary: 0b${specificStep.input_binary} → 0b${specificStep.output_binary}
                        </div>
                    </div>
                </div>
            `;

                resultDiv.appendChild(stepCard);
                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            } catch (error) {
                console.error('Error tracing input:', error);
                alert(`Error: ${error.message}`);
            } finally {
                // Restore button state
                checkSpecificInputBtn.disabled = false;
                checkSpecificInputBtn.innerHTML = '<i class="fas fa-play"></i> Trace Construction';
            }
        });
    }


    function displayEncryptionProcess(traceData) {
        const processContainer = document.getElementById('encryption-process');
        const stepsContainer = document.getElementById('process-steps');
        processContainer.classList.remove('hidden');
        stepsContainer.innerHTML = '';

        traceData.forEach((item, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step-card';

            let title = '';
            if (item.round === 'Init') {
                title = 'Initialization (Input State)';
            } else {
                title = `Round ${item.round}: ${item.step}`;
            }

            stepDiv.innerHTML = `<div class="step-header">${title}</div>`;

            const bodyDiv = document.createElement('div');
            bodyDiv.className = 'step-body';

            // Container for State and Key (if present)
            const contentContainer = document.createElement('div');
            contentContainer.style.display = 'flex';
            contentContainer.style.flexWrap = 'wrap';
            contentContainer.style.gap = '2rem';
            contentContainer.style.alignItems = 'center';

            // Render State
            const stateWrapper = document.createElement('div');
            const stateLabel = document.createElement('div');
            stateLabel.innerHTML = '<strong>State</strong>';
            stateLabel.style.marginBottom = '0.5rem';
            stateLabel.style.color = 'var(--text-muted)';

            const stateGrid = document.createElement('div');
            stateGrid.className = 'state-grid-4x4';

            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'grid-cell-small';
                    cell.textContent = item.state[r][c].toString(16).toUpperCase().padStart(2, '0');
                    cell.title = `Row ${r}, Col ${c}`;
                    stateGrid.appendChild(cell);
                }
            }
            stateWrapper.appendChild(stateLabel);
            stateWrapper.appendChild(stateGrid);
            contentContainer.appendChild(stateWrapper);

            // If Key is present (AddRoundKey)
            if (item.key) {
                // Operator
                const operator = document.createElement('div');
                operator.innerHTML = '⊕'; // XOR symbol
                operator.style.fontSize = '2rem';
                operator.style.fontWeight = 'bold';
                operator.style.color = 'var(--primary-color)';
                contentContainer.appendChild(operator);

                const keyWrapper = document.createElement('div');
                const keyLabel = document.createElement('div');
                keyLabel.innerHTML = '<strong>Round Key</strong>';
                keyLabel.style.marginBottom = '0.5rem';
                keyLabel.style.color = 'var(--text-muted)';

                const keyGrid = document.createElement('div');
                keyGrid.className = 'state-grid-4x4';

                for (let r = 0; r < 4; r++) {
                    for (let c = 0; c < 4; c++) {
                        const cell = document.createElement('div');
                        cell.className = 'grid-cell-small';
                        cell.textContent = item.key[r][c].toString(16).toUpperCase().padStart(2, '0');
                        keyGrid.appendChild(cell);
                    }
                }
                keyWrapper.appendChild(keyLabel);
                keyWrapper.appendChild(keyGrid);
                contentContainer.appendChild(keyWrapper);
            }

            bodyDiv.appendChild(contentContainer);
            stepDiv.appendChild(bodyDiv);
            stepsContainer.appendChild(stepDiv);
        });

        // Staggered Animation for Encryption Flow
        if (typeof anime !== 'undefined') {
            anime({
                targets: '#process-steps .step-card',
                opacity: [0, 1],
                translateX: [-50, 0],
                delay: anime.stagger(200),
                duration: 800,
                easing: 'easeOutQuint'
            });
        }
    }

    // =============== EXCEL DOWNLOAD/UPLOAD ===============

    // Download S-Box as Excel
    const downloadSboxExcelBtn = document.getElementById('download-sbox-excel-btn');
    if (downloadSboxExcelBtn) {
        downloadSboxExcelBtn.addEventListener('click', async () => {
            if (!constructedSbox || constructedSbox.length !== 256) {
                alert('No valid S-Box to download. Please construct an S-Box first.');
                return;
            }

            try {
                const originalText = downloadSboxExcelBtn.innerHTML;
                downloadSboxExcelBtn.innerHTML = '<span class="btn-content"><i class="fas fa-spinner fa-spin"></i><span>Generating...</span></span>';
                downloadSboxExcelBtn.disabled = true;

                const response = await fetch('/download_sbox_excel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sbox: constructedSbox,
                        matrix_name: window.currentMatrixName || 'Custom'
                    })
                });

                if (!response.ok) {
                    const data = await response.json();
                    alert(data.error || 'Download failed');
                    downloadSboxExcelBtn.innerHTML = originalText;
                    downloadSboxExcelBtn.disabled = false;
                    return;
                }

                // Trigger download
                const blob = await response.blob();

                // Get filename from Content-Disposition header or use default
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = 'Sbox_Custom.xlsx';
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
                    if (filenameMatch && filenameMatch[1]) {
                        filename = filenameMatch[1].replace(/['"]/g, '');
                    }
                }

                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.setAttribute('download', filename);
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                downloadSboxExcelBtn.innerHTML = originalText;
                downloadSboxExcelBtn.disabled = false;

            } catch (error) {
                console.error('Error:', error);
                alert('Failed to download Excel file.');
                downloadSboxExcelBtn.innerHTML = '<span class="btn-content"><i class="fas fa-file-excel"></i><span>Download S-Box as Excel</span></span>';
                downloadSboxExcelBtn.disabled = false;
            }
        });
    }

    // Upload S-Box from Excel
    // [REFACTORED] Reusable S-Box Upload Function
    async function handleSBoxUpload(file, statusElementId = null) {
        if (!file) return;

        // Find status element (try global or create/find local one if needed)
        // For simplicity, we use the global uploadStatus or alert
        const uploadStatus = document.getElementById('upload-status');
        if (uploadStatus) {
            uploadStatus.classList.remove('hidden');
            uploadStatus.style.background = 'rgba(59, 130, 246, 0.1)';
            uploadStatus.style.border = '1px solid rgba(59, 130, 246, 0.3)';
            uploadStatus.style.color = 'var(--primary-color)';
            uploadStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading and parsing Excel file...';
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload_sbox_excel', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                if (uploadStatus) {
                    uploadStatus.style.background = 'rgba(239, 68, 68, 0.1)';
                    uploadStatus.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                    uploadStatus.style.color = '#ef4444';
                    uploadStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${data.error || 'Upload failed'}`;
                } else {
                    alert('Upload failed: ' + (data.error || 'Unknown error'));
                }
                return;
            }

            // Success - populate custom S-Box textarea (Shared Source of Truth)
            const sboxString = data.sbox.join(' ');
            const customSboxTextarea = document.getElementById('custom-sbox');
            if (customSboxTextarea) customSboxTextarea.value = sboxString;

            // Sync ALL S-Box Selectors to 'custom'
            const selectors = ['sbox-select', 'text-sbox-select', 'image-sbox-select'];
            selectors.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = 'custom';
            });

            // Show success message
            // Show success message
            if (statusElementId) {
                const statusEl = document.getElementById(statusElementId);
                if (statusEl) {
                    statusEl.classList.remove('hidden');
                    statusEl.innerHTML = `<i class="fas fa-check-circle"></i> ${data.message}`;
                    setTimeout(() => statusEl.classList.add('hidden'), 3000);
                }
            } else if (uploadStatus) {
                // Fallback to Tab 2 status
                uploadStatus.style.background = 'rgba(16, 185, 129, 0.1)';
                uploadStatus.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                uploadStatus.style.color = '#10b981';
                uploadStatus.innerHTML = `<i class="fas fa-check-circle"></i> ${data.message} (256 values loaded)`;

                // Hide after 3s
                setTimeout(() => uploadStatus.classList.add('hidden'), 3000);
            } else {
                alert('S-Box Uploaded Successfully!');
            }

            // If we are in Tab 2, show custom input container
            if (customInputContainer && uploadInputContainer) {
                customInputContainer.classList.remove('hidden');
                uploadInputContainer.classList.add('hidden');
            }

        } catch (error) {
            console.error('Error:', error);
            if (uploadStatus) uploadStatus.innerHTML = 'Error uploading file';
        }
    }

    // Bind Main Upload (Tab 2)
    const excelUpload = document.getElementById('excel-upload');
    if (excelUpload) {
        excelUpload.addEventListener('change', (e) => handleSBoxUpload(e.target.files[0]));
    }

    // Bind Text Crypto Upload (Tab 3)
    const textSboxUploadFile = document.getElementById('text-sbox-upload-file');
    if (textSboxUploadFile) {
        textSboxUploadFile.addEventListener('change', (e) => {
            handleSBoxUpload(e.target.files[0], 'text-upload-status');
        });
    }

    // Bind Image Crypto Upload (Tab 4)
    const imageSboxUploadFile = document.getElementById('image-sbox-upload-file');
    if (imageSboxUploadFile) {
        imageSboxUploadFile.addEventListener('change', (e) => {
            handleSBoxUpload(e.target.files[0], 'image-upload-status');
        });
    }

    // Synchronization Logic (Optional: Keep selectors in sync or let them be independent?)
    // User expectation: "I verified in Tab 2, now I want to use it in Tab 3."
    // Strategy: When one changes, update others? Or just let them be independent?
    // Let's keep them independent BUT default them to match global state on load/change?
    // Actually, simplest is: One Global Source of Truth is better for UX here.
    // If I select "K4" in Text, it should probably select "K4" everywhere to avoid confusion.
    function syncSBoxSelectors(sourceId) {
        const val = document.getElementById(sourceId).value;
        ['sbox-select', 'text-sbox-select', 'image-sbox-select'].forEach(id => {
            const el = document.getElementById(id);
            if (el && id !== sourceId) el.value = val;
        });

        // Handle UI visibility in Tab 2
        if (sourceId !== 'sbox-select') {
            if (val === 'custom') {
                if (customInputContainer) customInputContainer.classList.remove('hidden');
                if (uploadInputContainer) uploadInputContainer.classList.add('hidden');
            } else if (val === 'upload') {
                if (customInputContainer) customInputContainer.classList.add('hidden');
                if (uploadInputContainer) uploadInputContainer.classList.remove('hidden');
            } else {
                if (customInputContainer) customInputContainer.classList.add('hidden');
                if (uploadInputContainer) uploadInputContainer.classList.add('hidden');
            }
        }

        // Handle UI visibility in Text Tab (Tab 3)
        const textUploadContainer = document.getElementById('text-upload-container');
        if (textUploadContainer) {
            if (val === 'upload') textUploadContainer.classList.remove('hidden');
            else textUploadContainer.classList.add('hidden');
        }

        // Handle UI visibility in Image Tab (Tab 4)
        const imageUploadContainer = document.getElementById('image-upload-container');
        if (imageUploadContainer) {
            if (val === 'upload') imageUploadContainer.classList.remove('hidden');
            else imageUploadContainer.classList.add('hidden');
        }
    }

    ['sbox-select', 'text-sbox-select', 'image-sbox-select'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', (e) => {
                syncSBoxSelectors(e.target.id);
                // Trigger global change handler for sbox-select to update UI in Tab 2
                if (e.target.id === 'sbox-select') {
                    // Original handler logic is already attached to 'change'
                }
            });
        }
    });



    // =============== ADVANCED VISUALS (HEATMAPS) ===============
    const loadVisualsBtn = document.getElementById('load-visuals-btn');
    const ddtCanvas = document.getElementById('ddt-heatmap');
    const latCanvas = document.getElementById('lat-heatmap');

    if (loadVisualsBtn) {
        loadVisualsBtn.addEventListener('click', async () => {
            const type = sboxSelect.value;
            const customSbox = document.getElementById('custom-sbox').value;

            // Show loaders
            document.getElementById('ddt-loader').classList.remove('hidden');
            document.getElementById('lat-loader').classList.remove('hidden');
            loadVisualsBtn.disabled = true;

            try {
                const response = await fetch('/analyze_advanced', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: type, custom_sbox: type === 'custom' ? customSbox : null })
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.error || 'Failed to load visuals');
                    return;
                }

                // Render Heatmaps
                renderHeatmap(ddtCanvas, data.ddt, 'ddt');
                renderHeatmap(latCanvas, data.lat, 'lat');

            } catch (error) {
                console.error(error);
                alert('Error loading visuals');
            } finally {
                document.getElementById('ddt-loader').classList.add('hidden');
                document.getElementById('lat-loader').classList.add('hidden');
                loadVisualsBtn.disabled = false;
            }
        });
    }

    function renderHeatmap(canvas, matrix, type) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const imgData = ctx.createImageData(width, height);
        const data = imgData.data;

        let maxVal = 0;
        // Find max value to normalize colors
        for (let i = 0; i < 256; i++) {
            for (let j = 0; j < 256; j++) {
                if (type === 'lat') {
                    // LAT values are signed, we care about magnitude
                    if (Math.abs(matrix[i][j]) > maxVal) maxVal = Math.abs(matrix[i][j]);
                } else {
                    // DDT values are counts
                    // Ignore index 0,0 for map max finding in DDT usually as it's always 256
                    if (i === 0 && j === 0 && type === 'ddt') continue;
                    if (matrix[i][j] > maxVal) maxVal = matrix[i][j];
                }
            }
        }

        for (let y = 0; y < 256; y++) {
            for (let x = 0; x < 256; x++) {
                const val = matrix[y][x]; // Row y, Col x
                const idx = (y * 256 + x) * 4;

                let r, g, b;

                if (type === 'ddt') {
                    // DDT Color Map: Black (0) -> Blue -> Red -> Yellow (Max)
                    // Skip 0,0 (always 256)
                    if (x === 0 && y === 0) {
                        r = 255; g = 255; b = 255; // White for identity
                    } else {
                        const intensity = val / maxVal; // 0 to 1
                        if (val === 0) { r = 0; g = 0; b = 0; }
                        else {
                            // Thermal Gradient simulation
                            r = Math.min(255, intensity * 255 * 2);
                            g = Math.min(255, Math.max(0, (intensity - 0.5) * 255 * 2));
                            b = Math.min(255, Math.max(0, (0.5 - intensity) * 255 * 2));
                        }
                    }
                } else {
                    // LAT Color Map: Biased (-128 to 128)
                    // 0 = Black/Gray. High positive = Red. High negative = Blue.
                    const norm = val / 128.0; // -1 to 1 theoretical max (AES is smaller)
                    // Visualize magnitude primarily
                    const mag = Math.abs(val) / maxVal;
                    r = mag * 255;
                    g = 0;
                    b = (1 - mag) * 50; // Deep blue background

                    if (val === 0) { r = 10; g = 10; b = 20; }
                }

                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = 255; // Alpha
            }
        }

        ctx.putImageData(imgData, 0, 0);
    }

    // =============== AVALANCHE DEMO ===============
    const avalancheInputGrid = document.getElementById('avalanche-input-grid');
    const avalancheOutputGrid = document.getElementById('avalanche-output-grid');

    // Initialize grids with 128 bits
    if (avalancheInputGrid && avalancheOutputGrid) {
        // Create 128 input bits
        for (let i = 0; i < 128; i++) {
            const bit = document.createElement('div');
            bit.className = 'interactive-bit';
            bit.dataset.idx = i;
            bit.textContent = '0'; // Default 0
            bit.addEventListener('click', () => toggleAvalancheBit(i));
            avalancheInputGrid.appendChild(bit);
        }

        // Create 128 output bits
        for (let i = 0; i < 128; i++) {
            const bit = document.createElement('div');
            bit.className = 'interactive-bit output';
            bit.textContent = '0';
            avalancheOutputGrid.appendChild(bit);
        }

        // Initial run
        // runAvalancheCheck(0); // Optional auto-run
    }

    async function toggleAvalancheBit(idx) {
        // Update input grid visual
        const bitEls = avalancheInputGrid.children;
        const currentBit = bitEls[idx];
        const newVal = currentBit.textContent === '0' ? '1' : '0';
        currentBit.textContent = newVal;
        currentBit.classList.toggle('active');

        // Run check
        runAvalancheCheck(idx);
    }

    async function runAvalancheCheck(flippedIdx) {
        // [MODIFIED] Client-Side Avalanche Check
        const customSbox = window.currentSBox;
        const textStr = textInput.value || 'Wait is this real?';
        const keyStr = encryptionKeyInput.value || '000102030405060708090a0b0c0d0e0f';

        try {
            const aes = new AES_Client(keyStr, customSbox);

            // 1. Get Base Ciphertext
            // Need to handle text input padding correctly to get the FIRST block
            // AES_Client.encryptText returns flat hex. 
            // We need raw bytes of the first block.

            // Helper to get first 128-bit block from string
            const encoder = new TextEncoder();
            let bytes = Array.from(encoder.encode(textStr));
            // Pad if less than 16 (or take first 16 if more)
            if (bytes.length < 16) {
                const padding = 16 - (bytes.length % 16);
                for (let i = 0; i < padding; i++) bytes.push(padding);
            }
            const block0 = bytes.slice(0, 16); // Only analyze first block

            // Encrypt Original
            const c0 = aes.encryptBlock(block0);

            // 2. Flip Bit in Input
            const blockModified = [...block0];
            const byteIdx = Math.floor(flippedIdx / 8);
            const bitOffset = 7 - (flippedIdx % 8); // Big Endian bits usually in visualization?
            // Actually existing grid runs 0..127. 
            // Let's assume bit 0 is Byte 0 Bit 7 (MSB) or Bit 0 (LSB)?
            // Standard naming: Bit 0 is usually MSB of Byte 0 in crypto diagrams, but let's match existing UI logic.
            // Existing UI toggles simple array.

            blockModified[byteIdx] ^= (1 << bitOffset);

            // Encrypt Modified
            const c1 = aes.encryptBlock(blockModified);

            // 3. Calculate Diff
            let changedCount = 0;
            const diffBits = [];

            for (let i = 0; i < 16; i++) {
                const diffByte = c0[i] ^ c1[i];
                for (let b = 0; b < 8; b++) {
                    if ((diffByte >> (7 - b)) & 1) { // Check bits high to low
                        changedCount++;
                        diffBits.push(i * 8 + b);
                    }
                }
            }

            const percent = (changedCount / 128) * 100;

            // Update Stats
            const countEl = document.getElementById('avalanche-count');
            const percentEl = document.getElementById('avalanche-percent');
            if (countEl) countEl.textContent = changedCount;
            if (percentEl) percentEl.textContent = percent.toFixed(2) + '%';

            // Update Output Grid
            const outBits = avalancheOutputGrid.children;

            // Reset all
            for (let i = 0; i < 128; i++) {
                outBits[i].classList.remove('changed');
            }

            diffBits.forEach(bitIdx => {
                if (bitIdx < 128) {
                    outBits[bitIdx].classList.add('changed');
                }
            });

            // Animate (Optional, usually too fast for animejs on every click, but ok)
            /*
           if (typeof anime !== 'undefined') {
               anime({
                   targets: '.interactive-bit.changed',
                   scale: [1.5, 1],
                   direction: 'alternate',
                   duration: 200
               });
           }
           */

        } catch (e) {
            console.error("Avalanche Check Error:", e);
        }
    }

    // =============== IMAGE ENCRYPTION ===============
    const selectImageBtn = document.getElementById('select-image-btn');
    const imageUploadInput = document.getElementById('image-upload');
    const encryptImageBtn = document.getElementById('encrypt-image-btn');
    const imageFileName = document.getElementById('image-file-name');
    const imageResults = document.getElementById('image-results');

    let selectedImageFile = null;
    let histChartOrig = null;
    let histChartEnc = null;

    if (selectImageBtn && imageUploadInput) {
        selectImageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            imageUploadInput.click();
        });


        imageUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedImageFile = file;
                imageFileName.textContent = file.name;
                encryptImageBtn.disabled = false;

                // Immediate Preview
                const reader = new FileReader();
                reader.onload = function (e) {
                    imageResults.classList.remove('hidden');
                    document.getElementById('img-preview-orig').src = e.target.result;
                    // Clear previous results
                    document.getElementById('img-preview-enc').src = '';
                    // Clear charts
                    if (histChartOrig) histChartOrig.destroy();
                    if (histChartEnc) histChartEnc.destroy();
                }
                reader.readAsDataURL(file);
            }
        });

        encryptImageBtn.addEventListener('click', async () => {
            if (!selectedImageFile) return;

            const type = sboxSelect.value;
            const customSbox = document.getElementById('custom-sbox').value;
            // Use dedicated key input for image
            const keyInput = document.getElementById('image-encryption-key');
            const key = keyInput ? keyInput.value.trim() : '';

            // Get selected mode
            const mode = document.querySelector('input[name="enc-mode"]:checked').value;

            const formData = new FormData();
            formData.append('image_file', selectedImageFile);
            formData.append('type', type);
            formData.append('custom_sbox', customSbox);
            formData.append('key', key);
            formData.append('encryption_mode', mode);

            try {
                const originalText = encryptImageBtn.innerHTML;
                encryptImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Encrypting...';
                encryptImageBtn.disabled = true;

                const response = await fetch('/encrypt', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.error || 'Image encryption failed');
                    encryptImageBtn.innerHTML = originalText;
                    encryptImageBtn.disabled = false;
                    return;
                }

                // Display Results
                imageResults.classList.remove('hidden');

                // Show Metrics Section immediately
                const metricsSection = document.getElementById('image-analysis-metrics');
                if (metricsSection) metricsSection.classList.remove('hidden');

                document.getElementById('img-preview-orig').src = data.original_image;
                // Ensure data URI prefix
                let encSrc = data.encrypted_image;
                if (!encSrc.startsWith('data:image')) {
                    encSrc = `data:image/png;base64,${encSrc}`;
                }
                document.getElementById('img-preview-enc').src = encSrc;

                // Render Histograms
                renderHistogram('hist-orig', data.hist_original, 'Original Histogram');
                renderHistogram('hist-enc', data.hist_encrypted, 'Encrypted Histogram');

                // Setup Download Button
                const downloadBtn = document.getElementById('download-encrypted-image-btn');
                if (downloadBtn) {
                    downloadBtn.style.display = 'inline-block';
                    downloadBtn.onclick = function (e) {
                        e.preventDefault();
                        const link = document.createElement('a');
                        link.href = encSrc;
                        link.download = 'encrypted_image.png';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    };
                }

                // Auto-trigger Deep Analysis
                setTimeout(() => {
                    const deepBtn = document.getElementById('run-deep-analysis-btn');
                    if (deepBtn && !deepBtn.disabled) {
                        deepBtn.click();
                    }
                }, 500);

                encryptImageBtn.innerHTML = originalText;
                encryptImageBtn.disabled = false;

            } catch (error) {
                console.error(error);
                alert('Error: ' + error.message);
                encryptImageBtn.innerHTML = '<i class="fas fa-lock"></i> Encrypt Image (AES-ECB)';
                encryptImageBtn.disabled = false;
            }
        });
    }

    // New Image Analysis Handlers
    const deepAnalysisBtn = document.getElementById('run-deep-analysis-btn');
    if (deepAnalysisBtn) {
        deepAnalysisBtn.addEventListener('click', async () => {
            if (!selectedImageFile) {
                alert('Please upload and encrypt an image first.');
                return;
            }

            const type = sboxSelect.value;
            const customSbox = document.getElementById('custom-sbox').value;

            const keyInput = document.getElementById('image-encryption-key');
            const key = keyInput ? keyInput.value.trim() : '';

            const mode = document.querySelector('input[name="enc-mode"]:checked').value;

            const formData = new FormData();
            formData.append('image_file', selectedImageFile);
            formData.append('type', type);
            formData.append('custom_sbox', customSbox);
            formData.append('key', key);
            formData.append('encryption_mode', mode);

            try {
                deepAnalysisBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
                deepAnalysisBtn.disabled = true;

                const response = await fetch('/analyze_image_sensitivity', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Analysis failed');
                }

                document.getElementById('img-original-entropy-value').textContent = data.original_entropy.toFixed(4);
                document.getElementById('img-entropy-value').textContent = data.entropy.toFixed(4);
                document.getElementById('img-npcr-value').textContent = data.npcr.toFixed(4) + '%';
                document.getElementById('img-uaci-value').textContent = data.uaci.toFixed(4) + '%';

            } catch (error) {
                console.error(error);
                alert('Analysis Error: ' + error.message);
            } finally {
                deepAnalysisBtn.innerHTML = '<i class="fas fa-play-circle"></i> Run Deep Analysis (Entropy & NPCR)';
                deepAnalysisBtn.disabled = false;
            }
        });
    }

    // New Image Decryption Handlers
    const selectEncImgBtn = document.getElementById('select-encrypted-image-btn');
    const encImgUpload = document.getElementById('encrypted-image-upload');
    const decryptImgBtn = document.getElementById('decrypt-image-btn');
    const decKeyInput = document.getElementById('decryption-key-input');

    let selectedEncryptedFile = null;

    if (selectEncImgBtn && encImgUpload) {
        selectEncImgBtn.addEventListener('click', () => encImgUpload.click());

        encImgUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                selectedEncryptedFile = file;
                document.getElementById('encrypted-image-file-name').textContent = file.name;
                decryptImgBtn.disabled = false;
            }
        });

        decryptImgBtn.addEventListener('click', async () => {
            if (!selectedEncryptedFile) return;

            const type = sboxSelect.value;
            const customSbox = document.getElementById('custom-sbox').value;
            const key = decKeyInput.value;
            const mode = document.querySelector('input[name="enc-mode"]:checked').value;

            const formData = new FormData();
            formData.append('encrypted_image', selectedEncryptedFile);
            formData.append('type', type);
            formData.append('custom_sbox', customSbox);
            formData.append('key', key);
            formData.append('encryption_mode', mode);

            try {
                decryptImgBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Decrypting...';
                decryptImgBtn.disabled = true;

                const response = await fetch('/decrypt_image', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Decryption failed');
                }

                document.getElementById('decryption-result').classList.remove('hidden');
                document.getElementById('img-preview-decrypted').src = data.decrypted_image;

            } catch (error) {
                console.error(error);
                alert('Decryption Error: ' + error.message);
            } finally {
                decryptImgBtn.innerHTML = '<i class="fas fa-unlock-alt"></i> Decrypt Image';
                decryptImgBtn.disabled = false;
            }
        });
    }

    function renderHistogram(canvasId, histData, label) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        const labels = Array.from({ length: 256 }, (_, i) => i);

        // Destroy prev chart if exists
        // (We need global ref tracking or just destroy on canvas check? Map is better)
        // Simple hack: check if chart instance stored on canvas property (Chart.js 2/3 specific)
        // Or store in variables like histChartOrig
        if (canvasId === 'hist-orig' && histChartOrig) histChartOrig.destroy();
        if (canvasId === 'hist-enc' && histChartEnc) histChartEnc.destroy();

        const chartConfig = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Red',
                        data: histData.r,
                        borderColor: 'rgba(239, 68, 68, 0.8)',
                        borderWidth: 1,
                        pointRadius: 0,
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Green',
                        data: histData.g,
                        borderColor: 'rgba(34, 197, 94, 0.8)',
                        borderWidth: 1,
                        pointRadius: 0,
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Blue',
                        data: histData.b,
                        borderColor: 'rgba(59, 130, 246, 0.8)',
                        borderWidth: 1,
                        pointRadius: 0,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: { display: true, text: label, color: '#9ca3af' }
                },
                scales: {
                    x: { display: false },
                    y: {
                        display: true,
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#6b7280' }
                    }
                },
                elements: {
                    line: { tension: 0.4 } // Smooth curves
                }
            }
        };

        const newChart = new Chart(ctx, chartConfig);

        if (canvasId === 'hist-orig') histChartOrig = newChart;
        if (canvasId === 'hist-enc') histChartEnc = newChart;
    }

});

// ==========================================
// 4. (REMOVED) INTERACTIVE TUTORIAL / TOUR
// ==========================================


// ==========================================
// 5. ADVANCED AVALANCHE VISUALIZATION
// ==========================================
const avRoundSlider = document.getElementById('av-round-slider');
const avRoundDisplay = document.getElementById('av-round-display');

if (avRoundSlider) {
    avRoundSlider.addEventListener('input', (e) => {
        const round = parseInt(e.target.value);
        if (avRoundDisplay) avRoundDisplay.textContent = round;
        updateAvalancheVisualization(round);
    });
}

function updateAvalancheVisualization(round) {
    // Requires window.lastTrace (from encryptBtn)
    if (!window.lastTrace) return;

    // Find trace data for this round
    // round 0 = start state
    // round 1-10 = finalState of that round

    let state = null;

    if (round === 0) {
        // Init state
        const t0 = window.lastTrace.find(t => t.round === 0);
        state = t0 ? (t0.finalState || t0.start) : null;
    } else {
        const t = window.lastTrace.find(t => t.round === round);
        state = t ? t.finalState : null;
    }

    if (state) {
        renderAvalancheGrid(state);
    }
}

function renderAvalancheGrid(state) {
    const grid = document.getElementById('av-state-grid');
    if (!grid) return;
    grid.innerHTML = '';

    // state is 16 bytes
    state.forEach((val, idx) => {
        const cell = document.createElement('div');
        cell.className = 'grid-cell-small';
        cell.textContent = val.toString(16).toUpperCase().padStart(2, '0');

        // Heatmap Coloring (Value magnitude)
        const intensity = val / 255;
        cell.style.backgroundColor = `rgba(37, 99, 235, ${0.1 + intensity * 0.5})`;
        cell.style.borderColor = `rgba(37, 99, 235, ${0.3 + intensity * 0.7})`;

        grid.appendChild(cell);
    });

    // Update bit stats (Dummy for now, real calc needs diff)
    const statsEl = document.getElementById('av-bit-stats');
    if (statsEl) statsEl.textContent = 'N/A'; // Need diff for changes
}

const toGrid = (arr) => {
    const grid = [];
    for (let r = 0; r < 4; r++) {
        const row = [];
        for (let c = 0; c < 4; c++) row.push(arr[r + c * 4]); // Column-Major mapping (standard AES)
        grid.push(row);
    }
    return grid;
};
