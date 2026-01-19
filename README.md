# Blind OCR - Web Version

A web-based OCR (Optical Character Recognition) application that extracts text from images and reads it aloud using text-to-speech.

## Features

- Upload images using drag & drop or file browser
- Extract text from images using Tesseract OCR
- Listen to the extracted text using text-to-speech (gTTS)
- Responsive design that works on desktop and mobile devices
- Simple and intuitive user interface

## Prerequisites

- Python 3.7 or higher
- Tesseract OCR installed on your system
- Internet connection (required for gTTS)

### Installing Tesseract OCR

#### Windows
1. Download the installer from [UB Mannheim's Tesseract page](https://github.com/UB-Mannheim/tesseract/wiki)
2. Run the installer
3. Add Tesseract to your system PATH during installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install tesseract-ocr
```

#### macOS
```bash
brew install tesseract
```

## Installation

1. Clone the repository or download the source code
2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Application

1. Start the Flask development server:
   ```bash
   python app.py
   ```
2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

## Usage

1. Click the upload area or drag and drop an image file
2. Wait for the image to be processed
3. View the extracted text
4. Click the "Read Aloud" button to hear the text

## Project Structure

- `app.py` - Main Flask application
- `templates/` - HTML templates
  - `index.html` - Main web interface
- `static/` - Static files (CSS, JS, images, audio)
  - `uploads/` - Temporary storage for uploaded images
  - `audio/` - Temporary storage for generated audio files

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
