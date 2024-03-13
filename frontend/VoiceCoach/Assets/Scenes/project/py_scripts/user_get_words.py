import speech_recognition as sr
import wave
import math
import nltk
from nltk import word_tokenize, SyllableTokenizer
import json
nltk.download('punkt')

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


argumentsPath = "Assets/Scenes/project/py_scripts/user_arguments.json"
data = None
with open(argumentsPath, 'r') as file:
        # Load the JSON data from the file
        data = json.load(file)


samplePath = data['path']

recognizer = sr.Recognizer()
song = sr.AudioFile(samplePath)
duration = data['duration']
offset = data['offset']

song_dur = get_duration_wave(samplePath)
with song as source:
    recognizer.adjust_for_ambient_noise(song)

old_str = ""
if len(data['lines']) > 0:
    old_str = data['lines'][len(data['lines'])-1]
song_aud = None
with song as source:
    song_aud = recognizer.record(song, duration = math.floor((min(duration+5, song_dur-offset+5))), offset = math.floor(max(0, (min(offset-5, song_dur)))))
try:
    song_txt = recognizer.recognize_google(song_aud, language="iw-IL")
# Rest of your code
except sr.UnknownValueError as e:
    song_txt = ""

song_txt = song_txt[combine_strings_with_overlap(old_str, song_txt):]
data['lines'].append(song_txt)
#song_txt = str(offset) + ":" + str(offset+duration) + " " +song_txt + '\n'

str_syllables = ""
words = word_tokenize(song_txt)
syllable_tokenizer = SyllableTokenizer()
syllables = [syllable_tokenizer.tokenize(word) for word in words]
for word_syllables in syllables:
    str_syllable = ""
    for syllable in word_syllables:
        str_syllable = str_syllable + "," + syllable
    str_syllables = str_syllables + " " + str_syllable
data['syllables'].append(str_syllables)

# Create an instance of the SampleData class
sample_data = {
    'path': data['path'],
    'offset': offset + duration,
    'duration': duration,
    'lines': data['lines'],
    'syllables': data['syllables']
}

with open(argumentsPath, 'w') as file:
    json.dump(sample_data, file, indent=2)


