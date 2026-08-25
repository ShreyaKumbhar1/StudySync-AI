from flask import Blueprint, render_template, request, redirect, url_for, flash, abort, jsonify
from flask_login import login_required, current_user
from app.database import db
from app.models.note import Notebook, NotebookPage, NotebookShare
from app.utils.note_helpers import parse_page_data, dump_page_data

notes = Blueprint("notes", __name__, url_prefix="/notes")

NOTEBOOK_TYPES = {
    "coding": {"name": "Coding & Logic", "icon": "💻", "description": "Programming, algorithms, logic, complexity and problem solving."},
    "theory": {"name": "Theory", "icon": "📚", "description": "Rich revision notes with formatting, lists, tables and charts."},
    "mathematics": {"name": "Mathematics", "icon": "🧮", "description": "Problems, unlimited working steps, calculator and formula library."},
    "graphs_dsa": {"name": "Graphs & DSA", "icon": "📊", "description": "Interactive graphs, trees, tables, structures, algorithms and flowcharts."},
    "general": {"name": "General", "icon": "📝", "description": "A flexible rich workspace for everyday notes and ideas."},
    "project": {"name": "Projects & Research", "icon": "🚀", "description": "Research, planning, references, milestones, experiments and decisions."},
    "flashcards": {"name": "Flashcards & Revision", "icon": "🗂️", "description": "Build active-recall cards, hints, answers and revision sets."},
    "lab": {"name": "Lab & Experiments", "icon": "🧪", "description": "Record experiments, observations, results, variables and conclusions."},
    "exam": {"name": "Exam Prep", "icon": "🎯", "description": "Syllabus tracking, important questions, mistakes and rapid revision."},
}


@notes.route("/")
@login_required
def notes_page():
    notebooks = Notebook.query.filter_by(user_id=current_user.id).order_by(Notebook.updated_at.desc()).all()
    return render_template("notes/notes.html", notebooks=notebooks, notebook_types=NOTEBOOK_TYPES)


@notes.route("/create", methods=["GET", "POST"])
@login_required
def create_notebook():
    if request.method == "POST":
        title = request.form.get("title", "").strip()
        description = request.form.get("description", "").strip()
        notebook_type = request.form.get("notebook_type", "general")
        subject = request.form.get("subject", "").strip()
        icon = request.form.get("icon", "").strip() or NOTEBOOK_TYPES.get(notebook_type, NOTEBOOK_TYPES["general"])["icon"]
        color = request.form.get("color", "#9b8ddd").strip() or "#9b8ddd"
        if notebook_type not in NOTEBOOK_TYPES:
            notebook_type = "general"
        if not title:
            flash("Give your notebook a name first ✨", "error")
            return redirect(url_for("notes.create_notebook"))

        notebook = Notebook(user_id=current_user.id, title=title, description=description,
                            notebook_type=notebook_type, subject=subject, icon=icon, color=color)
        db.session.add(notebook)
        db.session.flush()
        db.session.add(NotebookPage(notebook_id=notebook.id, title="Welcome", content=dump_page_data(parse_page_data("")), position=0))
        db.session.commit()
        flash("Your new notebook is ready ✨", "success")
        return redirect(url_for("notes.open_notebook", notebook_id=notebook.id))
    return render_template("notes/create_notebook.html", notebook_types=NOTEBOOK_TYPES)


@notes.route("/<int:notebook_id>")
@login_required
def open_notebook(notebook_id):
    notebook = Notebook.query.filter_by(id=notebook_id, user_id=current_user.id).first_or_404()
    pages = notebook.pages
    selected_page_id = request.args.get("page", type=int)
    selected_page = next((p for p in pages if p.id == selected_page_id), None) if selected_page_id else None
    if selected_page is None and pages:
        selected_page = pages[0]
    page_data = parse_page_data(selected_page.content if selected_page else "") if selected_page else parse_page_data("")
    type_template = NOTEBOOK_TYPES.get(notebook.notebook_type, NOTEBOOK_TYPES["general"])
    return render_template("notes/notebook.html", notebook=notebook, pages=pages,
                           selected_page=selected_page, page_data=page_data,
                           type_template=type_template, notebook_types=NOTEBOOK_TYPES)


@notes.route("/<int:notebook_id>/page/create", methods=["POST"])
@login_required
def create_page(notebook_id):
    notebook = Notebook.query.filter_by(id=notebook_id, user_id=current_user.id).first_or_404()
    title = request.form.get("title", "Untitled Page").strip() or "Untitled Page"
    page = NotebookPage(notebook_id=notebook.id, title=title,
                        content=dump_page_data(parse_page_data("")), position=len(notebook.pages))
    db.session.add(page)
    notebook.updated_at = db.func.now()
    db.session.commit()
    return redirect(url_for("notes.open_notebook", notebook_id=notebook.id, page=page.id))


@notes.route("/<int:notebook_id>/page/<int:page_id>/save", methods=["POST"])
@login_required
def save_page(notebook_id, page_id):
    notebook = Notebook.query.filter_by(id=notebook_id, user_id=current_user.id).first_or_404()
    page = NotebookPage.query.filter_by(id=page_id, notebook_id=notebook.id).first_or_404()
    page.title = request.form.get("title", page.title).strip() or "Untitled Page"
    raw = request.form.get("page_data", "")
    try:
        data = parse_page_data(raw)
        if not data.get("version"):
            raise ValueError
    except Exception:
        data = parse_page_data(request.form.get("content", ""))
    page.content = dump_page_data(data)
    notebook.updated_at = db.func.now()
    db.session.commit()
    flash("Notebook saved ✨", "success")
    return redirect(url_for("notes.open_notebook", notebook_id=notebook.id, page=page.id))


@notes.route("/<int:notebook_id>/settings", methods=["POST"])
@login_required
def update_notebook_settings(notebook_id):
    notebook = Notebook.query.filter_by(id=notebook_id, user_id=current_user.id).first_or_404()
    notebook.color = request.form.get("color", notebook.color or "#9b8ddd")
    notebook.icon = request.form.get("icon", notebook.icon).strip() or notebook.icon
    notebook.description = request.form.get("description", notebook.description or "").strip()
    notebook.updated_at = db.func.now()
    db.session.commit()
    return redirect(url_for("notes.open_notebook", notebook_id=notebook.id))


@notes.route("/<int:notebook_id>/share", methods=["POST"])
@login_required
def toggle_share(notebook_id):
    notebook = Notebook.query.filter_by(id=notebook_id, user_id=current_user.id).first_or_404()
    share = notebook.ensure_share()
    share.enabled = request.form.get("enabled") == "1"
    share.permission = request.form.get("permission", "view")
    db.session.add(share)
    db.session.commit()
    flash("Sharing settings updated.", "success")
    return redirect(url_for("notes.open_notebook", notebook_id=notebook.id))


@notes.route("/shared/<token>")
def shared_notebook(token):
    share = NotebookShare.query.filter_by(token=token, enabled=True).first_or_404()
    notebook = share.notebook
    return render_template("notes/shared_notebook.html", notebook=notebook, pages=notebook.pages,
                           notebook_types=NOTEBOOK_TYPES, share=share)


@notes.route("/<int:notebook_id>/page/<int:page_id>/delete", methods=["POST"])
@login_required
def delete_page(notebook_id, page_id):
    notebook = Notebook.query.filter_by(id=notebook_id, user_id=current_user.id).first_or_404()
    page = NotebookPage.query.filter_by(id=page_id, notebook_id=notebook.id).first_or_404()
    if len(notebook.pages) <= 1:
        flash("A notebook needs at least one page.", "error")
        return redirect(url_for("notes.open_notebook", notebook_id=notebook.id))
    db.session.delete(page)
    db.session.commit()
    return redirect(url_for("notes.open_notebook", notebook_id=notebook.id))


@notes.route("/<int:notebook_id>/delete", methods=["POST"])
@login_required
def delete_notebook(notebook_id):
    notebook = Notebook.query.filter_by(id=notebook_id, user_id=current_user.id).first_or_404()
    db.session.delete(notebook)
    db.session.commit()
    flash("Notebook deleted.", "success")
    return redirect(url_for("notes.notes_page"))


@notes.route("/<int:notebook_id>/page/<int:page_id>/pin", methods=["POST"])
@login_required
def toggle_pin(notebook_id, page_id):
    notebook = Notebook.query.filter_by(id=notebook_id, user_id=current_user.id).first_or_404()
    page = NotebookPage.query.filter_by(id=page_id, notebook_id=notebook.id).first_or_404()
    page.pinned = not page.pinned
    db.session.commit()
    return redirect(url_for("notes.open_notebook", notebook_id=notebook.id, page=page.id))
