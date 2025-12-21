
import sys
import os

# Add project root to path
sys.path.append(os.getcwd())

from sbox_analyzer import (
    AES_SBOX, 
    calculate_nonlinearity,
    calculate_sac,
    calculate_bic_nl,
    calculate_bic_sac,
    calculate_lap,
    calculate_dap,
    calculate_differential_uniformity,
    calculate_algebraic_degree,
    calculate_transparency_order,
    calculate_correlation_immunity
)

def verify():
    print("Verifying AES S-Box Metrics...")
    sbox = AES_SBOX
    
    nl = calculate_nonlinearity(sbox)
    print(f"NL: {nl} (Expected: 112)")
    
    sac = calculate_sac(sbox)
    print(f"SAC: {sac:.4f} (Expected: ~0.5)")
    
    bic_nl = calculate_bic_nl(sbox)
    print(f"BIC-NL: {bic_nl}")
    
    bic_sac = calculate_bic_sac(sbox)
    print(f"BIC-SAC: {bic_sac:.4f}")
    
    lap = calculate_lap(sbox)
    print(f"LAP: {lap:.6f} (Standard Expected: 0.015625, Image shows: 0.0625)")
    
    dap = calculate_dap(sbox)
    print(f"DAP: {dap:.6f} (Expected: 0.015625)")
    
    du = calculate_differential_uniformity(sbox)
    print(f"DU: {du} (Expected: 4)")
    
    deg = calculate_algebraic_degree(sbox)
    print(f"Degree: {deg} (Expected: 7)")
    
    to = calculate_transparency_order(sbox)
    print(f"TO: {to:.4f}")
    
    ci = calculate_correlation_immunity(sbox)
    print(f"CI: {ci} (Expected: 0)")

if __name__ == "__main__":
    verify()
