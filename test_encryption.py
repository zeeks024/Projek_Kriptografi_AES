import requests
import base64
import os

# Configuration
URL = 'http://127.0.0.1:5000/encrypt'
IMAGE_PATH = r'C:/Users/arzak/.gemini/antigravity/brain/cf90ff14-4880-43ee-969a-57150484da59/test_image_for_encryption_1763981259787.png'
OUTPUT_PATH = r'C:/Users/arzak/.gemini/antigravity/brain/cf90ff14-4880-43ee-969a-57150484da59/encrypted_test_image.png'

def test_encryption():
    if not os.path.exists(IMAGE_PATH):
        print(f"Error: Image file not found at {IMAGE_PATH}")
        return

    try:
        with open(IMAGE_PATH, 'rb') as img_file:
            files = {'image': img_file}
            data = {'type': 'sbox44'}
            
            print(f"Sending request to {URL}...")
            response = requests.post(URL, files=files, data=data)
            
            if response.status_code == 200:
                json_resp = response.json()
                if 'encrypted_image' in json_resp:
                    # Extract base64 data
                    b64_data = json_resp['encrypted_image'].split(',')[1]
                    img_data = base64.b64decode(b64_data)
                    
                    with open(OUTPUT_PATH, 'wb') as out_file:
                        out_file.write(img_data)
                    
                    print(f"Encryption successful! Saved to {OUTPUT_PATH}")
                else:
                    print("Error: 'encrypted_image' not in response.")
                    print(json_resp)
            else:
                print(f"Error: Request failed with status {response.status_code}")
                print(response.text)
                
    except Exception as e:
        print(f"Exception occurred: {str(e)}")

if __name__ == '__main__':
    test_encryption()
