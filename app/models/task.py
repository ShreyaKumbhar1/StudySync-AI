from app.database import db


class Task(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    title = db.Column(db.String(200), nullable=False)

    subject = db.Column(db.String(100))

    due_date = db.Column(db.Date)

    priority = db.Column(db.String(20))

    completed = db.Column(
        db.Boolean,
        default=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id")
    )