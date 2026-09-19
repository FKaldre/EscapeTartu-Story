// ==========================================================
// ui.js
// Builds sidebar controls and wires them to state.
// ==========================================================

import { state, STATUS, WEEKEND_LEVEL, activeSlots } from './state.js';
import { renderAll, updateSlots, updateDate, updateBottomSection, updateBackground } from './renderer.js';

// --------------------------------------------------
// initModeToggle
// Weekday / Weekend toggle at top of sidebar
// --------------------------------------------------
export function initModeToggle() {
    const btnWeekday = document.getElementById('btn-weekday');
    const btnWeekend = document.getElementById('btn-weekend');

    function setMode(m) {
        state.mode = m;
        btnWeekday.classList.toggle('active', m === 'weekday');
        btnWeekend.classList.toggle('active', m === 'weekend');

        // show the right sidebar panel
        document.getElementById('panel-weekend').style.display  = m === 'weekday' ? '' : 'none';
        document.getElementById('panel-nextweek').style.display = m === 'weekend' ? '' : 'none';

        buildSlotEditor();
        updateSlots();
        updateBottomSection();
    }

    btnWeekday.addEventListener('click', () => setMode('weekday'));
    btnWeekend.addEventListener('click', () => setMode('weekend'));
}

// --------------------------------------------------
// initDateInputs
// --------------------------------------------------
export function initDateInputs() {
    const dayInput  = document.getElementById('day-input');
    const dateInput = document.getElementById('date-input');

    dayInput.value  = state.story.day;
    dateInput.value = state.story.date;

    dayInput.addEventListener('input', () => {
        state.story.day = dayInput.value;
        updateDate();
    });

    dateInput.addEventListener('input', () => {
        state.story.date = dateInput.value;
        updateDate();
    });
}

// --------------------------------------------------
// buildSlotEditor
// Rebuilds slot rows for whichever mode is active.
// Each slot is a time input + VABA/TÄIS toggle button.
// --------------------------------------------------
export function buildSlotEditor() {
    const container = document.getElementById('slot-editor');
    container.innerHTML = '';

    activeSlots().forEach((slot, index) => {
        const row = document.createElement('div');
        row.className = 'slot-editor-row' + (slot.status === STATUS.FULL ? ' is-booked' : '');

        // time input
        const timeInput = document.createElement('input');
        timeInput.type      = 'text';
        timeInput.value     = slot.time;
        timeInput.className = 'slot-time-input';

        timeInput.addEventListener('input', () => {
            slot.time = timeInput.value;
            updateSlots();
        });

        // VABA / TÄIS toggle button
        const toggle = document.createElement('button');
        toggle.className = 'slot-toggle ' + (slot.status === STATUS.FULL ? 'is-full' : 'is-free');
        toggle.textContent = slot.status === STATUS.FULL ? 'TÄIS' : 'VABA';

        toggle.addEventListener('click', () => {
            slot.status = slot.status === STATUS.FULL ? STATUS.FREE : STATUS.FULL;
            toggle.textContent = slot.status === STATUS.FULL ? 'TÄIS' : 'VABA';
            toggle.className   = 'slot-toggle ' + (slot.status === STATUS.FULL ? 'is-full' : 'is-free');
            row.classList.toggle('is-booked', slot.status === STATUS.FULL);
            updateSlots();
        });

        // slot number
        const num = document.createElement('span');
        num.className   = 'slot-index';
        num.textContent = index + 1;

        row.appendChild(num);
        row.appendChild(timeInput);
        row.appendChild(toggle);
        container.appendChild(row);
    });
}

// --------------------------------------------------
// initWeekendSelects — shown in weekday mode
// --------------------------------------------------
export function initWeekendSelects() {
    const satSelect = document.getElementById('saturday-select');
    const sunSelect = document.getElementById('sunday-select');

    satSelect.value = state.weekend.saturday;
    sunSelect.value = state.weekend.sunday;

    function styleSelect(el) {
        el.className = 's-' + el.value;
    }

    styleSelect(satSelect);
    styleSelect(sunSelect);

    satSelect.addEventListener('change', () => {
        state.weekend.saturday = satSelect.value;
        styleSelect(satSelect);
        updateBottomSection();
    });

    sunSelect.addEventListener('change', () => {
        state.weekend.sunday = sunSelect.value;
        styleSelect(sunSelect);
        updateBottomSection();
    });
}

// --------------------------------------------------
// initNextWeekSelect — shown in weekend mode
// --------------------------------------------------
export function initNextWeekSelect() {
    const select = document.getElementById('nextweek-select');

    select.value = state.nextWeek.level;
    select.className = 's-' + state.nextWeek.level;

    select.addEventListener('change', () => {
        state.nextWeek.level = select.value;
        select.className = 's-' + select.value;
        updateBottomSection();
    });
}

// --------------------------------------------------
// initBackgroundUpload
// --------------------------------------------------
export function initBackgroundUpload() {
    const input = document.getElementById('background-upload');

    input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
            state.background.dataUrl = e.target.result;
            updateBackground();
        };
        reader.readAsDataURL(file);
    });
}

// --------------------------------------------------
// initAll
// --------------------------------------------------
export function initAll() {
    initModeToggle();
    initDateInputs();
    buildSlotEditor();
    initWeekendSelects();
    initNextWeekSelect();
    initBackgroundUpload();
}
