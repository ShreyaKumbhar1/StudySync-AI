import random


class Dimpu:

    def __init__(self):

        self.name = "Dimpu"

        self.expression = "idle"

    # ----------------------------
    # Expression
    # ----------------------------

    def set_expression(self, expression):

        self.expression = expression

    def get_expression(self):

        return self.expression

    # ----------------------------
    # Dialogue
    # ----------------------------

    def speak(self, expression=None):

        if expression is not None:
            self.expression = expression

        dialogues = {

            "idle": [

                "Bestie... what's today's mission? 📚",

                "Ready when you are. 🔥",

                "ORION online.",

                "Let's cook."

            ],

            "happy": [

                "You're doing amazing! 💜",

                "Keep the momentum going!",

                "Today's a productive day."

            ],

            "celebration": [

                "LEVEL CLEARED!! 🎉",

                "Academic weapon detected 😎",

                "Huge W."

            ],

            "thinking": [

                "Hmm... let me think...",

                "Analyzing...",

                "Working my snake brain..."

            ],

            "sad": [

                "Bad days happen.",

                "We'll recover together.",

                "You've got this."

            ],

            "sleeping": [

                "Nothing to do... 😴",

                "Wake me when we're studying.",

                "I'll recharge meanwhile."

            ],

            "angry": [

                "Instagram isn't in your syllabus 😤",

                "Stop procrastinating.",

                "Your future self is disappointed."

            ],

            "proud": [

                "I'm proud of you. 🐍",

                "You earned this.",

                "Keep climbing."

            ],

            "excited": [

                "LET'S GOOOO!! 🚀",

                "Today's gonna be legendary!",

                "Time to break records."

            ],

            "waving": [

                "Welcome back! 👋",

                "Missed you.",

                "Let's continue."

            ]

        }

        return random.choice(
            dialogues[self.expression]
        )

    # ----------------------------
    # Shortcuts
    # ----------------------------

    def celebrate(self):

        self.set_expression("celebration")

    def sleep(self):

        self.set_expression("sleeping")

    def think(self):

        self.set_expression("thinking")

    def happy(self):

        self.set_expression("happy")

    def angry(self):

        self.set_expression("angry")

    def proud(self):

        self.set_expression("proud")

    def excited(self):

        self.set_expression("excited")

    def wave(self):

        self.set_expression("waving")

    def idle(self):

        self.set_expression("idle")