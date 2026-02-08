from flask import Flask, render_template, request, jsonify, send_file, url_for
import os
from werkzeug.utils import secure_filename
import cv2
import pytesseract
import numpy as np
from gtts import gTTS
from datetime import datetime
import time
import fitz  # PyMuPDF
from PIL import Image
import io
import logging
import tempfile

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Language mapping for gTTS
LANGUAGE_MAPPING = {
    'eng': 'en',
    'chi_sim': 'zh',
    'chi_tra': 'zh-TW',
    'jpn': 'ja',
    'kor': 'ko',
    'ara': 'ar',
    'rus': 'ru',
    'fra': 'fr',
    'deu': 'de',
    'spa': 'es',
    'ita': 'it',
    'por': 'pt',
    'hin': 'hi',
    'ben': 'bn',
    'tam': 'ta',
    'tel': 'te',
    'mar': 'mr',
    'guj': 'gu',
    'kan': 'kn',
    'mal': 'ml',
    'pan': 'pa',
    'urd': 'ur',
    'tha': 'th',
    'vie': 'vi',
    'tur': 'tr',
    'pol': 'pl',
    'nld': 'nl',
    'swe': 'sv',
    'nor': 'no',
    'dan': 'da',
    'fin': 'fi',
    'ell': 'el',
    'heb': 'he'
}

# Set Tesseract path for Windows
# First try to find tesseract in the system PATH
try:
    pytesseract.pytesseract.tesseract_cmd = 'tesseract'
    # Test if tesseract is accessible
    pytesseract.get_tesseract_version()
except (pytesseract.TesseractNotFoundError, Exception):
    # If not found in PATH, try common installation paths
    common_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe'
    ]
    
    for path in common_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break
    else:
        # If not found in common paths, use the one in PATH and let it fail with a clear error
        pytesseract.pytesseract.tesseract_cmd = 'tesseract'

app = Flask(__name__)

# Configure upload folder and allowed extensions
UPLOAD_FOLDER = 'uploads'
AUDIO_FOLDER = os.path.join('static', 'audio')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['AUDIO_FOLDER'] = AUDIO_FOLDER

# Create necessary directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'jpg', 'jpeg', 'png', 'tiff', 'tif', 'webp'}
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_EXTENSIONS'] = ['.jpg', '.jpeg', '.png', '.pdf', '.tif', '.tiff', '.webp']

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['AUDIO_FOLDER'], exist_ok=True)

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'tiff', 'tif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_file(file_path, file_extension, language='eng'):
    try:
        text = ""
        
        # Handle PDF files
        if file_extension.lower() == '.pdf':
            try:
                # Verify the file exists and is accessible
                if not os.path.exists(file_path):
                    return f"Error: File not found: {file_path}"
                    
                # Verify PyMuPDF can open the file
                try:
                    test_doc = fitz.open(file_path)
                    page_count = len(test_doc)
                    test_doc.close()
                    if page_count == 0:
                        return "Error: PDF file contains no pages"
                except Exception as e:
                    return f"Error opening PDF with PyMuPDF: {str(e)}"
                # Create a temporary directory for PDF processing
                with tempfile.TemporaryDirectory() as temp_dir:
                    # Convert PDF to images using PyMuPDF
                    pdf_document = fitz.open(file_path)
                    images = []
                    
                    for page_num in range(len(pdf_document)):
                        page = pdf_document.load_page(page_num)
                        pix = page.get_pixmap()
                        img_path = os.path.join(temp_dir, f"page_{page_num + 1}.png")
                        pix.save(img_path)
                        images.append(Image.open(img_path))
                    
                    for i, image in enumerate(images):
                        # Save the image temporarily
                        temp_img_path = os.path.join(temp_dir, f"page_{i+1}.png")
                        image.save(temp_img_path, 'PNG')
                        
                        # Process the image
                        img = cv2.imread(temp_img_path)
                        if img is not None:
                            # Convert to grayscale
                            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                            
                            # Apply thresholding
                            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                            
                            # Extract text with language support
                            if language == 'auto':
                                page_text = pytesseract.image_to_string(binary)
                            else:
                                page_text = pytesseract.image_to_string(binary, lang=language)
                            text += f"Page {i+1}:\n{page_text}\n\n"
                        
                        # Remove temporary image file
                        if os.path.exists(temp_img_path):
                            os.remove(temp_img_path)
            except Exception as e:
                logger.error(f"Error processing PDF: {str(e)}")
                return f"Error processing PDF: {str(e)}"
        
        # Handle image files
        elif file_extension.lower() in ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.webp']:
            try:
                # Read the image
                img = cv2.imread(file_path)
                if img is not None:
                    # Convert to grayscale
                    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                    
                    # Apply thresholding
                    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                    
                    # Extract text with language support
                    if language == 'auto':
                        text = pytesseract.image_to_string(binary)
                    else:
                        text = pytesseract.image_to_string(binary, lang=language)
                else:
                    return "Error: Could not read the image file"
            except Exception as e:
                logger.error(f"Error processing image: {str(e)}")
                return f"Error processing image: {str(e)}"
        else:
            return "Unsupported file format. Please upload a PDF, JPG, PNG, TIFF, or WebP file."
        
        return text.strip()
        
    except Exception as e:
        logger.error(f"Error processing file: {str(e)}")
        return f"Error processing file: {str(e)}"

def text_to_speech(text, detected_language='eng'):
    try:
        if not text:
            return None, "No text to convert to speech"
        
        # Make sure the audio directory exists
        os.makedirs(app.config['AUDIO_FOLDER'], exist_ok=True)
        
        # Create a unique filename for the audio
        timestamp = int(time.time())
        audio_filename = f"audio_{timestamp}.mp3"
        audio_path = os.path.join(app.config['AUDIO_FOLDER'], audio_filename)
        
        # Debug: Print the audio path
        logger.info(f"Saving audio to: {os.path.abspath(audio_path)}")
        
        # Map OCR language to gTTS language
        gtts_lang = LANGUAGE_MAPPING.get(detected_language, 'en')
        logger.info(f"Using gTTS language: {gtts_lang} for OCR language: {detected_language}")
        
        # Convert text to speech
        tts = gTTS(text=text, lang=gtts_lang)
        tts.save(audio_path)
        
        # Verify the file was created
        if not os.path.exists(audio_path):
            raise Exception(f"Failed to create audio file at {audio_path}")
            
        # Generate the URL for the audio file
        audio_url = url_for('static', filename=f'audio/{os.path.basename(audio_filename)}')
        logger.info(f"Audio URL: {audio_url}")
        
        return audio_url, None
        
    except Exception as e:
        error_msg = f"Error generating audio: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return None, error_msg

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate-speech', methods=['POST'])
def generate_speech():
    try:
        data = request.get_json()
        text = data.get('text', '')
        language = data.get('language', 'eng')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
            
        audio_url, error = text_to_speech(text, language)
        if error:
            return jsonify({'error': error}), 500
            
        return jsonify({'audio_url': audio_url})
        
    except Exception as e:
        logger.error(f"Error in generate_speech: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        # Check if the post request has the file part
        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400
        
        file = request.files['file']
        
        # If user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Get file extension
            file_extension = os.path.splitext(file.filename)[1].lower()
            
            # Create a secure filename
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            
            # Save the file
            try:
                file.save(filepath)
                
                # Process the file
                language = request.form.get('language', 'eng')
                text = process_file(filepath, file_extension, language)
                
                # Generate audio if there's text
                if text and not text.startswith("Error"):
                    audio_url, error = text_to_speech(text, language)
                    if error:
                        logger.error(f"Error generating audio: {str(error)}")
                        audio_url = None
                        return jsonify({
                            'text': text,
                            'audio_url': None,
                            'warning': 'Text was extracted but audio conversion failed.'
                        })
                else:
                    audio_url = None
                
                # Clean up the uploaded file
                if os.path.exists(filepath):
                    os.remove(filepath)
                
                return jsonify({
                    'success': True,
                    'text': text,
                    'audio_url': audio_url,
                    'filename': filename
                })
                
            except Exception as e:
                logger.error(f"Error processing file: {str(e)}")
                return jsonify({
                    'error': f'Error processing file: {str(e)}'
                }), 500
                
        return jsonify({
            'error': 'File type not allowed. Please upload a PDF, JPG, PNG, TIFF, or WebP file.'
        }), 400
        
    except Exception as e:
        logger.error(f"Unexpected error in upload_file: {str(e)}")
        return jsonify({
            'error': f'An unexpected error occurred: {str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
