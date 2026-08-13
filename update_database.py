import sqlite3
import os


DATABASE = "instance/studysync.db"


# ==========================================================
# CHECK DATABASE
# ==========================================================

if not os.path.exists(DATABASE):

    print(
        f"Database not found: {DATABASE}"
    )

    print(
        "Run the Flask application first."
    )

    raise SystemExit


conn = sqlite3.connect(DATABASE)

cursor = conn.cursor()


# ==========================================================
# ADD PROFILE COLUMNS
# ==========================================================

columns = [

    ("dob", "VARCHAR(20)"),

    ("contact_number", "VARCHAR(20)"),

    ("college", "VARCHAR(150)"),

    ("department", "VARCHAR(150)"),

    ("current_year", "VARCHAR(50)"),

    ("bio", "TEXT"),

    ("github", "VARCHAR(300)"),

    ("linkedin", "VARCHAR(300)"),

    ("leetcode", "VARCHAR(300)"),

    ("hackerrank", "VARCHAR(300)"),

    ("kaggle", "VARCHAR(300)"),

    ("portfolio", "VARCHAR(300)"),

    ("other_link", "VARCHAR(300)")
]


for column_name, column_type in columns:

    try:

        cursor.execute(
            f"""
            ALTER TABLE users
            ADD COLUMN {column_name}
            {column_type}
            """
        )

        print(
            f"Added: {column_name}"
        )

    except sqlite3.OperationalError:

        print(
            f"Already exists: {column_name}"
        )


# ==========================================================
# CREATE PROFILE DOCUMENTS TABLE
# ==========================================================

cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS profile_documents (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user_id INTEGER NOT NULL,

        category VARCHAR(50) NOT NULL,

        original_filename VARCHAR(255) NOT NULL,

        stored_filename VARCHAR(255) NOT NULL,

        uploaded_at DATETIME NOT NULL,

        FOREIGN KEY(user_id)
            REFERENCES users(id)

    )
    """
)


print(
    "Profile documents table ready."
)


# ==========================================================
# SAVE
# ==========================================================

conn.commit()

conn.close()


print(
    "\nDatabase update completed successfully!"
)