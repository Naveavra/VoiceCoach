from functools import wraps

from flask import jsonify
from flask_login import current_user

from flask_jwt_extended import get_jwt_identity
from models import User

def authenticate(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        current_user_email = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user_email).first()
        if not current_user:
            return jsonify({"error": "Missing user information"}), 400
        return func(current_user, *args, **kwargs)
    return wrapper 

# authurize should get email and current_user as arguments
def authorize(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        current_user_email = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user_email).first()
        if not current_user:
            return jsonify({"error": "Missing user information"}), 400
        email = kwargs.get('email')
        if current_user.email != email:
            return jsonify({"error": "Unauthorized"}), 401
        return func(current_user, *args, **kwargs)
    return wrapper
    

def logout_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if current_user.is_authenticated:
            return jsonify({'error': 'You are already authenticated.'}), 401 
        return func(*args, **kwargs)
    return decorated_function

def login_required(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            return jsonify({'error': 'You need to be authenticated to access this page.'}), 401
        return func(*args, **kwargs)
    return decorated_function

