from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Project , User
from init import db

def init_project_routes(app):
    @app.route("/projects/get_all/<int:user_id>", methods=["GET"])
    @jwt_required()
    def get_all_projects(user_id):
        current_user = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user).first()
        current_user_id = current_user.id
        if current_user_id != user_id:
            return jsonify({"message": "Unauthorized"}), 401
        projects = Project.query.filter_by(user_id=user_id).all()
        return jsonify({"projects":[project.serialize() for project in projects]})

    @app.route("/projects/get_one/<int:user_id>/<int:project_id>", methods=["GET"])
    def get_project(user_id,project_id):
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"message": "Project not found"}), 404
        return jsonify(project.serialize())

    @app.route("/projects/create/<int:user_id>", methods=["POST"])
    @jwt_required()
    def create_project(user_id):
        print("create")
        data = request.get_json() if request.is_json else request.values
        print(data)
        # main_goal_audio_id = data.get("main_goal_audio_id")
        current_user = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user).first()
        if not current_user:
                return jsonify({"error": "Missing user information"}), 400
        if current_user.id != user_id:
            return jsonify({"error": "Unauthorized"}), 401
        name = data.get("name")
        description = data.get("description")
        # if not main_goal_audio_id or not user_id:
        #     return jsonify({"message": "Missing data"}), 400
        project = Project(user=current_user,name=name, description=description)
        db.session.add(project)
        db.session.commit()
        return jsonify({'msg':"success"}), 201

    @app.route("/projects/<int:project_id>", methods=["PUT"])
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
