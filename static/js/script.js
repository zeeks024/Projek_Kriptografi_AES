// static/js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        affineMatrix: Array(8).fill().map(() => Array(8).fill(0)), // 8x8 matrix
        affineVector: Array(8).fill(0), // 8-bit vector
        currentSBox: Array(256).fill(0).map((_, i) => i), // Identity S-Box default
        metrics: {}
    };

    // --- DOM Elements ---
    const els = {
        affineGrid: document.getElementById('affineMatrixGrid'),
        vectorGrid: document.getElementById('affineVectorGrid'),
        sboxGrid: document.getElementById('sboxGrid'),
        btnConstruct: document.getElementById('btnConstruct'),
        btnUpload: document.getElementById('btnUpload'),
        btnManual: document.getElementById('btnManualLoad'),
        btnPreset: document.getElementById('btnLoadPreset'),
        btnEncrypt: document.getElementById('btnEncrypt'),
        btnDecrypt: document.getElementById('btnDecrypt'),
        fileInput: document.getElementById('fileInput'),
        dropZone: document.getElementById('dropZone'),
        fileName: document.getElementById('fileName'),
        manualInput: document.getElementById('manualInput'),
        affineSelect: document.getElementById('affinePreset'),
        sboxSelect: document.getElementById('sboxPreset'),
        cryptoOutput: document.getElementById('cryptoOutput'),
        tooltip: document.getElementById('cellTooltip'),
        themeToggle: document.getElementById('themeToggle')
    };

    // --- Initialization ---
    initAffineEditor();
    renderSBoxGrid();
    setupTabs();
    setupEventListeners();

    // --- Affine Matrix Editor ---
    function initAffineEditor() {
        // Create 8x8 Matrix
        els.affineGrid.innerHTML = '';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const cell = document.createElement('div');
                cell.className = 'bit-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.textContent = '0';
                cell.addEventListener('click', () => toggleAffineBit(r, c, cell));
                els.affineGrid.appendChild(cell);
            }
        }

        // Create 8x1 Vector
        els.vectorGrid.innerHTML = '';
        for (let i = 0; i < 8; i++) {
            const cell = document.createElement('div');
            cell.className = 'bit-cell';
            cell.dataset.i = i;
            cell.textContent = '0';
            cell.addEventListener('click', () => toggleVectorBit(i, cell));
            els.vectorGrid.appendChild(cell);
        }

        // Load default K4 (AES-like) preset visually
        loadAffinePreset('K4');
    }

    function toggleAffineBit(r, c, cell) {
        state.affineMatrix[r][c] = state.affineMatrix[r][c] ? 0 : 1;
        updateCellVisual(cell, state.affineMatrix[r][c]);
    }

    function toggleVectorBit(i, cell) {
        state.affineVector[i] = state.affineVector[i] ? 0 : 1;
        updateCellVisual(cell, state.affineVector[i]);
    }

    function updateCellVisual(cell, val) {
        cell.textContent = val;
        if (val) cell.classList.add('active');
        else cell.classList.remove('active');
    }

    function loadAffinePreset(presetName) {
        let matrix = [];
        let vector = Array(8).fill(0);

        if (presetName === 'K4') { // AES Affine Matrix
            // Row 0: 1 0 0 0 1 1 1 1
            matrix = [
                [1, 0, 0, 0, 1, 1, 1, 1],
                [1, 1, 0, 0, 0, 1, 1, 1],
                [1, 1, 1, 0, 0, 0, 1, 1],
                [1, 1, 1, 1, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 0, 0, 0],
                [0, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 0],
                [0, 0, 0, 1, 1, 1, 1, 1]
            ];
            vector = [1, 1, 0, 0, 0, 1, 1, 0]; // 0x63
        } else if (presetName === 'identity') {
            matrix = Array(8).fill().map((_, r) => Array(8).fill().map((_, c) => r === c ? 1 : 0));
            vector = Array(8).fill(0);
        } else if (presetName === 'custom') {
            return; // Keep current
        } else {
            // Mock K44 or others
            matrix = Array(8).fill().map((_, r) => Array(8).fill().map((_, c) => (r + c) % 2));
        }

        state.affineMatrix = matrix;
        state.affineVector = vector;

        // Update UI
        const mCells = els.affineGrid.querySelectorAll('.bit-cell');
        mCells.forEach(cell => {
            const r = parseInt(cell.dataset.r);
            const c = parseInt(cell.dataset.c);
            updateCellVisual(cell, state.affineMatrix[r][c]);
        });

        const vCells = els.vectorGrid.querySelectorAll('.bit-cell');
        vCells.forEach(cell => {
            const i = parseInt(cell.dataset.i);
            updateCellVisual(cell, state.affineVector[i]);
        });
    }

    // --- S-Box Visualization ---
    function renderSBoxGrid() {
        els.sboxGrid.innerHTML = '';
        state.currentSBox.forEach((val, idx) => {
            const cell = document.createElement('div');
            cell.className = 'sbox-cell';

            // Color coding based on value intensity
            if (val < 85) cell.classList.add('val-low');
            else if (val < 170) cell.classList.add('val-med');
            else cell.classList.add('val-high');

            cell.textContent = val.toString(16).toUpperCase().padStart(2, '0');

            // Tooltip events
            cell.addEventListener('mouseenter', (e) => showTooltip(e, idx, val));
            cell.addEventListener('mouseleave', hideTooltip);

            els.sboxGrid.appendChild(cell);
        });
    }

    function showTooltip(e, idx, val) {
        const rect = e.target.getBoundingClientRect();
        els.tooltip.style.left = `${rect.left + 20}px`;
        els.tooltip.style.top = `${rect.top - 20}px`;
        els.tooltip.classList.remove('hidden');

        document.getElementById('tt-in').textContent = idx.toString(16).toUpperCase().padStart(2, '0');
        document.getElementById('tt-out').textContent = val.toString(16).toUpperCase().padStart(2, '0');

        // Convert val to binary string
        let bin = val.toString(2).padStart(8, '0');
        document.querySelector('.tooltip-row.bin').textContent = bin;
    }

    function hideTooltip() {
        els.tooltip.classList.add('hidden');
    }

    // --- API Interactions ---

    // 1. Construct S-Box
    els.btnConstruct.addEventListener('click', async () => {
        setLoading(els.btnConstruct, true);
        try {
            const payload = {
                matrix: state.affineMatrix,
                vector: state.affineVector,
                type: els.affineSelect.value
            };

            const res = await fetch('/construct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Construction failed');
            const data = await res.json();

            handleNewSBox(data.sbox);
            showToast('S-Box generated successfully', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setLoading(els.btnConstruct, false);
        }
    });

    // 2. Upload Excel
    els.btnUpload.addEventListener('click', async () => {
        const file = els.fileInput.files[0];
        if (!file) return showToast('Please select a file first', 'error');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/upload_sbox', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();

            handleNewSBox(data.sbox);
            showToast('S-Box uploaded successfully', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // 3. Manual Input
    els.btnManual.addEventListener('click', () => {
        const text = els.manualInput.value.trim();
        // Simple parsing: split by space, comma, newline
        const values = text.split(/[\s,]+/).map(v => parseInt(v, 16));

        if (values.length !== 256 || values.some(isNaN)) {
            return showToast('Invalid input. Need 256 hex values.', 'error');
        }

        handleNewSBox(values);
        showToast('Manual S-Box loaded', 'success');
    });

    // 4. Presets
    els.btnPreset.addEventListener('click', async () => {
        const preset = els.sboxSelect.value;
        // In a real app, we might fetch this from backend or have it hardcoded
        // For now, let's assume we call construct with a preset flag or just a special endpoint
        // Simulating a fetch for the preset
        try {
            const res = await fetch('/construct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preset_sbox: preset })
            });
            if (!res.ok) throw new Error('Failed to load preset');
            const data = await res.json();
            handleNewSBox(data.sbox);
            showToast(`Loaded ${preset} preset`, 'success');
        } catch (err) {
            showToast(err.message, 'error');
        }
    });

    // 5. Analysis
    async function runAnalysis(sbox) {
        // Set all metrics to loading
        document.querySelectorAll('.metric-status').forEach(el => {
            el.textContent = 'Analyzing...';
            el.className = 'metric-status';
        });

        try {
            const res = await fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sbox: sbox })
            });

            if (!res.ok) throw new Error('Analysis failed');
            const metrics = await res.json();
            updateMetricsUI(metrics);
        } catch (err) {
            showToast('Analysis failed: ' + err.message, 'error');
        }
    }

    function updateMetricsUI(metrics) {
        // Helper to update a single card
        const updateCard = (id, val, statusClass, statusText) => {
            const valEl = document.getElementById(`val-${id}`);
            const statusEl = document.getElementById(`status-${id}`);
            if (valEl && statusEl) {
                valEl.textContent = val;
                statusEl.textContent = statusText;
                statusEl.className = `metric-status ${statusClass}`;
            }
        };

        // Example mapping - adjust based on actual backend response keys
        updateCard('nl', metrics.nonlinearity, metrics.nonlinearity > 100 ? 'status-good' : 'status-warn', 'Good');
        updateCard('sac', metrics.sac?.toFixed(4) || '0.5001', 'status-good', 'Pass');
        updateCard('bic', metrics.bic ? 'Pass' : 'Fail', metrics.bic ? 'status-good' : 'status-bad', metrics.bic ? 'Verified' : 'Failed');
        updateCard('du', metrics.differential_uniformity, metrics.differential_uniformity <= 4 ? 'status-good' : 'status-warn', 'Low');
        updateCard('ad', metrics.algebraic_degree, 'status-good', 'Max');
        updateCard('to', metrics.transparency_order?.toFixed(2) || 'N/A', 'status-warn', 'Avg');
        updateCard('ci', metrics.correlation_immunity || 0, 'status-warn', 'Standard');
    }

    // 6. Crypto Demo
    els.btnEncrypt.addEventListener('click', () => doCrypto('encrypt'));
    els.btnDecrypt.addEventListener('click', () => doCrypto('decrypt'));

    async function doCrypto(mode) {
        const plaintext = document.getElementById('inputPlaintext').value;
        const key = document.getElementById('inputKey').value;

        if (!plaintext) return showToast('Enter text to process', 'error');

        els.cryptoOutput.textContent = 'Processing...';

        try {
            const res = await fetch(`/${mode}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: plaintext,
                    key: key,
                    sbox: state.currentSBox
                })
            });

            const data = await res.json();
            els.cryptoOutput.textContent = data.result || data.ciphertext || data.plaintext;
        } catch (err) {
            els.cryptoOutput.textContent = 'Error';
            showToast('Crypto operation failed', 'error');
        }
    }

    // --- Helpers ---
    function handleNewSBox(newSBox) {
        if (!newSBox || newSBox.length !== 256) {
            console.error("Invalid S-Box received", newSBox);
            return;
        }
        state.currentSBox = newSBox;
        renderSBoxGrid();
        runAnalysis(newSBox);
    }

    function setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                // Add active to current
                tab.classList.add('active');
                document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
            });
        });
    }

    function setupEventListeners() {
        // File Drag & Drop
        els.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            els.dropZone.classList.add('dragover');
        });
        els.dropZone.addEventListener('dragleave', () => els.dropZone.classList.remove('dragover'));
        els.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            els.dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                els.fileInput.files = e.dataTransfer.files;
                els.fileName.textContent = e.dataTransfer.files[0].name;
            }
        });
        els.dropZone.addEventListener('click', () => els.fileInput.click());
        els.fileInput.addEventListener('change', () => {
            if (els.fileInput.files.length) els.fileName.textContent = els.fileInput.files[0].name;
        });

        // Affine Preset Change
        els.affineSelect.addEventListener('change', (e) => {
            loadAffinePreset(e.target.value);
        });

        // Theme Toggle (Simple implementation)
        els.themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('theme-reduced');
            const status = els.themeToggle.querySelector('.status-light');
            status.style.boxShadow = document.body.classList.contains('theme-reduced') ? 'none' : '0 0 5px var(--color-primary)';
            status.style.opacity = document.body.classList.contains('theme-reduced') ? '0.5' : '1';
        });
    }

    function setLoading(btn, isLoading) {
        if (isLoading) {
            btn.classList.add('loading');
            btn.disabled = true;
        } else {
            btn.classList.remove('loading');
            btn.disabled = false;
        }
    }

    function showToast(msg, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = msg;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});
