from flask import request
from flask import request, jsonify
from init import db
from models import Parasha

def init_parasha_routes(app):
    @app.route('/parasha', methods=['POST'])
    def post_parasha():
        data = request.get_json() if request.is_json else request.values
        array = data['array']
        parasha = data['parasha']
        aliya = int(data['aliya'])
        clean = False if data['clean'] == "false" else True
        full_text =""
        for pasuk in array:
            full_text += pasuk +','
        print(full_text)
        p = Parasha(parasha=parasha,aliya=aliya,clean = clean,text = full_text)
        db.session.add(p)
        db.session.commit()
        return {"msg":"Parasha added successfully"}
    
    @app.route('/parasha', methods=['GET'])
    def get_parasha():
        data = request.get_json() if request.is_json else request.values
        parasha = data['parasha']
        aliya = int(data['aliya'])
        clean = bool(data['clean'])
        return Parasha.query.filter_by(parasha=parasha, aliya=aliya ,clean=clean).first().serialize()