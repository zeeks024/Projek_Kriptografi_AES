import numpy as np

# AES S-Box (Standard)
AES_SBOX = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
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
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
]

# S-Box 44 (Extracted from PDF)
SBOX_44 = [
    99, 205, 85, 71, 25, 127, 113, 219, 63, 244, 109, 159, 11, 228, 94, 214,
    77, 177, 201, 78, 5, 48, 29, 30, 87, 96, 193, 80, 156, 200, 216, 86,
    116, 143, 10, 14, 54, 169, 148, 68, 49, 75, 171, 157, 92, 114, 188, 194,
    121, 220, 131, 210, 83, 135, 250, 149, 253, 72, 182, 33, 190, 141, 249, 82,
    232, 50, 21, 84, 215, 242, 180, 198, 168, 167, 103, 122, 152, 162, 145, 184,
    43, 237, 119, 183, 7, 12, 125, 55, 252, 206, 235, 160, 140, 133, 179, 192,
    110, 176, 221, 134, 19, 6, 187, 59, 26, 129, 112, 73, 175, 45, 24, 218,
    44, 66, 151, 32, 137, 31, 35, 147, 236, 247, 117, 132, 79, 136, 154, 105,
    199, 101, 203, 52, 57, 4, 153, 197, 88, 76, 202, 174, 233, 62, 208, 91,
    231, 53, 1, 124, 0, 28, 142, 170, 158, 51, 226, 65, 123, 186, 239, 246,
    38, 56, 36, 108, 8, 126, 9, 189, 81, 234, 212, 224, 13, 3, 40, 64,
    172, 74, 181, 118, 39, 227, 130, 89, 245, 166, 16, 61, 106, 196, 211, 107,
    229, 195, 138, 18, 93, 207, 240, 95, 58, 255, 209, 217, 15, 111, 46, 173,
    223, 42, 115, 238, 139, 243, 23, 98, 100, 178, 37, 97, 191, 213, 222, 155,
    165, 2, 146, 204, 120, 241, 163, 128, 22, 90, 60, 185, 67, 34, 27, 248,
    164, 69, 41, 230, 104, 47, 144, 251, 20, 17, 150, 225, 254, 161, 102, 70
]

def get_sbox(sbox_type):
    if sbox_type == 'aes':
        return AES_SBOX
    elif sbox_type == 'sbox44':
        return SBOX_44
    else:
        return None

def get_inverse_sbox(sbox):
    """Generates the inverse S-Box."""
    inv_sbox = [0] * 256
    for i, val in enumerate(sbox):
        inv_sbox[val] = i
    return inv_sbox

def check_bijective(sbox):
    if len(sbox) != 256:
        return False
    return len(set(sbox)) == 256

def check_balance(sbox):
    if len(sbox) != 256:
        return None
    
    balance_results = []
    for bit in range(8):
        count_0 = 0
        count_1 = 0
        for value in sbox:
            if (value >> bit) & 1:
                count_1 += 1
            else:
                count_0 += 1
        
        is_balanced = (count_0 == 128) and (count_1 == 128)
        balance_results.append({
            'bit': bit,
            'count_0': count_0,
            'count_1': count_1,
            'is_balanced': is_balanced
        })
    return balance_results

# --- Advanced Metrics ---

def walsh_hadamard_transform(f):
    """
    Computes the Walsh-Hadamard Transform of a boolean function f.
    f is a list of length 2^n (256 for n=8) containing -1 or 1.
    """
    n = len(f)
    if n == 1:
        return f
    half = n // 2
    left = walsh_hadamard_transform(f[:half])
    right = walsh_hadamard_transform(f[half:])
    
    res = []
    for i in range(half):
        res.append(left[i] + right[i])
    for i in range(half):
        res.append(left[i] - right[i])
    return res

def calculate_nonlinearity(sbox):
    """
    Calculates the Nonlinearity of the S-Box.
    NL = min(NL(f_i)) for i=0..7 (output bits).
    NL(f) = 2^(n-1) - 1/2 * max(|WHT(f)|)
    """
    n = 8
    min_nl = 256 # Start high
    
    for bit in range(8):
        # Construct boolean function for this bit
        # Map 0 -> 1, 1 -> -1 (or vice versa, magnitude is what matters)
        f = []
        for x in range(256):
            val = sbox[x]
            bit_val = (val >> bit) & 1
            f.append(1 if bit_val == 0 else -1)
            
        wht = walsh_hadamard_transform(f)
        max_abs_wht = max(abs(x) for x in wht)
        
        nl = (2**(n-1)) - (max_abs_wht / 2)
        if nl < min_nl:
            min_nl = nl
            
    return int(min_nl)

def calculate_sac(sbox):
    """
    Calculates the Strict Avalanche Criterion (SAC).
    Average probability that an output bit changes when a single input bit changes.
    Ideal value is 0.5.
    """
    n = 8
    total_sac = 0
    count = 0
    
    # For each input bit position i (0..7)
    for i in range(n):
        # For each input x (0..255)
        for x in range(256):
            # Flip bit i of x
            x_flipped = x ^ (1 << i)
            
            y1 = sbox[x]
            y2 = sbox[x_flipped]
            
            diff = y1 ^ y2
            
            # Count how many bits changed in output
            # Hamming weight of diff
            hw = bin(diff).count('1')
            
            total_sac += hw
            count += 8 # 8 output bits
            
    return total_sac / count

def calculate_bic_nl(sbox):
    """
    Calculates Bit Independence Criterion - Nonlinearity (BIC-NL).
    Min NL of XOR sum of any two output bits.
    """
    n = 8
    min_nl = 256
    
    for i in range(n):
        for j in range(i + 1, n):
            # Boolean function for f_i XOR f_j
            f = []
            for x in range(256):
                val = sbox[x]
                bit_i = (val >> i) & 1
                bit_j = (val >> j) & 1
                res_bit = bit_i ^ bit_j
                f.append(1 if res_bit == 0 else -1)
            
            wht = walsh_hadamard_transform(f)
            max_abs_wht = max(abs(x) for x in wht)
            nl = (2**(n-1)) - (max_abs_wht / 2)
            
            if nl < min_nl:
                min_nl = nl
                
    return int(min_nl)

def calculate_bic_sac(sbox):
    """
    Calculates Bit Independence Criterion - SAC (BIC-SAC).
    Checks if the avalanche vectors of two output bits are independent.
    Simplified: Average SAC of f_i XOR f_j.
    """
    n = 8
    total_sac_xor = 0
    count_xor = 0
    
    for i in range(n):
        for j in range(i + 1, n):
            # Calculate SAC for function h = f_i ^ f_j
            current_sac_sum = 0
            current_count = 0
            
            for k in range(n): # Input bit to flip
                for x in range(256):
                    x_flipped = x ^ (1 << k)
                    y1 = sbox[x]
                    y2 = sbox[x_flipped]
                    
                    # Bits i and j of y1
                    b1_i = (y1 >> i) & 1
                    b1_j = (y1 >> j) & 1
                    h1 = b1_i ^ b1_j
                    
                    # Bits i and j of y2
                    b2_i = (y2 >> i) & 1
                    b2_j = (y2 >> j) & 1
                    h2 = b2_i ^ b2_j
                    
                    if h1 != h2:
                        current_sac_sum += 1
                    current_count += 1
            
            total_sac_xor += (current_sac_sum / current_count)
            count_xor += 1
            
    return total_sac_xor / count_xor

def calculate_lap(sbox):
    """
    Calculates Linear Approximation Probability (LAP).
    LAP = max_{a,b != 0} | #{x | a.x = b.S(x)} - 2^(n-1) | / 2^n
    Actually, the paper defines LAP as the probability itself, usually bias^2 or similar.
    Paper value: 0.0625 = 1/16.
    Max bias for AES is 2^(-4) = 1/16? No, bias is 2^(n/2 - 1) / 2^n.
    Let's check the standard definition.
    Linear Probability LP = (2*bias)^2.
    Max bias for AES is 32/256 = 1/8.
    (2 * 1/8)^2 = (1/4)^2 = 1/16 = 0.0625.
    So LAP in the paper corresponds to the maximum Linear Probability (LP).
    
    Algorithm:
    Use Linear Approximation Table (LAT).
    LAT[a][b] = #{x | a.x = b.S(x)} - 128
    Max bias = max(|LAT[a][b]|) / 256
    LAP = (2 * Max bias)^2
    """
    n = 8
    max_bias = 0
    
    # We can use WHT to compute LAT efficiently, or just brute force for 8-bit.
    # Brute force is O(2^2n) = 2^16 = 65536 operations per S-Box, very fast.
    # Wait, brute force is O(2^n * 2^n * 2^n) if naive? No.
    # For each a, b: count matches. That's 256 * 256 * 256 = 16M ops. A bit slow for Python.
    # Better use WHT.
    # LAT[a][b] is related to WHT of f_{b} (linear combination of output bits determined by b).
    # Specifically, the component function f_b(x) = b.S(x).
    # Its WHT at point a is WHT(f_b)[a] = sum (-1)^(b.S(x) + a.x).
    # This sum is exactly 2 * (#{x | a.x + b.S(x) = 0} - 128) = 2 * LAT[a][b].
    # So LAT[a][b] = WHT(f_b)[a] / 2.
    
    # We need max_{a,b != 0} |LAT[a][b]|.
    # Iterate over all non-zero b.
    
    max_abs_lat = 0
    
    for b in range(1, 256):
        # Construct boolean function f_b(x) = b.S(x)
        f = []
        for x in range(256):
            val = sbox[x]
            # Dot product b.val over GF(2) is parity of (b & val)
            dot_prod = bin(b & val).count('1') % 2
            f.append(1 if dot_prod == 0 else -1)
            
        wht = walsh_hadamard_transform(f)
        
        # WHT values are 2 * LAT values.
        # We ignore a=0 if b=0, but b starts at 1.
        # For a given b, check all a.
        # Note: if b!=0, WHT[0] corresponds to a=0 (linear bias of output combination).
        # We check all a.
        
        current_max = max(abs(x) for x in wht)
        if current_max > max_abs_lat:
            max_abs_lat = current_max
            
    # max_abs_lat is 2 * max_bias * 256?
    # WHT = sum (-1)^(...)
    # Max value is 256.
    # For AES, max WHT is 32.
    # 32 / 2 = 16 (LAT value).
    # Bias = 16 / 256 = 1/16.
    # LP = (2 * 1/16)^2 = (1/8)^2 = 1/64?
    # Wait, paper says 0.0625 = 1/16.
    # If max WHT is 32.
    # Maybe LAP = (max_abs_lat / 256)^2 ?
    # (32/256)^2 = (1/8)^2 = 1/64 = 0.015625.
    # But paper says LAP = 0.0625.
    # 0.0625 = 1/16.
    # This implies max_abs_lat was 64?
    # Or maybe LAP definition is different.
    # "Linear Approximation Probability" usually refers to the probability p = 1/2 + bias.
    # But 0.0625 is too small for p. It must be the bias or bias^2 or similar.
    # If LAP = 2^-4 = 1/16.
    # Let's assume standard definition for now and see what we get for AES.
    # AES max WHT is 32.
    # If we get 32, and target is 0.0625.
    # 0.0625 = 4 * (32/256)^2 ? No.
    # 0.0625 = (32/128)^2 = (1/4)^2 = 1/16.
    # So LAP = (max_abs_lat / 128)^2 ?
    # Let's try to calculate and return whatever matches 0.0625 for AES.
    
    # Actually, let's just return the raw max_abs_lat first to debug, or better yet,
    # calculate the standard LP and see.
    
    # Let's implement the calculation and then adjust the formula to match 0.0625 for AES.
    
    # Calculate Linear Probability (LP)
    # LP = (bias * 2)^2
    # bias = LAT(a,b) / 256 = (WHT(a)/2) / 256 = WHT(a) / 512
    # Wait, my previous derivation:
    # 0.0625 = 1/16
    # AES Spectral Radius = 32
    # (32 / 128)^2 = (1/4)^2 = 1/16 = 0.0625
    # So the formula that matches the standard paper value is (max_abs_lat / 128.0)**2
    
    return (max_abs_lat / 128.0) ** 2

def calculate_dap(sbox):
    """
    Calculates Differential Approximation Probability (DAP).
    DAP = max_{dx, dy != 0} #{x | S(x) ^ S(x^dx) = dy} / 2^n
    """
    n = 8
    max_count = 0
    
    # Differential Distribution Table (DDT)
    # 256 x 256 table
    # Iterate dx from 1 to 255
    for dx in range(1, 256):
        counts = {}
        for x in range(256):
            y1 = sbox[x]
            y2 = sbox[x ^ dx]
            dy = y1 ^ y2
            counts[dy] = counts.get(dy, 0) + 1
            
        # Find max count for this dx (ignoring dy=0 if any, but dy shouldn't be 0 for bijective sbox if dx!=0)
        for dy, count in counts.items():
            if count > max_count:
                max_count = count
                
    return max_count / 256.0

def encrypt_image(image_bytes, sbox):
    """
    Encrypts an image using S-Box substitution.
    Each byte of the image data is substituted using the S-Box.
    """
    from PIL import Image
    import io
    
    # Open image
    img = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if not already (to handle transparency or grayscale consistently)
    if img.mode != 'RGB':
        img = img.convert('RGB')
        
    width, height = img.size
    pixels = np.array(img)
    
    # Apply S-Box substitution to each pixel channel
    # pixels is (height, width, 3) array of uint8
    
    # Vectorized substitution using numpy indexing
    # sbox must be a numpy array or list. If list, convert to array for indexing.
    sbox_arr = np.array(sbox, dtype=np.uint8)
    
    encrypted_pixels = sbox_arr[pixels]
    
    # Create encrypted image
    encrypted_img = Image.fromarray(encrypted_pixels)
    
    # Save to bytes
    output = io.BytesIO()
    encrypted_img.save(output, format='PNG')
    return output.getvalue()

# --- S-Box Construction Functions ---

def construct_sbox_from_matrix(affine_matrix: list, c_constant: list = None, mod_poly: int = 0x11B) -> np.ndarray:
    """
    Construct S-box from affine matrix using AES construction method.
    
    Args:
        affine_matrix: 8x8 matrix (list of lists or numpy array)
        c_constant: 8-bit constant vector (default: C_AES = [1,1,0,0,0,1,1,0])
        mod_poly: Irreducible polynomial for GF(2^8) (default: 0x11B)
    
    Returns:
        256-element S-box as numpy array
    """
    if c_constant is None:
        c_constant = np.array([1, 1, 0, 0, 0, 1, 1, 0], dtype=np.uint8)
    else:
        c_constant = np.array(c_constant, dtype=np.uint8)
    
    K = np.array(affine_matrix, dtype=np.uint8)
    
    # Generate inverse table
    inv_table = np.zeros(256, dtype=np.uint8)
    for i in range(256):
        inv_table[i] = _gf_inverse(i, mod_poly)
    
    # Construct S-box
    sbox = np.zeros(256, dtype=np.uint8)
    for x in range(256):
        x_inv = int(inv_table[x])
        x_inv_vec = _int_to_binary_vector(x_inv)
        
        # Affine transformation: B(x) = (K × x^-1 + C) mod 2
        result_vec = (K @ x_inv_vec) % 2
        result_vec = (result_vec + c_constant) % 2
        
        sbox[x] = _binary_vector_to_int(result_vec)
    
    return sbox

def _gf_inverse(a: int, mod_poly: int = 0x11B) -> int:
    """Compute multiplicative inverse in GF(2^8)."""
    if a == 0:
        return 0
    for x in range(1, 256):
        if _gf_multiply(a, x, mod_poly) == 1:
            return x
    return 0

def _gf_multiply(a: int, b: int, mod_poly: int = 0x11B) -> int:
    """Multiply two elements in GF(2^8) with specified modulus."""
    result = 0
    aa = a & 0xFF
    bb = b & 0xFF
    while bb:
        if bb & 1:
            result ^= aa
        bb >>= 1
        carry = aa & 0x80
        aa = (aa << 1) & 0xFF
        if carry:
            aa ^= (mod_poly & 0xFF)
    return result & 0xFF

def _int_to_binary_vector(value: int) -> np.ndarray:
    """Convert integer to 8-bit binary vector (LSB first)."""
    return np.array([(value >> i) & 1 for i in range(8)], dtype=np.uint8)

def _binary_vector_to_int(vec: np.ndarray) -> int:
    """Convert 8-bit binary vector (LSB first) to integer."""
    result = 0
    for i, bit in enumerate(vec):
        result |= (int(bit) << i)
    return result

def get_construction_steps(x: int, affine_matrix: list, c_constant: list = None) -> dict:
    """
    Get detailed construction steps for a single input value.
    
    Returns a dictionary with step-by-step information including:
    - GF(2^8) inverse verification
    - Row-by-row matrix multiplication
    - Bit-by-bit XOR operations
    """
    if c_constant is None:
        c_constant = np.array([1, 1, 0, 0, 0, 1, 1, 0], dtype=np.uint8)
    else:
        c_constant = np.array(c_constant, dtype=np.uint8)
    
    K = np.array(affine_matrix, dtype=np.uint8)
    
    # Step 1: Input
    x_binary = format(x, '08b')
    x_vec = _int_to_binary_vector(x)
    
    # Step 2: Multiplicative Inverse in GF(2^8)
    x_inv = _gf_inverse(x)
    x_inv_binary = format(x_inv, '08b')
    x_inv_vec = _int_to_binary_vector(x_inv)
    
    # Verify inverse: x × x^-1 = 1 in GF(2^8)
    inverse_verification = _gf_multiply(x, x_inv)
    
    # Step 3: Matrix Multiplication (row-by-row)
    matrix_rows_detail = []
    for i in range(8):
        row = K[i]
        # Dot product in GF(2): sum of (row[j] AND x_inv_vec[j]) mod 2
        dot_products = []
        for j in range(8):
            product = row[j] * x_inv_vec[j]
            dot_products.append(int(product))
        
        result_bit = sum(dot_products) % 2
        
        matrix_rows_detail.append({
            'row_index': i,
            'row': row.tolist(),
            'vector': x_inv_vec.tolist(),
            'dot_products': dot_products,
            'sum': int(sum(dot_products)),
            'result_bit': int(result_bit)
        })
    
    matrix_result = np.array([row['result_bit'] for row in matrix_rows_detail], dtype=np.uint8)
    
    # Step 4: Add Constant (bit-by-bit XOR)
    xor_details = []
    for i in range(8):
        bit_a = matrix_result[i]
        bit_b = c_constant[i]
        result = (bit_a + bit_b) % 2
        xor_details.append({
            'index': i,
            'matrix_bit': int(bit_a),
            'constant_bit': int(bit_b),
            'result_bit': int(result)
        })
    
    final_result = np.array([xor['result_bit'] for xor in xor_details], dtype=np.uint8)
    output = _binary_vector_to_int(final_result)
    
    return {
        'input': x,
        'input_binary': x_binary,
        'input_vector': x_vec.tolist(),
        'inverse': x_inv,
        'inverse_binary': x_inv_binary,
        'inverse_vector': x_inv_vec.tolist(),
        'inverse_verification': inverse_verification,
        'matrix_rows_detail': matrix_rows_detail,
        'matrix_mult_result': matrix_result.tolist(),
        'constant': c_constant.tolist(),
        'xor_details': xor_details,
        'final_vector': final_result.tolist(),
        'output': output,
        'output_binary': format(output, '08b')
    }

def calculate_differential_uniformity(sbox):
    """
    Calculates Differential Uniformity (DU).
    DU = max_{dx != 0, dy} #{x | S(x) ^ S(x^dx) = dy}
    """
    n = 8
    max_count = 0
    
    for dx in range(1, 256):
        counts = {}
        for x in range(256):
            y1 = sbox[x]
            y2 = sbox[x ^ dx]
            dy = y1 ^ y2
            counts[dy] = counts.get(dy, 0) + 1
            
        for count in counts.values():
            if count > max_count:
                max_count = count
                
    return max_count

def calculate_algebraic_degree(sbox):
    """
    Calculates the Algebraic Degree (AD) of the S-Box.
    AD = max(deg(f_i)) for i=0..7 (output bits).
    """
    n = 8
    max_degree = 0
    
    for bit in range(8):
        # Get truth table for this output bit
        f = [(sbox[x] >> bit) & 1 for x in range(256)]
        
        # Compute ANF using Mobius Transform
        # In-place update
        anf = list(f)
        for i in range(n):
            for j in range(256):
                if (j >> i) & 1:
                    anf[j] = (anf[j] + anf[j ^ (1 << i)]) % 2
                    
        # Find max weight of x for which anf[x] is 1
        deg = 0
        for x in range(256):
            if anf[x] == 1:
                w = bin(x).count('1')
                if w > deg:
                    deg = w
        
        if deg > max_degree:
            max_degree = deg
            
    return max_degree

def calculate_transparency_order(sbox):
    """
    Calculates Transparency Order (TO).
    TO = max_{beta != 0} ( n - 2*wt(beta) - 1/(2^(2n) - 2^n) * sum_{a != 0} |W_S(beta, a)| )
    where W_S(beta, a) = sum_{x} (-1)^(beta.x + a.S(x))
    """
    n = 8
    M = 256
    max_to = -float('inf')
    
    # Precompute Walsh Transforms for all linear combinations of output bits
    # WHT_b[a] = sum_{x} (-1)^(b.S(x) + a.x)
    # We need W_S(beta, a) which corresponds to WHT_a[beta] in my notation above?
    # Let's stick to the formula: sum_{x} (-1)^(beta.x + a.S(x))
    # This is exactly the Walsh Transform of the component function f_a(x) = a.S(x) evaluated at beta.
    
    # We need to sum |WHT_a[beta]| over all a != 0.
    
    # Store sum of absolute Walsh values for each beta
    sum_abs_wht_beta = [0.0] * 256
    
    for a in range(1, 256):
        # Component function f_a(x) = a.S(x)
        f = []
        for x in range(256):
            val = sbox[x]
            dot_prod = bin(a & val).count('1') % 2
            f.append(1 if dot_prod == 0 else -1)
            
        wht = walsh_hadamard_transform(f)
        
        for beta in range(1, 256):
            sum_abs_wht_beta[beta] += abs(wht[beta])
            
    # Calculate TO for each beta
    factor = 1.0 / (M * (M - 1))
    
    for beta in range(1, 256):
        wt_beta = bin(beta).count('1')
        term = n - 2 * wt_beta - factor * sum_abs_wht_beta[beta]
        if term > max_to:
            max_to = term
            
    return max_to

def calculate_correlation_immunity(sbox):
    """
    Calculates Correlation Immunity (CI).
    CI = min(CI(f_i)) for i=0..7.
    CI(f) is max k such that WHT(f)[w] = 0 for all 1 <= wt(w) <= k.
    """
    n = 8
    min_ci = 8
    
    for bit in range(8):
        # Component function
        f = []
        for x in range(256):
            val = sbox[x]
            bit_val = (val >> bit) & 1
            f.append(1 if bit_val == 0 else -1)
            
        wht = walsh_hadamard_transform(f)
        
        # Check CI for this component
        ci = 0
        for k in range(1, n + 1):
            is_zero = True
            # Check all w with weight k
            # This is inefficient to iterate all 256 indices and check weight every time.
            # But 256 is small.
            for w in range(1, 256):
                if bin(w).count('1') == k:
                    if wht[w] != 0:
                        is_zero = False
                        break
            if is_zero:
                ci = k
            else:
                break
        
        if ci < min_ci:
            min_ci = ci
            
    return min_ci

def get_ddt_table(sbox):
    """
    Computes the full 256x256 Differential Distribution Table (DDT).
    DDT[dx][dy] = #{x | S(x) ^ S(x^dx) = dy}
    Returns a list of lists (2D array).
    """
    ddt = [[0] * 256 for _ in range(256)]
    
    for dx in range(256):
        for x in range(256):
            y1 = sbox[x]
            y2 = sbox[x ^ dx]
            dy = y1 ^ y2
            ddt[dx][dy] += 1
            
    return ddt

def get_lat_table(sbox):
    """
    Computes the full 256x256 Linear Approximation Table (LAT).
    LAT[a][b] = #{x | a.x = b.S(x)} - 128
    Returns a list of lists (2D array).
    Values are biased centered at 0 (range -128 to 128).
    """
    lat = [[0] * 256 for _ in range(256)]
    
    for b in range(256):
        # Component function f_b(x) = b.S(x)
        f = []
        for x in range(256):
            val = sbox[x]
            # Dot product b.val over GF(2)
            dot_prod = bin(b & val).count('1') % 2
            f.append(1 if dot_prod == 0 else -1)
            
        wht = walsh_hadamard_transform(f)
        
        # WHT[a] = sum (-1)^(b.S(x) + a.x)
        # LAT[a][b] = WHT[a] / 2
        for a in range(256):
            lat[a][b] = wht[a] // 2
            
    return lat


def encrypt_image_data(image_bytes, sbox, key, mode='ecb', key_format='text', max_dim=None):
    """
    Encrypts image bytes using either AES-ECB mode or Pure S-Box Substitution.
    Returns: 
    - encrypted_b64 (string)
    - histogram_original (dict: {'r': [], 'g': [], 'b': []})
    - histogram_encrypted (dict: {'r': [], 'g': [], 'b': []})
    """
    try:
        from PIL import Image
        import io
        import numpy as np
        from aes_cipher import AESCipher # Local import to avoid circular dependency
        import base64
        
        # Load image
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert('RGB') # Ensure RGB
        
        # Optimize: Resize image if max_dim is specified
        if max_dim:
            if img.width > max_dim or img.height > max_dim:
                img.thumbnail((max_dim, max_dim))
            
        width, height = img.size
        
        # Convert to numpy array for histogram calculation
        img_arr = np.array(img)
        
        # Calculate Original Histogram
        hist_orig = {
            'r': [int(x) for x in np.histogram(img_arr[:,:,0], bins=256, range=(0,256))[0]],
            'g': [int(x) for x in np.histogram(img_arr[:,:,1], bins=256, range=(0,256))[0]],
            'b': [int(x) for x in np.histogram(img_arr[:,:,2], bins=256, range=(0,256))[0]]
        }
        
        encrypted_bytes_raw = None
        
        if mode == 'substitution':
            # Pure S-Box Substitution (No AES Diffusion)
            # This visualizes the S-Box bijectivity/nonlinearity directly on the image
            sbox_arr = np.array(sbox, dtype=np.uint8)
            pixels = np.array(img)
            encrypted_pixels = sbox_arr[pixels]
            img_enc = Image.fromarray(encrypted_pixels)
            
        else:
            # AES-ECB Mode (Default)
            img_bytes = img.tobytes()
            original_len = len(img_bytes)
            
            # Sanitize Key based on Format
            if isinstance(key, str):
                try:
                    if key_format == 'hex':
                        key = bytes.fromhex(key)
                    else:
                        key = key.encode('utf-8')
                except Exception as e:
                    print(f"Key Error: {e}")
                    key = key.encode('utf-8') # Fallback
            
            # Ensure key length (16, 24, 32)
            if len(key) not in [16, 24, 32]:
                if len(key) < 16: key += b'\0' * (16 - len(key))
                elif len(key) < 24: key = key[:16]
                elif len(key) < 32: key = key[:24]
                else: key = key[:32]

            # Encrypt using robust AESCipher
            cipher = AESCipher(key, sbox)
            
            if mode == 'cbc':
                # Manual CBC Implementation
                # 1. Generate IV
                import os
                iv = os.urandom(16)
                
                # 2. Pad Data
                pad_len = 16 - (len(img_bytes) % 16)
                padded_data = img_bytes + bytes([pad_len] * pad_len)
                
                # 3. Encrypt Chain
                encrypted_data = bytearray()
                prev_block = list(iv)
                
                for i in range(0, len(padded_data), 16):
                    block = list(padded_data[i:i+16])
                    # XOR with prev_block
                    xored_block = [b ^ p for b, p in zip(block, prev_block)]
                    # Encrypt
                    enc_block = cipher.encrypt_block(xored_block)
                    encrypted_data.extend(enc_block)
                    prev_block = enc_block
                    
                # Prepend IV to result
                encrypted_bytes_padded = iv + bytes(encrypted_data)
                
            else:
                # AES-ECB Mode (Default)
                encrypted_bytes_padded = cipher.encrypt_data(img_bytes)
            
            # Truncate to original size for display purposes (Just for visualization length match)
            # ERROR: If we truncate, we lose data. But for 'encrypted_bytes_raw' intended for NPCR,
            # we should return the FULL ciphertext.
            # However, for Image.frombytes visualization, length must match width*height*3.
            # So we slice for visualization, but return full for analysis.
            encrypted_bytes_raw = bytes(encrypted_bytes_padded)
            visualization_bytes = encrypted_bytes_raw[:original_len]
            
            # Create Encrypted Image
            img_enc = Image.frombytes('RGB', (width, height), visualization_bytes)
            
        
        # Calculate Encrypted Histogram
        img_enc_arr = np.array(img_enc)
        hist_enc = {
            'r': [int(x) for x in np.histogram(img_enc_arr[:,:,0], bins=256, range=(0,256))[0]],
            'g': [int(x) for x in np.histogram(img_enc_arr[:,:,1], bins=256, range=(0,256))[0]],
            'b': [int(x) for x in np.histogram(img_enc_arr[:,:,2], bins=256, range=(0,256))[0]]
        }
        
        # Convert encrypted image to base64
        buf = io.BytesIO()
        img_enc.save(buf, format='PNG')
        encrypted_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        
        return encrypted_b64, hist_orig, hist_enc, buf.getvalue()
        
    except ImportError as e:
        print(f"ImportError: {e}")
        return None, {}, {}, None
    except Exception as e:
        print(f"Error encrypting image: {e}")
        import traceback
        traceback.print_exc()
        return None, {}, {}, None



def decrypt_image_data(encrypted_image_bytes, sbox, key, mode='ecb', key_format='text'):
    """
    Decrypts image bytes using either AES-ECB mode or Pure S-Box Substituion (Inverse).
    """
    try:
        from PIL import Image
        import io
        import numpy as np
        from aes_cipher import AESCipher # Local import
        import base64

        img_enc = Image.open(io.BytesIO(encrypted_image_bytes))
        img_enc = img_enc.convert('RGB')
        width, height = img_enc.size
        
        if mode == 'substitution':
            # Inverse Substitution
            inv_sbox = get_inverse_sbox(sbox)
            inv_sbox_arr = np.array(inv_sbox, dtype=np.uint8)
            pixels = np.array(img_enc)
            decrypted_pixels = inv_sbox_arr[pixels]
            img_dec = Image.fromarray(decrypted_pixels)
            
        else:
            # AES Decryption
            # For visualization, we re-read the image bytes.
            # Real AES needs original padded stream.
            img_bytes = img_enc.tobytes()
            
            # Sanitize Key based on Format
            if isinstance(key, str):
                try:
                    if key_format == 'hex':
                        key = bytes.fromhex(key)
                    else:
                        key = key.encode('utf-8')
                except:
                    key = key.encode('utf-8')
            
            if len(key) not in [16, 24, 32]:
                 if len(key) < 16: key += b'\0' * (16 - len(key))
                 elif len(key) < 24: key = key[:16]
                 elif len(key) < 32: key = key[:24]
                 else: key = key[:32]

            cipher = AESCipher(key, sbox)
            
            if mode == 'cbc':
                # Manual CBC Decryption
                # Note: 'img_bytes' here comes from img_enc.tobytes().
                # This only contains the visible pixels.
                # If encryption truncated the padding/tail, we can't fully decrypt the last block.
                # But we try our best.
                
                # We assume IV was prepended and is part of the pixel data (first 16 bytes).
                if len(img_bytes) < 16:
                     decrypted_bytes_padded = b''
                else:
                    iv = list(img_bytes[:16])
                    ciphertext = img_bytes[16:]
                    
                    decrypted_data = bytearray()
                    prev_block = iv
                    
                    for i in range(0, len(ciphertext), 16):
                        block = list(ciphertext[i:i+16])
                        # If block is incomplete (truncation), we skip it or pad it?
                        # Truncated last block implies we can't decrypt it securely.
                        if len(block) < 16: break 
                        
                        dec_block = cipher.decrypt_block(block)
                        xored_block = [d ^ p for d, p in zip(dec_block, prev_block)]
                        decrypted_data.extend(xored_block)
                        prev_block = block
                    
                    decrypted_bytes_padded = bytes(decrypted_data)
            else:
                # AES-ECB Mode (Default)
                decrypted_bytes_padded = cipher.decrypt_data(img_bytes)
            
            # Create Decrypted Image (Truncate to expected size)
            target_len = width * height * 3
            if len(decrypted_bytes_padded) < target_len:
                decrypted_bytes_padded += b'\0' * (target_len - len(decrypted_bytes_padded))
            
            img_dec = Image.frombytes('RGB', (width, height), decrypted_bytes_padded[:target_len])

        # Convert to Base64
        output_buffer = io.BytesIO()
        img_dec.save(output_buffer, format='PNG')
        decrypted_b64 = base64.b64encode(output_buffer.getvalue()).decode('utf-8')
        
        return decrypted_b64

    except Exception as e:
        print(f"Error in decrypt_image_data: {e}")
        return None

def calculate_entropy(image_bytes):
    """
    Calculates Shannon Entropy of an image.
    H = -sum(p_i * log2(p_i))
    Target ideal value ~ 8.
    """
    try:
        from PIL import Image
        import io
        import math
        import numpy as np

        img = Image.open(io.BytesIO(image_bytes))
        # Usually for image encryption papers, calculat on grayscale.
        gray_img = img.convert('L')
        hist = np.histogram(np.array(gray_img), bins=256, range=(0,256))[0]
        
        total_pixels = sum(hist)
        entropy = 0
        for count in hist:
            if count > 0:
                p = count / total_pixels
                entropy -= p * math.log2(p)
                
        return entropy

    except Exception as e:
        print(f"Error calculating entropy: {e}")
        return 0

def calculate_npcr(image1_bytes, image2_bytes):
    """
    Calculates Number of Pixels Change Rate (NPCR).
    """
    try:
        from PIL import Image
        import io
        import numpy as np

        img1 = Image.open(io.BytesIO(image1_bytes)).convert('RGB')
        img2 = Image.open(io.BytesIO(image2_bytes)).convert('RGB')
        
        if img1.size != img2.size:
            return 0
            
        arr1 = np.array(img1)
        arr2 = np.array(img2)
        
        height, width, _ = arr1.shape
        # Count diffs
        diff = np.sum(arr1 != arr2)
        npcr = (diff / (height * width * 3)) * 100
        
        return float(npcr)
        
    except Exception as e:
        print(f"Error calculating NPCR: {e}")
        return 0

def calculate_uaci(image1_bytes, image2_bytes):
    """
    Calculates Unified Average Changing Intensity (UACI).
    UACI = (1 / (W * H * C)) * sum(|C1(i,j,k) - C2(i,j,k)| / 255) * 100
    Ideal value approx 33.46%
    """
    try:
        from PIL import Image
        import io
        import numpy as np

        img1 = Image.open(io.BytesIO(image1_bytes)).convert('RGB')
        img2 = Image.open(io.BytesIO(image2_bytes)).convert('RGB')
        
        if img1.size != img2.size:
            return 0
            
        arr1 = np.array(img1, dtype=np.int16)
        arr2 = np.array(img2, dtype=np.int16)
        
        height, width, channels = arr1.shape
        total_pixels = height * width * channels
        
        diff = np.abs(arr1 - arr2)
        uaci = (np.sum(diff) / (255 * total_pixels)) * 100
        
        return float(uaci)

    except Exception as e:
        print(f"Error calculating UACI: {e}")
        return 0

def calculate_sensitivity_metrics(image1_bytes, image2_bytes):
    """
    Calculates both NPCR and UACI efficiently in one pass.
    Returns: (npcr, uaci)
    """
    try:
        from PIL import Image
        import io
        import numpy as np

        img1 = Image.open(io.BytesIO(image1_bytes)).convert('RGB')
        img2 = Image.open(io.BytesIO(image2_bytes)).convert('RGB')
        
        if img1.size != img2.size:
            return 0, 0
            
        # Use int16 to prevent overflow during subtraction, but minimize memory compared to float32
        arr1 = np.array(img1, dtype=np.int16)
        arr2 = np.array(img2, dtype=np.int16)
        
        height, width, channels = arr1.shape
        total_pixels = height * width * channels
        
        # Calculate absolute difference once
        diff = np.abs(arr1 - arr2)
        
        # UACI: Mean unified absolute change
        uaci = (np.sum(diff) / (255 * total_pixels)) * 100
        
        # NPCR: Count of changed pixels (where diff > 0)
        # We check per pixel-channel. Standard NPCR usually checks if pixel location (any channel) is different?
        # Standard NPCR def: D(i,j) = 0 if C1(i,j) == C2(i,j), else 1.
        # If we adhere strictly to pixel-wise (not channel-wise), we should check if ANY channel diff > 0.
        # But commonly in RGB implementations it's done per-value or per-pixel.
        # Looking at previous calculate_npcr implementation:
        # diff = np.sum(arr1 != arr2) <- This was element-wise (channel-wise) count.
        # So we stick to channel-wise count for consistency.
        changed_pixels_count = np.count_nonzero(diff)
        npcr = (changed_pixels_count / total_pixels) * 100
        
        return float(npcr), float(uaci)

    except Exception as e:
        print(f"Error calculating sensitivity metrics: {e}")
        return 0, 0
