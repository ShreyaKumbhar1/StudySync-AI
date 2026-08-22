from datetime import datetime

from app.database import db


class Assignment(db.Model):
    __tablename__ = "assignments"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    title = db.Column(
        db.String(200),
        nullable=False
    )

    subject = db.Column(
        db.String(100),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    due_date = db.Column(
        db.Date,
        nullable=False
    )

    priority = db.Column(
        db.String(20),
        default="Medium",
        nullable=False
    )

    difficulty = db.Column(
        db.String(20),
        default="Medium",
        nullable=False
    )

    estimated_minutes = db.Column(
        db.Integer,
        default=60,
        nullable=False
    )

    progress = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )

    completed = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )

    attachment_url = db.Column(
        db.String(500),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    user = db.relationship(
        "User",
        backref=db.backref(
            "assignments",
            lazy=True
        )
    )

    def __repr__(self):
        return (
            f"<Assignment {self.title}>"
        )

    @property
    def estimated_hours(self):
        return round(
            self.estimated_minutes / 60,
            1
        )

    def set_progress(self, value):
        value = max(
            0,
            min(100, int(value))
        )

        self.progress = value

        if value >= 100:
            self.progress = 100
            self.completed = True
        else:
            self.completed = False