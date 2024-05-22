from io import BytesIO
import io
from flask import jsonify ,send_file, request, render_template
from flask_jwt_extended import jwt_required,get_jwt_identity
from cryptography.fernet import Fernet
from decorators import authenticate
from utils import generate_hash
from models import User , Project
from init import db

def init_file_routes(app):
    
    @app.route('/projects/<int:project_id>/uploade_sample', methods=['POST'])
    @jwt_required()
    @authenticate
    def add_sample(current_user,project_id):
        #cipher_suite = Fernet(app.config['SECRET_KEY'])
        if request.method == 'POST':
            project = Project.query.filter_by(id=project_id).first()
            if project != None:
                if project.creator_email == current_user.email:
                    if 'audio' not in request.files:
                        return jsonify({"msg": "No audio file part"}), 400
                    audio_file = request.files['audio']
                    content = audio_file.read()
                    #encrypted_content = cipher_suite.encrypt(content)
                    project.sample_clip = content
                    
                    hash_value = generate_hash(project_id)
                    project.sample_url = hash_value
                    db.session.commit()
                    
                    return jsonify({"msg":"File uploaded successfully"}), 201
                else:
                    return jsonify({"msg": "Unauthorized"}), 401
            else:
                return jsonify({"msg": "Project not found"}), 404
        else:
            return jsonify({"msg": "Method not allowed"}), 405
        
     #add version to project
    @app.route("/projects/<int:project_id>/upload_version", methods=["POST"])
    @jwt_required()
    @authenticate
    def add_version(current_user,project_id):
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"message": "Project not found"}), 404
        data = request.get_json()
        version = data.get("version")
        if version:
            project.version = version
        db.session.commit()
        return jsonify(project.serialize()), 200

    @app.route('/projects/<int:project_id>/get_sample_url', methods=['GET'])
    @jwt_required()
    @authenticate
    def get_sample_url(current_user,project_id):
        project = Project.query.filter_by(creator_email=current_user.email).first()
        if project != None:
            if project.id == project_id:
                if project.sample_clip:
                    # Decrypt the file content
                    # decrypted_content = cipher_suite.decrypt(project.sample_clip)
                    # return send_file(BytesIO(decrypted_content), attachment_filename="sample.wav", as_attachment=True)
                    return jsonify({"url": project.sample_url}), 200
                else:
                    return jsonify({"msg": "No sample file found"}), 404
            else:
                return jsonify({"msg": "Unauthorized"}), 401
        else:
            return jsonify({"msg": "Project not found"}), 404
        

    @app.route('/files/download/<sample_url>', methods=['GET'])
    def download_file(sample_url):
        cipher_suite = Fernet(app.config['SECRET_KEY'])
        project = Project.query.filter_by(sample_url=sample_url).first()
        if not project:
            return jsonify({"msg": "Project not found"}), 404
        #decrypted_content = cipher_suite.decrypt(project.sample_clip)
        return send_file(BytesIO(project.sample_clip), 
                         download_name="sample.wav",  # Specify the download name
                         as_attachment=True, 
                         mimetype='audio/wav')
      
        # upload = None#AudioFile.query.filter_by(id=upload_id).first()
        # return send_file(BytesIO(upload.content), attachment_filename=upload.filename, as_attachment=True)
    

    