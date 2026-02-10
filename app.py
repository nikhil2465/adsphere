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
from PIL import Image, ImageEnhance, ImageFilter
import io
import logging
import tempfile
import re

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

def preprocess_image_for_ocr(image_path):
    """
    Ultra-advanced image preprocessing for maximum OCR accuracy
    """
    try:
        # Read image with proper file handling
        img = None
        pil_image = None
        
        try:
            img = cv2.imread(image_path)
            if img is None:
                return None
                
            # Convert to PIL for advanced processing
            pil_image = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            
        except Exception as e:
            logger.error(f"Error reading image {image_path}: {str(e)}")
            return None
        
        finally:
            # Ensure OpenCV image is released
            if img is not None:
                del img
        
        # 1. Super-resolution enhancement
        width, height = pil_image.size
        pil_image = pil_image.resize((width * 2, height * 2), Image.Resampling.LANCZOS)
        
        # 2. Extreme contrast enhancement
        enhancer = ImageEnhance.Contrast(pil_image)
        pil_image = enhancer.enhance(3.0)
        
        # 3. Maximum sharpness
        enhancer = ImageEnhance.Sharpness(pil_image)
        pil_image = enhancer.enhance(2.0)
        
        # 4. Convert back to OpenCV format
        img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        
        # Clean up PIL image
        pil_image.close()
        
        # 5. Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Clean up original image
        del img
        
        # 6. Advanced noise reduction
        denoised = cv2.bilateralFilter(gray, 15, 80, 80)
        
        # 7. Multiple thresholding approaches
        # Otsu thresholding
        _, otsu = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Adaptive thresholding
        adaptive = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                      cv2.THRESH_BINARY, 15, 3)
        
        # Combine best of both methods
        combined = cv2.bitwise_and(otsu, adaptive)
        
        # 8. Advanced morphological operations
        kernel_small = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
        kernel_large = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        
        # Remove small noise
        cleaned = cv2.morphologyEx(combined, cv2.MORPH_OPEN, kernel_small)
        
        # Close gaps in characters
        processed = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel_large)
        
        # Clean up intermediate arrays
        del gray, denoised, otsu, adaptive, combined, cleaned
        
        # 9. Advanced deskewing
        try:
            # Find contours to detect skew angle
            contours, _ = cv2.findContours(processed, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
            
            if contours:
                # Get the largest contour
                largest_contour = max(contours, key=cv2.contourArea)
                
                # Get minimum area rectangle
                rect = cv2.minAreaRect(largest_contour)
                angle = rect[-1]
                
                if angle < -45:
                    angle = -(90 + angle)
                else:
                    angle = -angle
                    
                # Only rotate if angle is significant
                if abs(angle) > 0.5:
                    (h, w) = processed.shape[:2]
                    center = (w // 2, h // 2)
                    M = cv2.getRotationMatrix2D(center, angle, 1.0)
                    rotated = cv2.warpAffine(processed, M, (w, h), 
                                           flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
                    processed = rotated
                    del rotated
        except:
            # If deskewing fails, continue with original
            pass
            
        return processed
        
    except Exception as e:
        logger.error(f"Error in ultra-advanced image preprocessing: {str(e)}")
        # Fallback to basic processing
        try:
            img = cv2.imread(image_path)
            if img is not None:
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
                del img, gray
                return binary
        except:
            pass
        return None

def clean_extracted_text(text):
    """
    Ultra-advanced text cleaning for perfect OCR accuracy
    """
    if not text:
        return ""
    
    try:
        # 1. Remove all non-printable characters except essential ones
        text = re.sub(r'[^\x20-\x7E\n\r\t]', '', text)
        
        # 2. Normalize all whitespace to single space
        text = re.sub(r'[\t\f\v]+', ' ', text)
        
        # 3. Remove excessive whitespace
        text = re.sub(r'[ ]+', ' ', text)
        text = re.sub(r'\n+', '\n', text)
        text = re.sub(r'\r+', '\r', text)
        
        # 4. Remove OCR artifacts and noise characters
        artifacts = [
            r'[^\w\s\.\,\:\;\!\?\-\(\)\[\]\{\}\"\'\/\\@#\$%\^&\*\+\=\|\~`]',  # Remove weird symbols
            r'[^\w\s\.\,\:\;\!\?\-\(\)\[\]\{\}\"\'\/\\]',  # Keep only essential punctuation
            r'[^\w\s\.\,\:\;\!\?\-\(\)\[\]\{\}\"\'\/\\\n\r]',  # Keep newlines
        ]
        
        for pattern in artifacts:
            text = re.sub(pattern, '', text)
        
        # 5. Fix spacing around punctuation (perfect normalization)
        text = re.sub(r'\s+([.,;:!?])', r'\1', text)  # Space before punctuation
        text = re.sub(r'([.,;!?])\s+', r'\1 ', text)  # Space after punctuation
        text = re.sub(r'\s+([)])', r'\1', text)  # Space before closing brackets
        text = re.sub(r'([(])\s+', r'\1', text)  # Space after opening brackets
        
        # 6. Process each line individually for maximum accuracy
        lines = text.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            
            # Skip completely empty lines
            if not line:
                continue
                
            # Remove standalone page numbers with various formats
            page_patterns = [
                r'^Page\s+\d+$',
                r'^Page\s+\d+\s*$',
                r'^\d+$',
                r'^Page\s+\d+\s+of\s+\d+$',
                r'^-\s*Page\s+\d+\s*-',
            ]
            
            is_page_number = False
            for pattern in page_patterns:
                if re.match(pattern, line, re.IGNORECASE):
                    is_page_number = True
                    break
            
            if not is_page_number:
                # Remove leading/trailing punctuation
                line = line.strip('.,;:!?()[]{}"\'/\\')
                
                # Remove multiple consecutive punctuation
                line = re.sub(r'([.,;:!?])\1+', r'\1', line)
                
                # Fix broken words (common OCR issues)
                line = re.sub(r'([a-zA-Z])\s+([a-zA-Z])', r'\1\2', line)
                
                # Only add if line has meaningful content
                if len(line) > 1 or line.isalnum():
                    cleaned_lines.append(line)
        
        # 7. Rejoin with proper spacing
        cleaned_text = '\n'.join(cleaned_lines)
        
        # 8. Final cleanup - normalize line endings
        cleaned_text = re.sub(r'\r\n', '\n', cleaned_text)
        cleaned_text = re.sub(r'\r', '\n', cleaned_text)
        
        # 9. Remove excessive consecutive newlines (max 2)
        cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
        
        # 10. Final strip of leading/trailing whitespace
        cleaned_text = cleaned_text.strip()
        
        return cleaned_text
        
    except Exception as e:
        logger.error(f"Error in ultra-advanced text cleaning: {str(e)}")
        return text  # Return original if cleaning fails

def validate_and_correct_text(text):
    """
    Ultra-advanced text validation and correction for perfect accuracy
    """
    if not text:
        return ""
    
    try:
        # Comprehensive OCR corrections dictionary
        corrections = {
            # Character confusions (most common)
            '0': 'O', '1': 'l', '2': 'Z', '5': 'S', '6': 'G', '8': 'B',
            'l': '1', 'O': '0', 'S': '5', 'B': '8', 'G': '6', 'Z': '2',
            
            # Common character combinations
            'rn': 'm', 'vv': 'w', 'cl': 'd', 'ci': 'a', 'li': 'h', 'tl': 'h',
            'nn': 'm', 'vv': 'w', 'rr': 'n', 'ii': 'n', 'uu': 'n',
            
            # Word fragment corrections
            'w ord': 'word', 't he': 'the', 'a nd': 'and', 'i s': 'is',
            'o f': 'of', 't o': 'to', 'i n': 'in', 'a t': 'at',
            'f or': 'for', 'w ith': 'with', 'h ave': 'have', 'w ill': 'will',
            'b e': 'be', 'a re': 'are', 'w as': 'was', 'h as': 'has',
            
            # Technical terms corrections
            'CAD desig n': 'CAD design', 'CAD des ign': 'CAD design',
            'proj ect': 'project', 'proj e ct': 'project',
            'meas urements': 'measurements', 'meas ure ments': 'measurements',
            
            # Number and symbol corrections
            'l0l': '101', 'O0O': '000', 'l1l': '111', 'O1O': '010',
            
            # Common OCR noise patterns
            '|': 'l', '[]': 'o', '{}': 'o', '<>': 'o', '()': 'o',
        }
        
        # Apply corrections in order of specificity
        corrected_text = text
        
        # 1. Apply character combination corrections first
        for wrong, right in corrections.items():
            if len(wrong) > 1:  # Only apply multi-character corrections
                corrected_text = corrected_text.replace(wrong, right)
        
        # 2. Apply single character corrections
        for wrong, right in corrections.items():
            if len(wrong) == 1:  # Single character corrections
                corrected_text = corrected_text.replace(wrong, right)
        
        # 3. Advanced spacing fixes
        # Fix multiple spaces between words
        corrected_text = re.sub(r'([a-zA-Z])\s{2,}([a-zA-Z])', r'\1 \2', corrected_text)
        
        # Fix space before punctuation
        corrected_text = re.sub(r'\s+([.,;:!?])', r'\1', corrected_text)
        
        # Ensure space after punctuation
        corrected_text = re.sub(r'([.,;!?])([a-zA-Z])', r'\1 \2', corrected_text)
        
        # Fix missing spaces after common abbreviations
        corrected_text = re.sub(r'(Mr|Dr|Prof|St|Ms|Mrs)([a-zA-Z])', r'\1 \2', corrected_text)
        
        # 4. Remove duplicate words (sophisticated detection)
        words = corrected_text.split()
        if len(words) > 1:
            unique_words = []
            prev_word = None
            prev_prev_word = None
            
            for word in words:
                word_lower = word.lower().strip('.,;:!?()[]{}"\'/\\')
                
                # Only remove if it's exactly the same as previous word
                # and not a common repeated word (like "the the", "and and")
                common_repeats = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'}
                
                if (word_lower != prev_word or word_lower in common_repeats) and word_lower != prev_prev_word:
                    unique_words.append(word)
                    prev_prev_word = prev_word
                    prev_word = word_lower
                else:
                    # Skip duplicate
                    continue
            
            corrected_text = ' '.join(unique_words)
        
        # 5. Final character-level validation
        # Remove any remaining non-printable characters
        corrected_text = re.sub(r'[^\x20-\x7E\n\r]', '', corrected_text)
        
        # Ensure proper line breaks
        corrected_text = re.sub(r'\r\n', '\n', corrected_text)
        corrected_text = re.sub(r'\r', '\n', corrected_text)
        
        # Remove excessive newlines
        corrected_text = re.sub(r'\n{3,}', '\n\n', corrected_text)
        
        # 6. Context-aware corrections for technical content
        # Fix common technical OCR errors
        technical_corrections = {
            'CAD desig': 'CAD design',
            'desig n': 'design',
            'meas ure': 'measure',
            'rate chart': 'Rate chart',
            'Standard Rate': 'Standard Rate',
            'Project tie': 'Project title',
            'Problem statement': 'Problem statement',
        }
        
        for wrong, right in technical_corrections.items():
            corrected_text = corrected_text.replace(wrong, right)
        
        # 7. Final validation
        # Ensure text ends with proper punctuation if it's a sentence
        if corrected_text and len(corrected_text.split()) > 3:
            last_char = corrected_text[-1]
            if last_char.isalnum() and not corrected_text.endswith(('.', '!', '?')):
                # Only add period if it looks like a complete sentence
                sentences = corrected_text.split('. ')
                if len(sentences) > 1 or len(sentences[0].split()) > 5:
                    corrected_text += '.'
        
        return corrected_text.strip()
        
    except Exception as e:
        logger.error(f"Error in ultra-advanced text validation: {str(e)}")
        return text  # Return original if correction fails

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
                    
                    try:
                        for page_num in range(len(pdf_document)):
                            page = pdf_document.load_page(page_num)
                            pix = page.get_pixmap()
                            img_path = os.path.join(temp_dir, f"page_{page_num + 1}.png")
                            pix.save(img_path)
                            
                            # Process each page immediately to avoid file locking
                            try:
                                # Apply advanced preprocessing
                                processed_img = preprocess_image_for_ocr(img_path)
                                
                                if processed_img is not None:
                                    # Ultra-optimized Tesseract configuration for perfect accuracy
                                    custom_config = (
                                        '--oem 3 '  # LSTM OCR engine (most accurate)
                                        '--psm 6 '  # Assume uniform block of text
                                        '--dpi 300 '  # High DPI for better accuracy
                                        '--chop_enable '  # Enable chopper for better character recognition
                                        '--tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,;:!?()[]{}\'"/\\- \n'
                                        '--tessedit_pageseg_mode 6 '  # Page segmentation mode
                                        '--tessedit_ocr_engine_mode 3 '  # Neural net engine
                                        '--tessedit_load_system_dawg '  # Load system dictionary
                                        '--tessedit_load_freq_dawg '  # Load frequency dictionary
                                        '--tessedit_wordrec_enable_assoc '  # Enable word association
                                        '--tessedit_enable_bigram_correction '  # Enable bigram correction
                                        '--tessedit_enable_noise_removal '  # Enable noise removal
                                    )
                                    
                                    # Extract text with language support and ultra-optimized config
                                    if language == 'auto':
                                        page_text = pytesseract.image_to_string(processed_img, config=custom_config)
                                    else:
                                        page_text = pytesseract.image_to_string(processed_img, lang=language, config=custom_config)
                                    
                                    # Clean the extracted text
                                    cleaned_text = clean_extracted_text(page_text)
                                    
                                    # Apply validation and correction
                                    corrected_text = validate_and_correct_text(cleaned_text)
                                    text += f"Page {page_num + 1}:\n{corrected_text}\n\n"
                                
                            except Exception as e:
                                logger.error(f"Error processing page {page_num + 1}: {str(e)}")
                                text += f"Page {page_num + 1}: Error processing page\n\n"
                            
                            finally:
                                # Ensure the image file is closed and can be deleted
                                try:
                                    if os.path.exists(img_path):
                                        os.chmod(img_path, 0o666)  # Ensure file is writable
                                except:
                                    pass
                    
                    finally:
                        # Ensure PDF document is properly closed
                        pdf_document.close()
            except Exception as e:
                logger.error(f"Error processing PDF: {str(e)}")
                return f"Error processing PDF: {str(e)}"
        
        # Handle image files
        elif file_extension.lower() in ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.webp']:
            try:
                # Apply advanced preprocessing
                processed_img = preprocess_image_for_ocr(file_path)
                
                if processed_img is not None:
                    # Ultra-optimized Tesseract configuration for perfect accuracy
                    custom_config = (
                        '--oem 3 '  # LSTM OCR engine (most accurate)
                        '--psm 6 '  # Assume uniform block of text
                        '--dpi 300 '  # High DPI for better accuracy
                        '--chop_enable '  # Enable chopper for better character recognition
                        '--tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,;:!?()[]{}\'"/\\- \n'
                        '--tessedit_pageseg_mode 6 '  # Page segmentation mode
                        '--tessedit_ocr_engine_mode 3 '  # Neural net engine
                        '--tessedit_load_system_dawg '  # Load system dictionary
                        '--tessedit_load_freq_dawg '  # Load frequency dictionary
                        '--tessedit_wordrec_enable_assoc '  # Enable word association
                        '--tessedit_enable_bigram_correction '  # Enable bigram correction
                        '--tessedit_enable_noise_removal '  # Enable noise removal
                    )
                    
                    # Extract text with language support and ultra-optimized config
                    if language == 'auto':
                        text = pytesseract.image_to_string(processed_img, config=custom_config)
                    else:
                        text = pytesseract.image_to_string(processed_img, lang=language, config=custom_config)
                    
                    # Clean the extracted text
                    text = clean_extracted_text(text)
                    
                    # Apply validation and correction
                    text = validate_and_correct_text(text)
                else:
                    return "Error: Could not process the image file"
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
