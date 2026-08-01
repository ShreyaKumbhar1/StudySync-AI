from flask import Flask, render_template

app = Flask(
    __name__,
    template_folder="app/templates",
    static_folder="app/static"
)


@app.route("/")
def home():
    return render_template("index.html")


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


if __name__ == "__main__":
    app.run(debug=True)