from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorators import authenticate, authorize

import speech_recognition as sr
from models import Project, Session, Analysis
from init import db
from pydub import AudioSegment
#import whisper_timestamped as whisper
import json


#model = whisper.load_model("openai/whisper-large-v3", device="cuda")

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
        syllablesMismatch = ""
        wordsDescription
        for i in range(0, lines_length):
            user_line = user_lines[i].split(':')[1]
            sample_line = sample_lines[i].split(':')[1]
            user_syllables = session.session_syllables.split(',')[i].split(':')[1]
            sample_syllables = project.sample_syllables.split(',')[i].split(':')[1]
            line_wordsMismatch, line_syllablesMismatch, line_wordsDescription = compare_line(user_line, sample_line, user_syllables, sample_syllables)
            wordsMismatch = wordsMismatch + user_lines[i].split(':')[0] + ':' + line_wordsMismatch + '\n'
            syllablesMismatch = syllablesMismatch + user_lines[i].split(':')[0] + ':' + line_syllablesMismatch + '\n'
            wordsDescription = wordsDescription + line_wordsDescription + '\n'
        
        
            # analysis = Analysis(creator=current_user.email, parasha=parasha,aliyah=aliyah, description=description)


    def compare_line(user_line, sample_line, user_syllables, sample_syllables):
        user_words = user_line.split(' ')
        sample_words = sample_line.split(' ')
        wordsMismatch = ""
        syllablesMismatch = ""
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
                user_words_syllables = user_syllables.split(' ')[i].split(';')
                sample_words_syllables = sample_syllables.split(' ')[i].split(';')
                for syllable in user_words_syllables:
                    if not syllable in sample_words_syllables:
                        syllablesMismatch = syllablesMismatch + "," + syllable
        return wordsMismatch, syllablesMismatch, wordsDescription
                    



