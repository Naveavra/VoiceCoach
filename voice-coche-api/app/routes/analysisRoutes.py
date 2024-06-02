from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorators import authenticate, authorize

import speech_recognition as sr
from models import Project, Session, Analysis
from init import db
from pydub import AudioSegment
import json
import assemblyai as aai
from .fileRoutes import get_words_by_google

import io
import base64
import wave
import tempfile

#needed for transcription with assemblyai
aai.settings.api_key = "0dc55bacc27c4f6786439e81b735f87a"

def init_analysis_routes(app):
    @app.route("/analysis/<int:session_id>", methods=["GET"])
    @jwt_required()
    @authenticate
    def forAnalysis(current_user, session_id):
        return getAnalysis(session_id)
        
                    

def getAnalysis(session_id):
    session = Session.query.get(session_id)
    if not (session.analysis_id is None):
        return jsonify(Analysis.query.get(session.analysis_id).serialize())

    audio_file_like = io.BytesIO(session.recording)
    audio = AudioSegment.from_file(audio_file_like)
    audio.export("test.wav", format = "wav")
    duration_seconds = audio.duration_seconds


    words = get_words_by_google(session.recording, duration_seconds)
    description = ""
    project = Project.query.get(session.project_id)
    user_lines = session.session_lines.split(',')
    #each user_line is 5 seconds and sample_line is 30 seconds. making sure each cell is for the same length
    tmp = []
    count = 0
    comb = ""
    for line in user_lines:
        if comb == "":
            comb = line
        else:
            comb = comb + " " + line
        count = count + 1
        if count == 6:
            count = 0 
            tmp.append(comb)
            comb = ""
    #adding the last part, if not ended on a number that x%6 == 0
    if comb != "":
        tmp.append(comb)
    #user_lines = tmp
    user_lines = words.split(',')
    sample_lines = project.sample_lines.split(',')

    lines_length = min(len(user_lines), len(sample_lines))
    wordsMismatch = []
    wordsDescription = ""
    google_txt = ""
    for i in range(0, lines_length):
        google_txt = google_txt + " " + user_lines[i]
        line_wordsMismatch, line_wordsDescription = compare_line(user_lines[i], sample_lines[i])

        wordsMismatch.extend(line_wordsMismatch)
        wordsDescription = wordsDescription + line_wordsDescription + '\n'

    '''
    with tempfile.NamedTemporaryFile(delete=True, suffix=".wav") as tmpfile:
        tmpfile.write(session.recording)
        tmpfile.flush()

        # URL of the file to transcribe
        FILE_URL = tmpfile.name

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
        elif transcript.status == aai.TranscriptStatus.failed:
            return jsonify("transciption failed"), 401
        '''
    return jsonify({"words" : wordsMismatch, "teamim" : "", "description" : wordsDescription}), 200
        


def compare_line(user_line, sample_line):
    user_words = user_line.split(' ')
    sample_words = sample_line.split(' ')

    wordsMismatch = []
    wordsDescription = ""
    num_words = min(len(user_words), len(sample_words))
    nonsense_words = 0
    for i in range(0, num_words):
        if user_words[i] not in sample_words:
            wordsMismatch.append(user_words[i])
            wordsDescription = wordsDescription + "you said the word:" + user_words[i]+ " but it shouldn't appear here.\n"
            nonsense_words  = nonsense_words + 1
        elif user_words[i] != sample_words[i-nonsense_words] or user_words[i] != sample_words[i+nonsense_words]:
            wordsMismatch.append(user_words[i])
            wordsDescription = wordsDescription + "wrongly said here:" + user_words[i] + " should have said here:" + sample_words[i] + ".\n"
    return wordsMismatch, wordsDescription