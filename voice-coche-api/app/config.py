import os
from dotenv import load_dotenv
basedir = os.path.abspath(os.path.dirname(__file__))

load_dotenv()

# Flask application settings
FLASK_RUN_HOST = os.getenv("FLASK_RUN_HOST", "localhost")
FLASK_RUN_PORT = os.getenv("FLASK_RUN_PORT", 5000)
FLASK_DEBUG = os.getenv("FLASK_DEBUG", True)

# Database settings
POSTGRES_USER = os.getenv("POSTGRES_USER", "Bigboss0304")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "Adminos2022")
POSTGRES_DB = os.getenv("POSTGRES_DB", "postgres")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "voicedb.chosaq2kqik5.eu-north-1.rds.amazonaws.com")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", 5432)
SQLALCHEMY_DATABASE_URI = os.getenv(
    "DATABASE_URL",
    f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Security settings
SECRET_KEY = os.getenv("SECRET_KEY", "top secret")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "top secret")
JWT_ACCESS_TOKEN_EXPIRES = 3600
JWT_REFRESH_TOKEN_EXPIRES = 3600
SECURITY_PASSWORD_SALT = os.getenv("SECURITY_PASSWORD_SALT", "top secret")

# Email settings
MAIL_DEFAULT_SENDER = "noreply@flask.com"
MAIL_SERVER = "smtp.gmail.com"
MAIL_PORT = 465
MAIL_USE_TLS = False
MAIL_USE_SSL = False
MAIL_DEBUG = False
MAIL_USERNAME = os.getenv("EMAIL_USER")
MAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# Cryptography settings
CRYPTO_KEY = os.getenv("ENCRYPT_KEY", "top secret")
