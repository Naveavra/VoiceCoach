import speech_recognition as sr
import wave
import math
import nltk
from nltk import word_tokenize, SyllableTokenizer
import json
nltk.download('punkt')
from pydub import AudioSegment
import io
import base64
import os

def get_duration_wave(file_path):
   with wave.open(file_path, 'r') as audio_file:
      frame_rate = audio_file.getframerate()
      n_frames = audio_file.getnframes()
      duration = n_frames / float(frame_rate)
      return duration


def combine_strings_with_overlap(str1, str2):
    overlap_length = 0

    # Iterate through possible overlap lengths
    for i in range(1, min(len(str1), len(str2)) + 1):
        if str1.endswith(str2[:i]):
            overlap_length = i

    return overlap_length

def getWords(projectId, binary_data, duration, offset):
    recognizer = sr.Recognizer()
    
    audio = AudioSegment.from_wav(io.BytesIO(binary_data))
    file_path = f"audio_{projectId}.wav"
    audio.export(file_path, format="wav")

    song = sr.AudioFile(file_path)

    song_dur = get_duration_wave(f"audio_{projectId}.wav")
    song_aud = None
    song_txt = ""
    all_syllables = ""
    with song as source:
        recognizer.adjust_for_ambient_noise(song)
        print(song_dur)
        song_aud = recognizer.record(song, duration = (min(duration, song_dur-offset)), offset = min(offset, song_dur))
        song_txt = recognizer.recognize_google(song_aud, language = "iw-IL")


        all_syllables = ""
        words = word_tokenize(song_txt)
        syllable_tokenizer = SyllableTokenizer()
        syllables = [syllable_tokenizer.tokenize(word) for word in words]
        for word_syllables in syllables:
            str_syllable = ""
            for syllable in word_syllables:
                str_syllable = str_syllable + "," + syllable
            all_syllables = all_syllables + " " + str_syllable

        print(song_txt)
        print(all_syllables)
    
    return song_txt, all_syllables




