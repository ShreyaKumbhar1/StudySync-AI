def update_user_title(user):

    old_title = user.title

    completed = user.completed_tasks

    if completed >= 100:
        user.title = "Semester Slayer"

    elif completed >= 75:
        user.title = "Library Guardian"

    elif completed >= 50:
        user.title = "Knowledge Sorcerer"

    elif completed >= 35:
        user.title = "Dimpu's Apprentice"

    elif completed >= 20:
        user.title = "Deadline Duelist"

    elif completed >= 10:
        user.title = "Caffeine Alchemist"

    elif completed >= 5:
        user.title = "Notebook Ninja"

    else:
        user.title = "Egg Hatchling"

    return old_title != user.title