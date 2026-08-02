from flask_wtf import FlaskForm
from wtforms import StringField, SelectField, DateField, SubmitField
from wtforms.validators import DataRequired


class TaskForm(FlaskForm):

    title = StringField(
        "",
        validators=[DataRequired()],
        render_kw={"placeholder": "Task Title"}
    )

    subject = StringField(
        "",
        render_kw={"placeholder": "Subject"}
    )

    due_date = DateField(
        "",
        format="%Y-%m-%d",
        render_kw={"type": "date"}
    )

    priority = SelectField(
        "",
        choices=[
            ("High", "High 🔴"),
            ("Medium", "Medium 🟡"),
            ("Low", "Low 🟢")
        ]
    )

    submit = SubmitField("Add Task")