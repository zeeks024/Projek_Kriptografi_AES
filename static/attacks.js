// Attack Simulation Logic
// Linear and Differential Cryptanalysis Demos

// Store the S-Box being analyzed
let attackSBox = null;

// Helper to fetch S-Box from backend
async function fetchPresetSBox(name) {
    if (typeof AFFINE_MATRICES === 'undefined') return null;

    // Map 'aes' to 'K72' (Standard AES Matrix)
    const lookupName = name === 'aes' ? 'K72' : name;
    const matrixDef = AFFINE_MATRICES.find(m => m.name === lookupName);

    if (!matrixDef) return null;

    // Determine constant: AES/K72 uses null (default), others 0
    const isAES = name === 'aes' || name === 'K72';
    const constant = isAES ? null : Array(8).fill(0);

    try {
        const response = await fetch('/construct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                affine_matrix: matrixDef.matrix,
                c_constant: constant,
                polynomial: '0x11B'
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Prefer raw values
            return data.sbox_values || data.sbox.map(h => parseInt(h, 16));
        }
    } catch (e) {
        console.error("Error fetching S-Box:", e);
    }
    return null;
}

function popcount(n) {
    let count = 0;
    while (n) {
        count += n & 1;
        n >>= 1;
    }
    return count;
}

function linearApproximation(sbox, inputMask, outputMask) {
    let count = 0;
    for (let x = 0; x < 256; x++) {
        const inputParity = popcount(x & inputMask) % 2;
        const outputParity = popcount(sbox[x] & outputMask) % 2;
        if (inputParity === outputParity) count++;
    }
    const bias = Math.abs(count - 128) / 256;
    return { count, bias };
}

function differentialAnalysis(sbox, inputDiff) {
    const diffTable = new Array(256).fill(0);

    for (let x = 0; x < 256; x++) {
        const xPrime = x ^ inputDiff;
        const outputDiff = sbox[x] ^ sbox[xPrime];
        diffTable[outputDiff]++;
    }

    let maxDiff = 0;
    let maxVal = 0;
    for (let i = 0; i < 256; i++) {
        if (diffTable[i] > maxVal) {
            maxVal = diffTable[i];
            maxDiff = i;
        }
    }

    return { distribution: diffTable, maxDiff, maxOccurrence: maxVal };
}

function getCurrentSBox() {
    return attackSBox;
}

// Load S-Box from preset or custom
async function loadAttackSBox(source, customData = null) {
    if (source === 'custom') {
        if (!customData) {
            return { success: false, message: 'No custom data provided' };
        }
        try {
            // Parse custom S-Box
            const values = customData.split(',').map(v => {
                const trimmed = v.trim();

                // Handle hex with 0x prefix
                if (trimmed.startsWith('0x') || trimmed.startsWith('0X')) {
                    return parseInt(trimmed, 16);
                }

                // Auto-detect hex (2 chars, all valid hex digits)
                if (/^[0-9A-Fa-f]{1,2}$/.test(trimmed)) {
                    return parseInt(trimmed, 16);
                }

                // Otherwise parse as decimal
                return parseInt(trimmed, 10);
            });

            if (values.length !== 256) {
                return { success: false, message: `Invalid S-Box: expected 256 values, got ${values.length}` };
            }

            if (values.some(v => isNaN(v) || v < 0 || v > 255)) {
                return { success: false, message: 'Invalid values: all must be 0-255' };
            }

            attackSBox = values;
            return { success: true, message: 'Custom S-Box loaded successfully' };
        } catch (e) {
            return { success: false, message: `Parse error: ${e.message}` };
        }
    } else {
        // Load from preset (DYNAMIC)
        const sbox = await fetchPresetSBox(source);
        if (sbox) {
            attackSBox = sbox;
            return { success: true, message: `${source.toUpperCase()} S-Box loaded successfully` };
        } else {
            return { success: false, message: `Failed to load preset ${source}.` };
        }
    }
}

// Linear Attack Handler
document.addEventListener('DOMContentLoaded', () => {
    // S-Box Selector Handlers
    const attackSBoxSelect = document.getElementById('attack-sbox-select');
    const loadAttackSBoxBtn = document.getElementById('load-attack-sbox-btn');
    const attackCustomUpload = document.getElementById('attack-custom-upload');
    const attackSBoxStatus = document.getElementById('attack-sbox-status');

    if (attackSBoxSelect) {
        // DYNAMIC POPULATION (Mirroring Comparison Tool Logic)
        if (typeof AFFINE_MATRICES !== 'undefined') {
            // Remove existing dynamic options to prevent duplicates if re-run
            // Keep "Select..." and "Custom"
            // Actually, we already cleared it in HTML, but good to be safe.
            // But HTML structure is: Select -> dynamic -> Custom

            // Note: Simplest way is to rebuild it partly or insert before custom
            // But "Custom" is at the end.

            // Find "Custom" option index
            let customOption = attackSBoxSelect.querySelector('option[value="custom"]');

            // Add AES first
            const aesOpt = document.createElement('option');
            aesOpt.value = 'aes';
            aesOpt.textContent = 'AES (Rijndael)';
            attackSBoxSelect.insertBefore(aesOpt, customOption);

            // Add others
            AFFINE_MATRICES.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.name;
                opt.textContent = m.name;
                attackSBoxSelect.insertBefore(opt, customOption);
            });
        }

        attackSBoxSelect.addEventListener('change', () => {
            if (attackSBoxSelect.value === 'custom') {
                attackCustomUpload.style.display = 'block';
            } else {
                attackCustomUpload.style.display = 'none';
            }
        });
    }

    if (loadAttackSBoxBtn) {
        loadAttackSBoxBtn.addEventListener('click', async () => {
            const selectedValue = attackSBoxSelect.value;
            if (!selectedValue) {
                attackSBoxStatus.innerHTML = '<span style="color: #F44336;">Please select an S-Box</span>';
                return;
            }

            let result;
            if (selectedValue === 'custom') {
                // Check if file is uploaded
                const fileInput = document.getElementById('attack-file-upload');
                const textInput = document.getElementById('attack-custom-sbox-input');

                if (fileInput.files.length > 0) {
                    // Read file
                    attackSBoxStatus.innerHTML = '<span style="color: var(--primary-color);">Reading file...</span>';
                    try {
                        const file = fileInput.files[0];
                        let customData;

                        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                            // Parse Excel file using SheetJS
                            const arrayBuffer = await file.arrayBuffer();
                            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                            const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                            // Skip header row (row 0) and index column (column 0)
                            // Constructor format: Row 1 = headers (0-F), Column A = indices (00-F0)
                            // Data is in B2:Q17 (rows 1-16, columns 1-16)
                            const flatValues = [];
                            for (let i = 1; i < data.length && i <= 16; i++) {
                                for (let j = 1; j < data[i].length && j <= 16; j++) {
                                    const val = data[i][j];
                                    if (val !== null && val !== undefined && val !== '') {
                                        flatValues.push(val);
                                    }
                                }
                            }
                            customData = flatValues.join(',');
                        } else {
                            // CSV/TXT: read as text
                            const fileText = await file.text();
                            customData = fileText.replace(/\s+/g, ',').replace(/,,+/g, ',');
                        }

                        result = loadAttackSBox('custom', customData);
                    } catch (e) {
                        attackSBoxStatus.innerHTML = `<span style="color: #F44336;">✗ File read error: ${e.message}</span>`;
                        return;
                    }
                } else if (textInput.value.trim()) {
                    // Use pasted text
                    result = loadAttackSBox('custom', textInput.value);
                } else {
                    attackSBoxStatus.innerHTML = '<span style="color: #F44336;">Please upload a file or paste S-Box values</span>';
                    return;
                }
            } else {
                result = await loadAttackSBox(selectedValue);
            }

            if (result && result.success) {
                attackSBoxStatus.innerHTML = `<span style="color: #00FF88;">✓ ${result.message}</span>`;
            } else {
                const msg = result ? result.message : 'Unknown error';
                attackSBoxStatus.innerHTML = `<span style="color: #F44336;">✗ ${msg}</span>`;
            }
        });
    }

    const runLinearBtn = document.getElementById('run-linear-btn');
    if (runLinearBtn) {
        runLinearBtn.addEventListener('click', () => {
            const sbox = getCurrentSBox();
            if (!sbox) {
                alert('Please load an S-Box first (go to Constructor or Analysis tab)');
                return;
            }

            const inputMask = parseInt(document.getElementById('linear-input-mask').value);
            const outputMask = parseInt(document.getElementById('linear-output-mask').value);

            const result = linearApproximation(sbox, inputMask, outputMask);

            document.getElementById('linear-count').textContent = result.count;
            document.getElementById('linear-bias').textContent = result.bias.toFixed(4);

            // Security assessment
            let security, color;
            if (result.bias < 0.05) {
                security = '✅ STRONG';
                color = '#00FF88';
            } else if (result.bias < 0.1) {
                security = '⚠️ MODERATE';
                color = '#FFC107';
            } else {
                security = '❌ WEAK';
                color = '#F44336';
            }
            document.getElementById('linear-security').innerHTML = security;
            document.getElementById('linear-security').style.color = color;

            // Explanation
            const explanation = `
                <h4 style="margin-bottom: 0.75rem; color: var(--primary-color);">Analysis Results:</h4>
                <p style="margin-bottom: 0.5rem;">
                    <strong>Input Mask:</strong> ${inputMask.toString(16).toUpperCase().padStart(2, '0')} | 
                    <strong>Output Mask:</strong> ${outputMask.toString(16).toUpperCase().padStart(2, '0')}
                </p>
                <p style="margin-bottom: 0.5rem;">
                    Out of 256 input values, <strong>${result.count}</strong> showed correlation between input and output bits.
                </p>
                <p style="margin-bottom: 0.5rem;">
                    <strong>Bias: ${result.bias.toFixed(4)}</strong> - This measures deviation from ideal (0.0). 
                    ${result.bias < 0.05 ? 'Excellent resistance to linear attacks!' :
                    result.bias < 0.1 ? 'Acceptable, but could be better.' :
                        'High bias indicates weakness to linear cryptanalysis.'}
                </p>
                <p style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem; color: var(--text-muted);">
                    💡 <em>In linear cryptanalysis, attackers try to find linear approximations to reduce the complexity of breaking the cipher. 
                    Lower bias means the S-Box is more resistant to this attack.</em>
                </p>
            `;
            document.getElementById('linear-explanation').innerHTML = explanation;
            document.getElementById('linear-results').style.display = 'block';
            document.getElementById('linear-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    // Differential Attack Handler
    const runDiffBtn = document.getElementById('run-differential-btn');
    if (runDiffBtn) {
        runDiffBtn.addEventListener('click', () => {
            const sbox = getCurrentSBox();
            if (!sbox) {
                alert('Please load an S-Box first (go to Constructor or Analysis tab)');
                return;
            }

            const inputDiff = parseInt(document.getElementById('differential-input-diff').value);
            const result = differentialAnalysis(sbox, inputDiff);

            document.getElementById('diff-max-count').textContent = result.maxOccurrence;
            const probability = (result.maxOccurrence / 256).toFixed(4);
            document.getElementById('diff-probability').textContent = probability;

            // Security assessment  
            let security, color;
            if (result.maxOccurrence <= 4) {
                security = '✅ STRONG';
                color = '#00FF88';
            } else if (result.maxOccurrence <= 8) {
                security = '⚠️ MODERATE';
                color = '#FFC107';
            } else {
                security = '❌ WEAK';
                color = '#F44336';
            }
            document.getElementById('diff-security').innerHTML = security;
            document.getElementById('diff-security').style.color = color;

            // Top differences distribution
            const sortedDiffs = result.distribution
                .map((count, diff) => ({ diff, count }))
                .filter(item => item.count > 0)
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            let distributionHTML = '';
            sortedDiffs.forEach((item, index) => {
                const percentage = (item.count / 256 * 100).toFixed(1);
                const barWidth = (item.count / result.maxOccurrence * 100);
                distributionHTML += `
                    <div style="margin-bottom: 0.75rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                            <span style="font-size: 0.85rem;">Diff 0x${item.diff.toString(16).toUpperCase().padStart(2, '0')}</span>
                            <span style="font-size: 0.85rem; color: var(--text-muted);">${item.count} (${percentage}%)</span>
                        </div>
                        <div style="background: rgba(0,0,0,0.3); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: ${index === 0 ? '#F44336' : 'var(--primary-color)'}; height: 100%; width: ${barWidth}%; transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                `;
            });
            document.getElementById('diff-distribution').innerHTML = distributionHTML;

            // Explanation
            const explanation = `
                <h4 style="margin-bottom: 0.75rem; color: var(--primary-color);">Analysis Results:</h4>
                <p style="margin-bottom: 0.5rem;">
                    <strong>Input Difference:</strong> 0x${inputDiff.toString(16).toUpperCase().padStart(2, '0')}
                </p>
                <p style="margin-bottom: 0.5rem;">
                    The maximum output difference (0x${result.maxDiff.toString(16).toUpperCase().padStart(2, '0')}) occurred <strong>${result.maxOccurrence}</strong> times out of 256 possible pairs.
                </p>
                <p style="margin-bottom: 0.5rem;">
                    <strong>Differential Probability: ${probability}</strong> - 
                    ${result.maxOccurrence <= 4 ? 'Excellent! Very uniform distribution.' :
                    result.maxOccurrence <= 8 ? 'Acceptable uniformity.' :
                        'High concentration indicates vulnerability to differential attacks.'}
                </p>
                <p style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.9rem; color: var(--text-muted);">
                    💡 <em>Differential cryptanalysis exploits non-uniform propagation of input differences. 
                    AES S-Box has differential uniformity of 4, which is optimal for resisting this attack.</em>
                </p>
            `;
            document.getElementById('diff-explanation').innerHTML = explanation;
            document.getElementById('differential-results').style.display = 'block';
            document.getElementById('differential-results').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    // Attack type switcher
    const attackTypeBtns = document.querySelectorAll('.attack-type-btn');
    attackTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const attackType = btn.dataset.attack;

            // Update button states
            attackTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Toggle panels
            if (attackType === 'linear') {
                document.getElementById('linear-attack-panel').style.display = 'block';
                document.getElementById('differential-attack-panel').style.display = 'none';
            } else {
                document.getElementById('linear-attack-panel').style.display = 'none';
                document.getElementById('differential-attack-panel').style.display = 'block';
            }
        });
    });
});
