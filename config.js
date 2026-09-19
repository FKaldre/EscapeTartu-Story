// ==========================================================
// EscapeTartu Story Generator
// config.js
// ==========================================================

// ---------- CANVAS ----------

export const CANVAS = {
    width: 1080,
    height: 1920
};

// ---------- SAFE AREAS ----------
// Instagram overlays can hide these areas.

export const SAFE_AREA = {
    top: 170,
    bottom: 260,
    left: 40,
    right: 40
};

// ---------- COLORS ----------

export const COLORS = {

    background: "#080809",

    white: "#FFFFFF",
    muted: "#7A7A8D",
    dark: "#111116",

    yellow: "#F0E000",
    cyan: "#00E5FF",
    amber: "#FF9800",
    green: "#00FF7A",
    red: "#FF3050",

    panel: "#121218",
    panelBorder: "#2C2C36",

    divider: "#242430",

    weekend: "#FF9800"

};

// ---------- TYPOGRAPHY ----------

export const FONT = {

    title: {
        family: "Barlow Condensed",
        size: 92,
        weight: 700
    },

    logo: {
        family: "Oswald",
        size: 44,
        weight: 700
    },

    heading: {
        family: "Barlow Condensed",
        size: 70,
        weight: 700
    },

    slot: {
        family: "Barlow Condensed",
        size: 56,
        weight: 700
    },

    body: {
        family: "Inter",
        size: 26,
        weight: 500
    },

    small: {
        family: "Inter",
        size: 20,
        weight: 500
    }

};

// ---------- LAYOUT ----------

export const LAYOUT = {

    margin: 70,

    headerY: 80,

    titleY: 160,

    dayY: 320,

    availabilityY: 430,

    slotsY: 500,

    weekendY: 1120,

    footerY: 1600,

    bottomGlowY: 1880

};

// ---------- SLOT SETTINGS ----------

export const SLOT = {

    width: 450,

    height: 95,

    gapX: 40,

    gapY: 18,

    radius: 12

};

// ---------- WEEKEND ----------

export const WEEKEND = {

    panelHeight: 260,

    daySpacing: 110,

    barWidth: 240,

    barHeight: 12

};

// ---------- BOOKING STATES ----------

export const BOOKING = {

    FREE: {
        label: "VABA",
        color: COLORS.green
    },

    LIMITED: {
        label: "VIIMASED KOHAD",
        color: COLORS.amber
    },

    RESERVED: {
        label: "MÕNI MÄNG VEEL",
        color: COLORS.white
    },

    FULL: {
        label: "TÄIS BRONEERITUD",
        color: COLORS.red
    }

};

// ---------- BACKGROUND ----------

export const BACKGROUND = {

    image: "assets/background.png",

    overlayOpacity: 0.32,

    vignette: true,

    scanlines: false

};

// ---------- EXPORT ----------

export const EXPORT = {

    filePrefix: "escapetartu-story"

};