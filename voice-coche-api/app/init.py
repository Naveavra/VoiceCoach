from flask import Flask, Blueprint
from flask_migrate import Migrate
from flask_mail import Mail
from flask_jwt_extended import JWTManager
from flask_login import LoginManager
from tasks import delete_unconfirmed_users
from flask_socketio import SocketIO

from models import db
from routes import init_routes
from manage import init_commands

import atexit

from apscheduler.schedulers.background import BackgroundScheduler


def create_app():
    app = Flask(__name__)
    app.config.from_object("config")
    users = Blueprint("users", __name__)
    activate = Blueprint("activate", __name__)
    login_manager = LoginManager()

    # Initialize database
    db.init_app(app)
    jwt = JWTManager(app)

    # Initialize mail
    mail = Mail(app)
    
    try:
        with app.app_context():
            db.create_all()
    except Exception as e:
        print(f"Error connecting to the database: {e}")

    # Initialize migration
    migrate = Migrate(app, db)
    login_manager.init_app(app)
    print("App initialization completed")
    
    # Initialize SocketIO
    socketio = SocketIO(app, cors_allowed_origins="*")
    
    # Register routes
    init_routes(app, login_manager, mail, socketio)
    init_commands(app, users, activate, db)
    app.register_blueprint(users)
    app.register_blueprint(activate)

    # Initialize scheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=delete_unconfirmed_users, trigger="interval", days=7, args=[app, db])
    scheduler.start()

    # Shut down the scheduler when exiting the app
    atexit.register(lambda: scheduler.shutdown())

    return app, socketio
