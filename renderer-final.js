// ==========================================================
// renderer.js
// Reads from state and updates the DOM story preview.
// ==========================================================

import { state, STATUS, WEEKEND_LEVEL, activeSlots } from './state.js';

// Label text for status values
const STATUS_LABEL = {
    FREE: "VABA",
    FULL: "TÄIS"
};

// Config for availability indicator levels
const LEVEL_CONFIG = {
    LOW:    { label: "Palju vabu aegu",   fill: 75 },
    MEDIUM: { label: "Pooled vabad",      fill: 45 },
    HIGH:   { label: "Täitumas!!!", fill: 15 }
};

// Big title per theme
const THEME_TITLE = {
    lasertag: "LASERTAG",
    escape:   "PÕGENEMISTUBA"
};

// --------------------------------------------------
// updateTheme
// Switches the look of the story (CSS class on #story)
// --------------------------------------------------
export function updateTheme() {
    document.getElementById('story')
        .classList.toggle('theme-escape', state.theme === 'escape');
}

// --------------------------------------------------
// updateHeader
// --------------------------------------------------
export function updateHeader() {
    state.story.title = THEME_TITLE[state.theme] || state.story.title;
    document.getElementById('title').textContent = state.story.title;
}

// --------------------------------------------------
// updateSticker — the date sticker (escape theme)
// "28. november" -> LAUPÄEV / 28 / NOVEMBER
// --------------------------------------------------
export function updateSticker() {
    const m = /^(\d+)\.?\s*(.*)$/.exec(state.story.date || '');
    document.getElementById('sticker-day').textContent   = (state.story.day || '').toUpperCase();
    document.getElementById('sticker-num').textContent   = m ? m[1] : (state.story.date || '');
    document.getElementById('sticker-month').textContent = m ? m[2].toUpperCase() : '';
}

// --------------------------------------------------
// updateRooms — one card per room, times as chips
// --------------------------------------------------
export function updateRooms() {
    const container = document.getElementById('rooms');
    container.innerHTML = '';

    // every row uses the same number of columns, so chips line up
    const cols = Math.max(1, ...state.rooms.map(r => r.times.length));
    container.style.setProperty('--cols', cols);

    state.rooms.forEach((room, i) => {
        const card = document.createElement('div');
        card.className = 'room-card';

        const head = document.createElement('div');
        head.className = 'room-head';

        const thumb = document.createElement('div');
        thumb.className = 'room-thumb room-' + ((i % 5) + 1);
        if (room.photo) {
            thumb.style.backgroundImage = `url('${room.photo}')`;
        } else {
            thumb.textContent = i + 1;   // placeholder until a photo exists
        }

        const name = document.createElement('span');
        name.className   = 'room-name';
        name.textContent = room.name;

        head.append(thumb, name);

        const times = document.createElement('div');
        times.className = 'room-times';
        room.times.forEach(t => {
            const chip = document.createElement('span');
            chip.className   = 'time-chip ' + (t.status === STATUS.FULL ? 'booked' : 'free');
            chip.textContent = t.time;
            times.appendChild(chip);
        });

        card.append(head, times);
        container.appendChild(card);
    });
}

// --------------------------------------------------
// updateDate
// --------------------------------------------------
export function updateDate() {
    document.getElementById('story-day').textContent        = state.story.day;
    document.getElementById('story-date-value').textContent = state.story.date;
}

// --------------------------------------------------
// updateSlots
// Rebuilds slot grid from active slots
// --------------------------------------------------
export function updateSlots() {
    const container = document.getElementById('slots');
    container.innerHTML = '';

    activeSlots().forEach(slot => {
        const isFull = slot.status === STATUS.FULL;

        const el = document.createElement('div');
        el.className    = 'slot ' + (isFull ? 'booked' : 'free');
        el.dataset.status = slot.status.toLowerCase();

        el.innerHTML = `
            <span class="slot-time">${slot.time}</span>
            <span class="slot-status">${STATUS_LABEL[slot.status]}</span>
        `;

        container.appendChild(el);
    });

}

// --------------------------------------------------
// updateBottomSection
// Shows weekend indicators on weekday mode,
// shows järgmine nädal on weekend mode
// --------------------------------------------------
export function updateBottomSection() {
    const weekendSection   = document.getElementById('weekend');
    const nextWeekSection  = document.getElementById('next-week');

    if (state.theme === 'escape') {
        weekendSection.style.display  = 'none';
        nextWeekSection.style.display = 'none';
        return;
    }

    if (state.mode === 'weekday') {
        weekendSection.style.display  = '';
        nextWeekSection.style.display = 'none';
        updateWeekend();
    } else {
        weekendSection.style.display  = 'none';
        nextWeekSection.style.display = '';
        updateNextWeek();
    }
}

// --------------------------------------------------
// updateWeekend — two indicators (weekday mode)
// --------------------------------------------------
export function updateWeekend() {
    const container = document.getElementById('weekend-content');
    container.innerHTML = '';

    const days = [
        { key: 'saturday', label: 'Laupäev'  },
        { key: 'sunday',   label: 'Pühapäev' }
    ];

    days.forEach(({ key, label }) => {
        const level  = state.weekend[key];
        const config = LEVEL_CONFIG[level];

        const el = document.createElement('div');
        el.className    = 'weekend-day';
        el.dataset.level = level.toLowerCase();

        el.innerHTML = `
            <div class="weekend-title">
                <span>${label}</span>
                <span class="weekend-level-label">${config.label}</span>
            </div>
            <div class="availability-bar">
                <div class="availability-fill" style="width: ${config.fill}%"></div>
            </div>
        `;

        container.appendChild(el);
    });
}

// --------------------------------------------------
// updateNextWeek — single indicator (weekend mode)
// --------------------------------------------------
export function updateNextWeek() {
    const container = document.getElementById('next-week-content');
    container.innerHTML = '';

    const level  = state.nextWeek.level;
    const config = LEVEL_CONFIG[level];

    const el = document.createElement('div');
    el.className    = 'weekend-day';
    el.dataset.level = level.toLowerCase();

    el.innerHTML = `
        <div class="weekend-title">
            <span class="weekend-level-label">${config.label}</span>
        </div>
        <div class="availability-bar">
            <div class="availability-fill" style="width: ${config.fill}%"></div>
        </div>
    `;

    container.appendChild(el);
}

// --------------------------------------------------
// updateBackground
// --------------------------------------------------
export function updateBackground() {
    const story = document.getElementById('story');
    if (state.background.dataUrl) {
        story.style.backgroundImage = `url(${state.background.dataUrl})`;
    } else {
        story.style.backgroundImage = '';
    }
}

// --------------------------------------------------
// renderAll
// --------------------------------------------------
export function renderAll() {
    updateTheme();
    updateHeader();
    updateDate();
    updateSticker();
    updateSlots();
    updateRooms();
    updateBottomSection();
    updateBackground();
}
