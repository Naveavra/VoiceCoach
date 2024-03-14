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
JWT_ACCESS_TOKEN_EXPIRES = 3600
JWT_REFRESH_TOKEN_EXPIRES = 3600
SECURITY_PASSWORD_SALT = os.getenv("SECURITY_PASSWORD_SALT" , 'top secret')

#Email
MAIL_DEFAULT_SENDER = "noreply@flask.com"
MAIL_SERVER = "smtp.gmail.com"
MAIL_PORT = 465
MAIL_USE_TLS = False
MAIL_USE_SSL = True
MAIL_DEBUG = False
MAIL_USERNAME = os.getenv("EMAIL_USER")
MAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")


#Cryptography
CRYPTO_KEY = os.getenv("ENCRYPT_KEY" , 'top secret')