from flask import Flask  
from flask_migrate import Migrate
from models import db
from routes import init_routes
from flask_jwt_extended import JWTManager


def create_app(skip_create_tables=False):
    app = Flask(__name__)
    # maybe register blueprints here
    # configure app
    app.config.from_object("config")
    print(app.config.get("SQLALCHEMY_DATABASE_URI"))
    # bootstrap database migrate commands
    db.init_app(app)
    db.app = app
    jwt = JWTManager(app)

    try:
        # Attempt to connect to the database
        with app.app_context():
            print("Attempting to connect to the database...")
            if not skip_create_tables:
                # Add more table names as needed
                db.create_all()
                print("All tables created")
            else:
                print("Tables already exist or skip_create_tables is set to True. Skipping table creation.")                
    except Exception as e:
        # Check if tables already exist
        if "relation" in str(e) and "already exists" in str(e):
            print("Tables already exist. Skipping table creation.")
        else:
            print(f"Error connecting to the database: {e}")
            raise RuntimeError("Database connection failed")
            # You can choose to raise an exception, log the error, or handle it differently

    migrate = Migrate(app, db)

    print("app created")
    # register routes
    init_routes(app)
    return app
