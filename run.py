from flask import (
    render_template,
    redirect,
    url_for,
    flash
)

from flask_login import (
    login_required,
    current_user
)

from app import create_app

from app.database import db

from app.utils.titles import update_user_title
from app.utils.quotes import get_quote
from app.utils.dimpu_profile import DIMPU

from app.models.task import Task

from app.orion.dimpu import Dimpu
from app.orion.mood_engine import get_dimpu_state

from app.forms.task_form import TaskForm


app = create_app()

dimpu = Dimpu()


# ==========================================================
# HOME
# ==========================================================

@app.route("/")
def home():

    return render_template(
        "index.html",
        quote=get_quote()
    )


# ==========================================================
# DASHBOARD
# ==========================================================

@app.route("/dashboard")
@login_required
def dashboard():

    total_tasks = Task.query.filter_by(
        user_id=current_user.id
    ).count()

    completed_tasks = Task.query.filter_by(
        user_id=current_user.id,
        completed=True
    ).count()

    pending_tasks = (
        total_tasks -
        completed_tasks
    )

    if total_tasks == 0:

        progress = 0

    else:

        progress = int(
            (completed_tasks / total_tasks) * 100
        )

    xp_percentage = (
        current_user.xp % 100
    )

    mood, dimpu_image = get_dimpu_state(
        total_tasks,
        completed_tasks
    )

    return render_template(
        "dashboard.html",
        user=current_user,
        dimpu=DIMPU,
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        pending_tasks=pending_tasks,
        progress=progress,
        xp_percentage=xp_percentage,
        dimpu_image=dimpu_image,
        dashboard_quote=dimpu.speak(mood),
        mood=mood
    )


# ==========================================================
# PLANNER
# ==========================================================

@app.route(
    "/planner",
    methods=["GET", "POST"]
)
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

        return redirect(
            url_for("planner")
        )

    tasks = Task.query.filter_by(
        user_id=current_user.id
    ).order_by(
        Task.completed.asc(),
        Task.due_date.asc()
    ).all()

    return render_template(
        "planner.html",
        form=form,
        tasks=tasks
    )


# ==========================================================
# DELETE TASK
# ==========================================================

@app.route(
    "/delete-task/<int:task_id>"
)
@login_required
def delete_task(task_id):

    task = Task.query.get_or_404(
        task_id
    )

    if task.user_id != current_user.id:

        return redirect(
            url_for("planner")
        )

    db.session.delete(task)

    db.session.commit()

    return redirect(
        url_for("planner")
    )


# ==========================================================
# COMPLETE TASK
# ==========================================================

@app.route(
    "/complete-task/<int:task_id>"
)
@login_required
def complete_task(task_id):

    task = Task.query.get_or_404(
        task_id
    )

    if task.user_id != current_user.id:

        return redirect(
            url_for("planner")
        )

    if not task.completed:

        task.completed = True

        current_user.xp += 10

        if (
            current_user.xp
            >= current_user.level * 100
        ):

            current_user.level += 1

        current_user.completed_tasks += 1

        promotion = update_user_title(
            current_user
        )

        if promotion:

            flash(
                f"🎉 Promotion Unlocked! "
                f"You are now "
                f"'{current_user.title}'!",
                "success"
            )

    db.session.commit()

    return redirect(
        url_for("planner")
    )


# ==========================================================
# EDIT TASK
# ==========================================================

@app.route(
    "/edit-task/<int:task_id>",
    methods=["GET", "POST"]
)
@login_required
def edit_task(task_id):

    task = Task.query.get_or_404(
        task_id
    )

    if task.user_id != current_user.id:

        return redirect(
            url_for("planner")
        )

    form = TaskForm(obj=task)

    form.submit.label.text = (
        "💾 Save Changes"
    )

    if form.validate_on_submit():

        task.title = form.title.data

        task.subject = form.subject.data

        task.due_date = form.due_date.data

        task.priority = form.priority.data

        db.session.commit()

        return redirect(
            url_for("planner")
        )

    return render_template(
        "edit_task.html",
        form=form,
        task=task
    )


# ==========================================================
# OTHER PAGES
# ==========================================================

@app.route("/assignments")
def assignments():

    return render_template(
        "assignments.html"
    )


@app.route("/attendance")
def attendance():

    return render_template(
        "attendance.html"
    )


@app.route("/timetable")
def timetable():

    return render_template(
        "timetable.html"
    )


@app.route("/recommendation")
def recommendation():

    return render_template(
        "recommendation.html"
    )


# ==========================================================
# RUN
# ==========================================================

if __name__ == "__main__":

    app.run(debug=True)