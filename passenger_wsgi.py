import sys, os

# Tambahkan direktori proyek ke sys.path
sys.path.append(os.getcwd())

# Import aplikasi Flask instance 'app' dari file 'app.py'
# Hostinger (Passenger) mencari objek bernama 'application'
from app import app as application