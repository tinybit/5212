# Dial Reconstruction Process & Locked Geometry

This document captures the calibrated geometry, typography, hands, motion, and debugging controls in the current SVG overlay. Treat these values as the source of truth unless the user explicitly re-opens a constant.

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
| `public/reference-ortho-cream.jpg` | Working reference with the exterior converted to dial cream. Used by the live component. |
| `public/reference-handless.png` | Dial-only reference, aligned to the same 2911 × 2683 canvas and center as the working reference. |

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

The shared center remains the rotation origin for every hand. The photographed pin sits a few pixels away because of residual source distortion; do not move individual hands to the photographed pin.

---

## 4. Concentric rails (locked)

All radii measured from the shared center above.

| Rail | Radius (px) | Meaning |
| --- | --- | --- |
| Day inner | 442 | Inner edge of day-of-week track |
| Day outer | 547 | Outer edge of day-of-week track |
| Minute track | 787 | Radius of the small minute markers |
| Week inner | 826 | Inner edge of week-number track |
| Week outer | 928 | Outer edge of week-number + month track |
| Dial edge | 1030 | True outer edge of the printed dial (slightly under the case) |

All final rails, circles, sector lines, and marker linework are black. `DIAL_STROKE_WIDTH = 9`.

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
WEEK_DOT_RADIUS = 14.36848875
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

Controls live in two rows under the dial.

Row 1:

- **Photo** — cycles `1 → 0.5 → 0` (`Photo: 100% / 50% / OFF`).
- **Reference** — switches between the complete watch image and the aligned dial-only image.
- **Drawing** — shows or hides dial lines, text, markers, batons, and center diagnostics.
- **Guides** — shows or hides all glyph-center circles and radial alignment rays.
- **Hands** — shows or hides the complete programmatic hand stack.

Photo, drawing, guides, and hands are independent layers. Toggling any one must not mutate or override the state of another.

Row 2 contains independent `ON/OFF` controls for:

- **Week**
- **Day**
- **Hour**
- **Minute**
- **Second**

All controls are client state inside `WeeklyCalendarWatch`.

A fixed hand selector and vertical `0–360°` slider can manually override any hand angle. **Live** clears the selected hand override. **Pause** freezes live clock/calendar state; **Continue** clears manual overrides and resumes from the current time.

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

## 10. Text / numerals

The real dial uses a handwritten-looking style for week numbers, month names, day abbreviations, etc.

- Final font: **Indie Flower**, loaded from Google Fonts and exposed as `--font-display`.
- Week numerals, month names, and weekday names are rendered as individual SVG glyphs in uppercase where appropriate.
- Glyph centers were measured from polar-unwrapped crops of `reference-ortho.jpg` and stored in `MONTH_GLYPH_CENTERS` and `DAY_GLYPH_CENTERS`.
- Week labels use the uniform 53-position grid and tangent-based spacing.
- Per-glyph maps provide radial, scale, and rotation corrections for optical matching.
- Final glyph fill is black with `fontWeight={700}`.
- Week font size: `100`.
- Month font size: `100`.
- Day font size: `65.61`, with spacing scale `1.1`.
- Tuesday `A`/`Y` and Friday `F` include the approved 180° orientation corrections.

Guides combine week, month, and day glyph centers into one layer. Every guide includes a center circle and a ray extending from the shared dial center.

---

## 11. Programmatic hands

Five hands are rendered as separate SVG groups. Their required bottom-to-top stacking order is:

1. Day of week
2. Week of year / month
3. Hour
4. Minute
5. Seconds

### Seconds hand

The 5212A uses caliber **26-330 S C J SE**, officially specified at **28,800 semi-oscillations/hour (4 Hz)**. The visible seconds hand therefore advances eight times per second:

```text
tick interval = 125 ms
angle per tick = 0.75°
```

The timer is synchronized to `Date.now()` on every update so delays do not accumulate. Its upper blade is a flat gray tapered polygon. The lower counterweight is a five-vertex polygon with a gray-to-black vertical gradient and pointed end. The hub uses measured radial metallic gradients.

Key geometry:

```text
tip y                    = 536
neck y                   = 1287
tip half-width           = 3.84912
neck half-width          = 6.29856
hub radius               = 41.36
tail shoulder y          = 1358
tail end y               = 1618
tail point y             = 1643
tail shoulder half-width = 13.5
tail end half-width      = 27
```

### Minute hand

Two-facet Dauphine kite measured from the reference and a user-traced silhouette:

```text
reference angle = 56.85°
tip radius      = 786
rear radius     = -105
base radius     = -25
half-width      = 60
```

The current minute angle includes elapsed seconds and milliseconds:

```text
(minutes + seconds / 60) × 6°
```

### Hour hand

Shorter and broader two-facet Dauphine kite:

```text
reference angle = -55.2°
tip radius      = 510
rear radius     = -125
base radius     = -15
half-width      = 72
tip half-width  = 3
```

The current hour angle includes minutes, seconds, and milliseconds:

```text
((hours % 12) + minutes / 60 + seconds / 3600) × 30°
```

### Week-of-year / month hand

The reference points to week 33 on the uniform 53-position grid. At runtime the hand rotates to the current ISO week.

```text
reference week          = 33
reference angle         = 6.5° + 32 × (360° / 53)
head center radius      = 818
shaft start radius      = 25
shaft half-width        = 6.48
head half-width         = 57
head half-thickness     = 11.7
```

The shaft profile was measured directly from source pixels. It remains near-black through 48% of its length, transitions sharply between 48–56%, then remains dark gray near RGB `(49, 46, 41)`.

The red hammer head is an annular sector rather than a rectangle. Its long edges are concentric with the week rail. The source red median is approximately RGB `(178, 48, 58)`.

### Day-of-week hand

The reference points to Wednesday (`Date.getDay() === 3`). Runtime rotation maps Sunday through Saturday directly onto the seven sector centers.

```text
reference day           = 3 (Wednesday)
reference angle         = 153.7714°
head center radius      = 432
shaft start radius      = 25
shaft half-width        = 7.5
head half-width         = 72
head half-thickness     = 11.7
```

The measured shaft is approximately 15px wide and mostly flat dark gray around RGB `(79, 77, 74)`. Its red head is also an annular sector and intentionally shares the week hand’s red-head thickness.

### Shared hand helpers

- `handPoint(angle, along, lateral)` defines local hand coordinates.
- `annularSectorPath(...)` creates curved calendar-hand heads.
- All rotations use `(CX, CY)`.
- Calendar and time hands are initialized to reference angles for stable server rendering, then synchronized after hydration.

---

## 12. Garmin target notes

- Fenix 7 / 8 family face size: **260 × 260**.
- Scale factor from photo → watch ≈ `130 / 1030 ≈ 0.126`.
- Dial must become a static bitmap; hands must be separate assets that the watch face rotates.
- AOD (always-on) constraints and color limits of the MIP panel still need to be verified later.

---

## 13. Code structure (relevant parts only)

```
src/components/WeeklyCalendarWatch.tsx
├── constants (all radii, offsets, skip sets, colors)
├── polarPoint / polarLine / handPoint / annularSectorPath helpers
├── hourAngleDeg
├── monthSectorLines / daySectorLines / weekSectorLines / weekDots / minuteDots
├── HourBaton component (4-facet polygon paths + rotate/translate)
├── DayIndicatorHand / WeekIndicatorHand
├── HourHand / MinuteHand / SecondsHand
└── WeeklyCalendarWatch (clock state, photo, SVG layers, guides, and controls)
```

Everything geometric lives in one file so the constants stay co-located with the drawing code. Do not scatter the radii into a separate config until the dial is finished.

---

## 14. Lessons that should not be forgotten

1. **Never trust a single “perfect” center from an automated polar unwrap.** The photo is imperfect; human visual lock-in against the live overlay is the only reliable method.
2. **Outer rail radius 1030 deliberately overlaps the case slightly** because the printed dial continues under the bezel.
3. **Uniform 53-week grid beat measured individual angles.** User explicitly reverted a “measured” version.
4. **Minute markers and hour batons share the same angular grid.** That is why the baton angle function is derived from the minute `k` index.
5. **3 o’clock is special** — both the baton and its two neighboring minute dots are absent because of the date window.
6. **Semi-transparent colored facets were essential** for matching the 3-D shading of the real applied indices. Opaque solid shapes hide alignment errors.
7. **Layer controls are the primary debugging interface.** Keep photo, drawing, guides, and every hand independently toggleable.
8. **Do not approximate curved hammer heads with rectangles.** Both red calendar heads follow concentric dial rails.
9. **Measure gradients from source pixels.** The week shaft’s dark-to-gray change is localized, not a full-length linear ramp.
10. **Preserve hand stacking order:** day, week, hour, minute, seconds.

---

*Last updated from the live component source and the full iterative conversation (July 2026).*
