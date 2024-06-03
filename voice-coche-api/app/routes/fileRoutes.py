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
import difflib

aai.settings.api_key = "0dc55bacc27c4f6786439e81b735f87a"

def init_file_routes(app):
    @app.route('/projects/<int:project_id>/uploade_sample', methods=['POST'])
    @jwt_required()
    @authenticate
    def add_sample(current_user,project_id):
        #cipher_suite = Fernet(app.config['SECRET_KEY'])
        if request.method == 'POST':
            project = Project.query.filter_by(id=project_id).first()
            if project != None:
                if project.creator_email == current_user.email:
                    if 'audio' not in request.files:
                        return jsonify({"error": "No audio file part"}), 400
                    audio_file = request.files['audio']
                    content = audio_file.read()
                    kind = filetype.guess(content)
                    if not kind is None:
                        print(kind.mime, kind.extension)
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
                            words = get_words_by_google(wav_content, duration_seconds)
                            project.sample_lines = words
                            print("here")
                            teamim = getTeamim(wav_content)
                            print("here2")
                            teamim = fixTeamimWithWords(teamim, words)
                            print(teamim)
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
                    # Decrypt the file content
                    # decrypted_content = cipher_suite.decrypt(project.sample_clip)
                    # return send_file(BytesIO(decrypted_content), attachment_filename="sample.wav", as_attachment=True)
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
            return jsonify({"msg": "Project not found"}), 404
        #decrypted_content = cipher_suite.decrypt(project.sample_clip)
        return send_file(BytesIO(project.sample_clip), 
                         download_name="sample.wav",  # Specify the download name
                         as_attachment=True, 
                         mimetype='audio/wav')
      
        # upload = None#AudioFile.query.filter_by(id=upload_id).first()
        # return send_file(BytesIO(upload.content), attachment_filename=upload.filename, as_attachment=True)
def get_words_by_google(audio_file, duration):
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
                    song_aud = recognizer.record(song, duration=min(30.0, duration - count), offset=count)
                    song_txt = recognizer.recognize_google(song_aud, language="iw-IL")
                    print(song_txt)
                count = count + 30
                if len(ans) == 0:
                    ans = song_txt
                else:
                    ans = ans + ',' + song_txt
            return ans
    except Exception as e:
        print(e)
    return ans


def getTeamim(audio_data):
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav_file:
        temp_wav_file.write(audio_data)

        # URL of the file to transcribe
        FILE_URL = temp_wav_file.name

        config = aai.TranscriptionConfig(language_code="he", speech_model=aai.SpeechModel.nano)
        transcriber = aai.Transcriber(config=config)
        transcript = transcriber.transcribe(FILE_URL)

        stamps_array = []
        if transcript.status == aai.TranscriptStatus.completed:
            for word in transcript.words:
                start_time = word.start/1000
                end_time = word.end/1000
                word_text = word.text
                stamps_array.append({'text': word.text, 'start': start_time, 'end': end_time})

        return stamps_array

def fixTeamimWithWords(teamim, words):
    word_list = words.split()
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
    infront_score = difflib.SequenceMatcher(None, word, word_list[current_index]).ratio()
    next_score = difflib.SequenceMatcher(None, word, word_list[current_index+1]).ratio()
    if next_score > infront_score and next_score > difflib.SequenceMatcher(None, next_word, word_list[current_index+1]).ratio():
        return word_list[current_index+1]
    else:
        return word_list[current_index]