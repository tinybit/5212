# Dial Reconstruction Process & Locked Geometry

This document captures every useful fact from the multi-hour iterative session that produced the current SVG overlay. Future work (text, hands, Garmin export) should treat these values as the source of truth unless the user explicitly re-opens a constant.

---

## 1. Project intent

- Recreate the **Patek Philippe 5212A Weekly Calendar** dial digitally.
- Intermediate form: high-fidelity SVG / React overlay on the real photo for visual verification.
- End goal: Garmin Fenix custom watch face (Fenix 7 / 8 family).
  - Display size: **260 × 260** pixels (MIP).
  - Hands must be separate rotatable assets; the dial itself is a static bitmap.
- User can code; the collaborative process was pure visual lock-in of geometry.

---

## 2. Reference images

| File | Notes |
| --- | --- |
| `attachments/47322083-…-ExtraLarge.webp` | Original tilted / perspective photo. Used only in the earliest stages. |
| `attachments/202415-51887.jpg` → `public/reference-ortho.jpg` | **Orthographic baseline**. 2911 × 2683 px. All measurements are relative to this image. |

### Why the photo is imperfect

Even the “orthographic” shot is not perfectly flat:

- Slight residual camera tilt / perspective.
- The metal case bezel covers a thin outer ring of the dial, so the true outer edge of the printed dial sits a few pixels underneath the case lip.
- Optical / printing imperfections mean concentric circles never align perfectly on left, right, top and bottom simultaneously.

**Consequence:** we chose a single shared center and a set of radii that look correct *as a whole*. Local deviations of 1–3 px on one side are expected and accepted. Do not keep micro-adjusting the center hoping for perfect concentricity — it will never happen with this reference.

---

## 3. Shared geometric center

```
CX = 1381
CY = 1331
```

(Units = photo pixels of the 2911×2683 orthographic image.)

### How we arrived at it

1. Early PIL polar-unwrap analysis on the tilted photo produced a first guess.
2. Switched to the orthographic baseline.
3. Manual iterative nudges driven by the user while watching cyan/magenta rails and a bright pink diagnostic center dot:
   - “three pixels up”, “two more up”, “one pixel to the right”, later “three down”, “two more down”, etc.
4. Final confirmation: user stated “This is our center. Now, circles and sector lines, they're matching almost perfectly.”

A bright pink dot (`r=7`) and a larger blue diagnostic circle (`r=37`) remain in the SVG purely as visual anchors. They can be removed later.

---

## 4. Concentric rails (locked)

All radii measured from the shared center above.

| Rail | Radius (px) | Color in overlay | Meaning |
| --- | --- | --- | --- |
| Day inner | 442 | Cyan `#00ccff` | Inner edge of day-of-week track |
| Day outer | 547 | Cyan | Outer edge of day-of-week track |
| Minute track | 787 | (orange dots only) | Radius of the small minute markers |
| Week inner | 826 | Magenta `#ff0066` | Inner edge of week-number track |
| Week outer | 928 | Magenta | Outer edge of week-number + month track |
| Dial edge | 1030 | Magenta | True outer edge of the printed dial (slightly under the case) |

The outer edge was walked up from ~970 → 1000 → 1030 until the user confirmed it correctly sits just under the case lip.

---

## 5. Radial sector lines

### Month sectors (outermost magenta ring)

```
MONTH_SECTOR_OFFSET_DEG = 29.75
step = 30°
12 lines from R_WEEK_OUT (928) → R_DIAL_EDGE (1030)
```

### Week sectors (between week numbers)

```
WEEK_COUNT = 53
WEEK_STEP_DEG = 360 / 53 ≈ 6.79245°
WEEK_OFFSET_DEG = 6.5
```

Only the *odd* gaps are drawn (the lines that sit between the week numbers). Magenta filled dots sit at the midpoint of each drawn sector:

```
R_WEEK_DOT = (826 + 928) / 2 ≈ 877
WEEK_DOT_RADIUS = 18.48
```

(Earlier attempts at measured non-uniform angles were rejected by the user in favor of the uniform 53-grid.)

### Day-of-week sectors (cyan track)

```
DAY_SECTOR_OFFSET_DEG = 25.2
DAY_SECTOR_STEP_DEG = 360 / 7 ≈ 51.4286°
7 lines from R_DAY_IN (442) → R_DAY_OUT (547)
```

---

## 6. Minute markers

```
R_MINUTE = 787
MINUTE_OFFSET_DEG = 5.7
MINUTE_STEP_DEG = 6
MINUTE_DOT_RADIUS = 9
```

Angular offset was tuned by the user in sub-degree steps (“2° right”, “1.7° left”, “0.1° right”, “0.2° right”) until the orange dots sat on the printed minute pips.

### Skipped indices

Hour positions (where a baton sits) and the two neighbors of the 3 o’clock date window are deliberately omitted:

```ts
MINUTE_SKIP = {
  4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59,  // under hour batons
  13, 15                                          // date-window neighbors
}
```

(The 3 o’clock baton itself is also absent — see below.)

---

## 7. Hour batons — 4-facet prism model

The printed hour markers are physical applied indices that look like short triangular prisms. After extensive facet-by-facet construction the geometry settled on:

```
R_BATON_OUT          = 799   // outer tip
R_BATON_IN           = 616   // base of the long faces
R_BATON_IN_APEX      = 647   // start of the green diamond
R_BATON_IN_APEX_MIRROR = 588 // innermost tip of the green arrow
BATON_HALF_W         = 24
BATON_OUTER_END_DEPTH = 27.5 // yellow triangle depth
BATON_12_LATERAL     = 30    // left/right offset for the double 12 markers
```

### Facet colors (semi-transparent for alignment)

| Facet | Color | Topology |
| --- | --- | --- |
| Yellow | `#ffcc00` | Outer ground triangle — base at outer tip, apex pointing *inward* |
| Red | `#ff3333` | Left long face of the prism |
| Blue | `#3388ff` | Right long face of the prism |
| Green | `#33ff66` | Single 4-vertex diamond (two mirrored triangles) forming the inner arrow tip |

### Placement rules

- Single batons at hours **1, 2, 4, 5, 6, 7, 8, 9, 10, 11**.
- **No baton at 3** (date window).
- At **12** two parallel batons are drawn with `lateralOffset = ±30` so they sit symmetrically on either side of the vertical center line, still between the neighboring minute marks.
- Angular position of every baton is derived from the same minute grid:

```ts
function hourAngleDeg(h: number) {
  const hourIndex = h === 12 ? 0 : h;
  const k = hourIndex === 0 ? 59 : 4 + (hourIndex - 1) * 5;
  return MINUTE_OFFSET_DEG + k * MINUTE_STEP_DEG;
}
```

### Physical model (user’s own description)

> “Physically, it is literally a prism. Like a long triangle. It’s a prism with the outermost facet ground a bit, so it’s angled, and we get a yellow triangle. And another part of the prism, it is sharpened into an arrow. And then again polished down … because we made it narrow, it doesn’t become a triangle like a yellow facet, but it becomes a diamond shape.”

---

## 8. UI controls

Two independent toggles live under the dial:

1. **Photo opacity** — cycles `1 → 0.5 → 0` (labels “Photo: 100% / 50% / OFF”).
2. **Drawing** — shows / hides the entire SVG overlay.

Both are pure client state inside `WeeklyCalendarWatch`.

---

## 9. Coordinate / angle conventions used in code

```ts
function polarPoint(degFrom12: number, r: number) {
  const rad = ((degFrom12 - 90) * Math.PI) / 180;
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}
```

- 0° = 12 o’clock.
- Positive angles run clockwise.
- The classic SVG “0° = 3 o’clock, CCW” is converted by the `-90` offset.

---

## 10. Text / numerals (work in progress)

The real dial uses a handwritten-looking style for week numbers, month names, day abbreviations, etc.

- Early attempt to *trace* the week “1” as a path was abandoned (size / placement never matched).
- Agreed next approach: find a font that approximates the handwritten digits (especially **1, 2, 4, 7**) and place instances programmatically so the user can nudge positions.
- Candidate direction discussed: elegant upright serif / semi-script fonts (Cormorant Garamond family was mentioned; exact final choice still open). Crossed-7 and open-4 behavior must be checked carefully.

No text is currently rendered in the SVG.

---

## 11. Garmin target notes

- Fenix 7 / 8 family face size: **260 × 260**.
- Scale factor from photo → watch ≈ `130 / 1030 ≈ 0.126`.
- Dial must become a static bitmap; hands must be separate assets that the watch face rotates.
- AOD (always-on) constraints and color limits of the MIP panel still need to be verified later.

---

## 12. Code structure (relevant parts only)

```
src/components/WeeklyCalendarWatch.tsx
├── constants (all radii, offsets, skip sets, colors)
├── polarPoint / polarLine helpers
├── hourAngleDeg
├── monthSectorLines / daySectorLines / weekSectorLines / weekDots / minuteDots
├── HourBaton component (4-facet polygon paths + rotate/translate)
└── WeeklyCalendarWatch (photo + SVG + two toggle buttons)
```

Everything geometric lives in one file so the constants stay co-located with the drawing code. Do not scatter the radii into a separate config until the dial is finished.

---

## 13. Lessons that should not be forgotten

1. **Never trust a single “perfect” center from an automated polar unwrap.** The photo is imperfect; human visual lock-in against the live overlay is the only reliable method.
2. **Outer rail radius 1030 deliberately overlaps the case slightly** because the printed dial continues under the bezel.
3. **Uniform 53-week grid beat measured individual angles.** User explicitly reverted a “measured” version.
4. **Minute markers and hour batons share the same angular grid.** That is why the baton angle function is derived from the minute `k` index.
5. **3 o’clock is special** — both the baton and its two neighboring minute dots are absent because of the date window.
6. **Semi-transparent colored facets were essential** for matching the 3-D shading of the real applied indices. Opaque solid shapes hide alignment errors.
7. **Two independent toggles** (photo opacity + drawing visibility) are the primary debugging interface. Keep them.

---

*Last updated from the live component source and the full iterative conversation (July 2026).*
