"""Fixed planting compartments for the Lock-in Grove forests.

Coordinates are percentages relative to the displayed forest-land image.
They are intentionally kept inside the grassy planting area rather than
using a generic rectangular grid.
"""


def _grid(rows):
    """Expand row definitions into ordered (x, y) planting slots."""
    slots = []

    for y, xs in rows:
        for x in xs:
            slots.append((x, y))

    return slots


# ----------------------------------------------------------
# WEEK: 20 compartments
# Carefully staggered so the trees stay on the grassy centre.
# ----------------------------------------------------------
WEEK_SLOTS = [
    (35, 28), (47, 28), (59, 28), (71, 28), (82, 28),
    (31, 39), (43, 39), (55, 39), (67, 39), (79, 39),
    (35, 50), (47, 50), (59, 50), (71, 50), (82, 50),
    (40, 61), (50, 61), (60, 61), (70, 61), (79, 61),
]


# ----------------------------------------------------------
# MONTH: 70 compartments
# 10 rows × 7 slots, staggered toward the centre.
# ----------------------------------------------------------
MONTH_SLOTS = _grid([
    (25, [37, 46, 55, 64, 73, 82, 88]),
    (31, [33, 42, 51, 60, 69, 78, 86]),
    (37, [31, 40, 49, 58, 67, 76, 84]),
    (43, [29, 38, 47, 56, 65, 74, 82]),
    (49, [30, 39, 48, 57, 66, 75, 83]),
    (55, [32, 41, 50, 59, 68, 77, 85]),
    (61, [35, 44, 53, 62, 71, 80, 86]),
    (67, [39, 48, 57, 66, 75, 83, 88]),
    (73, [43, 52, 61, 70, 79, 86, 90]),
    (79, [47, 56, 65, 74, 82, 88, 92]),
])


# ----------------------------------------------------------
# YEAR: 150 compartments
# 15 rows × 10 slots, with a tighter footprint so the slots
# remain inside the grassy portion of the larger island.
# ----------------------------------------------------------
YEAR_SLOTS = _grid([
    (24, [34, 40, 46, 52, 58, 64, 70, 76, 82, 87]),
    (29, [31, 37, 43, 49, 55, 61, 67, 73, 79, 85]),
    (34, [29, 35, 41, 47, 53, 59, 65, 71, 77, 83]),
    (39, [28, 34, 40, 46, 52, 58, 64, 70, 76, 82]),
    (44, [27, 33, 39, 45, 51, 57, 63, 69, 75, 81]),
    (49, [28, 34, 40, 46, 52, 58, 64, 70, 76, 82]),
    (54, [29, 35, 41, 47, 53, 59, 65, 71, 77, 83]),
    (59, [31, 37, 43, 49, 55, 61, 67, 73, 79, 85]),
    (64, [33, 39, 45, 51, 57, 63, 69, 75, 81, 87]),
    (69, [35, 41, 47, 53, 59, 65, 71, 77, 83, 89]),
    (74, [38, 44, 50, 56, 62, 68, 74, 80, 86, 91]),
    (79, [41, 47, 53, 59, 65, 71, 77, 83, 88, 93]),
    (84, [44, 50, 56, 62, 68, 74, 80, 86, 91, 94]),
    (88, [47, 53, 59, 65, 71, 77, 83, 89, 93, 95]),
    (92, [50, 56, 62, 68, 74, 80, 86, 91, 94, 96]),
])


FOREST_SLOTS = {
    "week": WEEK_SLOTS,
    "month": MONTH_SLOTS,
    "year": YEAR_SLOTS,
}


FOREST_CAPACITIES = {
    "week": len(WEEK_SLOTS),
    "month": len(MONTH_SLOTS),
    "year": len(YEAR_SLOTS),
}