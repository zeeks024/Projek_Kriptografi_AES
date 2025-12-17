// Cryptographic Term Definitions for Interactive Tooltips
const CRYPTO_DEFINITIONS = {
    'Nonlinearity': {
        title: 'Nonlinearity (NL)',
        definition: 'Measures how far the S-Box is from being linear. Higher values indicate better resistance to linear approximation attacks.',
        note: 'Good S-Boxes have NL > 100. AES S-Box has NL = 112.'
    },
    'SAC': {
        title: 'Strict Avalanche Criterion',
        definition: 'When ONE input bit flips, approximately 50% of output bits should change. This measures the quality of diffusion in the S-Box.',
        note: 'Ideal SAC = 0.5 (exactly 50%). Acceptable range: 0.45-0.55'
    },
    'BIC-NL': {
        title: 'BIC Nonlinearity',
        definition: 'Bit Independence Criterion - Nonlinearity. Measures independence between output bit pairs when input bits change.',
        note: 'Higher values mean output bits behave more independently.'
    },
    'BIC-SAC': {
        title: 'BIC - SAC',
        definition: 'Bit Independence Criterion variant of SAC. Ensures output bits change independently when single input bit flips.',
        note: 'Values close to 0.5 indicate good bit independence.'
    },
    'LAP': {
        title: 'Linear Approximation Probability',
        definition: 'The maximum probability of finding a linear relationship between input and output bits. Lower values indicate better resistance to linear cryptanalysis attacks.',
        note: 'Strong S-Boxes have LAP < 0.1. Lower = harder to attack.'
    },
    'DAP': {
        title: 'Differential Approximation Probability',
        definition: 'The maximum probability that a specific input difference produces a specific output difference. Lower values indicate better resistance to differential cryptanalysis.',
        note: 'Lower DAP = better security against differential attacks.'
    },
    'Differential Uniformity': {
        title: 'Differential Uniformity (DU)',
        definition: 'Maximum occurrence count of any output difference in the difference distribution table.',
        note: 'AES S-Box has DU = 4. Lower is better (minimum possible is 2).'
    },
    'Algebraic Degree': {
        title: 'Algebraic Degree',
        definition: 'Degree of the polynomial equation representing the S-Box over GF(2). Higher is better against algebraic attacks.',
        note: 'Maximum possible is 7 for 8-bit S-Box. AES has degree 7.'
    },
    'Transparency Order': {
        title: 'Transparency Order',
        definition: 'Measures how "transparent" the S-Box is to XOR operations. Higher values indicate better cryptographic strength.',
        note: 'Related to resistance against differential power analysis.'
    }
};

// Initialize tooltips when DOM is loaded
function initializeTooltips() {
    document.querySelectorAll('.crypto-tooltip').forEach(tooltip => {
        const term = tooltip.dataset.term;
        const def = CRYPTO_DEFINITIONS[term];

        if (def) {
            const contentDiv = tooltip.querySelector('.tooltip-content');
            if (contentDiv) {
                contentDiv.innerHTML = `
                    <div class="tooltip-title">${def.title}</div>
                    <div class="tooltip-definition">${def.definition}</div>
                    ${def.note ? `<div class="tooltip-note">ℹ️ ${def.note}</div>` : ''}
                `;
            }
        }
    });
}

// Export for use in main script
window.CRYPTO_DEFINITIONS = CRYPTO_DEFINITIONS;
window.initializeTooltips = initializeTooltips;
