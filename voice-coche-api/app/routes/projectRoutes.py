from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorators import authenticate, authorize
from models import Project , User
from init import db
from .analysis.get_words import getWords
import io
import base64
import wave

def init_project_routes(app):
    @app.route("/projects/get_all/<string:email>", methods=["GET"])
    @jwt_required()
    def get_all_projects(email):
        print(email)
        projects = Project.query.filter_by(creator_email=email).all()
        return jsonify({"projects":[project.simpleSerialize() for project in projects]})

    @app.route("/projects/create/<string:email>", methods=["POST"])
    @jwt_required()
    def create_project(email):
        data = request.get_json() if request.is_json else request.values
        name = data.get("name")
        description = data.get("description")
        project = Project(creator=email,name=name, description=description)
        db.session.add(project)
        db.session.commit()
        return jsonify({'projectId':project.id}), 201

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
        print(nchannels, samplewidth, framerate)
        if sample:
            binary_data = base64.b64decode(sample)
            project.sample_clip = binary_data
            file_path = f"audio_{project_id}.wav"
            with wave.open(file_path, 'wb') as wf:
                wf.setnchannels(nchannels)
                wf.setsampwidth(samplewidth // 8)  # Convert bits to bytes
                wf.setframerate(framerate)
                wf.writeframes(binary_data)
            '''
            text, syllables = getWords(project.id ,binary_data,nchannels, samplewidth, framerate, 20, 0)
            project.sample_lines = text
            project.sample_syllables = syllables
            '''
        db.session.commit()
        return jsonify(project.simpleSerialize())
    
    @app.route("/projects/<int:project_id>", methods=["DELETE"])
    def delete_project(project_id):
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"message": "Project not found"}), 404
        db.session.delete(project)
        db.session.commit()
        return jsonify({"message": "Project deleted"}), 200

    #add version to project
    @app.route("/projects/add_version/<int:project_id>", methods=["PUT"])
    @jwt_required()
    def add_version(project_id):
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"message": "Project not found"}), 404
        data = request.get_json()
        version = data.get("version")
        if version:
            project.version = version
        db.session.commit()
        return jsonify(project.serialize())
