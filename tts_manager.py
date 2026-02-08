import os
import sys
import tempfile
import logging
import traceback
import platform
from typing import Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Global flag to track TTS engine availability
TTS_ENGINES = {
    'gtts': False,
    'pyttsx3': False
}

def check_tts_engines() -> Tuple[bool, str]:
    """Check which TTS engines are available."""
    global TTS_ENGINES
    status = []
    
    # Check gTTS
    try:
        from gtts import gTTS
        TTS_ENGINES['gtts'] = True
        status.append("gTTS: Available")
    except ImportError as e:
        status.append("gTTS: Not available (pip install gTTS)")
    except Exception as e:
        status.append(f"gTTS: Error - {str(e)}")
    
    # Check pyttsx3
    try:
        import pyttsx3
        pyttsx3.init()  # Test initialization
        TTS_ENGINES['pyttsx3'] = True
        status.append("pyttsx3: Available")
    except ImportError as e:
        status.append("pyttsx3: Not available (pip install pyttsx3)")
    except Exception as e:
        status.append(f"pyttsx3: Error - {str(e)}")
    
    return "\n".join(status)

# Log TTS engine status on import
tts_status = check_tts_engines()
logger.info(f"TTS Engine Status:\n{tts_status}")

def save_audio(text: str, filename: Optional[str] = None) -> Optional[str]:
    """
    Convert text to speech and save as audio file with enhanced error handling.
    
    Args:
        text: The text to convert to speech
        filename: Output filename. If None, creates a temp file.
        
    Returns:
        Path to the saved audio file or None if conversion failed
    """
    if not text or not text.strip():
        logger.error("No text provided for TTS")
        return None
    
    # Truncate very long text to avoid issues
    if len(text) > 5000:
        logger.warning("Text is too long, truncating to 5000 characters")
        text = text[:5000]
    
    # Generate filename if not provided
    if not filename:
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as f:
            filename = f.name
    
    # Try gTTS (online) first if available
    if TTS_ENGINES.get('gtts', False):
        try:
            from gtts import gTTS
            import requests
            
            # Test internet connectivity
            try:
                requests.get('https://www.google.com', timeout=5)
                tts = gTTS(text=text, lang='en')
                tts.save(filename)
                
                if os.path.exists(filename) and os.path.getsize(filename) > 1024:  # 1KB minimum size
                    logger.info(f"Successfully generated speech using gTTS: {filename} ({os.path.getsize(filename)} bytes)")
                    return filename
                else:
                    logger.warning("gTTS generated an empty or invalid file")
            except requests.RequestException as e:
                logger.warning(f"No internet connection for gTTS: {str(e)}")
            except Exception as e:
                logger.warning(f"gTTS failed: {str(e)}")
                logger.debug(f"gTTS error details: {traceback.format_exc()}")
        except Exception as e:
            logger.error(f"Unexpected error with gTTS: {str(e)}")
            logger.debug(f"gTTS error details: {traceback.format_exc()}")
    
    # Fall back to pyttsx3 (offline) if available
    if TTS_ENGINES.get('pyttsx3', False):
        try:
            import pyttsx3
            
            # Initialize engine with error handling
            try:
                engine = pyttsx3.init()
            except Exception as e:
                logger.error(f"Failed to initialize pyttsx3: {str(e)}")
                return None
            
            # Configure voice properties
            try:
                voices = engine.getProperty('voices')
                if voices:
                    # Try to find a female voice first, fallback to first available
                    female_voices = [v for v in voices if 'female' in v.name.lower()]
                    if female_voices:
                        engine.setProperty('voice', female_voices[0].id)
                    else:
                        engine.setProperty('voice', voices[0].id)
                
                # Set rate and volume
                engine.setProperty('rate', 150)  # Slower rate for better clarity
                engine.setProperty('volume', 1.0)  # Max volume
                
                # Save to file
                engine.save_to_file(text, filename)
                engine.runAndWait()
                
                # Verify file was created and has content
                if os.path.exists(filename):
                    size = os.path.getsize(filename)
                    if size > 1024:  # 1KB minimum size
                        logger.info(f"Successfully generated speech using pyttsx3: {filename} ({size} bytes)")
                        return filename
                    else:
                        logger.warning(f"pyttsx3 generated a small/empty file: {size} bytes")
                else:
                    logger.error("pyttsx3 did not create the output file")
                    
            except Exception as e:
                logger.error(f"Error during pyttsx3 text-to-speech: {str(e)}")
                logger.debug(f"pyttsx3 error details: {traceback.format_exc()}")
                
        except Exception as e:
            logger.error(f"Unexpected error with pyttsx3: {str(e)}")
            logger.debug(f"pyttsx3 error details: {traceback.format_exc()}")
    
    logger.error("All TTS methods failed. Please check logs for details.")
    return None

def speak_text_directly(text: str) -> bool:
    """Speak text directly using available TTS engine."""
    if not text or not text.strip():
        logger.error("No text provided for speech")
        return False
    
    # Try pyttsx3 first for direct speech
    if TTS_ENGINES.get('pyttsx3', False):
        try:
            import pyttsx3
            engine = pyttsx3.init()
            engine.say(text)
            engine.runAndWait()
            return True
        except Exception as e:
            logger.warning(f"Direct speech with pyttsx3 failed: {str(e)}")
    
    # Fall back to saving and playing audio file
    try:
        temp_file = save_audio(text)
        if temp_file and os.path.exists(temp_file):
            if platform.system() == 'Windows':
                import winsound
                winsound.PlaySound(temp_file, winsound.SND_FILENAME)
            else:  # Linux/Mac
                import subprocess
                subprocess.run(['xdg-open', temp_file], check=True)
            
            # Clean up temp file
            try:
                os.unlink(temp_file)
            except:
                pass
            return True
    except Exception as e:
        logger.error(f"Error playing audio file: {str(e)}")
    
    return False
