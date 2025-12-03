import copy

class AESCipher:
    def __init__(self, key, sbox=None):
        self.key = key
        # Default AES S-Box if none provided
        if sbox is None:
            self.sbox = [
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
        else:
            self.sbox = sbox

        # Calculate Inverse S-Box
        self.inv_sbox = [0] * 256
        for i, val in enumerate(self.sbox):
            self.inv_sbox[val] = i

        # Rcon (Round Constants)
        self.Rcon = [
            0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36
        ]

        self.Nb = 4  # Block size in words (32-bit)
        self.Nk = len(key) // 4  # Key length in words
        self.Nr = self.Nk + 6  # Number of rounds

        self.w = self.key_expansion()

    def sub_word(self, word):
        return (self.sbox[(word >> 24) & 0xFF] << 24) | \
               (self.sbox[(word >> 16) & 0xFF] << 16) | \
               (self.sbox[(word >> 8) & 0xFF] << 8) | \
               (self.sbox[word & 0xFF])

    def rot_word(self, word):
        return ((word << 8) & 0xFFFFFFFF) | (word >> 24)

    def key_expansion(self):
        w = [0] * (self.Nb * (self.Nr + 1))
        for i in range(self.Nk):
            w[i] = (self.key[4*i] << 24) | (self.key[4*i+1] << 16) | \
                   (self.key[4*i+2] << 8) | (self.key[4*i+3])

        for i in range(self.Nk, self.Nb * (self.Nr + 1)):
            temp = w[i-1]
            if i % self.Nk == 0:
                temp = self.sub_word(self.rot_word(temp)) ^ (self.Rcon[i // self.Nk] << 24)
            elif self.Nk > 6 and i % self.Nk == 4:
                temp = self.sub_word(temp)
            w[i] = w[i-self.Nk] ^ temp
        return w

    def get_round_key(self, round_num):
        key_schedule = [[0] * self.Nb for _ in range(4)]
        for c in range(self.Nb):
            word = self.w[round_num * self.Nb + c]
            key_schedule[0][c] = (word >> 24) & 0xFF
            key_schedule[1][c] = (word >> 16) & 0xFF
            key_schedule[2][c] = (word >> 8) & 0xFF
            key_schedule[3][c] = word & 0xFF
        return key_schedule

    def add_round_key(self, state, round_num):
        for c in range(self.Nb):
            word = self.w[round_num * self.Nb + c]
            state[0][c] ^= (word >> 24) & 0xFF
            state[1][c] ^= (word >> 16) & 0xFF
            state[2][c] ^= (word >> 8) & 0xFF
            state[3][c] ^= word & 0xFF
        return state

    def sub_bytes(self, state):
        for r in range(4):
            for c in range(self.Nb):
                state[r][c] = self.sbox[state[r][c]]
        return state

    def shift_rows(self, state):
        # Row 1: shift left 1
        state[1][0], state[1][1], state[1][2], state[1][3] = \
            state[1][1], state[1][2], state[1][3], state[1][0]
        # Row 2: shift left 2
        state[2][0], state[2][1], state[2][2], state[2][3] = \
            state[2][2], state[2][3], state[2][0], state[2][1]
        # Row 3: shift left 3
        state[3][0], state[3][1], state[3][2], state[3][3] = \
            state[3][3], state[3][0], state[3][1], state[3][2]
        return state

    def gmul(self, a, b):
        p = 0
        for _ in range(8):
            if b & 1:
                p ^= a
            hi_bit_set = a & 0x80
            a = (a << 1) & 0xFF
            if hi_bit_set:
                a ^= 0x1b
            b >>= 1
        return p

    def mix_columns(self, state):
        for c in range(self.Nb):
            s0 = state[0][c]
            s1 = state[1][c]
            s2 = state[2][c]
            s3 = state[3][c]

            state[0][c] = self.gmul(0x02, s0) ^ self.gmul(0x03, s1) ^ s2 ^ s3
            state[1][c] = s0 ^ self.gmul(0x02, s1) ^ self.gmul(0x03, s2) ^ s3
            state[2][c] = s0 ^ s1 ^ self.gmul(0x02, s2) ^ self.gmul(0x03, s3)
            state[3][c] = self.gmul(0x03, s0) ^ s1 ^ s2 ^ self.gmul(0x02, s3)
        return state

    def encrypt_block(self, input_block, trace=False):
        trace_data = []
        
        state = [[0] * self.Nb for _ in range(4)]
        for r in range(4):
            for c in range(self.Nb):
                state[r][c] = input_block[r + 4*c]

        if trace:
            trace_data.append({'round': 'Init', 'step': 'Input', 'state': copy.deepcopy(state), 'key': None})

        state = self.add_round_key(state, 0)
        
        if trace:
            # Get Round Key 0
            rk = self.get_round_key(0)
            trace_data.append({'round': 0, 'step': 'AddRoundKey', 'state': copy.deepcopy(state), 'key': rk})

        for round_num in range(1, self.Nr):
            state = self.sub_bytes(state)
            if trace: trace_data.append({'round': round_num, 'step': 'SubBytes', 'state': copy.deepcopy(state), 'key': None})
            
            state = self.shift_rows(state)
            if trace: trace_data.append({'round': round_num, 'step': 'ShiftRows', 'state': copy.deepcopy(state), 'key': None})
            
            state = self.mix_columns(state)
            if trace: trace_data.append({'round': round_num, 'step': 'MixColumns', 'state': copy.deepcopy(state), 'key': None})
            
            state = self.add_round_key(state, round_num)
            if trace: 
                rk = self.get_round_key(round_num)
                trace_data.append({'round': round_num, 'step': 'AddRoundKey', 'state': copy.deepcopy(state), 'key': rk})

        state = self.sub_bytes(state)
        if trace: trace_data.append({'round': self.Nr, 'step': 'SubBytes', 'state': copy.deepcopy(state), 'key': None})
        
        state = self.shift_rows(state)
        if trace: trace_data.append({'round': self.Nr, 'step': 'ShiftRows', 'state': copy.deepcopy(state), 'key': None})
        
        state = self.add_round_key(state, self.Nr)
        if trace: 
            rk = self.get_round_key(self.Nr)
            trace_data.append({'round': self.Nr, 'step': 'AddRoundKey', 'state': copy.deepcopy(state), 'key': rk})

        output = [0] * 16
        for r in range(4):
            for c in range(self.Nb):
                output[r + 4*c] = state[r][c]
        
        if trace:
            return output, trace_data
        return output

    def encrypt_data(self, data):
        # Padding (PKCS7)
        pad_len = 16 - (len(data) % 16)
        data += bytes([pad_len] * pad_len)

        encrypted_data = bytearray()
        for i in range(0, len(data), 16):
            block = list(data[i:i+16])
            encrypted_block = self.encrypt_block(block)
            encrypted_data.extend(encrypted_block)
        
        return bytes(encrypted_data)

    def inv_sub_bytes(self, state):
        for r in range(4):
            for c in range(self.Nb):
                state[r][c] = self.inv_sbox[state[r][c]]
        return state

    def inv_shift_rows(self, state):
        # Row 1: shift right 1
        state[1][0], state[1][1], state[1][2], state[1][3] = \
            state[1][3], state[1][0], state[1][1], state[1][2]
        # Row 2: shift right 2
        state[2][0], state[2][1], state[2][2], state[2][3] = \
            state[2][2], state[2][3], state[2][0], state[2][1]
        # Row 3: shift right 3
        state[3][0], state[3][1], state[3][2], state[3][3] = \
            state[3][1], state[3][2], state[3][3], state[3][0]
        return state

    def inv_mix_columns(self, state):
        for c in range(self.Nb):
            s0 = state[0][c]
            s1 = state[1][c]
            s2 = state[2][c]
            s3 = state[3][c]

            state[0][c] = self.gmul(0x0e, s0) ^ self.gmul(0x0b, s1) ^ self.gmul(0x0d, s2) ^ self.gmul(0x09, s3)
            state[1][c] = self.gmul(0x09, s0) ^ self.gmul(0x0e, s1) ^ self.gmul(0x0b, s2) ^ self.gmul(0x0d, s3)
            state[2][c] = self.gmul(0x0d, s0) ^ self.gmul(0x09, s1) ^ self.gmul(0x0e, s2) ^ self.gmul(0x0b, s3)
            state[3][c] = self.gmul(0x0b, s0) ^ self.gmul(0x0d, s1) ^ self.gmul(0x09, s2) ^ self.gmul(0x0e, s3)
        return state

    def decrypt_block(self, input_block):
        state = [[0] * self.Nb for _ in range(4)]
        for r in range(4):
            for c in range(self.Nb):
                state[r][c] = input_block[r + 4*c]

        # Inverse of Final Round (Encryption: Sub -> Shift -> AddKey)
        # Decryption: AddKey -> InvShift -> InvSub
        state = self.add_round_key(state, self.Nr)
        state = self.inv_shift_rows(state)
        state = self.inv_sub_bytes(state)

        # Inverse of Main Rounds (Encryption: Sub -> Shift -> Mix -> AddKey)
        # Decryption: AddKey -> InvMix -> InvShift -> InvSub
        for round_num in range(self.Nr - 1, 0, -1):
            state = self.add_round_key(state, round_num)
            state = self.inv_mix_columns(state)
            state = self.inv_shift_rows(state)
            state = self.inv_sub_bytes(state)

        # Inverse of Initial Round (Encryption: AddKey)
        # Decryption: AddKey
        state = self.add_round_key(state, 0)

        output = [0] * 16
        for r in range(4):
            for c in range(self.Nb):
                output[r + 4*c] = state[r][c]
        
        return output

    def decrypt_data(self, data):
        decrypted_data = bytearray()
        for i in range(0, len(data), 16):
            block = list(data[i:i+16])
            decrypted_block = self.decrypt_block(block)
            decrypted_data.extend(decrypted_block)
        
        # Unpadding (PKCS7)
        if len(decrypted_data) > 0:
            pad_len = decrypted_data[-1]
            if 0 < pad_len <= 16:
                # Check if padding is valid
                padding = decrypted_data[-pad_len:]
                if all(p == pad_len for p in padding):
                    return bytes(decrypted_data[:-pad_len])
        
        return bytes(decrypted_data)
