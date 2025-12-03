from flask import Flask, render_template, request, jsonify, send_file
from sbox_analyzer import (get_sbox, check_bijective, check_balance, calculate_nonlinearity, 
                           calculate_sac, calculate_bic_nl, calculate_bic_sac, calculate_lap, 
                           calculate_dap, encrypt_image, construct_sbox_from_matrix, 
                           get_construction_steps, AES_SBOX, SBOX_44)
from aes_cipher import AESCipher
import base64
import pandas as pd
import io
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

def get_key_from_request(req):
    key_input = req.form.get('key')
    if not key_input:
        return b'This is a key123' # Default key
    
    # Encode to bytes and pad/truncate to 16 bytes
    key_bytes = key_input.encode('utf-8')
    if len(key_bytes) < 16:
        key_bytes += b'\0' * (16 - len(key_bytes))
    else:
        key_bytes = key_bytes[:16]
    return key_bytes

def generate_excel_report(trace_data, key, sbox):
    wb = Workbook()
    ws = wb.active
    ws.title = "Encryption Trace"
    
    # Headers
    headers = ["Round", "Step", "State (Hex)", "Round Key (Hex)"]
    ws.append(headers)
    
    # Style headers
    header_font = Font(bold=True, color="FFFFFF")
    header_fill = PatternFill(start_color="4F81BD", end_color="4F81BD", fill_type="solid")
    for cell in ws[1]:
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal="center")
        
    # Data
    for item in trace_data:
        # Flatten state (Column-major order for AES state)
        state_flat = []
        for c in range(4):
            for r in range(4):
                state_flat.append(item['state'][r][c])
        state_hex = ' '.join([f'{x:02X}' for x in state_flat])
        
        key_hex = ''
        if item['key']:
            key_flat = []
            for c in range(4):
                for r in range(4):
                    key_flat.append(item['key'][r][c])
            key_hex = ' '.join([f'{x:02X}' for x in key_flat])
            
        ws.append([str(item['round']), item['step'], state_hex, key_hex])
        
    # Adjust widths
    ws.column_dimensions['A'].width = 10
    ws.column_dimensions['B'].width = 20
    ws.column_dimensions['C'].width = 50
    ws.column_dimensions['D'].width = 50
    
    return wb

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        sbox_type = data.get('type')
        custom_sbox_str = data.get('custom_sbox')
        
        sbox = []
        if sbox_type == 'custom':
            try:
                # Handle various input formats (comma separated, space separated, hex, int)
                cleaned_str = custom_sbox_str.replace('\n', ' ').replace(',', ' ')
                parts = cleaned_str.split()
                for part in parts:
                    if part.startswith('0x') or part.startswith('0X'):
                        sbox.append(int(part, 16))
                    else:
                        try:
                            sbox.append(int(part))
                        except ValueError:
                             # Try hex if int fails (e.g. "A5")
                             sbox.append(int(part, 16))
                
                if len(sbox) != 256:
                    return jsonify({'error': f'Invalid S-Box length: {len(sbox)}. Must be 256.'}), 400
                
                # Validate values are 0-255
                if any(x < 0 or x > 255 for x in sbox):
                     return jsonify({'error': 'S-Box values must be between 0 and 255.'}), 400
                     
            except Exception as e:
                return jsonify({'error': f'Error parsing custom S-Box: {str(e)}'}), 400
        else:
            sbox = get_sbox(sbox_type)
            if sbox is None:
                 return jsonify({'error': 'Invalid S-Box type.'}), 400

        # Perform Analysis
        is_bijective = check_bijective(sbox)
        balance_results = check_balance(sbox)
        nl = calculate_nonlinearity(sbox)
        sac = calculate_sac(sbox)
        bic_nl = calculate_bic_nl(sbox)
        bic_sac = calculate_bic_sac(sbox)
        lap = calculate_lap(sbox)
        dap = calculate_dap(sbox)
        
        # Format S-Box for display (Hex)
        sbox_hex = [f'{x:02X}' for x in sbox]
        
        return jsonify({
            'sbox': sbox_hex,
            'is_bijective': is_bijective,
            'balance_results': balance_results,
            'metrics': {
                'nl': nl,
                'sac': sac,
                'bic_nl': bic_nl,
                'bic_sac': bic_sac,
                'lap': lap,
                'dap': dap
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/encrypt', methods=['POST'])
def encrypt():
    try:
        sbox_type = request.form.get('type')
        custom_sbox_str = request.form.get('custom_sbox')
        image_file = request.files.get('image')
        
        # Removed initial check to allow text input later
            
        sbox = []
        if sbox_type == 'custom':
            # Same parsing logic as analyze (should refactor, but keeping simple for now)
            try:
                cleaned_str = custom_sbox_str.replace('\n', ' ').replace(',', ' ')
                parts = cleaned_str.split()
                for part in parts:
                    if part.startswith('0x') or part.startswith('0X'):
                        sbox.append(int(part, 16))
                    else:
                        try:
                            sbox.append(int(part))
                        except ValueError:
                             sbox.append(int(part, 16))
                if len(sbox) != 256:
                    return jsonify({'error': f'Invalid S-Box length: {len(sbox)}. Must be 256.'}), 400
            except Exception as e:
                return jsonify({'error': f'Error parsing custom S-Box: {str(e)}'}), 400
        else:
            sbox = get_sbox(sbox_type)
            if sbox is None:
                 return jsonify({'error': 'Invalid S-Box type.'}), 400
                 
        # Encrypt
        print(f"DEBUG: Form Data: {request.form}")
        print(f"DEBUG: Files: {request.files}")
        text_input = request.form.get('text_input')
        image_file = request.files.get('image')
        
        # Get Key
        key = get_key_from_request(request)
        cipher = AESCipher(key, sbox)

        if text_input:
            # Text Encryption
            data_bytes = text_input.encode('utf-8')
            encrypted_bytes = cipher.encrypt_data(data_bytes)
            # Return hex string
            encrypted_hex = encrypted_bytes.hex().upper()
            
            # Trace the first block for visualization
            block = list(data_bytes[:16])
            if len(block) < 16:
                block += [0] * (16 - len(block))
            _, trace_data = cipher.encrypt_block(block, trace=True)
            
            return jsonify({
                'encrypted_text': encrypted_hex,
                'trace_data': trace_data
            })
            
        elif image_file:
            # Image Encryption (Legacy support if needed, or remove)
            image_bytes = image_file.read()
            encrypted_bytes = cipher.encrypt_data(image_bytes)
            encrypted_b64 = base64.b64encode(encrypted_bytes).decode('utf-8')
            return jsonify({
                'encrypted_image': f'data:image/png;base64,{encrypted_b64}'
            })
        else:
             return jsonify({'error': 'No input provided (text or image).'}), 400
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/decrypt', methods=['POST'])
def decrypt():
    try:
        sbox_type = request.form.get('type')
        custom_sbox_str = request.form.get('custom_sbox')
        
        sbox = []
        if sbox_type == 'custom':
            try:
                cleaned_str = custom_sbox_str.replace('\n', ' ').replace(',', ' ')
                parts = cleaned_str.split()
                for part in parts:
                    if part.startswith('0x') or part.startswith('0X'):
                        sbox.append(int(part, 16))
                    else:
                        try:
                            sbox.append(int(part))
                        except ValueError:
                             sbox.append(int(part, 16))
                if len(sbox) != 256:
                    return jsonify({'error': f'Invalid S-Box length: {len(sbox)}. Must be 256.'}), 400
            except Exception as e:
                return jsonify({'error': f'Error parsing custom S-Box: {str(e)}'}), 400
        else:
            sbox = get_sbox(sbox_type)
            if sbox is None:
                 return jsonify({'error': 'Invalid S-Box type.'}), 400
                 
        # Decrypt
        ciphertext_hex = request.form.get('ciphertext_input')
        if not ciphertext_hex:
             return jsonify({'error': 'No ciphertext provided.'}), 400
             
        try:
            ciphertext_bytes = bytes.fromhex(ciphertext_hex)
        except ValueError:
            return jsonify({'error': 'Invalid hex string.'}), 400
            
        # Get Key
        key = get_key_from_request(request)
        cipher = AESCipher(key, sbox)
        
        decrypted_bytes = cipher.decrypt_data(ciphertext_bytes)
        
        try:
            decrypted_text = decrypted_bytes.decode('utf-8')
        except UnicodeDecodeError:
            # If not valid utf-8, return hex or base64 representation of decrypted bytes?
            # Or just return as string with replacement chars
            decrypted_text = decrypted_bytes.decode('utf-8', errors='replace')
            
        return jsonify({
            'decrypted_text': decrypted_text
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/encrypt_detailed', methods=['POST'])
def encrypt_detailed():
    try:
        sbox_type = request.form.get('type')
        custom_sbox_str = request.form.get('custom_sbox')
        image_file = request.files.get('image')
        
        # Removed initial check to allow text input later
            
        sbox = []
        if sbox_type == 'custom':
            # Same parsing logic
            try:
                cleaned_str = custom_sbox_str.replace('\n', ' ').replace(',', ' ')
                parts = cleaned_str.split()
                for part in parts:
                    if part.startswith('0x') or part.startswith('0X'):
                        sbox.append(int(part, 16))
                    else:
                        try:
                            sbox.append(int(part))
                        except ValueError:
                             sbox.append(int(part, 16))
                if len(sbox) != 256:
                    return jsonify({'error': f'Invalid S-Box length: {len(sbox)}. Must be 256.'}), 400
            except Exception as e:
                return jsonify({'error': f'Error parsing custom S-Box: {str(e)}'}), 400
        else:
            sbox = get_sbox(sbox_type)
            if sbox is None:
                 return jsonify({'error': 'Invalid S-Box type.'}), 400
                 
        # Read input
        text_input = request.form.get('text_input')
        image_file = request.files.get('image')
        
        data_bytes = b''
        if text_input:
            data_bytes = text_input.encode('utf-8')
        elif image_file:
            data_bytes = image_file.read()
        else:
             return jsonify({'error': 'No input provided.'}), 400
        
        # Get Key
        key = get_key_from_request(request)
        
        cipher = AESCipher(key, sbox)
        
        # Encrypt only the first block for tracing
        # Ensure we have at least 16 bytes
        if len(data_bytes) < 16:
             block = list(data_bytes) + [0] * (16 - len(data_bytes))
        else:
             block = list(data_bytes[:16])
             
        _, trace_data = cipher.encrypt_block(block, trace=True)
        
        # Generate custom Excel report
        wb = generate_excel_report(trace_data, key, sbox)
        
        # Save to BytesIO
        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='aes_detailed_trace.xlsx'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/construct', methods=['POST'])
def construct():
    """
    Construct S-box from affine matrix.
    Expects JSON with:
    - affine_matrix: 8x8 array (list of lists)
    - c_constant: 8-element array (optional, defaults to C_AES)
    - sample_inputs: list of input values to show steps (optional, default: [0, 15, 255])
    """
    try:
        data = request.json
        affine_matrix = data.get('affine_matrix')
        c_constant = data.get('c_constant')
        sample_inputs = data.get('sample_inputs', [0, 15, 255])
        
        if not affine_matrix:
            return jsonify({'error': 'Affine matrix is required.'}), 400
        
        # Validate matrix dimensions
        if len(affine_matrix) != 8:
            return jsonify({'error': 'Affine matrix must have 8 rows.'}), 400
        for row in affine_matrix:
            if len(row) != 8:
                return jsonify({'error': 'Each row must have 8 elements.'}), 400
            if any(val not in [0, 1] for val in row):
                return jsonify({'error': 'Matrix elements must be 0 or 1.'}), 400
        
        # Validate constant if provided
        if c_constant:
            if len(c_constant) != 8:
                return jsonify({'error': 'Constant must have 8 elements.'}), 400
            if any(val not in [0, 1] for val in c_constant):
                return jsonify({'error': 'Constant elements must be 0 or 1.'}), 400
        
        # Construct S-box
        sbox = construct_sbox_from_matrix(affine_matrix, c_constant)
        
        # Test the S-box
        is_bijective = check_bijective(sbox)
        balance_results = check_balance(sbox)
        
        # Get construction steps for sample inputs
        construction_steps = []
        for x in sample_inputs:
            if 0 <= x <= 255:
                steps = get_construction_steps(x, affine_matrix, c_constant)
                construction_steps.append(steps)
        
        # Format S-box for display
        sbox_hex = [f'{x:02X}' for x in sbox]
        
        return jsonify({
            'sbox': sbox_hex,
            'is_bijective': is_bijective,
            'balance_results': balance_results,
            'construction_steps': construction_steps,
            'valid': is_bijective and all(r['is_balanced'] for r in balance_results)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
