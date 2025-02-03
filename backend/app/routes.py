from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from .models import db, Project, Task

main_bp = Blueprint('main', __name__)

@main_bp.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    projects = Project.query.all()
    return jsonify([{'id': p.id, 'title': p.title} for p in projects])

@main_bp.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    data = request.json
    project = Project(title=data['title'], description=data.get('description', ''))
    db.session.add(project)
    db.session.commit()
    return jsonify({'message': 'Project created'}), 201
