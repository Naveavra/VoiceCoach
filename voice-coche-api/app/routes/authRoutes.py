from flask import Flask, render_template, request, jsonify
from models import User
from init import db
from flask_jwt_extended import create_access_token
from ..decorators import logout_required



def init_auth_routes(app):
    @app.route("/users/login", methods=["POST"])
    @logout_required
    def login():
        data = request.get_json() if request.is_json else request.values
        print(data)
        if not data:
            return jsonify({
                "error": "Please provide user details"
            }), 400
        email = data.get('email')
        password = data.get('password')
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        else :
            if not user.check_password(password):
                return jsonify({'error': 'Invalid email or password'}), 401
            access_token = create_access_token(identity=email)
            return jsonify({'user_id' :user.id,'token': access_token }), 200
        

    @app.route("/users/register", methods=['GET','POST'])
    @logout_required
    def register():
        if request.method == "POST":
            access_token = ""
            data = request.get_json() if request.is_json else request.values
            print(data)
            email = data.get('email')
            password = data.get('password')
            name = email.split('@')[0]
            print(email, password,name)
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return jsonify({'error': 'User already exists'}), 400
            else:
                new_user = User(name=name, email=email, password=password)
                db.session.add(new_user)
                db.session.commit()
                access_token = create_access_token(identity=email)
                return jsonify({'token': access_token}), 200
