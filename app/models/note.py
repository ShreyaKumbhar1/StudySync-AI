from datetime import datetime
import secrets

from app.database import db


class Notebook(db.Model):
    __tablename__ = "notebooks"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    notebook_type = db.Column(db.String(50), nullable=False, default="general")
    subject = db.Column(db.String(150), nullable=True)
    icon = db.Column(db.String(20), nullable=False, default="📓")
    color = db.Column(db.String(30), nullable=True, default="#9b8ddd")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    pages = db.relationship(
        "NotebookPage", backref="notebook", lazy=True,
        cascade="all, delete-orphan", order_by="NotebookPage.position"
    )
    share = db.relationship(
        "NotebookShare", backref="notebook", uselist=False,
        cascade="all, delete-orphan"
    )

    def ensure_share(self):
        if not self.share:
            self.share = NotebookShare(
                notebook_id=self.id,
                token=secrets.token_urlsafe(18),
                enabled=False
            )
        return self.share

    def __repr__(self):
        return f"<Notebook {self.title}>"


class NotebookPage(db.Model):
    __tablename__ = "notebook_pages"

    id = db.Column(db.Integer, primary_key=True)
    notebook_id = db.Column(db.Integer, db.ForeignKey("notebooks.id"), nullable=False)
    title = db.Column(db.String(200), nullable=False, default="Untitled Page")
    content = db.Column(db.Text, nullable=True)
    position = db.Column(db.Integer, default=0)
    pinned = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<NotebookPage {self.title}>"


class NotebookShare(db.Model):
    """Future-ready sharing layer for Study Meet and shareable notebook links."""
    __tablename__ = "notebook_shares"

    id = db.Column(db.Integer, primary_key=True)
    notebook_id = db.Column(db.Integer, db.ForeignKey("notebooks.id"), unique=True, nullable=False)
    token = db.Column(db.String(80), unique=True, nullable=False)
    enabled = db.Column(db.Boolean, default=False, nullable=False)
    permission = db.Column(db.String(20), default="view", nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
