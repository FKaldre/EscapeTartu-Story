// ==========================================================
// export.js
// ==========================================================

import { state } from './state.js';

export async function exportStory() {

    const btn   = document.getElementById('export-btn');
    const story = document.getElementById('story');

    btn.textContent = 'Eksportimine...';
    btn.disabled    = true;

    try {
    const canvas = await html2canvas(story, {
        scale:           1080 / story.offsetWidth,
        useCORS:         true,
        allowTaint:      true,
        backgroundColor: '#000000',
        logging:         false,
    });

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width  = 1080;
    finalCanvas.height = 1920;
    const ctx = finalCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, 1080, 1920);

    const dataUrl = finalCanvas.toDataURL('image/png');
    const isIOS   = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
        showImageOverlay(dataUrl);
    } else {
        const day = (state.story.day || 'lugu')
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[äöüõ]/g, c => ({ ä:'a', ö:'o', ü:'u', õ:'o' }[c] || c));

        const link    = document.createElement('a');
        link.download = `escapetartu_${day}.png`;
        link.href     = dataUrl;
        link.click();
    }

} catch (err) {
    console.error('Export failed:', err);
    alert('Export ebaõnnestus: ' + err.message);
} finally {
        btn.textContent = 'Laadi alla PNG';
        btn.disabled    = false;
    }
}

function showImageOverlay(dataUrl) {

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.92);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        gap: 16px;
    `;

    const tip = document.createElement('p');
    tip.textContent = 'Hoia pilti all → "Lisa fotodesse"';
    tip.style.cssText = `
        color: #fff;
        font-family: Inter, sans-serif;
        font-size: 14px;
        text-align: center;
        opacity: 0.7;
    `;

    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.cssText = `
        width: 100%;
        max-width: 360px;
        border-radius: 12px;
        box-shadow: 0 8px 40px rgba(0,0,0,0.6);
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Sulge';
    closeBtn.style.cssText = `
        margin-top: 8px;
        padding: 10px 28px;
        background: #F0E000;
        color: #0A0A00;
        border: none;
        border-radius: 8px;
        font-family: Inter, sans-serif;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
    `;

    closeBtn.addEventListener('click', () => document.body.removeChild(overlay));
    overlay.addEventListener('click', e => {
        if (e.target === overlay) document.body.removeChild(overlay);
    });

    overlay.appendChild(tip);
    overlay.appendChild(img);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
}