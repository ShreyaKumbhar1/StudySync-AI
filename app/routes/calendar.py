from datetime import date, timedelta

from flask import (
    Blueprint,
    render_template,
    redirect,
    url_for,
    flash
)

from flask_login import (
    login_required,
    current_user
)

from app.database import db
from app.models.calendar_event import CalendarEvent
from app.models.task import Task
from app.forms.calendar_forms import CalendarEventForm


# ==========================================================
# CALENDAR BLUEPRINT
# ==========================================================

calendar = Blueprint(
    "calendar",
    __name__
)


# ==========================================================
# CALENDAR PAGE
# ==========================================================

@calendar.route(
    "/calendar",
    methods=["GET", "POST"]
)
@login_required
def calendar_page():

    form = CalendarEventForm()

    # ======================================================
    # ADD CALENDAR EVENT
    # ======================================================

    if form.validate_on_submit():

        event = CalendarEvent(
            user_id=current_user.id,
            title=form.title.data,
            category=form.category.data,
            description=form.description.data,
            event_date=form.event_date.data,
            start_time=form.start_time.data,
            end_time=form.end_time.data,
            priority=form.priority.data
        )

        db.session.add(event)
        db.session.commit()

        flash(
            "Event added to your calendar! 📅✨",
            "success"
        )

        return redirect(
            url_for("calendar.calendar_page")
        )

    # ======================================================
    # LOAD USER CALENDAR EVENTS
    # ======================================================

    events = (
        CalendarEvent.query
        .filter_by(
            user_id=current_user.id
        )
        .order_by(
            CalendarEvent.event_date.asc()
        )
        .all()
    )

    # ======================================================
    # LOAD USER PLANNER TASKS
    # ======================================================

    tasks = (
        Task.query
        .filter_by(
            user_id=current_user.id
        )
        .order_by(
            Task.due_date.asc()
        )
        .all()
    )

    # ======================================================
    # TODAY
    # ======================================================

    today = date.today()

    # ======================================================
    # TODAY'S TASKS
    # ======================================================

    todays_tasks = [
        task
        for task in tasks
        if task.due_date
        and task.due_date == today
    ]

    # ======================================================
    # TODAY'S EVENTS
    # ======================================================

    todays_events = [
        event
        for event in events
        if event.event_date
        and event.event_date == today
    ]

    # ======================================================
    # UPCOMING TASKS
    # ======================================================

    upcoming_tasks = [
        task
        for task in tasks
        if task.due_date
        and task.due_date >= today
    ][:6]

    # ======================================================
    # UPCOMING EVENTS
    # ======================================================

    upcoming_events = [
        event
        for event in events
        if event.event_date
        and event.event_date >= today
    ][:6]

    # ======================================================
    # MONTHLY TASK STATISTICS
    # ======================================================

    current_month = today.month
    current_year = today.year

    monthly_tasks = [
        task
        for task in tasks
        if (
            task.due_date
            and task.due_date.month == current_month
            and task.due_date.year == current_year
        )
    ]

    completed_monthly_tasks = [
        task
        for task in monthly_tasks
        if task.completed
    ]

    if monthly_tasks:

        monthly_progress = int(
            (
                len(completed_monthly_tasks)
                / len(monthly_tasks)
            ) * 100
        )

    else:

        monthly_progress = 0

    # ======================================================
    # CALENDAR DATA FOR JAVASCRIPT
    # ======================================================

    calendar_events_data = []

    for event in events:

        if not event.event_date:
            continue

        calendar_events_data.append({
            "id": event.id,
            "title": event.title,
            "category": event.category or "event",
            "description": event.description or "",
            "date": event.event_date.isoformat(),
            "start_time": event.start_time or "",
            "end_time": event.end_time or "",
            "priority": event.priority or "Medium"
        })

    # ======================================================
    # PLANNER TASK DATA FOR JAVASCRIPT
    # ======================================================

    calendar_tasks_data = []

    for task in tasks:

        if not task.due_date:
            continue

        calendar_tasks_data.append({
            "id": task.id,
            "title": task.title,
            "subject": task.subject or "Planner",
            "date": task.due_date.isoformat(),
            "priority": task.priority or "Medium",
            "completed": bool(task.completed)
        })

    # ======================================================
    # NEXT 7 DAYS
    # ======================================================

    week_pulse = []

    for offset in range(7):

        day = today + timedelta(
            days=offset
        )

        day_tasks = [
            task
            for task in tasks
            if task.due_date
            and task.due_date == day
        ]

        day_events = [
            event
            for event in events
            if event.event_date
            and event.event_date == day
        ]

        total = (
            len(day_tasks)
            + len(day_events)
        )

        completed = sum(
            1
            for task in day_tasks
            if task.completed
        )

        high_priority = sum(
            1
            for task in day_tasks
            if (
                not task.completed
                and task.priority == "High"
            )
        )

        high_priority += sum(
            1
            for event in day_events
            if event.priority == "High"
        )

        week_pulse.append({
            "date": day.isoformat(),
            "label": day.strftime("%a"),
            "short_date": day.strftime("%d"),
            "tasks": len(day_tasks),
            "events": len(day_events),
            "total": total,
            "completed": completed,
            "high_priority": high_priority
        })

    # ======================================================
    # PRIORITY RADAR
    # ======================================================

    priority_counts = {

        "High": sum(
            1
            for task in tasks
            if (
                not task.completed
                and task.priority == "High"
            )
        ),

        "Medium": sum(
            1
            for task in tasks
            if (
                not task.completed
                and task.priority == "Medium"
            )
        ),

        "Low": sum(
            1
            for task in tasks
            if (
                not task.completed
                and task.priority == "Low"
            )
        )
    }

    # Include calendar events in priority radar

    priority_counts["High"] += sum(
        1
        for event in events
        if event.priority == "High"
        and event.event_date
        and event.event_date >= today
    )

    priority_counts["Medium"] += sum(
        1
        for event in events
        if event.priority == "Medium"
        and event.event_date
        and event.event_date >= today
    )

    priority_counts["Low"] += sum(
        1
        for event in events
        if event.priority == "Low"
        and event.event_date
        and event.event_date >= today
    )

    # ======================================================
    # NEXT PENDING DEADLINE
    # ======================================================

    pending_tasks = [
        task
        for task in tasks
        if (
            task.due_date
            and not task.completed
            and task.due_date >= today
        )
    ]

    pending_tasks.sort(
        key=lambda task: task.due_date
    )

    next_deadline = None

    if pending_tasks:

        task = pending_tasks[0]

        days_until = (
            task.due_date - today
        ).days

        next_deadline = {
            "title": task.title,
            "subject": task.subject or "Planner",
            "priority": task.priority or "Medium",
            "date": task.due_date.isoformat(),
            "pretty_date": task.due_date.strftime(
                "%d %b %Y"
            ),
            "days_until": days_until
        }

    # ======================================================
    # TODAY SUMMARY
    # ======================================================

    today_total = (
        len(todays_tasks)
        + len(todays_events)
    )

    today_completed = sum(
        1
        for task in todays_tasks
        if task.completed
    )

    today_pending = (
        today_total
        - today_completed
    )

    # ======================================================
    # WEEK SUMMARY
    # ======================================================

    week_total = sum(
        item["total"]
        for item in week_pulse
    )

    week_completed = sum(
        item["completed"]
        for item in week_pulse
    )

    week_high_priority = sum(
        item["high_priority"]
        for item in week_pulse
    )

    # ======================================================
    # BUSIEST DAY
    # ======================================================

    busiest_day = max(
        week_pulse,
        key=lambda item: item["total"],
        default=None
    )

    # ======================================================
    # ORION INSIGHT
    # ======================================================

    if not tasks and not events:

        insight = (
            "Your calendar is completely clear. "
            "A perfect time to plan ahead. ✨"
        )

    elif (
        next_deadline
        and next_deadline["days_until"] == 0
    ):

        insight = (
            f"Dimpu says: "
            f"{next_deadline['title']} "
            "is due today. Lock in. 🔥"
        )

    elif (
        next_deadline
        and next_deadline["days_until"] == 1
    ):

        insight = (
            f"Dimpu says: "
            f"{next_deadline['title']} "
            "is due tomorrow. "
            "You've got this. ⚡"
        )

    elif week_high_priority >= 3:

        insight = (
            "You've got several high-priority "
            "items ahead. Protect your focus time. 🎯"
        )

    elif (
        busiest_day
        and busiest_day["total"] >= 3
    ):

        insight = (
            f"{busiest_day['label']} "
            f"{busiest_day['short_date']} "
            f"is your busiest day this week "
            f"with {busiest_day['total']} "
            "planned items."
        )

    elif today_total == 0:

        insight = (
            "Today is clear. "
            "Use the breathing room to get ahead. 🌙"
        )

    else:

        insight = (
            "Your week looks manageable. "
            "Keep the important tasks visible "
            "and stay ahead. ✨"
        )

    # ======================================================
    # COMPLETE DATA OBJECT
    # ======================================================

    calendar_data = {

        "today": today.isoformat(),

        "events": calendar_events_data,

        "tasks": calendar_tasks_data,

        "next_deadline": next_deadline,

        "week_pulse": week_pulse,

        "priority_counts": priority_counts,

        "today_total": today_total,

        "today_completed": today_completed,

        "today_pending": today_pending,

        "week_total": week_total,

        "week_completed": week_completed,

        "monthly_progress": monthly_progress,

        "insight": insight
    }

    # ======================================================
    # RENDER
    # ======================================================

    return render_template(
        "calendar.html",

        form=form,

        events=events,

        tasks=tasks,

        todays_tasks=todays_tasks,

        todays_events=todays_events,

        upcoming_tasks=upcoming_tasks,

        upcoming_events=upcoming_events,

        today=today,

        monthly_tasks=monthly_tasks,

        completed_monthly_tasks=completed_monthly_tasks,

        monthly_progress=monthly_progress,

        calendar_data=calendar_data,

        week_pulse=week_pulse,

        priority_counts=priority_counts,

        next_deadline=next_deadline,

        insight=insight,

        today_total=today_total,

        today_completed=today_completed,

        today_pending=today_pending,

        week_total=week_total,

        week_completed=week_completed,

        week_high_priority=week_high_priority
    )


# ==========================================================
# DELETE CALENDAR EVENT
# ==========================================================

@calendar.route(
    "/calendar/delete/<int:event_id>",
    methods=["POST"]
)
@login_required
def delete_event(event_id):

    event = CalendarEvent.query.get_or_404(
        event_id
    )

    # ======================================================
    # SECURITY CHECK
    # ======================================================

    if event.user_id != current_user.id:

        flash(
            "You do not have permission to delete this event.",
            "danger"
        )

        return redirect(
            url_for("calendar.calendar_page")
        )

    # ======================================================
    # DELETE
    # ======================================================

    db.session.delete(event)

    db.session.commit()

    flash(
        "Calendar event deleted.",
        "success"
    )

    return redirect(
        url_for("calendar.calendar_page")
    )