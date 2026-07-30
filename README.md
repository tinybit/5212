# 5212 — Patek Philippe Weekly Calendar Dial

Pixel-calibrated digital reconstruction of the **Patek Philippe Calatrava Weekly Calendar Ref. 5212A-001**.

The app overlays a programmatic React/SVG dial on a 2911×2683 orthographic reference photograph. The photo, drawing, guides, and individual hands can be toggled independently for alignment work. The long-term target is a clean dial bitmap plus rotatable hand assets for a Garmin Fenix 7/8 watch face.

## Current state

Implemented and calibrated:

- Concentric day, week, month, minute, and dial-edge geometry.
- Month, week, and weekday sector divisions.
- Filled week separator dots and minute markers.
- Four-facet applied hour batons, including the double marker at 12 and the date-window omission at 3.
- Week numerals, month names, and weekday names rendered in **Indie Flower**, with measured per-glyph centers and manual optical corrections.
- Cream reference background and matching page background.
- Five independently rendered hands in the correct stack:
  1. Day-of-week hand
  2. Week-of-year/month hand
  3. Hour hand
  4. Minute hand
  5. Seconds hand
- Local-time hour and minute positioning.
- Mechanical seconds motion at eight steps per second, matching the 4 Hz / 28,800 semi-oscillations-per-hour caliber 26-330 S C J SE.
- Current ISO week and local weekday indication.

Not implemented yet:

- Garmin 260×260 export and asset-generation pipeline.
- Production watch-face integration and MIP/AOD optimization.

## Run locally

```bash
npm run dev
```

The Vite preview is configured for `0.0.0.0:8080`.

Useful verification commands:

```bash
npx tsc --noEmit
npx eslint src/components/WeeklyCalendarWatch.tsx
```

## Controls

The dial controls are arranged in two rows:

1. `Photo`, `Reference`, `Drawing`, `Guides`, `Hands`
2. `Week`, `Day`, `Hour`, `Minute`, `Second`

`Photo` cycles through 100%, 50%, and OFF. `Reference` switches between the complete watch photo and the aligned dial-only reference. Every other control independently toggles its named SVG layer.
The four top-level layers are independent: the reference photo, dial drawing, alignment guides, and complete hand stack. The second row controls individual hands within the hand layer.

The fixed controls above and beside the dial select any hand, rotate it through 360°, pause or continue live time, and return a manually positioned hand to its live clock/calendar angle.

## Key files

- `src/components/WeeklyCalendarWatch.tsx` — geometry, measured coordinates, hand shapes, clock calculations, and SVG rendering.
- `src/components/WatchStage.tsx` — page layout and cream background.
- `src/routes/__root.tsx` — document shell and Google Fonts import.
- `src/styles.css` — global styling and font variables.
- `public/reference-ortho.jpg` — original orthographic baseline.
- `public/reference-ortho-cream.jpg` — working reference with the exterior changed to dial cream.
- `public/reference-handless.png` — aligned dial-only reference on the same cream canvas.
- `docs/PROCESS.md` — measurement conventions, locked constants, rendering details, and implementation history.

## Coordinate system

All geometry uses native pixels from `reference-ortho.jpg`:

- Image: **2911 × 2683**
- Shared center: **(1381, 1331)**
- 0°: 12 o’clock
- Positive rotation: clockwise
- Polar conversion: subtract 90° before standard Cartesian `cos`/`sin`

The photographed pin is a few pixels away from the shared geometric center because the source is not perfectly orthographic. Programmatic layers intentionally use the shared center.

## Reference limitations

The source retains slight perspective and lens distortion, and the case bezel obscures part of the printed dial edge. A single set of circles cannot match every side perfectly. The current constants are the visually approved compromise; do not re-center the whole dial to correct an isolated 1–3px discrepancy.

See `docs/PROCESS.md` for the complete calibrated geometry and hand specifications.
