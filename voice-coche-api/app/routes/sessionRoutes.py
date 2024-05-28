from flask import request, jsonify, send_file
from flask_jwt_extended import jwt_required
from decorators import authenticate
from flask_socketio import emit

import speech_recognition as sr

from models import Project, Session
from init import db
from pydub import AudioSegment

import io
import base64
import wave

recognizer = sr.Recognizer()

def init_session_routes(app, socketio):
    @app.route("/sessions/create/<int:project_id>", methods=["POST"])
    @jwt_required()
    @authenticate
    def create_session(project_id):
        session = Session(project_id=project_id)
        hash_value = generate_hash(session.id)
        session.url = hash_value
        db.session.add(session)
        db.session.commit()
        return jsonify(session.simpleSerialize()), 201
    
    @app.route("/sessions/<int:session_id>", methods=["DELETE"])
    @jwt_required()
    @authenticate
    def delete_session(session_id):
        session = Session.query.get(session_id)
        if not session:
            return jsonify({"message": "session not found"}), 401
        db.session.delete(session)
        db.session.commit()
        return jsonify(session.simpleSerialize()), 200

    @app.route('/upload/<int:session_id>', methods=['POST'])
    @jwt_required()
    def upload(session_id):
        audio_file = request.files['audio']
        content = audio_file.read()
        session = Session.query.get(session_id)
        if session.recording is None:
            session.recording = audio_file.read()
        else:
            sessionRec = AudioSegment.from_file(io.BytesIO(session.recording))
            session.recording = sessionRec.append(audio_file, crossfade=0).read()
        return process_audio_to_text(AudioSegment.from_file(audio_file)), 200
    
    def process_audio_to_text(recording):
        audio = AudioSegment.from_file(recording)
        audio_wav = io.BytesIO()
        audio.export(audio_wav, format="wav")
        audio_wav.seek(0)
        with sr.AudioFile(audio_wav) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language='iw-IL')
            return text

    @app.route('/files/download/<session_url>', methods=['GET'])
    def download_session(session_url):
        Session = Session.query.filter_by(url=session_url).first()
        if not project:
            return jsonify({"msg": "Session not found"}), 401
        #decrypted_content = cipher_suite.decrypt(project.sample_clip)
        return send_file(BytesIO(project.sample_clip), 
                         download_name="session.wav",  # Specify the download name
                         as_attachment=True, 
                         mimetype='audio/wav')
    
    