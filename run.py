from flask import Flask, render_template, redirect, url_for

from app.utils.quotes import get_quote
from app.database import db

from app.models.user import User
from app.models.task import Task

from app.forms.task_form import TaskForm

from app.routes.auth import auth

from app.extensions import bcrypt
from app.login_manager import login_manager

from flask_login import login_required, current_user


app = Flask(
    __name__,
    template_folder="app/templates",
    static_folder="app/static"
)

app.config["SECRET_KEY"] = "change-this-later"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///studysync.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

bcrypt.init_app(app)
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


@app.route("/planner", methods=["GET", "POST"])
@login_required
def planner():

    form = TaskForm()

    if form.validate_on_submit():

        task = Task(
            title=form.title.data,
            subject=form.subject.data,
            due_date=form.due_date.data,
            priority=form.priority.data,
            user_id=current_user.id
        )

        db.session.add(task)
        db.session.commit()

        return redirect(url_for("planner"))

    tasks = Task.query.filter_by(
        user_id=current_user.id
    ).all()

    return render_template(
        "planner.html",
        form=form,
        tasks=tasks
    )


@app.route("/delete-task/<int:task_id>")
@login_required
def delete_task(task_id):

    task = Task.query.get_or_404(task_id)

    if task.user_id != current_user.id:
        return redirect(url_for("planner"))

    db.session.delete(task)
    db.session.commit()

    return redirect(url_for("planner"))

@app.route("/edit-task/<int:task_id>", methods=["GET", "POST"])
@login_required
def edit_task(task_id):

    task = Task.query.get_or_404(task_id)

    if task.user_id != current_user.id:
        return redirect(url_for("planner"))

    form = TaskForm(obj=task)
    form.submit.label.text = "💾 Save Changes"

    if form.validate_on_submit():

        task.title = form.title.data
        task.subject = form.subject.data
        task.due_date = form.due_date.data
        task.priority = form.priority.data

        db.session.commit()

        return redirect(url_for("planner"))

    return render_template(
        "edit_task.html",
        form=form,
        task=task
    )

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