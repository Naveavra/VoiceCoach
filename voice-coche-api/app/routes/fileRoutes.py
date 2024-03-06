from io import BytesIO
from flask import jsonify ,send_file, request, render_template
from flask_jwt_extended import jwt_required,get_jwt_identity
from models import User , Project
from init import db

def init_file_routes(app):
    @app.route('/projects/<project_id>/files/main', methods=['POST'])
    @jwt_required()
    def add_main_goal_to_project(project_id):
        if request.method == 'POST':
            current_user = get_jwt_identity()
            current_user = User.query.filter_by(email=current_user).first()
            print(current_user)
            if not current_user:
                return jsonify({"msg": "Missing user information"}), 400
            file = request.files['file']
            content = file.read()
            new_file = None#AudioFile(filename=file.filename, content=content, user=current_user)            
            project = Project.query.get(user = current_user)
            if project != None:
                if project.id == project_id:
                    project.main_goal_audio = new_file
                    db.session.add(new_file)
                    db.session.commit()
                    return f'{current_user.name} Uploaded: {file.filename} saved to DB'
                else:
                    return jsonify({"msg": "Unauthorized"}), 401
            else:
                return jsonify({"msg": "Project not found"}), 404
        else:
            return jsonify({"msg": "Method not allowed"}), 405

    @app.route('/files/download/<upload_id>')
    @jwt_required()
    def download_file(upload_id):
        upload = None#AudioFile.query.filter_by(id=upload_id).first()
        return send_file(BytesIO(upload.content), attachment_filename=upload.filename, as_attachment=True)
    

    