import pyttsx3

class SpeechPlayer():
    def __init__(self):
        self.engine=pyttsx3.init()
        self.volume=1.0

def set_volume(self,vol):
    self.volume=vol
    self.engine.setProperty('volume',vol)

def speak(self.text):
    self.engine.say(text)
    self.engine.runAndWait()

speech_player=Speech_Player()

