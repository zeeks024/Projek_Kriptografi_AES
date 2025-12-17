// Attack Simulation Logic
// Linear and Differential Cryptanalysis Demos

// Store the S-Box being analyzed
let attackSBox = null;

// Hardcoded Preset S-Boxes
const PRESET_SBOXES = {
    'aes': [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
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
        0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16]
};

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
function loadAttackSBox(source, customData = null) {
    if (source === 'current') {
        attackSBox = window.currentSBox || null;
        if (!attackSBox) {
            return { success: false, message: 'No S-Box loaded. Please analyze an S-Box first.' };
        }
        return { success: true, message: 'Using current loaded S-Box' };
    } else if (source === 'custom') {
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
        // Load from preset
        if (PRESET_SBOXES[source]) {
            attackSBox = PRESET_SBOXES[source];
            return { success: true, message: `${source.toUpperCase()} S-Box loaded successfully` };
        } else {
            return { success: false, message: `Preset ${source} not available. Currently only AES is hardcoded.` };
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
                result = loadAttackSBox(selectedValue);
            }

            if (result.success) {
                attackSBoxStatus.innerHTML = `<span style="color: #00FF88;">✓ ${result.message}</span>`;
            } else {
                attackSBoxStatus.innerHTML = `<span style="color: #F44336;">✗ ${result.message}</span>`;
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
