from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Email


class LoginForm(FlaskForm):

    email = StringField(
        "",
        validators=[DataRequired(), Email()],
        render_kw={"placeholder": "Email Address"}
    )

    password = PasswordField(
        "",
        validators=[DataRequired()],
        render_kw={"placeholder": "Password"}
    )

    submit = SubmitField("Login")