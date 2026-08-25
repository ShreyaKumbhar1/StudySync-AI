import json


def default_page_data(content=""):
    return {
        "version": 2,
        "content": content or "",
        "logic": "",
        "code": "",
        "language": "Python",
        "time_complexity": "",
        "space_complexity": "",
        "images": [],
        "flowchart": "",
        "chart": None,
        "table": [],
        "formula": "",
        "math_steps": [],
        "final_answer": "",
        "calculator_history": [],
        "fields": {},
        "visual": {"nodes": [], "edges": []},
    }


def parse_page_data(content):
    if not content:
        return default_page_data()
    try:
        data = json.loads(content)
        if isinstance(data, dict) and data.get("version"):
            base = default_page_data()
            base.update(data)
            return base
    except (TypeError, ValueError):
        pass
    data = default_page_data(content)
    return data


def dump_page_data(data):
    return json.dumps(data, ensure_ascii=False, separators=(",", ":"))
