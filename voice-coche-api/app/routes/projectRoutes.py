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
recordings = []

def init_project_routes(app, socketio):
    @app.route("/projects/get_all", methods=["GET"])
    @jwt_required()
    @authenticate
    def get_all_projects(current_user):
        projects = Project.query.filter_by(creator_email=current_user.email).all()
        return jsonify([project.simpleSerialize() for project in projects])

    @app.route("/projects/create", methods=["POST"])
    @jwt_required()
    @authenticate
    def create_project(current_user):
        data = request.get_json() if request.is_json else request.values
        name = data.get("name")
        description = data.get("description")
        project = Project(creator=current_user.email, name=name, description=description)
        db.session.add(project)
        db.session.commit()
        return jsonify({'projectId': project.id}), 201

    @app.route("/projects/addSample/<int:project_id>", methods=["PUT"])
    @jwt_required()
    def update_project(project_id):
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"message": "Project not found"}), 404
        data = request.get_json()
        sample = data.get("sample")
        nchannels = data.get("nchannels")
        samplewidth = data.get("samplewidth")
        framerate = data.get("framerate")
        if sample:
            binary_data = base64.b64decode(sample)
            project.sample_clip = binary_data
            file_path = f"audio_{project_id}.wav"
            with wave.open(file_path, 'wb') as wf:
                wf.setnchannels(nchannels)
                wf.setsampwidth(samplewidth // 8)  # Convert bits to bytes
                wf.setframerate(framerate)
                wf.writeframes(binary_data)
        db.session.commit()
        return jsonify(project.simpleSerialize())

    @app.route("/projects", methods=["DELETE"])
    @jwt_required()
    @authenticate
    def delete_project(current_user):
        data = request.get_json() if request.is_json else request.values
        project_id = data.get("project_id")
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"message": "Project not found"}), 404
        db.session.delete(project)
        db.session.commit()
        return jsonify(project.simpleSerialize()), 200

    @app.route("/projects/<int:project_id>", methods=["GET"])
    @jwt_required()
    @authenticate
    def get_project(current_user, project_id):
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"message": "Project not found"}), 404
        if project.creator_email != current_user.email:
            return jsonify({"message": "Unauthorized"}), 401
        return jsonify({
            'versions': [session.simpleSerialize() for session in Session.query.filter_by(project_id=project_id).all()],
            'project': project.simpleSerialize()
        })

    @app.route('/upload', methods=['POST'])
    def upload():
        recording = request.files['audio']
        return process_audio_to_text(recording), 200

    @app.route('/process', methods=['GET'])
    def process():
        combined_audio = combine_recordings()
        output = io.BytesIO()
        output.seek(0)
        return send_file(output, mimetype='audio/wav')

    def combine_recordings():
        result = AudioSegment.empty()
        for recording in recordings:
            result = result.append(recording, crossfade=0)
        result.export("full.wav", format="wav")
        return result

    def process_audio_to_text(recording):
        audio = AudioSegment.from_file(recording)
        recordings.append(audio)
        audio_wav = io.BytesIO()
        audio.export(audio_wav, format="wav")
        audio_wav.seek(0)
        with sr.AudioFile(audio_wav) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language='iw-IL')
            return text

    @socketio.on('connect')
    def handle_connect():
        print('Client connected')

    @socketio.on('disconnect')
    def handle_disconnect():
        print('Client disconnected')

    @socketio.on('send_audio')
    def handle_send_audio(data):
        print(data)
        parts = data['_parts']
        audio_part = next((part for part in parts if part[0] == 'audio'), None)
        print(audio_part)
        file_data = audio_part[1].get('uri')
        print(file_data)
        #file_data = data['audio']
        audio = AudioSegment.from_file(file_data, format='wav')
        recordings.append(audio)
        audio_wav = io.BytesIO()
        audio.export(audio_wav, format="wav")
        audio_wav.seek(0)
        with sr.AudioFile(audio_wav) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data, language='iw-IL')
            emit('audio_transcription', {'text': text})
