import { useEffect, useState } from "react";

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
const WEEK_COUNT = 53;
const WEEK_STEP_DEG = 360 / WEEK_COUNT;
const WEEK_OFFSET_DEG = 6.5;

/** Hour baton geometry (photo px). */
const R_BATON_OUT = 799;
const R_BATON_IN = 616;
const R_BATON_IN_APEX = 647;
const R_BATON_IN_APEX_MIRROR = 588;
const BATON_HALF_W = 24;
const BATON_OUTER_END_DEPTH = 27.5;
const BATON_12_LATERAL = 30;

/** Seconds-hand geometry measured from the orthographic reference. */
const SECOND_HAND_TIP_Y = 536;
const SECOND_HAND_NECK_Y = 1287;
const SECOND_HAND_TIP_HALF_W = 3.84912;
const SECOND_HAND_NECK_HALF_W = 6.29856;
const SECOND_HAND_HUB_RADIUS = 41.36;
const SECOND_HAND_TAIL_SHOULDER_Y = 1358;
const SECOND_HAND_TAIL_END_Y = 1618;
const SECOND_HAND_TAIL_POINT_Y = 1643;
const SECOND_HAND_TAIL_SHOULDER_HALF_W = 13.5;
const SECOND_HAND_TAIL_END_HALF_W = 27;
const SECOND_HAND_TICKS_PER_SECOND = 8;
const SECOND_HAND_TICK_MS = 1000 / SECOND_HAND_TICKS_PER_SECOND;
const SECOND_HAND_DEGREES_PER_TICK = 6 / SECOND_HAND_TICKS_PER_SECOND;

/** Minute-hand geometry measured from the orthographic reference. */
const MINUTE_HAND_ANGLE_DEG = 56.85;
const MINUTE_HAND_TIP_RADIUS = 786;
const MINUTE_HAND_REAR_RADIUS = -105;
const MINUTE_HAND_BASE_RADIUS = -25;
const MINUTE_HAND_HALF_WIDTH = 60;

/** Hour-hand geometry measured from the reference and traced silhouette. */
const HOUR_HAND_ANGLE_DEG = -55.2;
const HOUR_HAND_TIP_RADIUS = 510;
const HOUR_HAND_REAR_RADIUS = -125;
const HOUR_HAND_BASE_RADIUS = -15;
const HOUR_HAND_HALF_WIDTH = 72;
const HOUR_HAND_TIP_HALF_WIDTH = 3;

/** Week/month hammer-hand geometry measured from the reference. */
const WEEK_HAND_REFERENCE_WEEK = 33;
const WEEK_HAND_ANGLE_DEG = WEEK_OFFSET_DEG + (WEEK_HAND_REFERENCE_WEEK - 1) * WEEK_STEP_DEG;
const WEEK_HAND_HEAD_RADIUS = 818;
const WEEK_HAND_SHAFT_START_RADIUS = 25;
const WEEK_HAND_SHAFT_HALF_WIDTH = 6.48;
const WEEK_HAND_HEAD_HALF_LENGTH = 57;
const WEEK_HAND_HEAD_HALF_THICKNESS = 11.7;

const SINGLE_BATON_HOURS = [1, 2, 4, 5, 6, 7, 8, 9, 10, 11] as const;

const MINUTE_SKIP = new Set<number>([
  4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59,
  13, 15, // date window neighbors
]);

const MAGENTA = "#000000";
const CYAN = "#000000";
const ORANGE = "#000000";
const DIAL_STROKE_WIDTH = 9;

const R_WEEK_DOT = (R_WEEK_IN + R_WEEK_OUT) / 2;
const WEEK_DOT_RADIUS = 14.36848875;

const MONTH_SECTOR_OFFSET_DEG = 29.75;
const DAY_SECTOR_OFFSET_DEG = 25.2;
const DAY_SECTOR_STEP_DEG = 360 / 7;

/** Day-of-week hammer-hand geometry measured from the reference. */
const DAY_HAND_REFERENCE_DAY = 3;
const DAY_HAND_ANGLE_DEG =
  DAY_SECTOR_OFFSET_DEG - DAY_SECTOR_STEP_DEG / 2 + DAY_HAND_REFERENCE_DAY * DAY_SECTOR_STEP_DEG;
const DAY_HAND_HEAD_RADIUS = 432;
const DAY_HAND_SHAFT_START_RADIUS = 25;
const DAY_HAND_SHAFT_HALF_WIDTH = 7.5;
const DAY_HAND_HEAD_HALF_LENGTH = 72;
const DAY_HAND_HEAD_HALF_THICKNESS = WEEK_HAND_HEAD_HALF_THICKNESS;

/**
 * Week-label glyph geometry, calibrated from the printed week "3":
 * center (1681, 511), radius from the dial center ≈873 px.
 *
 * The dial prints odd week numbers 1–53 on the uniform 53-position grid.
 * Two-digit labels are laid out along the local tangent to the band.
 */
const R_WEEK_GLYPH = Math.hypot(1681 - CX, 511 - CY);
const WEEK_DIGIT_SPACING = 48;
const GLYPH_GUIDE_CIRCLE_RADIUS = 42;
const WEEK_DIGIT_FONT_SIZE = 100;
const MONTH_GLYPH_FONT_SIZE = 100;
const DAY_GLYPH_FONT_SIZE = 65.61;
const DAY_GLYPH_SPACING_SCALE = 1.1;
const DAY_GLYPH_ROTATION_ADJUSTMENTS: Record<string, number> = {
  "TUESDAY-5": 180,
  "TUESDAY-6": 180,
  "FRIDAY-0": 180,
};
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

/**
 * Black-pixel centroids measured from polar-unwrapped month sectors in
 * reference-ortho.jpg. Coordinates are in native photo pixels.
 */
const MONTH_GLYPH_CENTERS = [
  [
    "JANUARY",
    [
      [1462.8, 367.6],
      [1506.6, 361.7],
      [1567.8, 369.1],
      [1629.0, 388.4],
      [1690.4, 402.3],
      [1748.2, 421.2],
      [1801.9, 443.2],
    ],
  ],
  [
    "FEBRUARY",
    [
      [1930.2, 511.2],
      [1965.5, 547.5],
      [2008.3, 581.0],
      [2049.0, 614.7],
      [2088.1, 663.9],
      [2127.2, 698.7],
      [2164.9, 743.1],
      [2199.7, 786.0],
    ],
  ],
  [
    "MARCH",
    [
      [2278.3, 945.5],
      [2305.6, 1020.7],
      [2329.1, 1080.6],
      [2339.5, 1144.8],
      [2354.1, 1212.6],
    ],
  ],
  [
    "APRIL",
    [
      [2296.4, 1686.6],
      [2307.7, 1626.2],
      [2330.2, 1567.1],
      [2344.6, 1517.7],
      [2358.2, 1481.4],
    ],
  ],
  [
    "MAY",
    [
      [2023.3, 2070.9],
      [2082.9, 2014.6],
      [2120.5, 1963.5],
    ],
  ],
  [
    "JUNE",
    [
      [1529.9, 2308.1],
      [1591.0, 2294.1],
      [1667.3, 2268.5],
      [1731.4, 2245.5],
    ],
  ],
  [
    "JULY",
    [
      [1031.4, 2252.0],
      [1099.6, 2270.8],
      [1156.9, 2295.7],
      [1221.9, 2289.9],
    ],
  ],
  [
    "AUGUST",
    [
      [595.3, 1914.8],
      [629.8, 1962.8],
      [674.4, 2011.7],
      [716.5, 2056.1],
      [764.5, 2092.1],
      [816.9, 2115.4],
    ],
  ],
  [
    "SEPTEMBER",
    [
      [404.8, 1397.0],
      [410.5, 1437.8],
      [425.5, 1483.5],
      [434.1, 1530.2],
      [435.0, 1573.7],
      [453.8, 1629.1],
      [471.1, 1683.8],
      [487.4, 1725.9],
      [513.6, 1767.6],
    ],
  ],
  [
    "OCTOBER",
    [
      [408.5, 1258.5],
      [418.4, 1200.8],
      [412.8, 1138.4],
      [435.4, 1082.4],
      [456.5, 1022.5],
      [474.3, 971.6],
      [496.0, 914.3],
    ],
  ],
  [
    "NOVEMBER",
    [
      [567.5, 793.3],
      [597.8, 750.8],
      [626.2, 711.9],
      [656.8, 674.2],
      [698.8, 630.3],
      [744.2, 591.8],
      [782.0, 559.6],
      [818.2, 527.6],
    ],
  ],
  [
    "DECEMBER",
    [
      [958.8, 448.2],
      [1001.8, 428.7],
      [1044.9, 411.5],
      [1091.5, 394.2],
      [1151.2, 381.7],
      [1208.0, 367.9],
      [1255.0, 361.2],
      [1304.7, 353.1],
    ],
  ],
] as const;

/**
 * Black-pixel centroids measured from polar-unwrapped day-name sectors in
 * reference-ortho.jpg. Coordinates are in native photo pixels.
 */
const DAY_GLYPH_CENTERS = [
  [
    "SUNDAY",
    [
      [1253.1, 853.4],
      [1307.5, 848.1],
      [1361.5, 838.9],
      [1416.3, 839.9],
      [1471.8, 844.6],
      [1516.5, 850.6],
    ],
  ],
  [
    "MONDAY",
    [
      [1668.4, 931.7],
      [1718.1, 972.3],
      [1758.5, 1009.0],
      [1784.2, 1043.4],
      [1811.6, 1091.5],
      [1842.4, 1144.8],
    ],
  ],
  [
    "TUESDAY",
    [
      [1790.6, 1589.3],
      [1829.6, 1548.1],
      [1846.2, 1497.1],
      [1866.7, 1434.3],
      [1873.3, 1378.7],
      [1875.0, 1314.0],
      [1870.7, 1264.1],
    ],
  ],
  [
    "WEDNESDAY",
    [
      [1443.0, 1817.4],
      [1490.7, 1809.5],
      [1536.0, 1800.2],
      [1577.9, 1783.6],
      [1612.2, 1767.2],
      [1651.3, 1745.1],
      [1686.9, 1720.8],
      [1718.4, 1693.6],
      [1741.8, 1664.8],
    ],
  ],
  [
    "THURSDAY",
    [
      [1040.6, 1680.9],
      [1068.4, 1713.4],
      [1107.5, 1746.4],
      [1154.7, 1765.7],
      [1198.7, 1790.8],
      [1244.9, 1806.9],
      [1291.0, 1817.2],
      [1335.9, 1820.3],
    ],
  ],
  [
    "FRIDAY",
    [
      [899.0, 1309.5],
      [895.9, 1369.4],
      [896.4, 1419.7],
      [907.2, 1463.8],
      [924.7, 1519.7],
      [954.3, 1567.3],
    ],
  ],
  [
    "SATURDAY",
    [
      [914.1, 1174.3],
      [936.7, 1113.8],
      [968.1, 1066.7],
      [982.9, 1040.7],
      [1004.2, 1007.6],
      [1044.0, 969.7],
      [1087.6, 934.4],
      [1119.4, 909.8],
    ],
  ],
] as const;

function averageMonthGlyphRadius() {
  let totalRadius = 0;
  let glyphCount = 0;

  for (const [, centers] of MONTH_GLYPH_CENTERS) {
    for (const [x, y] of centers) {
      totalRadius += Math.hypot(x - CX, y - CY);
      glyphCount += 1;
    }
  }

  return totalRadius / glyphCount;
}

const R_MONTH_GLYPH_GUIDE = averageMonthGlyphRadius();

function averageDayGlyphRadius() {
  let totalRadius = 0;
  let glyphCount = 0;

  for (const [, centers] of DAY_GLYPH_CENTERS) {
    for (const [x, y] of centers) {
      totalRadius += Math.hypot(x - CX, y - CY);
      glyphCount += 1;
    }
  }

  return totalRadius / glyphCount;
}

const R_DAY_GLYPH_GUIDE = averageDayGlyphRadius();

const PHOTO_OPACITY = [1, 0.5, 0] as const;
const PHOTO_LABEL = ["Photo: 100%", "Photo: 50%", "Photo: OFF"] as const;
const REFERENCE_IMAGES = [
  { src: "/reference-ortho-cream.jpg", label: "Reference: 1" },
  { src: "/reference-handless.png", label: "Reference: 2" },
] as const;

type Props = {
  className?: string;
};

type HandKey = "week" | "day" | "hour" | "minute" | "second";

const HAND_OPTIONS: { value: HandKey; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
  { value: "hour", label: "Hour" },
  { value: "minute", label: "Minute" },
  { value: "second", label: "Second" },
];

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

function monthGlyphMarkers() {
  return MONTH_GLYPH_CENTERS.flatMap(([month, centers]) =>
    centers.map(([measuredX, measuredY], index) => {
      const measuredRadius = Math.hypot(measuredX - CX, measuredY - CY);
      const guideScale = R_MONTH_GLYPH_GUIDE / measuredRadius;
      const x = CX + (measuredX - CX) * guideScale;
      const y = CY + (measuredY - CY) * guideScale;
      const rayScale = R_DIAL_EDGE / R_MONTH_GLYPH_GUIDE;
      const rayAngle = (Math.atan2(x - CX, CY - y) * 180) / Math.PI;
      const normalizedRayAngle = (rayAngle + 360) % 360;
      const rotation =
        normalizedRayAngle > 90 && normalizedRayAngle < 270
          ? normalizedRayAngle - 180
          : normalizedRayAngle;

      return {
        month,
        glyph: month[index],
        index,
        x,
        y,
        rayX: CX + (x - CX) * rayScale,
        rayY: CY + (y - CY) * rayScale,
        rotation,
      };
    }),
  );
}

function dayGlyphMarkers() {
  return DAY_GLYPH_CENTERS.flatMap(([day, centers], dayIndex) => {
    const sectorCenter =
      DAY_SECTOR_OFFSET_DEG - DAY_SECTOR_STEP_DEG / 2 + dayIndex * DAY_SECTOR_STEP_DEG;
    const measuredAngles = centers.map(([measuredX, measuredY]) => {
      const normalizedAngle =
        ((Math.atan2(measuredX - CX, CY - measuredY) * 180) / Math.PI + 360) % 360;
      const turnsFromSectorCenter = Math.round((sectorCenter - normalizedAngle) / 360);
      return normalizedAngle + turnsFromSectorCenter * 360;
    });
    const labelCenter =
      measuredAngles.reduce((sum, measuredAngle) => sum + measuredAngle, 0) /
      measuredAngles.length;

    return centers.map((_, index) => {
      const angle =
        labelCenter + (measuredAngles[index] - labelCenter) * DAY_GLYPH_SPACING_SCALE;
      const { x, y } = polarPoint(angle, R_DAY_GLYPH_GUIDE);
      const rayScale = R_DIAL_EDGE / R_DAY_GLYPH_GUIDE;
      const normalizedRayAngle = (angle + 360) % 360;
      const rotation =
        normalizedRayAngle > 90 && normalizedRayAngle < 270
          ? normalizedRayAngle - 180
          : normalizedRayAngle;

      return {
        day,
        glyph: day[index],
        index,
        x,
        y,
        rayX: CX + (x - CX) * rayScale,
        rayY: CY + (y - CY) * rayScale,
        rotation: rotation + (DAY_GLYPH_ROTATION_ADJUSTMENTS[`${day}-${index}`] ?? 0),
      };
    });
  });
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

function handPoint(angleDeg: number, along: number, lateral: number) {
  const angle = (angleDeg * Math.PI) / 180;
  return {
    x: CX + Math.sin(angle) * along + Math.cos(angle) * lateral,
    y: CY - Math.cos(angle) * along + Math.sin(angle) * lateral,
  };
}

function annularSectorPath(angleDeg: number, radius: number, halfThickness: number, halfLength: number) {
  const innerRadius = radius - halfThickness;
  const outerRadius = radius + halfThickness;
  const halfAngleDeg = ((halfLength / radius) * 180) / Math.PI;
  const startAngle = angleDeg - halfAngleDeg;
  const endAngle = angleDeg + halfAngleDeg;
  const outerStart = polarPoint(startAngle, outerRadius);
  const outerEnd = polarPoint(endAngle, outerRadius);
  const innerEnd = polarPoint(endAngle, innerRadius);
  const innerStart = polarPoint(startAngle, innerRadius);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function isoWeekNumber(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
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

function WeekIndicatorHand({ rotation }: { rotation: number }) {
  const headCenter = handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_HEAD_RADIUS, 0);
  const shaft = [
    handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_SHAFT_START_RADIUS, -WEEK_HAND_SHAFT_HALF_WIDTH),
    handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_HEAD_RADIUS, -WEEK_HAND_SHAFT_HALF_WIDTH),
    handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_HEAD_RADIUS, WEEK_HAND_SHAFT_HALF_WIDTH),
    handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_SHAFT_START_RADIUS, WEEK_HAND_SHAFT_HALF_WIDTH),
  ];
  const headPath = annularSectorPath(
    WEEK_HAND_ANGLE_DEG,
    WEEK_HAND_HEAD_RADIUS,
    WEEK_HAND_HEAD_HALF_THICKNESS,
    WEEK_HAND_HEAD_HALF_LENGTH,
  );

  return (
    <g
      data-week-indicator-hand
      transform={`rotate(${rotation} ${CX} ${CY})`}
      opacity={1}
    >
      <defs>
        <linearGradient
          id="week-hand-shaft-gradient"
          gradientUnits="userSpaceOnUse"
          x1={CX}
          y1={CY}
          x2={headCenter.x}
          y2={headCenter.y}
        >
          <stop offset="0%" stopColor="#0d0c08" />
          <stop offset="48%" stopColor="#0e0d09" />
          <stop offset="53%" stopColor="#24201f" />
          <stop offset="56%" stopColor="#2e2b26" />
          <stop offset="100%" stopColor="#312e29" />
        </linearGradient>
        <linearGradient id="week-hand-head-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c33a46" />
          <stop offset="52%" stopColor="#b2303a" />
          <stop offset="100%" stopColor="#8f1d28" />
        </linearGradient>
        <filter id="week-hand-shadow" x="-30%" y="-20%" width="170%" height="160%">
          <feDropShadow dx="5" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.24" />
        </filter>
      </defs>

      <g filter="url(#week-hand-shadow)">
        <path
          d={ptsToPath(shaft)}
          fill="url(#week-hand-shaft-gradient)"
          stroke="#171815"
          strokeWidth={1.44}
        />
        <path
          d={headPath}
          fill="url(#week-hand-head-gradient)"
          stroke="#8f1d28"
          strokeWidth={1.3}
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

function DayIndicatorHand({ rotation }: { rotation: number }) {
  const headCenter = handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_HEAD_RADIUS, 0);
  const shaft = [
    handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_SHAFT_START_RADIUS, -DAY_HAND_SHAFT_HALF_WIDTH),
    handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_HEAD_RADIUS, -DAY_HAND_SHAFT_HALF_WIDTH),
    handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_HEAD_RADIUS, DAY_HAND_SHAFT_HALF_WIDTH),
    handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_SHAFT_START_RADIUS, DAY_HAND_SHAFT_HALF_WIDTH),
  ];
  const headPath = annularSectorPath(
    DAY_HAND_ANGLE_DEG,
    DAY_HAND_HEAD_RADIUS,
    DAY_HAND_HEAD_HALF_THICKNESS,
    DAY_HAND_HEAD_HALF_LENGTH,
  );

  return (
    <g data-day-indicator-hand transform={`rotate(${rotation} ${CX} ${CY})`}>
      <defs>
        <linearGradient
          id="day-hand-shaft-gradient"
          gradientUnits="userSpaceOnUse"
          x1={CX}
          y1={CY}
          x2={headCenter.x}
          y2={headCenter.y}
        >
          <stop offset="0%" stopColor="#29282b" />
          <stop offset="23%" stopColor="#4a4947" />
          <stop offset="100%" stopColor="#4c4b48" />
        </linearGradient>
        <linearGradient id="day-hand-head-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bc3d47" />
          <stop offset="52%" stopColor="#ac353e" />
          <stop offset="100%" stopColor="#8e2530" />
        </linearGradient>
        <filter id="day-hand-shadow" x="-30%" y="-20%" width="170%" height="160%">
          <feDropShadow dx="5" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.24" />
        </filter>
      </defs>

      <g filter="url(#day-hand-shadow)">
        <path
          d={ptsToPath(shaft)}
          fill="url(#day-hand-shaft-gradient)"
          stroke="#363633"
          strokeWidth={1.4}
        />
        <path
          d={headPath}
          fill="url(#day-hand-head-gradient)"
          stroke="#8e2530"
          strokeWidth={1.3}
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

function HourHand({ rotation }: { rotation: number }) {
  const rear = handPoint(HOUR_HAND_ANGLE_DEG, HOUR_HAND_REAR_RADIUS, 0);
  const lightBase = handPoint(HOUR_HAND_ANGLE_DEG, HOUR_HAND_BASE_RADIUS, HOUR_HAND_HALF_WIDTH);
  const tipCenter = handPoint(HOUR_HAND_ANGLE_DEG, HOUR_HAND_TIP_RADIUS, 0);
  const lightTip = handPoint(HOUR_HAND_ANGLE_DEG, HOUR_HAND_TIP_RADIUS, HOUR_HAND_TIP_HALF_WIDTH);
  const darkTip = handPoint(HOUR_HAND_ANGLE_DEG, HOUR_HAND_TIP_RADIUS, -HOUR_HAND_TIP_HALF_WIDTH);
  const darkBase = handPoint(HOUR_HAND_ANGLE_DEG, HOUR_HAND_BASE_RADIUS, -HOUR_HAND_HALF_WIDTH);

  return (
    <g data-hour-hand transform={`rotate(${rotation} ${CX} ${CY})`} opacity={0.92}>
      <defs>
        <linearGradient id="hour-light-facet" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#777874" />
          <stop offset="60%" stopColor="#8f908c" />
          <stop offset="100%" stopColor="#aaaBA7" />
        </linearGradient>
        <linearGradient id="hour-dark-facet" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#292a28" />
          <stop offset="65%" stopColor="#20211f" />
          <stop offset="100%" stopColor="#111210" />
        </linearGradient>
        <filter id="hour-hand-shadow" x="-30%" y="-30%" width="170%" height="170%">
          <feDropShadow dx="5" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter="url(#hour-hand-shadow)">
        <path
          d={ptsToPath([rear, lightBase, lightTip, tipCenter])}
          fill="url(#hour-light-facet)"
          stroke="#565753"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d={ptsToPath([rear, tipCenter, darkTip, darkBase])}
          fill="url(#hour-dark-facet)"
          stroke="#181917"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <line
          x1={rear.x}
          y1={rear.y}
          x2={tipCenter.x}
          y2={tipCenter.y}
          stroke="#50514e"
          strokeWidth={2}
          opacity={0.8}
        />
      </g>
    </g>
  );
}

function MinuteHand({ rotation }: { rotation: number }) {
  const rear = handPoint(MINUTE_HAND_ANGLE_DEG, MINUTE_HAND_REAR_RADIUS, 0);
  const upperBase = handPoint(MINUTE_HAND_ANGLE_DEG, MINUTE_HAND_BASE_RADIUS, -MINUTE_HAND_HALF_WIDTH);
  const tip = handPoint(MINUTE_HAND_ANGLE_DEG, MINUTE_HAND_TIP_RADIUS, 0);
  const lowerBase = handPoint(MINUTE_HAND_ANGLE_DEG, MINUTE_HAND_BASE_RADIUS, MINUTE_HAND_HALF_WIDTH);

  return (
    <g data-minute-hand transform={`rotate(${rotation} ${CX} ${CY})`} opacity={0.92}>
      <defs>
        <linearGradient id="minute-upper-facet" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#757672" />
          <stop offset="62%" stopColor="#8e8f8b" />
          <stop offset="100%" stopColor="#b0b1ad" />
        </linearGradient>
        <linearGradient id="minute-lower-facet" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2a2b29" />
          <stop offset="65%" stopColor="#20211f" />
          <stop offset="100%" stopColor="#111210" />
        </linearGradient>
        <filter id="minute-hand-shadow" x="-20%" y="-20%" width="150%" height="160%">
          <feDropShadow dx="5" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      <g filter="url(#minute-hand-shadow)">
        <path
          d={ptsToPath([rear, upperBase, tip])}
          fill="url(#minute-upper-facet)"
          stroke="#565753"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path
          d={ptsToPath([rear, tip, lowerBase])}
          fill="url(#minute-lower-facet)"
          stroke="#181917"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <line
          x1={rear.x}
          y1={rear.y}
          x2={tip.x}
          y2={tip.y}
          stroke="#50514e"
          strokeWidth={2}
          opacity={0.8}
        />
      </g>
    </g>
  );
}

function SecondsHand({ rotation }: { rotation: number }) {
  const upperBlade = [
    { x: CX - SECOND_HAND_TIP_HALF_W, y: SECOND_HAND_TIP_Y },
    { x: CX + SECOND_HAND_TIP_HALF_W, y: SECOND_HAND_TIP_Y },
    { x: CX + SECOND_HAND_NECK_HALF_W, y: SECOND_HAND_NECK_Y },
    { x: CX - SECOND_HAND_NECK_HALF_W, y: SECOND_HAND_NECK_Y },
  ];
  const counterweight = [
    { x: CX - SECOND_HAND_TAIL_SHOULDER_HALF_W, y: SECOND_HAND_TAIL_SHOULDER_Y },
    { x: CX + SECOND_HAND_TAIL_SHOULDER_HALF_W, y: SECOND_HAND_TAIL_SHOULDER_Y },
    { x: CX + SECOND_HAND_TAIL_END_HALF_W, y: SECOND_HAND_TAIL_END_Y },
    { x: CX, y: SECOND_HAND_TAIL_POINT_Y },
    { x: CX - SECOND_HAND_TAIL_END_HALF_W, y: SECOND_HAND_TAIL_END_Y },
  ];

  return (
    <g data-seconds-hand transform={`rotate(${rotation} ${CX} ${CY})`} opacity={0.92}>
      <defs>
        <linearGradient id="seconds-tail-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#62635f" />
          <stop offset="48%" stopColor="#383936" />
          <stop offset="100%" stopColor="#090a09" />
        </linearGradient>
        <radialGradient id="seconds-hub-gradient" cx="42%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#a6a7a3" />
          <stop offset="58%" stopColor="#777874" />
          <stop offset="100%" stopColor="#575854" />
        </radialGradient>
        <radialGradient id="seconds-pin-gradient" cx="38%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="28%" stopColor="#d7d8d5" />
          <stop offset="62%" stopColor="#777975" />
          <stop offset="100%" stopColor="#242522" />
        </radialGradient>
        <filter id="seconds-hand-shadow" x="-30%" y="-10%" width="170%" height="130%">
          <feDropShadow dx="5" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.24" />
        </filter>
      </defs>

      <g filter="url(#seconds-hand-shadow)">
        <path
          d={ptsToPath(counterweight)}
          fill="url(#seconds-tail-gradient)"
          stroke="#555651"
          strokeWidth={1.5}
        />
        <path
          d={ptsToPath(upperBlade)}
          fill="#858681"
          stroke="#666762"
          strokeWidth={1.728}
        />
        <circle
          cx={CX}
          cy={CY}
          r={SECOND_HAND_HUB_RADIUS}
          fill="url(#seconds-hub-gradient)"
          stroke="#565753"
          strokeWidth={4}
        />
        <circle cx={CX} cy={CY} r={15} fill="#343532" />
        <circle
          cx={CX}
          cy={CY}
          r={10}
          fill="url(#seconds-pin-gradient)"
          stroke="#20211f"
          strokeWidth={2}
        />
        <circle cx={CX - 3} cy={CY - 4} r={3.5} fill="#ffffff" opacity={0.82} />
      </g>
    </g>
  );
}

export function WeeklyCalendarWatch({ className = "" }: Props) {
  const [opacityIdx, setOpacityIdx] = useState(0);
  const [referenceIdx, setReferenceIdx] = useState(0);
  const [drawVisible, setDrawVisible] = useState(true);
  const [guidesVisible, setGuidesVisible] = useState(true);
  const [handsVisible, setHandsVisible] = useState(true);
  const [weekHandVisible, setWeekHandVisible] = useState(true);
  const [dayHandVisible, setDayHandVisible] = useState(true);
  const [hourHandVisible, setHourHandVisible] = useState(true);
  const [minuteHandVisible, setMinuteHandVisible] = useState(true);
  const [secondsHandVisible, setSecondsHandVisible] = useState(true);
  const [selectedHand, setSelectedHand] = useState<HandKey>("second");
  const [manualHandAngles, setManualHandAngles] = useState<Partial<Record<HandKey, number>>>({});
  const [clockTimeMs, setClockTimeMs] = useState<number | null>(null);
  const [timeRunning, setTimeRunning] = useState(true);

  useEffect(() => {
    if (!timeRunning) return;

    let timerId: number;

    const advanceSecondsHand = () => {
      const now = Date.now();
      setClockTimeMs(now);

      const nextTickDelay = SECOND_HAND_TICK_MS - (now % SECOND_HAND_TICK_MS);
      timerId = window.setTimeout(advanceSecondsHand, nextTickDelay);
    };

    advanceSecondsHand();
    return () => window.clearTimeout(timerId);
  }, [timeRunning]);

  const clockTime = clockTimeMs === null ? null : new Date(clockTimeMs);
  const secondsWithMilliseconds =
    clockTime === null ? 0 : clockTime.getSeconds() + clockTime.getMilliseconds() / 1000;
  const secondsHandRotation =
    clockTimeMs === null
      ? 0
      : Math.floor((clockTimeMs % 60_000) / SECOND_HAND_TICK_MS) * SECOND_HAND_DEGREES_PER_TICK;
  const minuteHandAngle =
    clockTime === null ? MINUTE_HAND_ANGLE_DEG : (clockTime.getMinutes() + secondsWithMilliseconds / 60) * 6;
  const hourHandAngle =
    clockTime === null
      ? HOUR_HAND_ANGLE_DEG
      : ((clockTime.getHours() % 12) + clockTime.getMinutes() / 60 + secondsWithMilliseconds / 3600) * 30;
  const currentWeek = clockTime === null ? WEEK_HAND_REFERENCE_WEEK : isoWeekNumber(clockTime);
  const weekHandAngle = WEEK_OFFSET_DEG + (currentWeek - 1) * WEEK_STEP_DEG;
  const currentDay = clockTime === null ? DAY_HAND_REFERENCE_DAY : clockTime.getDay();
  const dayHandAngle = DAY_SECTOR_OFFSET_DEG - DAY_SECTOR_STEP_DEG / 2 + currentDay * DAY_SECTOR_STEP_DEG;
  const liveHandAngles: Record<HandKey, number> = {
    week: weekHandAngle,
    day: dayHandAngle,
    hour: hourHandAngle,
    minute: minuteHandAngle,
    second: secondsHandRotation,
  };
  const effectiveHandAngle = (hand: HandKey) => manualHandAngles[hand] ?? liveHandAngles[hand];
  const selectedHandAngle =
    manualHandAngles[selectedHand] ??
    ((liveHandAngles[selectedHand] % 360) + 360) % 360;
  const weekHandRotation = effectiveHandAngle("week") - WEEK_HAND_ANGLE_DEG;
  const dayHandRotation = effectiveHandAngle("day") - DAY_HAND_ANGLE_DEG;
  const hourHandRotation = effectiveHandAngle("hour") - HOUR_HAND_ANGLE_DEG;
  const minuteHandRotation = effectiveHandAngle("minute") - MINUTE_HAND_ANGLE_DEG;
  const displayedSecondsHandRotation = effectiveHandAngle("second");

  const referenceImage = REFERENCE_IMAGES[referenceIdx];
  const photoOpacity = PHOTO_OPACITY[opacityIdx];
  const monthSectors = monthSectorLines();
  const daySectors = daySectorLines();
  const weekSectors = weekSectorLines();
  const wDots = weekDots();
  const digitMarkers = weekDigitMarkers();
  const monthMarkers = monthGlyphMarkers();
  const dayMarkers = dayGlyphMarkers();
  const guideMarkers = [
    ...digitMarkers.map((marker) => ({
      key: `week-${marker.week}-${marker.index}`,
      ...marker,
      radius: GLYPH_GUIDE_CIRCLE_RADIUS,
    })),
    ...monthMarkers.map((marker) => ({
      key: `month-${marker.month}-${marker.index}`,
      ...marker,
      radius: GLYPH_GUIDE_CIRCLE_RADIUS,
    })),
    ...dayMarkers.map((marker) => ({
      key: `day-${marker.day}-${marker.index}`,
      ...marker,
      radius: GLYPH_GUIDE_CIRCLE_RADIUS,
    })),
  ];
  const mDots = minuteDots();

  const toggleTimeRunning = () => {
    if (timeRunning) {
      setTimeRunning(false);
      return;
    }

    setManualHandAngles({});
    setClockTimeMs(Date.now());
    setTimeRunning(true);
  };

  const returnSelectedHandToLive = () => {
    setManualHandAngles((angles) => {
      const nextAngles = { ...angles };
      delete nextAngles[selectedHand];
      return nextAngles;
    });
    setClockTimeMs(Date.now());
    setTimeRunning(true);
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="fixed left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-black/20 bg-white/90 p-2 shadow-lg backdrop-blur">
        <label htmlFor="hand-selector" className="pl-2 text-sm font-semibold text-black">
          Hand
        </label>
        <select
          id="hand-selector"
          value={selectedHand}
          onChange={(event) => setSelectedHand(event.target.value as HandKey)}
          className="rounded-lg border border-black/30 bg-white px-3 py-2 text-sm font-semibold text-black"
        >
          {HAND_OPTIONS.map((hand) => (
            <option key={hand.value} value={hand.value}>
              {hand.label}
            </option>
          ))}
        </select>
        <output className="min-w-14 text-right text-sm font-semibold tabular-nums text-black">
          {selectedHandAngle.toFixed(1)}°
        </output>
        <button
          type="button"
          aria-pressed={!timeRunning}
          onClick={toggleTimeRunning}
          className="rounded-lg border border-black/30 bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-zinc-100"
        >
          {timeRunning ? "Pause" : "Continue"}
        </button>
        <button
          type="button"
          disabled={manualHandAngles[selectedHand] === undefined}
          onClick={returnSelectedHandToLive}
          className="rounded-lg border border-black/30 bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-zinc-100 disabled:cursor-default disabled:opacity-40"
        >
          Live
        </button>
      </div>

      <div className="fixed bottom-3 right-3 top-3 z-30 flex w-12 flex-col items-center gap-1 rounded-xl border border-black/20 bg-white/90 py-2 shadow-lg backdrop-blur">
        <span className="text-xs font-semibold tabular-nums text-black">0°</span>
        <input
          type="range"
          min={0}
          max={360}
          step={0.1}
          value={selectedHandAngle}
          aria-label={`Rotate ${selectedHand} hand`}
          onChange={(event) => {
            const angle = Number(event.target.value);
            setManualHandAngles((angles) => ({ ...angles, [selectedHand]: angle }));
          }}
          className="min-h-0 w-7 flex-1 cursor-pointer accent-black"
          style={{ writingMode: "vertical-lr" }}
        />
        <span className="text-xs font-semibold tabular-nums text-black">360°</span>
      </div>

      <div className="relative w-full">
        <img
          src={referenceImage.src}
          alt={`${referenceImage.label} weekly calendar dial`}
          className="block h-auto w-full select-none transition-opacity duration-200"
          style={{ opacity: photoOpacity }}
          draggable={false}
        />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-200"
          viewBox={`0 0 ${IMG_W} ${IMG_H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <g
            className="transition-opacity duration-200"
            style={{ opacity: drawVisible ? 1 : 0 }}
          >
          <circle cx={CX} cy={CY} r={R_DIAL_EDGE} fill="none" stroke={MAGENTA} strokeWidth={DIAL_STROKE_WIDTH} />
          <circle cx={CX} cy={CY} r={R_WEEK_OUT} fill="none" stroke={MAGENTA} strokeWidth={DIAL_STROKE_WIDTH} />
          <circle cx={CX} cy={CY} r={R_WEEK_IN} fill="none" stroke={MAGENTA} strokeWidth={DIAL_STROKE_WIDTH} />

          {monthSectors.map((s, i) => (
            <line
              key={`m${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={MAGENTA}
              strokeWidth={DIAL_STROKE_WIDTH}
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
              strokeWidth={DIAL_STROKE_WIDTH}
              strokeLinecap="butt"
            />
          ))}

          {wDots.map((p, i) => (
            <circle
              key={`wd${i}`}
              cx={p.x}
              cy={p.y}
              r={WEEK_DOT_RADIUS}
              fill={MAGENTA}
              stroke={MAGENTA}
              strokeWidth={DIAL_STROKE_WIDTH}
            />
          ))}

          {mDots.map((p, i) => (
            <circle key={`md${i}`} cx={p.x} cy={p.y} r={MINUTE_DOT_RADIUS} fill={ORANGE} />
          ))}

          <circle cx={CX} cy={CY} r={R_DAY_OUT} fill="none" stroke={CYAN} strokeWidth={DIAL_STROKE_WIDTH} />
          <circle cx={CX} cy={CY} r={R_DAY_IN} fill="none" stroke={CYAN} strokeWidth={DIAL_STROKE_WIDTH} />

          {daySectors.map((s, i) => (
            <line
              key={`day${i}`}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={CYAN}
              strokeWidth={DIAL_STROKE_WIDTH}
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
              fill="#000000"
              fontFamily="'Indie Flower', cursive"
              fontSize={WEEK_DIGIT_FONT_SIZE * marker.scale}
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {marker.digit}
            </text>
          ))}

          {monthMarkers.map((marker) => (
            <text
              key={`month-glyph-${marker.month}-${marker.index}`}
              x={marker.x}
              y={marker.y}
              transform={`rotate(${marker.rotation} ${marker.x} ${marker.y})`}
              fill="#000000"
              fontFamily="'Indie Flower', cursive"
              fontSize={MONTH_GLYPH_FONT_SIZE}
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {marker.glyph.toUpperCase()}
            </text>
          ))}

          {dayMarkers.map((marker) => (
            <text
              key={`day-glyph-${marker.day}-${marker.index}`}
              x={marker.x}
              y={marker.y}
              transform={`rotate(${marker.rotation} ${marker.x} ${marker.y})`}
              fill="#000000"
              fontFamily="'Indie Flower', cursive"
              fontSize={DAY_GLYPH_FONT_SIZE}
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {marker.glyph.toUpperCase()}
            </text>
          ))}

          <circle cx={CX} cy={CY} r={37} fill="#000000" />
          <circle cx={CX} cy={CY} r={7} fill="#000000" stroke="#000000" strokeWidth={DIAL_STROKE_WIDTH} />

          <circle cx={CX} cy={CY} r={10} fill="#000000" stroke="#000000" strokeWidth={DIAL_STROKE_WIDTH} />
          </g>
          <g
            className="transition-opacity duration-200"
            style={{ opacity: handsVisible ? 1 : 0 }}
          >
            {dayHandVisible && <DayIndicatorHand rotation={dayHandRotation} />}
            {weekHandVisible && <WeekIndicatorHand rotation={weekHandRotation} />}
            {hourHandVisible && <HourHand rotation={hourHandRotation} />}
            {minuteHandVisible && <MinuteHand rotation={minuteHandRotation} />}
              {secondsHandVisible && <SecondsHand rotation={displayedSecondsHandRotation} />}
          </g>
        </svg>

        {/* Calibrated center guides for every week digit, month letter, and day letter. */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${IMG_W} ${IMG_H}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
          style={{ opacity: guidesVisible ? 1 : 0 }}
        >
          {guideMarkers.map((marker) => (
            <g key={`ray-${marker.key}`} opacity={0.72}>
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

          {guideMarkers.map((marker) => (
            <g key={marker.key}>
              <circle
                cx={marker.x}
                cy={marker.y}
                r={marker.radius + 5}
                fill="none"
                stroke="#000000"
                strokeWidth={8}
              />
              <circle
                cx={marker.x}
                cy={marker.y}
                r={marker.radius}
                fill="none"
                stroke="#00ff00"
                strokeWidth={5}
              />
            </g>
          ))}
        </svg>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
          type="button"
          onClick={() => setOpacityIdx((i) => (i + 1) % PHOTO_OPACITY.length)}
          className="shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {PHOTO_LABEL[opacityIdx]}
        </button>
        <button
          type="button"
          onClick={() => setReferenceIdx((index) => (index + 1) % REFERENCE_IMAGES.length)}
          className="shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {referenceImage.label}
        </button>
        <button
          type="button"
          onClick={() => setDrawVisible((v) => !v)}
          className="shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {drawVisible ? "Drawing: ON" : "Drawing: OFF"}
        </button>
        <button
          type="button"
          onClick={() => setGuidesVisible((visible) => !visible)}
          className="shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {guidesVisible ? "Guides: ON" : "Guides: OFF"}
        </button>
        <button
          type="button"
          aria-pressed={handsVisible}
          onClick={() => setHandsVisible((visible) => !visible)}
          className="shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {handsVisible ? "Hands: ON" : "Hands: OFF"}
        </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
          type="button"
          aria-pressed={weekHandVisible}
          onClick={() => setWeekHandVisible((visible) => !visible)}
          className="shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {weekHandVisible ? "Week: ON" : "Week: OFF"}
        </button>
        <button
          type="button"
          aria-pressed={dayHandVisible}
          onClick={() => setDayHandVisible((visible) => !visible)}
          className="shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {dayHandVisible ? "Day: ON" : "Day: OFF"}
        </button>
        <button
          type="button"
          aria-pressed={hourHandVisible}
          onClick={() => setHourHandVisible((visible) => !visible)}
          className="shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {hourHandVisible ? "Hour: ON" : "Hour: OFF"}
        </button>
        <button
          type="button"
          aria-pressed={minuteHandVisible}
          onClick={() => setMinuteHandVisible((visible) => !visible)}
          className="shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {minuteHandVisible ? "Minute: ON" : "Minute: OFF"}
        </button>
        <button
          type="button"
          aria-pressed={secondsHandVisible}
          onClick={() => setSecondsHandVisible((visible) => !visible)}
          className="shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
        >
          {secondsHandVisible ? "Second: ON" : "Second: OFF"}
        </button>
        </div>
      </div>
    </div>
  );
}
