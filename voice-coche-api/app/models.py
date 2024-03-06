from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(128), unique=True, nullable=False)
    username = db.Column(db.String(128), nullable=False)
    password_hash = db.Column(db.String(258), nullable=False)
    projects = db.relationship('Project', backref='creator', lazy=True)
    assigned_classes = db.relationship('Class', secondary='class_assignment', backref='students', lazy=True)
    created_classes = db.relationship('Class', backref='teacher', lazy=True)

    def __init__(self, email, username, password):
        self.email = email
        self.username = username
        self.set_password(password)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Recording(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    recording = db.Column(db.LargeBinary, nullable=False)
    analysis_id = db.Column(db.Integer, db.ForeignKey('analysis.id'), nullable=True)
    analysis = db.relationship('Analysis', backref='recording', lazy=True)

class Analysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Add more fields for analysis if needed

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    creator_email = db.Column(db.String(128), db.ForeignKey('user.email'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    sample_clip = db.Column(db.LargeBinary, nullable=True)
    recordings = db.relationship('Recording', backref='project', lazy=True)

class Class(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    notifications = db.relationship('Notification', backref='class_', lazy=True)
    tasks = db.relationship('Task', backref='class_', lazy=True)

    def serialize(self):
        teacher_name = User.query.filter_by(id=self.teacher_id).first().name
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'teacher_id': self.teacher_id,
            'teacher_name': teacher_name
        }
class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(128), nullable=False)
    receiver_id = db.Column(db.Integer, nullable=False)
    message = db.Column(db.String(255), nullable=False)
    notification_type = db.Column(db.Enum('JOIN_REQUEST', 'FEEDBACK_MSG', name='notification_type_enum'), nullable=False)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    sample = db.Column(db.LargeBinary, nullable=True)
    task_projects = db.relationship('TaskProject', backref='task', lazy=True)

class TaskProject(Project):
    id = db.Column(db.Integer, db.ForeignKey('project.id'), primary_key=True)
    feedbacks = db.relationship('Notification', backref='task_project', lazy=True)

class ClassAssignment(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), primary_key=True)



































































# from flask_sqlalchemy import SQLAlchemy
# from werkzeug.security import generate_password_hash, check_password_hash

# db = SQLAlchemy()

# class AudioFile(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     filename = db.Column(db.String(255), nullable=False)
#     content = db.Column(db.LargeBinary, nullable=False)
#     analysis = db.Column(db.String(255), nullable=True)
#     project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
#     project = db.relationship('Project', back_populates='audio_files', foreign_keys=[project_id])

# class Project(db.Model):
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(255), nullable=True)
#     description = db.Column(db.String(255), nullable=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
#     user = db.relationship('User', back_populates='projects')
#     main_goal_audio_id = db.Column(db.Integer, db.ForeignKey('audio_file.id'), nullable=True)
#     audio_files = db.relationship('AudioFile', back_populates='project', cascade='all, delete-orphan',foreign_keys=[AudioFile.project_id])

#     def __init__(self,user, name, description):
#         self.name = name
#         self.user = user
#         self.description = description
        
#     def serialize(self):
#         return {
#             'id': self.id,
#             'user_id': self.user_id,
#             'name': self.name,
#             'description': self.description
#             # Add more fields if needed
#         }

# class User(db.Model):
#     __tablename__ = "users"

#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String(128), nullable=False)
#     email = db.Column(db.String(128), unique=True, nullable=False)
#     password_hash = db.Column(db.String(258), nullable=False)
#     active = db.Column(db.Boolean(), default=True, nullable=False)
#     projects = db.relationship('Project', back_populates='user', cascade='all, delete-orphan')

#     def __init__(self, email, name, password):
#         self.email = email
#         self.name = name
#         self.set_password(password)

#     def set_password(self, password):
#         self.password_hash = generate_password_hash(password)

#     def check_password(self, password):
#         return check_password_hash(self.password_hash, password)

# class Student(User):
#     __tablename__ = "students"

#     id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
#     grade = db.Column(db.String(50), nullable=True)
#     class_id = db.Column(db.Integer, db.ForeignKey('classes.id'), nullable=False)
#     class_ = db.relationship('Class', back_populates='students')

#     def __init__(self, email, name, password, grade, class_):
#         super().__init__(email, name, password)
#         self.grade = grade
#         self.class_ = class_

# class Teacher(User):
#     __tablename__ = "teachers"

#     id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
#     subject = db.Column(db.String(50), nullable=True)

#     def __init__(self, email, name, password, subject):
#         super().__init__(email, name, password)
#         self.subject = subject

# class Class(db.Model):
#     __tablename__ = "classes"

#     id = db.Column(db.Integer, primary_key=True)
#     class_name = db.Column(db.String(128), nullable=False)
#     teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
#     teacher = db.relationship('Teacher', back_populates='classes')
#     students = db.relationship('Student', back_populates='class_')

#     def __init__(self, class_name, teacher, students=[]):
#         self.class_name = class_name
#         self.teacher = teacher
#         self.students = students

# Teacher.classes = db.relationship('Class', back_populates='teacher', cascade='all, delete-orphan')
# Student.class_ = db.relationship('Class', back_populates='students')
