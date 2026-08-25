from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    url_for,
    flash
)

from flask_login import login_required, current_user

from app.database import db
from app.models.note import Notebook, NotebookPage


notes = Blueprint(
    "notes",
    __name__,
    url_prefix="/notes"
)


NOTEBOOK_TYPES = {
    "coding": {
        "name": "Coding & Logic",
        "icon": "💻",
        "description": "Programming, algorithms, logic and problem solving."
    },

    "theory": {
        "name": "Theory",
        "icon": "📚",
        "description": "Concepts, definitions, explanations and revision notes."
    },

    "mathematics": {
        "name": "Mathematics",
        "icon": "🧮",
        "description": "Formulas, problems, working and solutions."
    },

    "graphs_dsa": {
        "name": "Graphs & DSA",
        "icon": "📊",
        "description": "Graphs, trees, algorithms, structures and complexity."
    },

    "general": {
        "name": "General",
        "icon": "📝",
        "description": "Flexible notes for anything you want to remember."
    },

    "project": {
        "name": "Projects & Research",
        "icon": "🚀",
        "description": "Ideas, research, experiments, progress and project planning."
    }
}


@notes.route("/")
@login_required
def notes_page():

    notebooks = (
        Notebook.query
        .filter_by(user_id=current_user.id)
        .order_by(Notebook.updated_at.desc())
        .all()
    )

    return render_template(
        "notes/notes.html",
        notebooks=notebooks,
        notebook_types=NOTEBOOK_TYPES
    )


@notes.route("/create", methods=["GET", "POST"])
@login_required
def create_notebook():

    if request.method == "POST":

        title = request.form.get(
            "title",
            ""
        ).strip()

        description = request.form.get(
            "description",
            ""
        ).strip()

        notebook_type = request.form.get(
            "notebook_type",
            "general"
        )

        subject = request.form.get(
            "subject",
            ""
        ).strip()

        icon = request.form.get(
            "icon",
            ""
        ).strip()

        if notebook_type not in NOTEBOOK_TYPES:
            notebook_type = "general"

        if not title:

            flash(
                "Give your notebook a name first ✨",
                "error"
            )

            return redirect(
                url_for("notes.create_notebook")
            )

        if not icon:
            icon = NOTEBOOK_TYPES[
                notebook_type
            ]["icon"]

        notebook = Notebook(

            user_id=current_user.id,

            title=title,

            description=description,

            notebook_type=notebook_type,

            subject=subject,

            icon=icon
        )

        db.session.add(notebook)

        db.session.flush()

        first_page = NotebookPage(

            notebook_id=notebook.id,

            title="Welcome",

            content="",

            position=0
        )

        db.session.add(first_page)

        db.session.commit()

        flash(
            "Your new notebook is ready ✨",
            "success"
        )

        return redirect(
            url_for(
                "notes.open_notebook",
                notebook_id=notebook.id
            )
        )

    return render_template(
        "notes/create_notebook.html",
        notebook_types=NOTEBOOK_TYPES
    )


@notes.route("/<int:notebook_id>")
@login_required
def open_notebook(notebook_id):

    notebook = (
        Notebook.query
        .filter_by(
            id=notebook_id,
            user_id=current_user.id
        )
        .first_or_404()
    )

    pages = notebook.pages

    selected_page_id = request.args.get(
        "page",
        type=int
    )

    selected_page = None

    if selected_page_id:

        selected_page = next(
            (
                page
                for page in pages
                if page.id == selected_page_id
            ),
            None
        )

    if selected_page is None and pages:
        selected_page = pages[0]

    type_template = NOTEBOOK_TYPES.get(
        notebook.notebook_type,
        NOTEBOOK_TYPES["general"]
    )

    return render_template(
        "notes/notebook.html",
        notebook=notebook,
        pages=pages,
        selected_page=selected_page,
        type_template=type_template
    )


@notes.route("/<int:notebook_id>/page/create", methods=["POST"])
@login_required
def create_page(notebook_id):

    notebook = (
        Notebook.query
        .filter_by(
            id=notebook_id,
            user_id=current_user.id
        )
        .first_or_404()
    )

    title = request.form.get(
        "title",
        "Untitled Page"
    ).strip()

    if not title:
        title = "Untitled Page"

    page = NotebookPage(

        notebook_id=notebook.id,

        title=title,

        content="",

        position=len(notebook.pages)
    )

    db.session.add(page)

    notebook.updated_at = db.func.now()

    db.session.commit()

    flash(
        "New page created ✨",
        "success"
    )

    return redirect(
        url_for(
            "notes.open_notebook",
            notebook_id=notebook.id,
            page=page.id
        )
    )


@notes.route(
    "/<int:notebook_id>/page/<int:page_id>/save",
    methods=["POST"]
)
@login_required
def save_page(notebook_id, page_id):

    notebook = (
        Notebook.query
        .filter_by(
            id=notebook_id,
            user_id=current_user.id
        )
        .first_or_404()
    )

    page = (
        NotebookPage.query
        .filter_by(
            id=page_id,
            notebook_id=notebook.id
        )
        .first_or_404()
    )

    page.title = request.form.get(
        "title",
        page.title
    ).strip()

    page.content = request.form.get(
        "content",
        ""
    )

    notebook.updated_at = db.func.now()

    db.session.commit()

    flash(
        "Notebook saved ✨",
        "success"
    )

    return redirect(
        url_for(
            "notes.open_notebook",
            notebook_id=notebook.id,
            page=page.id
        )
    )


@notes.route(
    "/<int:notebook_id>/page/<int:page_id>/delete",
    methods=["POST"]
)
@login_required
def delete_page(notebook_id, page_id):

    notebook = (
        Notebook.query
        .filter_by(
            id=notebook_id,
            user_id=current_user.id
        )
        .first_or_404()
    )

    page = (
        NotebookPage.query
        .filter_by(
            id=page_id,
            notebook_id=notebook.id
        )
        .first_or_404()
    )

    if len(notebook.pages) <= 1:

        flash(
            "A notebook needs at least one page.",
            "error"
        )

        return redirect(
            url_for(
                "notes.open_notebook",
                notebook_id=notebook.id
            )
        )

    db.session.delete(page)

    db.session.commit()

    flash(
        "Page deleted.",
        "success"
    )

    return redirect(
        url_for(
            "notes.open_notebook",
            notebook_id=notebook.id
        )
    )


@notes.route(
    "/<int:notebook_id>/delete",
    methods=["POST"]
)
@login_required
def delete_notebook(notebook_id):

    notebook = (
        Notebook.query
        .filter_by(
            id=notebook_id,
            user_id=current_user.id
        )
        .first_or_404()
    )

    db.session.delete(notebook)

    db.session.commit()

    flash(
        "Notebook deleted.",
        "success"
    )

    return redirect(
        url_for("notes.notes_page")
    )


@notes.route(
    "/<int:notebook_id>/page/<int:page_id>/pin",
    methods=["POST"]
)
@login_required
def toggle_pin(notebook_id, page_id):

    notebook = (
        Notebook.query
        .filter_by(
            id=notebook_id,
            user_id=current_user.id
        )
        .first_or_404()
    )

    page = (
        NotebookPage.query
        .filter_by(
            id=page_id,
            notebook_id=notebook.id
        )
        .first_or_404()
    )

    page.pinned = not page.pinned

    db.session.commit()

    return redirect(
        url_for(
            "notes.open_notebook",
            notebook_id=notebook.id,
            page=page.id
        )
    )