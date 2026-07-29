# 5212 — Patek Philippe Weekly Calendar Dial (Digital Reconstruction)

Pixel-accurate digital recreation of the **Patek Philippe 5212A Weekly Calendar** dial.

Long-term goal: export a clean bitmap + programmatic hands for a **Garmin Fenix** custom watch face (Fenix 7 / 8 family, 260×260 MIP display).

## What this repo is

An interactive SVG overlay tool that sits on top of a high-resolution orthographic reference photograph of the real dial. We use it to lock geometry (center, concentric rails, radial sectors, minute markers, faceted hour batons) by visual iteration against the photo.

The React component (`src/components/WeeklyCalendarWatch.tsx`) draws every rail, sector, minute dot and hour baton programmatically so we can toggle the photo on/off and verify alignment at any opacity.

## Current state (July 2026)

| Layer | Status |
| --- | --- |
| Concentric rails (day / week / outer edge) | Locked |
| Month sectors | Locked |
| Week sectors + midpoint dots | Locked |
| Day-of-week sectors | Locked |
| Minute markers | Locked (with skips under batons + date window) |
| Hour batons (4-facet prism model) | Locked for 1–11 + double at 12; 3 o’clock omitted (date window) |
| Center visualization | Pink + blue diagnostic dots |
| Photo opacity toggle (100 % / 50 % / OFF) | Working |
| Independent Drawing ON/OFF toggle | Working |
| Handwritten week numbers / month names / other text | **Not started** (font approach planned) |
| Hands (hour / minute / second / date) | Not started |
| Garmin 260×260 export | Not started |

## How to run

```bash
npm run dev          # serves on 0.0.0.0:8080
```

Open the live preview. Two buttons at the bottom:

1. **Photo: 100% / 50% / OFF** — cycle the reference image opacity.
2. **Drawing: ON / OFF** — toggle the entire SVG overlay.

## Key files

| Path | Purpose |
| --- | --- |
| `src/components/WeeklyCalendarWatch.tsx` | All geometry constants + SVG rendering |
| `public/reference-ortho.jpg` | Orthographic baseline photo (2911×2683) |
| `docs/PROCESS.md` | Full process history, locked numbers, distortion notes, baton model |
| `screenshots/` | Hundreds of alignment verification crops from the iterative session |
| `attachments/` | Original user-supplied photos |

## Units & coordinate system

Everything is in **photo pixels** of the orthographic reference:

- Image size: **2911 × 2683**
- Shared geometric center: **(1381, 1331)**
- Angles measured from 12 o’clock, clockwise, in degrees
- Polar → Cartesian conversion: `degFrom12 - 90` then standard `cos/sin`

See `docs/PROCESS.md` for every locked radius, offset and the reasons behind them.

## Important reality check

The orthographic photo is **still not perfectly flat**. Residual perspective, slight lens distortion and the case bezel overlapping the outer dial edge mean that a single set of concentric circles will never sit perfectly on every side at once. We locked the best visual compromise after extensive pixel-level iteration with the user. Do **not** chase sub-pixel perfection on the outer rails — it is physically impossible with this reference.

## Next work

1. Font-based week numbers (and later month names / day labels). Candidate fonts focus on digits 1, 2, 4, 7 matching the handwritten style of the real dial.
2. Programmatic hands that can later be exported as separate rotated bitmaps for Garmin.
3. Final clean export path scaled to 260×260 for the Fenix MIP display.
