from io import BytesIO
import io
from flask import jsonify ,send_file, request, render_template
from flask_jwt_extended import jwt_required,get_jwt_identity
from cryptography.fernet import Fernet
from decorators import authenticate
from utils import generate_hash
from models import User , Project
from init import db
import speech_recognition as sr
from pydub import AudioSegment
import filetype
import tempfile

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
                        return jsonify({"error": "No audio file part"}), 400
                    audio_file = request.files['audio']
                    content = audio_file.read()
                    kind = filetype.guess(content)
                    if not kind is None:
                        print(kind.mime, kind.extension)
                        #supported audio files
                        format_map = {
                            'mp3': 'mp3',
                            'wav': 'wav',
                            'oga': 'ogg',
                            'ogg': 'ogg',
                            'flac': 'flac',
                            'm4a' : 'm4a',
                            'mp4' : 'mp4',
                            # Add other formats as needed
                        }
                        audio_file_like = io.BytesIO(content)
                        if kind.extension in format_map:
                            audio = AudioSegment.from_file(audio_file_like, format=format_map[kind.extension])
                            duration_seconds = audio.duration_seconds
                            
                            #Export the audio data to a BytesIO object in WAV format
                            wav_io = io.BytesIO()
                            audio.export(wav_io, format="wav")
                            wav_content = wav_io.getvalue()
                            project.sample_clip = wav_content
                            
                            #now we get the words from the sample
                            words = get_words_by_google(wav_content, duration_seconds)
                            project.sample_lines = words

                        else:
                            return jsonify({"error": "received unsupported file"}), 401
                        hash_value = generate_hash(project_id)
                        project.sample_url = hash_value

                        db.session.add(project)
                        db.session.commit()
                    else:
                        return jsonify({"error": "received unsupported file"}), 401
                    
                    return jsonify({'sample_url':hash_value}), 201
                else:
                    return jsonify({"error": "Unauthorized"}), 401
            else:
                return jsonify({"error": "Project not found"}), 404
        else:
            return jsonify({"error": "Method not allowed"}), 405

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
                    return jsonify({"error": "No sample file found"}), 404
            else:
                return jsonify({"error": "Unauthorized"}), 401
        else:
            return jsonify({"error": "Project not found"}), 404
        

    @app.route('/files/download/<sample_url>', methods=['GET'])
    def download_file(sample_url):
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
def get_words_by_google(audio_file, duration):
    ans = ""
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_wav_file:
            temp_wav_file.write(audio_file)

            recognizer = sr.Recognizer()
            song = sr.AudioFile(temp_wav_file.name)
            song_txt = ""
            
            with song as source:
                recognizer.adjust_for_ambient_noise(song)
            count = 0
            while count <= duration:
                with song as source:
                    song_aud = recognizer.record(song, duration=min(30.0, duration - count), offset=count)
                    song_txt = recognizer.recognize_google(song_aud, language="iw-IL")
                    print(song_txt)
                count = count + 30
                if len(ans) == 0:
                    ans = song_txt
                else:
                    ans = ans + ',' + song_txt
            return ans
    except Exception as e:
        print(e)
    return ans
        #return get_words_by_google(audio_file)
    

    