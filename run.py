from flask import Flask, render_template
from app.utils.quotes import get_quote
from app.database import db
from app.models.user import User
from app.routes.auth import auth
from app.extensions import bcrypt
from app.login_manager import login_manager
from flask_login import login_required, current_user

app = Flask(
    __name__,
    template_folder="app/templates",
    static_folder="app/static"
)
bcrypt.init_app(app)
app.config["SECRET_KEY"] = "change-this-later"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///studysync.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
login_manager.init_app(app)
app.register_blueprint(auth)

@app.route("/")
def home():
    return render_template(
        "index.html",
        quote=get_quote()
    )

@app.route("/dashboard")
@login_required
def dashboard():
    return render_template(
        "dashboard.html",
        user=current_user
    )

@app.route("/planner")
def planner():
    return render_template("planner.html")


@app.route("/assignments")
def assignments():
    return render_template("assignments.html")


@app.route("/attendance")
def attendance():
    return render_template("attendance.html")


@app.route("/timetable")
def timetable():
    return render_template("timetable.html")


@app.route("/recommendation")
def recommendation():
    return render_template("recommendation.html")


@app.route("/profile")
def profile():
    return render_template("profile.html")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)
