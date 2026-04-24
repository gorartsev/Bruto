# BRUTE

iOS strength journal. Punk tattoo-zine aesthetic. Week 03, heavy bench.

Designed in [claude.ai/design](https://claude.ai/design). HTML/CSS/JS prototype — React 18 via Babel standalone, no build step.

**Live:** https://gorartsev.github.io/Bruto/

## Run locally

Browsers won't load `text/babel` from `file://`, so you need a tiny HTTP server:

```bash
python -m http.server 8787
```

Open `http://localhost:8787/`.

## Core loop

Today → Active Workout → PR Celebration → Session Complete.

- Tap rep cells to complete reps (fill with brush bleed)
- LOG SET triggers rest → live countdown with brushstroke ring
- Tap the hero weight to open the drum-roll picker (2.5 kg snap)
- Push bench past the PR threshold to fire the takeover
- Mini nav (T / W / PR / ✓) at the bottom of the phone jumps between screens

## Tweaks panel (top-right)

Language EN / RU · Accent (Blood / Caution / Bruise) · Grit · Active state (normal / resting).

## Files

```
index.html            entry — live app
ios-frame.jsx         iOS 26 device frame
tweaks-panel.jsx      runtime controls
brute/
  design-tokens.jsx   palette, CSS, halftone, brush library
  i18n.jsx            EN + RU strings
  flash.jsx           skull, heart, tombstone, medallion, barbell, flame
  primitives.jsx      buttons, weight drum, rep cells, rest ring
  session-data.jsx    Week 3 Tuesday Heavy Bench
  screen-today.jsx
  screen-active.jsx
  screen-pr-complete.jsx
```

## System

- **Palette** — Ink #0A0A0A · Bone #F4ECD8 · Blood #B3121A · Smoke #2A2A2A · Ash #6B6B6B · Bruise #4A1518
- **Type** — Bebas Neue (display) · Inter (body) · JetBrains Mono (numeric)
- **Brush** — hand-authored SVG paths, stroke-paint entry, no CSS shadows faking paint
- **Motion** — path-length stroke-in, 0.95 press, no springs
