from flask_wtf import FlaskForm

from wtforms import (
    SelectField,
    SubmitField
)

from wtforms.validators import (
    DataRequired,
    NumberRange
)

from wtforms.fields import IntegerField


class FocusStartForm(FlaskForm):

    tree_type = SelectField(
        "Choose Your Tree",
        choices=[],
        validators=[
            DataRequired()
        ]
    )

    duration_minutes = IntegerField(
        "Focus Duration",
        validators=[
            DataRequired(),
            NumberRange(
                min=30,
                max=120
            )
        ]
    )

    submit = SubmitField(
        "🔒 Lock In"
    )