document.addEventListener('DOMContentLoaded', () => {
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
    const encryptionKeyInput = document.getElementById('encryption-key');

    // Decryption elements
    const ciphertextInput = document.getElementById('ciphertext-input');
    const decryptBtn = document.getElementById('decrypt-btn');
    const decryptedOutput = document.getElementById('decrypted-output');

    // Tab Switching Logic with Anime.js animation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => {
                c.classList.remove('active');
                c.classList.add('hidden');
            });

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding content with Anime.js animation
            const tabId = btn.dataset.tab;
            const targetTab = document.getElementById(`tab-${tabId}`);
            targetTab.classList.remove('hidden');

            if (typeof anime !== 'undefined') {
                anime({
                    targets: targetTab,
                    opacity: [0, 1],
                    translateX: [20, 0],
                    duration: 400,
                    easing: 'easeOutQuad',
                    complete: () => targetTab.classList.add('active')
                });
            } else {
                setTimeout(() => targetTab.classList.add('active'), 10);
            }
        });
    });

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

    // Encrypt Text
    encryptBtn.addEventListener('click', async () => {
        const text = textInput.value;
        if (!text) {
            alert('Please enter text to encrypt.');
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
            const originalText = encryptBtn.textContent;
            encryptBtn.textContent = 'Encrypting...';
            encryptBtn.disabled = true;

            const response = await fetch('/encrypt', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Encryption failed');
                encryptBtn.textContent = originalText;
                encryptBtn.disabled = false;
                return;
            }

            encryptedOutput.value = data.encrypted_text;
            // Auto-fill decryption input
            ciphertextInput.value = data.encrypted_text;

            // Display Process
            if (data.trace_data) {
                displayEncryptionProcess(data.trace_data);
            }

            encryptBtn.textContent = originalText;
            encryptBtn.disabled = false;

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to encrypt text.');
            encryptBtn.textContent = 'Encrypt Text';
            encryptBtn.disabled = false;
        }
    });

    // Decrypt Text
    decryptBtn.addEventListener('click', async () => {
        const ciphertext = ciphertextInput.value;
        if (!ciphertext) {
            alert('Please enter ciphertext to decrypt.');
            return;
        }

        const type = sboxSelect.value;
        const customSbox = document.getElementById('custom-sbox').value;
        const key = encryptionKeyInput.value;

        const formData = new FormData();
        formData.append('ciphertext_input', ciphertext);
        formData.append('type', type);
        formData.append('key', key);
        if (type === 'custom') {
            formData.append('custom_sbox', customSbox);
        }

        try {
            const originalText = decryptBtn.textContent;
            decryptBtn.textContent = 'Decrypting...';
            decryptBtn.disabled = true;

            const response = await fetch('/decrypt', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Decryption failed');
                decryptBtn.textContent = originalText;
                decryptBtn.disabled = false;
                return;
            }

            decryptedOutput.value = data.decrypted_text;

            decryptBtn.textContent = originalText;
            decryptBtn.disabled = false;

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to decrypt text.');
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
    // Removing the early closing of DOMContentLoaded here
    // }); 

    // --- Custom Dropdown Logic for K1-K128 ---
    const dropdown = document.getElementById('matrix-dropdown');
    const dropdownTrigger = document.getElementById('matrix-trigger');
    const dropdownMenu = document.getElementById('matrix-menu');
    const dropdownItems = document.getElementById('matrix-items');
    const dropdownSearch = document.getElementById('matrix-search');
    const selectedText = document.getElementById('matrix-selected-text');

    if (dropdown && dropdownTrigger && typeof AFFINE_MATRICES !== 'undefined') {
        console.log("✅ Dropdown elements found, initializing...");

        // Clear any existing items first (prevent duplication)
        dropdownItems.innerHTML = '';

        // Populate items
        AFFINE_MATRICES.forEach(item => {
            const div = document.createElement('div');
            div.className = 'dropdown-item';

            let badges = '';
            if (item.name === 'K44') badges = '<span class="item-badge best">BEST</span>';
            else if (['K4', 'K81', 'K111', 'K128'].includes(item.name)) badges = '<span class="item-badge paper">PAPER</span>';
            else if (item.val === 143) badges = '<span class="item-badge aes">AES</span>';

            div.innerHTML = `<span>${item.name} ${badges}</span><span class="item-val">Val: ${item.val}</span>`;

            div.onclick = function () {
                selectedText.textContent = `${item.name} (Val: ${item.val})`;
                selectedText.style.color = 'var(--primary-color)';
                dropdownMenu.classList.remove('active');

                presetButtons.forEach(b => b.classList.remove('active'));
                currentMatrix = JSON.parse(JSON.stringify(item.matrix));
                loadMatrixEditor(currentMatrix);
                matrixEditor.classList.remove('hidden');
            };

            dropdownItems.appendChild(div);
        });

        // Toggle on click
        dropdownTrigger.onclick = function (e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
            console.log("Dropdown toggled, active:", dropdownMenu.classList.contains('active'));
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
        console.error("❌ Dropdown initialization failed:", {
            dropdown: !!dropdown,
            trigger: !!dropdownTrigger,
            matrices: typeof AFFINE_MATRICES !== 'undefined'
        });
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
                    sample_inputs: [0, 15, 255]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'Construction failed');
                return;
            }

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
                <div class="step-header">Input: ${step.input} (0x${step.input.toString(16).toUpperCase().padStart(2, '0')} = 0b${step.input_binary})</div>
                <div class="step-body">
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
            stateGrid.className = 'grid-container-small';
            stateGrid.style.maxWidth = '200px';

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
                keyGrid.className = 'grid-container-small';
                keyGrid.style.maxWidth = '200px';

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
                        sbox: constructedSbox
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
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.setAttribute('download', 'sbox_constructed.xlsx');
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
    const excelUpload = document.getElementById('excel-upload');
    const uploadStatus = document.getElementById('upload-status');
    const customSboxTextarea = document.getElementById('custom-sbox');

    if (excelUpload) {
        excelUpload.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Show loading status
            uploadStatus.classList.remove('hidden');
            uploadStatus.style.background = 'rgba(59, 130, 246, 0.1)';
            uploadStatus.style.border = '1px solid rgba(59, 130, 246, 0.3)';
            uploadStatus.style.color = 'var(--primary-color)';
            uploadStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading and parsing Excel file...';

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/upload_sbox_excel', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    // Show error
                    uploadStatus.style.background = 'rgba(239, 68, 68, 0.1)';
                    uploadStatus.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                    uploadStatus.style.color = '#ef4444';
                    uploadStatus.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${data.error || 'Upload failed'}`;
                    return;
                }

                // Success - populate custom S-Box textarea
                const sboxString = data.sbox.join(' ');
                customSboxTextarea.value = sboxString;

                // Show success message
                uploadStatus.style.background = 'rgba(16, 185, 129, 0.1)';
                uploadStatus.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                uploadStatus.style.color = '#10b981';
                uploadStatus.innerHTML = `<i class="fas fa-check-circle"></i> ${data.message} (256 values loaded)`;

                // Switch to custom mode to use the uploaded S-Box
                sboxSelect.value = 'custom';
                customInputContainer.classList.remove('hidden');
                uploadInputContainer.classList.add('hidden');

                // Auto-hide success message after 3 seconds
                setTimeout(() => {
                    uploadStatus.classList.add('hidden');
                }, 3000);

            } catch (error) {
                console.error('Error:', error);
                uploadStatus.style.background = 'rgba(239, 68, 68, 0.1)';
                uploadStatus.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                uploadStatus.style.color = '#ef4444';
                uploadStatus.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed to upload file. Please try again.';
            }
        });
    }


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
        const type = sboxSelect.value;
        const customSbox = document.getElementById('custom-sbox').value;
        const text = textInput.value || 'Wait is this real?';
        const key = encryptionKeyInput.value;

        const formData = new FormData();
        formData.append('type', type);
        formData.append('custom_sbox', customSbox);
        formData.append('text_input', text);
        formData.append('key', key);
        formData.append('flipped_bit_idx', flippedIdx);

        try {
            const response = await fetch('/avalanche_check', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            if (!response.ok) return;

            // Update Stats
            const countEl = document.getElementById('avalanche-count');
            const percentEl = document.getElementById('avalanche-percent');
            if (countEl) countEl.textContent = data.changed_count;
            if (percentEl) percentEl.textContent = data.percent.toFixed(2) + '%';

            // Update Output Grid
            const outBits = avalancheOutputGrid.children;

            // Reset all
            for (let i = 0; i < 128; i++) {
                outBits[i].classList.remove('changed');
            }

            data.diff_bits.forEach(bitIdx => {
                if (bitIdx < 128) {
                    outBits[bitIdx].classList.add('changed');
                }
            });

            // Animate
            if (typeof anime !== 'undefined') {
                anime({
                    targets: '.interactive-bit.changed',
                    scale: [1.5, 1],
                    backgroundColor: ['#ef4444', '#ef4444'], // Red flash
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            }

        } catch (e) {
            console.error(e);
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
            const key = encryptionKeyInput.value;

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
                document.getElementById('img-preview-orig').src = data.original_image;
                document.getElementById('img-preview-enc').src = data.encrypted_image;

                // Render Histograms
                renderHistogram('hist-orig', data.hist_original, 'Original Histogram');
                renderHistogram('hist-enc', data.hist_encrypted, 'Encrypted Histogram');

                encryptImageBtn.innerHTML = originalText;
                encryptImageBtn.disabled = false;

            } catch (error) {
                console.error(error);
                alert('Error during image encryption');
                encryptImageBtn.innerHTML = '<i class="fas fa-lock"></i> Encrypt Image (AES-ECB)';
                encryptImageBtn.disabled = false;
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
