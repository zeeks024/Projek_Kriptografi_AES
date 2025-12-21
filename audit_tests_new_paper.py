import unittest
import numpy as np
import io
from PIL import Image
from sbox_analyzer import _gf_multiply, _gf_inverse, calculate_entropy, calculate_npcr, decrypt_image_data, encrypt_image_data

class TestNewPaperFeatures(unittest.TestCase):
    def create_test_image_bytes(self, size=(10, 10), color=(0, 0, 0)):
        img = Image.new('RGB', size, color=color)
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        return buf.getvalue()

    def test_gf_multiply_new_poly(self):
        # 0x1F3 test
        # 0x80 * 2 = 0x100 -> 0x100 ^ 0x1F3 = 0xF3
        res = _gf_multiply(0x80, 2, 0x1F3)
        self.assertEqual(res, 0xF3, f"Expected 0xF3, got {hex(res)}")
        
        # Identity
        self.assertEqual(_gf_multiply(123, 1, 0x1F3), 123)
        
        # Zero
        self.assertEqual(_gf_multiply(123, 0, 0x1F3), 0)

    def test_gf_inverse_new_poly(self):
        a = 0x53
        inv = _gf_inverse(a, 0x1F3)
        prod = _gf_multiply(a, inv, 0x1F3)
        self.assertEqual(prod, 1, f"Inverse of 0x53 (got {hex(inv)}) product is {hex(prod)}")
        
        # Self inverse test? 1 is inverse of 1
        self.assertEqual(_gf_inverse(1, 0x1F3), 1)

    def test_entropy(self):
        # Uniform random image
        # Create a large image with random bytes to approximate entropy ~8
        # PIL RGB image.
        # Generating random noise image is hard with 'create_test_image_bytes' since it does uniform color.
        # Let's create one manually.
        arr = np.random.randint(0, 256, (50, 50, 3), dtype=np.uint8)
        img = Image.fromarray(arr)
        buf = io.BytesIO()
        img.save(buf, format='PNG')
        img_bytes = buf.getvalue()
        
        ent = calculate_entropy(img_bytes)
        # Random noise should be high entropy (> 7)
        self.assertGreater(ent, 7.0)

        # Solid color -> 0 entropy
        zero_bytes = self.create_test_image_bytes(color=(0,0,0))
        ent_zero = calculate_entropy(zero_bytes)
        self.assertEqual(ent_zero, 0.0)

    def test_npcr(self):
        # Identical
        img1 = self.create_test_image_bytes(color=(10,10,10))
        img2 = self.create_test_image_bytes(color=(10,10,10))
        self.assertEqual(calculate_npcr(img1, img2), 0.0)

        # Different (White vs Black)
        img3 = self.create_test_image_bytes(color=(255,255,255))
        # Differences in all 3 channels for all pixels
        # NPCR should be 100%
        self.assertEqual(calculate_npcr(img1, img3), 100.0)

    def test_decrypt_image(self):
        import base64
        sbox = list(range(256))
        key = "0102030405060708090a0b0c0d0e0f10"
        
        # Create dummy image
        img_bytes = self.create_test_image_bytes(size=(4, 4), color=(100, 50, 25))
        
        # Encrypt
        _, _, _, enc_bytes = encrypt_image_data(img_bytes, sbox, key, 'ecb')
        
        # Decrypt
        dec_b64 = decrypt_image_data(enc_bytes, sbox, key, 'ecb')
        
        # Decode base64 to get valid PNG bytes
        dec_bytes = base64.b64decode(dec_b64)
        
        # Verify
        # Compare PIL image content since compression might change bytes slightly
        orig_img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
        dec_img = Image.open(io.BytesIO(dec_bytes)).convert('RGB')
        
        diff = calculate_npcr(img_bytes, dec_bytes) 
        # Should be 0 NPCR (Identical)
        self.assertEqual(diff, 0.0, "Decrypted image differs from original")

if __name__ == '__main__':
    unittest.main()
