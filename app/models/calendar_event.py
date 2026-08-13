from datetime import datetime

from app.database import db


class CalendarEvent(db.Model):

    __tablename__ = "calendar_events"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    title = db.Column(
        db.String(150),
        nullable=False
    )

    category = db.Column(
        db.String(50),
        nullable=False,
        default="event"
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    event_date = db.Column(
        db.Date,
        nullable=False
    )

    start_time = db.Column(
        db.String(20),
        nullable=True
    )

    end_time = db.Column(
        db.String(20),
        nullable=True
    )

    priority = db.Column(
        db.String(20),
        default="Medium"
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def __repr__(self):

        return (
            f"<CalendarEvent "
            f"{self.title}>"
        )