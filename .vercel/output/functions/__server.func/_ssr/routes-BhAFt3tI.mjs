import { r as __toESM } from "../_runtime.mjs";
import { M as require_react, h as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as Vector3, C as PerspectiveCamera, D as Scene, E as SRGBColorSpace, O as Shape, S as MeshStandardMaterial, T as RingGeometry, _ as LineBasicMaterial, a as BoxGeometry, b as MeshBasicMaterial, c as CircleGeometry, d as DirectionalLight, f as EdgesGeometry, g as Line, h as Group, i as ArrowHelper, k as TextureLoader, l as Color, m as Float32BufferAttribute, n as PMREMGenerator, o as BufferGeometry, p as ExtrudeGeometry, r as WebGLRenderer, s as CanvasTexture, t as TrackballControls, u as CylinderGeometry, v as LineSegments, w as PlaneGeometry, x as MeshPhysicalMaterial, y as Mesh } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BhAFt3tI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function isoWeekCoordinates(date) {
	const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNumber = target.getUTCDay() || 7;
	target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
	const year = target.getUTCFullYear();
	const yearStart = new Date(Date.UTC(year, 0, 1));
	return {
		week: Math.ceil(((target.getTime() - yearStart.getTime()) / 864e5 + 1) / 7),
		year
	};
}
function continuousIsoWeek(date, anchorIsoWeekYear, weekCount) {
	const isoWeek = isoWeekCoordinates(date);
	return isoWeek.week + (isoWeek.year - anchorIsoWeekYear) * weekCount;
}
function localCalendarDayOrdinal(date) {
	return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 864e5);
}
function calendarMonthOrdinal(date) {
	return date.getFullYear() * 12 + date.getMonth();
}
function unwrapCyclicAngles(angles) {
	let previous = Number.NEGATIVE_INFINITY;
	return angles.map((angle) => {
		let unwrapped = angle;
		while (unwrapped <= previous) unwrapped += 360;
		previous = unwrapped;
		return unwrapped;
	});
}
function continuousDateWheelAngle(date, anchorMonthOrdinal, unwrappedDayAngles) {
	const monthTurns = calendarMonthOrdinal(date) - anchorMonthOrdinal;
	return unwrappedDayAngles[date.getDate() - 1] + monthTurns * 360;
}
function subtract3(a, b) {
	return {
		x: a.x - b.x,
		y: a.y - b.y,
		z: a.z - b.z
	};
}
function cross3(a, b) {
	return {
		x: a.y * b.z - a.z * b.y,
		y: a.z * b.x - a.x * b.z,
		z: a.x * b.y - a.y * b.x
	};
}
function dot3(a, b) {
	return a.x * b.x + a.y * b.y + a.z * b.z;
}
function normalize3(vector) {
	const length = Math.hypot(vector.x, vector.y, vector.z) || 1;
	return {
		x: vector.x / length,
		y: vector.y / length,
		z: vector.z / length
	};
}
function faceNormal(a, b, c) {
	return normalize3(cross3(subtract3(b, a), subtract3(c, a)));
}
function rotateVector(vector, angle) {
	const radians = angle * Math.PI / 180;
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return {
		x: vector.x * cos - vector.y * sin,
		y: vector.x * sin + vector.y * cos,
		z: vector.z
	};
}
function averagePoints(points) {
	const count = points.length;
	return points.reduce((sum, point) => ({
		x: sum.x + point.x / count,
		y: sum.y + point.y / count,
		z: sum.z + point.z / count
	}), {
		x: 0,
		y: 0,
		z: 0
	});
}
function planeHeightAt(a, b, c, x, y) {
	const normal = cross3(subtract3(b, a), subtract3(c, a));
	if (Math.abs(normal.z) < 1e-8) return a.z;
	return a.z - (normal.x * (x - a.x) + normal.y * (y - a.y)) / normal.z;
}
function srgbToLinear(channel) {
	const normalized = channel / 255;
	return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
}
function linearToSrgb(channel) {
	const normalized = channel <= .0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - .055;
	return Math.round(Math.min(1, Math.max(0, normalized)) * 255);
}
function toneMap(channel) {
	return 1 - Math.exp(-Math.max(0, channel) * 1.6);
}
var BLACKENED_WHITE_GOLD = {
	baseColor: [
		10,
		11,
		10
	],
	environmentStrength: .7,
	areaSpecularStrength: .3,
	highlightExponent: 5,
	strokeScale: .45
};
var DEEP_BLACK_PVD = {
	baseColor: [
		3,
		4,
		3
	],
	environmentStrength: .5,
	areaSpecularStrength: .018,
	highlightExponent: 5,
	strokeScale: .45
};
var POLISHED_BLACK_PVD = {
	baseColor: [
		3,
		4,
		3
	],
	environmentStrength: .5,
	areaSpecularStrength: .35,
	highlightExponent: 64,
	strokeScale: .45,
	facingReflectionStrength: .3
};
var GLOSSY_RED_PAINT = {
	baseColor: [
		155,
		18,
		30
	],
	ambientStrength: .55,
	diffuseStrength: .55,
	specularStrength: .18,
	highlightExponent: 26
};
function shadeMetalFacet(normal, center, lightPosition, lightBrightness, material = BLACKENED_WHITE_GOLD) {
	const toLight = normalize3(subtract3(lightPosition, center));
	const lightVisibility = Math.max(0, dot3(normal, toLight));
	const halfVector = normalize3({
		x: toLight.x,
		y: toLight.y,
		z: toLight.z + 1
	});
	const areaHighlight = Math.pow(Math.max(0, dot3(normal, halfVector)), material.highlightExponent) * lightVisibility * material.areaSpecularStrength * Math.max(0, lightBrightness);
	const facingReflection = Math.pow(lightVisibility, 4) * Math.hypot(toLight.x, toLight.y) * (material.facingReflectionStrength ?? 0) * Math.max(0, lightBrightness);
	const channels = material.baseColor.map((channel) => linearToSrgb(toneMap(srgbToLinear(channel) * material.environmentStrength + areaHighlight + facingReflection)));
	return {
		fill: `rgb(${channels[0]} ${channels[1]} ${channels[2]})`,
		stroke: `rgb(${Math.round(channels[0] * material.strokeScale)} ${Math.round(channels[1] * material.strokeScale)} ${Math.round(channels[2] * material.strokeScale)})`
	};
}
function shadeGlossyPaintFacet(normal, center, lightPosition, lightBrightness, material = GLOSSY_RED_PAINT) {
	const toLight = normalize3(subtract3(lightPosition, center));
	const lightVisibility = Math.max(0, dot3(normal, toLight));
	const halfVector = normalize3({
		x: toLight.x,
		y: toLight.y,
		z: toLight.z + 1
	});
	const brightness = Math.max(0, lightBrightness);
	const pigmentLevel = material.ambientStrength + material.diffuseStrength * lightVisibility * brightness;
	const specular = Math.pow(Math.max(0, dot3(normal, halfVector)), material.highlightExponent) * material.specularStrength * brightness * lightVisibility;
	const channels = material.baseColor.map((channel) => linearToSrgb(toneMap(srgbToLinear(channel) * pigmentLevel + specular)));
	return {
		fill: `rgb(${channels[0]} ${channels[1]} ${channels[2]})`,
		stroke: `rgb(${Math.round(channels[0] * .46)} ${Math.round(channels[1] * .46)} ${Math.round(channels[2] * .46)})`
	};
}
function dateWindowLightModel(position, brightness, settings) {
	const horizontalLength = Math.hypot(position.u, position.v);
	const lightHeight = Math.sqrt(Math.max(0, 1 - horizontalLength ** 2));
	const lightX = horizontalLength > 1e-6 ? position.u / horizontalLength : 0;
	const lightY = horizontalLength > 1e-6 ? position.v / horizontalLength : 0;
	const pointLightStrength = Math.min(1, Math.max(0, brightness / 2));
	const shadowSlope = horizontalLength / Math.max(.12, lightHeight);
	return {
		castDistance: settings.castDistance * Math.min(2.5, shadowSlope),
		castOpacity: Math.min(.8, .24 * settings.castStrength * pointLightStrength * (.55 + Math.min(1, shadowSlope) * .45)),
		lightHeight,
		lightX,
		lightY,
		pointLightStrength
	};
}
/**
* Orthographic reference with track circles + sector lines + hour batons.
*
* Center: (1381, 1331)
*/
var IMG_W = 2911;
var IMG_H = 2683;
var CX = 1381;
var CY = 1331;
var R_DAY_IN = 442;
var R_DAY_OUT = 547;
var R_MINUTE = 787;
var MINUTE_OFFSET_DEG = 5.7;
var MINUTE_STEP_DEG = 6;
var MINUTE_DOT_RADIUS = 9;
var R_WEEK_IN = 826;
var R_WEEK_OUT = 928;
var R_DIAL_EDGE = 1030;
var DATE_RING_DEFAULT_RADIUS = 826.868626390606;
var DATE_RING_OPACITY = 1;
/** Calibrated date-ring center offset in rendered pixels. */
var DATE_RING_OFFSET_X = -3;
var DATE_RING_OFFSET_Y = 1;
var DATE_WHEEL_CALIBRATION = {
	dayCount: 31,
	initialDay: 1,
	measuredStepDeg: 11.64,
	idealStepDeg: 360 / 31,
	dayOneAngleDeg: 86.3,
	measuredAnglesDeg: [
		86.3,
		97.8,
		109.8,
		121.8,
		133.8,
		145.3,
		156.9,
		168.8,
		180.8,
		192.5,
		204,
		215.5,
		227.2,
		238.7,
		250.1,
		261.8,
		273,
		284.7,
		296,
		307.5,
		319,
		330.4,
		341.9,
		353.5,
		4.9,
		16.6,
		28,
		39.7,
		51.4,
		62.9,
		74.5
	]
};
var DATE_WHEEL_UNWRAPPED_ANGLES = unwrapCyclicAngles(DATE_WHEEL_CALIBRATION.measuredAnglesDeg);
var SHADOW_CROP_X = 1999;
var SHADOW_CROP_Y = 1245;
var SHADOW_CROP_WIDTH = 200;
var SHADOW_CROP_HEIGHT = 165;
var DATE_WINDOW_CLIP_LEFT = 2017;
var DATE_WINDOW_CLIP_TOP = 1264;
var DATE_WINDOW_CLIP_RIGHT = 2181;
var DATE_WINDOW_CLIP_BOTTOM = 1394;
var DATE_WINDOW_OUTER_LEFT = 2010;
var DATE_WINDOW_OUTER_TOP = 1256;
var DATE_WINDOW_OUTER_RIGHT = 2188;
var DATE_WINDOW_OUTER_BOTTOM = 1400;
var WEEK_COUNT = 53;
var WEEK_STEP_DEG = 360 / WEEK_COUNT;
var WEEK_OFFSET_DEG = 6.5;
/** Hour baton geometry (photo px). */
var R_BATON_OUT = 799;
var R_BATON_IN = 616;
/**
* Diamond radii re-measured from perpendicular macro photography (Aug 2026),
* re-opening the earlier 647/588 estimates: the real facet is a perfect
* square rotated 45° — the pointy arrow corner is exactly 90°, so tip and
* ridge-end each sit one half-width (24px) from the side-corner line.
*/
var R_BATON_IN_APEX = 640;
var R_BATON_IN_APEX_MIRROR = 592;
var BATON_HALF_W = 24;
/**
* Outer ground facet: a right-angle isosceles triangle — exactly half of the
* 48×48 diamond square, so its apex matches the arrow's 90° point (Aug 2026).
*/
var BATON_OUTER_END_DEPTH = 24;
var BATON_12_LATERAL = 30;
/** Seconds-hand geometry measured from the orthographic reference. */
var SECOND_HAND_TIP_Y = 536;
var SECOND_HAND_NECK_Y = 1287;
var SECOND_HAND_TIP_HALF_W = 3.84912;
var SECOND_HAND_NECK_HALF_W = 6.29856;
var SECOND_HAND_HUB_RADIUS = 41.36;
var SECOND_HAND_TAIL_SHOULDER_Y = 1358;
var SECOND_HAND_TAIL_END_Y = 1618;
var SECOND_HAND_TAIL_POINT_Y = 1643;
var SECOND_HAND_TAIL_SHOULDER_HALF_W = 13.5;
var SECOND_HAND_TAIL_END_HALF_W = 27;
var SECOND_HAND_TICKS_PER_SECOND = 8;
var SECOND_HAND_TICK_MS = 1e3 / SECOND_HAND_TICKS_PER_SECOND;
var SECOND_HAND_DEGREES_PER_TICK = 6 / SECOND_HAND_TICKS_PER_SECOND;
/** Minute-hand geometry measured from the orthographic reference. */
var MINUTE_HAND_ANGLE_DEG = 56.85;
var MINUTE_HAND_TIP_RADIUS = 786;
var MINUTE_HAND_REAR_RADIUS = -105;
var MINUTE_HAND_BASE_RADIUS = -25;
var MINUTE_HAND_HALF_WIDTH = 60;
var MINUTE_HAND_PRISM_HEIGHT = 26;
/** Hour-hand geometry measured from the reference and traced silhouette. */
var HOUR_HAND_ANGLE_DEG = -55.2;
var HOUR_HAND_TIP_RADIUS = 510;
var HOUR_HAND_REAR_RADIUS = -125;
var HOUR_HAND_BASE_RADIUS = -15;
var HOUR_HAND_HALF_WIDTH = 72;
var HOUR_HAND_TIP_HALF_WIDTH = 3;
var HOUR_HAND_PRISM_HEIGHT = 30;
/** Week/month hammer-hand geometry measured from the reference. */
var WEEK_HAND_REFERENCE_WEEK = 33;
var WEEK_HAND_ANGLE_DEG = 223.85849056603774;
var WEEK_HAND_HEAD_RADIUS = 818;
var WEEK_HAND_SHAFT_START_RADIUS = 25;
var WEEK_HAND_SHAFT_HALF_WIDTH = 6.48;
var WEEK_HAND_HEAD_HALF_LENGTH = 57;
var WEEK_HAND_HEAD_HALF_THICKNESS = 11.7;
var SINGLE_BATON_HOURS = [
	1,
	2,
	4,
	5,
	6,
	7,
	8,
	9,
	10,
	11
];
var MINUTE_SKIP = /* @__PURE__ */ new Set([
	4,
	9,
	14,
	19,
	24,
	29,
	34,
	39,
	44,
	49,
	54,
	59,
	13,
	15
]);
var MAGENTA = "#000000";
var CYAN = "#000000";
var ORANGE = "#000000";
var DIAL_STROKE_WIDTH = 9;
var R_WEEK_DOT = 1754 / 2;
var WEEK_DOT_RADIUS = 14.36848875;
var MONTH_SECTOR_OFFSET_DEG = 29.75;
var DAY_SECTOR_OFFSET_DEG = 25.2;
var DAY_SECTOR_STEP_DEG = 360 / 7;
/** Day-of-week hammer-hand geometry measured from the reference. */
var DAY_HAND_REFERENCE_DAY = 3;
var DAY_HAND_ANGLE_DEG = 153.77142857142857;
var DAY_HAND_HEAD_RADIUS = 432;
var DAY_HAND_SHAFT_START_RADIUS = 25;
var DAY_HAND_SHAFT_HALF_WIDTH = 7.5;
var DAY_HAND_HEAD_HALF_LENGTH = 72;
var DAY_HAND_HEAD_HALF_THICKNESS = WEEK_HAND_HEAD_HALF_THICKNESS;
/**
* Week-label glyph geometry, calibrated from the printed week "3":
* center (1681, 511), radius from the dial center ≈873 px.
*
* The dial prints odd week numbers 1–53 on the uniform 53-position grid.
* Two-digit labels are laid out along the local tangent to the band.
*/
var R_WEEK_GLYPH = Math.hypot(1681 - CX, 511 - CY);
var WEEK_DIGIT_SPACING = 48;
var GLYPH_GUIDE_CIRCLE_RADIUS = 42;
var WEEK_DIGIT_FONT_SIZE = 100;
var MONTH_GLYPH_FONT_SIZE = 100;
var DAY_GLYPH_FONT_SIZE = 65.61;
var DAY_GLYPH_SPACING_SCALE = 1.1;
var DAY_GLYPH_ROTATION_ADJUSTMENTS = {
	"TUESDAY-5": 180,
	"TUESDAY-6": 180,
	"FRIDAY-0": 180
};
/** Per-glyph radial nudges in photo pixels. Positive = out, negative = in. */
var WEEK_DIGIT_RADIAL_ADJUSTMENTS = {
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
	"53-0": -5
};
/** Per-glyph font scale. Values are relative to the default size. */
var WEEK_DIGIT_SCALE_ADJUSTMENTS = {
	"1-0": 1.1,
	"3-0": 1.1,
	"5-0": .9,
	"7-0": 1.1,
	"9-0": 1.1,
	"11-0": 1.1,
	"11-1": 1.1,
	"13-0": 1.1,
	"13-1": 1.1,
	"15-1": .8505,
	"17-0": 1.05,
	"17-1": 1.05,
	"19-0": 1.05,
	"19-1": 1.05,
	"25-1": .81,
	"35-1": .81,
	"45-0": .95,
	"45-1": .855,
	"51-0": .81,
	"53-0": .81
};
/** Per-glyph rotation nudges in degrees. Positive = clockwise. */
var WEEK_DIGIT_ROTATION_ADJUSTMENTS = { "1-0": -7 };
/**
* Black-pixel centroids measured from polar-unwrapped month sectors in
* reference-ortho.jpg. Coordinates are in native photo pixels.
*/
var MONTH_GLYPH_CENTERS = [
	["JANUARY", [
		[1462.8, 367.6],
		[1506.6, 361.7],
		[1567.8, 369.1],
		[1629, 388.4],
		[1690.4, 402.3],
		[1748.2, 421.2],
		[1801.9, 443.2]
	]],
	["FEBRUARY", [
		[1930.2, 511.2],
		[1965.5, 547.5],
		[2008.3, 581],
		[2049, 614.7],
		[2088.1, 663.9],
		[2127.2, 698.7],
		[2164.9, 743.1],
		[2199.7, 786]
	]],
	["MARCH", [
		[2278.3, 945.5],
		[2305.6, 1020.7],
		[2329.1, 1080.6],
		[2339.5, 1144.8],
		[2354.1, 1212.6]
	]],
	["APRIL", [
		[2296.4, 1686.6],
		[2307.7, 1626.2],
		[2330.2, 1567.1],
		[2344.6, 1517.7],
		[2358.2, 1481.4]
	]],
	["MAY", [
		[2023.3, 2070.9],
		[2082.9, 2014.6],
		[2120.5, 1963.5]
	]],
	["JUNE", [
		[1529.9, 2308.1],
		[1591, 2294.1],
		[1667.3, 2268.5],
		[1731.4, 2245.5]
	]],
	["JULY", [
		[1031.4, 2252],
		[1099.6, 2270.8],
		[1156.9, 2295.7],
		[1221.9, 2289.9]
	]],
	["AUGUST", [
		[595.3, 1914.8],
		[629.8, 1962.8],
		[674.4, 2011.7],
		[716.5, 2056.1],
		[764.5, 2092.1],
		[816.9, 2115.4]
	]],
	["SEPTEMBER", [
		[404.8, 1397],
		[410.5, 1437.8],
		[425.5, 1483.5],
		[434.1, 1530.2],
		[435, 1573.7],
		[453.8, 1629.1],
		[471.1, 1683.8],
		[487.4, 1725.9],
		[513.6, 1767.6]
	]],
	["OCTOBER", [
		[408.5, 1258.5],
		[418.4, 1200.8],
		[412.8, 1138.4],
		[435.4, 1082.4],
		[456.5, 1022.5],
		[474.3, 971.6],
		[496, 914.3]
	]],
	["NOVEMBER", [
		[567.5, 793.3],
		[597.8, 750.8],
		[626.2, 711.9],
		[656.8, 674.2],
		[698.8, 630.3],
		[744.2, 591.8],
		[782, 559.6],
		[818.2, 527.6]
	]],
	["DECEMBER", [
		[958.8, 448.2],
		[1001.8, 428.7],
		[1044.9, 411.5],
		[1091.5, 394.2],
		[1151.2, 381.7],
		[1208, 367.9],
		[1255, 361.2],
		[1304.7, 353.1]
	]]
];
/**
* Black-pixel centroids measured from polar-unwrapped day-name sectors in
* reference-ortho.jpg. Coordinates are in native photo pixels.
*/
var DAY_GLYPH_CENTERS = [
	["SUNDAY", [
		[1253.1, 853.4],
		[1307.5, 848.1],
		[1361.5, 838.9],
		[1416.3, 839.9],
		[1471.8, 844.6],
		[1516.5, 850.6]
	]],
	["MONDAY", [
		[1668.4, 931.7],
		[1718.1, 972.3],
		[1758.5, 1009],
		[1784.2, 1043.4],
		[1811.6, 1091.5],
		[1842.4, 1144.8]
	]],
	["TUESDAY", [
		[1790.6, 1589.3],
		[1829.6, 1548.1],
		[1846.2, 1497.1],
		[1866.7, 1434.3],
		[1873.3, 1378.7],
		[1875, 1314],
		[1870.7, 1264.1]
	]],
	["WEDNESDAY", [
		[1443, 1817.4],
		[1490.7, 1809.5],
		[1536, 1800.2],
		[1577.9, 1783.6],
		[1612.2, 1767.2],
		[1651.3, 1745.1],
		[1686.9, 1720.8],
		[1718.4, 1693.6],
		[1741.8, 1664.8]
	]],
	["THURSDAY", [
		[1040.6, 1680.9],
		[1068.4, 1713.4],
		[1107.5, 1746.4],
		[1154.7, 1765.7],
		[1198.7, 1790.8],
		[1244.9, 1806.9],
		[1291, 1817.2],
		[1335.9, 1820.3]
	]],
	["FRIDAY", [
		[899, 1309.5],
		[895.9, 1369.4],
		[896.4, 1419.7],
		[907.2, 1463.8],
		[924.7, 1519.7],
		[954.3, 1567.3]
	]],
	["SATURDAY", [
		[914.1, 1174.3],
		[936.7, 1113.8],
		[968.1, 1066.7],
		[982.9, 1040.7],
		[1004.2, 1007.6],
		[1044, 969.7],
		[1087.6, 934.4],
		[1119.4, 909.8]
	]]
];
function averageMonthGlyphRadius() {
	let totalRadius = 0;
	let glyphCount = 0;
	for (const [, centers] of MONTH_GLYPH_CENTERS) for (const [x, y] of centers) {
		totalRadius += Math.hypot(x - CX, y - CY);
		glyphCount += 1;
	}
	return totalRadius / glyphCount;
}
var R_MONTH_GLYPH_GUIDE = averageMonthGlyphRadius();
function averageDayGlyphRadius() {
	let totalRadius = 0;
	let glyphCount = 0;
	for (const [, centers] of DAY_GLYPH_CENTERS) for (const [x, y] of centers) {
		totalRadius += Math.hypot(x - CX, y - CY);
		glyphCount += 1;
	}
	return totalRadius / glyphCount;
}
var R_DAY_GLYPH_GUIDE = averageDayGlyphRadius();
var PHOTO_OPACITY = [
	1,
	.5,
	0
];
var PHOTO_LABEL = [
	"Photo: 100%",
	"Photo: 50%",
	"Photo: OFF"
];
var publicAsset = (fileName) => `/${fileName}`;
var REFERENCE_IMAGES = [{
	src: publicAsset("reference-ortho-cream.jpg"),
	label: "Reference: 1"
}, {
	src: publicAsset("reference-handless-date-cutout.png"),
	label: "Reference: 2"
}];
var HAND_OPTIONS = [
	{
		value: "week",
		label: "Week"
	},
	{
		value: "day",
		label: "Day"
	},
	{
		value: "hour",
		label: "Hour"
	},
	{
		value: "minute",
		label: "Minute"
	},
	{
		value: "second",
		label: "Second"
	}
];
function polarPoint(degFrom12, r) {
	const rad = (degFrom12 - 90) * Math.PI / 180;
	return {
		x: CX + r * Math.cos(rad),
		y: CY + r * Math.sin(rad)
	};
}
function polarLine(degFrom12, r0, r1) {
	const a = polarPoint(degFrom12, r0);
	const b = polarPoint(degFrom12, r1);
	return {
		x1: a.x,
		y1: a.y,
		x2: b.x,
		y2: b.y
	};
}
function hourAngleDeg(h) {
	const hourIndex = h === 12 ? 0 : h;
	return MINUTE_OFFSET_DEG + (hourIndex === 0 ? 59 : 4 + (hourIndex - 1) * 5) * MINUTE_STEP_DEG;
}
function monthSectorLines() {
	const lines = [];
	for (let k = 0; k < 12; k++) lines.push(polarLine(MONTH_SECTOR_OFFSET_DEG + k * 30, R_WEEK_OUT, R_DIAL_EDGE));
	return lines;
}
function daySectorLines() {
	const lines = [];
	for (let k = 0; k < 7; k++) lines.push(polarLine(DAY_SECTOR_OFFSET_DEG + k * DAY_SECTOR_STEP_DEG, R_DAY_IN, R_DAY_OUT));
	return lines;
}
function weekGapDegrees() {
	const degs = [];
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
	const markers = [];
	for (let week = 1; week <= WEEK_COUNT; week += 2) {
		const digits = String(week);
		const angle = WEEK_OFFSET_DEG + (week - 1) * WEEK_STEP_DEG;
		const center = polarPoint(angle, R_WEEK_GLYPH);
		const angleRad = angle * Math.PI / 180;
		const tangentX = Math.cos(angleRad);
		const tangentY = Math.sin(angleRad);
		const readingDirection = angle > 90 && angle < 270 ? -1 : 1;
		for (let index = 0; index < digits.length; index++) {
			const tangentOffset = (index - (digits.length - 1) / 2) * WEEK_DIGIT_SPACING * readingDirection;
			const x = center.x + tangentX * tangentOffset;
			const y = center.y + tangentY * tangentOffset;
			const distanceFromCenter = Math.hypot(x - CX, y - CY);
			const rayScale = R_DIAL_EDGE / distanceFromCenter;
			const normalizedRayAngle = (Math.atan2(x - CX, CY - y) * 180 / Math.PI + 360) % 360;
			const rotation = normalizedRayAngle > 90 && normalizedRayAngle < 270 ? normalizedRayAngle - 180 : normalizedRayAngle;
			const radialAdjustment = WEEK_DIGIT_RADIAL_ADJUSTMENTS[`${week}-${index}`] ?? 0;
			const scale = WEEK_DIGIT_SCALE_ADJUSTMENTS[`${week}-${index}`] ?? 1;
			const rotationAdjustment = WEEK_DIGIT_ROTATION_ADJUSTMENTS[`${week}-${index}`] ?? 0;
			markers.push({
				week,
				digit: digits[index],
				index,
				x,
				y,
				digitX: x + (x - CX) / distanceFromCenter * radialAdjustment,
				digitY: y + (y - CY) / distanceFromCenter * radialAdjustment,
				rayX: CX + (x - CX) * rayScale,
				rayY: CY + (y - CY) * rayScale,
				rotation: rotation + rotationAdjustment,
				scale
			});
		}
	}
	return markers;
}
function monthGlyphMarkers() {
	return MONTH_GLYPH_CENTERS.flatMap(([month, centers]) => centers.map(([measuredX, measuredY], index) => {
		const guideScale = R_MONTH_GLYPH_GUIDE / Math.hypot(measuredX - CX, measuredY - CY);
		const x = CX + (measuredX - CX) * guideScale;
		const y = CY + (measuredY - CY) * guideScale;
		const rayScale = R_DIAL_EDGE / R_MONTH_GLYPH_GUIDE;
		const normalizedRayAngle = (Math.atan2(x - CX, CY - y) * 180 / Math.PI + 360) % 360;
		const rotation = normalizedRayAngle > 90 && normalizedRayAngle < 270 ? normalizedRayAngle - 180 : normalizedRayAngle;
		return {
			month,
			glyph: month[index],
			index,
			x,
			y,
			rayX: CX + (x - CX) * rayScale,
			rayY: CY + (y - CY) * rayScale,
			rotation
		};
	}));
}
function dayGlyphMarkers() {
	return DAY_GLYPH_CENTERS.flatMap(([day, centers], dayIndex) => {
		const sectorCenter = DAY_SECTOR_OFFSET_DEG - DAY_SECTOR_STEP_DEG / 2 + dayIndex * DAY_SECTOR_STEP_DEG;
		const measuredAngles = centers.map(([measuredX, measuredY]) => {
			const normalizedAngle = (Math.atan2(measuredX - CX, CY - measuredY) * 180 / Math.PI + 360) % 360;
			return normalizedAngle + Math.round((sectorCenter - normalizedAngle) / 360) * 360;
		});
		const labelCenter = measuredAngles.reduce((sum, measuredAngle) => sum + measuredAngle, 0) / measuredAngles.length;
		return centers.map((_, index) => {
			const angle = labelCenter + (measuredAngles[index] - labelCenter) * DAY_GLYPH_SPACING_SCALE;
			const { x, y } = polarPoint(angle, R_DAY_GLYPH_GUIDE);
			const rayScale = R_DIAL_EDGE / R_DAY_GLYPH_GUIDE;
			const normalizedRayAngle = (angle + 360) % 360;
			const rotation = normalizedRayAngle > 90 && normalizedRayAngle < 270 ? normalizedRayAngle - 180 : normalizedRayAngle;
			return {
				day,
				glyph: day[index],
				index,
				x,
				y,
				rayX: CX + (x - CX) * rayScale,
				rayY: CY + (y - CY) * rayScale,
				rotation: rotation + (DAY_GLYPH_ROTATION_ADJUSTMENTS[`${day}-${index}`] ?? 0)
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
function ptsToPath(pts) {
	return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
}
function handPoint(angleDeg, along, lateral) {
	const angle = angleDeg * Math.PI / 180;
	return {
		x: CX + Math.sin(angle) * along + Math.cos(angle) * lateral,
		y: CY - Math.cos(angle) * along + Math.sin(angle) * lateral
	};
}
function annularSectorPath(angleDeg, radius, halfThickness, halfLength) {
	const innerRadius = radius - halfThickness;
	const outerRadius = radius + halfThickness;
	const halfAngleDeg = halfLength / radius * 180 / Math.PI;
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
		"Z"
	].join(" ");
}
/**
* Marker heights tuned against macro photography (Aug 2026): a low ridge on
* a vertical-walled base slab. The flat diamond grind plane runs from the
* eaves to the inner ridge end; with the 90° square diamond its tip height
* is `2 × base − ridge` (= 4px here), floating above the dial on a vertical
* tip wall — the facet never reaches the base.
*/
var MARKER_PRISM_HEIGHT = 16;
/** Base:rise ≈ 2.3:1, solved from the raking macro's band structure. */
var MARKER_BASE_HEIGHT = 11.2;
var LIGHT_HEMISPHERE_RADIUS = R_DIAL_EDGE * 6;
function markerWorldPoint(point, angle, lateralOffset) {
	const rotated = rotateVector({
		...point,
		x: point.x + lateralOffset
	}, angle);
	return {
		x: CX + rotated.x,
		y: CY + rotated.y,
		z: rotated.z
	};
}
function markerFacetColor(localNormal, localCenter, markerAngle, lateralOffset, lightPosition, lightBrightness, material) {
	return shadeMetalFacet(normalize3(rotateVector(localNormal, markerAngle)), markerWorldPoint(localCenter, markerAngle, lateralOffset), lightPosition, lightBrightness, material);
}
function flatPvdGradientStops({ baseAngle, rotation, startRadius, endRadius, lightPosition, lightBrightness, count = 7 }) {
	const effectiveLightPosition = {
		...lightPosition,
		z: Math.max(lightPosition.z, LIGHT_HEMISPHERE_RADIUS * .32)
	};
	const angle = baseAngle + rotation;
	return Array.from({ length: count }, (_, index) => {
		const offset = index / (count - 1);
		const radius = startRadius + (endRadius - startRadius) * offset;
		const worldPoint = {
			...handPoint(angle, radius, 0),
			z: 0
		};
		const distanceToLight = Math.hypot(effectiveLightPosition.x - worldPoint.x, effectiveLightPosition.y - worldPoint.y, effectiveLightPosition.z);
		const spatialFalloff = Math.min(2.8, Math.max(.35, (LIGHT_HEMISPHERE_RADIUS / distanceToLight) ** 6.5));
		return {
			offset,
			color: shadeMetalFacet({
				x: 0,
				y: 0,
				z: 1
			}, worldPoint, effectiveLightPosition, lightBrightness * spatialFalloff, DEEP_BLACK_PVD)
		};
	});
}
function handPrismPoint(along, lateral, height) {
	return {
		x: lateral,
		y: -along,
		z: height
	};
}
function LitHandPrism({ angle, faces, lightBrightness, lightPosition }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: faces.map((face) => {
		const color = markerFacetColor(face.normal, averagePoints(face.points), angle, 0, lightPosition, lightBrightness, POLISHED_BLACK_PVD);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: ptsToPath(face.points.map((point) => markerWorldPoint(point, angle, 0))),
			fill: color.fill,
			stroke: color.stroke,
			strokeWidth: 2,
			strokeLinejoin: "round"
		}, face.key);
	}) });
}
function FlatHourBaton({ degFrom12, lateralOffset = 0 }) {
	const x0 = CX;
	const hw = BATON_HALF_W;
	const yOut = CY - R_BATON_OUT;
	const yOutApex = 556;
	const yIn = CY - R_BATON_IN;
	const yInApex = CY - R_BATON_IN_APEX;
	const yInTip = CY - R_BATON_IN_APEX_MIRROR;
	const yellow = [
		{
			x: x0 - hw,
			y: yOut
		},
		{
			x: 1405,
			y: yOut
		},
		{
			x: x0,
			y: yOutApex
		}
	];
	const red = [
		{
			x: x0 - hw,
			y: yOut
		},
		{
			x: x0,
			y: yOutApex
		},
		{
			x: x0,
			y: yInApex
		},
		{
			x: x0 - hw,
			y: yIn
		}
	];
	const blue = [
		{
			x: 1405,
			y: yOut
		},
		{
			x: x0,
			y: yOutApex
		},
		{
			x: x0,
			y: yInApex
		},
		{
			x: 1405,
			y: yIn
		}
	];
	const green = [
		{
			x: x0,
			y: yInTip
		},
		{
			x: x0 - hw,
			y: yIn
		},
		{
			x: x0,
			y: yInApex
		},
		{
			x: 1405,
			y: yIn
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		transform: `rotate(${degFrom12} ${CX} ${CY}) translate(${lateralOffset} 0)`,
		opacity: .55,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: ptsToPath(red),
				fill: "#ff3333",
				stroke: "#ff6666",
				strokeWidth: 1.5
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: ptsToPath(blue),
				fill: "#3388ff",
				stroke: "#66aaff",
				strokeWidth: 1.5
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: ptsToPath(yellow),
				fill: "#ffcc00",
				stroke: "#ffdd44",
				strokeWidth: 1.5
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: ptsToPath(green),
				fill: "#33ff66",
				stroke: "#66ff99",
				strokeWidth: 1.5
			})
		]
	});
}
function LitHourBaton({ degFrom12, lightBrightness, lightPosition, lateralOffset = 0 }) {
	const hw = BATON_HALF_W;
	const outerLeft = {
		x: -24,
		y: -799,
		z: 0
	};
	const outerRight = {
		x: hw,
		y: -799,
		z: 0
	};
	const outerRidge = {
		x: 0,
		y: -775,
		z: MARKER_PRISM_HEIGHT
	};
	const innerLeft = {
		x: -24,
		y: -616,
		z: 0
	};
	const innerRight = {
		x: hw,
		y: -616,
		z: 0
	};
	const innerRidge = {
		x: 0,
		y: -640,
		z: MARKER_PRISM_HEIGHT
	};
	const innerTip = {
		x: 0,
		y: -592,
		z: 0
	};
	const innerLeftNormal = faceNormal(innerTip, innerLeft, innerRidge);
	const innerRightNormal = faceNormal(innerTip, innerRidge, innerRight);
	const innerNormal = normalize3({
		x: innerLeftNormal.x + innerRightNormal.x,
		y: innerLeftNormal.y + innerRightNormal.y,
		z: innerLeftNormal.z + innerRightNormal.z
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
		"data-lit-hour-marker": true,
		children: [
			{
				key: "left",
				points: [
					outerLeft,
					outerRidge,
					innerRidge,
					innerLeft
				],
				normal: faceNormal(outerLeft, outerRidge, innerRidge)
			},
			{
				key: "right",
				points: [
					outerRight,
					innerRight,
					innerRidge,
					outerRidge
				],
				normal: faceNormal(outerRight, innerRight, innerRidge)
			},
			{
				key: "outer",
				points: [
					outerLeft,
					outerRight,
					outerRidge
				],
				normal: faceNormal(outerLeft, outerRight, outerRidge)
			},
			{
				key: "inner",
				points: [
					innerTip,
					innerLeft,
					innerRidge,
					innerRight
				],
				normal: innerNormal
			}
		].map((face) => {
			const color = markerFacetColor(face.normal, averagePoints(face.points), degFrom12, lateralOffset, lightPosition, lightBrightness);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: ptsToPath(face.points.map((point) => markerWorldPoint(point, degFrom12, lateralOffset))),
				fill: color.fill,
				stroke: color.stroke,
				strokeWidth: 1.5,
				strokeLinejoin: "round"
			}, face.key);
		})
	});
}
function DateWindowLighting({ brightness, position, settings }) {
	const { castDistance, castOpacity, lightX, lightY, pointLightStrength } = dateWindowLightModel(position, brightness, settings);
	const wallDiffuse = (normalX, normalY) => Math.max(0, normalX * position.u + normalY * position.v);
	const wallOpacity = (normalX, normalY) => settings.wallStrength * (.025 + (1 - wallDiffuse(normalX, normalY)) * .3 * pointLightStrength);
	const highlightOpacity = (normalX, normalY) => settings.wallStrength * wallDiffuse(normalX, normalY) * .16 * pointLightStrength;
	const shadowFramePath = [
		`M ${DATE_WINDOW_CLIP_LEFT - 100} ${DATE_WINDOW_CLIP_TOP - 100}`,
		`H 2281`,
		`V 1494`,
		`H ${DATE_WINDOW_CLIP_LEFT - 100} Z`,
		`M ${DATE_WINDOW_CLIP_LEFT} ${DATE_WINDOW_CLIP_TOP}`,
		`H ${DATE_WINDOW_CLIP_RIGHT}`,
		`V ${DATE_WINDOW_CLIP_BOTTOM}`,
		`H ${DATE_WINDOW_CLIP_LEFT} Z`
	].join(" ");
	const points = (vertices) => vertices.map(([x, y]) => `${x},${y}`).join(" ");
	const walls = [
		{
			key: "top",
			normal: [0, 1],
			vertices: [
				[DATE_WINDOW_OUTER_LEFT, DATE_WINDOW_OUTER_TOP],
				[DATE_WINDOW_OUTER_RIGHT, DATE_WINDOW_OUTER_TOP],
				[DATE_WINDOW_CLIP_RIGHT, DATE_WINDOW_CLIP_TOP],
				[DATE_WINDOW_CLIP_LEFT, DATE_WINDOW_CLIP_TOP]
			],
			innerEdge: [[DATE_WINDOW_CLIP_LEFT, DATE_WINDOW_CLIP_TOP], [DATE_WINDOW_CLIP_RIGHT, DATE_WINDOW_CLIP_TOP]]
		},
		{
			key: "right",
			normal: [-1, 0],
			vertices: [
				[DATE_WINDOW_CLIP_RIGHT, DATE_WINDOW_CLIP_TOP],
				[DATE_WINDOW_OUTER_RIGHT, DATE_WINDOW_OUTER_TOP],
				[DATE_WINDOW_OUTER_RIGHT, DATE_WINDOW_OUTER_BOTTOM],
				[DATE_WINDOW_CLIP_RIGHT, DATE_WINDOW_CLIP_BOTTOM]
			],
			innerEdge: [[DATE_WINDOW_CLIP_RIGHT, DATE_WINDOW_CLIP_TOP], [DATE_WINDOW_CLIP_RIGHT, DATE_WINDOW_CLIP_BOTTOM]]
		},
		{
			key: "bottom",
			normal: [0, -1],
			vertices: [
				[DATE_WINDOW_CLIP_LEFT, DATE_WINDOW_CLIP_BOTTOM],
				[DATE_WINDOW_CLIP_RIGHT, DATE_WINDOW_CLIP_BOTTOM],
				[DATE_WINDOW_OUTER_RIGHT, DATE_WINDOW_OUTER_BOTTOM],
				[DATE_WINDOW_OUTER_LEFT, DATE_WINDOW_OUTER_BOTTOM]
			],
			innerEdge: [[DATE_WINDOW_CLIP_LEFT, DATE_WINDOW_CLIP_BOTTOM], [DATE_WINDOW_CLIP_RIGHT, DATE_WINDOW_CLIP_BOTTOM]]
		},
		{
			key: "left",
			normal: [1, 0],
			vertices: [
				[DATE_WINDOW_OUTER_LEFT, DATE_WINDOW_OUTER_TOP],
				[DATE_WINDOW_CLIP_LEFT, DATE_WINDOW_CLIP_TOP],
				[DATE_WINDOW_CLIP_LEFT, DATE_WINDOW_CLIP_BOTTOM],
				[DATE_WINDOW_OUTER_LEFT, DATE_WINDOW_OUTER_BOTTOM]
			],
			innerEdge: [[DATE_WINDOW_CLIP_LEFT, DATE_WINDOW_CLIP_TOP], [DATE_WINDOW_CLIP_LEFT, DATE_WINDOW_CLIP_BOTTOM]]
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		"data-date-window-lighting": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("clipPath", {
				id: "date-window-opening-clip",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: DATE_WINDOW_CLIP_LEFT,
					y: DATE_WINDOW_CLIP_TOP,
					width: DATE_WINDOW_CLIP_RIGHT - DATE_WINDOW_CLIP_LEFT,
					height: DATE_WINDOW_CLIP_BOTTOM - DATE_WINDOW_CLIP_TOP,
					rx: 4
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("filter", {
				id: "date-window-cast-shadow",
				x: DATE_WINDOW_CLIP_LEFT - 100,
				y: DATE_WINDOW_CLIP_TOP - 100,
				width: 364,
				height: 330,
				filterUnits: "userSpaceOnUse",
				colorInterpolationFilters: "sRGB",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("feGaussianBlur", {
					in: "SourceGraphic",
					stdDeviation: settings.softness,
					result: "soft-shadow"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feOffset", {
					in: "soft-shadow",
					dx: -lightX * castDistance,
					dy: -lightY * castDistance
				})]
			})] }),
			walls.map((wall) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("polygon", {
				points: points(wall.vertices),
				fill: "#171714",
				opacity: wallOpacity(wall.normal[0], wall.normal[1])
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
				points: points(wall.innerEdge),
				fill: "none",
				stroke: "#ffffff",
				strokeWidth: 1.4,
				opacity: highlightOpacity(wall.normal[0], wall.normal[1])
			})] }, wall.key)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
				clipPath: "url(#date-window-opening-clip)",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: shadowFramePath,
					fill: "#000000",
					fillRule: "evenodd",
					opacity: castOpacity,
					filter: "url(#date-window-cast-shadow)"
				})
			})
		]
	});
}
var CONTROL_TABS = [
	{
		id: "time",
		label: "Time"
	},
	{
		id: "layers",
		label: "Layers"
	},
	{
		id: "light",
		label: "Light"
	}
];
/** Shared styling for buttons inside the control window. */
function panelButtonClass(active = false) {
	return `rounded-lg border px-2 py-1.5 text-xs font-semibold transition active:scale-95 ${active ? "border-black bg-black text-white hover:bg-zinc-800" : "border-black/25 bg-white text-black hover:bg-zinc-100"}`;
}
function ControlPanel({ brightness, dateWindowLight, layersTab, position, timeTab, onBrightnessChange, onChange, onDateWindowLightChange }) {
	const diskRef = (0, import_react.useRef)(null);
	const panelDragRef = (0, import_react.useRef)(null);
	const [panelOffset, setPanelOffset] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const [activeTab, setActiveTab] = (0, import_react.useState)("time");
	const radius = Math.hypot(position.u, position.v);
	const elevation = Math.asin(Math.sqrt(Math.max(0, 1 - radius * radius))) * 180 / Math.PI;
	const azimuth = Math.atan2(position.u, -position.v) * 180 / Math.PI;
	const dateWindowControls = [
		{
			key: "softness",
			label: "Softness",
			min: 0,
			max: 20,
			step: .1,
			valueText: `${dateWindowLight.softness.toFixed(1)}px`
		},
		{
			key: "castDistance",
			label: "Depth",
			min: 0,
			max: 30,
			step: .1,
			valueText: `${dateWindowLight.castDistance.toFixed(1)}px`
		},
		{
			key: "castStrength",
			label: "Cast shadow",
			min: 0,
			max: 2,
			step: .01,
			valueText: `${Math.round(dateWindowLight.castStrength * 100)}%`
		},
		{
			key: "wallStrength",
			label: "Wall shade",
			min: 0,
			max: 2,
			step: .01,
			valueText: `${Math.round(dateWindowLight.wallStrength * 100)}%`
		},
		{
			key: "bevelStrength",
			label: "Photo bevel",
			min: 0,
			max: 2,
			step: .01,
			valueText: `${Math.round(dateWindowLight.bevelStrength * 100)}%`
		}
	];
	const clampPosition = (u, v) => {
		const distance = Math.hypot(u, v);
		if (distance <= 1) return {
			u,
			v
		};
		return {
			u: u / distance,
			v: v / distance
		};
	};
	const updateFromPointer = (clientX, clientY) => {
		const bounds = diskRef.current?.getBoundingClientRect();
		if (!bounds) return;
		onChange(clampPosition((clientX - bounds.left) / bounds.width * 2 - 1, (clientY - bounds.top) / bounds.height * 2 - 1));
	};
	const movePanel = (clientX, clientY) => {
		const drag = panelDragRef.current;
		if (!drag) return;
		setPanelOffset((offset) => ({
			x: offset.x + (clientX - drag.x),
			y: offset.y + (clientY - drag.y)
		}));
		panelDragRef.current = {
			...drag,
			x: clientX,
			y: clientY
		};
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed left-6 top-16 z-[100] w-64 rounded-xl border border-black/20 bg-white/90 p-3 shadow-lg backdrop-blur",
		style: { transform: `translate(${panelOffset.x}px, ${panelOffset.y}px)` },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "button",
				tabIndex: 0,
				"aria-label": "Drag control window",
				className: "mb-2 touch-none select-none text-center text-xs font-semibold text-black cursor-move",
				onPointerDown: (event) => {
					event.currentTarget.setPointerCapture(event.pointerId);
					panelDragRef.current = {
						pointerId: event.pointerId,
						x: event.clientX,
						y: event.clientY
					};
				},
				onPointerMove: (event) => {
					if (panelDragRef.current?.pointerId === event.pointerId) movePanel(event.clientX, event.clientY);
				},
				onPointerUp: (event) => {
					if (panelDragRef.current?.pointerId === event.pointerId) panelDragRef.current = null;
				},
				onPointerCancel: () => {
					panelDragRef.current = null;
				},
				onKeyDown: (event) => {
					const delta = {
						ArrowLeft: [-10, 0],
						ArrowRight: [10, 0],
						ArrowUp: [0, -10],
						ArrowDown: [0, 10]
					}[event.key];
					if (!delta) return;
					event.preventDefault();
					setPanelOffset((offset) => ({
						x: offset.x + delta[0],
						y: offset.y + delta[1]
					}));
				},
				children: "Controls"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "tablist",
				"aria-label": "Control groups",
				className: "mb-3 grid grid-cols-3 gap-1 rounded-lg bg-black/10 p-1",
				children: CONTROL_TABS.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "tab",
					"aria-selected": activeTab === tab.id,
					onClick: () => setActiveTab(tab.id),
					className: `rounded-md px-2 py-1 text-[11px] font-semibold transition ${activeTab === tab.id ? "bg-black text-white" : "text-black hover:bg-black/10"}`,
					children: tab.label
				}, tab.id))
			}),
			activeTab === "time" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "tabpanel",
				children: timeTab
			}),
			activeTab === "layers" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "tabpanel",
				children: layersTab
			}),
			activeTab === "light" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "tabpanel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						ref: diskRef,
						role: "slider",
						tabIndex: 0,
						"aria-label": "Hour marker light position",
						"aria-valuemin": 0,
						"aria-valuemax": 90,
						"aria-valuenow": Math.round(elevation),
						"aria-valuetext": `${Math.round(azimuth)} degrees azimuth, ${Math.round(elevation)} degrees elevation`,
						onPointerDown: (event) => {
							event.currentTarget.setPointerCapture(event.pointerId);
							updateFromPointer(event.clientX, event.clientY);
						},
						onPointerMove: (event) => {
							if (event.currentTarget.hasPointerCapture(event.pointerId)) updateFromPointer(event.clientX, event.clientY);
						},
						onKeyDown: (event) => {
							const step = event.shiftKey ? .02 : .06;
							const delta = {
								ArrowLeft: [-step, 0],
								ArrowRight: [step, 0],
								ArrowUp: [0, -step],
								ArrowDown: [0, step]
							}[event.key];
							if (!delta) return;
							event.preventDefault();
							onChange(clampPosition(position.u + delta[0], position.v + delta[1]));
						},
						className: "relative mx-auto h-32 w-32 touch-none rounded-full border-2 border-black/40 bg-[radial-gradient(circle_at_center,#fff_0%,#e7e7e7_58%,#a8a8a8_100%)] shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-black",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute bottom-0 left-1/2 top-0 w-px bg-black/15" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-black/15" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black shadow-md",
								style: {
									left: `${(position.u + 1) * 50}%`,
									top: `${(position.v + 1) * 50}%`
								}
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 text-center text-[10px] tabular-nums text-black",
						children: [
							Math.round(azimuth),
							"° / ",
							Math.round(elevation),
							"°"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-2 block text-[10px] font-semibold text-black",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Brightness" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
								className: "tabular-nums",
								children: [Math.round(brightness * 100), "%"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 0,
							max: 200,
							step: 1,
							value: brightness * 100,
							onChange: (event) => onBrightnessChange(Number(event.target.value) / 100),
							className: "mt-1 w-full cursor-pointer accent-black",
							"aria-label": "Marker light brightness"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 border-t border-black/15 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-1 text-[10px] font-bold text-black",
							children: "Date window"
						}), dateWindowControls.map((control) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "mt-1.5 block text-[10px] font-semibold text-black",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: control.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("output", {
									className: "tabular-nums",
									children: control.valueText
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: control.min,
								max: control.max,
								step: control.step,
								value: dateWindowLight[control.key],
								onChange: (event) => onDateWindowLightChange({
									...dateWindowLight,
									[control.key]: Number(event.target.value)
								}),
								className: "mt-0.5 w-full cursor-pointer accent-black",
								"aria-label": `Date window ${control.label.toLowerCase()}`
							})]
						}, control.key))]
					})
				]
			})
		]
	});
}
function LitAnnularPaintCapsule({ baseAngle, halfLength, halfThickness, lightBrightness, lightPosition, radius, rotation }) {
	const alongSegments = 32;
	const crossSegments = 10;
	const paintHeight = halfThickness * .55;
	const endRoundingLength = halfThickness * .55;
	const surfacePoint = (alongIndex, crossIndex) => {
		const alongT = alongIndex / alongSegments;
		const crossT = crossIndex / crossSegments * 2 - 1;
		const along = -halfLength + alongT * halfLength * 2;
		const across = crossT * halfThickness;
		const crossProfile = Math.sqrt(Math.max(0, 1 - (across / halfThickness) ** 2));
		const distanceFromEnd = halfLength - Math.abs(along);
		const endProgress = Math.min(1, Math.max(0, distanceFromEnd / endRoundingLength));
		const endProfile = Math.sqrt(Math.max(0, 1 - (1 - endProgress) ** 2));
		const height = paintHeight * crossProfile * endProfile;
		const localAngle = baseAngle + along / radius * (180 / Math.PI);
		const worldAngle = localAngle + rotation;
		const localPoint = polarPoint(localAngle, radius + across);
		const worldPoint2d = polarPoint(worldAngle, radius + across);
		const worldRadians = worldAngle * Math.PI / 180;
		const tangent = {
			x: Math.cos(worldRadians),
			y: Math.sin(worldRadians)
		};
		const radial = {
			x: Math.sin(worldRadians),
			y: -Math.cos(worldRadians)
		};
		const crossDerivative = -paintHeight * endProfile * across / (halfThickness ** 2 * Math.max(1e-4, crossProfile));
		const endDerivative = endProgress < 1 ? paintHeight * crossProfile * (1 - endProgress) * (along < 0 ? 1 : -1) / (endRoundingLength * Math.max(1e-4, endProfile)) : 0;
		const tangentScale = (radius + across) / radius;
		const normal = normalize3({
			x: tangent.x * (-endDerivative / tangentScale) + radial.x * -crossDerivative,
			y: tangent.y * (-endDerivative / tangentScale) + radial.y * -crossDerivative,
			z: 1
		});
		return {
			localPoint,
			worldPoint: {
				...worldPoint2d,
				z: height
			},
			normal
		};
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
		"data-paint-rendering": "annular-half-cylinder",
		children: Array.from({ length: alongSegments }, (_, alongIndex) => Array.from({ length: crossSegments }, (__, crossIndex) => {
			const corners = [
				surfacePoint(alongIndex, crossIndex),
				surfacePoint(alongIndex, crossIndex + 1),
				surfacePoint(alongIndex + 1, crossIndex + 1),
				surfacePoint(alongIndex + 1, crossIndex)
			];
			const color = shadeGlossyPaintFacet(normalize3(corners.reduce((sum, corner) => ({
				x: sum.x + corner.normal.x / corners.length,
				y: sum.y + corner.normal.y / corners.length,
				z: sum.z + corner.normal.z / corners.length
			}), {
				x: 0,
				y: 0,
				z: 0
			})), averagePoints(corners.map((corner) => corner.worldPoint)), lightPosition, lightBrightness);
			return {
				key: `${alongIndex}-${crossIndex}`,
				path: ptsToPath(corners.map((corner) => corner.localPoint)),
				color
			};
		})).flat().map((facet) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: facet.path,
			fill: facet.color.fill,
			stroke: facet.color.fill,
			strokeWidth: .7,
			strokeLinejoin: "round"
		}, facet.key))
	});
}
function WeekIndicatorHand({ lightBrightness, lightPosition, mode, rotation }) {
	const dynamicallyLit = mode === "3d";
	const shaftStart = handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_SHAFT_START_RADIUS, 0);
	const headCenter = handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_HEAD_RADIUS, 0);
	const litShaftStops = flatPvdGradientStops({
		baseAngle: WEEK_HAND_ANGLE_DEG,
		rotation,
		startRadius: WEEK_HAND_SHAFT_START_RADIUS,
		endRadius: WEEK_HAND_HEAD_RADIUS,
		lightPosition,
		lightBrightness
	});
	const shaft = [
		handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_SHAFT_START_RADIUS, -6.48),
		handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_HEAD_RADIUS, -6.48),
		handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_HEAD_RADIUS, WEEK_HAND_SHAFT_HALF_WIDTH),
		handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_SHAFT_START_RADIUS, WEEK_HAND_SHAFT_HALF_WIDTH)
	];
	const headPath = annularSectorPath(WEEK_HAND_ANGLE_DEG, WEEK_HAND_HEAD_RADIUS, WEEK_HAND_HEAD_HALF_THICKNESS, WEEK_HAND_HEAD_HALF_LENGTH);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		"data-week-indicator-hand": true,
		"data-hand-rendering": dynamicallyLit ? "lit-flat" : "flat",
		style: {
			transform: `rotate(${rotation}deg)`,
			transformOrigin: `${CX}px ${CY}px`,
			transition: "transform 180ms cubic-bezier(0.2, 0.85, 0.25, 1)",
			willChange: "transform"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "week-hand-shaft-gradient",
				gradientUnits: "userSpaceOnUse",
				x1: CX,
				y1: CY,
				x2: headCenter.x,
				y2: headCenter.y,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#0d0c08"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "48%",
						stopColor: "#0e0d09"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "53%",
						stopColor: "#24201f"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "56%",
						stopColor: "#2e2b26"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#312e29"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "week-hand-head-gradient",
				x1: "0%",
				y1: "0%",
				x2: "100%",
				y2: "100%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#c33a46"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "52%",
						stopColor: "#b2303a"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#8f1d28"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("linearGradient", {
				id: "week-hand-shaft-lit-gradient",
				gradientUnits: "userSpaceOnUse",
				x1: shaftStart.x,
				y1: shaftStart.y,
				x2: headCenter.x,
				y2: headCenter.y,
				children: litShaftStops.map((stop) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: `${stop.offset * 100}%`,
					stopColor: stop.color.fill
				}, stop.offset))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", {
				id: "week-hand-shadow",
				x: "-30%",
				y: "-20%",
				width: "170%",
				height: "160%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feDropShadow", {
					dx: "5",
					dy: "6",
					stdDeviation: "4",
					floodColor: "#000000",
					floodOpacity: "0.12"
				})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			filter: dynamicallyLit ? void 0 : "url(#week-hand-shadow)",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: ptsToPath(shaft),
				fill: dynamicallyLit ? "url(#week-hand-shaft-lit-gradient)" : "url(#week-hand-shaft-gradient)",
				stroke: dynamicallyLit ? litShaftStops[0].color.stroke : "#171815",
				strokeWidth: 1.44
			}), dynamicallyLit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LitAnnularPaintCapsule, {
				baseAngle: WEEK_HAND_ANGLE_DEG,
				halfLength: WEEK_HAND_HEAD_HALF_LENGTH,
				halfThickness: WEEK_HAND_HEAD_HALF_THICKNESS,
				lightBrightness,
				lightPosition,
				radius: WEEK_HAND_HEAD_RADIUS,
				rotation
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: headPath,
				fill: "url(#week-hand-head-gradient)",
				stroke: "#8f1d28",
				strokeWidth: 1.3,
				strokeLinejoin: "round"
			})]
		})]
	});
}
function DayIndicatorHand({ lightBrightness, lightPosition, mode, rotation }) {
	const dynamicallyLit = mode === "3d";
	const shaftStart = handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_SHAFT_START_RADIUS, 0);
	const headCenter = handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_HEAD_RADIUS, 0);
	const litShaftStops = flatPvdGradientStops({
		baseAngle: DAY_HAND_ANGLE_DEG,
		rotation,
		startRadius: DAY_HAND_SHAFT_START_RADIUS,
		endRadius: DAY_HAND_HEAD_RADIUS,
		lightPosition,
		lightBrightness
	});
	const shaft = [
		handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_SHAFT_START_RADIUS, -7.5),
		handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_HEAD_RADIUS, -7.5),
		handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_HEAD_RADIUS, DAY_HAND_SHAFT_HALF_WIDTH),
		handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_SHAFT_START_RADIUS, DAY_HAND_SHAFT_HALF_WIDTH)
	];
	const headPath = annularSectorPath(DAY_HAND_ANGLE_DEG, DAY_HAND_HEAD_RADIUS, DAY_HAND_HEAD_HALF_THICKNESS, DAY_HAND_HEAD_HALF_LENGTH);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		"data-day-indicator-hand": true,
		"data-hand-rendering": dynamicallyLit ? "lit-flat" : "flat",
		style: {
			transform: `rotate(${rotation}deg)`,
			transformOrigin: `${CX}px ${CY}px`,
			transition: "transform 180ms cubic-bezier(0.2, 0.85, 0.25, 1)",
			willChange: "transform"
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "day-hand-shaft-gradient",
				gradientUnits: "userSpaceOnUse",
				x1: CX,
				y1: CY,
				x2: headCenter.x,
				y2: headCenter.y,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#29282b"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "23%",
						stopColor: "#4a4947"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#4c4b48"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "day-hand-head-gradient",
				x1: "0%",
				y1: "0%",
				x2: "100%",
				y2: "100%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#bc3d47"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "52%",
						stopColor: "#ac353e"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#8e2530"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("linearGradient", {
				id: "day-hand-shaft-lit-gradient",
				gradientUnits: "userSpaceOnUse",
				x1: shaftStart.x,
				y1: shaftStart.y,
				x2: headCenter.x,
				y2: headCenter.y,
				children: litShaftStops.map((stop) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: `${stop.offset * 100}%`,
					stopColor: stop.color.fill
				}, stop.offset))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", {
				id: "day-hand-shadow",
				x: "-30%",
				y: "-20%",
				width: "170%",
				height: "160%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feDropShadow", {
					dx: "5",
					dy: "6",
					stdDeviation: "4",
					floodColor: "#000000",
					floodOpacity: "0.12"
				})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			filter: dynamicallyLit ? void 0 : "url(#day-hand-shadow)",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: ptsToPath(shaft),
				fill: dynamicallyLit ? "url(#day-hand-shaft-lit-gradient)" : "url(#day-hand-shaft-gradient)",
				stroke: dynamicallyLit ? litShaftStops[0].color.stroke : "#363633",
				strokeWidth: 1.4
			}), dynamicallyLit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LitAnnularPaintCapsule, {
				baseAngle: DAY_HAND_ANGLE_DEG,
				halfLength: DAY_HAND_HEAD_HALF_LENGTH,
				halfThickness: DAY_HAND_HEAD_HALF_THICKNESS,
				lightBrightness,
				lightPosition,
				radius: DAY_HAND_HEAD_RADIUS,
				rotation
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: headPath,
				fill: "url(#day-hand-head-gradient)",
				stroke: "#8e2530",
				strokeWidth: 1.3,
				strokeLinejoin: "round"
			})]
		})]
	});
}
function HourHand({ lightBrightness, lightPosition, mode, rotation }) {
	const rear = handPoint(HOUR_HAND_ANGLE_DEG, HOUR_HAND_REAR_RADIUS, 0);
	const lightBase = handPoint(HOUR_HAND_ANGLE_DEG, HOUR_HAND_BASE_RADIUS, HOUR_HAND_HALF_WIDTH);
	const tipCenter = handPoint(HOUR_HAND_ANGLE_DEG, HOUR_HAND_TIP_RADIUS, 0);
	const lightTip = handPoint(HOUR_HAND_ANGLE_DEG, HOUR_HAND_TIP_RADIUS, HOUR_HAND_TIP_HALF_WIDTH);
	const darkTip = handPoint(HOUR_HAND_ANGLE_DEG, HOUR_HAND_TIP_RADIUS, -3);
	const darkBase = handPoint(HOUR_HAND_ANGLE_DEG, HOUR_HAND_BASE_RADIUS, -72);
	if (mode === "3d") {
		const ridgeRear = handPrismPoint(HOUR_HAND_REAR_RADIUS, 0, HOUR_HAND_PRISM_HEIGHT);
		const positiveBase = handPrismPoint(HOUR_HAND_BASE_RADIUS, HOUR_HAND_HALF_WIDTH, 0);
		const positiveTip = handPrismPoint(HOUR_HAND_TIP_RADIUS, HOUR_HAND_TIP_HALF_WIDTH, 0);
		const negativeTip = handPrismPoint(HOUR_HAND_TIP_RADIUS, -3, 0);
		const negativeBase = handPrismPoint(HOUR_HAND_BASE_RADIUS, -72, 0);
		const ridgeTip = handPrismPoint(HOUR_HAND_TIP_RADIUS, 0, planeHeightAt(ridgeRear, positiveTip, positiveBase, 0, -510));
		const faces = [{
			key: "positive",
			points: [
				ridgeRear,
				positiveBase,
				positiveTip,
				ridgeTip
			],
			normal: faceNormal(ridgeRear, positiveTip, positiveBase)
		}, {
			key: "negative",
			points: [
				ridgeRear,
				ridgeTip,
				negativeTip,
				negativeBase
			],
			normal: faceNormal(ridgeRear, negativeBase, negativeTip)
		}];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
			"data-hour-hand": true,
			"data-hand-rendering": "3d",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LitHandPrism, {
				angle: HOUR_HAND_ANGLE_DEG + rotation,
				faces,
				lightBrightness,
				lightPosition
			})
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		"data-hour-hand": true,
		"data-hand-rendering": "flat",
		transform: `rotate(${rotation} ${CX} ${CY})`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "hour-light-facet",
				x1: "100%",
				y1: "100%",
				x2: "0%",
				y2: "0%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#777874"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "60%",
						stopColor: "#8f908c"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#aaaBA7"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "hour-dark-facet",
				x1: "100%",
				y1: "100%",
				x2: "0%",
				y2: "0%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#292a28"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "65%",
						stopColor: "#20211f"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#111210"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", {
				id: "hour-hand-shadow",
				x: "-30%",
				y: "-30%",
				width: "170%",
				height: "170%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feDropShadow", {
					dx: "5",
					dy: "6",
					stdDeviation: "4",
					floodColor: "#000000",
					floodOpacity: "0.125"
				})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			filter: "url(#hour-hand-shadow)",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: ptsToPath([
						rear,
						lightBase,
						lightTip,
						tipCenter
					]),
					fill: "url(#hour-light-facet)",
					stroke: "#565753",
					strokeWidth: 2,
					strokeLinejoin: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: ptsToPath([
						rear,
						tipCenter,
						darkTip,
						darkBase
					]),
					fill: "url(#hour-dark-facet)",
					stroke: "#181917",
					strokeWidth: 2,
					strokeLinejoin: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: rear.x,
					y1: rear.y,
					x2: tipCenter.x,
					y2: tipCenter.y,
					stroke: "#50514e",
					strokeWidth: 2,
					opacity: .8
				})
			]
		})]
	});
}
function MinuteHand({ lightBrightness, lightPosition, mode, rotation }) {
	const rear = handPoint(MINUTE_HAND_ANGLE_DEG, MINUTE_HAND_REAR_RADIUS, 0);
	const upperBase = handPoint(MINUTE_HAND_ANGLE_DEG, MINUTE_HAND_BASE_RADIUS, -60);
	const tip = handPoint(MINUTE_HAND_ANGLE_DEG, MINUTE_HAND_TIP_RADIUS, 0);
	const lowerBase = handPoint(MINUTE_HAND_ANGLE_DEG, MINUTE_HAND_BASE_RADIUS, MINUTE_HAND_HALF_WIDTH);
	if (mode === "3d") {
		const ridgeRear = handPrismPoint(MINUTE_HAND_REAR_RADIUS, 0, MINUTE_HAND_PRISM_HEIGHT);
		const ridgeTip = handPrismPoint(MINUTE_HAND_TIP_RADIUS, 0, MINUTE_HAND_PRISM_HEIGHT);
		const negativeBase = handPrismPoint(MINUTE_HAND_BASE_RADIUS, -60, 0);
		const positiveBase = handPrismPoint(MINUTE_HAND_BASE_RADIUS, MINUTE_HAND_HALF_WIDTH, 0);
		const faces = [{
			key: "negative",
			points: [
				ridgeRear,
				negativeBase,
				ridgeTip
			],
			normal: faceNormal(ridgeRear, negativeBase, ridgeTip)
		}, {
			key: "positive",
			points: [
				ridgeRear,
				ridgeTip,
				positiveBase
			],
			normal: faceNormal(ridgeRear, ridgeTip, positiveBase)
		}];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
			"data-minute-hand": true,
			"data-hand-rendering": "3d",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LitHandPrism, {
				angle: MINUTE_HAND_ANGLE_DEG + rotation,
				faces,
				lightBrightness,
				lightPosition
			})
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		"data-minute-hand": true,
		"data-hand-rendering": "flat",
		transform: `rotate(${rotation} ${CX} ${CY})`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "minute-upper-facet",
				x1: "0%",
				y1: "100%",
				x2: "100%",
				y2: "0%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#757672"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "62%",
						stopColor: "#8e8f8b"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#b0b1ad"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "minute-lower-facet",
				x1: "0%",
				y1: "100%",
				x2: "100%",
				y2: "0%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#2a2b29"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "65%",
						stopColor: "#20211f"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#111210"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", {
				id: "minute-hand-shadow",
				x: "-20%",
				y: "-20%",
				width: "150%",
				height: "160%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feDropShadow", {
					dx: "5",
					dy: "6",
					stdDeviation: "4",
					floodColor: "#000000",
					floodOpacity: "0.125"
				})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			filter: "url(#minute-hand-shadow)",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: ptsToPath([
						rear,
						upperBase,
						tip
					]),
					fill: "url(#minute-upper-facet)",
					stroke: "#565753",
					strokeWidth: 2,
					strokeLinejoin: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: ptsToPath([
						rear,
						tip,
						lowerBase
					]),
					fill: "url(#minute-lower-facet)",
					stroke: "#181917",
					strokeWidth: 2,
					strokeLinejoin: "round"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
					x1: rear.x,
					y1: rear.y,
					x2: tip.x,
					y2: tip.y,
					stroke: "#50514e",
					strokeWidth: 2,
					opacity: .8
				})
			]
		})]
	});
}
function SecondsHand({ animatedOffsetSeconds, lightBrightness, lightPosition, mode, rotation }) {
	const upperBlade = [
		{
			x: CX - SECOND_HAND_TIP_HALF_W,
			y: SECOND_HAND_TIP_Y
		},
		{
			x: 1384.84912,
			y: SECOND_HAND_TIP_Y
		},
		{
			x: 1387.29856,
			y: SECOND_HAND_NECK_Y
		},
		{
			x: CX - SECOND_HAND_NECK_HALF_W,
			y: SECOND_HAND_NECK_Y
		}
	];
	const counterweight = [
		{
			x: CX - SECOND_HAND_TAIL_SHOULDER_HALF_W,
			y: SECOND_HAND_TAIL_SHOULDER_Y
		},
		{
			x: 1394.5,
			y: SECOND_HAND_TAIL_SHOULDER_Y
		},
		{
			x: 1408,
			y: SECOND_HAND_TAIL_END_Y
		},
		{
			x: CX,
			y: SECOND_HAND_TAIL_POINT_Y
		},
		{
			x: CX - SECOND_HAND_TAIL_END_HALF_W,
			y: SECOND_HAND_TAIL_END_Y
		}
	];
	const effectiveAreaLightPosition = {
		...lightPosition,
		z: Math.max(lightPosition.z, LIGHT_HEMISPHERE_RADIUS * .32)
	};
	const gradientStartY = SECOND_HAND_TIP_Y;
	const gradientEndY = SECOND_HAND_TAIL_POINT_Y;
	const gradientSpan = gradientEndY - gradientStartY;
	const handGradientStops = Array.from({ length: 9 }, (_, index) => {
		const offset = index / 8;
		const worldPoint = markerWorldPoint({
			x: 0,
			y: gradientStartY + gradientSpan * offset - CY,
			z: 0
		}, rotation, 0);
		const distanceToLight = Math.hypot(effectiveAreaLightPosition.x - worldPoint.x, effectiveAreaLightPosition.y - worldPoint.y, effectiveAreaLightPosition.z - worldPoint.z);
		const spatialFalloff = Math.min(2.8, Math.max(.35, (LIGHT_HEMISPHERE_RADIUS / distanceToLight) ** 6.5));
		return {
			offset,
			color: shadeMetalFacet({
				x: 0,
				y: 0,
				z: 1
			}, worldPoint, effectiveAreaLightPosition, lightBrightness * spatialFalloff, DEEP_BLACK_PVD)
		};
	});
	const hubCenter = {
		x: CX,
		y: CY,
		z: 0
	};
	const hubToLight = normalize3({
		x: effectiveAreaLightPosition.x - hubCenter.x,
		y: effectiveAreaLightPosition.y - hubCenter.y,
		z: effectiveAreaLightPosition.z - hubCenter.z
	});
	const hubHighlightNormal = normalize3({
		x: hubToLight.x,
		y: hubToLight.y,
		z: hubToLight.z + 1
	});
	const localHubHighlight = rotateVector(hubHighlightNormal, -rotation);
	const hubHighlightColor = shadeMetalFacet(hubHighlightNormal, hubCenter, effectiveAreaLightPosition, lightBrightness, DEEP_BLACK_PVD);
	const hubFaceColor = shadeMetalFacet({
		x: 0,
		y: 0,
		z: 1
	}, hubCenter, effectiveAreaLightPosition, lightBrightness, DEEP_BLACK_PVD);
	const hubUnlitColor = shadeMetalFacet({
		x: 0,
		y: 0,
		z: 1
	}, hubCenter, effectiveAreaLightPosition, 0, DEEP_BLACK_PVD);
	const hubHighlightX = CX + localHubHighlight.x * SECOND_HAND_HUB_RADIUS * .58;
	const hubHighlightY = CY + localHubHighlight.y * SECOND_HAND_HUB_RADIUS * .58;
	const pinHighlightX = CX + localHubHighlight.x * 5.8;
	const pinHighlightY = CY + localHubHighlight.y * 5.8;
	const dynamicallyLit = mode === "3d";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		"data-seconds-hand": true,
		"data-hand-rendering": dynamicallyLit ? "lit-flat" : "flat",
		transform: animatedOffsetSeconds === void 0 ? `rotate(${rotation} ${CX} ${CY})` : void 0,
		style: animatedOffsetSeconds === void 0 ? void 0 : {
			animation: "screensaver-seconds-hand 60s steps(480, end) infinite",
			animationDelay: `${-animatedOffsetSeconds}s`,
			transformOrigin: `${CX}px ${CY}px`
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("defs", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: "seconds-tail-gradient",
				x1: "0%",
				y1: "0%",
				x2: "0%",
				y2: "100%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#62635f"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "48%",
						stopColor: "#383936"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#090a09"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
				id: "seconds-hub-gradient",
				cx: "42%",
				cy: "35%",
				r: "70%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#a6a7a3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "58%",
						stopColor: "#777874"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#575854"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
				id: "seconds-pin-gradient",
				cx: "38%",
				cy: "30%",
				r: "72%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#ffffff"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "28%",
						stopColor: "#d7d8d5"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "62%",
						stopColor: "#777975"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#242522"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
				id: "seconds-hub-lit-gradient",
				gradientUnits: "userSpaceOnUse",
				cx: hubHighlightX,
				cy: hubHighlightY,
				r: SECOND_HAND_HUB_RADIUS * 1.2,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: hubHighlightColor.fill
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "34%",
						stopColor: hubFaceColor.fill
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: hubUnlitColor.fill
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("radialGradient", {
				id: "seconds-pin-lit-gradient",
				gradientUnits: "userSpaceOnUse",
				cx: pinHighlightX,
				cy: pinHighlightY,
				r: 13,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: hubHighlightColor.fill
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "38%",
						stopColor: hubFaceColor.fill
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: hubUnlitColor.fill
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("linearGradient", {
				id: "seconds-hand-lit-gradient",
				gradientUnits: "userSpaceOnUse",
				x1: CX,
				y1: gradientStartY,
				x2: CX,
				y2: gradientEndY,
				children: handGradientStops.map((stop) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
					offset: `${stop.offset * 100}%`,
					stopColor: stop.color.fill
				}, stop.offset))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", {
				id: "seconds-hand-shadow",
				x: "-30%",
				y: "-10%",
				width: "170%",
				height: "130%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feDropShadow", {
					dx: "5",
					dy: "5",
					stdDeviation: "4",
					floodColor: "#000000",
					floodOpacity: "0.12"
				})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			filter: dynamicallyLit ? void 0 : "url(#seconds-hand-shadow)",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: ptsToPath(counterweight),
					fill: dynamicallyLit ? "url(#seconds-hand-lit-gradient)" : "url(#seconds-tail-gradient)",
					stroke: dynamicallyLit ? handGradientStops[handGradientStops.length - 1].color.stroke : "#555651",
					strokeWidth: 1.5
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: ptsToPath(upperBlade),
					fill: dynamicallyLit ? "url(#seconds-hand-lit-gradient)" : "#858681",
					stroke: dynamicallyLit ? handGradientStops[0].color.stroke : "#666762",
					strokeWidth: 1.728
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: CX,
					cy: CY,
					r: SECOND_HAND_HUB_RADIUS,
					fill: dynamicallyLit ? "url(#seconds-hub-lit-gradient)" : "url(#seconds-hub-gradient)",
					stroke: dynamicallyLit ? hubUnlitColor.stroke : "#565753",
					strokeWidth: 4
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: CX,
					cy: CY,
					r: 15,
					fill: dynamicallyLit ? "url(#seconds-hub-lit-gradient)" : "#343532"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: CX,
					cy: CY,
					r: 10,
					fill: dynamicallyLit ? "url(#seconds-pin-lit-gradient)" : "url(#seconds-pin-gradient)",
					stroke: dynamicallyLit ? hubUnlitColor.stroke : "#20211f",
					strokeWidth: 2
				}),
				!dynamicallyLit && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: CX - 3,
					cy: CY - 4,
					r: 3.5,
					fill: "#ffffff",
					opacity: .82
				})
			]
		})]
	});
}
function WeeklyCalendarWatch({ className = "", screensaver = false }) {
	const [opacityIdx, setOpacityIdx] = (0, import_react.useState)(0);
	const [referenceIdx, setReferenceIdx] = (0, import_react.useState)(1);
	const [drawVisible, setDrawVisible] = (0, import_react.useState)(true);
	const [textVisible, setTextVisible] = (0, import_react.useState)(false);
	const [guidesVisible, setGuidesVisible] = (0, import_react.useState)(false);
	const [handsVisible, setHandsVisible] = (0, import_react.useState)(true);
	const [markerMode, setMarkerMode] = (0, import_react.useState)("3d");
	const [uiVisible, setUiVisible] = (0, import_react.useState)(false);
	const [lightDiskPosition, setLightDiskPosition] = (0, import_react.useState)({
		u: -.6664,
		v: -.3543
	});
	const [markerLightBrightness, setMarkerLightBrightness] = (0, import_react.useState)(1.92);
	const [dateWindowLightSettings, setDateWindowLightSettings] = (0, import_react.useState)({
		softness: 12.9,
		castDistance: 18.3,
		castStrength: 1.11,
		wallStrength: 1.21,
		bevelStrength: .63
	});
	const initialClockTimeRef = (0, import_react.useRef)(Date.now());
	const initialCalendarDate = new Date(initialClockTimeRef.current);
	const initialDateWheelDay = initialCalendarDate.getDate();
	const initialIsoWeek = isoWeekCoordinates(initialCalendarDate);
	const calendarDayAnchorRef = (0, import_react.useRef)({
		dateWheelMonth: calendarMonthOrdinal(initialCalendarDate),
		isoWeekYear: initialIsoWeek.year,
		ordinal: localCalendarDayOrdinal(initialCalendarDate),
		weekday: initialCalendarDate.getDay()
	});
	const [dateRingRotation, setDateRingRotation] = (0, import_react.useState)(continuousDateWheelAngle(initialCalendarDate, calendarMonthOrdinal(initialCalendarDate), DATE_WHEEL_UNWRAPPED_ANGLES));
	const [dateWheelDay, setDateWheelDay] = (0, import_react.useState)(initialDateWheelDay);
	const [dateWheelManualDayOrdinal, setDateWheelManualDayOrdinal] = (0, import_react.useState)(null);
	const dateWheelSyncedDayOrdinalRef = (0, import_react.useRef)(localCalendarDayOrdinal(initialCalendarDate));
	const [weekHandVisible, setWeekHandVisible] = (0, import_react.useState)(true);
	const [dayHandVisible, setDayHandVisible] = (0, import_react.useState)(true);
	const [hourHandVisible, setHourHandVisible] = (0, import_react.useState)(true);
	const [minuteHandVisible, setMinuteHandVisible] = (0, import_react.useState)(true);
	const [secondsHandVisible, setSecondsHandVisible] = (0, import_react.useState)(true);
	const [selectedHand, setSelectedHand] = (0, import_react.useState)("second");
	const [manualHandAngles, setManualHandAngles] = (0, import_react.useState)({});
	const manualCalendarHandPeriodRef = (0, import_react.useRef)({});
	const [clockTimeMs, setClockTimeMs] = (0, import_react.useState)(initialClockTimeRef.current);
	const [timeScale, setTimeScale] = (0, import_react.useState)(1);
	const [timeRunning, setTimeRunning] = (0, import_react.useState)(true);
	const clockAnchorRef = (0, import_react.useRef)({
		realTimeMs: initialClockTimeRef.current,
		watchTimeMs: initialClockTimeRef.current
	});
	(0, import_react.useEffect)(() => {
		if (!timeRunning) return;
		const advanceClock = () => {
			const realTimeMs = Date.now();
			const anchor = clockAnchorRef.current;
			setClockTimeMs(anchor.watchTimeMs + (realTimeMs - anchor.realTimeMs) * timeScale);
		};
		const tickIntervalMs = screensaver ? 1e3 : Math.max(30, SECOND_HAND_TICK_MS / timeScale);
		let timerId;
		const tick = () => {
			advanceClock();
			const realTimeMs = Date.now();
			const anchor = clockAnchorRef.current;
			const phaseAlignedDelay = (SECOND_HAND_TICK_MS - ((anchor.watchTimeMs + (realTimeMs - anchor.realTimeMs) * timeScale) % SECOND_HAND_TICK_MS + SECOND_HAND_TICK_MS) % SECOND_HAND_TICK_MS) / timeScale;
			timerId = window.setTimeout(tick, tickIntervalMs > 30 ? Math.max(4, phaseAlignedDelay) : tickIntervalMs);
		};
		tick();
		return () => window.clearTimeout(timerId);
	}, [
		screensaver,
		timeRunning,
		timeScale
	]);
	(0, import_react.useEffect)(() => {
		if (clockTimeMs === null) return;
		const currentDate = new Date(clockTimeMs);
		const dayOrdinal = localCalendarDayOrdinal(currentDate);
		if (dateWheelManualDayOrdinal === dayOrdinal) return;
		if (dateWheelManualDayOrdinal === null && dateWheelSyncedDayOrdinalRef.current === dayOrdinal) return;
		const currentDay = currentDate.getDate();
		dateWheelSyncedDayOrdinalRef.current = dayOrdinal;
		setDateWheelManualDayOrdinal(null);
		setDateWheelDay(currentDay);
		setDateRingRotation(continuousDateWheelAngle(currentDate, calendarDayAnchorRef.current.dateWheelMonth, DATE_WHEEL_UNWRAPPED_ANGLES));
	}, [clockTimeMs, dateWheelManualDayOrdinal]);
	(0, import_react.useEffect)(() => {
		if (clockTimeMs === null) return;
		const currentDate = new Date(clockTimeMs);
		const currentIsoWeek = isoWeekCoordinates(currentDate);
		const currentPeriods = {
			day: localCalendarDayOrdinal(currentDate),
			week: currentIsoWeek.year * 100 + currentIsoWeek.week
		};
		const expiredHands = ["day", "week"].filter((hand) => manualCalendarHandPeriodRef.current[hand] !== void 0 && manualCalendarHandPeriodRef.current[hand] !== currentPeriods[hand]);
		if (expiredHands.length === 0) return;
		setManualHandAngles((angles) => {
			const nextAngles = { ...angles };
			expiredHands.forEach((hand) => {
				delete nextAngles[hand];
				delete manualCalendarHandPeriodRef.current[hand];
			});
			return nextAngles;
		});
	}, [clockTimeMs]);
	const clockTime = clockTimeMs === null ? null : new Date(clockTimeMs);
	const secondsWithMilliseconds = clockTime === null ? 0 : clockTime.getSeconds() + clockTime.getMilliseconds() / 1e3;
	const secondsHandRotation = clockTimeMs === null ? 0 : Math.floor(clockTimeMs % 6e4 / SECOND_HAND_TICK_MS) * SECOND_HAND_DEGREES_PER_TICK;
	const smoothSecondsHandRotation = clockTimeMs % 6e4 / 6e4 * 360;
	const displayedLiveSecondsHandRotation = timeScale > 10 ? smoothSecondsHandRotation : secondsHandRotation;
	const minuteHandAngle = clockTime === null ? MINUTE_HAND_ANGLE_DEG : (clockTime.getMinutes() + secondsWithMilliseconds / 60) * 6;
	const hourHandAngle = clockTime === null ? HOUR_HAND_ANGLE_DEG : (clockTime.getHours() % 12 + clockTime.getMinutes() / 60 + secondsWithMilliseconds / 3600) * 30;
	const weekHandAngle = WEEK_OFFSET_DEG + ((clockTime === null ? WEEK_HAND_REFERENCE_WEEK : continuousIsoWeek(clockTime, calendarDayAnchorRef.current.isoWeekYear, WEEK_COUNT)) - 1) * WEEK_STEP_DEG;
	const continuousDayIndex = clockTime === null ? DAY_HAND_REFERENCE_DAY : calendarDayAnchorRef.current.weekday + localCalendarDayOrdinal(clockTime) - calendarDayAnchorRef.current.ordinal;
	const liveHandAngles = {
		week: weekHandAngle,
		day: DAY_SECTOR_OFFSET_DEG - DAY_SECTOR_STEP_DEG / 2 + continuousDayIndex * DAY_SECTOR_STEP_DEG,
		hour: hourHandAngle,
		minute: minuteHandAngle,
		second: displayedLiveSecondsHandRotation
	};
	const effectiveHandAngle = (hand) => manualHandAngles[hand] ?? liveHandAngles[hand];
	const selectedManualAngle = manualHandAngles[selectedHand];
	const selectedHandAngle = selectedManualAngle !== void 0 && selectedManualAngle >= 0 && selectedManualAngle <= 360 ? selectedManualAngle : (effectiveHandAngle(selectedHand) % 360 + 360) % 360;
	const weekHandRotation = effectiveHandAngle("week") - WEEK_HAND_ANGLE_DEG;
	const dayHandRotation = effectiveHandAngle("day") - DAY_HAND_ANGLE_DEG;
	const hourHandRotation = effectiveHandAngle("hour") - HOUR_HAND_ANGLE_DEG;
	const minuteHandRotation = effectiveHandAngle("minute") - MINUTE_HAND_ANGLE_DEG;
	const displayedSecondsHandRotation = effectiveHandAngle("second");
	const lightHeight = Math.sqrt(Math.max(0, 1 - lightDiskPosition.u ** 2 - lightDiskPosition.v ** 2));
	const markerLightPosition = {
		x: CX + lightDiskPosition.u * LIGHT_HEMISPHERE_RADIUS,
		y: CY + lightDiskPosition.v * LIGHT_HEMISPHERE_RADIUS,
		z: lightHeight * LIGHT_HEMISPHERE_RADIUS
	};
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
			radius: GLYPH_GUIDE_CIRCLE_RADIUS
		})),
		...monthMarkers.map((marker) => ({
			key: `month-${marker.month}-${marker.index}`,
			...marker,
			radius: GLYPH_GUIDE_CIRCLE_RADIUS
		})),
		...dayMarkers.map((marker) => ({
			key: `day-${marker.day}-${marker.index}`,
			...marker,
			radius: GLYPH_GUIDE_CIRCLE_RADIUS
		}))
	];
	const mDots = minuteDots();
	const simulatedTimeAt = (realTimeMs) => {
		const anchor = clockAnchorRef.current;
		return anchor.watchTimeMs + (realTimeMs - anchor.realTimeMs) * timeScale;
	};
	const setTimeMultiplier = (multiplier) => {
		const realTimeMs = Date.now();
		const watchTimeMs = timeRunning ? simulatedTimeAt(realTimeMs) : clockTimeMs;
		const nextScale = timeScale === multiplier ? 1 : multiplier;
		clockAnchorRef.current = {
			realTimeMs,
			watchTimeMs
		};
		setClockTimeMs(watchTimeMs);
		setTimeScale(nextScale);
	};
	const resetTimeToNow = () => {
		const now = Date.now();
		const currentDate = new Date(now);
		const currentDay = currentDate.getDate();
		const currentIsoWeek = isoWeekCoordinates(currentDate);
		clockAnchorRef.current = {
			realTimeMs: now,
			watchTimeMs: now
		};
		calendarDayAnchorRef.current = {
			dateWheelMonth: calendarMonthOrdinal(currentDate),
			isoWeekYear: currentIsoWeek.year,
			ordinal: localCalendarDayOrdinal(currentDate),
			weekday: currentDate.getDay()
		};
		setClockTimeMs(now);
		setManualHandAngles({});
		manualCalendarHandPeriodRef.current = {};
		dateWheelSyncedDayOrdinalRef.current = localCalendarDayOrdinal(currentDate);
		setDateWheelManualDayOrdinal(null);
		setDateWheelDay(currentDay);
		setDateRingRotation(continuousDateWheelAngle(currentDate, calendarMonthOrdinal(currentDate), DATE_WHEEL_UNWRAPPED_ANGLES));
		setTimeRunning(true);
	};
	const toggleTimeRunning = () => {
		if (timeRunning) {
			const realTimeMs = Date.now();
			const watchTimeMs = simulatedTimeAt(realTimeMs);
			clockAnchorRef.current = {
				realTimeMs,
				watchTimeMs
			};
			setClockTimeMs(watchTimeMs);
			setTimeRunning(false);
			return;
		}
		clockAnchorRef.current = {
			realTimeMs: Date.now(),
			watchTimeMs: clockTimeMs
		};
		setTimeRunning(true);
	};
	const returnSelectedHandToLive = () => {
		if (selectedHand === "day" || selectedHand === "week") delete manualCalendarHandPeriodRef.current[selectedHand];
		setManualHandAngles((angles) => {
			const nextAngles = { ...angles };
			delete nextAngles[selectedHand];
			return nextAngles;
		});
		if (!timeRunning) {
			clockAnchorRef.current = {
				realTimeMs: Date.now(),
				watchTimeMs: clockTimeMs
			};
			setTimeRunning(true);
		}
	};
	const advanceCalendarHand = (hand, step) => {
		const currentDate = clockTime ?? /* @__PURE__ */ new Date();
		const currentIsoWeek = isoWeekCoordinates(currentDate);
		manualCalendarHandPeriodRef.current[hand] = hand === "day" ? localCalendarDayOrdinal(currentDate) : currentIsoWeek.year * 100 + currentIsoWeek.week;
		setManualHandAngles((angles) => ({
			...angles,
			[hand]: (angles[hand] ?? liveHandAngles[hand]) + step
		}));
		setSelectedHand(hand);
	};
	const advanceDateWheel = () => {
		const nextDay = dateWheelDay % DATE_WHEEL_CALIBRATION.dayCount + 1;
		const measuredTarget = DATE_WHEEL_CALIBRATION.measuredAnglesDeg[nextDay - 1];
		setDateWheelManualDayOrdinal(localCalendarDayOrdinal(clockTime ?? /* @__PURE__ */ new Date()));
		setDateRingRotation((angle) => {
			let unwrappedTarget = Math.floor(angle / 360) * 360 + measuredTarget;
			if (unwrappedTarget <= angle) unwrappedTarget += 360;
			return unwrappedTarget;
		});
		setDateWheelDay(nextDay);
	};
	const timeTab = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 text-black",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-1 text-[10px] font-bold",
					children: "Speed"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-1",
					children: [[
						10,
						100,
						1e3,
						1e4,
						1e5
					].map((multiplier) => {
						const active = timeScale === multiplier;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"aria-pressed": active,
							title: active ? "Return to real-time speed" : `Run time at ${multiplier}×`,
							onClick: () => setTimeMultiplier(multiplier),
							className: panelButtonClass(active),
							children: [multiplier.toLocaleString("en-US"), "x"]
						}, multiplier);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						title: "Reset the simulated watch to the current local time",
						onClick: resetTimeToNow,
						className: panelButtonClass(),
						children: "Now"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": !timeRunning,
					onClick: toggleTimeRunning,
					className: `mt-1 w-full ${panelButtonClass(!timeRunning)}`,
					children: timeRunning ? "Pause" : "Continue"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-1 text-[10px] font-bold",
					children: "Hand"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						"aria-label": "Hand",
						value: selectedHand,
						onChange: (event) => setSelectedHand(event.target.value),
						className: "min-w-0 flex-1 rounded-lg border border-black/25 bg-white px-2 py-1.5 text-xs font-semibold text-black",
						children: HAND_OPTIONS.map((hand) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: hand.value,
							children: hand.label
						}, hand.value))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
						className: "min-w-12 text-right text-xs font-semibold tabular-nums",
						children: [selectedHandAngle.toFixed(1), "°"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: manualHandAngles[selectedHand] === void 0,
					onClick: returnSelectedHandToLive,
					className: `mt-1 w-full ${panelButtonClass()} disabled:cursor-default disabled:opacity-40`,
					children: "Live"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-1 text-[10px] font-bold",
				children: "Advance"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => advanceCalendarHand("week", WEEK_STEP_DEG),
						className: panelButtonClass(),
						children: "Week +1"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => advanceCalendarHand("day", DAY_SECTOR_STEP_DEG),
						className: panelButtonClass(),
						children: "Day +1"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: advanceDateWheel,
						className: panelButtonClass(),
						children: "Date +1"
					})
				]
			})] })
		]
	});
	const layersTab = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3 text-black",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-1 text-[10px] font-bold",
				children: "Layers"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setOpacityIdx((i) => (i + 1) % PHOTO_OPACITY.length),
						className: panelButtonClass(),
						children: PHOTO_LABEL[opacityIdx]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setReferenceIdx((index) => (index + 1) % REFERENCE_IMAGES.length),
						className: panelButtonClass(),
						children: referenceImage.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": drawVisible,
						onClick: () => setDrawVisible((v) => !v),
						className: panelButtonClass(drawVisible),
						children: "Drawing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": textVisible,
						onClick: () => setTextVisible((visible) => !visible),
						className: panelButtonClass(textVisible),
						children: "Text"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": guidesVisible,
						onClick: () => setGuidesVisible((visible) => !visible),
						className: panelButtonClass(guidesVisible),
						children: "Guides"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": handsVisible,
						onClick: () => setHandsVisible((visible) => !visible),
						className: panelButtonClass(handsVisible),
						children: "Hands"
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-1 text-[10px] font-bold",
				children: "Hands"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": weekHandVisible,
						onClick: () => setWeekHandVisible((visible) => !visible),
						className: panelButtonClass(weekHandVisible),
						children: "Week"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": dayHandVisible,
						onClick: () => setDayHandVisible((visible) => !visible),
						className: panelButtonClass(dayHandVisible),
						children: "Day"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": hourHandVisible,
						onClick: () => setHourHandVisible((visible) => !visible),
						className: panelButtonClass(hourHandVisible),
						children: "Hour"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": minuteHandVisible,
						onClick: () => setMinuteHandVisible((visible) => !visible),
						className: panelButtonClass(minuteHandVisible),
						children: "Minute"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": secondsHandVisible,
						onClick: () => setSecondsHandVisible((visible) => !visible),
						className: panelButtonClass(secondsHandVisible),
						children: "Second"
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-1 text-[10px] font-bold",
				children: "Markers"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-pressed": markerMode === "3d",
				onClick: () => setMarkerMode((mode) => mode === "flat" ? "3d" : "flat"),
				className: `w-full ${panelButtonClass()}`,
				children: markerMode === "3d" ? "Markers: 3D" : "Markers: Flat"
			})] })
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex flex-col items-center gap-3 ${className}`,
		children: [
			!screensaver && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed left-3 top-3 z-40 flex items-center gap-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": uiVisible,
					"aria-label": "Toggle interface controls",
					title: "Interface controls",
					onClick: () => setUiVisible((visible) => !visible),
					className: "rounded-lg border-2 border-white/40 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
					children: "⚙️"
				})
			}),
			uiVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ControlPanel, {
				brightness: markerLightBrightness,
				dateWindowLight: dateWindowLightSettings,
				layersTab,
				position: lightDiskPosition,
				timeTab,
				onBrightnessChange: setMarkerLightBrightness,
				onChange: setLightDiskPosition,
				onDateWindowLightChange: setDateWindowLightSettings
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute inset-0 z-0",
						style: { clipPath: `inset(
              ${DATE_WINDOW_CLIP_TOP / IMG_H * 100}%
              ${(IMG_W - DATE_WINDOW_CLIP_RIGHT) / IMG_W * 100}%
              ${(IMG_H - DATE_WINDOW_CLIP_BOTTOM) / IMG_H * 100}%
              ${DATE_WINDOW_CLIP_LEFT / IMG_W * 100}%
              round 1px
            )` },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: publicAsset("date-ring-overlay.png"),
							alt: "",
							"aria-hidden": true,
							draggable: false,
							className: "absolute select-none transition-transform duration-[180ms] ease-[cubic-bezier(0.2,0.85,0.25,1)]",
							style: {
								left: `calc(${(CX - DATE_RING_DEFAULT_RADIUS) / IMG_W * 100}% + ${DATE_RING_OFFSET_X}px)`,
								top: `calc(${(CY - DATE_RING_DEFAULT_RADIUS) / IMG_H * 100}% + ${DATE_RING_OFFSET_Y}px)`,
								width: `${DATE_RING_DEFAULT_RADIUS * 2 / IMG_W * 100}%`,
								height: `${DATE_RING_DEFAULT_RADIUS * 2 / IMG_H * 100}%`,
								opacity: DATE_RING_OPACITY,
								transform: `rotate(${dateRingRotation}deg)`
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: referenceImage.src,
						alt: `${referenceImage.label} weekly calendar dial`,
						className: "relative z-10 block h-auto w-full select-none transition-opacity duration-200",
						style: { opacity: photoOpacity },
						draggable: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						className: "pointer-events-none absolute inset-0 z-20 h-full w-full transition-opacity duration-200",
						viewBox: `0 0 ${IMG_W} ${IMG_H}`,
						preserveAspectRatio: "xMidYMid meet",
						"aria-hidden": true,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
								className: "transition-opacity duration-200",
								style: { opacity: drawVisible ? 1 : 0 },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: CX,
										cy: CY,
										r: R_DIAL_EDGE,
										fill: "none",
										stroke: MAGENTA,
										strokeWidth: DIAL_STROKE_WIDTH
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: CX,
										cy: CY,
										r: R_WEEK_OUT,
										fill: "none",
										stroke: MAGENTA,
										strokeWidth: DIAL_STROKE_WIDTH
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: CX,
										cy: CY,
										r: R_WEEK_IN,
										fill: "none",
										stroke: MAGENTA,
										strokeWidth: DIAL_STROKE_WIDTH
									}),
									monthSectors.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
										x1: s.x1,
										y1: s.y1,
										x2: s.x2,
										y2: s.y2,
										stroke: MAGENTA,
										strokeWidth: DIAL_STROKE_WIDTH,
										strokeLinecap: "butt"
									}, `m${i}`)),
									weekSectors.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
										x1: s.x1,
										y1: s.y1,
										x2: s.x2,
										y2: s.y2,
										stroke: MAGENTA,
										strokeWidth: DIAL_STROKE_WIDTH,
										strokeLinecap: "butt"
									}, `w${i}`)),
									wDots.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: p.x,
										cy: p.y,
										r: WEEK_DOT_RADIUS,
										fill: MAGENTA,
										stroke: MAGENTA,
										strokeWidth: DIAL_STROKE_WIDTH
									}, `wd${i}`)),
									mDots.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: p.x,
										cy: p.y,
										r: MINUTE_DOT_RADIUS,
										fill: ORANGE
									}, `md${i}`)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: CX,
										cy: CY,
										r: R_DAY_OUT,
										fill: "none",
										stroke: CYAN,
										strokeWidth: DIAL_STROKE_WIDTH
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: CX,
										cy: CY,
										r: R_DAY_IN,
										fill: "none",
										stroke: CYAN,
										strokeWidth: DIAL_STROKE_WIDTH
									}),
									daySectors.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
										x1: s.x1,
										y1: s.y1,
										x2: s.x2,
										y2: s.y2,
										stroke: CYAN,
										strokeWidth: DIAL_STROKE_WIDTH,
										strokeLinecap: "butt"
									}, `day${i}`)),
									markerMode === "flat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										SINGLE_BATON_HOURS.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlatHourBaton, { degFrom12: hourAngleDeg(h) }, h)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlatHourBaton, {
											degFrom12: 0,
											lateralOffset: -30
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlatHourBaton, {
											degFrom12: 0,
											lateralOffset: BATON_12_LATERAL
										})
									] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										SINGLE_BATON_HOURS.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LitHourBaton, {
											degFrom12: hourAngleDeg(h),
											lightBrightness: markerLightBrightness,
											lightPosition: markerLightPosition
										}, h)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LitHourBaton, {
											degFrom12: 0,
											lateralOffset: -30,
											lightBrightness: markerLightBrightness,
											lightPosition: markerLightPosition
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LitHourBaton, {
											degFrom12: 0,
											lateralOffset: BATON_12_LATERAL,
											lightBrightness: markerLightBrightness,
											lightPosition: markerLightPosition
										})
									] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
								className: "transition-opacity duration-200",
								style: { opacity: textVisible ? 1 : 0 },
								children: [
									digitMarkers.map((marker) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
										x: marker.digitX,
										y: marker.digitY,
										transform: `rotate(${marker.rotation} ${marker.digitX} ${marker.digitY})`,
										fill: "#000000",
										fontFamily: "'Indie Flower', cursive",
										fontSize: WEEK_DIGIT_FONT_SIZE * marker.scale,
										fontWeight: 700,
										textAnchor: "middle",
										dominantBaseline: "central",
										children: marker.digit
									}, `digit-${marker.week}-${marker.index}`)),
									monthMarkers.map((marker) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
										x: marker.x,
										y: marker.y,
										transform: `rotate(${marker.rotation} ${marker.x} ${marker.y})`,
										fill: "#000000",
										fontFamily: "'Indie Flower', cursive",
										fontSize: MONTH_GLYPH_FONT_SIZE,
										fontWeight: 700,
										textAnchor: "middle",
										dominantBaseline: "central",
										children: marker.glyph.toUpperCase()
									}, `month-glyph-${marker.month}-${marker.index}`)),
									dayMarkers.map((marker) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
										x: marker.x,
										y: marker.y,
										transform: `rotate(${marker.rotation} ${marker.x} ${marker.y})`,
										fill: "#000000",
										fontFamily: "'Indie Flower', cursive",
										fontSize: DAY_GLYPH_FONT_SIZE,
										fontWeight: 700,
										textAnchor: "middle",
										dominantBaseline: "central",
										children: marker.glyph.toUpperCase()
									}, `day-glyph-${marker.day}-${marker.index}`))
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
								className: "transition-opacity duration-200",
								style: { opacity: drawVisible ? 1 : 0 },
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: CX,
										cy: CY,
										r: 37,
										fill: "#000000"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: CX,
										cy: CY,
										r: 7,
										fill: "#000000",
										stroke: "#000000",
										strokeWidth: DIAL_STROKE_WIDTH
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: CX,
										cy: CY,
										r: 10,
										fill: "#000000",
										stroke: "#000000",
										strokeWidth: DIAL_STROKE_WIDTH
									})
								]
							})
						]
					}),
					referenceIdx === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: `${publicAsset("date-window-shadow.png")}?v=2`,
						alt: "",
						"aria-hidden": true,
						draggable: false,
						className: "pointer-events-none absolute z-30 select-none transition-opacity duration-200",
						style: {
							left: `${SHADOW_CROP_X / IMG_W * 100}%`,
							top: `${SHADOW_CROP_Y / IMG_H * 100}%`,
							width: `${SHADOW_CROP_WIDTH / IMG_W * 100}%`,
							height: `${SHADOW_CROP_HEIGHT / IMG_H * 100}%`,
							opacity: photoOpacity * dateWindowLightSettings.bevelStrength
						}
					}),
					referenceIdx === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						className: "pointer-events-none absolute inset-0 z-[35] h-full w-full",
						viewBox: `0 0 ${IMG_W} ${IMG_H}`,
						preserveAspectRatio: "xMidYMid meet",
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateWindowLighting, {
							brightness: markerLightBrightness,
							position: lightDiskPosition,
							settings: dateWindowLightSettings
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						className: "pointer-events-none absolute inset-0 z-40 h-full w-full",
						viewBox: `0 0 ${IMG_W} ${IMG_H}`,
						preserveAspectRatio: "xMidYMid meet",
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							className: "transition-opacity duration-200",
							style: { opacity: handsVisible ? 1 : 0 },
							children: [
								dayHandVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayIndicatorHand, {
									lightBrightness: markerLightBrightness,
									lightPosition: markerLightPosition,
									mode: markerMode,
									rotation: dayHandRotation
								}),
								weekHandVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeekIndicatorHand, {
									lightBrightness: markerLightBrightness,
									lightPosition: markerLightPosition,
									mode: markerMode,
									rotation: weekHandRotation
								}),
								hourHandVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HourHand, {
									lightBrightness: markerLightBrightness,
									lightPosition: markerLightPosition,
									mode: markerMode,
									rotation: hourHandRotation
								}),
								minuteHandVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MinuteHand, {
									lightBrightness: markerLightBrightness,
									lightPosition: markerLightPosition,
									mode: markerMode,
									rotation: minuteHandRotation
								}),
								secondsHandVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecondsHand, {
									animatedOffsetSeconds: screensaver ? initialClockTimeRef.current % 6e4 / 1e3 : void 0,
									lightBrightness: markerLightBrightness,
									lightPosition: markerLightPosition,
									mode: markerMode,
									rotation: displayedSecondsHandRotation
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
						className: "pointer-events-none absolute inset-0 z-50 h-full w-full",
						viewBox: `0 0 ${IMG_W} ${IMG_H}`,
						preserveAspectRatio: "xMidYMid meet",
						"aria-hidden": true,
						style: { opacity: guidesVisible ? 1 : 0 },
						children: [guideMarkers.map((marker) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
							opacity: .72,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: CX,
								y1: CY,
								x2: marker.rayX,
								y2: marker.rayY,
								stroke: "#000000",
								strokeWidth: 7
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", {
								x1: CX,
								y1: CY,
								x2: marker.rayX,
								y2: marker.rayY,
								stroke: "#00ffff",
								strokeWidth: 3
							})]
						}, `ray-${marker.key}`)), guideMarkers.map((marker) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: marker.x,
							cy: marker.y,
							r: marker.radius + 5,
							fill: "none",
							stroke: "#000000",
							strokeWidth: 8
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
							cx: marker.x,
							cy: marker.y,
							r: marker.radius,
							fill: "none",
							stroke: "#00ff00",
							strokeWidth: 5
						})] }, marker.key))]
					})
				]
			})
		]
	});
}
/**
* Calibrated geometry and timing constants shared with the 3D viewer
* (`Watch3D`). Values stay declared above, co-located with the SVG drawing
* code, per docs/PROCESS.md §13.
*/
var WATCH_GEOMETRY = {
	IMG_W,
	IMG_H,
	CX,
	CY,
	R_DIAL_EDGE,
	R_DAY_IN,
	R_DAY_OUT,
	R_MINUTE,
	MINUTE_OFFSET_DEG,
	MINUTE_STEP_DEG,
	MINUTE_DOT_RADIUS,
	MINUTE_SKIP,
	R_WEEK_IN,
	R_WEEK_OUT,
	R_WEEK_DOT,
	WEEK_DOT_RADIUS,
	MONTH_SECTOR_OFFSET_DEG,
	DIAL_STROKE_WIDTH,
	DATE_RING_DEFAULT_RADIUS,
	DATE_RING_OFFSET_X,
	DATE_RING_OFFSET_Y,
	DATE_WHEEL_UNWRAPPED_ANGLES,
	DATE_WINDOW_CLIP_LEFT,
	DATE_WINDOW_CLIP_TOP,
	DATE_WINDOW_CLIP_RIGHT,
	DATE_WINDOW_CLIP_BOTTOM,
	R_BATON_OUT,
	R_BATON_IN,
	R_BATON_IN_APEX,
	R_BATON_IN_APEX_MIRROR,
	BATON_HALF_W,
	BATON_OUTER_END_DEPTH,
	BATON_12_LATERAL,
	MARKER_PRISM_HEIGHT,
	MARKER_BASE_HEIGHT,
	SINGLE_BATON_HOURS,
	hourAngleDeg,
	WEEK_COUNT,
	WEEK_OFFSET_DEG,
	WEEK_STEP_DEG,
	DAY_SECTOR_OFFSET_DEG,
	DAY_SECTOR_STEP_DEG,
	HOUR_HAND_TIP_RADIUS,
	HOUR_HAND_REAR_RADIUS,
	HOUR_HAND_BASE_RADIUS,
	HOUR_HAND_HALF_WIDTH,
	HOUR_HAND_TIP_HALF_WIDTH,
	HOUR_HAND_PRISM_HEIGHT,
	MINUTE_HAND_TIP_RADIUS,
	MINUTE_HAND_REAR_RADIUS,
	MINUTE_HAND_BASE_RADIUS,
	MINUTE_HAND_HALF_WIDTH,
	MINUTE_HAND_PRISM_HEIGHT,
	WEEK_HAND_HEAD_RADIUS,
	WEEK_HAND_SHAFT_START_RADIUS,
	WEEK_HAND_SHAFT_HALF_WIDTH,
	WEEK_HAND_HEAD_HALF_LENGTH,
	WEEK_HAND_HEAD_HALF_THICKNESS,
	DAY_HAND_HEAD_RADIUS,
	DAY_HAND_SHAFT_START_RADIUS,
	DAY_HAND_SHAFT_HALF_WIDTH,
	DAY_HAND_HEAD_HALF_LENGTH,
	DAY_HAND_HEAD_HALF_THICKNESS,
	SECOND_HAND_TIP_Y,
	SECOND_HAND_NECK_Y,
	SECOND_HAND_TIP_HALF_W,
	SECOND_HAND_NECK_HALF_W,
	SECOND_HAND_HUB_RADIUS,
	SECOND_HAND_TAIL_SHOULDER_Y,
	SECOND_HAND_TAIL_END_Y,
	SECOND_HAND_TAIL_POINT_Y,
	SECOND_HAND_TAIL_SHOULDER_HALF_W,
	SECOND_HAND_TAIL_END_HALF_W,
	SECOND_HAND_TICK_MS,
	SECOND_HAND_DEGREES_PER_TICK
};
var DEG = Math.PI / 180;
/**
* Scene units are photo pixels of the 2911×2683 orthographic reference, so
* every calibrated constant transfers directly. Photo coordinates map to
* three.js watch space as (x - CX, CY - y, z): +Y is 12 o'clock, +Z rises off
* the dial toward the viewer.
*
* Hand and marker meshes are built in "hand space" pointing at 12 o'clock
* (+Y = along, +X = lateral); a screen-clockwise dial angle θ becomes
* `rotation.z = -θ`.
*/
/** Vertical stack (photo px above the dial face). */
var STACK = {
	dateWheel: -75,
	movementBackdrop: -85,
	dayHand: 6,
	weekHand: 13,
	hourHand: 20,
	minuteHand: 30,
	secondsHand: 52
};
/**
* Dial plate thickness: the aperture walls run this deep; below them the
* recess opens into the air gap above the date wheel. Real proportion
* measured from macro photography: the visible cut edge is ~5-8% of the
* window width.
*/
var DIAL_THICKNESS = 27;
/** Corner radius of the date aperture (~8-10% of window width, per macro). */
var DATE_WINDOW_CORNER_RADIUS = 14;
var STUDIO_AZIMUTH = 130;
var DEFAULT_AZIMUTH = 148;
var DEFAULT_ELEVATION = 60;
var DEFAULT_LIGHT_INTENSITY = 2.55;
var DEFAULT_AMBIENT_INTENSITY = .75;
/**
* Angular footprint of the key softbox, sampled as a light cluster: one ray
* through the panel center plus a ring across its extent. Half-angle ~12°
* matches the penumbra measured on the reference photo's date window
* (gradient runs ~half the shadow band over a 34-unit recess depth).
*/
var AREA_LIGHT_SPREAD_DEG = 12;
var AREA_LIGHT_OFFSETS = [
	[0, 0],
	[1, 0],
	[-1, 0],
	[0, 1],
	[0, -1],
	[.7, .7],
	[-.7, -.7]
];
/** Aim the key cluster: each light offset in azimuth/elevation degrees. */
function positionKeyLights(lights, azimuthDeg, elevationDeg, spreadDeg = AREA_LIGHT_SPREAD_DEG, distance = LIGHT_DISTANCE) {
	for (let i = 0; i < lights.length; i++) {
		const [offsetAz, offsetEl] = AREA_LIGHT_OFFSETS[i];
		const azimuth = (azimuthDeg + offsetAz * spreadDeg) * DEG;
		const elevation = (elevationDeg + offsetEl * spreadDeg) * DEG;
		lights[i].position.set(Math.cos(azimuth) * Math.cos(elevation) * distance, Math.sin(azimuth) * Math.cos(elevation) * distance, Math.sin(elevation) * distance);
	}
}
function positionLightSourceVisual(panel, arrow, azimuthDeg, elevationDeg, halfAngleDeg, distance) {
	const azimuth = azimuthDeg * DEG;
	const elevation = elevationDeg * DEG;
	const direction = new Vector3(Math.cos(azimuth) * Math.cos(elevation), Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation)).normalize();
	const position = direction.clone().multiplyScalar(distance);
	const fullSize = 2 * distance * Math.tan(halfAngleDeg * DEG) * 1.35;
	panel.position.copy(position);
	panel.lookAt(0, 0, 0);
	panel.scale.set(fullSize, fullSize, 1);
	arrow.setDirection(direction);
	arrow.setLength(distance, 180, 90);
}
/**
* Product-photography light box, PMREM-prefiltered as the scene environment.
* A dark neutral room gives polished black metal deep darks; the panels are
* authored like a photographer's rig around the default key direction:
* a large key softbox up-left-front, a dim fill opposite, a long overhead
* strip for the sweeping bezel highlight, and a weak floor bounce. Colors
* above 1.0 are HDR radiance for the half-float PMREM capture.
*/
function buildStudioEnvironment() {
	const scene = new Scene();
	const geometries = [];
	const room = new Mesh(new BoxGeometry(20, 20, 20), new MeshBasicMaterial({
		color: 1053204,
		side: 1
	}));
	scene.add(room);
	const panel = (width, height, radiance, position) => {
		const geometry = new PlaneGeometry(width, height);
		geometries.push(geometry);
		const mesh = new Mesh(geometry, new MeshBasicMaterial({
			color: new Color(radiance, radiance, radiance),
			side: 2
		}));
		mesh.position.set(...position);
		mesh.lookAt(0, 0, 0);
		scene.add(mesh);
		return mesh;
	};
	panel(7, 5, 4, [
		-4.5,
		5.5,
		6
	]);
	panel(9.5, 7, 1.5, [
		-4.9,
		6,
		6.5
	]);
	panel(6, 4.5, 1.2, [
		6.5,
		-1.5,
		5.5
	]);
	panel(16, 1.6, 4, [
		.5,
		8.5,
		1.5
	]);
	panel(12, 8, .5, [
		0,
		-8.5,
		2
	]);
	return scene;
}
/**
* The 2D simulator calibrated the date-ring center offset in rendered CSS
* pixels at the 720px layout width; convert to photo pixels for the scene.
*/
var DATE_WHEEL_OFFSET_SCALE = WATCH_GEOMETRY.IMG_W / 720;
var DATE_RING_TEXTURE_RADIUS = 1150;
var DATE_RING_TEXTURE_MARGIN = 77;
var DATE_WHEEL_RADIUS_SCALE = 1227 / DATE_RING_TEXTURE_RADIUS;
var DATE_WHEEL_OUTER_RADIUS = WATCH_GEOMETRY.DATE_RING_DEFAULT_RADIUS * DATE_WHEEL_RADIUS_SCALE;
var FLAT_HAND_DEPTH = 4;
/** Triangle-fan mesh from a list of flat convex polygons (hand space). */
function polygonGeometry(polygons) {
	const positions = [];
	for (const polygon of polygons) for (let i = 1; i + 1 < polygon.length; i++) positions.push(...polygon[0], ...polygon[i], ...polygon[i + 1]);
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
	geometry.computeVertexNormals();
	return geometry;
}
function outlineGeometry(outline, depth) {
	const shape = new Shape();
	outline.forEach(([x, y], index) => {
		if (index === 0) shape.moveTo(x, y);
		else shape.lineTo(x, y);
	});
	return new ExtrudeGeometry(shape, {
		depth,
		bevelEnabled: false
	});
}
/**
* Applied hour marker — a triangular prism standing on a vertical-walled
* base slab (macro references show a polished vertical band running around
* the whole footprint; the top facets never reach the dial).
*
* The inner diamond is ONE flat grind plane through both eave corners and
* the inner ridge end. Its pointed tip terminates ABOVE the dial, on a
* vertical tip wall over the slab's pointed footprint — the facet never
* dives to the base (macro reference: the bright rhombus sits on dark slab
* material). The tip height is dictated by that plane's slope, keeping the
* facet exactly planar with no fold, and the plan view identical to the
* calibrated artwork.
*/
function batonGeometry() {
	const hw = WATCH_GEOMETRY.BATON_HALF_W;
	const ridgeHeight = WATCH_GEOMETRY.MARKER_PRISM_HEIGHT;
	const eaveHeight = WATCH_GEOMETRY.MARKER_BASE_HEIGHT;
	const tipHeight = eaveHeight - (ridgeHeight - eaveHeight) / (WATCH_GEOMETRY.R_BATON_IN_APEX - WATCH_GEOMETRY.R_BATON_IN) * (WATCH_GEOMETRY.R_BATON_IN - WATCH_GEOMETRY.R_BATON_IN_APEX_MIRROR);
	const outerLeftBottom = [
		-hw,
		WATCH_GEOMETRY.R_BATON_OUT,
		0
	];
	const outerRightBottom = [
		hw,
		WATCH_GEOMETRY.R_BATON_OUT,
		0
	];
	const outerLeftEave = [
		-hw,
		WATCH_GEOMETRY.R_BATON_OUT,
		eaveHeight
	];
	const outerRightEave = [
		hw,
		WATCH_GEOMETRY.R_BATON_OUT,
		eaveHeight
	];
	const innerLeftBottom = [
		-hw,
		WATCH_GEOMETRY.R_BATON_IN,
		0
	];
	const innerRightBottom = [
		hw,
		WATCH_GEOMETRY.R_BATON_IN,
		0
	];
	const innerLeftEave = [
		-hw,
		WATCH_GEOMETRY.R_BATON_IN,
		eaveHeight
	];
	const innerRightEave = [
		hw,
		WATCH_GEOMETRY.R_BATON_IN,
		eaveHeight
	];
	const outerRidge = [
		0,
		WATCH_GEOMETRY.R_BATON_OUT - WATCH_GEOMETRY.BATON_OUTER_END_DEPTH,
		ridgeHeight
	];
	const innerRidge = [
		0,
		WATCH_GEOMETRY.R_BATON_IN_APEX,
		ridgeHeight
	];
	const facetTip = [
		0,
		WATCH_GEOMETRY.R_BATON_IN_APEX_MIRROR,
		tipHeight
	];
	const slabTip = [
		0,
		WATCH_GEOMETRY.R_BATON_IN_APEX_MIRROR,
		0
	];
	return polygonGeometry([
		[
			outerLeftEave,
			outerRightEave,
			outerRidge
		],
		[
			outerLeftEave,
			outerRidge,
			innerRidge,
			innerLeftEave
		],
		[
			outerRightEave,
			innerRightEave,
			innerRidge,
			outerRidge
		],
		[
			facetTip,
			innerLeftEave,
			innerRidge,
			innerRightEave
		],
		[
			outerLeftBottom,
			outerRightBottom,
			outerRightEave,
			outerLeftEave
		],
		[
			outerLeftBottom,
			outerLeftEave,
			innerLeftEave,
			innerLeftBottom
		],
		[
			outerRightBottom,
			innerRightBottom,
			innerRightEave,
			outerRightEave
		],
		[
			slabTip,
			innerLeftBottom,
			innerLeftEave,
			facetTip
		],
		[
			slabTip,
			facetTip,
			innerRightEave,
			innerRightBottom
		]
	]);
}
/** Two-facet Dauphine hour hand with the solved planar ridge tip. */
function hourHandGeometry() {
	const ridgeRear = {
		x: 0,
		y: WATCH_GEOMETRY.HOUR_HAND_REAR_RADIUS,
		z: WATCH_GEOMETRY.HOUR_HAND_PRISM_HEIGHT
	};
	const positiveBase = {
		x: WATCH_GEOMETRY.HOUR_HAND_HALF_WIDTH,
		y: WATCH_GEOMETRY.HOUR_HAND_BASE_RADIUS,
		z: 0
	};
	const positiveTip = {
		x: WATCH_GEOMETRY.HOUR_HAND_TIP_HALF_WIDTH,
		y: WATCH_GEOMETRY.HOUR_HAND_TIP_RADIUS,
		z: 0
	};
	const ridgeTipHeight = planeHeightAt(ridgeRear, positiveTip, positiveBase, 0, WATCH_GEOMETRY.HOUR_HAND_TIP_RADIUS);
	const rr = [
		ridgeRear.x,
		ridgeRear.y,
		ridgeRear.z
	];
	const ridgeTip = [
		0,
		WATCH_GEOMETRY.HOUR_HAND_TIP_RADIUS,
		ridgeTipHeight
	];
	const posBase = [
		positiveBase.x,
		positiveBase.y,
		0
	];
	const posTip = [
		positiveTip.x,
		positiveTip.y,
		0
	];
	const negBase = [
		-positiveBase.x,
		positiveBase.y,
		0
	];
	const negTip = [
		-positiveTip.x,
		positiveTip.y,
		0
	];
	return polygonGeometry([[
		rr,
		posBase,
		posTip,
		ridgeTip
	], [
		rr,
		ridgeTip,
		negTip,
		negBase
	]]);
}
/** Two-facet Dauphine minute hand (full-height ridge to the pointed tip). */
function minuteHandGeometry() {
	const ridgeRear = [
		0,
		WATCH_GEOMETRY.MINUTE_HAND_REAR_RADIUS,
		WATCH_GEOMETRY.MINUTE_HAND_PRISM_HEIGHT
	];
	const ridgeTip = [
		0,
		WATCH_GEOMETRY.MINUTE_HAND_TIP_RADIUS,
		WATCH_GEOMETRY.MINUTE_HAND_PRISM_HEIGHT
	];
	const negativeBase = [
		-WATCH_GEOMETRY.MINUTE_HAND_HALF_WIDTH,
		WATCH_GEOMETRY.MINUTE_HAND_BASE_RADIUS,
		0
	];
	const positiveBase = [
		WATCH_GEOMETRY.MINUTE_HAND_HALF_WIDTH,
		WATCH_GEOMETRY.MINUTE_HAND_BASE_RADIUS,
		0
	];
	return polygonGeometry([[
		ridgeRear,
		negativeBase,
		ridgeTip
	], [
		ridgeRear,
		ridgeTip,
		positiveBase
	]]);
}
/** Red annular-sector hammer head, concentric with its dial rail. */
function hammerHeadGeometry(headRadius, halfLength, halfThickness, depth) {
	const halfAngle = halfLength / headRadius;
	const start = Math.PI / 2 - halfAngle;
	const end = Math.PI / 2 + halfAngle;
	const shape = new Shape();
	shape.absarc(0, 0, headRadius + halfThickness, start, end, false);
	shape.absarc(0, 0, headRadius - halfThickness, end, start, true);
	return new ExtrudeGeometry(shape, {
		depth,
		bevelEnabled: false,
		curveSegments: 24
	});
}
/**
* Rounded-rect outline of the date aperture in watch coords (y up), traced
* clockwise when seen from the front. Shared contract with the texture punch
* in `punchDateWindow` so walls and hole coincide exactly.
*/
function dateWindowOutline(cornerDivisions = 16) {
	const left = WATCH_GEOMETRY.DATE_WINDOW_CLIP_LEFT - WATCH_GEOMETRY.CX;
	const right = WATCH_GEOMETRY.DATE_WINDOW_CLIP_RIGHT - WATCH_GEOMETRY.CX;
	const top = WATCH_GEOMETRY.CY - WATCH_GEOMETRY.DATE_WINDOW_CLIP_TOP;
	const bottom = WATCH_GEOMETRY.CY - WATCH_GEOMETRY.DATE_WINDOW_CLIP_BOTTOM;
	const r = DATE_WINDOW_CORNER_RADIUS;
	const shape = new Shape();
	shape.moveTo(left + r, bottom);
	shape.lineTo(right - r, bottom);
	shape.absarc(right - r, bottom + r, r, -Math.PI / 2, 0, false);
	shape.lineTo(right, top - r);
	shape.absarc(right - r, top - r, r, 0, Math.PI / 2, false);
	shape.lineTo(left + r, top);
	shape.absarc(left + r, top - r, r, Math.PI / 2, Math.PI, false);
	shape.lineTo(left, bottom + r);
	shape.absarc(left + r, bottom + r, r, Math.PI, Math.PI * 1.5, false);
	shape.closePath();
	return shape.getPoints(cornerDivisions);
}
/** Default angular half-size of the square key emitter (a big softbox). */
var EMITTER_HALF_ANGLE_DEG = 19;
/**
* Full photon-computed shading for the date recess. For every point on the
* wheel plane near the aperture, two integrals:
*
* 1. Key term — a SQUARE area emitter around the key direction: a grid of
*    rays across the emitter's angular extent, each tested against the
*    rounded-rect opening (at both the dial face and the plate bottom).
*    Exact area-light shadow: continuous penumbra, no sampling bands.
* 2. Ambient term — cosine-weighted view factor of the opening (the share
*    of diffuse sky the point sees), so corners where no photons reach stay
*    genuinely dark and the falloff never plateaus.
*
* The sum is normalized into an 8-bit map (returned scale restores absolute
* brightness via lightMapIntensity). The wheel renders UNLIT with this map
* as its entire illumination — scene lights and shadow maps never touch it.
* Re-baked when the light rig changes; counter-rotated per frame so the
* shading stays pinned to the aperture while the disc turns beneath it.
*/
function bakeDateWheelShading(canvas, azimuthDeg, elevationDeg, keyTerm, ambientTerm, emitterHalfAngleDeg = EMITTER_HALF_ANGLE_DEG, dialThickness = DIAL_THICKNESS, dateWheelDepth = -STACK.dateWheel) {
	const SIZE = canvas.width;
	const radius = WATCH_GEOMETRY.DATE_RING_DEFAULT_RADIUS;
	const wheelCenterX = WATCH_GEOMETRY.DATE_RING_OFFSET_X * DATE_WHEEL_OFFSET_SCALE;
	const wheelCenterY = -WATCH_GEOMETRY.DATE_RING_OFFSET_Y * DATE_WHEEL_OFFSET_SCALE;
	const left = WATCH_GEOMETRY.DATE_WINDOW_CLIP_LEFT - WATCH_GEOMETRY.CX;
	const right = WATCH_GEOMETRY.DATE_WINDOW_CLIP_RIGHT - WATCH_GEOMETRY.CX;
	const top = WATCH_GEOMETRY.CY - WATCH_GEOMETRY.DATE_WINDOW_CLIP_TOP;
	const bottom = WATCH_GEOMETRY.CY - WATCH_GEOMETRY.DATE_WINDOW_CLIP_BOTTOM;
	const corner = DATE_WINDOW_CORNER_RADIUS;
	const depth = dateWheelDepth;
	const margin = 120;
	const insideAperture = (x, y) => {
		if (x < left || x > right || y < bottom || y > top) return false;
		const dx = Math.max(0, Math.max(left + corner - x, x - (right - corner)));
		const dy = Math.max(0, Math.max(bottom + corner - y, y - (top - corner)));
		return dx * dx + dy * dy <= corner * corner;
	};
	const plastic = 1.324717957244746;
	const r2x = 1 / plastic;
	const r2y = 1 / (plastic * plastic);
	const fract = (value) => value - Math.floor(value);
	const azimuth = azimuthDeg * DEG;
	const elevation = elevationDeg * DEG;
	const d = new Vector3(Math.cos(azimuth) * Math.cos(elevation), Math.sin(azimuth) * Math.cos(elevation), Math.sin(elevation));
	const u = new Vector3().crossVectors(d, new Vector3(0, 0, 1)).normalize();
	const v = new Vector3().crossVectors(u, d).normalize();
	const spread = Math.tan(emitterHalfAngleDeg * DEG) * 1.35;
	const EMITTER_SAMPLES = 4096;
	const faceOffsetX = new Float64Array(EMITTER_SAMPLES);
	const faceOffsetY = new Float64Array(EMITTER_SAMPLES);
	const plateOffsetX = new Float64Array(EMITTER_SAMPLES);
	const plateOffsetY = new Float64Array(EMITTER_SAMPLES);
	const weights = new Float64Array(EMITTER_SAMPLES);
	let unoccluded = 0;
	const sample = new Vector3();
	for (let i = 0; i < EMITTER_SAMPLES; i++) {
		const a = (fract(.5 + (i + 1) * r2x) - .5) * 2;
		const b = (fract(.5 + (i + 1) * r2y) - .5) * 2;
		const window = (.5 + .5 * Math.cos(a * Math.PI)) * (.5 + .5 * Math.cos(b * Math.PI));
		sample.copy(d).addScaledVector(u, a * spread).addScaledVector(v, b * spread).normalize();
		if (sample.z <= .02) continue;
		const tFace = depth / sample.z;
		const tPlate = (depth - dialThickness) / sample.z;
		faceOffsetX[i] = tFace * sample.x;
		faceOffsetY[i] = tFace * sample.y;
		plateOffsetX[i] = tPlate * sample.x;
		plateOffsetY[i] = tPlate * sample.y;
		weights[i] = window * sample.z;
		unoccluded += weights[i];
	}
	const keyFraction = (px, py) => {
		let sum = 0;
		for (let i = 0; i < EMITTER_SAMPLES; i++) if (weights[i] > 0 && insideAperture(px + faceOffsetX[i], py + faceOffsetY[i]) && insideAperture(px + plateOffsetX[i], py + plateOffsetY[i])) sum += weights[i];
		return sum / unoccluded;
	};
	const APERTURE_SAMPLES = 2048;
	const apertureSamples = [];
	for (let i = 0; apertureSamples.length < APERTURE_SAMPLES; i++) {
		const ax = left + fract(.173 + (i + 1) * r2x) * (right - left);
		const ay = bottom + fract(.619 + (i + 1) * r2y) * (top - bottom);
		if (insideAperture(ax, ay)) apertureSamples.push([ax, ay]);
	}
	const sampleArea = ((right - left) * (top - bottom) - (4 - Math.PI) * corner * corner) / APERTURE_SAMPLES;
	const viewFactor = (px, py) => {
		let sum = 0;
		for (const [ax, ay] of apertureSamples) {
			const rx = ax - px;
			const ry = ay - py;
			const r2 = rx * rx + ry * ry + depth * depth;
			sum += depth * depth / (Math.PI * r2 * r2);
		}
		return sum * sampleArea;
	};
	const centerVF = viewFactor((left + right) / 2, (top + bottom) / 2);
	const scale = keyTerm + ambientTerm;
	const ctx = canvas.getContext("2d");
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.fillRect(0, 0, SIZE, SIZE);
	const image = ctx.getImageData(0, 0, SIZE, SIZE);
	const data = image.data;
	const x0 = Math.floor(((left - margin - wheelCenterX) / (2 * radius) + .5) * SIZE);
	const x1 = Math.ceil(((right + margin - wheelCenterX) / (2 * radius) + .5) * SIZE);
	const rowFor = (y) => (.5 - (y - wheelCenterY) / (2 * radius)) * SIZE;
	const y0 = Math.floor(rowFor(top + margin));
	const y1 = Math.ceil(rowFor(bottom - margin));
	for (let row = y0; row <= y1; row++) {
		const y = wheelCenterY + (.5 - (row + .5) / SIZE) * 2 * radius;
		for (let col = x0; col <= x1; col++) {
			const x = wheelCenterX + ((col + .5) / SIZE - .5) * 2 * radius;
			const value = (keyFraction(x, y) * keyTerm + Math.min(1, viewFactor(x, y) / centerVF) * ambientTerm) / scale;
			const byte = Math.round(Math.min(1, value) * 255);
			const p = (row * SIZE + col) * 4;
			data[p] = byte;
			data[p + 1] = byte;
			data[p + 2] = byte;
			data[p + 3] = 255;
		}
	}
	ctx.putImageData(image, 0, 0);
	return scale;
}
/**
* Aperture walls: a rounded-rect band running from the dial face down to the
* bottom of the dial plate. The real cut edge is lacquered the same cream as
* the dial face; a vertex-color gradient darkens it toward the bottom for
* contact occlusion.
*/
function dateWindowWallGeometry(dialThickness = DIAL_THICKNESS) {
	const points = dateWindowOutline();
	const positions = [];
	const colors = [];
	const topColor = new Color(13617082);
	const bottomColor = new Color(7235420);
	for (let i = 0; i < points.length; i++) {
		const a = points[i];
		const b = points[(i + 1) % points.length];
		positions.push(a.x, a.y, 0, b.x, b.y, 0, b.x, b.y, -dialThickness);
		positions.push(a.x, a.y, 0, b.x, b.y, -dialThickness, a.x, a.y, -dialThickness);
		colors.push(...topColor.toArray(), ...topColor.toArray(), ...bottomColor.toArray());
		colors.push(...topColor.toArray(), ...bottomColor.toArray(), ...bottomColor.toArray());
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
	geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
	geometry.computeVertexNormals();
	return geometry;
}
/**
* The photo's date aperture was cut with a feathered, oversized alpha edge
* (hole 180×146 vs the 164×130 aperture) that bakes in a white halo from the
* original photo's window highlight. Repaint the zone with dial cream, then
* punch a crisp rounded-rect hole matching `dateWindowOutline` exactly, so
* the texture cutout and the wall geometry share one contract.
*/
function punchDateWindow(ctx) {
	const margin = 24;
	const left = WATCH_GEOMETRY.DATE_WINDOW_CLIP_LEFT;
	const top = WATCH_GEOMETRY.DATE_WINDOW_CLIP_TOP;
	const width = WATCH_GEOMETRY.DATE_WINDOW_CLIP_RIGHT - WATCH_GEOMETRY.DATE_WINDOW_CLIP_LEFT;
	const height = WATCH_GEOMETRY.DATE_WINDOW_CLIP_BOTTOM - WATCH_GEOMETRY.DATE_WINDOW_CLIP_TOP;
	ctx.save();
	ctx.fillStyle = "#eee8e0";
	ctx.fillRect(left - margin, top - margin, width + margin * 2, height + margin * 2);
	ctx.globalCompositeOperation = "destination-out";
	ctx.beginPath();
	ctx.roundRect(left, top, width, height, DATE_WINDOW_CORNER_RADIUS);
	ctx.fill();
	ctx.restore();
}
/**
* The photograph bakes in a soft shadow ring where the case bezel meets the
* dial (r ≈ 1010–1024), and the hand-removal inpainting flattened it in
* patches — so once the bezel itself is painted over, the leftover shadow
* reads as a broken gray arc under close-up. Replace that shadowed cream with
* clean dial cream, pixel by pixel, protecting printed month letters and
* their antialiased edges (measured: no pure-shadow pixel has max(RGB) < 150
* unless it touches real ink).
*/
function cleanBezelShadow(ctx) {
	const R_INNER = 998;
	const R_SOLID = 1010;
	const R_OUTER = WATCH_GEOMETRY.R_DIAL_EDGE + 8;
	const INK_MAX = 150;
	const PROTECT = 2;
	const CREAM = [
		238,
		232,
		224
	];
	const size = (Math.ceil(R_OUTER) + PROTECT + 1) * 2;
	const x0 = Math.round(WATCH_GEOMETRY.CX) - size / 2;
	const y0 = Math.round(WATCH_GEOMETRY.CY) - size / 2;
	const image = ctx.getImageData(x0, y0, size, size);
	const data = image.data;
	const ink = new Uint8Array(size * size);
	for (let i = 0; i < ink.length; i++) {
		const p = i * 4;
		if (Math.max(data[p], data[p + 1], data[p + 2]) < INK_MAX) ink[i] = 1;
	}
	for (let y = 0; y < size; y++) {
		const dy = y0 + y + .5 - WATCH_GEOMETRY.CY;
		for (let x = 0; x < size; x++) {
			const dx = x0 + x + .5 - WATCH_GEOMETRY.CX;
			const r = Math.hypot(dx, dy);
			if (r < R_INNER || r > R_OUTER) continue;
			const idx = y * size + x;
			if (ink[idx]) continue;
			let nearInk = false;
			for (let oy = -2; oy <= PROTECT && !nearInk; oy++) {
				const row = (y + oy) * size + x;
				for (let ox = -2; ox <= PROTECT; ox++) if (ink[row + ox]) {
					nearInk = true;
					break;
				}
			}
			if (nearInk) continue;
			const p = idx * 4;
			if (data[p + 3] < 200) continue;
			const t = r >= R_SOLID ? 1 : (r - R_INNER) / (R_SOLID - R_INNER);
			data[p] += (CREAM[0] - data[p]) * t;
			data[p + 1] += (CREAM[1] - data[p + 1]) * t;
			data[p + 2] += (CREAM[2] - data[p + 2]) * t;
		}
	}
	ctx.putImageData(image, x0, y0);
}
/**
* Draw the calibrated dial linework (the 2D view's "Drawing" layer) into the
* dial texture: rails, sector lines, week dots, and minute markers. Without
* this, the 3D dial only shows the photo's faint printed lines.
*/
function drawDialLinework(ctx) {
	const point = (deg, radius) => ({
		x: WATCH_GEOMETRY.CX + Math.sin(deg * DEG) * radius,
		y: WATCH_GEOMETRY.CY - Math.cos(deg * DEG) * radius
	});
	ctx.strokeStyle = "#000000";
	ctx.fillStyle = "#000000";
	ctx.lineWidth = WATCH_GEOMETRY.DIAL_STROKE_WIDTH;
	const circle = (radius, fill = false) => {
		ctx.beginPath();
		ctx.arc(WATCH_GEOMETRY.CX, WATCH_GEOMETRY.CY, radius, 0, Math.PI * 2);
		if (fill) ctx.fill();
		else ctx.stroke();
	};
	const radialLine = (deg, r0, r1) => {
		const from = point(deg, r0);
		const to = point(deg, r1);
		ctx.beginPath();
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.stroke();
	};
	const dot = (deg, radius, dotRadius) => {
		const center = point(deg, radius);
		ctx.beginPath();
		ctx.arc(center.x, center.y, dotRadius, 0, Math.PI * 2);
		ctx.fill();
	};
	circle(WATCH_GEOMETRY.R_DIAL_EDGE);
	circle(WATCH_GEOMETRY.R_WEEK_OUT);
	circle(WATCH_GEOMETRY.R_WEEK_IN);
	circle(WATCH_GEOMETRY.R_DAY_OUT);
	circle(WATCH_GEOMETRY.R_DAY_IN);
	for (let k = 0; k < 12; k++) radialLine(WATCH_GEOMETRY.MONTH_SECTOR_OFFSET_DEG + k * 30, WATCH_GEOMETRY.R_WEEK_OUT, WATCH_GEOMETRY.R_DIAL_EDGE);
	for (let k = 1; k < WATCH_GEOMETRY.WEEK_COUNT; k += 2) {
		const deg = WATCH_GEOMETRY.WEEK_OFFSET_DEG + k * WATCH_GEOMETRY.WEEK_STEP_DEG;
		radialLine(deg, WATCH_GEOMETRY.R_WEEK_IN, WATCH_GEOMETRY.R_WEEK_OUT);
		dot(deg, WATCH_GEOMETRY.R_WEEK_DOT, WATCH_GEOMETRY.WEEK_DOT_RADIUS + WATCH_GEOMETRY.DIAL_STROKE_WIDTH / 2);
	}
	for (let k = 0; k < 7; k++) radialLine(WATCH_GEOMETRY.DAY_SECTOR_OFFSET_DEG + k * WATCH_GEOMETRY.DAY_SECTOR_STEP_DEG, WATCH_GEOMETRY.R_DAY_IN, WATCH_GEOMETRY.R_DAY_OUT);
	for (let k = 0; k < 60; k++) {
		if (WATCH_GEOMETRY.MINUTE_SKIP.has(k)) continue;
		dot(WATCH_GEOMETRY.MINUTE_OFFSET_DEG + k * WATCH_GEOMETRY.MINUTE_STEP_DEG, WATCH_GEOMETRY.R_MINUTE, WATCH_GEOMETRY.MINUTE_DOT_RADIUS);
	}
	circle(37, true);
}
var ELEMENT_OPTIONS = [
	{
		key: "dial",
		label: "Main dial"
	},
	{
		key: "markers",
		label: "Markers"
	},
	{
		key: "dateWheel",
		label: "Date wheel"
	},
	{
		key: "week",
		label: "Week"
	},
	{
		key: "day",
		label: "Day"
	},
	{
		key: "hour",
		label: "Hour"
	},
	{
		key: "minute",
		label: "Minute"
	},
	{
		key: "second",
		label: "Second"
	}
];
var HAND_KEYS = [
	"week",
	"day",
	"hour",
	"minute",
	"second"
];
var DEFAULT_DATE_DISK = {
	x: 24,
	y: 0,
	dayOffset: 25,
	scale: .889
};
var DEFAULT_DATE_STRUCTURE = {
	dialThickness: DIAL_THICKNESS,
	dateWheelGap: -STACK.dateWheel - DIAL_THICKNESS
};
var DEFAULT_DATE_WHEEL_BAND = {
	x: -1,
	y: -2,
	radius: .83,
	width: .42
};
var DEFAULT_DATE_WHEEL_SQUEEZE = {
	axisAngle: 0,
	scale: .995
};
var SHOW_DATE_CALIBRATION_CONTROLS = false;
var LIGHT_DISTANCE = 5e3;
function toggleButtonClass(active) {
	return `rounded-lg border px-2 py-1.5 text-xs font-semibold transition active:scale-95 ${active ? "border-black bg-black text-white hover:bg-zinc-800" : "border-black/25 bg-white text-black hover:bg-zinc-100"}`;
}
function Watch3D({ className = "" }) {
	const containerRef = (0, import_react.useRef)(null);
	const lightTrackballRef = (0, import_react.useRef)(null);
	const sceneRef = (0, import_react.useRef)(null);
	const dateDiskRef = (0, import_react.useRef)({ ...DEFAULT_DATE_DISK });
	const dateStructureRef = (0, import_react.useRef)({ ...DEFAULT_DATE_STRUCTURE });
	const dateWheelSqueezeRef = (0, import_react.useRef)({ ...DEFAULT_DATE_WHEEL_SQUEEZE });
	const [resetView, setResetView] = (0, import_react.useState)(null);
	const [panelOpen, setPanelOpen] = (0, import_react.useState)(false);
	const [settingsTab, setSettingsTab] = (0, import_react.useState)("elements");
	const [showLightSource, setShowLightSource] = (0, import_react.useState)(true);
	const [showDateWheelBand, setShowDateWheelBand] = (0, import_react.useState)(false);
	const [visibility, setVisibility] = (0, import_react.useState)({
		dial: true,
		markers: false,
		dateWheel: true,
		week: false,
		day: false,
		hour: false,
		minute: false,
		second: false
	});
	const [light, setLight] = (0, import_react.useState)({
		azimuth: DEFAULT_AZIMUTH,
		elevation: DEFAULT_ELEVATION,
		intensity: DEFAULT_LIGHT_INTENSITY,
		ambient: DEFAULT_AMBIENT_INTENSITY,
		size: EMITTER_HALF_ANGLE_DEG,
		distance: LIGHT_DISTANCE
	});
	const [dateDisk, setDateDisk] = (0, import_react.useState)({ ...DEFAULT_DATE_DISK });
	const [dateStructure, setDateStructure] = (0, import_react.useState)({ ...DEFAULT_DATE_STRUCTURE });
	const [dateWheelBand, setDateWheelBand] = (0, import_react.useState)({ ...DEFAULT_DATE_WHEEL_BAND });
	const [dateWheelSqueeze, setDateWheelSqueeze] = (0, import_react.useState)({ ...DEFAULT_DATE_WHEEL_SQUEEZE });
	dateDiskRef.current = dateDisk;
	dateStructureRef.current = dateStructure;
	dateWheelSqueezeRef.current = dateWheelSqueeze;
	(0, import_react.useEffect)(() => {
		const container = containerRef.current;
		if (!container) return;
		const renderer = new WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.toneMapping = 4;
		renderer.toneMappingExposure = 1.22;
		renderer.outputColorSpace = SRGBColorSpace;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = 1;
		container.appendChild(renderer.domElement);
		const scene = new Scene();
		scene.background = new Color(15854048);
		const pmrem = new PMREMGenerator(renderer);
		const environment = pmrem.fromScene(buildStudioEnvironment(), .04);
		scene.environment = environment.texture;
		scene.environmentIntensity = DEFAULT_AMBIENT_INTENSITY;
		scene.environmentRotation.set(0, 0, (DEFAULT_AZIMUTH - STUDIO_AZIMUTH) * DEG);
		const keyLights = [];
		for (let i = 0; i < AREA_LIGHT_OFFSETS.length; i++) {
			const keyLight = new DirectionalLight(16777215, DEFAULT_LIGHT_INTENSITY / AREA_LIGHT_OFFSETS.length);
			keyLight.castShadow = true;
			keyLight.shadow.mapSize.set(2048, 2048);
			keyLight.shadow.camera.left = -1300;
			keyLight.shadow.camera.right = 1300;
			keyLight.shadow.camera.top = 1300;
			keyLight.shadow.camera.bottom = -1300;
			keyLight.shadow.camera.near = 2e3;
			keyLight.shadow.camera.far = 9e3;
			keyLight.shadow.camera.updateProjectionMatrix();
			keyLight.shadow.bias = -2e-4;
			keyLight.shadow.normalBias = 4;
			keyLight.shadow.radius = 4;
			scene.add(keyLight);
			keyLights.push(keyLight);
		}
		positionKeyLights(keyLights, DEFAULT_AZIMUTH, DEFAULT_ELEVATION);
		const lightSource = new Group();
		lightSource.name = "Key softbox visualization";
		const lightSourcePanel = new Group();
		const sourcePlaneGeometry = new PlaneGeometry(1, 1);
		const sourceFabric = new Mesh(sourcePlaneGeometry, new MeshBasicMaterial({
			color: 16775391,
			side: 0,
			transparent: true,
			opacity: .78,
			depthWrite: false,
			toneMapped: false
		}));
		const sourceBacking = new Mesh(sourcePlaneGeometry, new MeshBasicMaterial({
			color: 1513239,
			side: 1,
			transparent: true,
			opacity: .22,
			depthWrite: false,
			toneMapped: false
		}));
		const sourceOutline = new LineSegments(new EdgesGeometry(sourcePlaneGeometry), new LineBasicMaterial({
			color: 16738816,
			toneMapped: false
		}));
		sourceOutline.position.z = 2;
		const sourceFrameMaterial = new MeshBasicMaterial({
			color: 16738816,
			side: 2,
			toneMapped: false
		});
		const sourceFrame = new Group();
		const addFrameBar = (width, height, x, y) => {
			const bar = new Mesh(new PlaneGeometry(width, height), sourceFrameMaterial);
			bar.position.set(x, y, 3);
			sourceFrame.add(bar);
		};
		addFrameBar(1, .025, 0, .4875);
		addFrameBar(1, .025, 0, -.4875);
		addFrameBar(.025, .95, .4875, 0);
		addFrameBar(.025, .95, -.4875, 0);
		lightSourcePanel.add(sourceFabric, sourceBacking, sourceOutline, sourceFrame);
		lightSource.add(lightSourcePanel);
		const lightSourceArrow = new ArrowHelper(new Vector3(0, 0, 1), new Vector3(0, 0, 30), LIGHT_DISTANCE, 16738816, 180, 90);
		lightSource.add(lightSourceArrow);
		scene.add(lightSource);
		positionLightSourceVisual(lightSourcePanel, lightSourceArrow, DEFAULT_AZIMUTH, DEFAULT_ELEVATION, EMITTER_HALF_ANGLE_DEG, LIGHT_DISTANCE);
		const camera = new PerspectiveCamera(36, container.clientWidth / Math.max(1, container.clientHeight), 10, 4e4);
		camera.position.set(0, 0, 4300);
		const controls = new TrackballControls(camera, renderer.domElement);
		controls.rotateSpeed = 3;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = .8;
		controls.dynamicDampingFactor = .12;
		controls.minDistance = 400;
		controls.maxDistance = 3e4;
		controls.target.set(0, 0, 0);
		const textureLoader = new TextureLoader();
		const dateWheelTexture = textureLoader.load(`/date-ring-overlay.png`, (texture) => {
			const image = texture.image;
			const canvas = document.createElement("canvas");
			const imageWidth = image.naturalWidth || image.width;
			const imageHeight = image.naturalHeight || image.height;
			canvas.width = imageWidth + DATE_RING_TEXTURE_MARGIN * 2;
			canvas.height = imageHeight + DATE_RING_TEXTURE_MARGIN * 2;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.fillStyle = "#f9f9f9";
			ctx.beginPath();
			ctx.arc(canvas.width / 2, canvas.height / 2, 1227, 0, Math.PI * 2);
			ctx.fill();
			ctx.drawImage(image, DATE_RING_TEXTURE_MARGIN, DATE_RING_TEXTURE_MARGIN);
			ctx.strokeStyle = "#f9f9f9";
			ctx.lineWidth = 8;
			ctx.beginPath();
			ctx.arc(canvas.width / 2, canvas.height / 2, 895, 0, Math.PI * 2);
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(canvas.width / 2, canvas.height / 2, 1147, 0, Math.PI * 2);
			ctx.stroke();
			texture.image = canvas;
			texture.needsUpdate = true;
		});
		dateWheelTexture.colorSpace = SRGBColorSpace;
		dateWheelTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
		const dialMaterial = new MeshPhysicalMaterial({
			alphaTest: .5,
			metalness: 0,
			roughness: .55,
			specularIntensity: .4,
			clearcoat: .2,
			clearcoatRoughness: .5,
			shadowSide: 2
		});
		textureLoader.load(`/reference-handless-date-cutout.png`, (photo) => {
			const canvas = document.createElement("canvas");
			canvas.width = WATCH_GEOMETRY.IMG_W;
			canvas.height = WATCH_GEOMETRY.IMG_H;
			const ctx = canvas.getContext("2d");
			let composed;
			if (ctx) {
				ctx.drawImage(photo.image, 0, 0);
				punchDateWindow(ctx);
				cleanBezelShadow(ctx);
				ctx.fillStyle = "#eee8e0";
				ctx.beginPath();
				ctx.rect(0, 0, canvas.width, canvas.height);
				ctx.arc(WATCH_GEOMETRY.CX, WATCH_GEOMETRY.CY, WATCH_GEOMETRY.R_DIAL_EDGE + 6, 0, Math.PI * 2, true);
				ctx.fill();
				drawDialLinework(ctx);
				composed = new CanvasTexture(canvas);
				photo.dispose();
			} else composed = photo;
			composed.colorSpace = SRGBColorSpace;
			composed.anisotropy = renderer.capabilities.getMaxAnisotropy();
			dialMaterial.map = composed;
			dialMaterial.needsUpdate = true;
		});
		const polishedBlack = new MeshPhysicalMaterial({
			color: 1118994,
			metalness: 1,
			roughness: .16,
			side: 2
		});
		const deepBlack = new MeshPhysicalMaterial({
			color: 592393,
			metalness: 1,
			roughness: .34,
			side: 2
		});
		const steel = new MeshPhysicalMaterial({
			color: 14211803,
			metalness: 1,
			roughness: .17,
			side: 2
		});
		const redPaint = new MeshPhysicalMaterial({
			color: 10162718,
			metalness: 0,
			roughness: .34,
			clearcoat: 1,
			clearcoatRoughness: .18,
			side: 2
		});
		const graphiteShaft = new MeshPhysicalMaterial({
			color: 3486253,
			metalness: .85,
			roughness: .42,
			side: 2
		});
		const wallMaterial = new MeshStandardMaterial({
			color: 16777215,
			vertexColors: true,
			roughness: .55,
			envMap: environment.texture,
			envMapIntensity: .15,
			side: 2
		});
		const watch = new Group();
		scene.add(watch);
		const dialGeometry = new CircleGeometry(WATCH_GEOMETRY.R_DIAL_EDGE + 10, 160);
		{
			const positions = dialGeometry.attributes.position;
			const uvs = dialGeometry.attributes.uv;
			for (let i = 0; i < positions.count; i++) {
				const x = positions.getX(i);
				const y = positions.getY(i);
				uvs.setXY(i, (WATCH_GEOMETRY.CX + x) / WATCH_GEOMETRY.IMG_W, 1 - (WATCH_GEOMETRY.CY - y) / WATCH_GEOMETRY.IMG_H);
			}
		}
		const dial = new Mesh(dialGeometry, dialMaterial);
		dial.castShadow = true;
		dial.receiveShadow = true;
		const dialAssembly = new Group();
		dialAssembly.add(dial);
		watch.add(dialAssembly);
		const wheelShadingTerms = (elevationDeg, intensity, ambient) => ({
			keyTerm: intensity * Math.sin(elevationDeg * DEG),
			ambientTerm: ambient * .45
		});
		const lightMapCanvas = document.createElement("canvas");
		lightMapCanvas.width = 1024;
		lightMapCanvas.height = 1024;
		const initialTerms = wheelShadingTerms(DEFAULT_ELEVATION, DEFAULT_LIGHT_INTENSITY, DEFAULT_AMBIENT_INTENSITY);
		const initialScale = bakeDateWheelShading(lightMapCanvas, DEFAULT_AZIMUTH, DEFAULT_ELEVATION, initialTerms.keyTerm, initialTerms.ambientTerm);
		const dateWheelLightMap = new CanvasTexture(lightMapCanvas);
		dateWheelLightMap.center.set(.5, .5);
		dateWheelLightMap.matrixAutoUpdate = false;
		const dateWheelMaterial = new MeshBasicMaterial({
			map: dateWheelTexture,
			color: 16777215,
			alphaTest: .4,
			lightMap: dateWheelLightMap,
			lightMapIntensity: initialScale
		});
		const dateWheelFace = new Mesh(new CircleGeometry(DATE_WHEEL_OUTER_RADIUS, 192), dateWheelMaterial);
		const initialBandRadius = DATE_WHEEL_OUTER_RADIUS * DEFAULT_DATE_WHEEL_BAND.radius;
		const initialBandWidth = initialBandRadius * DEFAULT_DATE_WHEEL_BAND.width;
		const dateWheelBandMesh = new Mesh(new RingGeometry(initialBandRadius - initialBandWidth / 2, initialBandRadius + initialBandWidth / 2, 256), new MeshBasicMaterial({
			color: 27903,
			transparent: true,
			opacity: .7,
			depthWrite: false,
			side: 2,
			toneMapped: false
		}));
		dateWheelBandMesh.position.set(DEFAULT_DATE_WHEEL_BAND.x * DATE_WHEEL_OFFSET_SCALE, -DEFAULT_DATE_WHEEL_BAND.y * DATE_WHEEL_OFFSET_SCALE, 2);
		dateWheelBandMesh.visible = false;
		const setDateWheelBandVisible = (visible) => {
			dateWheelBandMesh.visible = visible;
		};
		let currentBandRadius = DEFAULT_DATE_WHEEL_BAND.radius;
		let currentBandWidth = DEFAULT_DATE_WHEEL_BAND.width;
		const updateDateWheelBand = (settings) => {
			dateWheelBandMesh.position.set(settings.x * DATE_WHEEL_OFFSET_SCALE, -settings.y * DATE_WHEEL_OFFSET_SCALE, 2);
			if (settings.radius === currentBandRadius && settings.width === currentBandWidth) return;
			const radius = DATE_WHEEL_OUTER_RADIUS * settings.radius;
			const width = radius * settings.width;
			const previousGeometry = dateWheelBandMesh.geometry;
			dateWheelBandMesh.geometry = new RingGeometry(radius - width / 2, radius + width / 2, 256);
			previousGeometry.dispose();
			currentBandRadius = settings.radius;
			currentBandWidth = settings.width;
		};
		const dateWheelSqueezeOuter = new Group();
		const dateWheelSqueezeInner = new Group();
		dateWheelSqueezeOuter.add(dateWheelSqueezeInner);
		dateWheelSqueezeInner.add(dateWheelFace);
		const squeezeAxisDirection = new Vector3(1, 0, 0);
		const dateWheelSqueezeAxis = new ArrowHelper(squeezeAxisDirection, new Vector3(0, 0, 4), DATE_WHEEL_OUTER_RADIUS * .48, 16723285, 42, 22);
		dateWheelSqueezeAxis.visible = SHOW_DATE_CALIBRATION_CONTROLS;
		const dateWheelRotation = new Group();
		dateWheelRotation.add(dateWheelSqueezeOuter, dateWheelBandMesh, dateWheelSqueezeAxis);
		const dateWheel = new Group();
		dateWheel.add(dateWheelRotation);
		const setDialOcclusion = (enabled) => {
			dateWheelMaterial.lightMap = enabled ? dateWheelLightMap : null;
			dateWheelMaterial.needsUpdate = true;
		};
		let bakeTimer;
		const updateWheelLight = (azimuthDeg, elevationDeg, intensity, ambient, emitterHalfAngleDeg, dialThickness, dateWheelDepth) => {
			const { keyTerm, ambientTerm } = wheelShadingTerms(elevationDeg, intensity, ambient);
			dateWheelMaterial.lightMapIntensity = keyTerm + ambientTerm;
			clearTimeout(bakeTimer);
			bakeTimer = setTimeout(() => {
				bakeDateWheelShading(lightMapCanvas, azimuthDeg, elevationDeg, keyTerm, ambientTerm, emitterHalfAngleDeg, dialThickness, dateWheelDepth);
				dateWheelLightMap.needsUpdate = true;
			}, 120);
		};
		dateWheel.position.set(WATCH_GEOMETRY.DATE_RING_OFFSET_X * DATE_WHEEL_OFFSET_SCALE, -WATCH_GEOMETRY.DATE_RING_OFFSET_Y * DATE_WHEEL_OFFSET_SCALE, STACK.dateWheel);
		watch.add(dateWheel);
		const apertureWalls = new Mesh(dateWindowWallGeometry(), wallMaterial);
		apertureWalls.castShadow = true;
		apertureWalls.receiveShadow = true;
		dialAssembly.add(apertureWalls);
		const movementBackdrop = new Mesh(new CircleGeometry(WATCH_GEOMETRY.R_DIAL_EDGE + 10, 96), new MeshStandardMaterial({
			color: 1447188,
			roughness: .85,
			envMap: environment.texture,
			envMapIntensity: .1,
			side: 2
		}));
		movementBackdrop.receiveShadow = true;
		movementBackdrop.position.z = STACK.movementBackdrop;
		watch.add(movementBackdrop);
		const markersGroup = new Group();
		watch.add(markersGroup);
		const sharedBaton = batonGeometry();
		const addBaton = (angleDeg, lateralOffset = 0) => {
			const baton = new Mesh(sharedBaton, polishedBlack);
			baton.castShadow = true;
			const group = new Group();
			baton.position.x = lateralOffset;
			group.add(baton);
			group.rotation.z = -angleDeg * DEG;
			markersGroup.add(group);
		};
		for (const hour of WATCH_GEOMETRY.SINGLE_BATON_HOURS) addBaton(WATCH_GEOMETRY.hourAngleDeg(hour));
		addBaton(0, -WATCH_GEOMETRY.BATON_12_LATERAL);
		addBaton(0, WATCH_GEOMETRY.BATON_12_LATERAL);
		const centerPost = new Mesh(new CylinderGeometry(37, 37, STACK.secondsHand, 48), deepBlack);
		centerPost.rotation.x = Math.PI / 2;
		centerPost.position.z = STACK.secondsHand / 2;
		watch.add(centerPost);
		const buildIndicatorHand = (config) => {
			const group = new Group();
			const shaft = new Mesh(outlineGeometry([
				[-config.shaftHalfWidth, config.shaftStartRadius],
				[-config.shaftHalfWidth, config.headRadius],
				[config.shaftHalfWidth, config.headRadius],
				[config.shaftHalfWidth, config.shaftStartRadius]
			], FLAT_HAND_DEPTH), graphiteShaft);
			const head = new Mesh(hammerHeadGeometry(config.headRadius, config.headHalfLength, config.headHalfThickness, 7), redPaint);
			group.add(shaft);
			group.add(head);
			group.position.z = config.baseHeight;
			watch.add(group);
			return group;
		};
		const dayHand = buildIndicatorHand({
			headRadius: WATCH_GEOMETRY.DAY_HAND_HEAD_RADIUS,
			shaftStartRadius: WATCH_GEOMETRY.DAY_HAND_SHAFT_START_RADIUS,
			shaftHalfWidth: WATCH_GEOMETRY.DAY_HAND_SHAFT_HALF_WIDTH,
			headHalfLength: WATCH_GEOMETRY.DAY_HAND_HEAD_HALF_LENGTH,
			headHalfThickness: WATCH_GEOMETRY.DAY_HAND_HEAD_HALF_THICKNESS,
			baseHeight: STACK.dayHand
		});
		const weekHand = buildIndicatorHand({
			headRadius: WATCH_GEOMETRY.WEEK_HAND_HEAD_RADIUS,
			shaftStartRadius: WATCH_GEOMETRY.WEEK_HAND_SHAFT_START_RADIUS,
			shaftHalfWidth: WATCH_GEOMETRY.WEEK_HAND_SHAFT_HALF_WIDTH,
			headHalfLength: WATCH_GEOMETRY.WEEK_HAND_HEAD_HALF_LENGTH,
			headHalfThickness: WATCH_GEOMETRY.WEEK_HAND_HEAD_HALF_THICKNESS,
			baseHeight: STACK.weekHand
		});
		const hourHand = new Group();
		hourHand.add(new Mesh(hourHandGeometry(), polishedBlack));
		hourHand.position.z = STACK.hourHand;
		watch.add(hourHand);
		const minuteHand = new Group();
		minuteHand.add(new Mesh(minuteHandGeometry(), polishedBlack));
		minuteHand.position.z = STACK.minuteHand;
		watch.add(minuteHand);
		const secondsHand = new Group();
		const bladeAlong = (y) => WATCH_GEOMETRY.CY - y;
		secondsHand.add(new Mesh(outlineGeometry([
			[-WATCH_GEOMETRY.SECOND_HAND_TIP_HALF_W, bladeAlong(WATCH_GEOMETRY.SECOND_HAND_TIP_Y)],
			[WATCH_GEOMETRY.SECOND_HAND_TIP_HALF_W, bladeAlong(WATCH_GEOMETRY.SECOND_HAND_TIP_Y)],
			[WATCH_GEOMETRY.SECOND_HAND_NECK_HALF_W, bladeAlong(WATCH_GEOMETRY.SECOND_HAND_NECK_Y)],
			[-WATCH_GEOMETRY.SECOND_HAND_NECK_HALF_W, bladeAlong(WATCH_GEOMETRY.SECOND_HAND_NECK_Y)]
		], 3), deepBlack));
		secondsHand.add(new Mesh(outlineGeometry([
			[-WATCH_GEOMETRY.SECOND_HAND_TAIL_SHOULDER_HALF_W, bladeAlong(WATCH_GEOMETRY.SECOND_HAND_TAIL_SHOULDER_Y)],
			[WATCH_GEOMETRY.SECOND_HAND_TAIL_SHOULDER_HALF_W, bladeAlong(WATCH_GEOMETRY.SECOND_HAND_TAIL_SHOULDER_Y)],
			[WATCH_GEOMETRY.SECOND_HAND_TAIL_END_HALF_W, bladeAlong(WATCH_GEOMETRY.SECOND_HAND_TAIL_END_Y)],
			[0, bladeAlong(WATCH_GEOMETRY.SECOND_HAND_TAIL_POINT_Y)],
			[-WATCH_GEOMETRY.SECOND_HAND_TAIL_END_HALF_W, bladeAlong(WATCH_GEOMETRY.SECOND_HAND_TAIL_END_Y)]
		], 3), deepBlack));
		const hub = new Mesh(new CylinderGeometry(WATCH_GEOMETRY.SECOND_HAND_HUB_RADIUS, WATCH_GEOMETRY.SECOND_HAND_HUB_RADIUS, 10, 48), steel);
		hub.rotation.x = Math.PI / 2;
		hub.position.z = 2;
		secondsHand.add(hub);
		const pin = new Mesh(new CylinderGeometry(10, 10, 16, 32), steel);
		pin.rotation.x = Math.PI / 2;
		pin.position.z = 6;
		secondsHand.add(pin);
		secondsHand.position.z = STACK.secondsHand;
		watch.add(secondsHand);
		for (const handGroup of [
			dayHand,
			weekHand,
			hourHand,
			minuteHand,
			secondsHand
		]) handGroup.traverse((node) => {
			if (node instanceof Mesh) node.castShadow = true;
		});
		centerPost.castShadow = true;
		const rim = new Mesh(new CylinderGeometry(WATCH_GEOMETRY.R_DIAL_EDGE + 10, WATCH_GEOMETRY.R_DIAL_EDGE + 10, -STACK.movementBackdrop, 128, 1, true), new MeshStandardMaterial({
			color: 1776153,
			roughness: .7,
			side: 2
		}));
		rim.rotation.x = Math.PI / 2;
		rim.position.z = STACK.movementBackdrop / 2;
		rim.castShadow = true;
		rim.receiveShadow = true;
		watch.add(rim);
		let currentStructure = { ...DEFAULT_DATE_STRUCTURE };
		const updateDateStructure = (settings) => {
			if (settings.dialThickness !== currentStructure.dialThickness) {
				const previousWalls = apertureWalls.geometry;
				apertureWalls.geometry = dateWindowWallGeometry(settings.dialThickness);
				previousWalls.dispose();
			}
			const enclosureDepth = settings.dialThickness + settings.dateWheelGap + 10;
			movementBackdrop.position.z = -enclosureDepth;
			if (settings.dialThickness !== currentStructure.dialThickness || settings.dateWheelGap !== currentStructure.dateWheelGap) {
				const previousRim = rim.geometry;
				rim.geometry = new CylinderGeometry(WATCH_GEOMETRY.R_DIAL_EDGE + 10, WATCH_GEOMETRY.R_DIAL_EDGE + 10, enclosureDepth, 128, 1, true);
				previousRim.dispose();
				rim.position.z = -enclosureDepth / 2;
			}
			currentStructure = { ...settings };
		};
		const mountDate = /* @__PURE__ */ new Date();
		const anchor = {
			isoWeekYear: isoWeekCoordinates(mountDate).year,
			weekday: mountDate.getDay(),
			ordinal: localCalendarDayOrdinal(mountDate),
			month: calendarMonthOrdinal(mountDate)
		};
		const updateHands = () => {
			const now = /* @__PURE__ */ new Date();
			const nowMs = now.getTime();
			const secondsWithMs = now.getSeconds() + now.getMilliseconds() / 1e3;
			const secondsDeg = Math.floor(nowMs % 6e4 / WATCH_GEOMETRY.SECOND_HAND_TICK_MS) * WATCH_GEOMETRY.SECOND_HAND_DEGREES_PER_TICK;
			const minuteDeg = (now.getMinutes() + secondsWithMs / 60) * 6;
			const hourDeg = (now.getHours() % 12 + now.getMinutes() / 60 + secondsWithMs / 3600) * 30;
			const week = continuousIsoWeek(now, anchor.isoWeekYear, WATCH_GEOMETRY.WEEK_COUNT);
			const weekDeg = WATCH_GEOMETRY.WEEK_OFFSET_DEG + (week - 1) * WATCH_GEOMETRY.WEEK_STEP_DEG;
			const dayIndex = anchor.weekday + localCalendarDayOrdinal(now) - anchor.ordinal;
			const dayDeg = WATCH_GEOMETRY.DAY_SECTOR_OFFSET_DEG - WATCH_GEOMETRY.DAY_SECTOR_STEP_DEG / 2 + dayIndex * WATCH_GEOMETRY.DAY_SECTOR_STEP_DEG;
			const disk = dateDiskRef.current;
			const diskDate = new Date(now);
			diskDate.setDate(diskDate.getDate() + disk.dayOffset);
			const wheelDeg = continuousDateWheelAngle(diskDate, anchor.month, WATCH_GEOMETRY.DATE_WHEEL_UNWRAPPED_ANGLES);
			const diskDeltaX = disk.x * DATE_WHEEL_OFFSET_SCALE;
			const diskDeltaY = -disk.y * DATE_WHEEL_OFFSET_SCALE;
			const structure = dateStructureRef.current;
			const dateWheelDepth = structure.dialThickness + structure.dateWheelGap;
			const squeeze = dateWheelSqueezeRef.current;
			const squeezeAxis = squeeze.axisAngle * DEG;
			secondsHand.rotation.z = -secondsDeg * DEG;
			minuteHand.rotation.z = -minuteDeg * DEG;
			hourHand.rotation.z = -hourDeg * DEG;
			weekHand.rotation.z = -weekDeg * DEG;
			dayHand.rotation.z = -dayDeg * DEG;
			dateWheel.position.set(WATCH_GEOMETRY.DATE_RING_OFFSET_X * DATE_WHEEL_OFFSET_SCALE + diskDeltaX, -WATCH_GEOMETRY.DATE_RING_OFFSET_Y * DATE_WHEEL_OFFSET_SCALE + diskDeltaY, -dateWheelDepth);
			dateWheel.scale.setScalar(disk.scale);
			dateWheelSqueezeOuter.rotation.z = squeezeAxis;
			dateWheelSqueezeOuter.scale.set(squeeze.scale, 1, 1);
			dateWheelSqueezeInner.rotation.z = -squeezeAxis;
			dateWheelRotation.rotation.z = -wheelDeg * DEG;
			squeezeAxisDirection.set(Math.cos(squeezeAxis), Math.sin(squeezeAxis), 0);
			dateWheelSqueezeAxis.setDirection(squeezeAxisDirection);
			const ca = Math.cos(squeezeAxis);
			const sa = Math.sin(squeezeAxis);
			const a11 = squeeze.scale * ca * ca + sa * sa;
			const a12 = (squeeze.scale - 1) * ca * sa;
			const a22 = squeeze.scale * sa * sa + ca * ca;
			const wheelRadians = wheelDeg * DEG;
			const cw = Math.cos(wheelRadians);
			const sw = Math.sin(wheelRadians);
			const mapScale = DATE_WHEEL_RADIUS_SCALE * disk.scale;
			const m11 = mapScale * (cw * a11 + sw * a12);
			const m12 = mapScale * (cw * a12 + sw * a22);
			const m21 = mapScale * (-sw * a11 + cw * a12);
			const m22 = mapScale * (-sw * a12 + cw * a22);
			const qx = diskDeltaX / (2 * WATCH_GEOMETRY.DATE_RING_DEFAULT_RADIUS);
			const qy = diskDeltaY / (2 * WATCH_GEOMETRY.DATE_RING_DEFAULT_RADIUS);
			dateWheelLightMap.matrix.set(m11, m12, .5 + qx - .5 * (m11 + m12), m21, m22, .5 + qy - .5 * (m21 + m22), 0, 0, 1);
		};
		renderer.setAnimationLoop(() => {
			controls.update();
			updateHands();
			renderer.render(scene, camera);
		});
		setResetView(() => () => {
			controls.reset();
			const internals = controls;
			internals._movePrev.copy(internals._moveCurr);
			internals._zoomStart.copy(internals._zoomEnd);
			internals._panStart.copy(internals._panEnd);
		});
		sceneRef.current = {
			elements: {
				dial: dialAssembly,
				markers: markersGroup,
				dateWheel,
				week: weekHand,
				day: dayHand,
				hour: hourHand,
				minute: minuteHand,
				second: secondsHand
			},
			keyLights,
			lightSource,
			lightSourcePanel,
			lightSourceArrow,
			camera,
			controls,
			scene,
			setDialOcclusion,
			setDateWheelBandVisible,
			updateDateStructure,
			updateDateWheelBand,
			updateWheelLight
		};
		window.__watch3d = {
			camera,
			controls
		};
		const resizeObserver = new ResizeObserver(() => {
			const width = container.clientWidth;
			const height = Math.max(1, container.clientHeight);
			renderer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			controls.handleResize();
		});
		resizeObserver.observe(container);
		return () => {
			sceneRef.current = null;
			setResetView(null);
			resizeObserver.disconnect();
			renderer.setAnimationLoop(null);
			controls.dispose();
			scene.traverse((object) => {
				if (object instanceof Mesh || object instanceof Line) {
					object.geometry.dispose();
					(Array.isArray(object.material) ? object.material : [object.material]).forEach((material) => material.dispose());
				}
			});
			dialMaterial.map?.dispose();
			dateWheelTexture.dispose();
			dateWheelLightMap.dispose();
			clearTimeout(bakeTimer);
			environment.texture.dispose();
			pmrem.dispose();
			renderer.dispose();
			container.removeChild(renderer.domElement);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const handles = sceneRef.current;
		if (!handles) return;
		for (const { key } of ELEMENT_OPTIONS) handles.elements[key].visible = visibility[key];
		handles.setDialOcclusion(visibility.dial);
	}, [visibility]);
	(0, import_react.useEffect)(() => {
		sceneRef.current?.updateDateStructure(dateStructure);
	}, [dateStructure]);
	(0, import_react.useEffect)(() => {
		const handles = sceneRef.current;
		if (!handles) return;
		const clusterSpread = AREA_LIGHT_SPREAD_DEG * (light.size / EMITTER_HALF_ANGLE_DEG);
		positionKeyLights(handles.keyLights, light.azimuth, light.elevation, clusterSpread, light.distance);
		positionLightSourceVisual(handles.lightSourcePanel, handles.lightSourceArrow, light.azimuth, light.elevation, light.size, light.distance);
		for (const keyLight of handles.keyLights) keyLight.intensity = light.intensity / handles.keyLights.length;
	}, [
		light.azimuth,
		light.distance,
		light.elevation,
		light.intensity,
		light.size
	]);
	(0, import_react.useEffect)(() => {
		const handles = sceneRef.current;
		if (!handles) return;
		handles.updateWheelLight(light.azimuth, light.elevation, light.intensity, light.ambient, light.size, dateStructure.dialThickness, dateStructure.dialThickness + dateStructure.dateWheelGap);
		handles.scene.environmentIntensity = light.ambient;
		handles.scene.environmentRotation.set(0, 0, (light.azimuth - STUDIO_AZIMUTH) * DEG);
	}, [
		dateStructure.dateWheelGap,
		dateStructure.dialThickness,
		light.ambient,
		light.azimuth,
		light.elevation,
		light.intensity,
		light.size
	]);
	(0, import_react.useEffect)(() => {
		const handles = sceneRef.current;
		if (!handles) return;
		handles.lightSource.visible = showLightSource;
	}, [showLightSource]);
	(0, import_react.useEffect)(() => {
		sceneRef.current?.updateDateWheelBand(dateWheelBand);
	}, [dateWheelBand]);
	(0, import_react.useEffect)(() => {
		sceneRef.current?.setDateWheelBandVisible(showDateWheelBand);
	}, [showDateWheelBand]);
	const lightSliders = [
		{
			key: "intensity",
			label: "Intensity",
			min: 0,
			max: 7,
			step: .05,
			valueText: `${Math.round(light.intensity / 3.5 * 100)}%`
		},
		{
			key: "ambient",
			label: "Ambient",
			min: 0,
			max: 2,
			step: .05,
			valueText: `${Math.round(light.ambient * 100)}%`
		},
		{
			key: "size",
			label: "Source size",
			min: 6,
			max: 40,
			step: 1,
			valueText: `${Math.round(light.size)}°`
		},
		{
			key: "distance",
			label: "Source distance",
			min: 2500,
			max: 9e3,
			step: 100,
			valueText: `${(light.distance / (WATCH_GEOMETRY.R_DIAL_EDGE * 2)).toFixed(1)}× dial`
		}
	];
	const trackballRadius = Math.cos(light.elevation * DEG);
	const trackballPosition = {
		u: Math.cos(light.azimuth * DEG) * trackballRadius,
		v: -Math.sin(light.azimuth * DEG) * trackballRadius
	};
	const setLightFromTrackball = (u, v) => {
		const maxRadius = Math.cos(5 * DEG);
		const radius = Math.hypot(u, v);
		const scale = radius > maxRadius ? maxRadius / radius : 1;
		const nextU = u * scale;
		const nextV = v * scale;
		const nextRadius = Math.hypot(nextU, nextV);
		const azimuth = (Math.atan2(-nextV, nextU) / DEG + 360) % 360;
		const elevation = Math.asin(Math.sqrt(Math.max(0, 1 - nextRadius * nextRadius))) / DEG;
		setLight((current) => ({
			...current,
			azimuth,
			elevation
		}));
	};
	const updateLightFromPointer = (clientX, clientY) => {
		const bounds = lightTrackballRef.current?.getBoundingClientRect();
		if (!bounds) return;
		setLightFromTrackball((clientX - bounds.left) / bounds.width * 2 - 1, (clientY - bounds.top) / bounds.height * 2 - 1);
	};
	const frameLightSource = () => {
		const handles = sceneRef.current;
		if (!handles) return;
		handles.lightSource.visible = true;
		setShowLightSource(true);
		const frameCenter = handles.lightSourcePanel.position.clone().multiplyScalar(.5);
		const panelHalfDiagonal = handles.lightSourcePanel.scale.x * Math.SQRT2 / 2;
		const radius = light.distance / 2 + Math.max(WATCH_GEOMETRY.R_DIAL_EDGE + 120, panelHalfDiagonal);
		const viewDirection = handles.camera.position.clone().sub(handles.controls.target).normalize();
		const framingDistance = Math.min(28e3, Math.max(5e3, radius / Math.sin(handles.camera.fov * DEG / 2) * 1.08));
		handles.controls.target.copy(frameCenter);
		handles.camera.position.copy(frameCenter).addScaledVector(viewDirection, framingDistance);
		handles.camera.lookAt(frameCenter);
		handles.controls.update();
	};
	const selectedDiskDate = /* @__PURE__ */ new Date();
	selectedDiskDate.setDate(selectedDiskDate.getDate() + dateDisk.dayOffset);
	const selectedDiskDateText = selectedDiskDate.toLocaleDateString(void 0, {
		month: "short",
		day: "numeric"
	});
	dateDisk.dayOffset === 0 ? `${selectedDiskDateText}` : (`${selectedDiskDateText}`, dateDisk.dayOffset, `${Math.abs(dateDisk.dayOffset)}`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: containerRef,
		className: `h-dvh w-full ${className}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-pressed": panelOpen,
				"aria-label": "Toggle 3D view settings",
				title: "3D view settings",
				onClick: () => setPanelOpen((open) => !open),
				className: "absolute left-3 top-3 z-10 rounded-lg border-2 border-white/40 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
				children: "⚙️"
			}),
			panelOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute left-3 top-16 z-10 w-56 rounded-xl border border-black/20 bg-white/90 p-3 text-black shadow-lg backdrop-blur",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						role: "tablist",
						"aria-label": "3D settings groups",
						className: "mb-3 grid grid-cols-2 gap-1 rounded-lg bg-black/10 p-1",
						children: ["elements", "light"].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							role: "tab",
							"aria-selected": settingsTab === tab,
							onClick: () => setSettingsTab(tab),
							className: `rounded-md px-2 py-1 text-[11px] font-semibold capitalize transition ${settingsTab === tab ? "bg-black text-white" : "text-black hover:bg-black/10"}`,
							children: tab
						}, tab))
					}),
					settingsTab === "elements" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "tabpanel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-1 text-[10px] font-bold",
								children: "Elements"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-1",
								children: [ELEMENT_OPTIONS.map(({ key, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": visibility[key],
									onClick: () => setVisibility((current) => ({
										...current,
										[key]: !current[key]
									})),
									className: toggleButtonClass(visibility[key]),
									children: label
								}, key)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": HAND_KEYS.every((key) => visibility[key]),
									onClick: () => setVisibility((current) => {
										const show = !HAND_KEYS.every((key) => current[key]);
										const next = { ...current };
										for (const key of HAND_KEYS) next[key] = show;
										return next;
									}),
									className: toggleButtonClass(HAND_KEYS.every((key) => visibility[key])),
									children: "All hands"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-1 mt-3 border-t border-black/15 pt-2 text-[10px] font-bold",
								children: "Structure"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-1.5 block text-[10px] font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Main dial thickness" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
										className: "tabular-nums",
										children: [dateStructure.dialThickness.toFixed(0), " px"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 2,
									max: 40,
									step: 1,
									value: dateStructure.dialThickness,
									onChange: (event) => setDateStructure((current) => ({
										...current,
										dialThickness: Number(event.target.value)
									})),
									className: "mt-0.5 w-full cursor-pointer accent-black",
									"aria-label": "Main dial thickness"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-1.5 block text-[10px] font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date wheel gap" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
										className: "tabular-nums",
										children: [dateStructure.dateWheelGap.toFixed(0), " px"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 0,
									max: 120,
									step: 1,
									value: dateStructure.dateWheelGap,
									onChange: (event) => setDateStructure((current) => ({
										...current,
										dateWheelGap: Number(event.target.value)
									})),
									className: "mt-0.5 w-full cursor-pointer accent-black",
									"aria-label": "Distance between date wheel and dial"
								})]
							})
						]
					}),
					settingsTab === "light" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "tabpanel",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-1 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[10px] font-bold",
									children: "Light"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: frameLightSource,
										className: "rounded-md border border-black/25 bg-white px-2 py-1 text-[10px] font-semibold text-black transition hover:bg-zinc-100",
										children: "Frame"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": showLightSource,
										onClick: () => setShowLightSource((visible) => !visible),
										className: `rounded-md border px-2 py-1 text-[10px] font-semibold transition ${showLightSource ? "border-orange-600 bg-orange-500 text-white" : "border-black/25 bg-white text-black hover:bg-zinc-100"}`,
										children: showLightSource ? "Hide" : "Show"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								ref: lightTrackballRef,
								role: "slider",
								tabIndex: 0,
								"aria-label": "Key light position",
								"aria-valuemin": 5,
								"aria-valuemax": 90,
								"aria-valuenow": Math.round(light.elevation),
								"aria-valuetext": `${Math.round(light.azimuth)} degrees direction, ${Math.round(light.elevation)} degrees elevation`,
								onPointerDown: (event) => {
									event.currentTarget.setPointerCapture(event.pointerId);
									updateLightFromPointer(event.clientX, event.clientY);
								},
								onPointerMove: (event) => {
									if (event.currentTarget.hasPointerCapture(event.pointerId)) updateLightFromPointer(event.clientX, event.clientY);
								},
								onKeyDown: (event) => {
									const step = event.shiftKey ? .02 : .06;
									const delta = {
										ArrowLeft: [-step, 0],
										ArrowRight: [step, 0],
										ArrowUp: [0, -step],
										ArrowDown: [0, step]
									}[event.key];
									if (!delta) return;
									event.preventDefault();
									setLightFromTrackball(trackballPosition.u + delta[0], trackballPosition.v + delta[1]);
								},
								className: "relative mx-auto mt-2 h-28 w-28 touch-none rounded-full border-2 border-black/40 bg-[radial-gradient(circle_at_center,#fff_0%,#e7e7e7_58%,#a8a8a8_100%)] shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-black",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute bottom-0 left-1/2 top-0 w-px bg-black/15" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-black/15" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black shadow-md",
										style: {
											left: `${(trackballPosition.u + 1) * 50}%`,
											top: `${(trackballPosition.v + 1) * 50}%`
										}
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-center text-[10px] tabular-nums text-black",
								children: [
									"Direction ",
									Math.round(light.azimuth),
									"° · Elevation ",
									Math.round(light.elevation),
									"°"
								]
							}),
							lightSliders.map((slider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-1.5 block text-[10px] font-semibold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: slider.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("output", {
										className: "tabular-nums",
										children: slider.valueText
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: slider.min,
									max: slider.max,
									step: slider.step,
									value: light[slider.key],
									onChange: (event) => setLight((current) => ({
										...current,
										[slider.key]: Number(event.target.value)
									})),
									className: "mt-0.5 w-full cursor-pointer accent-black",
									"aria-label": `Light ${slider.label.toLowerCase()}`
								})]
							}, slider.key))
						]
					})
				]
			}),
			SHOW_DATE_CALIBRATION_CONTROLS,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "whitespace-nowrap rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-black/70 shadow backdrop-blur",
					children: "Drag to rotate · Scroll to zoom · Right-drag to pan"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => resetView?.(),
					className: "pointer-events-auto rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-black shadow backdrop-blur transition hover:bg-white active:scale-95",
					children: "Reset view"
				})]
			})
		]
	});
}
function WatchStage({ screensaver = false }) {
	const [view, setView] = (0, import_react.useState)("dial");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-[#f1e9e0] ${screensaver ? "p-0" : "p-3 sm:p-4"}`,
		children: [!screensaver && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			"aria-pressed": view === "3d",
			title: view === "dial" ? "Switch to the 3D view" : "Switch to the 2D view",
			onClick: () => setView((current) => current === "dial" ? "3d" : "dial"),
			className: "fixed right-3 top-3 z-40 rounded-lg border-2 border-white/40 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
			children: view === "dial" ? "3D" : "2D"
		}), view === "dial" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeeklyCalendarWatch, {
			screensaver,
			className: screensaver ? "h-auto w-[min(94vw,94vh)] max-w-none" : "h-auto w-full max-w-[min(96vw,720px)]"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Watch3D, { className: "fixed inset-0" })]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchStage, {});
}
//#endregion
export { Home as component };
