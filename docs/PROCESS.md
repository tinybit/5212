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
| `public/reference-handless-date-cutout.png` | Reference 2 with the measured rounded date aperture removed to alpha. |
| `public/date-ring-overlay.png` | Supplied movement photograph reduced to an opaque annulus containing only the white 1–31 date wheel. It renders beneath Reference 2 at the calibrated radius and offset. |
| `public/date-window-shadow.png` | Original date-aperture bevel and edge gradient extracted as a transparent frame and rendered above the wheel. |

`scripts/create_date_window_layers.py` regenerates the cutout and shadow assets from `reference-handless.png`. The compositing order is date wheel → cutout dial → extracted aperture shadow → hands/guides. The wheel also has its own aperture clip inset by one source pixel from the visible opening, preventing numeral bleed above or below the frame at fractional browser zoom levels.

Date-wheel calibration is stored in `DATE_WHEEL_CALIBRATION`. Because the photographed wheel is not perfectly uniform, final navigation will use per-date measured angles rather than a constant increment. Measurements recorded so far:

```text
Day:    1     2      3      4      5      6      7      8
Angle: 86.3  97.8  109.8  121.8  133.8  145.3  156.9  168.8

Day:    9      10     11     12     13     14     15     16
Angle: 180.8  192.5  204.0  215.5  227.2  238.7  250.1  261.8

Day:    17     18     19     20     21     22     23     24
Angle: 273.0  284.7  296.0  307.5  319.0  330.4  341.9  353.5

Day:    25    26    27    28    29    30    31
Angle:  4.9  16.6  28.0  39.7  51.4  62.9  74.5
```

The wheel initializes directly at the current local calendar date and its measured angle before the first render, avoiding a startup transition from day 1. Its live angle is derived from the simulated local timestamp and a continuous month index, so 31→1 remains a single forward step while 30→1 and February→March skip dates that do not exist. This makes the simulator perpetual across variable month lengths and leap years. Pressing **Date +1** creates a temporary manual override that automatically returns to the exact live date at the next simulated local date boundary. **Date +1** targets the complete per-date lookup table instead of applying a uniform increment. Targets remain unwrapped across 360° so the transition from day 24 (`353.5°`) to day 25 (`4.9°`) continues clockwise.

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
R_BATON_IN_APEX      = 640   // start of the green diamond (re-measured Aug 2026)
R_BATON_IN_APEX_MIRROR = 592 // innermost tip of the green arrow (re-measured Aug 2026)
BATON_HALF_W         = 24
BATON_OUTER_END_DEPTH = 24   // yellow triangle depth — right-angle apex, half of the diamond square (Aug 2026)
BATON_12_LATERAL     = 30    // left/right offset for the double 12 markers
```

The diamond radii were originally locked at 647/588 against the dial photograph, then re-opened and re-measured in August 2026 from perpendicular macro photos of a real marker: the facet is a **perfect square rotated 45°** — the pointy arrow corner is exactly 90°, so the tip and ridge-end points each sit one half-width (24px) from the line through the side corners (48 × 48px in plan), not the elongated 59px kite first traced. Symmetry plus the flat grind plane makes the facet's opposite edges exactly parallel in 3D.

### Flat calibration mode

| Facet | Color | Topology |
| --- | --- | --- |
| Yellow | `#ffcc00` | Outer ground triangle — base at outer tip, apex pointing *inward* |
| Red | `#ff3333` | Left long face of the prism |
| Blue | `#3388ff` | Right long face of the prism |
| Green | `#33ff66` | Single 4-vertex diamond (two mirrored triangles) forming the inner arrow tip |

The flat layer preserves these semi-transparent diagnostic colors for geometry calibration.

### Physically lit 3D mode

The 3D layer uses the same projected polygons but assigns explicit 3D vertices to the hidden base, raised ridge, outer bevel, and pointed inner bevel. Face normals are derived with cross products rather than guessed from marker position.

A draggable point light sits on a hemisphere with radius `6 × R_DIAL_EDGE`:

```text
light x = CX + u × radius
light y = CY + v × radius
light z = sqrt(1 - u² - v²) × radius
```

The hour markers use a nearly black environmental reflection plus a broad area-source specular lobe. The polished black-PVD Dauphine hour/minute hands combine a strong narrow highlight with a broader metallic facing reflection: an overhead source leaves them black instead of washing both facets gray, while a side source makes the facet facing it substantially brighter and leaves the opposite facet dark. Neither material has a Lambertian diffuse term or distance attenuation across the dial. The flat seconds hand uses a separate deep-black response with a softer highlight, matching its almost-black appearance in the reference. It is sampled at nine positions from tip through counterweight and rendered with a continuous longitudinal gradient; finite-source height, incidence changes, and controlled distance falloff remain visible when the source is aligned near the hemisphere rim. The flat week and day indicator shafts use the same deep-black material and longitudinal lighting treatment. In 3D mode, both red indicator heads are tessellated annular half-ellipses with constant-width concentric sides, straight radial end cuts, and a height equal to 55% of their half-width. A short vertical roll-off near each end preserves volume without producing a pill-shaped silhouette. Their analytic normals follow both the flattened cross-section and their respective circular rails, and their pigmented diffuse bodies receive compact dielectric highlights. Calculations happen in linear RGB before exponential tone mapping back to sRGB. Applied hour markers and dynamically lit hands deliberately cast no SVG shadows: the reference shows facet contrast but no reliably separable blade shadows, and horizon-level point-light projections looked artificial.

The marker's pointed inner end remains one uninterrupted diamond-shaped face with a single optical normal and fill, avoiding a false triangular seam. The hour hand retains two visible facets by tapering its raised ridge down to the mathematically solved tip height, making both four-point surfaces planar; the minute hand already consists of two planar triangles.

The date aperture consumes the same hemisphere position, elevation, and brightness. Its four inset walls shade independently from their inward-facing normals, while a clipped soft cast shadow moves across the date wheel opposite the light direction. Shadow offset follows the horizontal/elevation ratio, is continuous at the zenith, and its directional contribution reaches zero at zero point-light brightness. This dynamic layer sits above the extracted photographic bevel and below the hands.

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

Corrected against macro photography (August 2026): the cross-section is **not** a bare triangle — it is a triangular prism standing on a vertical-walled base slab, with a polished vertical band running around the entire footprint. The inner diamond facet is **one flat plane, never folded at the tip**: a single grind plane through both roof-eave corners and the inner ridge end. Its pointed tip terminates **above the dial** on a vertical tip wall — the bright facet sits on dark slab material and never dives to the base. Heights: `MARKER_PRISM_HEIGHT = 16` (total, ⅓ of the 48px width), `MARKER_BASE_HEIGHT = 11.2` (eaves/side band — base:rise ≈ 2.3:1, solved from a raking macro's band structure: far roof ≈ 9, near roof ≈ 18, base ≈ 10.5 image px at ≈37° elevation). With the 90° square diamond the facet tip height is `2 × base − ridge = 6.4px`, floating above the dial. Base ≥ ridge/2 is the validity limit — thinner bands require lowering the ridge with them. The `Watch3D` mesh (`batonGeometry`) implements exactly this solid; its plan-view projection stays identical to the calibrated flat artwork.

---

## 8. UI controls

All controls live in one draggable **Controls** window (`ControlPanel`), shown or hidden by the persistent top-left **⚙️** button; the window is hidden by default. It drags by its header with pointer or arrow keys, with no viewport clamp, so it may travel past the screen edges (toggling **⚙️** off and on restores the default position). Controls are grouped into three tabs.

**Time** tab:

- **10x / 100x / 1,000x / 10,000x / 100,000x** accelerate the simulated timeline, with a second press on the active multiplier restoring 1x speed.
- **Now** resets the simulated instant, date wheel, and manual hand overrides to current local time without changing the selected multiplier.
- **Pause** freezes the simulated timeline and **Continue** resumes from the frozen instant without clearing manual overrides or snapping back to the system clock.
- The hand selector shows the selected hand's current angle, and **Live** clears the selected hand override.
- **Week +1**, **Day +1**, and **Date +1** advance their hand by one sector and select it for inspection. These temporary overrides automatically expire at the next relevant simulated day or ISO-week boundary. Week, weekday, and date advances share the same short 180ms mechanical snap. **Date +1** targets the next measured per-date angle. Calendar hands and the date wheel retain unwrapped angles so crossing 360° continues clockwise.

The eight-step seconds-hand animation remains enabled through 10x; at faster multipliers it uses the continuous fractional simulated-second angle instead, eliminating mechanical beat pauses while all clock and calendar state continues advancing. The clock anchors itself to local time when the page opens, then advances from that simulated instant using the selected multiplier.

**Layers** tab:

- **Photo** — cycles `1 → 0.5 → 0` (`Photo: 100% / 50% / OFF`).
- **Reference** — switches between the complete watch image and the aligned dial-only image.
- **Drawing** — shows or hides dial lines, markers, batons, and center diagnostics.
- **Text** — independently shows or hides generated week, month, and weekday glyphs.
- **Guides** — shows or hides all glyph-center circles and radial alignment rays.
- **Hands** — shows or hides the complete programmatic hand stack, with independent **Week**, **Day**, **Hour**, **Minute**, and **Second** toggles.
- **Markers: Flat / 3D** — mutually exclusive marker mode: Flat preserves the original calibration facets and original hour/minute hand artwork, while 3D shows opaque physically lit marker and hand prisms.

Photo, drawing, text, guides, and hands are independent layers. Toggling any one must not mutate or override the state of another.

Default state: Photo 100%, Reference 2, Drawing ON, Text OFF, Guides OFF, and Hands ON.

**Light** tab: the hemisphere disk supports pointer dragging and keyboard arrows, while a `0–200%` slider controls point-light brightness without removing the low ambient term. In 3D marker mode, position and brightness update all marker, hour-hand, and minute-hand facet colors immediately. The date-window sliders control aperture-shadow softness, depth, cast strength, wall shading, and the photographic bevel opacity.

The date-ring calibration controls (X/Y offset nudges, **Capture angle**, and the rotation/size sliders) were removed after calibration finished. The calibrated values are locked as constants in the component: radius `826.868626px`, `X −3px`, and `Y +1px`.

All controls are client state inside `WeeklyCalendarWatch`; the active tab is local state inside `ControlPanel`.

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

Flat mode preserves that original artwork, including its original fixed filter. In 3D mode the blade and counterweight remain single, completely planar surfaces—there is no raised ridge or facet split—but their metallic colors respond to the shared hemisphere light. Their centers are evaluated independently for subtle point-light variation, with no generated cast shadow.

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
ridge height    = 26
```

In 3D mode, the silhouette is retained but the center line becomes a raised ridge. Two triangular sloping faces run from that ridge to the broad base vertices. Their normals are calculated from the 3D vertices and evaluated by the shared point-light model.

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
ridge height    = 30
```

Its 3D form uses the same two-face construction as the minute hand while preserving the broader base and dull three-pixel tip. Flat mode retains the original fixed gradients and traced silhouette.

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
├── ControlPanel (draggable tabbed control window: Time / Layers / Light)
├── DayIndicatorHand / WeekIndicatorHand
├── HourHand / MinuteHand / SecondsHand
├── WeeklyCalendarWatch (clock state, photo, SVG layers, guides, and tab content)
└── WATCH_GEOMETRY (calibrated constants re-exported for the 3D viewer)
```

Everything geometric lives in one file so the constants stay co-located with the drawing code. Do not scatter the radii into a separate config until the dial is finished. `src/components/Watch3D.tsx` consumes `WATCH_GEOMETRY` to build the rotatable three.js model (scene units are photo pixels; watch space maps photo `(x, y)` to `(x − CX, CY − y)` with +Z off the dial); it must not duplicate constants.

---

## 14. Lessons that should not be forgotten

1. **Never trust a single “perfect” center from an automated polar unwrap.** The photo is imperfect; human visual lock-in against the live overlay is the only reliable method.
2. **Outer rail radius 1030 deliberately overlaps the case slightly** because the printed dial continues under the bezel.
3. **Uniform 53-week grid beat measured individual angles.** User explicitly reverted a “measured” version.
4. **Minute markers and hour batons share the same angular grid.** That is why the baton angle function is derived from the minute `k` index.
5. **3 o’clock is special** — both the baton and its two neighboring minute dots are absent because of the date window.
6. **Keep flat and 3D marker purposes separate.** Semi-transparent colors are useful for geometry calibration; the lighting simulator must use opaque metallic facets.
7. **Layer controls are the primary debugging interface.** Keep photo, drawing, guides, and every hand independently toggleable.
8. **Do not approximate curved hammer heads with rectangles.** Both red calendar heads follow concentric dial rails.
9. **Measure gradients from source pixels.** The week shaft’s dark-to-gray change is localized, not a full-length linear ramp.
10. **Preserve hand stacking order:** day, week, hour, minute, seconds.

---

*Last updated from the live component source and the full iterative conversation (July 2026).*
