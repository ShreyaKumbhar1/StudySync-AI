from wtforms import (
    StringField,
    TextAreaField,
    DateField,
    SelectField,
    SubmitField
)

from wtforms.validators import (
    DataRequired,
    Optional,
    Length
)

from flask_wtf import FlaskForm


# ==========================================================
# CALENDAR EVENT FORM
# ==========================================================

class CalendarEventForm(FlaskForm):

    title = StringField(
        "Event Title",
        validators=[
            DataRequired(),
            Length(min=2, max=150)
        ],
        render_kw={
            "placeholder": "e.g. DBMS Internal Exam"
        }
    )

    category = SelectField(
        "Category",
        choices=[
            ("exam", "🧪 Exam"),
            ("assignment", "📝 Assignment"),
            ("study", "📚 Study"),
            ("event", "🎓 College Event"),
            ("personal", "✨ Personal")
        ],
        validators=[
            DataRequired()
        ]
    )

    description = TextAreaField(
        "Description",
        validators=[
            Optional(),
            Length(max=1000)
        ],
        render_kw={
            "placeholder": "Add some details..."
        }
    )

    event_date = DateField(
        "Date",
        validators=[
            DataRequired()
        ],
        format="%Y-%m-%d"
    )

    start_time = StringField(
        "Start Time",
        validators=[
            Optional(),
            Length(max=20)
        ],
        render_kw={
            "type": "time"
        }
    )

    end_time = StringField(
        "End Time",
        validators=[
            Optional(),
            Length(max=20)
        ],
        render_kw={
            "type": "time"
        }
    )

    priority = SelectField(
        "Priority",
        choices=[
            ("High", "🔴 High"),
            ("Medium", "🟡 Medium"),
            ("Low", "🟢 Low")
        ],
        validators=[
            DataRequired()
        ],
        default="Medium"
    )

    submit = SubmitField(
        "Add to Calendar"
    )