from flask import Flask

from app.database import db
from app.extensions import bcrypt
from app.login_manager import login_manager


def create_app():

    app = Flask(
        __name__,
        template_folder="templates",
        static_folder="static"
    )

    # ======================================================
    # FLASK CONFIGURATION
    # ======================================================

    app.config["SECRET_KEY"] = "orion-secret-key"

    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024

    # ======================================================
    # DATABASE
    # ======================================================

    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///studysync.db"

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    # ======================================================
    # BCRYPT
    # ======================================================

    bcrypt.init_app(app)

    # ======================================================
    # FLASK LOGIN
    # ======================================================

    login_manager.init_app(app)

    # ======================================================
    # USER LOADER
    # ======================================================

    from app.models.user import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # ======================================================
    # IMPORT MODELS
    # ======================================================

    from app.models.task import Task
    from app.models.profile_document import ProfileDocument
    from app.models.calendar_event import CalendarEvent

    # ======================================================
    # REGISTER BLUEPRINTS
    # ======================================================

    from app.routes.auth import auth
    from app.routes.calendar import calendar

    app.register_blueprint(auth)
    app.register_blueprint(calendar)

    # ======================================================
    # CREATE DATABASE TABLES
    # ======================================================

    with app.app_context():
        db.create_all()

    return app