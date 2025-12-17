/**
 * Client-Side AES-128 Implementation
 * Designed for The Cryptographic Lab
 * Supports: 
 * - Custom S-Boxes
 * - Per-Round State Tracing (for Avalanche Visualization)
 * - ECB Mode
 */

class AES_Client {
    constructor(key, sBox = null) {
        this.key = this.parseKey(key);
        // Default to Standard AES S-Box if none provided
        this.sBox = sBox || [
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
        ];

        this.rCon = [
            0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36
        ];

        this.expandedKey = this.keyExpansion(this.key);
    }

    parseKey(key) {
        // Can accept standard string or hex string
        if (typeof key === 'string') {
            if (key.length <= 16) {
                // Pad with zeros to 16 bytes
                const padded = key.padEnd(16, '\0');
                const bytes = [];
                for (let i = 0; i < 16; i++) bytes.push(padded.charCodeAt(i));
                return bytes;
            }
        }
        return key; // Assume valid array if not string
    }

    // --- Core Operations ---

    subWord(word) {
        return word.map(b => this.sBox[b]);
    }

    rotWord(word) {
        const c = [...word];
        const temp = c.shift();
        c.push(temp);
        return c;
    }

    keyExpansion(key) {
        const w = new Array(44).fill(0).map(() => new Array(4).fill(0));

        for (let i = 0; i < 4; i++) {
            w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
        }

        for (let i = 4; i < 44; i++) {
            let temp = w[i - 1];
            if (i % 4 === 0) {
                temp = this.subWord(this.rotWord(temp));
                temp[0] = temp[0] ^ this.rCon[i / 4];
            }
            w[i] = w[i - 4].map((b, idx) => b ^ temp[idx]);
        }

        // Convert to linear array for easier round key usage
        const flatKey = [];
        w.forEach(word => flatKey.push(...word));
        return flatKey;
    }

    subBytes(state) {
        for (let i = 0; i < 16; i++) {
            state[i] = this.sBox[state[i]];
        }
        return state;
    }

    shiftRows(state) {
        const temp = [...state];
        // Row 0: No shift
        // Row 1: Shift 1 left
        state[1] = temp[5]; state[5] = temp[9]; state[9] = temp[13]; state[13] = temp[1];
        // Row 2: Shift 2 left
        state[2] = temp[10]; state[6] = temp[14]; state[10] = temp[2]; state[14] = temp[6];
        // Row 3: Shift 3 left
        state[3] = temp[15]; state[7] = temp[3]; state[11] = temp[7]; state[15] = temp[11];
        return state;
    }

    gMul(a, b) {
        let p = 0;
        for (let counter = 0; counter < 8; counter++) {
            if ((b & 1) !== 0) {
                p ^= a;
            }
            const hi_bit_set = (a & 0x80) !== 0;
            a = (a << 1) & 0xFF; // Keep within 8 bits
            if (hi_bit_set) {
                a ^= 0x1b; // AES irreducible polynomial
            }
            b >>= 1;
        }
        return p;
    }

    mixColumns(state) {
        const temp = [...state];
        for (let i = 0; i < 4; i++) { // For each column
            const offset = i * 4;
            const s0 = temp[offset + 0];
            const s1 = temp[offset + 1];
            const s2 = temp[offset + 2];
            const s3 = temp[offset + 3];

            state[offset + 0] = this.gMul(0x02, s0) ^ this.gMul(0x03, s1) ^ s2 ^ s3;
            state[offset + 1] = s0 ^ this.gMul(0x02, s1) ^ this.gMul(0x03, s2) ^ s3;
            state[offset + 2] = s0 ^ s1 ^ this.gMul(0x02, s2) ^ this.gMul(0x03, s3);
            state[offset + 3] = this.gMul(0x03, s0) ^ s1 ^ s2 ^ this.gMul(0x02, s3);
        }
        return state;
    }

    addRoundKey(state, roundKey) {
        for (let i = 0; i < 16; i++) {
            state[i] ^= roundKey[i];
        }
        return state;
    }

    // Main Encryption Function
    encryptBlock(block, trace = false) {
        let state = [...block];
        const roundData = [];

        // Initial Round Key Addition
        const roundKey0 = this.expandedKey.slice(0, 16);
        state = this.addRoundKey(state, roundKey0);

        if (trace) roundData.push({ round: 0, finalState: [...state] });

        // Rounds 1-9
        for (let round = 1; round < 10; round++) {
            const rStart = [...state];

            this.subBytes(state);
            const rSub = [...state];

            this.shiftRows(state);
            const rShift = [...state];

            this.mixColumns(state);
            const rMix = [...state];

            const roundKey = this.expandedKey.slice(round * 16, (round + 1) * 16);
            this.addRoundKey(state, roundKey);
            const rAdd = [...state];

            if (trace) {
                roundData.push({
                    round: round,
                    start: rStart,
                    afterSub: rSub,
                    afterShift: rShift,
                    afterMix: rMix,
                    afterAdd: rAdd,
                    finalState: [...state]
                });
            }
        }

        // Final Round (No MixColumns)
        const roundStart10 = [...state];

        this.subBytes(state);
        const rSub = [...state];

        this.shiftRows(state);
        const rShift = [...state];

        const roundKey10 = this.expandedKey.slice(160, 176);
        this.addRoundKey(state, roundKey10);
        const rAdd = [...state];

        if (trace) {
            roundData.push({
                round: 10,
                start: roundStart10,
                afterSub: rSub,
                afterShift: rShift,
                afterAdd: rAdd,
                finalState: [...state] // Ciphertext
            });
            return {
                ciphertext: state,
                trace: roundData
            };
        }

        return state;
    }

    encryptText(text) {
        // PKCS#7 Padding
        const encoder = new TextEncoder();
        let bytes = Array.from(encoder.encode(text));
        const padding = 16 - (bytes.length % 16);
        for (let i = 0; i < padding; i++) bytes.push(padding);

        const chunks = [];
        for (let i = 0; i < bytes.length; i += 16) {
            chunks.push(bytes.slice(i, i + 16));
        }

        const encryptedBytes = [];
        let fullTrace = null; // Only keep trace for 1st block for visualization bounds

        chunks.forEach((chunk, idx) => {
            const result = this.encryptBlock(chunk, idx === 0); // Trace only first block
            if (idx === 0) fullTrace = result.trace;
            encryptedBytes.push(idx === 0 ? result.ciphertext : result);
        });

        // Handle result structure difference if idx 0 returns obj
        const flatEncrypted = [];
        encryptedBytes.forEach((block, idx) => {
            if (idx === 0 && block.ciphertext) flatEncrypted.push(...block.ciphertext);
            else flatEncrypted.push(...block);
        });

        // Convert to Hex
        return {
            hex: flatEncrypted.map(b => b.toString(16).padStart(2, '0')).join(''),
            trace: fullTrace
        };
    }

    // ==================== DECRYPTION METHODS ====================

    // Generate Inverse S-Box from S-Box
    getInvSBox() {
        if (this.invSBox) return this.invSBox;
        this.invSBox = new Array(256);
        for (let i = 0; i < 256; i++) {
            this.invSBox[this.sBox[i]] = i;
        }
        return this.invSBox;
    }

    invSubBytes(state) {
        const invSBox = this.getInvSBox();
        for (let i = 0; i < 16; i++) {
            state[i] = invSBox[state[i]];
        }
        return state;
    }

    invShiftRows(state) {
        const temp = [...state];
        // Row 0: No shift
        // Row 1: Shift 1 right
        state[1] = temp[13]; state[5] = temp[1]; state[9] = temp[5]; state[13] = temp[9];
        // Row 2: Shift 2 right
        state[2] = temp[10]; state[6] = temp[14]; state[10] = temp[2]; state[14] = temp[6];
        // Row 3: Shift 3 right
        state[3] = temp[7]; state[7] = temp[11]; state[11] = temp[15]; state[15] = temp[3];
        return state;
    }

    invMixColumns(state) {
        const temp = [...state];
        for (let i = 0; i < 4; i++) {
            const offset = i * 4;
            const s0 = temp[offset + 0];
            const s1 = temp[offset + 1];
            const s2 = temp[offset + 2];
            const s3 = temp[offset + 3];

            state[offset + 0] = this.gMul(0x0e, s0) ^ this.gMul(0x0b, s1) ^ this.gMul(0x0d, s2) ^ this.gMul(0x09, s3);
            state[offset + 1] = this.gMul(0x09, s0) ^ this.gMul(0x0e, s1) ^ this.gMul(0x0b, s2) ^ this.gMul(0x0d, s3);
            state[offset + 2] = this.gMul(0x0d, s0) ^ this.gMul(0x09, s1) ^ this.gMul(0x0e, s2) ^ this.gMul(0x0b, s3);
            state[offset + 3] = this.gMul(0x0b, s0) ^ this.gMul(0x0d, s1) ^ this.gMul(0x09, s2) ^ this.gMul(0x0e, s3);
        }
        return state;
    }

    decryptBlock(block) {
        let state = [...block];

        // Initial Round Key Addition (Round 10 key)
        const roundKey10 = this.expandedKey.slice(160, 176);
        state = this.addRoundKey(state, roundKey10);

        // Rounds 9-1 (reverse order)
        for (let round = 9; round >= 1; round--) {
            this.invShiftRows(state);
            this.invSubBytes(state);
            const roundKey = this.expandedKey.slice(round * 16, (round + 1) * 16);
            this.addRoundKey(state, roundKey);
            this.invMixColumns(state);
        }

        // Final Round (Round 0)
        this.invShiftRows(state);
        this.invSubBytes(state);
        const roundKey0 = this.expandedKey.slice(0, 16);
        this.addRoundKey(state, roundKey0);

        return state;
    }

    decryptText(hexString) {
        // Parse hex string to bytes
        const bytes = [];
        for (let i = 0; i < hexString.length; i += 2) {
            bytes.push(parseInt(hexString.substr(i, 2), 16));
        }

        // Decrypt in blocks
        const decryptedBytes = [];
        for (let i = 0; i < bytes.length; i += 16) {
            const block = bytes.slice(i, i + 16);
            const decrypted = this.decryptBlock(block);
            decryptedBytes.push(...decrypted);
        }

        // Remove PKCS#7 padding
        const paddingLength = decryptedBytes[decryptedBytes.length - 1];
        const unpaddedBytes = decryptedBytes.slice(0, decryptedBytes.length - paddingLength);

        // Convert to text
        const decoder = new TextDecoder();
        const text = decoder.decode(new Uint8Array(unpaddedBytes));
        return text;
    }
}

window.AES_Client = AES_Client;
