from datetime import datetime

from app.database import db


class FocusSession(db.Model):

    __tablename__ = "focus_sessions"


    id = db.Column(
        db.Integer,
        primary_key=True
    )


    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )


    tree_type = db.Column(
        db.String(100),
        nullable=False
    )


    music_id = db.Column(
        db.String(100),
        nullable=True
    )


    duration_minutes = db.Column(
        db.Integer,
        nullable=False
    )


    status = db.Column(
        db.String(30),
        nullable=False,
        default="active"
    )


    started_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )


    completed_at = db.Column(
        db.DateTime,
        nullable=True
    )


    completed_minutes = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )


    trees_earned = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )


    antennas_earned = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )


    destroyed_tree = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )


    failure_reason = db.Column(
        db.String(255),
        nullable=True
    )


    user = db.relationship(
        "User",
        backref=db.backref(
            "focus_sessions",
            lazy=True,
            cascade="all, delete-orphan"
        )
    )


    def __repr__(self):

        return (
            f"<FocusSession "
            f"{self.id} "
            f"user={self.user_id} "
            f"tree={self.tree_type} "
            f"music={self.music_id} "
            f"status={self.status}>"
        )