from wtforms import (
    StringField,
    PasswordField,
    SubmitField,
    TextAreaField,
    FileField
)

from wtforms.validators import (
    DataRequired,
    Email,
    Length,
    Optional,
    Regexp
)

from flask_wtf import FlaskForm


# ==========================================================
# REGISTER FORM
# ==========================================================

class RegisterForm(FlaskForm):

    name = StringField(
        "",
        validators=[
            DataRequired(),
            Length(min=2, max=100)
        ],
        render_kw={
            "placeholder": "Full Name"
        }
    )

    email = StringField(
        "",
        validators=[
            DataRequired(),
            Email()
        ],
        render_kw={
            "placeholder": "Email Address"
        }
    )

    password = PasswordField(
        "",
        validators=[
            DataRequired(),
            Length(min=6)
        ],
        render_kw={
            "placeholder": "Password"
        }
    )

    submit = SubmitField(
        "Create Account"
    )


# ==========================================================
# PROFILE FORM
# ==========================================================

class ProfileForm(FlaskForm):

    name = StringField(
        "Full Name",
        validators=[
            DataRequired(),
            Length(max=100)
        ]
    )

    email = StringField(
        "Email",
        validators=[
            DataRequired(),
            Email()
        ]
    )

    dob = StringField(
        "Date of Birth",
        validators=[
            Optional(),
            Length(max=20)
        ],
        render_kw={
            "placeholder": "DD-MM-YYYY"
        }
    )

    contact_number = StringField(
        "Contact Number",
        validators=[
            Optional(),
            Length(max=20)
        ],
        render_kw={
            "placeholder": "Enter your contact number"
        }
    )

    college = StringField(
        "College",
        validators=[
            Optional(),
            Length(max=200)
        ],
        render_kw={
            "placeholder": "Enter your college"
        }
    )

    department = StringField(
        "Department",
        validators=[
            Optional(),
            Length(max=150)
        ],
        render_kw={
            "placeholder": "e.g. Computer Science and Engineering"
        }
    )

    current_year = StringField(
        "Current Year",
        validators=[
            Optional(),
            Length(max=50)
        ],
        render_kw={
            "placeholder": "e.g. 3rd Year"
        }
    )

    bio = TextAreaField(
        "Bio",
        validators=[
            Optional(),
            Length(max=1000)
        ],
        render_kw={
            "placeholder": "Tell us about yourself, your goals and what you're currently working on."
        }
    )

    # ======================================================
    # SOCIAL LINKS
    # ======================================================

    github = StringField(
        "GitHub",
        validators=[
            Optional(),
            Length(max=300)
        ],
        render_kw={
            "placeholder": "https://github.com/username"
        }
    )

    linkedin = StringField(
        "LinkedIn",
        validators=[
            Optional(),
            Length(max=300)
        ],
        render_kw={
            "placeholder": "https://linkedin.com/in/username"
        }
    )

    leetcode = StringField(
        "LeetCode",
        validators=[
            Optional(),
            Length(max=300)
        ],
        render_kw={
            "placeholder": "https://leetcode.com/u/username"
        }
    )

    hackerrank = StringField(
        "HackerRank",
        validators=[
            Optional(),
            Length(max=300)
        ],
        render_kw={
            "placeholder": "HackerRank profile URL"
        }
    )

    kaggle = StringField(
        "Kaggle",
        validators=[
            Optional(),
            Length(max=300)
        ],
        render_kw={
            "placeholder": "Kaggle profile URL"
        }
    )

    portfolio = StringField(
        "Portfolio",
        validators=[
            Optional(),
            Length(max=300)
        ],
        render_kw={
            "placeholder": "Your portfolio URL"
        }
    )

    other_link = StringField(
        "Other",
        validators=[
            Optional(),
            Length(max=300)
        ],
        render_kw={
            "placeholder": "Other profile / website"
        }
    )

    submit = SubmitField(
        "Save Changes"
    )


# ==========================================================
# DOCUMENT UPLOAD FORM
# ==========================================================

class DocumentUploadForm(FlaskForm):

    file = FileField(
        "Select File",
        validators=[
            DataRequired()
        ]
    )

    submit = SubmitField(
        "Upload"
    )