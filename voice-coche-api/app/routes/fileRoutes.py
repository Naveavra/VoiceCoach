from io import BytesIO
from flask import jsonify ,send_file, request, render_template
from flask_jwt_extended import jwt_required,get_jwt_identity
from models import AudioFile , User
from init import db

def init_file_routes(app):
    @app.route('/files/upload', methods=['GET', 'POST'])
    @jwt_required()
    def add_file():
        if request.method == 'POST':
            current_user = get_jwt_identity()
            print("sucess!!")
            print(current_user)
            current_user = User.query.filter_by(email=current_user).first()
            print(current_user)
            if not current_user:
                return jsonify({"msg": "Missing user information"}), 400
            file = request.files['file']
            content = file.read()
            new_file = AudioFile(filename=file.filename, content=content, user=current_user)            
            db.session.add(new_file)
            db.session.commit()

            return f'{current_user.name} Uploaded: {file.filename} saved to DB'
        return render_template('index.html')
    
    @app.route('/files/download/<upload_id>')
    def download_file(upload_id):
        upload = AudioFile.query.filter_by(id=upload_id).first()
        return send_file(BytesIO(upload.content), attachment_filename=upload.filename, as_attachment=True)