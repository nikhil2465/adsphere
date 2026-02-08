from PIL import Image, ImageDraw, ImageFont
import os

# Create a test image with multi-language text
def create_multi_language_test_image():
    # Image dimensions
    width, height = 800, 600
    
    # Create white background
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)
    
    # Try to use different fonts, fallback to default if not available
    try:
        # Try different fonts for different languages
        fonts = {
            'english': ImageFont.truetype("arial.ttf", 24),
            'chinese': ImageFont.truetype("simsun.ttc", 24) if os.path.exists("C:/Windows/Fonts/simsun.ttc") else ImageFont.truetype("arial.ttf", 24),
            'hindi': ImageFont.truetype("mangal.ttf", 24) if os.path.exists("C:/Windows/Fonts/mangal.ttf") else ImageFont.truetype("arial.ttf", 24),
            'arabic': ImageFont.truetype("arial.ttf", 24)  # Arial supports Arabic
        }
    except:
        # Fallback to default font
        fonts = {'all': ImageFont.load_default()}
    
    # Add text in different languages
    y_position = 50
    
    # English
    draw.text((50, y_position), "English: Hello World! This is a test.", fill='black', font=fonts.get('english', fonts.get('all')))
    y_position += 80
    
    # Chinese (Simplified)
    draw.text((50, y_position), "Chinese (简体): 你好世界！这是一个测试。", fill='black', font=fonts.get('chinese', fonts.get('all')))
    y_position += 80
    
    # Hindi
    draw.text((50, y_position), "Hindi (हिन्दी): नमस्ते दुनिया! यह एक परीक्षण है।", fill='black', font=fonts.get('hindi', fonts.get('all')))
    y_position += 80
    
    # Arabic
    draw.text((50, y_position), "Arabic (العربية): مرحبا بالعالم! هذا اختبار.", fill='black', font=fonts.get('arabic', fonts.get('all')))
    y_position += 80
    
    # French
    draw.text((50, y_position), "French: Bonjour le monde! Ceci est un test.", fill='black', font=fonts.get('english', fonts.get('all')))
    y_position += 80
    
    # Spanish
    draw.text((50, y_position), "Spanish: ¡Hola mundo! Esto es una prueba.", fill='black', font=fonts.get('english', fonts.get('all')))
    y_position += 80
    
    # German
    draw.text((50, y_position), "German: Hallo Welt! Dies ist ein Test.", fill='black', font=fonts.get('english', fonts.get('all')))
    y_position += 80
    
    # Japanese
    draw.text((50, y_position), "Japanese (日本語): こんにちは世界！これはテストです。", fill='black', font=fonts.get('english', fonts.get('all')))
    y_position += 80
    
    # Add instructions
    y_position += 40
    draw.text((50, y_position), "Instructions:", fill='blue', font=fonts.get('english', fonts.get('all')))
    y_position += 30
    draw.text((50, y_position), "1. Select the appropriate language from the dropdown", fill='blue', font=fonts.get('english', fonts.get('all')))
    y_position += 25
    draw.text((50, y_position), "2. Upload this image to test OCR accuracy", fill='blue', font=fonts.get('english', fonts.get('all')))
    y_position += 25
    draw.text((50, y_position), "3. Try different languages to see the difference in extraction", fill='blue', font=fonts.get('english', fonts.get('all')))
    
    # Save the image
    img.save('multi_language_test.png')
    print("Multi-language test image created: multi_language_test.png")

if __name__ == "__main__":
    create_multi_language_test_image()
