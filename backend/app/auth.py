from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from .models import db, User

auth_bp = Blueprint('auth', __name__)

# Registration endpoint
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json

    # Validate input fields
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Username, email, and password are required'}), 400

    # Check if the email already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email is already in use'}), 400

    # Hash password
    hashed_password = generate_password_hash(data['password'])

    # Create new user
    user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_password,
        avatar=data.get('avatar', '')  # ✅ Save avatar URL if provided
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

# Login endpoint
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json

    # Validate input fields
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400

    # Find user by email
    user = User.query.filter_by(email=data['email']).first()

    # Check if user exists and password is correct
    if user and check_password_hash(user.password, data['password']):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'token': access_token}), 200

    return jsonify({'error': 'Invalid credentials'}), 401
