import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Initialize the database, migration, and JWT manager
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')  # Default for local dev
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default-jwt-secret-key')  # Default for local dev
    CORS_HEADERS = 'Content-Type'


class DevelopmentConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///site.db')  # Default to SQLite


class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')  # Heroku or another cloud database URI


def create_app():
    app = Flask(__name__)

    # Set the configuration based on the environment
    app.config.from_object(DevelopmentConfig if app.config["ENV"] == "development" else ProductionConfig)

    # Enable CORS
    CORS(app)

    # Initialize the extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # Register blueprints for routes and authentication
    from .routes import main_bp
    from .auth import auth_bp
    app.register_blueprint(main_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')

    return app
