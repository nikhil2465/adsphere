from flask import Flask, render_template, request, jsonify
import os
from werkzeug.utils import secure_filename
import cv2
import pytesseract
import numpy as np
from gtts import gTTS
import os
from datetime import datetime

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['AUDIO_FOLDER'] = 'static/audio'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload and audio directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['AUDIO_FOLDER'], exist_ok=True)

def process_image(image_path):
    try:
        # Read image using OpenCV
        img = cv2.imread(image_path)
        if img is None:
            return None, "Error: Could not read image"
            
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply thresholding to preprocess the image
        gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        
        # Extract text using pytesseract
        text = pytesseract.image_to_string(gray)
        return text.strip(), None
    except Exception as e:
        return None, f"Error processing image: {str(e)}"

def text_to_speech(text):
    try:
        if not text:
            return None, "No text to convert to speech"
            
        # Create a unique filename for the audio
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        audio_filename = f"speech_{timestamp}.mp3"
        audio_path = os.path.join(app.config['AUDIO_FOLDER'], audio_filename)
        
        # Convert text to speech
        tts = gTTS(text=text, lang='en')
        tts.save(audio_path)
        
        return f"/{audio_path}", None
    except Exception as e:
        return None, f"Error in text-to-speech: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if file:
        # Save the uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Process the image
        text, error = process_image(filepath)
        if error:
            return jsonify({'error': error}), 500
            
        # Convert text to speech
        audio_url, error = text_to_speech(text)
        if error:
            return jsonify({'error': error}), 500
            
        return jsonify({
            'success': True,
            'image_url': f'/static/uploads/{filename}',
            'text': text,
            'audio_url': audio_url
        })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
