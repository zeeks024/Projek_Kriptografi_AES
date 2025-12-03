document.addEventListener('DOMContentLoaded', () => {
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

    // Toggle custom input visibility
    sboxSelect.addEventListener('change', () => {
        if (sboxSelect.value === 'custom') {
            customInputContainer.classList.remove('hidden');
        } else {
            customInputContainer.classList.add('hidden');
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
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || 'An error occurred');
                return;
            }

            displayResults(data);

            // Show encryption section after successful analysis
            encryptionSection.classList.remove('hidden');

        } catch (error) {
            console.error('Error:', error);
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

        // 1. Display Bijective Status
        bijectiveStatus.textContent = data.is_bijective ? 'YES' : 'NO';
        bijectiveStatus.className = 'status-value ' + (data.is_bijective ? 'valid' : 'invalid');

        // 2. Display Advanced Metrics
        if (data.metrics) {
            document.getElementById('nl-value').textContent = data.metrics.nl;
            document.getElementById('sac-value').textContent = data.metrics.sac;
            document.getElementById('bic-nl-value').textContent = data.metrics.bic_nl;
            document.getElementById('bic-sac-value').textContent = data.metrics.bic_sac;
            document.getElementById('lap-value').textContent = data.metrics.lap;
            document.getElementById('dap-value').textContent = data.metrics.dap;
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
            [0, 0, 0, 0, 1, 1, 1, 1]
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
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const matrixName = btn.dataset.matrix;
            if (matrixName) {
                currentMatrix = PRESET_MATRICES[matrixName];
                loadMatrixEditor(currentMatrix);
                matrixEditor.classList.remove('hidden');
            } else {
                // Custom matrix - initialize with zeros
                currentMatrix = Array(8).fill(null).map(() => Array(8).fill(0));
                loadMatrixEditor(currentMatrix);
                matrixEditor.classList.remove('hidden');
            }
        });
    });

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
    }
});
