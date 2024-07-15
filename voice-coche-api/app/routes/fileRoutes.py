from io import BytesIO
import io

from flask import jsonify ,send_file, request, render_template
from flask_jwt_extended import jwt_required,get_jwt_identity
from cryptography.fernet import Fernet
from decorators import authenticate
from utils import generate_hash
from models import User , Project
from init import db


import speech_recognition as sr
from pydub import AudioSegment
import filetype
import tempfile
import json
import assemblyai as aai

from difflib import SequenceMatcher
import concurrent.futures
import re


# Configure AssemblyAI settings
aai.settings.api_key = "0dc55bacc27c4f6786439e81b735f87a"

subclip_size = 60.0
recognizer = sr.Recognizer()

def init_file_routes(app):
    @app.route('/projects/<int:project_id>/uploade_sample', methods=['POST'])
    @jwt_required()
    @authenticate
    def add_sample(current_user,project_id):
        if request.method == 'POST':
            project = Project.query.filter_by(id=project_id).first()
            if project != None:
                if project.creator_email == current_user.email:
                    if 'audio' not in request.files:
                        return jsonify({"error": "No audio file part"}), 401

                    audio_file = request.files['audio']
                    content = audio_file.read()
                    kind = filetype.guess(content)

                    if not kind is None:
                        #supported audio files
                        format_map = {
                            'mp3': 'mp3',
                            'wav': 'wav',
                            'oga': 'ogg',
                            'ogg': 'ogg',
                            'flac': 'flac',
                            'm4a' : 'm4a',
                            'mp4' : 'mp4',
                            # Add other formats as needed
                        }

                        audio_file_like = io.BytesIO(content)
                        if kind.extension in format_map:
                            audio = AudioSegment.from_file(audio_file_like, format=format_map[kind.extension])
                            duration_seconds = audio.duration_seconds
                            
                            #Export the audio data to a BytesIO object in WAV format
                            wav_io = io.BytesIO()
                            audio.export(wav_io, format="wav")
                            wav_content = wav_io.getvalue()
                            project.sample_clip = wav_content
                            
                            #now we get the words from the sample
                            teamim = getTeamim(wav_content, duration_seconds, project.parasha_ref_clean.text, project.parasha_ref_mark.text, None)
                            project.sample_teamim = json.dumps(teamim)
                        else:
                            return jsonify({"error": "received unsupported file"}), 401

                        hash_value = generate_hash(project_id)
                        project.sample_url = hash_value

                        db.session.add(project)
                        db.session.commit()
                    else:
                        return jsonify({"error": "received unsupported file"}), 401

                    return jsonify({'sample_url':hash_value}), 201
                else:
                    return jsonify({"error": "Unauthorized"}), 401
            else:
                return jsonify({"error": "Project not found"}), 404
        else:
            return jsonify({"error": "Method not allowed"}), 405


    @app.route('/projects/<int:project_id>/get_sample_url', methods=['GET'])
    @jwt_required()
    @authenticate
    def get_sample_url(current_user,project_id):
        project = Project.query.filter_by(creator_email=current_user.email).first()
        if project != None:
            if project.id == project_id:
                if project.sample_clip:
                    return jsonify({"url": project.sample_url}), 200
                else:
                    return jsonify({"error": "No sample file found"}), 404
            else:
                return jsonify({"error": "Unauthorized"}), 401
        else:
            return jsonify({"error": "Project not found"}), 404
        
    @app.route('/files/download/<sample_url>', methods=['GET'])
    def download_file(sample_url):
        project = Project.query.filter_by(sample_url=sample_url).first()
        if not project:
            return jsonify({"error": "Project not found"}), 404

        return send_file(BytesIO(project.sample_clip), 
                         download_name="sample.wav",  # Specify the download name
                         as_attachment=True, 
                         mimetype='audio/wav')
code_to_mark = {
    1425: 'etnach',
    1426: 'segolta',
    1427: 'shalshelet',
    1428: 'zaqef katan', 
    1429: 'zaqef gadol', 
    1430: 'sof pasuk', 
    1431: 'revia', 
    1433: 'trei kadmin', 
    1435: 'tevir', 
    1436: 'gerish', 
    1438: 'shene gereshin', 
    1440: 'talsha', 
    1441: 'pazer gadol', 
    1447: 'darga', 
    1448: 'azla', 
    1454: 'zarqa',
    1472: 'pasek',
}  

def recognizeTeamim(cuurWord):
    global code_to_mark

    for char in cuurWord:
        code = ord(char)
        if code in code_to_mark :
            if code == 1430:
                # then its maarih tarha and not sof pasuk
                return 'maarih tarha'
            elif code == 1433 and cuurWord.count(chr(1433)) == 1:
                #then its kadma and not trei kadmin
                return 'kadma'
            else:
                return code_to_mark.get(code)



def fixTeamimWithGoogle(teamim, words):
    tmp_words = words.replace(',', ' ')
    word_list = tmp_words.split()
    # Replace words in places with the most similar ones from the word list within one position off
    len_teamim = len(teamim)
    for i, place in enumerate(teamim):
        if not i>len(word_list)-1:
            if i == len_teamim-1:
                place['text'] = find_best_match(place['text'], word_list, i, "")
            else:
                place['text'] = find_best_match(place['text'], word_list, i, teamim[i+1]['text'])
    return teamim
    

def find_best_match(word, word_list, current_index, next_word):
    if current_index == len(word_list)-1:
        return word_list[current_index]

    # Consider words within one position off
    infront_score = similar(word, word_list[current_index]) #SequenceMatcher(None, word, word_list[current_index]).ratio()
    next_score = similar(word, word_list[current_index+1]) #SequenceMatcher(None, word, word_list[current_index+1]).ratio()
    if next_score > infront_score and next_score > similar(next_word, word_list[current_index+1]): #SequenceMatcher(None, next_word, word_list[current_index+1]).ratio():
        return word_list[current_index+1]
    else:
        return word_list[current_index]

def transcribe_subclip_google(audio_file_path, start_time, subclip_duration):
    with sr.AudioFile(audio_file_path) as source:
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.record(source, duration=subclip_duration)
        return recognizer.recognize_google(audio, language="iw-IL")


def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()


def fixTeamimWithWords(teamim, words, cleanTxt, dirtyTxt, path, threshold=0.6):
    cleanTxt = re.sub(' +', ' ', cleanTxt.replace('\t', '').replace('\n', '').replace('.', '').replace(',', '').replace('׃', '').replace('-', ' ').replace('ׁ', '').replace('־', ' ').replace('׀', '')).strip()
    dirtyTxt = re.sub(' +', ' ', dirtyTxt.replace('\t', '').replace('\n', '').replace('־', ' ').replace('׀', '')).strip()
    
    if path is not None:
        with open(path.split('.')[0] + "_teamim" + ".json", "w", encoding="utf-8") as file:
            json.dump(teamim, file, ensure_ascii=False, indent=4)
        with open(path.split('.')[0] + "_words" + ".txt", "w", encoding="utf-8") as file:
            file.write(words)

    #teamim = fixTeamimWithGoogle(teamim, words)

    clean_words = cleanTxt.split()
    dirty_words = dirtyTxt.split()

    aligned_texts = []
    offset = 0
    cur_place = 0

    for taam in teamim:
        found = False
        for i in range(cur_place, min(cur_place + 5 + offset, len(clean_words))):
            taam['text'] = taam['text'].replace(',', '').replace('.', '')
            if similar(taam['text'], clean_words[i])>=threshold:
                aligned_texts.append({
                    'text': dirty_words[i],
                    'taam': recognizeTeamim(dirty_words[i]),
                    'broken': False,
                    'start': taam['start'],
                    'end': taam['end'],
                    'parasha_place': i
                })

                cur_place = i+1
                found = True
                offset = 0
                break

        if not found:
            aligned_texts.append({
                    'text': taam['text'],
                    'broken': True,
                    'start': taam['start'],
                    'end': taam['end'],
                    'parasha_place': -1
                })
            offset = offset + 1
    if path is not None:
        with open(path.split('.')[0] + "_fixed" + ".json", "w", encoding="utf-8") as file:
            json.dump(aligned_texts, file, ensure_ascii=False, indent=4)
    return aligned_texts
    
def transcribe_subclip(temp_wav_file_path, offset):
    FILE_URL = temp_wav_file_path
    stamps_array = []
    try:
        config = aai.TranscriptionConfig(language_code="he", speech_model=aai.SpeechModel.nano, punctuate=False, format_text=False)
        transcriber = aai.Transcriber(config=config)
        transcript = transcriber.transcribe(FILE_URL)

        if transcript.status == aai.TranscriptStatus.completed:
            for word in transcript.words:
                start_time_word = word.start / 1000
                end_time_word = word.end / 1000
                stamps_array.append({
                    'text': word.text, 
                    'start': round(start_time_word + offset, 2), 
                    'end': round(end_time_word + offset, 2)
                })
    except Exception as e:
        print(e)
        return []
    return stamps_array


def processSubClip(audio, start_time, subclip_duration):
    subclip = audio[float(start_time) * 1000 : float(start_time + subclip_duration) * 1000]

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav_file:
        subclip.export(temp_wav_file, format="wav")
        temp_wav_file_path = temp_wav_file.name

        '''
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_google = executor.submit(transcribe_subclip_google, temp_wav_file_path, 0.0, subclip_duration)
            future_teamim = executor.submit(transcribe_subclip, temp_wav_file_path, start_time)

        words = future_google.result()
        stamps_array = future_teamim.result()
        '''
        words = ""
        stamps_array = transcribe_subclip(temp_wav_file_path, start_time)

        #stamps_array = transcribe_subclip(temp_wav_file_path, start_time)
        return start_time, words, stamps_array


def getTeamim(audio_data, duration, clean_txt, dirty_txt, path):
    audio = AudioSegment.from_file(io.BytesIO(audio_data))
    subclip_durations = [
        (i, max(0.0, min(subclip_size, duration - i)))
        for i in range(0, int(duration + subclip_size), int(subclip_size))
    ]

    subclip_durations = [
    dur for dur in subclip_durations if dur[1] > 0.0 and dur[0] < duration
    ]

    ans_dict = {}
    txt_dict = {}

    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = {
            executor.submit(processSubClip, audio, start_time, subclip_duration): (start_time, subclip_duration)
            for start_time, subclip_duration in subclip_durations
        }

        for future in concurrent.futures.as_completed(futures):
            try:
                time, words, stamps_array = future.result()
                ans_dict[time] = stamps_array
                txt_dict[time] = words
            except Exception as e:
                print(e)

    # Combine results in order
    sorted_times = sorted(ans_dict.keys())
    ans = []
    txt = ""
    for time in sorted_times:
        ans.extend(ans_dict[time])
        if txt == "":
            txt = txt_dict[time]
        else:
            txt = txt + ',' + txt_dict[time]
    ans = fixTeamimWithWords(ans, txt, clean_txt, dirty_txt, path)
    return ans


def get_words_by_google(audio_file, duration):
    global subclip_size
    ans = ""
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav_file:
            temp_wav_file.write(audio_file)
            recognizer = sr.Recognizer()
            song = sr.AudioFile(temp_wav_file.name)

            song_txt = ""

            with song as source:
                recognizer.adjust_for_ambient_noise(song)
            count = 0
            while count <= duration:
                with song as source:
                    song_aud = recognizer.record(song, duration=min(subclip_size, duration - count), offset=count)
                    song_txt = recognizer.recognize_google(song_aud, language="iw-IL")
                    print(song_txt)
                count = count + min(subclip_size, duration - count)
                if len(ans) == 0:
                    ans = song_txt
                else:
                    ans = ans + ',' + song_txt
            return ans

    except Exception as e:
        print(e)
    return ans

