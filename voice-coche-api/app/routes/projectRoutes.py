from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorators import authenticate, authorize
from models import Project , User
from init import db

def init_project_routes(app):
    @app.route("/projects/get_all", methods=["GET"])
    @jwt_required()
    @authenticate
    def get_all_projects(current_user):
        print(current_user.email)
        projects = Project.query.filter_by(creator_email=current_user.email).all()
        return jsonify({"projects":[project.simpleSerialize() for project in projects]})

    @app.route("/projects/create", methods=["POST"])
    @jwt_required()
    @authenticate
    #@authorize
    def create_project(current_user):
        data = request.get_json() if request.is_json else request.values
        name = data.get("name")
        description = data.get("description")
        project = Project(creator=current_user.email,name=name, description=description)
        db.session.add(project)
        db.session.commit()
        return jsonify({'projectId':project.id}), 201

    @app.route("/projects/<int:project_id>", methods=["PUT"])
    @jwt_required()
    def update_project(project_id):
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"message": "Project not found"}), 404
        data = request.get_json()
        main_goal_audio_id = data.get("main_goal_audio_id")
        if main_goal_audio_id:
            project.main_goal_audio_id = main_goal_audio_id
        db.session.commit()
        return jsonify(project.serialize())
    
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
