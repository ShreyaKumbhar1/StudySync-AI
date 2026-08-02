from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email, Length
from flask_wtf import FlaskForm

class RegisterForm(FlaskForm):

    name = StringField(
        "",
        validators=[DataRequired(), Length(min=2, max=100)],
        render_kw={"placeholder": "Full Name"}
    )

    email = StringField(
        "",
        validators=[DataRequired(), Email()],
        render_kw={"placeholder": "Email Address"}
    )

    password = PasswordField(
        "",
        validators=[DataRequired(), Length(min=6)],
        render_kw={"placeholder": "Password"}
    )

    submit = SubmitField("Create Account")