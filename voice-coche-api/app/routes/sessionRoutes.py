from flask import request, jsonify, send_file
from flask_jwt_extended import jwt_required
from decorators import authenticate
from flask_socketio import emit

import speech_recognition as sr

from models import Project, Session, Analysis
from init import db
from pydub import AudioSegment
from utils import generate_hash
from .fileRoutes import get_words_by_google
from .analysisRoutes import getAnalysis

import io
import base64
import wave
import filetype
import tempfile

check = 0
recordings = {}
recording_words = {}
def init_session_routes(app, socketio):
    @app.route("/sessions/create/<int:project_id>", methods=["POST"])
    @jwt_required()
    @authenticate
    def create_session(current_user, project_id):
        session = Session(project_id=project_id)
        hash_value = generate_hash(session.id)
        session.url = hash_value
        db.session.add(session)
        db.session.commit()
        return jsonify(session.simpleSerialize()), 201
    
    @app.route("/sessions/<int:session_id>", methods=["DELETE"])
    @jwt_required()
    @authenticate
    def delete_session(current_user, session_id):
        session = Session.query.get(session_id)
        if not session:
            return jsonify({"message": "session not found"}), 401
        db.session.delete(session)
        db.session.commit()
        return jsonify(session.simpleSerialize()), 200

    @app.route('/upload/<int:session_id>', methods=['POST'])
    @jwt_required()
    @authenticate
    def upload(current_user, session_id):
        global check
        global recordings
        global recording_words

        session = Session.query.get(session_id)
        if session is None:
            return jsonify({"error": "illegal session id"}), 401
        audio_file = request.files['audio']
        done = request.form.get('done')
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
                'mp4': 'mp4',
                'm4a' : 'm4a',
                # Add other formats as needed
            }
            audio_file_like = io.BytesIO(content)
            if kind.extension in format_map:
                audio = AudioSegment.from_file(audio_file_like, format=format_map[kind.extension])
                duration_seconds = audio.duration_seconds
                wav_io = io.BytesIO()
                audio.export(wav_io, format="wav")
                wav_content = wav_io.getvalue()

                if not session_id in recordings:
                    recordings[session_id] = wav_content
                        #session.recording = wav_content
                else:
                    existing_audio = AudioSegment.from_file(io.BytesIO(recordings[session_id]), format='wav')
                    #existing_audio = AudioSegment.from_file(io.BytesIO(session.recording), format='wav')

                    # Append converted audio to existing audio
                    combined_audio = existing_audio + AudioSegment.from_file(io.BytesIO(wav_content), format='wav')
                    
                    # Export combined audio to binary data
                    wav_io = io.BytesIO()
                    combined_audio.export(wav_io, format="wav")
                    recordings[session_id] = wav_io.getvalue()

                    if done == "true":
                        session.recording = recordings[session_id]
                    #session.recording = wav_io.getvalue()
                
                words = get_words_by_google(wav_content, duration_seconds)
                if not session_id in recording_words:
                    recording_words[session_id] = words
                #if session.session_lines is None:
                #    session.session_lines = words
                else:
                    recording_words[session_id] = recording_words[session_id] + ',' + words
                    #session.session_lines = session.session_lines + ',' + words
                if done == "true":
                    session.session_lines = recording_words[session_id]
                db.session.commit()
                
                if done == "true":
                    print("here")
                    getAnalysis(session_id)
                return words
            else:
                return jsonify({"error": "received unsupported file"}), 401
        else:
            return jsonify({"error": "received unsupported file"}), 401

    @app.route('/files/download/<session_url>', methods=['GET'])
    def download_session(session_url):
        session = Session.query.filter_by(url=session_url).first()
        if not session:
            return jsonify({"msg": "Session not found"}), 401
        #decrypted_content = cipher_suite.decrypt(project.sample_clip)
        return send_file(BytesIO(session.recording), 
                         download_name="session.wav",  # Specify the download name
                         as_attachment=True, 
                         mimetype='audio/wav')
    
    