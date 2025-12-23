// S-Box Comparison Tool Logic
// Fully Dynamic Version

let comparisonSBoxes = []; // Array to store current S-Box configurations
let nextSBoxId = 0; // Unique ID counter

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add initial 2 S-Box slots
    addSBoxSlot();
    addSBoxSlot();

    const addBtn = document.getElementById('add-sbox-btn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            addSBoxSlot();
        });
    }

    const runBtn = document.getElementById('run-comparison-btn');
    if (runBtn) {
        runBtn.addEventListener('click', runDynamicComparison);
    }
});

function addSBoxSlot() {
    const container = document.getElementById('comparison-dynamic-container');
    if (!container) return;

    const id = nextSBoxId++;
    const slot = document.createElement('div');
    slot.className = 'comparison-slot glass-panel'; // Reusing glass-panel style
    slot.style.flex = '1 1 250px';
    slot.style.padding = '1rem';
    slot.style.border = '1px solid rgba(255,255,255,0.1)';
    slot.style.borderRadius = '0.5rem';
    slot.dataset.id = id;

    slot.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <label><strong>S-Box ${id + 1}</strong></label>
            ${id > 1 ? `<button class="btn-icon remove-slot-btn" style="color: #ef4444; background: none; border: none; cursor: pointer; padding: 0.5rem; width: auto; box-shadow: none; min-width: auto;" title="Remove"><i class="fas fa-trash"></i></button>` : ''}
        </div>
        <select class="comparison-select form-select" style="width: 100%; padding: 0.5rem; margin-bottom: 0.5rem;" data-id="${id}">
            <option value="">Select S-Box...</option>
            <option value="aes">AES (Rijndael)</option>
            ${typeof AFFINE_MATRICES !== 'undefined' ? AFFINE_MATRICES.map(m => `<option value="${m.name}">${m.name}</option>`).join('') : ''}
            <option value="upload">📤 Upload from Excel</option>
        </select>
        
        <!-- File Input (Hidden by default) -->
        <div class="upload-area hidden" style="margin-top: 0.5rem;">
            <input type="file" class="sbox-file-input" accept=".xlsx,.xls" style="width: 100%; font-size: 0.8rem;">
            <div class="upload-status" style="font-size: 0.75rem; margin-top: 5px; color: var(--text-muted);"></div>
        </div>

        <div class="sbox-status" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
            <span class="status-indicator" style="display: inline-block; width: 8px; height: 8px; background: #666; border-radius: 50%; margin-right: 5px;"></span>
            Not Loaded
        </div>
    `;

    container.appendChild(slot);

    // Event Listeners for this slot
    const select = slot.querySelector('.comparison-select');
    const uploadArea = slot.querySelector('.upload-area');
    const fileInput = slot.querySelector('.sbox-file-input');
    const removeBtn = slot.querySelector('.remove-slot-btn');

    // Add to state
    comparisonSBoxes.push({
        id: id,
        type: null,
        value: null,
        metrics: null,
        element: slot,
        loaded: false,
        name: `S-Box ${id + 1}` // Default name
    });

    select.addEventListener('change', async (e) => {
        const val = e.target.value;
        const config = comparisonSBoxes.find(c => c.id === id);
        if (!config) return;

        config.type = val;
        config.value = val;
        config.loaded = false;
        updateSlotStatus(id, 'loading', 'Loading...');

        if (val === 'upload') {
            uploadArea.classList.remove('hidden');
            updateSlotStatus(id, 'pending', 'Please upload file');
            config.name = 'Uploaded File';
        } else {
            uploadArea.classList.add('hidden');
            if (val === '') {
                updateSlotStatus(id, 'empty', 'Not Loaded');
                config.name = `S-Box ${id + 1}`;
            } else {
                // Preset (AES, K4, etc)
                config.name = val;
                // FETCH METRICS FROM BACKEND
                await fetchPresetMetrics(id, val);
            }
        }
    });

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await uploadAndAnalyzeSBox(id, file);
        }
    });

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            container.removeChild(slot);
            comparisonSBoxes = comparisonSBoxes.filter(c => c.id !== id);
        });
    }
}

function updateSlotStatus(id, type, msg) {
    const config = comparisonSBoxes.find(c => c.id === id);
    if (!config) return;

    const indicator = config.element.querySelector('.status-indicator');
    const statusText = config.element.querySelector('.sbox-status');

    // safe check
    if (!statusText || !indicator) return;

    statusText.innerHTML = '';
    statusText.appendChild(indicator);
    statusText.append(` ${msg}`);

    if (type === 'loading') indicator.style.background = '#fbbf24'; // Yellow
    else if (type === 'success') indicator.style.background = '#10b981'; // Green
    else if (type === 'error') indicator.style.background = '#ef4444'; // Red
    else indicator.style.background = '#666'; // Gray
}

async function fetchPresetMetrics(id, presetName) {
    const config = comparisonSBoxes.find(c => c.id === id);
    if (!config) return;

    try {
        let sboxToAnalyze = null;

        if (typeof AFFINE_MATRICES !== 'undefined') {
            // Map 'aes' to 'K72' (Standard AES Matrix)
            const lookupName = presetName === 'aes' ? 'K72' : presetName;

            // Find matrix definition
            const matrixDef = AFFINE_MATRICES.find(m => m.name === lookupName);

            if (matrixDef) {
                // Determine constant: AES uses 0x63 (Backend default), others assume 0 (Linear)
                const isAES = presetName === 'aes' || presetName === 'K72'; // K72 is standard AES
                const constant = isAES ? null : Array(8).fill(0); // null triggers default C_AES in backend

                // Log payload for debugging
                console.log(`[COMPARISON] sending matrix for ${presetName} (using ${lookupName}):`, matrixDef.matrix);
                console.log(`[COMPARISON] sending constant:`, constant);

                // Call /construct endpoint to get S-Box
                const response = await fetch('/construct', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        affine_matrix: matrixDef.matrix, // Fix: Backend expects 'affine_matrix'
                        c_constant: constant,
                        polynomial: '0x11B' // Default for standard presets
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    // Prefer raw values to avoid parsing ambiguity
                    sboxToAnalyze = data.sbox_values || data.sbox;
                }
            }
        }

        if (sboxToAnalyze) {
            // Now Analyze It to get metrics
            const analysisResp = await fetch('/analyze_sbox', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sbox: sboxToAnalyze })
            });

            if (analysisResp.ok) {
                const metrics = await analysisResp.json();
                config.metrics = normalizeMetrics(metrics);
                config.loaded = true;
                updateSlotStatus(id, 'success', 'Loaded (' + presetName + ')');
            } else {
                updateSlotStatus(id, 'error', 'Analysis Failed');
            }
        } else {
            updateSlotStatus(id, 'error', 'S-Box Not Found');
        }

    } catch (e) {
        console.error(e);
        updateSlotStatus(id, 'error', 'Network Error');
    }
}

async function uploadAndAnalyzeSBox(id, file) {
    const config = comparisonSBoxes.find(c => c.id === id);
    updateSlotStatus(id, 'loading', 'Uploading...');

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload_sbox_excel', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            // Expecting data.sbox
            if (data.sbox) {
                config.name = file.name;
                updateSlotStatus(id, 'loading', 'Analyzing...');

                // Analyze
                const analysisResp = await fetch('/analyze_sbox', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sbox: data.sbox })
                });

                if (analysisResp.ok) {
                    const metrics = await analysisResp.json();
                    config.metrics = normalizeMetrics(metrics);
                    config.loaded = true;
                    updateSlotStatus(id, 'success', `Loaded (${file.name})`);
                } else {
                    updateSlotStatus(id, 'error', 'Analysis Failed');
                }
            }
        } else {
            const err = await response.json();
            updateSlotStatus(id, 'error', err.error || 'Upload Failed');
        }
    } catch (e) {
        updateSlotStatus(id, 'error', 'Error');
    }
}

function normalizeMetrics(backendData) {
    // Map backend response keys to standard keys logic expect
    return {
        nl: backendData.nonlinearity || backendData.nl || 0,
        sac: backendData.sac || 0,
        'bic-nl': backendData.bic_nl || 0,
        'bic-sac': backendData.bic_sac || 0,
        lap: backendData.lap || 0,
        dap: backendData.dap || 0,
        du: backendData.differential_uniformity || backendData.du || 0
    };
}

function runDynamicComparison() {
    // Filter only loaded boxes
    const activeBoxes = comparisonSBoxes.filter(c => c.loaded && c.metrics);

    if (activeBoxes.length < 2) {
        alert("Please load at least 2 S-Boxes to compare.");
        return;
    }

    const resultsDiv = document.getElementById('comparison-results');
    const tbody = document.getElementById('comparison-tbody');
    const headerAnchor = document.getElementById('comparison-headers-anchor');
    const summaryDiv = document.getElementById('comparison-summary');

    // Rebuild Headers
    // Clear existing dynamic headers (siblings of anchor)
    // Actually, easier to clear entire thead row and rebuild?
    // Let's iterate the row cells
    const theadRow = document.querySelector('.comparison-table thead tr');
    // Keep first and last cell
    while (theadRow.children.length > 2) {
        theadRow.removeChild(theadRow.children[1]);
    }

    // Insert new headers before the last cell (Winner)
    activeBoxes.forEach(box => {
        const th = document.createElement('th');
        th.style.padding = '1rem';
        th.style.textAlign = 'center';
        th.textContent = box.name;
        theadRow.insertBefore(th, theadRow.lastElementChild);
    });

    // Build Rows
    tbody.innerHTML = '';

    // Initialize win counts
    activeBoxes.forEach(b => b.wins = 0);

    const metricDefinitions = [
        { key: 'nl', label: 'Nonlinearity (NL)', higher: true },
        { key: 'sac', label: 'SAC', ideal: 0.5 },
        { key: 'bic-nl', label: 'BIC-NL', higher: true },
        { key: 'bic-sac', label: 'BIC-SAC', ideal: 0.5 },
        { key: 'lap', label: 'LAP', higher: false },
        { key: 'dap', label: 'DAP', higher: false },
        { key: 'du', label: 'Diff. Uniformity', higher: false }
    ];

    metricDefinitions.forEach(metric => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255,255,255,0.1)';

        // Label Cell
        const labelTd = document.createElement('td');
        labelTd.style.padding = '1rem';
        labelTd.style.fontWeight = '600';
        labelTd.textContent = metric.label;
        row.appendChild(labelTd);

        // Calculate values and winner for this row
        let bestValue = null;
        let winners = [];

        activeBoxes.forEach(box => {
            const val = box.metrics[metric.key];

            // Determine if this is the "best" so far
            if (bestValue === null) {
                bestValue = val;
                winners = [box];
            } else {
                if (metric.higher) {
                    if (val > bestValue) {
                        bestValue = val;
                        winners = [box];
                    } else if (val === bestValue) {
                        winners.push(box);
                    }
                } else if (metric.ideal !== undefined) {
                    const diff = Math.abs(val - metric.ideal);
                    const bestDiff = Math.abs(bestValue - metric.ideal);
                    if (diff < bestDiff) {
                        bestValue = val;
                        winners = [box];
                    } else if (Math.abs(diff - bestDiff) < 0.0001) {
                        winners.push(box);
                    }
                } else { // Lower is better
                    if (val < bestValue) {
                        bestValue = val;
                        winners = [box];
                    } else if (val === bestValue) {
                        winners.push(box);
                    }
                }
            }
        });

        // Add win counts
        winners.forEach(w => w.wins++);

        // Render Data Cells
        activeBoxes.forEach(box => {
            const val = box.metrics[metric.key];
            const isWinner = winners.includes(box);

            const td = document.createElement('td');
            td.style.padding = '1rem';
            td.style.textAlign = 'center';
            if (isWinner) {
                td.style.color = '#00FF88';
                td.style.fontWeight = '700';
            }
            td.textContent = formatValue(val);
            row.appendChild(td);
        });

        // Winner Cell
        const winnerTd = document.createElement('td');
        winnerTd.style.padding = '1rem';
        winnerTd.style.textAlign = 'center';
        if (winners.length === activeBoxes.length) {
            winnerTd.textContent = "Tie";
        } else {
            winnerTd.style.color = 'var(--primary-color)';
            winnerTd.style.fontWeight = '700';
            winnerTd.textContent = winners.map(w => w.name).join(', ');
        }
        row.appendChild(winnerTd);

        tbody.appendChild(row);
    });

    // Summary
    // Find overall winner
    let maxWins = -1;
    let grandWinners = [];
    activeBoxes.forEach(box => {
        if (box.wins > maxWins) {
            maxWins = box.wins;
            grandWinners = [box];
        } else if (box.wins === maxWins) {
            grandWinners.push(box);
        }
    });

    // Build Summary HTML
    let summaryHTML = `<h3 style="margin-bottom: 1rem; color: var(--primary-color);"><i class="fas fa-trophy"></i> Comparison Summary</h3>`;
    summaryHTML += `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; margin-bottom: 1rem;">`;

    activeBoxes.forEach(box => {
        const isGrandWinner = grandWinners.includes(box);
        summaryHTML += `
            <div style="text-align: center;">
                <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem;">${box.name}</div>
                <div style="font-size: 2.5rem; font-weight: 700; color: ${isGrandWinner ? '#00FF88' : 'var(--text-color)'};">${box.wins}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">wins</div>
            </div>
        `;
    });
    summaryHTML += `</div>`;

    if (grandWinners.length === activeBoxes.length) {
        summaryHTML += `<div style="padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2);"><strong>Result:</strong> All S-Boxes perform equally well.</div>`;
    } else {
        const names = grandWinners.map(w => w.name).join(', ');
        summaryHTML += `<div style="padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2);"><strong>Winner:</strong> <span style="color: #00FF88; font-weight: 700;">${names}</span> performs best.</div>`;
    }

    summaryDiv.innerHTML = summaryHTML;
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function getCurrentSBoxMetrics() {
    const lastMetrics = window.lastAnalysisMetrics;
    if (!lastMetrics) return null;
    return normalizeMetrics(lastMetrics);
}

function formatValue(val) {
    if (typeof val === 'number') {
        return val % 1 === 0 ? val.toString() : val.toFixed(4);
    }
    return val;
}
