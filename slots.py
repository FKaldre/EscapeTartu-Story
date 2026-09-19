#!/usr/bin/env python3
"""
Fetch free booking slots from an EscapeTartu booking page.

The 'simplebooking' plugin embeds ALL slot data in the page HTML as a JS
variable (ESBJsVars), so no login, cookies or hidden API call is needed.

Usage:
    python slots.py URL                    # today (Europe/Tallinn)
    python slots.py URL 2026-09-20         # a specific date
    python slots.py URL 2026-09-20 --days 3
    python slots.py URL --all              # include booked/passed slots too
    python slots.py URL --text             # short human-readable summary

By default only FREE slots are listed. Prices are tidied ("Alates 60" -> "from 60").

Example URLs:
    https://escapetartu.ee/pogenemistubade-broneerimine/     (escape rooms)
    <lasertag booking page URL>                              (lasertag)

Output (stdout): JSON like
    {"type": "escaperoom", "days": [{"date": "2026-09-20", "rooms": {
        "Room name": [{"start": "18:00", "end": "19:00", "price": "80", "free": true}, ...]}}]}
"""
import json
import re
import sys
import urllib.request
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

TZ = ZoneInfo("Europe/Tallinn")
CUTOFF_MINUTES = 105  # the site hides slots starting within 105 min of now


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (slot-snapshot)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="replace")


def extract_vars(html):
    m = re.search(r"ESBJsVars\s*=\s*", html)
    if not m:
        sys.exit("ESBJsVars not found - page layout may have changed.")
    start = html.index("{", m.end())
    obj, _ = json.JSONDecoder().raw_decode(html[start:])
    return obj


def weekday_for_date(html, date):
    """Read the plugin's own weekday index for this date from the calendar cells."""
    want = date.strftime("%Y%m%d")
    for tag in re.findall(r"<td\b[^>]*>", html):
        d = re.search(r'data-date="(\d+)"', tag)
        w = re.search(r'data-weekday="(\d+)"', tag)
        if d and w and d.group(1) == want:
            return int(w.group(1))
    return None


def get_day(container, key):
    """available_times[location] may be a JSON list or object depending on keys."""
    if isinstance(container, dict):
        return container.get(str(key)) or container.get(key) or []
    if isinstance(container, list) and 0 <= key < len(container):
        return container[key] or []
    return []


def slots_for(html, v, date, now):
    wd = weekday_for_date(html, date)
    if wd is None:
        return None  # date not shown in the calendar (too far ahead?)
    date_str = date.strftime("%Y-%m-%d")
    booked = v.get("booked_times") or {}
    rooms = {}
    for location, per_day in (v.get("available_times") or {}).items():
        out = []
        for s in get_day(per_day, wd):
            start = s["start"]
            b_loc = booked.get(location, {}) if isinstance(booked, dict) else {}
            b_day = b_loc.get(date_str, {}) if isinstance(b_loc, dict) else {}
            is_booked = isinstance(b_day, dict) and (start + ":00") in b_day
            h, m = map(int, start.split(":"))
            slot_dt = datetime(date.year, date.month, date.day, h, m, tzinfo=TZ)
            passed = slot_dt < now + timedelta(minutes=CUTOFF_MINUTES)
            out.append({
                "start": start,
                "end": s["end"],
                "price": s.get("price"),
                "free": not is_booked and not passed,
            })
        if out:
            rooms[location] = out
    return rooms


def tidy_price(p):
    if p is None:
        return None
    p = str(p).strip()
    if p.lower().startswith("alates"):
        p = "from " + p[6:].strip()
    return p


def tidy(rooms, include_all):
    if rooms is None:
        return None
    out = {}
    for name, slots in rooms.items():
        kept = [
            {"start": x["start"], "end": x["end"], "price": tidy_price(x["price"]),
             **({"free": x["free"]} if include_all else {})}
            for x in slots if include_all or x["free"]
        ]
        if kept or include_all:
            out[name] = kept
    return out


def as_text(result):
    lines = []
    for day in result["days"]:
        lines.append(f'{day["date"]} ({result["type"]})')
        if day["rooms"] is None:
            lines.append("  date not available on the calendar")
        elif not day["rooms"]:
            lines.append("  fully booked")
        else:
            for room, slots in day["rooms"].items():
                times = ", ".join(x["start"] for x in slots)
                lines.append(f"  {room}: {times}")
    return "\n".join(lines)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit(__doc__)
    url = args[0]
    include_all = "--all" in sys.argv
    now = datetime.now(TZ)
    first = datetime.strptime(args[1], "%Y-%m-%d").date() if len(args) > 1 else now.date()
    days = 1
    if "--days" in sys.argv:
        days = int(sys.argv[sys.argv.index("--days") + 1])

    html = fetch(url)
    v = extract_vars(html)
    result = {"type": v.get("type"), "days": []}
    for i in range(days):
        d = first + timedelta(days=i)
        rooms = tidy(slots_for(html, v, d, now), include_all)
        result["days"].append({"date": d.isoformat(), "rooms": rooms})

    if "--text" in sys.argv:
        print(as_text(result))
    else:
        print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
