from app.database import db


class Profile(db.Model):

    __tablename__ = "profiles"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    # =====================================================
    # PERSONAL INFORMATION
    # =====================================================

    college = db.Column(
        db.String(200),
        default=""
    )

    department = db.Column(
        db.String(150),
        default=""
    )

    current_year = db.Column(
        db.String(50),
        default=""
    )

    graduation_year = db.Column(
        db.String(20),
        default=""
    )

    bio = db.Column(
        db.Text,
        default=""
    )

    skills = db.Column(
        db.Text,
        default=""
    )

    # =====================================================
    # SOCIAL / PROFESSIONAL LINKS
    # =====================================================

    github = db.Column(
        db.String(500),
        default=""
    )

    linkedin = db.Column(
        db.String(500),
        default=""
    )

    leetcode = db.Column(
        db.String(500),
        default=""
    )

    hackerrank = db.Column(
        db.String(500),
        default=""
    )

    codechef = db.Column(
        db.String(500),
        default=""
    )

    codeforces = db.Column(
        db.String(500),
        default=""
    )

    kaggle = db.Column(
        db.String(500),
        default=""
    )

    gitlab = db.Column(
        db.String(500),
        default=""
    )

    portfolio = db.Column(
        db.String(500),
        default=""
    )

    # =====================================================
    # CERTIFICATES & ACHIEVEMENTS
    #
    # One item per line.
    # =====================================================

    certificates = db.Column(
        db.Text,
        default=""
    )

    achievements = db.Column(
        db.Text,
        default=""
    )

    # =====================================================

    def __repr__(self):
        return f"<Profile user_id={self.user_id}>"