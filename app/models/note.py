from datetime import datetime

from app.database import db


class Notebook(db.Model):

    __tablename__ = "notebooks"

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

    description = db.Column(
        db.Text,
        nullable=True
    )

    notebook_type = db.Column(
        db.String(50),
        nullable=False,
        default="general"
    )

    subject = db.Column(
        db.String(150),
        nullable=True
    )

    icon = db.Column(
        db.String(20),
        nullable=False,
        default="📓"
    )

    color = db.Column(
        db.String(30),
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    pages = db.relationship(
        "NotebookPage",
        backref="notebook",
        lazy=True,
        cascade="all, delete-orphan",
        order_by="NotebookPage.position"
    )

    def __repr__(self):
        return f"<Notebook {self.title}>"


class NotebookPage(db.Model):

    __tablename__ = "notebook_pages"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    notebook_id = db.Column(
        db.Integer,
        db.ForeignKey("notebooks.id"),
        nullable=False
    )

    title = db.Column(
        db.String(200),
        nullable=False,
        default="Untitled Page"
    )

    content = db.Column(
        db.Text,
        nullable=True
    )

    position = db.Column(
        db.Integer,
        default=0
    )

    pinned = db.Column(
        db.Boolean,
        default=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def __repr__(self):
        return f"<NotebookPage {self.title}>"