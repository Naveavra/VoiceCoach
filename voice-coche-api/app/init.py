from flask import Flask , Blueprint
from flask_migrate import Migrate
from models import db
from routes import init_routes
from manage import init_commands
from flask_jwt_extended import JWTManager

def create_app():
    app = Flask(__name__)
    app.config.from_object("config")
    users = Blueprint("users", __name__)
    activate = Blueprint("activate", __name__)

    # Initialize database
    db.init_app(app)
    jwt = JWTManager(app)
    
    try:
        with app.app_context():
            db.create_all()
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        #raise RuntimeError("Database connection failed")

    # Initialize migration
    migrate = Migrate(app, db)

    print("App initialization completed")
    
    # Register routes
    init_routes(app)
    init_commands(app ,users ,activate,db)
    app.register_blueprint(users)
    app.register_blueprint(activate)

    return app
