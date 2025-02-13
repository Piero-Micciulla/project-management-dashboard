from datetime import datetime
from . import db

# ✅ Many-to-Many: Users ↔ Projects (Assigned Users)
project_assignments = db.Table(
    "project_assignments",
    db.Column("user_id", db.Integer, db.ForeignKey("user.id"), primary_key=True),
    db.Column("project_id", db.Integer, db.ForeignKey("project.id"), primary_key=True),
)

# ✅ User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default="user")  # "admin", "manager", "user"
    avatar = db.Column(db.String(300), nullable=True)

    # ✅ Relationships
    assigned_projects = db.relationship("Project", secondary=project_assignments, back_populates="assigned_users")

    # 🔥 FIX: Explicit foreign key reference and unique backrefs
    assigned_tickets = db.relationship(
        "Ticket",
        foreign_keys="[Ticket.assigned_user_id]",
        backref="assigned_user_info",  # ✅ Changed backref name
        lazy="dynamic",
    )

    created_tickets = db.relationship(
        "Ticket",
        foreign_keys="[Ticket.created_by_id]",
        backref="ticket_creator_info",  # ✅ Changed backref name
        lazy="dynamic",
    )

    ticket_changes = db.relationship("TicketHistory", backref="change_author", lazy="dynamic")

# ✅ Project Model
class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)

    STATUS_CHOICES = ["active", "archived", "completed"]
    status = db.Column(db.String(20), default="active")

    # ✅ Relationships
    owner_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    assigned_users = db.relationship("User", secondary=project_assignments, back_populates="assigned_projects")
    tickets = db.relationship("Ticket", backref="project", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "start_date": self.start_date.strftime("%Y-%m-%d"),
            "end_date": self.end_date.strftime("%Y-%m-%d"),
            "status": self.status,
            "owner_id": self.owner_id,
            "assigned_users": [{"id": user.id, "username": user.username, "avatar": user.avatar} for user in self.assigned_users],
            "tickets": [ticket.to_dict() for ticket in self.tickets]  # ✅ Include tickets
        }

# ✅ Ticket Model
class Ticket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default="To Do")  # "To Do", "In Progress", "Done"
    priority = db.Column(db.String(50), default="Medium")  # "Low", "Medium", "High"
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 🔗 Relationships
    project_id = db.Column(db.Integer, db.ForeignKey("project.id"), nullable=False)
    assigned_user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    created_by_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)

    # ✅ FIXED: Different backrefs
    assigned_user = db.relationship("User", foreign_keys=[assigned_user_id], backref="tickets_assigned")
    creator = db.relationship("User", foreign_keys=[created_by_id], backref="tickets_created")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status,
            "priority": self.priority,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "updated_at": self.updated_at.strftime("%Y-%m-%d %H:%M:%S"),
            "project_id": self.project_id,
            "assigned_user_id": self.assigned_user_id,
            "assigned_user": self.assigned_user.username if self.assigned_user else None,
            "creator": self.creator.username if self.creator else None,
        }

# ✅ Ticket History Model
class TicketHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticket_id = db.Column(db.Integer, db.ForeignKey("ticket.id"), nullable=False)
    changed_by_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    change_type = db.Column(db.String(255), nullable=False)  # "Status Change", "Priority Change"
    old_value = db.Column(db.String(255), nullable=True)
    new_value = db.Column(db.String(255), nullable=True)
    changed_at = db.Column(db.DateTime, default=datetime.utcnow)

    # ✅ Define relationships
    ticket = db.relationship("Ticket", backref="history")
    changed_by = db.relationship("User", foreign_keys=[changed_by_id], backref="ticket_change_logs")

    def to_dict(self):
        return {
            "id": self.id,
            "ticket_id": self.ticket_id,
            "changed_by": self.changed_by.username,
            "change_type": self.change_type,
            "old_value": self.old_value,
            "new_value": self.new_value,
            "changed_at": self.changed_at.strftime("%Y-%m-%d %H:%M:%S"),
        }
