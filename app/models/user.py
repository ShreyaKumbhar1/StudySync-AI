from app.database import db
from flask_login import UserMixin


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)

    password = db.Column(db.String(255), nullable=False)

    tasks = db.relationship(
        "Task",
        backref="user",
        lazy=True
    )

    def __repr__(self):
        return f"<User {self.email}>"