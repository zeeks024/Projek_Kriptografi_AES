# Analisis & Konstruksi S-Box AES Berbasis Web
Aplikasi ini adalah alat bantu pembelajaran dan analisis untuk algoritma kriptografi AES (Advanced Encryption Standard), dengan fokus khusus pada komponen S-Box.

## Fitur
- **Analisis S-Box**: Menghitung metrik kriptografi (Nonlinearity, SAC, BIC, dll).
- **Konstruktor S-Box**: Membuat S-Box kustom menggunakan transformasi affine.
- **Enkripsi & Dekripsi AES**: Simulasi AES-128 dengan S-Box standar atau kustom.
- **Laporan Detail**: Download trace enkripsi langkah-demi-langkah dalam format Excel.

## Cara Instalasi & Menjalankan (Windows)

1.  **Pastikan Python Terinstal**
    Pastikan Anda sudah menginstal Python (versi 3.8 ke atas disarankan). Cek dengan perintah:
    ```bash
    python --version
    ```

2.  **Salin Folder Proyek**
    Pindahkan seluruh folder proyek ini ke komputer tujuan.

3.  **Buat Virtual Environment (Opsional tapi Disarankan)**
    Buka terminal (Command Prompt atau PowerShell) di dalam folder proyek, lalu jalankan:
    ```bash
    python -m venv venv
    ```

4.  **Aktifkan Virtual Environment**
    ```bash
    # Windows (PowerShell)
    .\venv\Scripts\Activate
    
    # Windows (Command Prompt)
    .\venv\Scripts\activate.bat
    ```

5.  **Instal Dependencies**
    Jalankan perintah berikut untuk menginstal pustaka yang dibutuhkan:
    ```bash
    pip install -r requirements.txt
    ```

6.  **Jalankan Aplikasi**
    ```bash
    python app.py
    ```

7.  **Buka di Browser**
    Akses alamat berikut di browser Anda:
    `http://127.0.0.1:5001`

## Cara Instalasi (Linux / macOS)

1.  **Buat & Aktifkan Virtual Environment**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

2.  **Instal Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Jalankan Aplikasi**
    ```bash
    python3 app.py
    ```
