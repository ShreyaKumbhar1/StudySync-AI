from datetime import date, timedelta

from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user

from app.database import db
from app.models.assignment import Assignment
from app.models.task import Task

assignments = Blueprint("assignments", __name__, url_prefix="/assignments")

PRIORITY_WEIGHT = {"Low": 12, "Medium": 25, "High": 40}
DIFFICULTY_WEIGHT = {"Easy": 5, "Medium": 10, "Hard": 16}


def recommendation_score(assignment, today):
    """Feature-based recommendation ranking used by Dimpu."""
    if assignment.completed:
        return 0, []

    days_left = (assignment.due_date - today).days

    if days_left < 0:
        urgency = 35
        urgency_reason = "Overdue"
    elif days_left == 0:
        urgency = 35
        urgency_reason = "Due today"
    elif days_left <= 1:
        urgency = 32
        urgency_reason = "Due within 1 day"
    elif days_left <= 3:
        urgency = 27
        urgency_reason = "Due within 3 days"
    elif days_left <= 7:
        urgency = 18
        urgency_reason = "Due within a week"
    elif days_left <= 14:
        urgency = 10
        urgency_reason = "Deadline approaching"
    else:
        urgency = 4
        urgency_reason = "Longer deadline"

    priority = PRIORITY_WEIGHT.get(assignment.priority, 25)
    difficulty = DIFFICULTY_WEIGHT.get(assignment.difficulty, 10)

    estimated_minutes = max(int(assignment.estimated_minutes or 0), 15)
    workload = min(estimated_minutes / 120.0, 1.0) * 14

    progress = max(0, min(int(assignment.progress or 0), 100))
    remaining_work = (100 - progress) / 100.0
    progress_weight = remaining_work * 15

    score = round(min(
        100,
        urgency + priority + difficulty + workload + progress_weight
    ))

    reasons = [urgency_reason]

    if assignment.priority == "High":
        reasons.append("High priority")
    if assignment.difficulty == "Hard":
        reasons.append("High difficulty")
    if estimated_minutes >= 180:
        reasons.append("Large workload")
    if progress < 50:
        reasons.append("More work remaining")

    return score, reasons[:3]


def decorate_assignment(assignment, today):
    score, reasons = recommendation_score(assignment, today)

    if assignment.completed:
        status_key = "completed"
        status_label = "✓ Completed"
        status_class = "completed-pill"
    elif assignment.due_date < today:
        status_key = "overdue"
        status_label = "🚨 Overdue"
        status_class = "overdue-pill"
    elif assignment.due_date == today:
        status_key = "today"
        status_label = "🔥 Due Today"
        status_class = "today-pill"
    elif assignment.due_date <= today + timedelta(days=3):
        status_key = "soon"
        status_label = "⏰ Due Soon"
        status_class = "soon-pill"
    else:
        status_key = "upcoming"
        status_label = "✦ Upcoming"
        status_class = "upcoming-pill"

    assignment.status_key = status_key
    assignment.status_label = status_label
    assignment.status_class = status_class
    assignment.recommendation_score = score
    assignment.recommendation_reasons = reasons
    return assignment


@assignments.route("/")
@login_required
def assignments_page():
    assignments_list = (
        Assignment.query
        .filter_by(user_id=current_user.id)
        .order_by(Assignment.completed.asc(), Assignment.due_date.asc())
        .all()
    )

    today = date.today()
    total = len(assignments_list)
    completed = sum(1 for item in assignments_list if item.completed)
    pending = total - completed

    overdue = sum(
        1 for item in assignments_list
        if not item.completed and item.due_date < today
    )

    due_soon = sum(
        1 for item in assignments_list
        if not item.completed
        and today < item.due_date <= today + timedelta(days=3)
    )

    completion_rate = round((completed / total) * 100) if total else 0

    remaining_minutes = sum(
        item.estimated_minutes for item in assignments_list if not item.completed
    )
    remaining_hours = round(remaining_minutes / 60, 1)

    decorated = [decorate_assignment(item, today) for item in assignments_list]

    pending_assignments = [item for item in decorated if not item.completed]

    recommended_assignment = (
        max(pending_assignments, key=lambda item: item.recommendation_score)
        if pending_assignments else None
    )

    if recommended_assignment:
        dimpu_title = f"Start with “{recommended_assignment.title}”"
        dimpu_message = (
            "I checked your pending assignments and this one currently "
            "deserves the most attention based on its deadline, priority, "
            "difficulty, workload and remaining progress."
        )
    elif total:
        dimpu_title = "You cleared the queue! 🎉"
        dimpu_message = "Everything is complete. Add your next assignment when it arrives."
    else:
        dimpu_title = "I'm ready when you are."
        dimpu_message = "Add an assignment and I'll help you decide what to tackle first."

    high_count = sum(1 for item in assignments_list if item.priority == "High")
    medium_count = sum(1 for item in assignments_list if item.priority == "Medium")
    low_count = sum(1 for item in assignments_list if item.priority == "Low")

    def percent(value):
        return round((value / total) * 100) if total else 0

    priority_stats = {
        "High": {"count": high_count, "percent": percent(high_count)},
        "Medium": {"count": medium_count, "percent": percent(medium_count)},
        "Low": {"count": low_count, "percent": percent(low_count)},
    }

    status_chart = {
        "completed": percent(completed),
        "pending": percent(pending),
    }

    return render_template(
        "assignments.html",
        assignments=decorated,
        total=total,
        completed=completed,
        pending=pending,
        overdue=overdue,
        due_soon=due_soon,
        completion_rate=completion_rate,
        remaining_hours=remaining_hours,
        recommended_assignment=recommended_assignment,
        dimpu_title=dimpu_title,
        dimpu_message=dimpu_message,
        priority_stats=priority_stats,
        status_chart=status_chart,
        today=today,
    )


@assignments.route("/create", methods=["POST"])
@login_required
def create_assignment():
    title = request.form.get("title", "").strip()
    subject = request.form.get("subject", "").strip()
    description = request.form.get("description", "").strip()
    due_date_string = request.form.get("due_date")
    priority = request.form.get("priority", "Medium")
    difficulty = request.form.get("difficulty", "Medium")
    attachment_url = request.form.get("attachment_url", "").strip()

    try:
        estimated_minutes = int(request.form.get("estimated_minutes", 60))
    except (TypeError, ValueError):
        estimated_minutes = 60

    if not title or not subject or not due_date_string:
        flash("Please fill in the assignment title, subject and due date.", "error")
        return redirect(url_for("assignments.assignments_page"))

    try:
        due_date = date.fromisoformat(due_date_string)
    except ValueError:
        flash("Please enter a valid due date.", "error")
        return redirect(url_for("assignments.assignments_page"))

    assignment = Assignment(
        title=title,
        subject=subject,
        description=description or None,
        due_date=due_date,
        priority=priority if priority in PRIORITY_WEIGHT else "Medium",
        difficulty=difficulty if difficulty in DIFFICULTY_WEIGHT else "Medium",
        estimated_minutes=max(15, min(estimated_minutes, 10080)),
        attachment_url=attachment_url or None,
        user_id=current_user.id,
    )

    db.session.add(assignment)
    db.session.commit()

    flash("✨ Assignment added to Orion!", "success")
    return redirect(url_for("assignments.assignments_page"))


@assignments.route("/edit/<int:assignment_id>", methods=["POST"])
@login_required
def edit_assignment(assignment_id):
    assignment = Assignment.query.get_or_404(assignment_id)

    if assignment.user_id != current_user.id:
        flash("You cannot edit this assignment.", "error")
        return redirect(url_for("assignments.assignments_page"))

    title = request.form.get("title", "").strip()
    subject = request.form.get("subject", "").strip()

    if title:
        assignment.title = title
    if subject:
        assignment.subject = subject

    assignment.description = request.form.get("description", "").strip() or None

    due_date_string = request.form.get("due_date")
    if due_date_string:
        try:
            assignment.due_date = date.fromisoformat(due_date_string)
        except ValueError:
            flash("Invalid due date.", "error")
            return redirect(url_for("assignments.assignments_page"))

    priority = request.form.get("priority")
    difficulty = request.form.get("difficulty")

    if priority in PRIORITY_WEIGHT:
        assignment.priority = priority
    if difficulty in DIFFICULTY_WEIGHT:
        assignment.difficulty = difficulty

    try:
        assignment.estimated_minutes = max(
            15,
            min(int(request.form.get("estimated_minutes", assignment.estimated_minutes)), 10080),
        )
    except (TypeError, ValueError):
        pass

    assignment.attachment_url = request.form.get("attachment_url", "").strip() or None

    db.session.commit()
    flash("💾 Assignment updated.", "success")
    return redirect(url_for("assignments.assignments_page"))


@assignments.route("/progress/<int:assignment_id>", methods=["POST"])
@login_required
def update_progress(assignment_id):
    assignment = Assignment.query.get_or_404(assignment_id)

    if assignment.user_id != current_user.id:
        return redirect(url_for("assignments.assignments_page"))

    try:
        progress = int(request.form.get("progress", 0))
    except (TypeError, ValueError):
        progress = 0

    assignment.set_progress(progress)
    db.session.commit()

    flash("📈 Progress updated.", "success")
    return redirect(url_for("assignments.assignments_page"))


@assignments.route("/complete/<int:assignment_id>", methods=["POST"])
@login_required
def complete_assignment(assignment_id):
    assignment = Assignment.query.get_or_404(assignment_id)

    if assignment.user_id != current_user.id:
        return redirect(url_for("assignments.assignments_page"))

    assignment.progress = 100
    assignment.completed = True
    db.session.commit()

    flash("🎉 Assignment completed!", "success")
    return redirect(url_for("assignments.assignments_page"))


@assignments.route("/delete/<int:assignment_id>", methods=["POST"])
@login_required
def delete_assignment(assignment_id):
    assignment = Assignment.query.get_or_404(assignment_id)

    if assignment.user_id != current_user.id:
        return redirect(url_for("assignments.assignments_page"))

    db.session.delete(assignment)
    db.session.commit()

    flash("🗑 Assignment removed.", "success")
    return redirect(url_for("assignments.assignments_page"))


@assignments.route("/plan/<int:assignment_id>", methods=["POST"])
@login_required
def plan_assignment(assignment_id):
    assignment = Assignment.query.get_or_404(assignment_id)

    if assignment.user_id != current_user.id:
        return redirect(url_for("assignments.assignments_page"))

    if assignment.completed:
        flash("This assignment is already complete. 🎉", "success")
        return redirect(url_for("assignments.assignments_page"))

    hours = assignment.estimated_minutes / 60

    if hours <= 1:
        stages = ["Complete assignment"]
    elif hours <= 3:
        stages = [
            "Research & understand",
            "Work on assignment",
            "Review & finalize",
        ]
    else:
        stages = [
            "Research & collect material",
            "Create first draft",
            "Complete main work",
            "Review & finalize",
        ]

    existing_titles = {
        task.title
        for task in Task.query.filter_by(user_id=current_user.id).all()
    }

    created_count = 0

    for stage in stages:
        title = f"{assignment.title} • {stage}"

        if title in existing_titles:
            continue

        db.session.add(Task(
            title=title,
            subject=assignment.subject,
            due_date=assignment.due_date,
            priority=assignment.priority,
            user_id=current_user.id,
        ))
        created_count += 1

    db.session.commit()

    flash(
        f"🧠 Dimpu planned {created_count} study task(s) for '{assignment.title}'.",
        "success",
    )
    return redirect(url_for("planner"))