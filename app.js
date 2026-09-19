// ==========================================================
// app.js
// Entry point — runs on page load.
// Initialises controls, does first render, wires export.
// ==========================================================

import { initAll }     from './ui.js';
import { renderAll }   from './renderer.js';
import { exportStory } from './export.js';

document.addEventListener('DOMContentLoaded', () => {

    // 1. Build sidebar controls and wire them to state
    initAll();

    // 2. Draw the story for the first time
    renderAll();

    // 3. Wire the export button
    document.getElementById('export-btn').addEventListener('click', exportStory);

});
