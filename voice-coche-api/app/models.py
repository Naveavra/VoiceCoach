from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin,db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(128), unique=True, nullable=False)
    username = db.Column(db.String(128), nullable=False)
    password_hash = db.Column(db.String(258), nullable=False)
    projects = db.relationship('Project', backref='creator', lazy=True)
    assigned_classes = db.relationship('Class', secondary='class_assignment', backref='students', lazy=True)
    created_classes = db.relationship('Class', backref='teacher', lazy=True)
    is_admin = db.Column(db.Boolean(), default=False, nullable=False)
    is_confirmed = db.Column(db.Boolean(), default=False, nullable=False)
    confirmed_on = db.Column(db.DateTime(), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Creation date

    def __init__(self, email, username, password, is_admin=False, is_confirmed=False, confirmed_on=None):
        self.email = email
        self.username = username
        self.set_password(password)
        self.is_admin = is_admin
        self.is_confirmed = is_confirmed
        self.confirmed_on = confirmed_on

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    Session = db.Column(db.LargeBinary, nullable=False)
    analysis_id = db.Column(db.Integer, db.ForeignKey('analysis.id'), nullable=True)
    analysis = db.relationship('Analysis', backref='Session', lazy=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Creation date

    def __init__(self, project_id, Session):
        self.project_id = project_id
        self.Session = Session
        self.created_at = datetime.utcnow()

class Analysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sessionId = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    rhytem = db.Column(db.String(255), nullable=True)
    pitch = db.Column(db.String(255), nullable=True)
    wordsAndNoteTiming = db.Column(db.String(255), nullable=True)
    vowelsDeviation = db.Column(db.String(255), nullable=True)
    wordsMismatch = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Creation date

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    creator_email = db.Column(db.String(128), db.ForeignKey('user.email'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    sample_clip = db.Column(db.LargeBinary, nullable=True)
    sample_lines = db.Column(db.Text, nullable=True)
    sample_syllables = db.Column(db.Text, nullable=True)
    sessions = db.relationship('Session', backref='project', lazy=True)
    created_at_project = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Creation date

    def __init__(self, creator, name, description):
        self.creator_email = creator
        self.name = name
        self.description = description
        self.created_at = datetime.utcnow()
    
    def simpleSerialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
        } 
    def deepSerialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'creator': self.creator_email,
            'created_at': self.created_at_project,
        }

class Class(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    notifications = db.relationship('Notification', backref='class', lazy=True)
    tasks = db.relationship('Task', backref='class_', lazy=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Creation date

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
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), nullable=False)
    task_project_id = db.Column(db.Integer, db.ForeignKey('task_project.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Creation date

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), nullable=False)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    sample = db.Column(db.LargeBinary, nullable=True)
    task_projects = db.relationship('TaskProject', backref='task', lazy=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Creation date

class TaskProject(Project):
    id = db.Column(db.Integer, db.ForeignKey('project.id'), primary_key=True)
    feedbacks = db.relationship('Notification', backref='task_project', lazy=True)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    created_at_task_project = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Creation date

    def __init__(self, creator, name, description):
            super().__init__(creator, name, description)  # Call the parent class's __init__ method
            self.created_at_task_project = datetime.utcnow()

class ClassAssignment(db.Model):
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    class_id = db.Column(db.Integer, db.ForeignKey('class.id'), primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Creation date
