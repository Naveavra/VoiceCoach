from flask import Flask, jsonify
from pydub import AudioSegment
from flask import send_file

app = Flask(__name__)

@app.route("/")
def retrunInt():
    return jsonify(200)

@app.route("/song")
def returnSong():
    path_to_file = "C:\\Users\\bench\\Desktop\\פרויקט\\VoiceCoach\\backend\\Easy Piano Tutorial_ Twinkle Twinkle Little Star.wav"
    return send_file(
         path_to_file, 
         mimetype="audio/wav", 
         as_attachment=True)

@app.route("/image")
def returnImage():
    path_to_file = "C:\\Users\\bench\\Desktop\פרויקט\\VoiceCoach\\backend\\background.png"
    return send_file(
         path_to_file, 
         as_attachment=True)

def fromMp3ToWav(filePath, name):
    sound = AudioSegment.from_mp3(filePath + name + ".mp3")
    sound.export(filePath + name + ".wav", format = "wav")

if __name__ == "__main__":
    fromMp3ToWav("C:\\Users\\bench\\Desktop\\פרויקט\\VoiceCoach\\backend\\", "Easy Piano Tutorial_ Twinkle Twinkle Little Star")
    app.run(host = "127.0.0.1", port = 5000, debug = True)