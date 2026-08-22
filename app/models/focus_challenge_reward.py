from datetime import datetime

from app.database import db


class FocusChallengeReward(db.Model):
    __tablename__ = "focus_challenge_rewards"

    id = db.Column(
        db.Integer,
        primary_key=True,
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    period_type = db.Column(
        db.String(20),
        nullable=False,
    )

    period_key = db.Column(
        db.String(40),
        nullable=False,
    )

    challenge_key = db.Column(
        db.String(255),
        nullable=False,
    )

    antennas_awarded = db.Column(
        db.Integer,
        nullable=False,
        default=0,
    )

    claimed_at = db.Column(
        db.DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "period_type",
            "period_key",
            "challenge_key",
            name="uq_focus_challenge_reward",
        ),
    )

    user = db.relationship(
        "User",
        backref=db.backref(
            "focus_challenge_rewards",
            lazy=True,
            cascade="all, delete-orphan",
        ),
    )