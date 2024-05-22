from datetime import datetime
from flask import Flask, render_template, request, jsonify, url_for
from myemail import send_email
from auth.token import generate_token ,confirm_token
from models import User
from init import db
from flask_jwt_extended import create_access_token



def init_auth_routes(app,login_manager,mail):
    @app.route("/users/login", methods=["POST"])
    @login_manager.user_loader
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
        if not user.is_confirmed:
            return jsonify({'error': 'Please confirm your email'}), 401
        else :
            if not user.check_password(password):
                return jsonify({'error': 'Invalid email or password'}), 401
            access_token = create_access_token(identity=email)
            return jsonify({'data' :{'id':user.id,'name':user.username,'email':email},'token': access_token }), 200
        

    @app.route("/users/register", methods=['GET','POST'])
    def register():
        if request.method == "POST":
            data = request.get_json() if request.is_json else request.values
            print(data)
            email = data.get('email')
            password = data.get('password')
            name = email.split('@')[0]
            existing_user = db.session.query(User).filter(User.email==email).all()
            if existing_user:
                return jsonify({'error': 'User already exists'}), 400
            else:
                try:
                    new_user = User(email=email,username=name, password=password)
                    db.session.add(new_user)
                    db.session.commit()
                    email_token = generate_token(email,app)
                    confirm_url = url_for("confirm_email", token=email_token, _external=True)
                    html = render_template("confirm_email.html", confirm_url=confirm_url)
                    subject = "Please confirm your email"
                    send_email(app,mail,email, subject, html)
                           
                    return jsonify({'msg':'email send success'}), 200
                except Exception as e:
                    print(e)
                    #delete the user if the email is not sent
                    db.session.delete(new_user)
                    db.session.commit()
                    return jsonify({'error': 'Error creating user'}), 400


    @app.route("/users/confirm/<token>")
    @login_manager.user_loader
    def confirm_email(token):
        try:
            email = confirm_token(token,app)
            user = User.query.filter_by(email=email).first_or_404()
            if user is not None :
                if user.is_confirmed:
                    return jsonify({'message': 'Account already confirmed. Please login.'}), 200
                user.is_confirmed = True
                user.confirmed_on = datetime.now()
                db.session.add(user)
                db.session.commit()
                return jsonify({'message': 'Account confirmed.'}), 200
            else:
                return jsonify({'error': 'Invalid token.'}), 400
        except Exception as e:
            return jsonify({'error': 'Invalid token.'}), 400