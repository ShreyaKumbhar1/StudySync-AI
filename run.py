from flask import Flask, render_template
from app.utils.quotes import get_quote
from app.database import db
from app.models.user import User

app = Flask(
    __name__,
    template_folder="app/templates",
    static_folder="app/static"
)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///studysync.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

@app.route("/")
def home():
    return render_template(
        "index.html",
        quote=get_quote()
    )

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")


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

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/register")
def register():
    return render_template("register.html")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)
    