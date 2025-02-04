from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from .models import db, User

# Create a blueprint for user-related routes
users_bp = Blueprint('users', __name__, url_prefix='/api/users')

# Helper function to check if a user is an admin
def is_admin(user):
    return hasattr(user, 'role') and user.role == 'admin'

##############################################
# Regular User Endpoints (for the logged-in user)
##############################################

# GET /api/users/me - Retrieve current user's profile
@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': getattr(user, 'role', 'user')
    }
    return jsonify(user_data), 200

# PUT /api/users/me - Update current user's profile
@users_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_my_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    if 'password' in data:
        user.password = generate_password_hash(data['password'])
    
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'}), 200

# DELETE /api/users/me - Delete current user's account
@users_bp.route('/me', methods=['DELETE'])
@jwt_required()
def delete_my_account():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'Account deleted successfully'}), 200

##########################################
# Admin-Only Endpoints for User Management
##########################################

# GET /api/users - List all users (admin only)
@users_bp.route('', methods=['GET'])
@jwt_required()
def list_all_users():
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or not is_admin(current_user):
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.all()
    users_list = []
    for user in users:
        users_list.append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': getattr(user, 'role', 'user')
        })
    return jsonify(users_list), 200

# GET /api/users/<id> - Get specific user's details (admin only)
@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or not is_admin(current_user):
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': getattr(user, 'role', 'user')
    }
    return jsonify(user_data), 200

# PUT /api/users/<id> - Update a specific user (admin only)
@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or not is_admin(current_user):
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.json
    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    if 'password' in data:
        user.password = generate_password_hash(data['password'])
    
    # Validate and update role
    if 'role' in data:
        if data['role'] not in ['user', 'admin']:
            return jsonify({'error': 'Invalid role provided'}), 400
        user.role = data['role']
    
    db.session.commit()
    return jsonify({'message': 'User updated successfully'}), 200


# DELETE /api/users/<id> - Delete a specific user (admin only)
@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    if not current_user or not is_admin(current_user):
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if current_user.id == user.id:
        return jsonify({'error': 'Admins cannot delete their own account'}), 400

    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted successfully'}), 200

