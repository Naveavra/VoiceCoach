from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
import json

db = SQLAlchemy()

class User(UserMixin,db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(128), unique=True, nullable=False)
    username = db.Column(db.String(128), nullable=False)
    password_hash = db.Column(db.String(258), nullable=False)
    projects = db.relationship('Project', backref='creator', cascade="all, delete", lazy=True)
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
    recording = db.Column(db.LargeBinary, nullable=True)
    analysis_id = db.Column(db.Integer, db.ForeignKey('analysis.id'), nullable=True)
    analysis = db.relationship('Analysis', backref='Session', cascade="all, delete", lazy=True)
    session_lines = db.Column(db.Text, nullable=True)
    session_teamim = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Creation date
    url = db.Column(db.String(255), nullable=True)

    def __init__(self, project_id):
        self.project_id = project_id
        self.created_at = datetime.utcnow()

    def simpleSerialize(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'created_at': self.created_at,
            'url': self.url,
        }

class Analysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    words = db.Column(db.Text, nullable=True)
    teamim = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Creation date

    def __init__(self, words, teamim):
        self.words = words
        self.teamim = teamim
        self.created_at = datetime.utcnow()
    
    def simpleSerialize(self):
        return {
            'words': json.loads(self.words),
            'teamim': json.loads(self.teamim),
            'created_at': self.created_at
        }


class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    creator_email = db.Column(db.String(128), db.ForeignKey('user.email'), nullable=False)
    parasha = db.Column(db.String(255), nullable=False)
    aliyah = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    sample_url = db.Column(db.String(255), nullable=True)
    sample_clip = db.Column(db.LargeBinary, nullable=True)
    sample_lines = db.Column(db.Text, nullable=True)
    sample_teamim = db.Column(db.Text, nullable=True)
    sessions = db.relationship('Session', backref='project', cascade="all, delete", lazy=True)

    parasha_id = db.Column(db.Integer, db.ForeignKey('parasha.id'), nullable=True)
    parasha_ref = db.relationship('Parasha', backref='projects', lazy=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Creation date

    def __init__(self, creator, parasha,aliyah, description):
        self.creator_email = creator
        self.parasha = parasha
        self.aliyah = aliyah
        self.description = description
        self.created_at = datetime.utcnow()
    
    def simpleSerialize(self):
        return {
            'id': self.id,
            'parasha': self.parasha,
            'aliyah': self.aliyah,
            'description': self.description,
            'clean_text': self.sample_lines if self.sample_lines is not None else "",
            'mark_text': "בראשית ברא אלוהים",
            'created_at': self.created_at,
            'sample_url': self.sample_url
        } 



class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(128), nullable=False)
    receiver_id = db.Column(db.Integer, nullable=False)
    message = db.Column(db.String(255), nullable=False)
    notification_type = db.Column(db.Enum('JOIN_REQUEST', 'FEEDBACK_MSG', name='notification_type_enum'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)  # Creation date


class Parasha(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    parasha = db.Column(db.String(255), nullable=False)
    clean = db.Column(db.Boolean, nullable=False)
    aliya = db.Column(db.String(255), nullable=False)
    text = db.Column(db.Text, nullable=False)
    
    def serialize(self):
        return {
            'parasha': self.parasha,
            'clean': self.clean,
            'aliya': self.aliya,
            'text': self.text
        }
    

