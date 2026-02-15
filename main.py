'''from kivymd.app import MDApp
from kivy.lang import Builder
from kivy.uix.filechooser import FileChooserIconView
from kivy.uix.popup import Popup
from kivy.factory import Factory

from ocr_manager import extract_from_image
from pdf_reader import extract_from_pdf
from tts_manager import save_audio
from file_exporter import save_as_pdf, save_as_docx
from tts_player import speech_player

class BlindOCRApp(MDApp):
    extracted_text = ""

    def build(self):
        return Builder.load_file("ui.kv")

    # -------------------------------------------------------
    # GENERIC FILE CHOOSER (used for Import Image + PDF)
    # -------------------------------------------------------
    def open_file(self, callback):
        chooser = FileChooserIconView(
            on_submit=lambda c, s, t: self.handle_selection(s, callback, chooser.popup)
        )
        popup = Popup(title="Select File", content=chooser, size_hint=(0.9, 0.9))
        chooser.popup = popup
        popup.open()

    def handle_selection(self, selection, callback, popup):
        popup.dismiss()
        if selection:
            path = selection[0]
            self.extracted_text = callback(path)
            print(self.extracted_text)

    # -------------------------------------------------------
    # READ IMAGE BUTTON → OPEN POPUP
    # -------------------------------------------------------
    def read_image(self):
        popup = Factory.ReadImagePopup()
        popup.open()

    # -------------------------------------------------------
    # CAPTURE IMAGE LOGIC
    # -------------------------------------------------------
    def capture_image(self):
        print("Camera capture triggered.")
        # Add OpenCV/Kivy camera code here

    # -------------------------------------------------------
    # IMPORT IMAGE (FileChooser)
    # -------------------------------------------------------
    def import_image(self):
        self.open_file(extract_from_image)

    # -------------------------------------------------------
    # READ PDF
    # -------------------------------------------------------
    def read_pdf(self):
        self.open_file(extract_from_pdf)

    # -------------------------------------------------------
    # EXPORT FUNCTIONS
    # -------------------------------------------------------
    def export_audio(self):
        save_audio(self.extracted_text)
        print("Audio saved.")

    def export_pdf(self):
        save_as_pdf(self.extracted_text)
        print("PDF saved.")

    def export_docx(self):
        save_as_docx(self.extracted_text)
        print("DOCX saved.")

    def test_audio(self):
        self.extracted_text = "Hello! This is a test audio message."
        self.export_audio()

    def speak_text(self):
        if self.extracted_text.strip():
            speech_player.speak(self.extracted_text)
        else:
            print("No text to speak")

    def open_volume_settings(self):
        popup=Factory.VolumePopup()
        popup.volume_slider.value=speech_player.volume * 100
        popup.open()

    def set_volume():
        speech_player.set_volume(value/100)
        print(f"Volume set to {value}%")

BlindOCRApp().run()
'''

from kivymd.app import MDApp
from kivy.lang import Builder
from kivy.uix.filechooser import FileChooserIconView
from kivy.uix.popup import Popup
from kivy.factory import Factory
import pyttsx3

from ocr_manager import extract_from_image
from pdf_reader import extract_from_pdf
from tts_manager import save_audio
from file_exporter import save_as_pdf, save_as_docx


class BlindOCRApp(MDApp):
    extracted_text = ""
    volume = 1.0  # default 100% volume

    def build(self):
        self.speaker = pyttsx3.init()
        self.speaker.setProperty("volume", self.volume)
        return Builder.load_file("ui.kv")

    # -------------------------------------------------------
    # GENERIC FILE CHOOSER (used for Import Image + PDF)
    # -------------------------------------------------------
    def open_file(self, callback):
        chooser = FileChooserIconView(
            on_submit=lambda c, s, t: self.handle_selection(s, callback, chooser.popup)
        )
        popup = Popup(title="Select File", content=chooser, size_hint=(0.9, 0.9))
        chooser.popup = popup
        popup.open()

    def handle_selection(self, selection, callback, popup):
        popup.dismiss()
        if selection:
            path = selection[0]
            self.extracted_text = callback(path)
            print(self.extracted_text)
            self.speak_text()  # Auto speak after OCR

    # -------------------------------------------------------
    # READ IMAGE BUTTON → ONLY OPENS POPUP
    # -------------------------------------------------------
    def read_image(self):
        popup = Factory.ReadImagePopup()
        popup.open()

    def capture_image(self):
        print("Camera capture triggered.")
        # TODO: Add camera logic
        # After capturing, call self.extracted_text = extract_from_image(captured_path)

    def import_image(self):
        self.open_file(extract_from_image)

    # -------------------------------------------------------
    # READ PDF
    # -------------------------------------------------------
    def read_pdf(self):
        self.open_file(extract_from_pdf)

    # -------------------------------------------------------
    # EXPORT FUNCTIONS
    # -------------------------------------------------------
    def export_audio(self):
        save_audio(self.extracted_text)
        print("Audio saved.")

    def export_pdf(self):
        save_as_pdf(self.extracted_text)
        print("PDF saved.")

    def export_docx(self):
        save_as_docx(self.extracted_text)
        print("DOCX saved.")

    # -------------------------------------------------------
    # SPEAK TEXT DIRECTLY
    # -------------------------------------------------------
    def speak_text(self):
        if not self.extracted_text:
            print("No text to speak.")
            return

        self.speaker.setProperty("volume", self.volume)
        self.speaker.say(self.extracted_text)
        self.speaker.runAndWait()

    # -------------------------------------------------------
    # VOLUME SETTINGS POPUP
    # -------------------------------------------------------
    def open_volume_settings(self):
        Factory.VolumePopup().open()

    def set_volume(self, value):
        self.volume = value
        self.speaker.setProperty("volume", self.volume)
        print(f"Volume set to: {self.volume}")

    def test_audio(self):
        self.extracted_text = "Hello! This is a test audio message."
        self.export_audio()


BlindOCRApp().run()


