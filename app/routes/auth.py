import os
import uuid

from flask import (
    Blueprint,
    render_template,
    redirect,
    url_for,
    flash,
    session,
    send_from_directory,
    current_app
)

from flask_login import (
    login_user,
    logout_user,
    login_required,
    current_user
)

from werkzeug.utils import secure_filename

from app.forms.user_forms import (
    RegisterForm,
    ProfileForm,
    DocumentUploadForm
)

from app.forms.login_form import LoginForm

from app.models.user import User
from app.models.profile_document import ProfileDocument

from app.database import db
from app.extensions import bcrypt


auth = Blueprint(
    "auth",
    __name__
)


# ==========================================================
# LOGIN
# ==========================================================

@auth.route(
    "/login",
    methods=["GET", "POST"]
)
def login():

    form = LoginForm()

    if form.validate_on_submit():

        user = User.query.filter_by(
            email=form.email.data
        ).first()

        if user and bcrypt.check_password_hash(
            user.password,
            form.password.data
        ):

            login_user(user)

            session["show_orion_boot"] = True

            flash(
                "Welcome back!",
                "success"
            )

            return redirect(
                url_for("dashboard")
            )

        flash(
            "Invalid email or password.",
            "danger"
        )

    return render_template(
        "login.html",
        form=form
    )


# ==========================================================
# REGISTER
# ==========================================================

@auth.route(
    "/register",
    methods=["GET", "POST"]
)
def register():

    form = RegisterForm()

    if form.validate_on_submit():

        existing_user = User.query.filter_by(
            email=form.email.data
        ).first()

        if existing_user:

            flash(
                "An account with this email already exists.",
                "danger"
            )

            return render_template(
                "register.html",
                form=form
            )

        hashed_password = (
            bcrypt.generate_password_hash(
                form.password.data
            ).decode("utf-8")
        )

        user = User(

            name=form.name.data,

            email=form.email.data,

            password=hashed_password
        )

        db.session.add(user)

        db.session.commit()

        session["show_orion_boot"] = True

        flash(
            "Registration successful! Please login.",
            "success"
        )

        return redirect(
            url_for("auth.login")
        )

    return render_template(
        "register.html",
        form=form
    )


# ==========================================================
# LOGOUT
# ==========================================================

@auth.route("/logout")
@login_required
def logout():

    logout_user()

    flash(
        "Logged out successfully.",
        "success"
    )

    return redirect(
        url_for("auth.login")
    )


# ==========================================================
# PROFILE
# ==========================================================

@auth.route(
    "/profile",
    methods=["GET", "POST"]
)
@login_required
def profile():

    form = ProfileForm(
        obj=current_user
    )

    certificate_form = DocumentUploadForm()

    achievement_form = DocumentUploadForm()

    # ======================================================
    # UPDATE PROFILE
    # ======================================================

    if form.validate_on_submit():

        current_user.name = form.name.data

        current_user.email = form.email.data

        current_user.dob = form.dob.data

        current_user.contact_number = (
            form.contact_number.data
        )

        current_user.college = (
            form.college.data
        )

        current_user.department = (
            form.department.data
        )

        current_user.current_year = (
            form.current_year.data
        )

        current_user.bio = form.bio.data

        current_user.github = (
            form.github.data
        )

        current_user.linkedin = (
            form.linkedin.data
        )

        current_user.leetcode = (
            form.leetcode.data
        )

        current_user.hackerrank = (
            form.hackerrank.data
        )

        current_user.kaggle = (
            form.kaggle.data
        )

        current_user.portfolio = (
            form.portfolio.data
        )

        current_user.other_link = (
            form.other_link.data
        )

        db.session.commit()

        flash(
            "Your profile has been updated successfully! ✨",
            "success"
        )

        return redirect(
            url_for("auth.profile")
        )

    # ======================================================
    # CERTIFICATES
    # ======================================================

    certificates = (
        ProfileDocument.query
        .filter_by(
            user_id=current_user.id,
            category="certificate"
        )
        .order_by(
            ProfileDocument.uploaded_at.desc()
        )
        .all()
    )

    # ======================================================
    # ACHIEVEMENTS
    # ======================================================

    achievements = (
        ProfileDocument.query
        .filter_by(
            user_id=current_user.id,
            category="achievement"
        )
        .order_by(
            ProfileDocument.uploaded_at.desc()
        )
        .all()
    )

    return render_template(
        "profile.html",

        form=form,

        certificate_form=certificate_form,

        achievement_form=achievement_form,

        certificates=certificates,

        achievements=achievements
    )


# ==========================================================
# UPLOAD PROFILE DOCUMENT
# ==========================================================

@auth.route(
    "/profile/upload/<category>",
    methods=["POST"]
)
@login_required
def upload_profile_document(category):

    # ======================================================
    # VALIDATE CATEGORY
    # ======================================================

    if category not in (
        "certificate",
        "achievement"
    ):

        flash(
            "Invalid upload category.",
            "danger"
        )

        return redirect(
            url_for("auth.profile")
        )

    # ======================================================
    # FORM
    # ======================================================

    form = DocumentUploadForm()

    if not form.validate_on_submit():

        flash(
            "Please select a file before uploading.",
            "danger"
        )

        return redirect(
            url_for("auth.profile")
        )

    uploaded_file = form.file.data

    if not uploaded_file:

        flash(
            "No file was selected.",
            "danger"
        )

        return redirect(
            url_for("auth.profile")
        )

    # ======================================================
    # ALLOWED FILE TYPES
    # ======================================================

    allowed_extensions = {
        "pdf",
        "png",
        "jpg",
        "jpeg",
        "webp",
        "doc",
        "docx"
    }

    # ======================================================
    # ORIGINAL NAME
    # ======================================================

    original_name = secure_filename(
        uploaded_file.filename
    )

    if not original_name:

        flash(
            "Invalid file name.",
            "danger"
        )

        return redirect(
            url_for("auth.profile")
        )

    # ======================================================
    # EXTENSION
    # ======================================================

    if "." not in original_name:

        flash(
            "The uploaded file has no extension.",
            "danger"
        )

        return redirect(
            url_for("auth.profile")
        )

    extension = (
        original_name
        .rsplit(".", 1)[-1]
        .lower()
    )

    if extension not in allowed_extensions:

        flash(
            "This file type is not supported.",
            "danger"
        )

        return redirect(
            url_for("auth.profile")
        )

    # ======================================================
    # USER DIRECTORY
    # ======================================================

    user_folder = os.path.join(

        current_app.instance_path,

        "profile_uploads",

        str(current_user.id)
    )

    # ======================================================
    # CATEGORY DIRECTORY
    # ======================================================

    if category == "certificate":

        category_folder = os.path.join(
            user_folder,
            "certificates"
        )

    else:

        category_folder = os.path.join(
            user_folder,
            "achievements"
        )

    # ======================================================
    # CREATE DIRECTORY
    # ======================================================

    os.makedirs(
        category_folder,
        exist_ok=True
    )

    # ======================================================
    # UNIQUE FILE NAME
    # ======================================================

    unique_filename = (
        f"{uuid.uuid4().hex}.{extension}"
    )

    file_path = os.path.join(
        category_folder,
        unique_filename
    )

    # ======================================================
    # SAVE FILE
    # ======================================================

    uploaded_file.save(
        file_path
    )

    # ======================================================
    # SAVE DATABASE RECORD
    # ======================================================

    document = ProfileDocument(

        user_id=current_user.id,

        category=category,

        original_filename=original_name,

        stored_filename=unique_filename
    )

    db.session.add(document)

    db.session.commit()

    # ======================================================
    # SUCCESS
    # ======================================================

    if category == "certificate":

        flash(
            "Certificate uploaded successfully! 📜",
            "success"
        )

    else:

        flash(
            "Achievement uploaded successfully! 🏆",
            "success"
        )

    return redirect(
        url_for("auth.profile")
    )


# ==========================================================
# VIEW DOCUMENT
# ==========================================================

@auth.route(
    "/profile/document/<int:document_id>"
)
@login_required
def view_profile_document(document_id):

    document = ProfileDocument.query.get_or_404(
        document_id
    )

    # ======================================================
    # SECURITY CHECK
    # ======================================================

    if document.user_id != current_user.id:

        flash(
            "You do not have permission to access this file.",
            "danger"
        )

        return redirect(
            url_for("auth.profile")
        )

    # ======================================================
    # CATEGORY
    # ======================================================

    if document.category == "certificate":

        category_folder = "certificates"

    else:

        category_folder = "achievements"

    # ======================================================
    # DIRECTORY
    # ======================================================

    folder = os.path.join(

        current_app.instance_path,

        "profile_uploads",

        str(current_user.id),

        category_folder
    )

    # ======================================================
    # SEND FILE
    # ======================================================

    return send_from_directory(

        folder,

        document.stored_filename,

        as_attachment=False
    )

    # ==========================================================
# DOWNLOAD DOCUMENT
# ==========================================================

@auth.route(
    "/profile/document/download/<int:document_id>"
)
@login_required
def download_profile_document(document_id):

    document = ProfileDocument.query.get_or_404(
        document_id
    )

    # ======================================================
    # SECURITY CHECK
    # ======================================================

    if document.user_id != current_user.id:

        flash(
            "You do not have permission to access this file.",
            "danger"
        )

        return redirect(
            url_for("auth.profile")
        )

    # ======================================================
    # CATEGORY
    # ======================================================

    if document.category == "certificate":

        category_folder = "certificates"

    else:

        category_folder = "achievements"

    # ======================================================
    # DIRECTORY
    # ======================================================

    folder = os.path.join(
        current_app.instance_path,
        "profile_uploads",
        str(current_user.id),
        category_folder
    )

    # ======================================================
    # DOWNLOAD
    # ======================================================

    return send_from_directory(
        folder,
        document.stored_filename,
        as_attachment=True,
        download_name=document.original_filename
    )

# ==========================================================
# DELETE DOCUMENT
# ==========================================================

@auth.route(
    "/profile/document/delete/<int:document_id>",
    methods=["POST"]
)
@login_required
def delete_profile_document(document_id):

    document = ProfileDocument.query.get_or_404(
        document_id
    )

    # ======================================================
    # SECURITY CHECK
    # ======================================================

    if document.user_id != current_user.id:

        flash(
            "You do not have permission to delete this file.",
            "danger"
        )

        return redirect(
            url_for("auth.profile")
        )

    # ======================================================
    # CATEGORY
    # ======================================================

    if document.category == "certificate":

        category_folder = "certificates"

    else:

        category_folder = "achievements"

    # ======================================================
    # FILE PATH
    # ======================================================

    folder = os.path.join(

        current_app.instance_path,

        "profile_uploads",

        str(current_user.id),

        category_folder
    )

    file_path = os.path.join(
        folder,
        document.stored_filename
    )

    # ======================================================
    # DELETE ACTUAL FILE
    # ======================================================

    if os.path.exists(file_path):

        os.remove(file_path)

    # ======================================================
    # DELETE DATABASE RECORD
    # ======================================================

    db.session.delete(document)

    db.session.commit()

    flash(
        "File deleted successfully.",
        "success"
    )

    return redirect(
        url_for("auth.profile")
    )