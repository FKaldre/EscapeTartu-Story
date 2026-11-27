// ==========================================================
// state.js
// All editable data lives here.
// ==========================================================

export const STATUS = {
    FREE: "FREE",
    FULL: "FULL"
};

export const WEEKEND_LEVEL = {
    LOW:    "LOW",
    MEDIUM: "MEDIUM",
    HIGH:   "HIGH"
};

// Sample escape room day, used by the preview (the render script
// replaces it with live data). Pass the times each room has and
// which of them are still free.
function sampleRoom(name, times, free) {
    return {
        name,
        photo: null,                      // e.g. "assets/rooms/dracula.jpg"
        times: times.map(time => ({
            time,
            status: free.includes(time) ? STATUS.FREE : STATUS.FULL
        }))
    };
}

export const state = {

    // --------------------------------------------------
    // Look of the story — 'lasertag' or 'escape'
    // --------------------------------------------------
    theme: 'lasertag',

    // --------------------------------------------------
    // Current mode — 'weekday' or 'weekend' (lasertag only)
    // --------------------------------------------------
    mode: 'weekday',

    // --------------------------------------------------
    // Text shown on the story
    // --------------------------------------------------
    story: {
        day:      "Neljapäev",
        date:     "3. juuli",
        title:    "LASERTAG",
        subtitle: "ESCAPETARTU"
    },

    // --------------------------------------------------
    // Background image
    // --------------------------------------------------
    background: {
        dataUrl: null
    },

    // --------------------------------------------------
    // Weekday slots (6)
    // --------------------------------------------------
    weekdaySlots: [
        { id: 1, time: "11:45", status: STATUS.FREE },
        { id: 2, time: "13:30", status: STATUS.FREE },
        { id: 3, time: "15:15", status: STATUS.FREE },
        { id: 4, time: "17:00", status: STATUS.FREE },
        { id: 5, time: "18:45", status: STATUS.FREE },
        { id: 6, time: "20:30", status: STATUS.FREE }
    ],

    // --------------------------------------------------
    // Weekend slots (7 — starts at 10:00)
    // --------------------------------------------------
    weekendSlots: [
        { id: 1, time: "10:00", status: STATUS.FREE },
        { id: 2, time: "11:45", status: STATUS.FREE },
        { id: 3, time: "13:30", status: STATUS.FREE },
        { id: 4, time: "15:15", status: STATUS.FREE },
        { id: 5, time: "17:00", status: STATUS.FREE },
        { id: 6, time: "18:45", status: STATUS.FREE },
        { id: 7, time: "20:30", status: STATUS.FREE }
    ],

    // --------------------------------------------------
    // Escape rooms (escape theme) — one card per room
    // --------------------------------------------------
    rooms: [
        sampleRoom("Dracula",
            ["09:30","11:15","13:00","14:45","16:30","18:15","20:00"],
            ["09:30","11:15","13:00","20:00"]),
        sampleRoom("Kummituste maja",
            ["09:45","11:30","13:15","15:00","16:45","18:30","20:15"],
            ["09:45","20:15"]),
        sampleRoom("Pangarööv",
            ["10:00","11:45","13:30","15:15","17:00","18:45","20:30"],
            ["10:00","11:45","18:45","20:30"]),
        sampleRoom("Zombi Virus X",
            ["10:15","12:00","13:45","15:30","17:15","19:00","20:45"],
            ["10:15","12:00","19:00","20:45"]),
        sampleRoom("Vangla",
            ["10:15","12:00","13:45","15:30","17:15","19:00","20:45"],
            ["10:15","12:00","19:00","20:45"])
    ],

    // --------------------------------------------------
    // Weekday — weekend availability (2 indicators)
    // --------------------------------------------------
    weekend: {
        saturday: WEEKEND_LEVEL.HIGH,
        sunday:   WEEKEND_LEVEL.MEDIUM
    },

    // --------------------------------------------------
    // Weekend mode — next week single indicator
    // --------------------------------------------------
    nextWeek: {
        level: WEEKEND_LEVEL.LOW
    }

};

// Active slots depending on mode
export function activeSlots() {
    return state.mode === 'weekday' ? state.weekdaySlots : state.weekendSlots;
}
