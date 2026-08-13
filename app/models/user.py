from app.database import db
from flask_login import UserMixin


class User(UserMixin, db.Model):

    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    # =====================================================
    # BASIC INFORMATION
    # =====================================================

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )

    # =====================================================
    # PROFILE INFORMATION
    # =====================================================

    dob = db.Column(
        db.String(20),
        nullable=True
    )

    contact_number = db.Column(
        db.String(20),
        nullable=True
    )

    college = db.Column(
        db.String(200),
        nullable=True
    )

    department = db.Column(
        db.String(150),
        nullable=True
    )

    current_year = db.Column(
        db.String(50),
        nullable=True
    )

    bio = db.Column(
        db.Text,
        nullable=True
    )

    # =====================================================
    # SOCIAL / DEVELOPER LINKS
    # =====================================================

    github = db.Column(
        db.String(300),
        nullable=True
    )

    linkedin = db.Column(
        db.String(300),
        nullable=True
    )

    leetcode = db.Column(
        db.String(300),
        nullable=True
    )

    hackerrank = db.Column(
        db.String(300),
        nullable=True
    )

    kaggle = db.Column(
        db.String(300),
        nullable=True
    )

    portfolio = db.Column(
        db.String(300),
        nullable=True
    )

    other_link = db.Column(
        db.String(300),
        nullable=True
    )

    # =====================================================
    # ORION PROGRESS
    # =====================================================

    xp = db.Column(
        db.Integer,
        default=0
    )

    level = db.Column(
        db.Integer,
        default=1
    )

    title = db.Column(
        db.String(100),
        default="🥚 Egg Hatchling"
    )

    completed_tasks = db.Column(
        db.Integer,
        default=0
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    tasks = db.relationship(
        "Task",
        backref="user",
        lazy=True
    )

    documents = db.relationship(
        "ProfileDocument",
        back_populates="user",
        lazy=True,
        cascade="all, delete-orphan"
    )

    # =====================================================
    # REPRESENTATION
    # =====================================================

    def __repr__(self):
        return f"<User {self.email}>"