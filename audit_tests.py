
import pytest
import numpy as np
from sbox_analyzer import (
    _gf_multiply, _gf_inverse, construct_sbox_from_matrix, 
    AES_SBOX, get_ddt_table, get_lat_table, calculate_nonlinearity
)
from aes_cipher import AESCipher

# --- 1. GF(2^8) Verification ---
def test_gf_multiplication():
    # Test cases from NIST FIPS 197 or standard GF(2^8) with 0x11B
    # {57} * {83} = {c1}
    assert _gf_multiply(0x57, 0x83) == 0xc1
    # {57} * {13} = {fe}
    assert _gf_multiply(0x57, 0x13) == 0xfe
    # {01} * {xy} = {xy}
    assert _gf_multiply(0x01, 0xAB) == 0xAB
    # {00} * {xy} = {00}
    assert _gf_multiply(0x00, 0xFF) == 0x00

def test_gf_inverse():
    # known inverses
    # inv(00) = 00
    assert _gf_inverse(0x00) == 0x00
    # inv(01) = 01
    assert _gf_inverse(0x01) == 0x01
    # inv({53}) = {ca} 
    # Check self-inverse property
    for x in range(256):
        inv = _gf_inverse(x)
        if x != 0:
            assert _gf_multiply(x, inv) == 1

# --- 2. S-Box Construction Verification ---
def test_aes_sbox_construction():
    # AES Affine Transformation Matrix (row-major description usually, but verify implementation)
    # The standard affine matrix in AES specification
    # [1 0 0 0 1 1 1 1]
    # [1 1 0 0 0 1 1 1]
    # ...
    # This matrix is circulant.
    # Note: construct_sbox_from_matrix expects list of lists.
    
    # Standard AES Affine Matrix (Bit 0 is LSB)
    # Row 0 of matrix corresponds to Output Bit 0
    # Output_0 = Input_0 + Input_4 + Input_5 + Input_6 + Input_7 + c_0
    
    # Let's try to reconstruct AES S-box using the standard parameters
    
    # Standard AES Matrix (LSB first convention for our vector implementation)
    # The matrix provided in FIPS 197 is:
    # 1 0 0 0 1 1 1 1
    # 1 1 0 0 0 1 1 1
    # 1 1 1 0 0 0 1 1
    # 1 1 1 1 0 0 0 1
    # 1 1 1 1 1 0 0 0
    # 0 1 1 1 1 1 0 0
    # 0 0 1 1 1 1 1 0
    # 0 0 0 1 1 1 1 1
    
    # Constant: {63} = 01100011 (binary) -> LSB is 1.
    # Vector: [1, 1, 0, 0, 0, 1, 1, 0] (LSB first: 1, 1, 0, 0, 0, 1, 1, 0 -> 0x63)
    
    aes_matrix = [
        [1, 0, 0, 0, 1, 1, 1, 1],
        [1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1],
        [1, 1, 1, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 1, 1, 1, 1, 1]
    ]
    
    # The constant 0x63 = 01100011 (binary, usually MSB...LSB in writing)
    # But in vector [b0, b1, ..., b7], 0x63 is 11000110?
    # Wait, usually text 0x63 is bits 01100011 where right is LSB.
    # So b0=1, b1=1, b2=0...
    # [1, 1, 0, 0, 0, 1, 1, 0]
    
    c_aes = [1, 1, 0, 0, 0, 1, 1, 0] 
    
    constructed = construct_sbox_from_matrix(aes_matrix, c_aes)
    
    # Verify against standard S-Box
    assert list(constructed) == AES_SBOX

# --- 3. AES Encryption Verification (NIST FIPS 197) ---
def test_aes_nist_vector():
    # Appendix C.1 AES-128
    # Key: 000102030405060708090a0b0c0d0e0f
    # Input: 00112233445566778899aabbccddeeff
    # Output: 69c4e0d86a7b0430d8cdb78070b4c55a
    
    key = bytes.fromhex("000102030405060708090a0b0c0d0e0f")
    plaintext = bytes.fromhex("00112233445566778899aabbccddeeff")
    expected_ciphertext = bytes.fromhex("69c4e0d86a7b0430d8cdb78070b4c55a")
    
    cipher = AESCipher(key)
    # We use encrypt_block directly to avoid padding since NIST vector is raw block
    # encrypt_block expects list of ints
    block = list(plaintext)
    output_block = cipher.encrypt_block(block)
    output_bytes = bytes(output_block)
    
    assert output_bytes == expected_ciphertext

# --- 4. DDT/LAT Invariants ---
def test_ddt_lat_properties():
    ddt = get_ddt_table(AES_SBOX)
    
    # Sum of each row/col in DDT should be 256
    for row in ddt:
        assert sum(row) == 256
        
    # Standard APN/Differential Uniformity of AES is 4
    max_diff = 0
    for dx in range(1, 256):
        for dy in range(256):
            if ddt[dx][dy] > max_diff:
                max_diff = ddt[dx][dy]
    assert max_diff == 4
    
    lat = get_lat_table(AES_SBOX)
    # Sum of LAT squares can be checked (Parseval) but simpler: input/output zero
    # LAT[0][0] corresponds to correlation 1 (or value 128)
    # Wait, implementation stores bias * 128? 
    # WHT[0] = 256. LAT[0][0] = 128. Correct.
    assert lat[0][0] == 128
    
    # AES Nonlinearity is 112
    nl = calculate_nonlinearity(AES_SBOX)
    assert nl == 112

# --- 5. Round Trip ---
def test_encrypt_decrypt_roundtrip():
    key = b'Sixteen byte key'
    plaintext = b'Hello World! This is a test.'
    
    cipher = AESCipher(key)
    encrypted = cipher.encrypt_data(plaintext)
    decrypted = cipher.decrypt_data(encrypted)
    
    assert decrypted == plaintext
