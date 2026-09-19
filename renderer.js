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

// --------------------------------------------------
// updateHeader
// --------------------------------------------------
export function updateHeader() {
    document.getElementById('title').textContent = state.story.title;
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
    updateHeader();
    updateDate();
    updateSlots();
    updateBottomSection();
    updateBackground();
}
