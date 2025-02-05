import os
import cloudinary
import cloudinary.uploader
import cloudinary.api
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Initialize the database, migration, and JWT manager
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

# Load environment variables for Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')  # Default for local dev
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default-jwt-secret-key')  # Default for local dev
    CORS_HEADERS = 'Content-Type'


class DevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///site.db')  # Default to SQLite


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')  # Cloud database URI (e.g., PostgreSQL on Render)


def create_app():
    app = Flask(__name__)

    # Load environment configuration dynamically
    env = os.getenv('FLASK_ENV', 'development')
    if env == 'development':
        app.config.from_object(DevelopmentConfig)
    else:
        app.config.from_object(ProductionConfig)

    # Enable CORS
    CORS(app)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Register blueprints
    from .routes import main_bp
    from .auth import auth_bp
    from .users import users_bp  # ✅ Import and register users blueprint

    app.register_blueprint(main_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')  # ✅ Register users blueprint

    return app
