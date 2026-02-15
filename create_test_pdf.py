from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

def create_multi_language_test_pdf():
    # Create PDF
    c = canvas.Canvas("multi_language_test.pdf", pagesize=letter)
    width, height = letter
    
    # Try to register fonts for better language support
    try:
        # Try to register common fonts
        font_paths = [
            ("C:/Windows/Fonts/arial.ttf", "Arial"),
            ("C:/Windows/Fonts/times.ttf", "Times"),
            ("C:/Windows/Fonts/verdana.ttf", "Verdana")
        ]
        
        for font_path, font_name in font_paths:
            if os.path.exists(font_path):
                pdfmetrics.registerFont(TTFont(font_name, font_path))
                break
    except:
        pass  # Use default font if registration fails
    
    # Set font
    try:
        c.setFont("Arial", 16)
    except:
        c.setFont("Helvetica", 16)
    
    # Add multi-language content
    y_position = height - 50
    
    # Title
    c.drawString(50, y_position, "Multi-Language OCR Test Document")
    y_position -= 40
    
    # English
    c.drawString(50, y_position, "English: Hello World! This is a test document for OCR.")
    y_position -= 30
    
    # Chinese (Simplified) - using Unicode
    c.drawString(50, y_position, "Chinese (简体): 你好世界！这是一个OCR测试文档。")
    y_position -= 30
    
    # Hindi - using Unicode
    c.drawString(50, y_position, "Hindi (हिन्दी): नमस्ते दुनिया! यह एक OCR परीक्षण दस्तावेज़ है।")
    y_position -= 30
    
    # Arabic - using Unicode (RTL text)
    c.drawString(50, y_position, "Arabic (العربية): مرحبا بالعالم! هذا هو مستند اختبار OCR.")
    y_position -= 30
    
    # French
    c.drawString(50, y_position, "French: Bonjour le monde! Ceci est un document de test OCR.")
    y_position -= 30
    
    # Spanish
    c.drawString(50, y_position, "Spanish: ¡Hola mundo! Este es un documento de prueba OCR.")
    y_position -= 30
    
    # German
    c.drawString(50, y_position, "German: Hallo Welt! Dies ist ein OCR-Testdokument.")
    y_position -= 30
    
    # Japanese - using Unicode
    c.drawString(50, y_position, "Japanese (日本語): こんにちは世界！これはOCRテスト文書です。")
    y_position -= 30
    
    # Korean - using Unicode
    c.drawString(50, y_position, "Korean (한국어): 안녕하세요 세계! 이것은 OCR 테스트 문서입니다.")
    y_position -= 30
    
    # Russian - using Unicode
    c.drawString(50, y_position, "Russian (Русский): Привет мир! Это тестовый документ OCR.")
    y_position -= 30
    
    # Instructions
    y_position -= 40
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, y_position, "Testing Instructions:")
    y_position -= 25
    c.setFont("Helvetica", 12)
    c.drawString(50, y_position, "1. Select the appropriate language from the dropdown menu")
    y_position -= 20
    c.drawString(50, y_position, "2. Upload this PDF to test OCR accuracy")
    y_position -= 20
    c.drawString(50, y_position, "3. Try different languages to compare extraction results")
    y_position -= 20
    c.drawString(50, y_position, "4. Test the text-to-speech functionality")
    y_position -= 20
    c.drawString(50, y_position, "5. Compare results between auto-detect and specific languages")
    
    # Save the PDF
    c.save()
    print("Multi-language test PDF created: multi_language_test.pdf")

if __name__ == "__main__":
    create_multi_language_test_pdf()
