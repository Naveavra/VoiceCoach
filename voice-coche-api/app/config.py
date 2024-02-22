import os
from dotenv import load_dotenv
basedir = os.path.abspath(os.path.dirname(__file__))

load_dotenv()

FLASK_RUN_HOST = os.getenv("FLASK_RUN_HOST", "localhost")
FLASK_RUN_PORT = os.getenv("FLASK_RUN_PORT", 5000)
FLASK_DEBUG = os.getenv("FLASK_DEBUG", True)
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")
POSTGRES_DB = os.getenv("POSTGRES_DB", "postgres")
SQLALCHEMY_DATABASE_URI = os.getenv(
    "DATABASE_URL",
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@localhost:5432/{POSTGRES_DB}",
)
SQLALCHEMY_TRACK_MODIFICATIONS = False
SECRET_KEY = os.getenv("SECRET_KEY" , 'top secret')
JWT_SECRET_KEY = os.getenv("SECRET_KEY" , 'top secret')