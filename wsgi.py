import sys
import os

# Add your app directory to the Python path
path = '/home/NikhilRao1234/mysite'
if path not in sys.path:
    sys.path.insert(0, path)

# Set environment variables
os.environ['TESSDATA_PREFIX'] = '/usr/share/tesseract-ocr/4.00/tessdata/'

# Import your Flask app
from app import app as application
