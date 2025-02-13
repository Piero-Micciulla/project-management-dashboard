from flask import Blueprint, request, jsonify
from flask_cors import cross_origin  
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import db, Project, User, Ticket, TicketHistory, project_assignments
from datetime import datetime

routes_bp = Blueprint("routes", __name__)

# ✅ Helper function to check if a user is an admin
def is_admin(user):
    return hasattr(user, "role") and user.role == "admin"

# ==============================================================
# ✅ PROJECT ROUTES
# ==============================================================

# ✅ GET /projects - List all projects (Admins see all, users only assigned projects)
@routes_bp.route("/projects", methods=["GET"])
@jwt_required()
@cross_origin()
def get_projects():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    projects = Project.query.all() if is_admin(user) else (
        Project.query.join(project_assignments)
        .filter(project_assignments.c.user_id == user_id)
        .all()
    )  

    return jsonify([project.to_dict() for project in projects]), 200


# ✅ GET /projects/<id> - Get project details (Admins & Assigned Users)
@routes_bp.route("/projects/<int:project_id>", methods=["GET"])
@jwt_required()
@cross_origin()
def get_project_details(project_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    project = Project.query.get(project_id)

    if not project:
        return jsonify({"error": "Project not found"}), 404

    if not is_admin(user) and user not in project.assigned_users:
        return jsonify({"error": "You are not assigned to this project"}), 403

    return jsonify(project.to_dict()), 200


# ✅ GET /projects/<id>/tickets - Get all tickets for a project
@routes_bp.route("/projects/<int:project_id>/tickets", methods=["GET"])
@jwt_required()
@cross_origin()
def get_project_tickets(project_id):
    project = Project.query.get(project_id)

    if not project:
        return jsonify({"error": "Project not found"}), 404

    tickets = Ticket.query.filter_by(project_id=project_id).all()
    return jsonify([ticket.to_dict() for ticket in tickets]), 200

# ✅ GET /projects/<id>/usres - Get all users for a project
@routes_bp.route("/projects/<int:project_id>/users", methods=["GET"])
@cross_origin()  # ✅ Allows this route to be accessed from different origins
@jwt_required()
def get_project_users(project_id):
    project = Project.query.get(project_id)

    if not project:
        return jsonify({"error": "Project not found"}), 404

    users = (
        db.session.query(User)
        .join(project_assignments)
        .filter(project_assignments.c.project_id == project_id)
        .all()
    )

    users_list = [{"id": user.id, "username": user.username, "email": user.email, "role": user.role, "avatar": user.avatar} for user in users]
    return jsonify(users_list), 200


# ✅ POST /projects - Create a new project (Admin only)
@routes_bp.route("/projects", methods=["POST"])
@jwt_required()
@cross_origin()
def create_project():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not is_admin(user):
        return jsonify({"error": "Admin access required"}), 403

    data = request.json
    if not all(k in data for k in ["title", "start_date", "end_date"]):
        return jsonify({"error": "Missing required fields"}), 400

    new_project = Project(
        title=data["title"],
        description=data.get("description", ""),
        start_date=datetime.strptime(data["start_date"], "%Y-%m-%d"),
        end_date=datetime.strptime(data["end_date"], "%Y-%m-%d"),
        status=data.get("status", "Pending"),
        owner_id=user_id 
    )

    db.session.add(new_project)
    db.session.commit()

    db.session.execute(
        project_assignments.insert().values(user_id=user_id, project_id=new_project.id)
    )
    db.session.commit()

    return jsonify({"message": "Project created and assigned successfully"}), 201

from flask_cors import cross_origin  

# ✅ POST /projects/id/assign - Assign user to project (Admin only)
@routes_bp.route("/projects/<int:project_id>/assign", methods=["POST"])
@cross_origin()  # ✅ Allows this route to be accessed from different origins
@jwt_required()
def assign_user_to_project(project_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user or not is_admin(user):
        return jsonify({"error": "Admin access required"}), 403

    data = request.json
    assigned_user_id = data.get("user_id")

    assigned_user = User.query.get(assigned_user_id)
    project = Project.query.get(project_id)

    if not assigned_user or not project:
        return jsonify({"error": "User or project not found"}), 404

    existing_assignment = db.session.execute(
        project_assignments.select().where(
            (project_assignments.c.user_id == assigned_user_id)
            & (project_assignments.c.project_id == project_id)
        )
    ).fetchone()

    if existing_assignment:
        return jsonify({"error": "User is already assigned to this project"}), 400

    db.session.execute(
        project_assignments.insert().values(user_id=assigned_user_id, project_id=project_id)
    )
    db.session.commit()

    return jsonify({"message": "User assigned to project successfully"}), 200


# ✅ PUT /projects/id - Edit project (Admin only)
@routes_bp.route("/projects/<int:project_id>", methods=["PUT"])
@cross_origin()  # ✅ Add this if CORS is the issue
@jwt_required()
def update_project(project_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # ✅ Ensure only admins can edit projects
    if not user or not is_admin(user):
        return jsonify({"error": "Admin access required"}), 403

    project = Project.query.get(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    data = request.json

    # ✅ Validate dates
    if "start_date" in data:
        try:
            project.start_date = datetime.strptime(data["start_date"], "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid start_date format, expected YYYY-MM-DD"}), 400

    if "end_date" in data:
        try:
            project.end_date = datetime.strptime(data["end_date"], "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Invalid end_date format, expected YYYY-MM-DD"}), 400

    # ✅ Update fields if they exist
    project.title = data.get("title", project.title)
    project.description = data.get("description", project.description)
    project.status = data.get("status", project.status)

    db.session.commit()
    return jsonify({"message": "Project updated successfully"}), 200


# ✅ GET /projects/assigned - Get all projects assigned to the logged-in user
@routes_bp.route("/projects/assigned", methods=["GET"])
@cross_origin()  # ✅ Fix CORS issue
@jwt_required()
def get_admin_assigned_projects():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "Admin access required"}), 403

    assigned_projects = (
        Project.query.join(project_assignments)
        .filter(project_assignments.c.user_id == user_id)
        .all()
    )

    return jsonify([project.to_dict() for project in assigned_projects]), 200

# ==============================================================
# ✅ TICKET ROUTES
# ==============================================================

# ✅ GET /tickets/user - Get tickets assigned to the logged-in user
@routes_bp.route("/tickets/user", methods=["GET"])
@jwt_required()
@cross_origin()
def get_user_tickets():
    user_id = get_jwt_identity()
    tickets = Ticket.query.filter_by(assigned_user_id=user_id).all()
    return jsonify([ticket.to_dict() for ticket in tickets]), 200


# ✅ POST /tickets - Create a new ticket
@routes_bp.route("/tickets", methods=["POST"])
@jwt_required()
def create_ticket():
    user_id = get_jwt_identity()  # ✅ Get the logged-in user
    data = request.json

    required_fields = ["title", "description", "project_id"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    new_ticket = Ticket(
        title=data["title"],
        description=data["description"],
        project_id=data["project_id"],
        assigned_user_id=data.get("assigned_user_id"),
        created_by_id=user_id,  # ✅ Assign the logged-in user as the creator
        status=data.get("status", "To Do"),
        priority=data.get("priority", "Medium"),
    )

    db.session.add(new_ticket)
    db.session.commit()

    return jsonify({"message": "Ticket created successfully", "ticket": new_ticket.to_dict()}), 201


# ✅ PUT /tickets/<id> - Update a ticket
@routes_bp.route("/tickets/<int:ticket_id>", methods=["PUT"])
@jwt_required()
@cross_origin()
def update_ticket(ticket_id):
    user_id = get_jwt_identity()
    ticket = Ticket.query.get(ticket_id)

    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    data = request.json
    old_status = ticket.status
    old_priority = ticket.priority

    # ✅ Update Ticket Fields
    if "title" in data:
        ticket.title = data["title"]
    if "description" in data:
        ticket.description = data["description"]
    if "status" in data:
        ticket.status = data["status"]
    if "priority" in data:
        ticket.priority = data["priority"]
    if "assigned_user_id" in data:
        ticket.assigned_user_id = data["assigned_user_id"]

    db.session.commit()

    # ✅ Log Status Change in TicketHistory
    if ticket.status != old_status:
        history = TicketHistory(
            ticket_id=ticket.id,
            changed_by_id=user_id,
            change_type="Status Change",
            old_value=old_status,
            new_value=ticket.status,
        )
        db.session.add(history)

    # ✅ Log Priority Change in TicketHistory
    if ticket.priority != old_priority:
        history = TicketHistory(
            ticket_id=ticket.id,
            changed_by_id=user_id,
            change_type="Priority Change",
            old_value=old_priority,
            new_value=ticket.priority,
        )
        db.session.add(history)

    db.session.commit()

    return jsonify({"message": "Ticket updated successfully", "ticket": ticket.to_dict()}), 200



# ✅ DELETE /tickets/<id> - Delete a ticket
@routes_bp.route("/tickets/<int:ticket_id>", methods=["DELETE"])
@jwt_required()
@cross_origin()
def delete_ticket(ticket_id):
    user_id = get_jwt_identity()
    ticket = Ticket.query.get(ticket_id)

    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404
    
    TicketHistory.query.filter_by(ticket_id=ticket_id).delete()

    db.session.delete(ticket)
    db.session.commit()

    return jsonify({"message": "Ticket deleted successfully"}), 200


# ✅ GET /tickets/<id>/history - Get history of a specific ticket
@routes_bp.route("/tickets/<int:ticket_id>/history", methods=["GET"])
@jwt_required()
@cross_origin()
def get_ticket_history(ticket_id):
    ticket = Ticket.query.get(ticket_id)

    if not ticket:
        return jsonify({"error": "Ticket not found"}), 404

    history = TicketHistory.query.filter_by(ticket_id=ticket_id).order_by(TicketHistory.changed_at.desc()).all()
    
    return jsonify([entry.to_dict() for entry in history]), 200
