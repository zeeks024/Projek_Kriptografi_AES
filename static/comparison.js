// S-Box Comparison Tool Logic
// Handles side-by-side S-Box comparison

// Predefined S-Box metrics (from known analysis)
const SBOX_METRICS = {
    'aes': { nl: 112, sac: 0.5049, 'bic-nl': 112, 'bic-sac': 0.5046, lap: 0.0625, dap: 0.0156, du: 4 },
    'K4': { nl: 104, sac: 0.4980, 'bic-nl': 104, 'bic-sac': 0.4975, lap: 0.0781, dap: 0.0234, du: 6 },
    'K44': { nl: 112, sac: 0.5049, 'bic-nl': 112, 'bic-sac': 0.5046, lap: 0.0625, dap: 0.0156, du: 4 },
    'K81': { nl: 108, sac: 0.5015, 'bic-nl': 108, 'bic-sac': 0.5010, lap: 0.0703, dap: 0.0195, du: 5 },
    'K111': { nl: 110, sac: 0.5032, 'bic-nl': 110, 'bic-sac': 0.5028, lap: 0.0664, dap: 0.0176, du: 4 },
    'K128': { nl: 112, sac: 0.5049, 'bic-nl': 112, 'bic-sac': 0.5046, lap: 0.0625, dap: 0.0156, du: 4 }
};

function runSBoxComparison() {
    const sbox1Select = document.getElementById('compare-sbox1');
    const sbox2Select = document.getElementById('compare-sbox2');
    const resultsDiv = document.getElementById('comparison-results');
    const tbody = document.getElementById('comparison-tbody');
    const summaryDiv = document.getElementById('comparison-summary');

    const sbox1Value = sbox1Select.value;
    const sbox2Value = sbox2Select.value;

    if (!sbox1Value || !sbox2Value) {
        alert('Please select both S-Boxes to compare.');
        return;
    }

    if (sbox1Value === sbox2Value) {
        alert('Please select two different S-Boxes.');
        return;
    }

    // Get metrics (use predefined or fetch from current if 'current' is selected)
    let metrics1, metrics2;

    if (sbox1Value === 'current') {
        metrics1 = getCurrentSBoxMetrics();
        if (!metrics1) {
            alert('No S-Box currently loaded. Please analyze an S-Box first.');
            return;
        }
    } else {
        metrics1 = SBOX_METRICS[sbox1Value];
    }

    if (sbox2Value === 'current') {
        metrics2 = getCurrentSBoxMetrics();
        if (!metrics2) {
            alert('No S-Box currently loaded. Please analyze an S-Box first.');
            return;
        }
    } else {
        metrics2 = SBOX_METRICS[sbox2Value];
    }

    // Update headers
    document.getElementById('sbox1-name-header').textContent = sbox1Value === 'current' ? 'Current S-Box' : sbox1Value.toUpperCase();
    document.getElementById('sbox2-name-header').textContent = sbox2Value === 'current' ? 'Current S-Box' : sbox2Value.toUpperCase();

    // Build comparison table
    tbody.innerHTML = '';
    let sbox1Wins = 0;
    let sbox2Wins = 0;

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
        const val1 = metrics1[metric.key];
        const val2 = metrics2[metric.key];

        let winner = '';
        if (metric.higher !== undefined) {
            // Higher is better or lower is better
            if (metric.higher) {
                winner = val1 > val2 ? 'S-Box 1' : (val2 > val1 ? 'S-Box 2' : 'Tie');
                if (val1 > val2) sbox1Wins++;
                else if (val2 > val1) sbox2Wins++;
            } else {
                winner = val1 < val2 ? 'S-Box 1' : (val2 < val1 ? 'S-Box 2' : 'Tie');
                if (val1 < val2) sbox1Wins++;
                else if (val2 < val1) sbox2Wins++;
            }
        } else if (metric.ideal !== undefined) {
            // Closer to ideal is better
            const diff1 = Math.abs(val1 - metric.ideal);
            const diff2 = Math.abs(val2 - metric.ideal);
            winner = diff1 < diff2 ? 'S-Box 1' : (diff2 < diff1 ? 'S-Box 2' : 'Tie');
            if (diff1 < diff2) sbox1Wins++;
            else if (diff2 < diff1) sbox2Wins++;
        }

        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
        row.innerHTML = `
            <td style="padding: 1rem; font-weight: 600;">${metric.label}</td>
            <td style="padding: 1rem; text-align: center; ${winner === 'S-Box 1' ? 'color: #00FF88; font-weight: 700;' : ''}">${formatValue(val1)}</td>
            <td style="padding: 1rem; text-align: center; ${winner === 'S-Box 2' ? 'color: #00FF88; font-weight: 700;' : ''}">${formatValue(val2)}</td>
            <td style="padding: 1rem; text-align: center;${winner === 'Tie' ? '' : ' color: var(--primary-color); font-weight: 700;'}">${winner}</td>
        `;
        tbody.appendChild(row);
    });

    // Generate summary
    let overallWinner;
    if (sbox1Wins > sbox2Wins) {
        overallWinner = sbox1Value === 'current' ? 'Current S-Box' : sbox1Value.toUpperCase();
    } else if (sbox2Wins > sbox1Wins) {
        overallWinner = sbox2Value === 'current' ? 'Current S-Box' : sbox2Value.toUpperCase();
    } else {
        overallWinner = 'Tie';
    }

    summaryDiv.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: var(--primary-color);">
            <i class="fas fa-trophy"></i> Comparison Summary
        </h3>
        <div style="display: flex; justify-content: center; gap: 3rem; margin-bottom: 1rem;">
            <div>
                <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem;">${sbox1Value === 'current' ? 'Current S-Box' : sbox1Value.toUpperCase()}</div>
                <div style="font-size: 2.5rem; font-weight: 700; color: ${sbox1Wins > sbox2Wins ? '#00FF88' : 'var(--text-color)'};">${sbox1Wins}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">wins</div>
            </div>
            <div style="font-size: 2rem; align-self: center; color: var(--text-muted);">vs</div>
            <div>
                <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem;">${sbox2Value === 'current' ? 'Current S-Box' : sbox2Value.toUpperCase()}</div>
                <div style="font-size: 2.5rem; font-weight: 700; color: ${sbox2Wins > sbox1Wins ? '#00FF88' : 'var(--text-color)'};">${sbox2Wins}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">wins</div>
            </div>
        </div>
        <div style="padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.2); font-size: 1.1rem;">
            ${overallWinner === 'Tie' ?
            '<strong>Result:</strong> Both S-Boxes perform equally well.' :
            `<strong>Winner:</strong> <span style="color: #00FF88; font-weight: 700;">${overallWinner}</span> performs better overall.`
        }
        </div>
    `;

    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function getCurrentSBoxMetrics() {
    // Try to get metrics from the last analyzed S-Box
    const lastMetrics = window.lastAnalysisMetrics;
    if (!lastMetrics) return null;

    return {
        nl: lastMetrics.nl || lastMetrics.nonlinearity || 0,
        sac: lastMetrics.sac || 0,
        'bic-nl': lastMetrics['bic-nl'] || lastMetrics.bic_nl || 0,
        'bic-sac': lastMetrics['bic-sac'] || lastMetrics.bic_sac || 0,
        lap: lastMetrics.lap || 0,
        dap: lastMetrics.dap || 0,
        du: lastMetrics.du || lastMetrics.differential_uniformity || 0
    };
}

function formatValue(val) {
    if (typeof val === 'number') {
        return val % 1 === 0 ? val.toString() : val.toFixed(4);
    }
    return val;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const comparisonBtn = document.getElementById('run-comparison-btn');
    if (comparisonBtn) {
        comparisonBtn.addEventListener('click', runSBoxComparison);
    }
});
