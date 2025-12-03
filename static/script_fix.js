// This is just the corrected displayConstructorResults function
// Use this to manually patch script.js

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
