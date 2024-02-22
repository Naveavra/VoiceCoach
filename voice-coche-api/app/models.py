from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class AudioFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    content = db.Column(db.LargeBinary, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', back_populates='audio_files')

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    password_hash = db.Column(db.String(258), nullable=False)
    active = db.Column(db.Boolean(), default=True, nullable=False)
    audio_files = db.relationship('AudioFile', back_populates='user', cascade='all, delete-orphan')

    def __init__(self, email, name, password):
        self.email = email
        self.name = name
        self.set_password(password)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Student(User):
    __tablename__ = "students"

    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    grade = db.Column(db.String(50), nullable=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
    class_ = db.relationship('Class', back_populates='students')

    def __init__(self, email, name, password, grade, class_):
        super().__init__(email, name, password)
        self.grade = grade
        self.class_ = class_

class Teacher(User):
    __tablename__ = "teachers"

    id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    subject = db.Column(db.String(50), nullable=True)

    def __init__(self, email, name, password, subject):
        super().__init__(email, name, password)
        self.subject = subject

class Class(db.Model):
    __tablename__ = "classes"

    id = db.Column(db.Integer, primary_key=True)
    class_name = db.Column(db.String(128), nullable=False)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    teacher = db.relationship('Teacher', back_populates='classes')
    students = db.relationship('Student', back_populates='class_')

    def __init__(self, class_name, teacher, students=[]):
        self.class_name = class_name
        self.teacher = teacher
        self.students = students

Teacher.classes = db.relationship('Class', back_populates='teacher', cascade='all, delete-orphan')
Student.class_ = db.relationship('Class', back_populates='students')
