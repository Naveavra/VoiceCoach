from io import BytesIO
import io
from flask import jsonify ,send_file, request, render_template
from flask_jwt_extended import jwt_required,get_jwt_identity
from models import User , Project ,Session
from init import db

import time


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
                    decrypt_start = time.time()
                    decrypted_content = cipher_suite.decrypt(project.sample_clip)
                    decrypt_end = time.time()
                    print('Decrypt time:',decrypt_end-decrypt_start)
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
    

    

    # if request.method == 'POST':
    #         current_user = get_jwt_identity()
    #         current_user = User.query.filter_by(email=current_user).first()
    #         print(current_user)
    #         if not current_user:
    #             return jsonify({"msg": "Missing user information"}), 400
    #         project = Project.query.filter_by(creator_email=current_user.email).first()
    #         if project != None:
    #             if project.id == project_id:
    #                 audio_file = request.files['audio']
    #                 #file = request.files['file']
    #                 reading_start = time.time()
    #                 content = audio_file.read()
    #                 reading_end = time.time()
    #                  # Get the size of the file before compression
    #                 file_size_before = len(content)
    #                 print(f"File size before compression: {file_size_before} bytes")
    #                 # Encrypt the file content
    #                 #encrypted_content = cipher_suite.encrypt(content)
    #                 compress_start = time.time()
    #                 compressed_audio = io.BytesIO()
    #                 with zipfile.ZipFile(compressed_audio, 'w', zipfile.ZIP_DEFLATED) as zip_file:
    #                     zip_file.writestr(audio_file.filename, content)
    #                 compressed_audio.seek(0)
    #                 compress_end = time.time()
                    
    #                 compressed_audio_size = len(compressed_audio.getvalue())
    #                 print(f"Compressed file size: {compressed_audio_size} bytes")
                
    #                 saving_compress_start = time.time()
    #                 record = Session(project_id = project_id,Session=compressed_audio.read())            
    #                 db.session.add(record)
    #                 db.session.commit()
    #                 saving_compress_end = time.time()
    #                 saving_uncompress_start = time.time()
    #                 un_zip_record = Session(project_id = project_id,Session=content) 
    #                 db.session.add(un_zip_record)
    #                 db.session.commit()         
    #                 saving_uncompress_end = time.time()
    #                 #print all the times
    #                 print('Reading time:',reading_end-reading_start)
    #                 print('Compress time:',compress_end-compress_start)
    #                 print('Saving compress time:',saving_compress_end-saving_compress_start)
    #                 print('Saving uncompress time:',saving_uncompress_end-saving_uncompress_start)  
    #                 return jsonify({"msg":"File uploaded successfully"}), 201
    #             else:
    #                 return jsonify({"msg": "Unauthorized"}), 401
    #         else:
    #             return jsonify({"msg": "Project not found"}), 404
    #     else:
    #         return jsonify({"msg": "Method not allowed"}), 405