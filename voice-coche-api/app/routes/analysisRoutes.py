from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from decorators import authenticate, authorize
from models import Project , User
from init import db

def init_analysis_routes(app):
    @app.route("/analysis/getWords/<int:project_id>", methods=["GET"])
    @jwt_required()
    def create_project(project_id):
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"message": "Project not found"}), 404
        data = request.get_json()
        duration = data.get("duration")
        offset = data.get("offset")
        recording = data.get("recording")
        if recording:
            audio_data = io.BytesIO(base64.b64decode(sample))
            binary_data = audio_data.read()
            project.sample_clip = binary_data
        db.session.commit()
        return jsonify(project.simpleSerialize())