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
        print(data)
        parasha = data.get("parasha")
        aliyah = data.get("aliyah")
        description = data.get("description")
        project = Project(creator=current_user.email, parasha=parasha,aliyah=aliyah, description=description)
        db.session.add(project)
        db.session.commit()
        return jsonify(project.simpleSerialize()), 201


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
            'sessions': [session.simpleSerialize() for session in Session.query.filter_by(project_id=project_id).all()],
            'project': project.simpleSerialize()
        }), 200

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