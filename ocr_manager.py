'''import easyocr
import pytesseract
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

reader = easyocr.Reader(['en', 'hi'])

def extract_from_image(path):
    result = reader.readtext(path, detail=0)
    if result:
        return "\n".join(result)

    img = Image.open(path)
    return pytesseract.image_to_string(img)
'''

import pytesseract
from PIL import Image

# Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_from_image(path):
    try:
        img = Image.open(path)
        text = pytesseract.image_to_string(img)
        return text.strip()
    except Exception as e:
        return f"Error reading image: {e}"
