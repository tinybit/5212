import { useState } from "react";

/**
 * Orthographic reference with track circles + sector lines + hour batons.
 *
 * Center: (1381, 1331)
 */
const IMG_W = 2911;
const IMG_H = 2683;

const CX = 1381;
const CY = 1331;

const R_DAY_IN = 442;
const R_DAY_OUT = 547;

const R_MINUTE = 787;
const MINUTE_OFFSET_DEG = 5.7;
const MINUTE_STEP_DEG = 6;
const MINUTE_DOT_RADIUS = 9;

const R_WEEK_IN = 826;
const R_WEEK_OUT = 928;
const R_DIAL_EDGE = 1030;

/** Hour baton geometry (photo px). */
const R_BATON_OUT = 799;
const R_BATON_IN = 616;
const R_BATON_IN_APEX = 647;
const R_BATON_IN_APEX_MIRROR = 588;
const BATON_HALF_W = 24;
const BATON_OUTER_END_DEPTH = 27.5;
const BATON_12_LATERAL = 30;

const SINGLE_BATON_HOURS = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11] as const;

const MINUTE_SKIP = new Set<number>([
  4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59,
  13, 15, // date window neighbors
]);

const MAGENTA = "#ff0066";
const CYAN = "#00ccff";
const ORANGE = "#ff8c00";

const R_WEEK_DOT = (R_WEEK_IN + R_WEEK_OUT) / 2;
const WEEK_DOT_RADIUS = 18.48;

const MONTH_SECTOR_OFFSET_DEG = 29.75;
const DAY_SECTOR_OFFSET_DEG = 25.2;
const DAY_SECTOR_STEP_DEG = 360 / 7;

const WEEK_COUNT = 53;
const WEEK_STEP_DEG = 360 / WEEK_COUNT;
const WEEK_OFFSET_DEG = 6.5;

/**
 * Week-label glyph geometry, calibrated from the printed week "3":
 * center (1681, 511), radius from the dial center ≈873 px.
 *
 * The dial prints odd week numbers 1–53 on the uniform 53-position grid.
 * Two-digit labels are laid out along the local tangent to the band.
 */
const R_WEEK_GLYPH = Math.hypot(1681 - CX, 511 - CY);
const WEEK_DIGIT_SPACING = 48;
const WEEK_DIGIT_MARKER_RADIUS = 42;
const WEEK_DIGIT_FONT_SIZE = 100;
/** Per-glyph radial nudges in photo pixels. Positive = out, negative = in. */
const WEEK_DIGIT_RADIAL_ADJUSTMENTS: Record<string, number> = {
  "5-0": -3,
  "15-0": 3,
  "15-1": 8,
  "17-0": 8,
  "17-1": 8,
  "19-0": 7,
  "19-1": 7,
  "25-0": 5,
  "25-1": 10,
  "27-0": 5,
  "27-1": 5,
  "29-0": 5,
  "29-1": 5,
  "31-0": 5,
  "31-1": 5,
  "33-0": 5,
  "33-1": 5,
  "35-0": 3,
  "35-1": 10,
  "37-0": 5,
  "37-1": 5,
  "39-0": 5,
  "39-1": 5,
  "45-1": -5,
  "51-0": -5,
  "53-0": -5,
};
/** Per-glyph font scale. Values are relative to the default size. */
const WEEK_DIGIT_SCALE_ADJUSTMENTS: Record<string, number> = {
  "1-0": 1.1,
  "3-0": 1.1,
  "5-0": 0.9,
  "7-0": 1.1,
  "9-0": 1.1,
  "11-0": 1.1,
  "11-1": 1.1,
  "13-0": 1.1,
  "13-1": 1.1,
  "15-1": 0.8505,
  "17-0": 1.05,
  "17-1": 1.05,
  "19-0": 1.05,
  "19-1": 1.05,
  "25-1": 0.81,
  "35-1": 0.81,
  "45-0": 0.95,
  "45-1": 0.855,
  "51-0": 0.81,
  "53-0": 0.81,
};
/** Per-glyph rotation nudges in degrees. Positive = clockwise. */
const WEEK_DIGIT_ROTATION_ADJUSTMENTS: Record<string, number> = {
  "1-0": -7,
};

const PHOTO_OPACITY = [1, 0.5, 0] as const;
const PHOTO_LABEL = ["Photo: 100%", "Photo: 50%", "Photo: OFF"] as const;

type Props = {
  className?: string;
};

function polarPoint(degFrom12: number, r: number) {
  const rad = ((degFrom12 - 90) * Math.PI) / 180;
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

function polarLine(degFrom12: number, r0: number, r1: number) {
  const a = polarPoint(degFrom12, r0);
  const b = polarPoint(degFrom12, r1);
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
}

function hourAngleDeg(h: number) {
  const hourIndex = h === 12 ? 0 : h;
  const k = hourIndex === 0 ? 59 : 4 + (hourIndex - 1) * 5;
  return MINUTE_OFFSET_DEG + k * MINUTE_STEP_DEG;
}

function monthSectorLines() {
  const lines = [];
  for (let k = 0; k < 12; k++) {
    lines.push(polarLine(MONTH_SECTOR_OFFSET_DEG + k * 30, R_WEEK_OUT, R_DIAL_EDGE));
  }
  return lines;
}

function daySectorLines() {
  const lines = [];
  for (let k = 0; k < 7; k++) {
    lines.push(
      polarLine(DAY_SECTOR_OFFSET_DEG + k * DAY_SECTOR_STEP_DEG, R_DAY_IN, R_DAY_OUT),
    );
  }
  return lines;
}

function weekGapDegrees() {
  const degs: number[] = [];
  for (let k = 0; k < WEEK_COUNT; k++) {
    if (k % 2 === 0) continue;
    degs.push(WEEK_OFFSET_DEG + k * WEEK_STEP_DEG);
  }
  return degs;
}

function weekSectorLines() {
  return weekGapDegrees().map((deg) => polarLine(deg, R_WEEK_IN, R_WEEK_OUT));
}

function weekDots() {
  return weekGapDegrees().map((deg) => polarPoint(deg, R_WEEK_DOT));
}

function weekDigitMarkers() {
  const markers: {
    week: number;
    digit: string;
    index: number;
    x: number;
    y: number;
    digitX: number;
    digitY: number;
    rayX: number;
    rayY: number;
    rotation: number;
    scale: number;
  }[] = [];

  for (let week = 1; week <= WEEK_COUNT; week += 2) {
    const digits = String(week);
    const angle = WEEK_OFFSET_DEG + (week - 1) * WEEK_STEP_DEG;
    const center = polarPoint(angle, R_WEEK_GLYPH);
    const angleRad = (angle * Math.PI) / 180;
    const tangentX = Math.cos(angleRad);
    const tangentY = Math.sin(angleRad);
    const readingDirection = angle > 90 && angle < 270 ? -1 : 1;

    for (let index = 0; index < digits.length; index++) {
      const tangentOffset =
        (index - (digits.length - 1) / 2) * WEEK_DIGIT_SPACING * readingDirection;
      const x = center.x + tangentX * tangentOffset;
      const y = center.y + tangentY * tangentOffset;
      const distanceFromCenter = Math.hypot(x - CX, y - CY);
      const rayScale = R_DIAL_EDGE / distanceFromCenter;
      const rayAngle = (Math.atan2(x - CX, CY - y) * 180) / Math.PI;
      const normalizedRayAngle = (rayAngle + 360) % 360;
      const rotation =
        normalizedRayAngle > 90 && normalizedRayAngle < 270
          ? normalizedRayAngle - 180
          : normalizedRayAngle;
      const radialAdjustment = WEEK_DIGIT_RADIAL_ADJUSTMENTS[`${week}-${index}`] ?? 0;
      const scale = WEEK_DIGIT_SCALE_ADJUSTMENTS[`${week}-${index}`] ?? 1;
      const rotationAdjustment = WEEK_DIGIT_ROTATION_ADJUSTMENTS[`${week}-${index}`] ?? 0;

      markers.push({
        week,
        digit: digits[index],
        index,
        x,
        y,
        digitX: x + ((x - CX) / distanceFromCenter) * radialAdjustment,
        digitY: y + ((y - CY) / distanceFromCenter) * radialAdjustment,
        rayX: CX + (x - CX) * rayScale,
        rayY: CY + (y - CY) * rayScale,
        rotation: rotation + rotationAdjustment,
        scale,
      });
    }
  }

  return markers;
}

function minuteDots() {
  const dots = [];
  for (let k = 0; k < 60; k++) {
    if (MINUTE_SKIP.has(k)) continue;
    dots.push(polarPoint(MINUTE_OFFSET_DEG + k * MINUTE_STEP_DEG, R_MINUTE));
  }
  return dots;
}

function ptsToPath(pts: { x: number; y: number }[]) {
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
}

function HourBaton({
  degFrom12,
  lateralOffset = 0,
}: {
  degFrom12: number;
  lateralOffset?: number;
}) {
  const x0 = CX;
  const hw = BATON_HALF_W;

  const yOut = CY - R_BATON_OUT;
  const yOutApex = yOut + BATON_OUTER_END_DEPTH;

  const yIn = CY - R_BATON_IN;
  const yInApex = CY - R_BATON_IN_APEX;
  const yInTip = CY - R_BATON_IN_APEX_MIRROR;

  const yellow = [
    { x: x0 - hw, y: yOut },
    { x: x0 + hw, y: yOut },
    { x: x0, y: yOutApex },
  ];

  const red = [
    { x: x0 - hw, y: yOut },
    { x: x0, y: yOutApex },
    { x: x0, y: yInApex },
    { x: x0 - hw, y: yIn },
  ];

  const blue = [
    { x: x0 + hw, y: yOut },
    { x: x0, y: yOutApex },
    { x: x0, y: yInApex },
    { x: x0 + hw, y: yIn },
  ];

  const green = [
    { x: x0, y: yInTip },
    { x: x0 - hw, y: yIn },
    { x: x0, y: yInApex },
    { x: x0 + hw, y: yIn },
  ];

  return (
    <g
      transform={`rotate(${degFrom12} ${CX} ${CY}) translate(${lateralOffset} 0)`}
      opacity={0.55}
    >
      <path d={ptsToPath(red)} fill="#ff3333" stroke="#ff6666" strokeWidth={1.5} />
      <path d={ptsToPath(blue)} fill="#3388ff" stroke="#66aaff" strokeWidth={1.5} />
      <path d={ptsToPath(yellow)} fill="#ffcc00" stroke="#ffdd44" strokeWidth={1.5} />
      <path d={ptsToPath(green)} fill="#33ff66" stroke="#66ff99" strokeWidth={1.5} />
    </g>
  );
}

export function WeeklyCalendarWatch({ className = "" }: Props) {
  const [opacityIdx, setOpacityIdx] = useState(0);
  const [drawVisible, setDrawVisible] = useState(true);
  const [digitGuidesVisible, setDigitGuidesVisible] = useState(true);
  const photoOpacity = PHOTO_OPACITY[opacityIdx];
  const monthSectors = monthSectorLines();
  const daySectors = daySectorLines();
  const weekSectors = weekSectorLines();
  const wDots = weekDots();
  const digitMarkers = weekDigitMarkers();
  const mDots = minuteDots();

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative w-full">
        <img
          src="/reference-ortho.jpg"
          alt="Orthographic weekly calendar dial reference"
          className="block h-auto w-full select-none transition-opacity duration-200"
          style={{ opacity: photoOpacity }}
          draggable={false}
        />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-200"
          viewBox={`0 0 ${IMG_W} ${IMG_H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
          style={{ opacity: drawVisible ? 1 : 0 }}
        >
          <circle cx={CX} cy={CY} r={R_DIAL_EDGE} fill="none" stroke={MAGENTA} strokeWidth="3" />
          <circle cx={CX} cy={CY} r={R_WEEK_OUT} fill="none" stroke={MAGENTA} strokeWidth="3" />
          <circle cx={CX} cy={CY} r={R_WEEK_IN} fill="none" stroke={MAGENTA} strokeWidth="3" />

          {monthSectors.map((s, i) => (
            <line
              key={`m${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={MAGENTA}
              strokeWidth="2.5"
              strokeLinecap="butt"
            />
          ))}

          {weekSectors.map((s, i) => (
            <line
              key={`w${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={MAGENTA}
              strokeWidth="2"
              strokeLinecap="butt"
            />
          ))}

          {wDots.map((p, i) => (
            <circle
              key={`wd${i}`}
              cx={p.x}
              cy={p.y}
              r={8}
              fill="none"
              stroke={MAGENTA}
              strokeWidth={2.5}
            />
          ))}

          {mDots.map((p, i) => (
            <circle key={`md${i}`} cx={p.x} cy={p.y} r={MINUTE_DOT_RADIUS} fill={ORANGE} />
          ))}

          <circle cx={CX} cy={CY} r={R_DAY_OUT} fill="none" stroke={CYAN} strokeWidth="3" />
          <circle cx={CX} cy={CY} r={R_DAY_IN} fill="none" stroke={CYAN} strokeWidth="3" />

          {daySectors.map((s, i) => (
            <line
              key={`day${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={CYAN}
              strokeWidth="2.5"
              strokeLinecap="butt"
            />
          ))}

          {SINGLE_BATON_HOURS.map((h) => (
            <HourBaton key={h} degFrom12={hourAngleDeg(h)} />
          ))}

          <HourBaton degFrom12={0} lateralOffset={-BATON_12_LATERAL} />
          <HourBaton degFrom12={0} lateralOffset={BATON_12_LATERAL} />

          {digitMarkers.map((marker) => (
            <text
              key={`digit-${marker.week}-${marker.index}`}
              x={marker.digitX}
              y={marker.digitY}
              transform={`rotate(${marker.rotation} ${marker.digitX} ${marker.digitY})`}
              fill="#ffffff"
              fontFamily="'Indie Flower', cursive"
              fontSize={WEEK_DIGIT_FONT_SIZE * marker.scale}
              fontWeight={400}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {marker.digit}
            </text>
          ))}

          <circle cx={CX} cy={CY} r={37} fill="#00a2ff" />
          <circle cx={CX} cy={CY} r={7} fill="#ff2bd6" stroke="#fff" strokeWidth="2" />

          <circle cx={CX} cy={CY} r={10} fill="#00ffff" stroke="#000" strokeWidth={2} />
        </svg>

        {/* One marker per printed glyph in the odd week-number sequence 1–53. */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${IMG_W} ${IMG_H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
          style={{ opacity: digitGuidesVisible ? 1 : 0 }}
        >
          {digitMarkers.map((marker) => (
            <g key={`ray-${marker.week}-${marker.index}`} opacity={0.72}>
              <line
                x1={CX}
                y1={CY}
                x2={marker.rayX}
                y2={marker.rayY}
                stroke="#000000"
                strokeWidth={7}
              />
              <line
                x1={CX}
                y1={CY}
                x2={marker.rayX}
                y2={marker.rayY}
                stroke="#00ffff"
                strokeWidth={3}
              />
            </g>
          ))}

          {digitMarkers.map((marker) => (
            <g key={`${marker.week}-${marker.index}`}>
              <circle
                cx={marker.x}
                cy={marker.y}
                r={WEEK_DIGIT_MARKER_RADIUS + 5}
                fill="none"
                stroke="#000000"
                strokeWidth={8}
              />
              <circle
                cx={marker.x}
                cy={marker.y}
                r={WEEK_DIGIT_MARKER_RADIUS}
                fill="none"
                stroke="#00ff00"
                strokeWidth={5}
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setOpacityIdx((i) => (i + 1) % PHOTO_OPACITY.length)}
          className="shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {PHOTO_LABEL[opacityIdx]} · tap to cycle
        </button>
        <button
          type="button"
          onClick={() => setDrawVisible((v) => !v)}
          className="shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {drawVisible ? "Drawing: ON" : "Drawing: OFF"} · tap to toggle
        </button>
        <button
          type="button"
          onClick={() => setDigitGuidesVisible((visible) => !visible)}
          className="shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {digitGuidesVisible ? "Digit guides: ON" : "Digit guides: OFF"} · tap to toggle
        </button>
      </div>
    </div>
  );
}
