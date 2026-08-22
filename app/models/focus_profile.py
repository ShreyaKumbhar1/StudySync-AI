from app.database import db


class FocusProfile(db.Model):

    __tablename__ = "focus_profiles"


    id = db.Column(
        db.Integer,
        primary_key=True
    )


    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        unique=True,
        nullable=False
    )


    antennas = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )


    unlocked_trees = db.Column(
        db.Text,
        default="",
        nullable=False
    )


    unlocked_music = db.Column(
        db.Text,
        default="midnight_study,deep_focus",
        nullable=False
    )


    total_trees = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )


    destroyed_trees = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )


    total_focus_minutes = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )


    longest_session_minutes = db.Column(
        db.Integer,
        default=0,
        nullable=False
    )


    daily_goal_minutes = db.Column(
        db.Integer,
        nullable=True
    )


    user = db.relationship(
        "User",
        backref=db.backref(
            "focus_profile",
            uselist=False,
            cascade="all, delete-orphan"
        )
    )


    def get_unlocked_trees(self):

        if not self.unlocked_trees:
            return []

        return [
            item.strip()
            for item in self.unlocked_trees.split(",")
            if item.strip()
        ]


    def get_unlocked_music(self):

        if not self.unlocked_music:
            return []

        return [
            item.strip()
            for item in self.unlocked_music.split(",")
            if item.strip()
        ]


    def has_tree(
        self,
        tree_id
    ):

        return (
            tree_id
            in
            self.get_unlocked_trees()
        )


    def has_music(
        self,
        music_id
    ):

        return (
            music_id
            in
            self.get_unlocked_music()
        )


    def unlock_tree(
        self,
        tree_id
    ):

        unlocked = (
            self.get_unlocked_trees()
        )

        if tree_id not in unlocked:

            unlocked.append(
                tree_id
            )

            self.unlocked_trees = (
                ",".join(unlocked)
            )


    def unlock_music(
        self,
        music_id
    ):

        unlocked = (
            self.get_unlocked_music()
        )

        if music_id not in unlocked:

            unlocked.append(
                music_id
            )

            self.unlocked_music = (
                ",".join(unlocked)
            )


    def __repr__(self):

        return (
            f"<FocusProfile "
            f"user={self.user_id} "
            f"antennas={self.antennas}>"
        )