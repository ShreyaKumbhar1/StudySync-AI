def get_dimpu_state(total_tasks, completed_tasks):

    if total_tasks == 0:
        mood = "sleeping"

    else:

        progress = (completed_tasks / total_tasks) * 100

        if progress == 100:
            mood = "celebration"

        elif progress >= 80:
            mood = "proud"

        elif progress >= 50:
            mood = "happy"

        elif progress >= 20:
            mood = "idle"

        else:
            mood = "thinking"

    image = f"images/dimpu/expressions/{mood}/dimpu_{mood}.png"

    return mood, image