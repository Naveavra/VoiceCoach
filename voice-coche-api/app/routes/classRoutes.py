from io import BytesIO
from flask import jsonify ,send_file, request, render_template
from flask_jwt_extended import jwt_required,get_jwt_identity
from models import User , Project , Class ,ClassAssignment
from init import db

def init_class_routes(app):
    @app.route('/class/get_classes/<int:user_id/', methods=['GET'])
    @jwt_required()
    def get_assigned_classes_of_user(user_id):
        #get the user from the token and get the assigned classes
        current_user = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user).first()
        current_user_id = current_user.id
        if current_user_id != user_id:
            return jsonify({"message": "Unauthorized"}), 401
        cls = ClassAssignment.query.filter_by(user_id=user_id).all()
        classes = [Class.query.get(cl.class_id) for cl in cls]
        return jsonify({"classes":[class_.serialize() for class_ in classes]})

    @app.route('/class/get_created_classes/<int:user_id/', methods=['GET'])
    @jwt_required()
    def get_created_classes_of_user(user_id):
        #get the user from the token and get the created classes
        current_user = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user).first()
        current_user_id = current_user.id
        if current_user_id != user_id:
            return jsonify({"message": "Unauthorized"}), 401
        classes = Class.query.filter_by(teacher_id=current_user_id).all()
        return jsonify({"classes":[class_.serialize() for class_ in classes]})

    @app.route('/class/create', methods=['POST'])
    @jwt_required()
    def create_class():
        data = request.get_json() if request.is_json else request.values
        name = data.get("name")
        description = data.get("description")
        teacher_id = data.get("teacher_id")
        if not name or not teacher_id:
            return jsonify({"message": "Missing data"}), 400
        class_ = Class(name=name, description=description, teacher_id=teacher_id)
        db.session.add(class_)
        db.session.commit()
        return jsonify({'class_id':class_.id}), 201
    
    @app.route('/class/join_class/<int:class_id>', methods=['GET'])
    @jwt_required()
    def join_class(class_id):
        current_user = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user).first()
        class_ = Class.query.get(class_id)
        if not class_:
            return jsonify({"message": "Class not found"}), 404
        cla = ClassAssignment.query.filter_by(class_id=class_id, user_id=current_user.id).first()
        if cla:
            return jsonify({"message": "Already joined"}), 400
        cla = ClassAssignment(class_id=class_id, user_id=current_user.id)
        db.session.add(cla)
        db.session.commit()
        return jsonify({"class": class_.serialize()}), 200
    
    @app.route('/class/leave_class/<int:class_id>', methods=['GET'])
    @jwt_required()
    def leave_class(class_id):
        current_user = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user).first()
        class_ = Class.query.get(class_id)
        if not class_:
            return jsonify({"message": "Class not found"}), 404
        cla = ClassAssignment.query.filter_by(class_id=class_id , user_id=current_user.id).first()
        if not cla:
            return jsonify({"message": "Not joined"}), 400
        db.session.delete(cla)
        db.session.commit()
        return jsonify({"class": class_.serialize()}), 200
    
    @app.route('/class/delete_class', methods=['POST'])
    @jwt_required()
    def delete_class():
        current_user = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user).first()
        data = request.get_json() if request.is_json else request.values
        class_id = data.get("class_id")
        teacher_id = data.get("teacher_id")
        if not class_id or not teacher_id:
            return jsonify({"message": "Missing data"}), 400
        if current_user.id != teacher_id:
            return jsonify({"message": "Unauthorized"}), 401
        class_ = Class.query.get(class_id)
        if not class_:
            return jsonify({"message": "Class not found"}), 404
        if class_.teacher_id != teacher_id:
            return jsonify({"message": "Unauthorized"}), 401
        db.session.delete(class_)
        db.session.commit()
        return jsonify({"message": "Class deleted"}), 200
    
    @app.route('/class/get_students/<int:class_id>', methods=['GET'])
    @jwt_required()
    def get_students_of_class(class_id):
        current_user = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user).first()
        class_ = Class.query.get(class_id)
        if not class_:
            return jsonify({"message": "Class not found"}), 404
        if class_.teacher_id != current_user.id:
            return jsonify({"message": "Unauthorized"}), 401
        cls = ClassAssignment.query.filter_by(class_id=class_id).all()
        students = [User.query.get(cl.user_id) for cl in cls]
        return jsonify({"students":[student.serialize() for student in students]})
    
    
