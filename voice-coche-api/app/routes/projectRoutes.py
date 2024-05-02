from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorators import authenticate, authorize
from models import Project , User
from init import db
from .analysis.get_words import getWords
import io
import base64

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
        print("here")
        print(project.id)
        return jsonify({'projectId':project.id}), 201

    @app.route("/projects/addSample/<int:project_id>", methods=["PUT"])
    @jwt_required()
    def update_project(project_id):
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"message": "Project not found"}), 404
        data = request.get_json()
        sample = data.get("sample")
        if sample:
            audio_data = io.BytesIO(base64.b64decode(sample))
            binary_data = audio_data.read()
            project.sample_clip = binary_data
            text, syllables = getWords(project.id ,binary_data, 20, 0)
            project.sample_lines = text
            project.sample_syllables = syllables
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
