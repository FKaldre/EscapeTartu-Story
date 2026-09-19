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

export const state = {

    // --------------------------------------------------
    // Current mode — 'weekday' or 'weekend'
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
