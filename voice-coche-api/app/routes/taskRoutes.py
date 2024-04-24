from flask import jsonify ,request
from flask_jwt_extended import jwt_required,get_jwt_identity
from decorators import authenticate
from models import User , Class ,ClassAssignment
from init import db

def init_task_routes(app):
    # gets the tasks assigned to the user in the classes
    @app.route('/class/my_tasks', methods=['GET'])
    @jwt_required()
    @authenticate
    def get_assigned_classes_of_user(current_user):
        cls = ClassAssignment.query.filter_by(user_id=current_user.id).all()
        classes = [Class.query.get(cl.class_id) for cl in cls]
        return jsonify({"classes":[class_.serialize() for class_ in classes]})
