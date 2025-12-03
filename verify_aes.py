from aes_cipher import AESCipher
from sbox_analyzer import AES_SBOX, SBOX_44
import binascii

def test_standard_aes():
    print("Testing Standard AES...")
    key = bytes.fromhex('000102030405060708090a0b0c0d0e0f')
    plaintext = bytes.fromhex('00112233445566778899aabbccddeeff')
    expected_ciphertext = bytes.fromhex('69c4e0d86a7b0430d8cdb78070b4c55a')

    cipher = AESCipher(key, AES_SBOX)
    # Encrypt block directly
    ciphertext_block = cipher.encrypt_block(list(plaintext))
    ciphertext = bytes(ciphertext_block)
    
    print(f"Key: {binascii.hexlify(key)}")
    print(f"Plaintext: {binascii.hexlify(plaintext)}")
    print(f"Ciphertext: {binascii.hexlify(ciphertext)}")
    print(f"Expected:   {binascii.hexlify(expected_ciphertext)}")
    
    if ciphertext == expected_ciphertext:
        print("PASS: Standard AES matches FIPS 197 vector.")
    else:
        print("FAIL: Standard AES does not match.")

    # Test Decryption
    decrypted_block = cipher.decrypt_block(list(ciphertext))
    decrypted = bytes(decrypted_block)
    print(f"Decrypted:  {binascii.hexlify(decrypted)}")
    
    if decrypted == plaintext:
        print("PASS: Decryption restores plaintext.")
    else:
        print("FAIL: Decryption failed.")

def test_sbox44_aes():
    print("\nTesting AES with S-Box 44...")
    key = bytes.fromhex('000102030405060708090a0b0c0d0e0f')
    plaintext = bytes.fromhex('00112233445566778899aabbccddeeff')
    
    cipher = AESCipher(key, SBOX_44)
    ciphertext_block = cipher.encrypt_block(list(plaintext))
    ciphertext = bytes(ciphertext_block)
    
    print(f"Key: {binascii.hexlify(key)}")
    print(f"Plaintext: {binascii.hexlify(plaintext)}")
    print(f"Ciphertext (S-Box 44): {binascii.hexlify(ciphertext)}")
    
    # Test Decryption
    decrypted_block = cipher.decrypt_block(list(ciphertext))
    decrypted = bytes(decrypted_block)
    print(f"Decrypted:  {binascii.hexlify(decrypted)}")
    
    if decrypted == plaintext:
        print("PASS: S-Box 44 Decryption restores plaintext.")
    else:
        print("FAIL: S-Box 44 Decryption failed.")

def test_components():
    print("\nTesting Components...")
    cipher = AESCipher(bytes([0]*16))
    
    # Test gmul
    res = cipher.gmul(0x57, 0x83)
    # 0x57 * 0x83 = 0xc1 in GF(2^8)
    if res == 0xc1:
        print("PASS: gmul(0x57, 0x83) = 0xc1")
    else:
        print(f"FAIL: gmul(0x57, 0x83) = {hex(res)}")

    # Test Key Expansion (FIPS 197 Appendix A.1)
    key = bytes.fromhex('2b7e151628aed2a6abf7158809cf4f3c')
    cipher = AESCipher(key)
    # w[0] = 2b7e1516
    # w[3] = 09cf4f3c
    # w[4] = a0fafe17
    if cipher.w[4] == 0xa0fafe17:
        print("PASS: Key Expansion w[4] matches.")
    else:
        print(f"FAIL: Key Expansion w[4] = {hex(cipher.w[4])}, expected 0xa0fafe17")

    # Test FIPS 197 Appendix B Example
    print("\nTesting FIPS 197 Appendix B...")
    key = bytes.fromhex('2b7e151628aed2a6abf7158809cf4f3c')
    plaintext = bytes.fromhex('3243f6a8885a308d313198a2e0370734')
    expected = bytes.fromhex('3925841d02dc09fbdc118597196a0b32')
    
    cipher = AESCipher(key)
    # Trace first round manually
    state = [[0]*4 for _ in range(4)]
    for r in range(4):
        for c in range(4):
            state[r][c] = plaintext[r + 4*c]
            
    print(f"Input State: {state}")
    
    state = cipher.add_round_key(state, 0)
    print(f"After ARK(0): {state}")
    # Expected: 19 3d e3 be a0 f4 e2 2b 9a c6 8d 2a e9 f8 48 08
    # My state is column major:
    # Col 0: 19 3d e3 be
    # Col 1: a0 f4 e2 2b
    # ...
    
    state = cipher.sub_bytes(state)
    print(f"After SubBytes: {state}")
    # Expected: d4 27 11 ae e0 bf 98 f1 b8 b4 5d e5 1e 41 52 30
    
    state = cipher.shift_rows(state)
    print(f"After ShiftRows: {state}")
    # Expected: d4 bf 5d 30 e0 b4 52 ae b8 41 11 f1 1e 27 98 e5
    
    state = cipher.mix_columns(state)
    print(f"After MixColumns: {state}")
    # Expected: 04 66 81 e5 e0 cb 19 9a 48 f8 d3 7a 28 06 26 4c
    
    state = cipher.add_round_key(state, 1)
    print(f"After ARK(1): {state}")
    # Expected: a4 68 6b 02 9c 9f 5b 6a 7f 35 ea 50 f2 2b 43 49

if __name__ == "__main__":
    test_components()
    test_standard_aes()
    test_sbox44_aes()
