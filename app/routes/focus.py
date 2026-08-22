from datetime import datetime, timedelta
import os
import re

from flask import (
    Blueprint,
    jsonify,
    redirect,
    render_template,
    request,
    session as flask_session,
    url_for,
)

from flask_login import current_user, login_required

from app.database import db
from app.forms.focus_forms import FocusStartForm
from app.models.focus_profile import FocusProfile
from app.models.focus_session import FocusSession
from app.models.focus_challenge_reward import FocusChallengeReward
from app.utils.forest_slots import FOREST_SLOTS, FOREST_CAPACITIES

# ==========================================================
# BLUEPRINT
# ==========================================================

focus = Blueprint(
    "focus",
    __name__,
)

# ==========================================================
# ASSET DISCOVERY
# ==========================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

STATIC_DIR = os.path.join(
    BASE_DIR,
    "static"
)

TREE_ASSET_DIR = os.path.join(
    STATIC_DIR,
    "images",
    "lockin_grove",
    "trees"
)

MUSIC_ASSET_DIR = os.path.join(
    STATIC_DIR,
    "audio",
    "focus"
)


def _slug(value):
    value = str(value).strip().lower()
    value = re.sub(r"[^a-z0-9]+", "_", value)
    value = re.sub(r"_+", "_", value)
    return value.strip("_")


def _pretty_name(filename):
    stem = os.path.splitext(
        os.path.basename(filename)
    )[0]

    stem = re.sub(
        r"^(tree|trees)[_-]?",
        "",
        stem,
        flags=re.IGNORECASE
    )

    stem = stem.replace("_", " ").replace("-", " ").strip()

    if not stem:
        stem = "Forest Tree"

    return stem.title()


def _asset_url(folder, filename):
    folder = folder.replace("\\", "/")
    filename = filename.replace("\\", "/")

    return (
        "/static/"
        + folder
        + "/"
        + filename
    )


def _find_tree_asset(tree_id, known_name):
    if not os.path.isdir(TREE_ASSET_DIR):
        return None

    wanted = {
        _slug(tree_id),
        _slug(known_name),
    }

    for root, _, files in os.walk(TREE_ASSET_DIR):
        for filename in files:
            if os.path.splitext(filename)[1].lower() not in (
                ".png",
                ".jpg",
                ".jpeg",
                ".webp",
            ):
                continue

            stem = _slug(
                os.path.splitext(filename)[0]
            )

            if stem in wanted:
                relative = os.path.relpath(
                    os.path.join(root, filename),
                    STATIC_DIR
                )

                return _asset_url(
                    "",
                    relative
                ).replace(
                    "/static//",
                    "/static/"
                )

    return None


def _discover_tree_assets():
    if not os.path.isdir(TREE_ASSET_DIR):
        return []

    result = []

    for root, _, files in os.walk(TREE_ASSET_DIR):
        for filename in sorted(files):
            if os.path.splitext(filename)[1].lower() not in (
                ".png",
                ".jpg",
                ".jpeg",
                ".webp",
            ):
                continue

            relative = os.path.relpath(
                os.path.join(root, filename),
                STATIC_DIR
            )

            result.append(
                {
                    "filename": filename,
                    "relative": relative.replace("\\", "/"),
                    "image":
                        _asset_url(
                            "",
                            relative
                        ).replace(
                            "/static//",
                            "/static/"
                        ),
                }
            )

    return result


def _discover_music_assets():
    if not os.path.isdir(MUSIC_ASSET_DIR):
        return []

    result = []

    for root, _, files in os.walk(MUSIC_ASSET_DIR):
        for filename in sorted(files):
            if os.path.splitext(filename)[1].lower() != ".mp3":
                continue

            relative = os.path.relpath(
                os.path.join(root, filename),
                STATIC_DIR
            )

            result.append(
                {
                    "filename": filename,
                    "relative": relative.replace("\\", "/"),
                    "file":
                        _asset_url(
                            "",
                            relative
                        ).replace(
                            "/static//",
                            "/static/"
                        ),
                }
            )

    return result


# ==========================================================
# TREE DEFINITIONS
# ==========================================================

BASE_TREES = {
    "starter": {
        "id": "starter",
        "name": "Starter Tree",
        "emoji": "🌱",
        "cost": 0,
        "description": (
            "A gentle beginning that represents the first step "
            "toward building a focused life."
        ),
    },
    "pine": {
        "id": "pine",
        "name": "Pine",
        "emoji": "🌲",
        "cost": 600,
        "description": (
            "A resilient evergreen symbolising steady progress "
            "and quiet consistency."
        ),
    },
    "cherry": {
        "id": "cherry",
        "name": "Cherry Blossom",
        "emoji": "🌸",
        "cost": 900,
        "description": (
            "A delicate tree representing beautiful results "
            "that grow from patient effort."
        ),
    },
    "maple": {
        "id": "maple",
        "name": "Maple",
        "emoji": "🍁",
        "cost": 1200,
        "description": (
            "A graceful tree celebrating discipline, change "
            "and consistent progress."
        ),
    },
    "ancient": {
        "id": "ancient",
        "name": "Ancient Tree",
        "emoji": "🌳",
        "cost": 1800,
        "description": (
            "A powerful old tree symbolising deep discipline, "
            "wisdom and long-term commitment."
        ),
    },
}


def _build_tree_catalog():
    discovered = _discover_tree_assets()

    trees = {
        key: dict(value)
        for key, value in BASE_TREES.items()
    }

    used_files = set()

    # First, connect known trees to real files.
    for tree_id, tree in trees.items():
        exact = _find_tree_asset(
            tree_id,
            tree["name"]
        )

        if exact:
            tree["image"] = exact

            used_files.add(
                exact
            )

    # Then expose every additional image that actually exists
    # in the user's tree folder.
    extra_costs = [
        600,
        750,
        900,
        1050,
        1200,
        1350,
        1500,
        1650,
        1800,
        1950,
        2100,
        2250,
        2400,
        2500,
    ]

    extra_index = 0

    for item in discovered:
        image = item["image"]

        if image in used_files:
            continue

        stem = os.path.splitext(
            item["filename"]
        )[0]

        tree_id = _slug(stem)

        if not tree_id:
            continue

        original_id = tree_id
        counter = 2

        while tree_id in trees:
            tree_id = (
                f"{original_id}_{counter}"
            )
            counter += 1

        trees[tree_id] = {
            "id": tree_id,
            "name": _pretty_name(
                item["filename"]
            ),
            "emoji": "🌳",
            "cost": extra_costs[
                min(
                    extra_index,
                    len(extra_costs) - 1
                )
            ],
            "image": image,
            "description": (
                "A unique addition to your grove, "
                "grown through focused time and "
                "consistent effort."
            ),
        }

        used_files.add(image)
        extra_index += 1

    # If one of the original five tree images does not exist,
    # attach a real discovered asset rather than leaving a
    # broken image URL.
    available_images = [
        item["image"]
        for item in discovered
    ]

    fallback_index = 0

    for tree in trees.values():
        image = tree.get("image")

        if (
            image
            and
            os.path.isfile(
                os.path.join(
                    STATIC_DIR,
                    image.replace(
                        "/static/",
                        "",
                        1
                    ).replace(
                        "/",
                        os.sep
                    )
                )
            )
        ):
            continue

        if available_images:
            tree["image"] = available_images[
                fallback_index % len(available_images)
            ]

            fallback_index += 1

    return trees


TREES = _build_tree_catalog()


# ==========================================================
# MUSIC DEFINITIONS
# ==========================================================

BASE_MUSIC = {
    "midnight_study": {
        "id": "midnight_study",
        "name": "Midnight Study",
        "cost": 0,
        "file": "/static/audio/focus/midnight_study.mp3",
        "description": (
            "A quiet late-night atmosphere for peaceful study "
            "sessions and uninterrupted concentration."
        ),
    },
    "deep_focus": {
        "id": "deep_focus",
        "name": "Deep Focus",
        "cost": 0,
        "file": "/static/audio/focus/deep_focus.mp3",
        "description": (
            "A minimal soundscape designed for calm and "
            "concentrated work."
        ),
    },
    "rainy_library": {
        "id": "rainy_library",
        "name": "Rainy Library",
        "cost": 1000,
        "file": "/static/audio/focus/rainy_library.mp3",
        "description": (
            "A cosy rainy atmosphere inspired by quiet "
            "library evenings and slow focused study."
        ),
    },
    "cosmic_focus": {
        "id": "cosmic_focus",
        "name": "Cosmic Focus",
        "cost": 1400,
        "file": "/static/audio/focus/cosmic_focus.mp3",
        "description": (
            "A spacious ambient soundscape for deep thinking, "
            "creativity and long focus sessions."
        ),
    },
    "forest_after_dark": {
        "id": "forest_after_dark",
        "name": "Forest After Dark",
        "cost": 1700,
        "file": "/static/audio/focus/forest_after_dark.mp3",
        "description": (
            "A dark woodland atmosphere for quiet evening "
            "concentration."
        ),
    },
    "soft_study_room": {
        "id": "soft_study_room",
        "name": "Soft Study Room",
        "cost": 1900,
        "file": "/static/audio/focus/soft_study_room.mp3",
        "description": (
            "A warm indoor atmosphere for relaxed and "
            "comfortable study sessions."
        ),
    },
    "night_rain": {
        "id": "night_rain",
        "name": "Night Rain",
        "cost": 2150,
        "file": "/static/audio/focus/night_rain.mp3",
        "description": (
            "Gentle nighttime rain designed to create a calm "
            "and private focus environment."
        ),
    },
}


def _build_music_catalog():
    discovered = _discover_music_assets()

    music = {
        key: dict(value)
        for key, value in BASE_MUSIC.items()
    }

    known_files = {
        track["file"]
        for track in music.values()
    }

    extra_costs = [
        600,
        800,
        1000,
        1200,
        1400,
        1600,
        1800,
        2000,
        2200,
        2500,
    ]

    extra_index = 0

    for item in discovered:
        file_url = item["file"]

        if file_url in known_files:
            continue

        stem = os.path.splitext(
            item["filename"]
        )[0]

        music_id = _slug(stem)

        if not music_id:
            continue

        original_id = music_id
        counter = 2

        while music_id in music:
            music_id = (
                f"{original_id}_{counter}"
            )
            counter += 1

        music[music_id] = {
            "id": music_id,
            "name": _pretty_name(
                item["filename"]
            ),
            "cost": extra_costs[
                min(
                    extra_index,
                    len(extra_costs) - 1
                )
            ],
            "file": file_url,
            "description": (
                "A focus atmosphere for quiet study, "
                "deep concentration and uninterrupted work."
            ),
        }

        known_files.add(file_url)
        extra_index += 1

    # Repair any known track whose file does not exist.
    discovered_files = {
        item["file"]
        for item in discovered
    }

    fallback_tracks = [
        item["file"]
        for item in discovered
    ]

    fallback_index = 0

    for track in music.values():
        if track["file"] in discovered_files:
            continue

        if os.path.isfile(
            os.path.join(
                STATIC_DIR,
                track["file"]
                .replace(
                    "/static/",
                    "",
                    1
                )
                .replace(
                    "/",
                    os.sep
                )
            )
        ):
            continue

        if fallback_tracks:
            track["file"] = fallback_tracks[
                fallback_index % len(fallback_tracks)
            ]

            fallback_index += 1

    return music


MUSIC = _build_music_catalog()

# ==========================================================
# PROFILE
# ==========================================================

def get_focus_profile():
    profile = (
        FocusProfile.query
        .filter_by(user_id=current_user.id)
        .first()
    )

    if profile is None:
        profile = FocusProfile(
            user_id=current_user.id
        )

        db.session.add(profile)
        db.session.commit()

    return profile

# ==========================================================
# REWARDS
# ==========================================================

def get_rewards(duration_minutes):
    if duration_minutes >= 120:
        return 1, 20

    if duration_minutes >= 90:
        return 1, 15

    if duration_minutes >= 60:
        return 1, 10

    return 1, 5

# ==========================================================
# DAILY GOAL
# ==========================================================

def get_daily_goal():
    value = flask_session.get("focus_daily_goal")

    if value is None:
        return None

    try:
        value = int(value)
    except (TypeError, ValueError):
        return None

    if value not in (30, 60, 90, 120):
        return None

    return value

# ==========================================================
# DAILY GRAPH DATA
# ==========================================================

def build_daily_data(sessions):
    today = datetime.utcnow().date()

    totals = {}

    for focus_session in sessions:
        if focus_session.status != "completed":
            continue

        session_date = focus_session.started_at.date()

        minutes = (
            focus_session.completed_minutes
            or focus_session.duration_minutes
            or 0
        )

        totals[session_date] = (
            totals.get(session_date, 0)
            + minutes
        )

    result = []
    values = []

    for offset in range(6, -1, -1):
        current_day = today - timedelta(days=offset)

        minutes = totals.get(
            current_day,
            0
        )

        values.append(minutes)

        result.append({
            "date": current_day.strftime("%a"),
            "minutes": minutes,
            "height": 0,
        })

    maximum = max(values or [1])

    for item in result:
        if maximum > 0:
            item["height"] = max(
                4,
                round(
                    item["minutes"]
                    / maximum
                    * 100
                )
            )
        else:
            item["height"] = 0

    return result

# ==========================================================
# STREAK DATA
# ==========================================================

def build_streak_data(sessions):
    today = datetime.utcnow().date()

    completed_dates = set()
    today_minutes = 0

    for focus_session in sessions:
        if focus_session.status != "completed":
            continue

        session_date = focus_session.started_at.date()

        completed_dates.add(
            session_date
        )

        if session_date == today:
            today_minutes += (
                focus_session.completed_minutes
                or focus_session.duration_minutes
                or 0
            )

    streak = 0
    current_day = today

    while current_day in completed_dates:
        streak += 1
        current_day -= timedelta(days=1)

    return {
        "streak": streak,
        "today_minutes": today_minutes,
    }

# ==========================================================
# DAILY CHALLENGES
# ==========================================================

DAILY_CHALLENGES = [
    (
        "Complete a 30-minute focus session",
        30,
    ),
    (
        "Complete two focus sessions today",
        2,
    ),
    (
        "Focus for 60 minutes today",
        60,
    ),
    (
        "Complete a session without leaving the tab",
        1,
    ),
    (
        "Focus for 90 minutes today",
        90,
    ),
    (
        "Complete your first session today",
        1,
    ),
    (
        "Build at least 60 focused minutes",
        60,
    ),
    (
        "Finish a full uninterrupted session",
        1,
    ),
]

def build_daily_challenges(sessions):
    today = datetime.utcnow().date()

    day_index = (
        today.toordinal()
        % len(DAILY_CHALLENGES)
    )

    selected = []

    for index in range(4):
        selected.append(
            DAILY_CHALLENGES[
                (day_index + index)
                % len(DAILY_CHALLENGES)
            ]
        )

    today_sessions = [
        focus_session
        for focus_session in sessions
        if focus_session.started_at.date() == today
    ]

    completed_count = sum(
        1
        for item in today_sessions
        if item.status == "completed"
    )

    total_minutes = sum(
        (
            item.completed_minutes
            or item.duration_minutes
            or 0
        )
        for item in today_sessions
        if item.status == "completed"
    )

    challenges = []

    for text, target in selected:
        lowered = text.lower()

        if "60 minutes" in lowered:
            progress = min(
                total_minutes,
                60,
            )

        elif "90 minutes" in lowered:
            progress = min(
                total_minutes,
                90,
            )

        elif "30-minute" in lowered:
            progress = min(
                total_minutes,
                30,
            )

        elif "two focus" in lowered:
            progress = min(
                completed_count,
                2,
            )

        else:
            progress = min(
                completed_count,
                1,
            )

        challenges.append({
            "text": text,
            "target": target,
            "progress": progress,
            "complete": progress >= target,
        })

    return challenges


# ==========================================================
# WEEKLY + MONTHLY CHALLENGES
# ==========================================================

WEEKLY_CHALLENGES = [
    (
        "Focus for 5 hours this week",
        300,
    ),
    (
        "Complete 5 focus sessions this week",
        5,
    ),
    (
        "Complete one 2-hour focus session",
        120,
    ),
    (
        "Build a 3-day focus streak this week",
        3,
    ),
    (
        "Complete 8 focus sessions this week",
        8,
    ),
    (
        "Focus for 10 hours this week",
        600,
    ),
]


MONTHLY_CHALLENGES = [
    (
        "Focus for 20 hours this month",
        1200,
    ),
    (
        "Complete 20 focus sessions this month",
        20,
    ),
    (
        "Build a 7-day streak this month",
        7,
    ),
    (
        "Focus for 30 hours this month",
        1800,
    ),
    (
        "Complete 30 focus sessions this month",
        30,
    ),
]


def _challenge_progress(
    sessions,
    challenges,
    start_date,
    end_date,
):
    relevant = [
        item
        for item in sessions
        if (
            item.status == "completed"
            and start_date <= item.started_at.date() <= end_date
        )
    ]

    total_minutes = sum(
        item.completed_minutes
        or item.duration_minutes
        or 0
        for item in relevant
    )

    session_count = len(relevant)

    completed_dates = {
        item.started_at.date()
        for item in relevant
    }

    longest_session = max(
        (
            item.completed_minutes
            or item.duration_minutes
            or 0
            for item in relevant
        ),
        default=0,
    )

    streak = 0
    cursor = start_date

    while cursor <= end_date:
        if cursor in completed_dates:
            streak += 1
        else:
            streak = 0
        cursor += timedelta(days=1)

    result = []

    for text, target in challenges:
        lowered = text.lower()

        if "hours" in lowered:
            progress = total_minutes
        elif "sessions" in lowered:
            progress = session_count
        elif "2-hour" in lowered:
            progress = min(longest_session, target)
        elif "streak" in lowered:
            progress = min(streak, target)
        else:
            progress = min(session_count, target)

        result.append({
            "text": text,
            "target": target,
            "progress": min(progress, target),
            "complete": progress >= target,
        })

    return result


def build_period_challenges(sessions):
    today = datetime.utcnow().date()

    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)

    if today.month == 12:
        next_month = today.replace(
            year=today.year + 1,
            month=1,
            day=1,
        )
    else:
        next_month = today.replace(
            month=today.month + 1,
            day=1,
        )

    month_end = next_month - timedelta(days=1)

    weekly = _challenge_progress(
        sessions,
        WEEKLY_CHALLENGES,
        week_start,
        today,
    )

    monthly = _challenge_progress(
        sessions,
        MONTHLY_CHALLENGES,
        month_start,
        month_end,
    )

    week_index = today.isocalendar().week % len(WEEKLY_CHALLENGES)
    month_index = today.month % len(MONTHLY_CHALLENGES)

    weekly = [
        weekly[(week_index + i) % len(weekly)]
        for i in range(3)
    ]

    monthly = [
        monthly[(month_index + i) % len(monthly)]
        for i in range(3)
    ]

    return weekly, monthly


# ==========================================================
# CHALLENGE REWARDS
# ==========================================================

DAILY_CHALLENGE_REWARD = 15
WEEKLY_CHALLENGE_REWARD = 5
MONTHLY_CHALLENGE_REWARD = 20


def _challenge_claim_exists(
    user_id,
    period_type,
    period_key,
    challenge_key,
):
    return (
        FocusChallengeReward.query
        .filter_by(
            user_id=user_id,
            period_type=period_type,
            period_key=period_key,
            challenge_key=challenge_key,
        )
        .first()
        is not None
    )


def _claim_challenge_reward(
    profile,
    period_type,
    period_key,
    challenge_key,
    antennas,
):
    existing = (
        FocusChallengeReward.query
        .filter_by(
            user_id=profile.user_id,
            period_type=period_type,
            period_key=period_key,
            challenge_key=challenge_key,
        )
        .first()
    )

    if existing is not None:
        return False

    profile.antennas += antennas

    reward = FocusChallengeReward(
        user_id=profile.user_id,
        period_type=period_type,
        period_key=period_key,
        challenge_key=challenge_key,
        antennas_awarded=antennas,
    )

    db.session.add(reward)
    return True


def award_challenge_rewards(
    profile,
    daily_challenges,
    weekly_challenges,
    monthly_challenges,
):
    """
    Award challenge antennas persistently and only once.

    Daily:
        +15 antennas when all four displayed daily
        challenges are completed.

    Weekly:
        +5 antennas for each displayed completed weekly
        challenge.

    Monthly:
        +20 antennas for each displayed completed monthly
        challenge.
    """

    claimed_session_data = flask_session.get(
        "focus_challenge_rewards",
        {},
    )

    if not isinstance(claimed_session_data, dict):
        claimed_session_data = {}

    today = datetime.utcnow().date()
    changed = False

    # ------------------------------------------------------
    # Preserve claims created by the older session-based
    # implementation so switching to database-backed claims
    # does not immediately award the same reward twice.
    # ------------------------------------------------------

    for reward_key in claimed_session_data:
        if not claimed_session_data.get(reward_key):
            continue

        parts = reward_key.split(":", 3)

        if len(parts) != 4:
            continue

        period_type, period_key, index, challenge_text = parts

        if _challenge_claim_exists(
            profile.user_id,
            period_type,
            period_key,
            challenge_text,
        ):
            continue

        db.session.add(
            FocusChallengeReward(
                user_id=profile.user_id,
                period_type=period_type,
                period_key=period_key,
                challenge_key=challenge_text,
                antennas_awarded=0,
            )
        )
        changed = True

    # ------------------------------------------------------
    # DAILY
    # ------------------------------------------------------

    if (
        len(daily_challenges) >= 4
        and all(
            item.get("complete", False)
            for item in daily_challenges[:4]
        )
    ):
        daily_key = today.isoformat()
        challenge_key = "all-four-daily-challenges"

        if _claim_challenge_reward(
            profile,
            "daily",
            daily_key,
            challenge_key,
            15,
        ):
            changed = True

        claimed_session_data[
            f"daily:{daily_key}:0:{challenge_key}"
        ] = True

    # ------------------------------------------------------
    # WEEKLY
    # ------------------------------------------------------

    iso = today.isocalendar()
    week_key = f"{iso.year}-W{iso.week:02d}"

    for challenge in weekly_challenges:
        if not challenge.get("complete", False):
            continue

        challenge_key = challenge.get("text", "").strip()

        if not challenge_key:
            continue

        if _claim_challenge_reward(
            profile,
            "weekly",
            week_key,
            challenge_key,
            5,
        ):
            changed = True

        claimed_session_data[
            f"weekly:{week_key}:0:{challenge_key}"
        ] = True

    # ------------------------------------------------------
    # MONTHLY
    # ------------------------------------------------------

    month_key = f"{today.year}-{today.month:02d}"

    for challenge in monthly_challenges:
        if not challenge.get("complete", False):
            continue

        challenge_key = challenge.get("text", "").strip()

        if not challenge_key:
            continue

        if _claim_challenge_reward(
            profile,
            "monthly",
            month_key,
            challenge_key,
            20,
        ):
            changed = True

        claimed_session_data[
            f"monthly:{month_key}:0:{challenge_key}"
        ] = True

    if changed:
        db.session.commit()

    flask_session[
        "focus_challenge_rewards"
    ] = claimed_session_data

    return changed

# ==========================================================
# TREE DESCRIPTION HELPER
# ==========================================================

TREE_DESCRIPTIONS = [
    "A graceful tree representing calm, steady progress built one focused session at a time.",
    "A resilient tree symbolising persistence and the habit of showing up every day.",
    "A peaceful tree representing patience and meaningful progress.",
    "A vibrant tree celebrating the energy created by uninterrupted concentration.",
    "A thoughtful tree for slow and meaningful progress during long study journeys.",
    "A sturdy grove companion representing discipline, consistency and another session completed.",
    "A delicate tree symbolising balance between deep concentration and time to breathe.",
    "A bright tree representing productive moments when everything finally clicks.",
    "A quiet woodland tree for focused minds that prefer progress without unnecessary noise.",
    "A mysterious tree representing those rare sessions when you become completely absorbed in your work.",
    "A calm forest resident symbolising patience, persistence and the confidence to keep going.",
    "A bold tree for determined sessions when finishing matters more than postponing.",
    "A dreamy tree representing creativity and focused hours spent building your future.",
    "A peaceful tree that grows alongside your habits and reminds you that consistency compounds.",
    "A distinctive grove tree representing focus that survives distractions.",
]

def build_tree_description(name):
    if not name:
        name = "This tree"

    index = (
        sum(
            ord(char)
            for char in name.lower()
        )
        % len(TREE_DESCRIPTIONS)
    )

    return (
        f"{name} — "
        f"{TREE_DESCRIPTIONS[index]}"
    )

# ==========================================================
# FOREST COMPARTMENTS
# ==========================================================

def get_tree_position(index, period):
    """Return the fixed planting compartment for a tree."""
    slots = FOREST_SLOTS.get(period, FOREST_SLOTS["week"])

    if not slots:
        return 50, 50

    slot_index = index % len(slots)
    return slots[slot_index]


# ==========================================================
# FOREST PAGES
# ==========================================================

def build_forest_pages(
    sessions,
    period
):
    """Build forest pages using fixed planting compartments."""
    today = datetime.utcnow().date()

    if period == "week":
        start_date = today - timedelta(days=6)
    elif period == "month":
        start_date = today - timedelta(days=29)
    else:
        start_date = today - timedelta(days=364)

    slots = FOREST_SLOTS.get(
        period,
        FOREST_SLOTS["week"],
    )

    capacity = FOREST_CAPACITIES.get(
        period,
        len(slots),
    )

    relevant_sessions = []

    for focus_session in sessions:
        session_date = focus_session.started_at.date()

        if not (
            start_date
            <= session_date
            <= today
        ):
            continue

        if (
            focus_session.status == "completed"
            or focus_session.destroyed_tree
        ):
            relevant_sessions.append(focus_session)

    forest_trees = []

    for focus_session in relevant_sessions:
        tree = TREES.get(
            focus_session.tree_type,
            TREES["starter"],
        )

        count = max(
            1,
            focus_session.trees_earned or 1,
        )

        for _ in range(count):
            forest_trees.append({
                "name": tree["name"],
                "image": tree["image"],
                "tree_id": tree["id"],
                "destroyed": bool(
                    focus_session.destroyed_tree
                ),
            })

    if not forest_trees:
        return [{
            "page": 1,
            "trees": [],
        }]

    pages = []

    for start in range(
        0,
        len(forest_trees),
        capacity,
    ):
        chunk = forest_trees[
            start:start + capacity
        ]

        page_number = len(pages) + 1
        trees = []

        for index, tree in enumerate(chunk):
            x, y = get_tree_position(
                index,
                period,
            )

            trees.append({
                **tree,
                "x": x,
                "y": y,
                "compartment": index + 1,
            })

        pages.append({
            "page": page_number,
            "trees": trees,
        })

    return pages


# ==========================================================
# VISIBLE ITEMS
# ==========================================================

def get_visible_trees(profile):
    visible = []

    for tree in TREES.values():
        if len(visible) >= 6:
            break

        visible.append(tree)

    return visible

def get_visible_music(profile):
    visible = []

    for music_id, track in MUSIC.items():
        if len(visible) >= 4:
            break

        visible.append(
            (
                music_id,
                track,
            )
        )

    return visible

# ==========================================================
# MAIN PAGE
# ==========================================================

@focus.route(
    "/lock-in-grove",
    methods=["GET", "POST"]
)
@login_required
def lockin_grove():
    profile = get_focus_profile()

    active_session = (
        FocusSession.query
        .filter_by(
            user_id=current_user.id,
            status="active"
        )
        .order_by(
            FocusSession.started_at.desc()
        )
        .first()
    )

    form = FocusStartForm()

    unlocked_trees = (
        profile.get_unlocked_trees()
    )

    unlocked_music = (
        profile.get_unlocked_music()
    )

    form.tree_type.choices = [
        (
            tree_id,
            f"{tree_data['emoji']} {tree_data['name']}",
        )
        for tree_id, tree_data in TREES.items()
        if tree_id in unlocked_trees
    ]

    if (
        request.method == "POST"
        and form.validate_on_submit()
    ):
        if active_session:
            return redirect(
                url_for(
                    "focus.focus_session",
                    session_id=active_session.id
                )
            )

        duration = form.duration_minutes.data

        if duration not in (
            30,
            60,
            90,
            120,
        ):
            return redirect(
                url_for(
                    "focus.lockin_grove"
                )
            )

        selected_tree = form.tree_type.data

        if not profile.has_tree(
            selected_tree
        ):
            return redirect(
                url_for(
                    "focus.lockin_grove"
                )
            )

        selected_music = request.form.get(
            "music_id",
            ""
        ).strip()

        if (
            selected_music
            and
            not profile.has_music(
                selected_music
            )
        ):
            selected_music = ""

        flask_session[
            "active_focus_music"
        ] = selected_music

        focus_session = FocusSession(
            user_id=current_user.id,
            tree_type=selected_tree,
            duration_minutes=duration,
            status="active",
            started_at=datetime.utcnow(),
        )

        db.session.add(
            focus_session
        )

        db.session.commit()

        return redirect(
            url_for(
                "focus.focus_session",
                session_id=focus_session.id
            )
        )

    sessions = (
        FocusSession.query
        .filter_by(
            user_id=current_user.id
        )
        .order_by(
            FocusSession.started_at.desc()
        )
        .all()
    )

    successful_sessions = [
        item
        for item in sessions
        if item.status == "completed"
    ]

    destroyed_sessions = [
        item
        for item in sessions
        if item.destroyed_tree
    ]

    daily_goal = get_daily_goal()

    daily_data = build_daily_data(
        sessions
    )

    streak_data = build_streak_data(
        sessions
    )

    daily_challenges = (
        build_daily_challenges(
            sessions
        )
    )

    weekly_challenges, monthly_challenges = (
        build_period_challenges(
            sessions
        )
    )

    award_challenge_rewards(
        profile,
        daily_challenges,
        weekly_challenges,
        monthly_challenges,
    )

    week_forest_pages = (
        build_forest_pages(
            sessions,
            "week"
        )
    )

    month_forest_pages = (
        build_forest_pages(
            sessions,
            "month"
        )
    )

    year_forest_pages = (
        build_forest_pages(
            sessions,
            "year"
        )
    )

    visible_trees = get_visible_trees(
        profile
    )

    visible_music = get_visible_music(
        profile
    )

    return render_template(
        "lockin_grove.html",
        form=form,
        profile=profile,
        trees=TREES,
        music=MUSIC,
        sessions=sessions,
        successful_sessions=successful_sessions,
        destroyed_sessions=destroyed_sessions,
        active_session=active_session,
        focus_mode=False,
        visible_trees=visible_trees,
        visible_music=visible_music,
        unlocked_music=unlocked_music,
        week_forest_pages=week_forest_pages,
        month_forest_pages=month_forest_pages,
        year_forest_pages=year_forest_pages,
        daily_data=daily_data,
        streak_data=streak_data,
        daily_challenges=daily_challenges,
        weekly_challenges=weekly_challenges,
        monthly_challenges=monthly_challenges,
        daily_goal=daily_goal,
        selected_music=None,
    )

# ==========================================================
# ACTIVE FOCUS PAGE
# ==========================================================

@focus.route(
    "/lock-in-grove/session/<int:session_id>"
)
@login_required
def focus_session(session_id):
    focus_session = (
        FocusSession.query
        .get_or_404(session_id)
    )

    if (
        focus_session.user_id
        != current_user.id
    ):
        return redirect(
            url_for(
                "focus.lockin_grove"
            )
        )

    if focus_session.status != "active":
        return redirect(
            url_for(
                "focus.lockin_grove"
            )
        )

    selected_tree = TREES.get(
        focus_session.tree_type,
        TREES["starter"]
    )

    profile = get_focus_profile()

    selected_music = None

    active_music_id = flask_session.get(
        "active_focus_music"
    )

    if active_music_id:
        selected_music = MUSIC.get(
            active_music_id
        )

    # started_at is stored as a naive UTC datetime.
    # Convert it to an explicit UTC epoch so the browser
    # timer is not shifted by the computer's local timezone.
    focus_started_ms = int(
        (
            focus_session.started_at
            -
            datetime(1970, 1, 1)
        ).total_seconds()
        * 1000
    )

    return render_template(
        "lockin_grove.html",
        form=None,
        profile=profile,
        trees=TREES,
        music=MUSIC,
        sessions=[],
        successful_sessions=[],
        destroyed_sessions=[],
        active_session=focus_session,
        focus_mode=True,
        focus_session=focus_session,
        selected_tree=selected_tree,
        selected_music=selected_music,
        focus_started_ms=focus_started_ms,
    )

# ==========================================================
# COMPLETE SESSION
# ==========================================================

@focus.route(
    "/lock-in-grove/session/<int:session_id>/complete",
    methods=["POST"]
)
@login_required
def complete_session(session_id):
    focus_session = (
        FocusSession.query
        .get_or_404(session_id)
    )

    if (
        focus_session.user_id
        != current_user.id
    ):
        return jsonify({
            "success": False,
            "message": "Unauthorized.",
        }), 403

    if focus_session.status != "active":
        return jsonify({
            "success": False,
            "message": "Session is no longer active.",
        }), 400

    elapsed_seconds = (
        datetime.utcnow()
        -
        focus_session.started_at
    ).total_seconds()

    required_seconds = (
        focus_session.duration_minutes
        * 60
    )

    if elapsed_seconds < required_seconds:
        return jsonify({
            "success": False,
            "message": (
                "The focus duration has not "
                "been completed yet."
            ),
        }), 400

    trees_earned, antennas_earned = (
        get_rewards(
            focus_session.duration_minutes
        )
    )

    focus_session.status = "completed"
    focus_session.completed_at = datetime.utcnow()
    focus_session.completed_minutes = (
        focus_session.duration_minutes
    )
    focus_session.trees_earned = trees_earned
    focus_session.antennas_earned = antennas_earned

    profile = get_focus_profile()

    profile.antennas += antennas_earned
    profile.total_trees += trees_earned
    profile.total_focus_minutes += (
        focus_session.duration_minutes
    )

    if (
        focus_session.duration_minutes
        >
        profile.longest_session_minutes
    ):
        profile.longest_session_minutes = (
            focus_session.duration_minutes
        )

    db.session.commit()

    flask_session.pop(
        "active_focus_music",
        None
    )

    tree = TREES.get(
        focus_session.tree_type,
        TREES["starter"]
    )

    return jsonify({
        "success": True,
        "trees_earned": trees_earned,
        "antennas_earned": antennas_earned,
        "tree_name": tree["name"],
    })

# ==========================================================
# SAFE CANCEL
# ==========================================================

@focus.route(
    "/lock-in-grove/session/<int:session_id>/cancel",
    methods=["POST"]
)
@login_required
def cancel_session(session_id):
    focus_session = (
        FocusSession.query
        .get_or_404(session_id)
    )

    if (
        focus_session.user_id
        != current_user.id
    ):
        return jsonify({
            "success": False,
            "message": "Unauthorized.",
        }), 403

    if focus_session.status != "active":
        return jsonify({
            "success": False,
            "message": "Session is no longer active.",
        }), 400

    elapsed_seconds = (
        datetime.utcnow()
        -
        focus_session.started_at
    ).total_seconds()

    if elapsed_seconds >= 60:
        return jsonify({
            "success": False,
            "grace_expired": True,
            "message": (
                "Your one-minute grace period "
                "has ended."
            ),
        }), 400

    focus_session.status = "cancelled"
    focus_session.completed_at = datetime.utcnow()
    focus_session.completed_minutes = 0
    focus_session.trees_earned = 0
    focus_session.antennas_earned = 0
    focus_session.destroyed_tree = False

    if hasattr(
        focus_session,
        "failure_reason"
    ):
        focus_session.failure_reason = (
            "Cancelled within the one-minute "
            "grace period."
        )

    db.session.commit()

    flask_session.pop(
        "active_focus_music",
        None
    )

    return jsonify({
        "success": True,
        "destroyed_tree": False,
    })

# ==========================================================
# FAIL SESSION
# ==========================================================

@focus.route(
    "/lock-in-grove/session/<int:session_id>/fail",
    methods=["POST"]
)
@login_required
def fail_session(session_id):
    focus_session = (
        FocusSession.query
        .get_or_404(session_id)
    )

    if (
        focus_session.user_id
        != current_user.id
    ):
        return jsonify({
            "success": False,
            "message": "Unauthorized.",
        }), 403

    if focus_session.status != "active":
        return jsonify({
            "success": False,
            "message": "Session is no longer active.",
        }), 400

    payload = request.get_json(
        silent=True
    ) or {}

    completed_minutes = payload.get(
        "completed_minutes",
        0
    )

    try:
        completed_minutes = int(
            completed_minutes
        )
    except (
        TypeError,
        ValueError
    ):
        completed_minutes = 0

    focus_session.status = "failed"
    focus_session.completed_at = datetime.utcnow()
    focus_session.completed_minutes = max(
        0,
        completed_minutes
    )
    focus_session.trees_earned = 0
    focus_session.antennas_earned = 0
    focus_session.destroyed_tree = True

    if hasattr(
        focus_session,
        "failure_reason"
    ):
        focus_session.failure_reason = payload.get(
            "reason",
            "Focus session abandoned."
        )

    profile = get_focus_profile()

    profile.destroyed_trees += 1

    db.session.commit()

    flask_session.pop(
        "active_focus_music",
        None
    )

    return jsonify({
        "success": True,
        "destroyed_tree": True,
    })

# ==========================================================
# DAILY GOAL
# ==========================================================

@focus.route(
    "/lock-in-grove/daily-goal",
    methods=["POST"]
)
@login_required
def set_daily_goal():
    value = request.form.get(
        "daily_goal",
        ""
    )

    try:
        value = int(value)
    except (
        TypeError,
        ValueError
    ):
        return jsonify({
            "success": False,
        }), 400

    if value not in (
        30,
        60,
        90,
        120,
    ):
        return jsonify({
            "success": False,
        }), 400

    flask_session[
        "focus_daily_goal"
    ] = value

    return jsonify({
        "success": True,
        "daily_goal": value,
    })

# ==========================================================
# UNLOCK TREE
# ==========================================================

@focus.route(
    "/lock-in-grove/unlock-tree/<tree_id>",
    methods=["POST"]
)
@login_required
def unlock_tree(tree_id):
    if tree_id not in TREES:
        return jsonify({
            "success": False,
        }), 404

    profile = get_focus_profile()

    tree = TREES[tree_id]

    if profile.has_tree(tree_id):
        return jsonify({
            "success": False,
        }), 400

    cost = tree["cost"]

    if profile.antennas < cost:
        return jsonify({
            "success": False,
            "message": "Not enough antennas.",
        }), 400

    profile.antennas -= cost
    profile.unlock_tree(tree_id)

    db.session.commit()

    return jsonify({
        "success": True,
        "tree_id": tree_id,
        "antennas": profile.antennas,
    })

# ==========================================================
# UNLOCK MUSIC
# ==========================================================

@focus.route(
    "/lock-in-grove/unlock-music/<music_id>",
    methods=["POST"]
)
@login_required
def unlock_music(music_id):
    if music_id not in MUSIC:
        return jsonify({
            "success": False,
        }), 404

    profile = get_focus_profile()

    track = MUSIC[music_id]

    if profile.has_music(music_id):
        return jsonify({
            "success": False,
        }), 400

    cost = track["cost"]

    if profile.antennas < cost:
        return jsonify({
            "success": False,
            "message": "Not enough antennas.",
        }), 400

    profile.antennas -= cost
    profile.unlock_music(music_id)

    db.session.commit()

    return jsonify({
        "success": True,
        "music_id": music_id,
        "antennas": profile.antennas,
    })