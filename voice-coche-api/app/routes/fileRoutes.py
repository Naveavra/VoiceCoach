from io import BytesIO
import io
from flask import jsonify ,send_file, request, render_template
from flask_jwt_extended import jwt_required,get_jwt_identity
from models import User , Project
from init import db


from cryptography.fernet import Fernet

# Generate a secret key for encryption
SECRET_KEY = Fernet.generate_key()
cipher_suite = Fernet(SECRET_KEY)

def init_file_routes(app):
    
    @app.route('/projects/uploade_main/<int:project_id>', methods=['POST'])
    @jwt_required()
    def add_main_goal_to_project(project_id):
        if request.method == 'POST':
            current_user = get_jwt_identity()
            current_user = User.query.filter_by(email=current_user).first()
            if not current_user:
                return jsonify({"msg": "Missing user information"}), 400
            project = Project.query.filter_by(creator_email=current_user.email).first()
            if project != None:
                if project.id == project_id:
                    audio_file = request.files['audio']
                    content = audio_file.read()
                    encrypted_content = cipher_suite.encrypt(content)
                    project.sample_clip = encrypted_content
                    db.session.commit()
                    return jsonify({"msg":"File uploaded successfully"}), 201
                else:
                    return jsonify({"msg": "Unauthorized"}), 401
            else:
                return jsonify({"msg": "Project not found"}), 404
        else:
            return jsonify({"msg": "Method not allowed"}), 405

    @app.route('/projects/get_sample/<int:project_id>', methods=['GET'])
    @jwt_required()
    def get_sample(project_id):
        current_user = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user).first()
        if not current_user:
            return jsonify({"msg": "Missing user information"}), 400
        project = Project.query.filter_by(creator_email=current_user.email).first()
        if project != None:
            if project.id == project_id:
                if project.sample_clip:
                    # Decrypt the file content
                    decrypted_content = cipher_suite.decrypt(project.sample_clip)
                    return send_file(BytesIO(decrypted_content), attachment_filename="sample.wav", as_attachment=True)
                else:
                    return jsonify({"msg": "No sample file found"}), 404
            else:
                return jsonify({"msg": "Unauthorized"}), 401
        else:
            return jsonify({"msg": "Project not found"}), 404
        

    @app.route('/files/download/<upload_id>')
    @jwt_required()
    def download_file(upload_id):
        upload = None#AudioFile.query.filter_by(id=upload_id).first()
        return send_file(BytesIO(upload.content), attachment_filename=upload.filename, as_attachment=True)
    

    