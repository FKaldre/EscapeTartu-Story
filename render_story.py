#!/usr/bin/env python3
"""
Render the EscapeTartu story to a proper 1080x1920 PNG.

Uses a real (headless) Chromium browser to screenshot the #story element,
instead of html2canvas, so the PNG looks exactly like the preview.

Put this file AND slots.py next to index.html (the storyteller folder).

One-time setup:
    pip install playwright tzdata
    playwright install chromium

Usage:
    python render_story.py                      # render the app as-is (test the export)
    python render_story.py --live               # fill with tomorrow's real lasertag data
    python render_story.py --live --date 2026-09-25
    python render_story.py --live --print-state # just show what would be filled in
    python render_story.py --live --out story.png

Exit codes: 0 = ok, 2 = no lasertag slots on that day (skip posting).
"""
import argparse
import functools
import http.server
import json
import struct
import sys
import threading
from datetime import datetime, timedelta
from pathlib import Path

import slots  # slots.py, same folder

LASER_URL = "https://escapetartu.ee/laser/laserlahingute-broneerimine/"

DAYS_ET = ["Esmaspäev", "Teisipäev", "Kolmapäev", "Neljapäev", "Reede", "Laupäev", "Pühapäev"]
MONTHS_ET = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni",
             "juuli", "august", "september", "oktoober", "november", "detsember"]

# Fullness thresholds for the Saturday/Sunday/next-week indicators.
# share of slots that are still FREE:  >= 60% -> "Palju vabu aegu" (LOW)
#                                      >= 30% -> "Pooled vabad"    (MEDIUM)
#                                      below  -> "Täitumas!!!"     (HIGH)
LOW_MIN_FREE = 0.60
MEDIUM_MIN_FREE = 0.30

TARGET_SIZE = (1080, 1920)
STORY_CSS_WIDTH = 405  # #story is 405x720 CSS px on the desktop layout

FAR_PAST = datetime(2000, 1, 1, tzinfo=slots.TZ)  # disables the site's "105 min" cutoff


# ---------------------------------------------------------------- data ---

def merged(rooms):
    """[(start_time, is_free)] sorted; if several rooms, free if any room is free."""
    times = {}
    for room_slots in (rooms or {}).values():
        for s in room_slots:
            times[s["start"]] = times.get(s["start"], False) or s["free"]
    return sorted(times.items())


def free_ratio(html, v, dates):
    free = total = 0
    for d in dates:
        for _, is_free in merged(slots.slots_for(html, v, d, FAR_PAST)):
            total += 1
            free += 1 if is_free else 0
    return free / total if total else None


def level(ratio):
    if ratio is None:
        return None
    if ratio >= LOW_MIN_FREE:
        return "LOW"
    if ratio >= MEDIUM_MIN_FREE:
        return "MEDIUM"
    return "HIGH"


def build_payload(html, target):
    v = slots.extract_vars(html)
    now = datetime.now(slots.TZ)
    day_slots = merged(slots.slots_for(html, v, target, now))
    if not day_slots:
        return None

    mode = "weekend" if target.weekday() >= 5 else "weekday"
    payload = {
        "mode": mode,
        "story": {"day": DAYS_ET[target.weekday()],
                  "date": f"{target.day}. {MONTHS_ET[target.month - 1]}"},
        "slots": [{"id": i + 1, "time": t, "status": "FREE" if free else "FULL"}
                  for i, (t, free) in enumerate(day_slots)],
    }

    if mode == "weekday":
        sat = target + timedelta(days=(5 - target.weekday()) % 7)
        sun = sat + timedelta(days=1)
        lv_sat = level(free_ratio(html, v, [sat]))
        lv_sun = level(free_ratio(html, v, [sun]))
        weekend = {}
        if lv_sat:
            weekend["saturday"] = lv_sat
        if lv_sun:
            weekend["sunday"] = lv_sun
        if len(weekend) < 2:
            print("warning: Saturday/Sunday not fully available on the calendar yet; "
                  "keeping app defaults for the missing one", file=sys.stderr)
        payload["weekend"] = weekend
    else:
        monday = target + timedelta(days=7 - target.weekday())
        lv = level(free_ratio(html, v, [monday + timedelta(days=i) for i in range(7)]))
        if lv:
            payload["nextWeek"] = {"level": lv}
        else:
            print("warning: next week not on the calendar yet; keeping app default",
                  file=sys.stderr)
    return payload


# ------------------------------------------------------------- browser ---

APPLY_JS = """
async (p) => {
  const { state } = await import('./js/state.js');
  const r = await import('./js/renderer.js');
  state.mode = p.mode;
  Object.assign(state.story, p.story);
  const target = p.mode === 'weekday' ? state.weekdaySlots : state.weekendSlots;
  target.length = 0;
  target.push(...p.slots);
  if (p.weekend) Object.assign(state.weekend, p.weekend);
  if (p.nextWeek) Object.assign(state.nextWeek, p.nextWeek);
  r.renderAll();
}
"""

# Export-only tweaks: no rounded corners / shadow around the 1080x1920 image.
EXPORT_CSS = "#story { border-radius: 0 !important; box-shadow: none !important; }"


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def png_size(path):
    with open(path, "rb") as f:
        head = f.read(24)
    return struct.unpack(">II", head[16:24])


def render(app_dir, payload, out):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sys.exit("Playwright is not installed. Run:\n"
                 "  pip install playwright\n  playwright install chromium")

    # ES modules do not load from file:// so serve the folder locally.
    handler = functools.partial(QuietHandler, directory=str(app_dir))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{server.server_address[1]}/index.html"

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            ctx = browser.new_context(
                viewport={"width": 1400, "height": 1000},
                device_scale_factor=TARGET_SIZE[0] / STORY_CSS_WIDTH,
            )
            page = ctx.new_page()
            page.on("pageerror", lambda e: print("page error:", e, file=sys.stderr))
            page.goto(url, wait_until="networkidle")
            if payload:
                page.evaluate(APPLY_JS, payload)
            page.add_style_tag(content=EXPORT_CSS)
            page.evaluate("document.fonts.ready")
            fonts_ok = page.evaluate(
                "[...document.fonts].some(f => f.family.includes('Barlow') && f.status === 'loaded')")
            if not fonts_ok:
                print("warning: Barlow Condensed did not load (no internet / Google Fonts "
                      "blocked?) - text will use fallback fonts", file=sys.stderr)
            page.locator("#story").screenshot(path=str(out))
            browser.close()
    finally:
        server.shutdown()

    size = png_size(out)
    if size != TARGET_SIZE:
        try:
            from PIL import Image
            Image.open(out).resize(TARGET_SIZE, Image.LANCZOS).save(out)
            print(f"note: resized {size} -> {TARGET_SIZE}", file=sys.stderr)
        except ImportError:
            print(f"warning: PNG is {size[0]}x{size[1]}, expected {TARGET_SIZE[0]}x{TARGET_SIZE[1]}",
                  file=sys.stderr)


# ----------------------------------------------------------------- cli ---

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    ap.add_argument("--live", action="store_true", help="fill the story with real lasertag data")
    ap.add_argument("--date", help="target date YYYY-MM-DD (default: tomorrow)")
    ap.add_argument("--out", default="story.png")
    ap.add_argument("--app", default=str(Path(__file__).resolve().parent),
                    help="folder containing index.html (default: this script's folder)")
    ap.add_argument("--url", default=LASER_URL)
    ap.add_argument("--from-html", help="read a saved booking page instead of fetching (testing)")
    ap.add_argument("--print-state", action="store_true", help="print the data to fill in and exit")
    args = ap.parse_args()

    payload = None
    if args.live or args.from_html:
        target = (datetime.strptime(args.date, "%Y-%m-%d").date() if args.date
                  else (datetime.now(slots.TZ) + timedelta(days=1)).date())
        html = (Path(args.from_html).read_text(encoding="utf-8") if args.from_html
                else slots.fetch(args.url))
        payload = build_payload(html, target)
        if payload is None:
            print(f"No lasertag slots on {target} - nothing to post.", file=sys.stderr)
            sys.exit(2)
        if args.print_state:
            print(json.dumps(payload, ensure_ascii=False, indent=2))
            return
    elif args.print_state:
        sys.exit("--print-state needs --live")

    out = Path(args.out).resolve()
    render(Path(args.app), payload, out)
    print(f"saved {out}")


if __name__ == "__main__":
    main()
