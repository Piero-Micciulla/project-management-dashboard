from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
import cloudinary.uploader
from .models import db, User

# Create a blueprint for user-related routes
users_bp = Blueprint('users', __name__, url_prefix='/api/users')

# Helper function to check if a user is an admin
def is_admin(user):
    return hasattr(user, 'role') and user.role == 'admin'

##############################################
# ✅ Regular User Endpoints (includes avatar)
##############################################

# ✅ GET /api/users/me - Retrieve current user's profile
@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': getattr(user, 'role', 'user'),
        'avatar': user.avatar
    }), 200

# ✅ PUT /api/users/me - Update current user's profile (excluding avatar)
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

# ✅ POST /api/users/me/avatar - Upload or update user avatar
@users_bp.route('/me/avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    return handle_avatar_upload(get_jwt_identity())

##############################################
# ✅ Admin-Only Endpoints (includes avatar)
##############################################

# ✅ GET /api/users - List all users (admin only)
@users_bp.route('', methods=['GET'])
@jwt_required()
def list_all_users():
    current_user = User.query.get(get_jwt_identity())
    if not current_user or not is_admin(current_user):
        return jsonify({'error': 'Admin access required'}), 403

    return jsonify([
        {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': getattr(user, 'role', 'user'),
            'avatar': user.avatar
        } for user in User.query.all()
    ]), 200

# ✅ GET /api/users/<id> - Get specific user's details (admin only)
@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    current_user = User.query.get(get_jwt_identity())

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': getattr(user, 'role', 'user'),
        'avatar': user.avatar
    }), 200

# ✅ PUT /api/users/<id> - Update a specific user (admin only)
@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user = User.query.get(get_jwt_identity())
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
    if 'role' in data and data['role'] in ['user', 'admin']:
        user.role = data['role']
    
    db.session.commit()
    return jsonify({'message': 'User updated successfully'}), 200

# ✅ POST /api/users/<id>/avatar - Upload avatar for a specific user (admin only)
@users_bp.route('/<int:user_id>/avatar', methods=['POST'])
@jwt_required()
def upload_user_avatar(user_id):
    current_user = User.query.get(get_jwt_identity())
    if not current_user or not is_admin(current_user):
        return jsonify({"error": "Admin access required"}), 403

    return handle_avatar_upload(user_id)

# ✅ DELETE /api/users/<id> - Delete a specific user (admin only)
@users_bp.route('/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user = User.query.get(get_jwt_identity())
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

##############################################
# ✅ Helper Function for Avatar Upload
##############################################

def handle_avatar_upload(user_id):
    """ Upload avatar for a user, validating and storing it in Cloudinary """
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if 'avatar' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['avatar']

    # Validate file type
    allowed_extensions = {"jpg", "jpeg", "png", "gif"}
    file_extension = file.filename.rsplit(".", 1)[-1].lower()
    if file_extension not in allowed_extensions:
        return jsonify({"error": "Invalid file type. Allowed: jpg, jpeg, png, gif"}), 400

    try:
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            file,
            folder="user_avatars",
            transformation=[
                {"width": 300, "height": 300, "crop": "thumb", "gravity": "face"},
                {"quality": "auto"}
            ],
            format="jpg"
        )

        # Save new avatar URL
        user.avatar = upload_result["secure_url"]
        db.session.commit()

        return jsonify({"message": "Avatar updated successfully", "avatar_url": user.avatar}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to upload avatar: {str(e)}"}), 500
