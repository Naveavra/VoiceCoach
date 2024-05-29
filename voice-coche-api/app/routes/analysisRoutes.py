from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorators import authenticate, authorize

import speech_recognition as sr
from models import Project, Session, Analysis
from init import db
from pydub import AudioSegment
import whisper_timestamped as whisper
import json
import tempfile


# model = whisper.load_model("openai/whisper-large-v3", device="cuda")

def init_analysis_routes(app):
    @app.route("/analysis/<int:session_id>", methods=["GET"])
    @jwt_required()
    def getAnalysis(session_id):
        session = Session.query.get(session_id)
        if not (session.analysis_id is None):
            return jsonify(Analysis.query.get(session.analysis_id).serialize())
        description = ""
        project = Project.query.get(session.project_id)
        user_lines = session.session_lines.split(',')
        sample_lines = project.sample_lines.split(',')
        lines_length = len(min(user_lines, sample_lines))
        wordsMismatch = ""
        wordsDescription = ""
        google_txt = ""
        for i in range(0, lines_length):
            google_txt = google_txt + " " + user_lines[i]
            line_wordsMismatch, line_wordsDescription = compare_line(user_lines[i], sample_lines[i])
            wordsMismatch = wordsMismatch + ',' + line_wordsMismatch
            wordsDescription = wordsDescription + line_wordsDescription + '\n'

        '''
        #for the teamim
        with tempfile.NamedTemporaryFile(delete=True, suffix=".wav") as tmpfile:
            tmpfile.write(session.recording)
            tmpfile.flush()  # Ensure all data is written to disk
            audio = whisper.load_audio(tmpfile.name)

            result = {"whisper_result":whisper.transcribe(model ,audio, language="he",vad = "silero:3.1",detect_disfluencies=True,condition_on_previous_text=True,naive_approach=False,verbose=True),'google_result':google_txt}  # Set language to Hebrew
            print(result)
        '''
        return jsonify({"words" : wordsMismatch, "teamim" : "", "description" : wordsDescription}), 200
        
            # analysis = Analysis(creator=current_user.email, parasha=parasha,aliyah=aliyah, description=description)
        


    def compare_line(user_line, sample_line):
        user_words = user_line.split(' ')
        sample_words = sample_line.split(' ')
        wordsMismatch = ""
        wordsDescription = ""
        num_words = len(min(user_words, sample_words))
        nonsense_words = 0
        for i in range(0, num_words):
            if not user_words[i] in sample_words[i]:
                wordsMismatch = wordsMismatch + " " + user_words[i]
                wordsDescription = wordsDescription + "you said the word:" + user_words[i]+ " but it shouldn't appear." + '\n'
                nonsense_words  = nonsense_words + 1
            elif user_words[i] != sample_words[i-nonsense_words]:
                wordsMismatch = wordsMismatch + "," + user_words[i]
                wordsDescription = wordsDescription + "wrongly said here:" + user_words[i] + " should have said here:" + sample_words[i] + '\n'
        return wordsMismatch, wordsDescription
                    



