import { r as __toESM } from "../_runtime.mjs";
import { M as require_react, h as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CweJH8WP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
function shadeMetalFacet(normal, center, lightPosition, lightBrightness, referenceDistance) {
	const toLightVector = subtract3(lightPosition, center);
	const distance = Math.hypot(toLightVector.x, toLightVector.y, toLightVector.z);
	const toLight = normalize3(toLightVector);
	const diffuse = Math.max(0, dot3(normal, toLight));
	const attenuation = Math.min(1.35, Math.max(.5, (referenceDistance / distance) ** 2));
	const halfVector = normalize3({
		x: toLight.x,
		y: toLight.y,
		z: toLight.z + 1
	});
	const specular = Math.pow(Math.max(0, dot3(normal, halfVector)), 38) * .7 * attenuation * lightBrightness * diffuse;
	const level = .12 + diffuse * .95 * attenuation * lightBrightness;
	const channels = [
		72,
		74,
		71
	].map((channel) => linearToSrgb(toneMap(srgbToLinear(channel) * level + specular)));
	return {
		fill: `rgb(${channels[0]} ${channels[1]} ${channels[2]})`,
		stroke: `rgb(${Math.round(channels[0] * .55)} ${Math.round(channels[1] * .55)} ${Math.round(channels[2] * .55)})`
	};
}
function lightShadowOffset(lightPosition, objectHeight, center, maxDistance = 52) {
	const lightX = lightPosition.x - center.x;
	const lightY = lightPosition.y - center.y;
	const horizontalDistance = Math.hypot(lightX, lightY);
	if (horizontalDistance < 1e-6) return {
		dx: 0,
		dy: 0
	};
	const projectedDistance = Math.min(maxDistance, objectHeight * horizontalDistance / Math.max(lightPosition.z, 1));
	return {
		dx: -lightX / horizontalDistance * projectedDistance,
		dy: -lightY / horizontalDistance * projectedDistance
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
var R_BATON_IN_APEX = 647;
var R_BATON_IN_APEX_MIRROR = 588;
var BATON_HALF_W = 24;
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
var REFERENCE_IMAGES = [{
	src: "/reference-ortho-cream.jpg",
	label: "Reference: 1"
}, {
	src: "/reference-handless-date-cutout.png",
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
function isoWeekNumber(date) {
	const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	const dayNumber = target.getUTCDay() || 7;
	target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
	const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
	return Math.ceil(((target.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
}
var MARKER_PRISM_HEIGHT = 34;
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
function markerFacetColor(localNormal, localCenter, markerAngle, lateralOffset, lightPosition, lightBrightness) {
	return shadeMetalFacet(normalize3(rotateVector(localNormal, markerAngle)), markerWorldPoint(localCenter, markerAngle, lateralOffset), lightPosition, lightBrightness, LIGHT_HEMISPHERE_RADIUS);
}
function handPrismPoint(along, lateral, height) {
	return {
		x: lateral,
		y: -along,
		z: height
	};
}
function LitHandPrism({ angle, faces, lightBrightness, lightPosition, prismHeight, shadowId }) {
	const shadowOffset = lightShadowOffset(lightPosition, prismHeight, {
		x: CX,
		y: CY
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", {
		id: shadowId,
		x: "-30%",
		y: "-30%",
		width: "170%",
		height: "170%",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feDropShadow", {
			dx: shadowOffset.dx,
			dy: shadowOffset.dy,
			stdDeviation: "4",
			floodColor: "#000000",
			floodOpacity: .16 * Math.min(2, lightBrightness)
		})
	}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
		filter: `url(#${shadowId})`,
		children: faces.map((face) => {
			const color = markerFacetColor(face.normal, averagePoints(face.points), angle, 0, lightPosition, lightBrightness);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: ptsToPath(face.points.map((point) => markerWorldPoint(point, angle, 0))),
				fill: color.fill,
				stroke: color.stroke,
				strokeWidth: 2,
				strokeLinejoin: "round"
			}, face.key);
		})
	})] });
}
function FlatHourBaton({ degFrom12, lateralOffset = 0 }) {
	const x0 = CX;
	const hw = BATON_HALF_W;
	const yOut = CY - R_BATON_OUT;
	const yOutApex = 559.5;
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
		y: -771.5,
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
		y: -647,
		z: MARKER_PRISM_HEIGHT
	};
	const innerTip = {
		x: 0,
		y: -588,
		z: 0
	};
	const shadowOffset = lightShadowOffset(lightPosition, MARKER_PRISM_HEIGHT, {
		x: CX,
		y: CY
	});
	const shadowId = `hour-marker-shadow-${degFrom12}-${lateralOffset}`.replace(/[^a-zA-Z0-9_-]/g, "_");
	const faces = [
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
			key: "inner-left",
			points: [
				innerTip,
				innerLeft,
				innerRidge
			],
			normal: faceNormal(innerTip, innerLeft, innerRidge)
		},
		{
			key: "inner-right",
			points: [
				innerTip,
				innerRidge,
				innerRight
			],
			normal: faceNormal(innerTip, innerRidge, innerRight)
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		"data-lit-hour-marker": true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("filter", {
			id: shadowId,
			x: "-40%",
			y: "-40%",
			width: "180%",
			height: "180%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("feDropShadow", {
				dx: shadowOffset.dx,
				dy: shadowOffset.dy,
				stdDeviation: "3",
				floodColor: "#000000",
				floodOpacity: .14 * Math.min(2, lightBrightness)
			})
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
			filter: `url(#${shadowId})`,
			children: faces.map((face) => {
				const color = markerFacetColor(face.normal, averagePoints(face.points), degFrom12, lateralOffset, lightPosition, lightBrightness);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: ptsToPath(face.points.map((point) => markerWorldPoint(point, degFrom12, lateralOffset))),
					fill: color.fill,
					stroke: color.stroke,
					strokeWidth: 1.5,
					strokeLinejoin: "round"
				}, face.key);
			})
		})]
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
function HemisphereLightControl({ brightness, dateWindowLight, position, onBrightnessChange, onChange, onDateWindowLightChange }) {
	const panelRef = (0, import_react.useRef)(null);
	const diskRef = (0, import_react.useRef)(null);
	const panelDragRef = (0, import_react.useRef)(null);
	const [panelOffset, setPanelOffset] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
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
		const bounds = panelRef.current?.getBoundingClientRect();
		if (!drag || !bounds) return;
		const requestedX = clientX - drag.x;
		const requestedY = clientY - drag.y;
		const deltaX = Math.min(window.innerWidth - bounds.right, Math.max(-bounds.left, requestedX));
		const deltaY = Math.min(window.innerHeight - bounds.bottom, Math.max(-bounds.top, requestedY));
		setPanelOffset((offset) => ({
			x: offset.x + deltaX,
			y: offset.y + deltaY
		}));
		panelDragRef.current = {
			...drag,
			x: clientX,
			y: clientY
		};
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: panelRef,
		className: "fixed left-32 top-1/2 z-[100] w-48 rounded-xl border border-black/20 bg-white/90 p-3 shadow-lg backdrop-blur",
		style: { transform: `translate(${panelOffset.x}px, calc(-50% + ${panelOffset.y}px))` },
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				role: "button",
				tabIndex: 0,
				"aria-label": "Drag marker light panel",
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
				children: "Marker light"
			}),
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
	});
}
function WeekIndicatorHand({ rotation }) {
	const headCenter = handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_HEAD_RADIUS, 0);
	const shaft = [
		handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_SHAFT_START_RADIUS, -6.48),
		handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_HEAD_RADIUS, -6.48),
		handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_HEAD_RADIUS, WEEK_HAND_SHAFT_HALF_WIDTH),
		handPoint(WEEK_HAND_ANGLE_DEG, WEEK_HAND_SHAFT_START_RADIUS, WEEK_HAND_SHAFT_HALF_WIDTH)
	];
	const headPath = annularSectorPath(WEEK_HAND_ANGLE_DEG, WEEK_HAND_HEAD_RADIUS, WEEK_HAND_HEAD_HALF_THICKNESS, WEEK_HAND_HEAD_HALF_LENGTH);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		"data-week-indicator-hand": true,
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
					floodOpacity: "0.24"
				})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			filter: "url(#week-hand-shadow)",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: ptsToPath(shaft),
				fill: "url(#week-hand-shaft-gradient)",
				stroke: "#171815",
				strokeWidth: 1.44
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: headPath,
				fill: "url(#week-hand-head-gradient)",
				stroke: "#8f1d28",
				strokeWidth: 1.3,
				strokeLinejoin: "round"
			})]
		})]
	});
}
function DayIndicatorHand({ rotation }) {
	const headCenter = handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_HEAD_RADIUS, 0);
	const shaft = [
		handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_SHAFT_START_RADIUS, -7.5),
		handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_HEAD_RADIUS, -7.5),
		handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_HEAD_RADIUS, DAY_HAND_SHAFT_HALF_WIDTH),
		handPoint(DAY_HAND_ANGLE_DEG, DAY_HAND_SHAFT_START_RADIUS, DAY_HAND_SHAFT_HALF_WIDTH)
	];
	const headPath = annularSectorPath(DAY_HAND_ANGLE_DEG, DAY_HAND_HEAD_RADIUS, DAY_HAND_HEAD_HALF_THICKNESS, DAY_HAND_HEAD_HALF_LENGTH);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		"data-day-indicator-hand": true,
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
					floodOpacity: "0.24"
				})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			filter: "url(#day-hand-shadow)",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: ptsToPath(shaft),
				fill: "url(#day-hand-shaft-gradient)",
				stroke: "#363633",
				strokeWidth: 1.4
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
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
				lightPosition,
				prismHeight: HOUR_HAND_PRISM_HEIGHT,
				shadowId: "hour-hand-3d-shadow"
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
					floodOpacity: "0.25"
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
				lightPosition,
				prismHeight: MINUTE_HAND_PRISM_HEIGHT,
				shadowId: "minute-hand-3d-shadow"
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
					floodOpacity: "0.25"
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
function SecondsHand({ rotation }) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
		"data-seconds-hand": true,
		transform: `rotate(${rotation} ${CX} ${CY})`,
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
					floodOpacity: "0.24"
				})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
			filter: "url(#seconds-hand-shadow)",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: ptsToPath(counterweight),
					fill: "url(#seconds-tail-gradient)",
					stroke: "#555651",
					strokeWidth: 1.5
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: ptsToPath(upperBlade),
					fill: "#858681",
					stroke: "#666762",
					strokeWidth: 1.728
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: CX,
					cy: CY,
					r: SECOND_HAND_HUB_RADIUS,
					fill: "url(#seconds-hub-gradient)",
					stroke: "#565753",
					strokeWidth: 4
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: CX,
					cy: CY,
					r: 15,
					fill: "#343532"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: CX,
					cy: CY,
					r: 10,
					fill: "url(#seconds-pin-gradient)",
					stroke: "#20211f",
					strokeWidth: 2
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
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
function WeeklyCalendarWatch({ className = "" }) {
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
	const [dateRingRotation, setDateRingRotation] = (0, import_react.useState)(DATE_WHEEL_CALIBRATION.dayOneAngleDeg);
	const [dateWheelDay, setDateWheelDay] = (0, import_react.useState)(DATE_WHEEL_CALIBRATION.initialDay);
	const [dateRingRadius, setDateRingRadius] = (0, import_react.useState)(DATE_RING_DEFAULT_RADIUS);
	const [dateRingOffset, setDateRingOffset] = (0, import_react.useState)({
		x: -3,
		y: 1
	});
	const [capturedDateRingAngles, setCapturedDateRingAngles] = (0, import_react.useState)([]);
	const [weekHandVisible, setWeekHandVisible] = (0, import_react.useState)(true);
	const [dayHandVisible, setDayHandVisible] = (0, import_react.useState)(true);
	const [hourHandVisible, setHourHandVisible] = (0, import_react.useState)(true);
	const [minuteHandVisible, setMinuteHandVisible] = (0, import_react.useState)(true);
	const [secondsHandVisible, setSecondsHandVisible] = (0, import_react.useState)(true);
	const [selectedHand, setSelectedHand] = (0, import_react.useState)("second");
	const [manualHandAngles, setManualHandAngles] = (0, import_react.useState)({});
	const [clockTimeMs, setClockTimeMs] = (0, import_react.useState)(null);
	const [timeRunning, setTimeRunning] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (!timeRunning) return;
		let timerId;
		const advanceSecondsHand = () => {
			const now = Date.now();
			setClockTimeMs(now);
			const nextTickDelay = SECOND_HAND_TICK_MS - now % SECOND_HAND_TICK_MS;
			timerId = window.setTimeout(advanceSecondsHand, nextTickDelay);
		};
		advanceSecondsHand();
		return () => window.clearTimeout(timerId);
	}, [timeRunning]);
	const clockTime = clockTimeMs === null ? null : new Date(clockTimeMs);
	const secondsWithMilliseconds = clockTime === null ? 0 : clockTime.getSeconds() + clockTime.getMilliseconds() / 1e3;
	const secondsHandRotation = clockTimeMs === null ? 0 : Math.floor(clockTimeMs % 6e4 / SECOND_HAND_TICK_MS) * SECOND_HAND_DEGREES_PER_TICK;
	const minuteHandAngle = clockTime === null ? MINUTE_HAND_ANGLE_DEG : (clockTime.getMinutes() + secondsWithMilliseconds / 60) * 6;
	const hourHandAngle = clockTime === null ? HOUR_HAND_ANGLE_DEG : (clockTime.getHours() % 12 + clockTime.getMinutes() / 60 + secondsWithMilliseconds / 3600) * 30;
	const weekHandAngle = WEEK_OFFSET_DEG + ((clockTime === null ? WEEK_HAND_REFERENCE_WEEK : isoWeekNumber(clockTime)) - 1) * WEEK_STEP_DEG;
	const currentDay = clockTime === null ? DAY_HAND_REFERENCE_DAY : clockTime.getDay();
	const liveHandAngles = {
		week: weekHandAngle,
		day: DAY_SECTOR_OFFSET_DEG - DAY_SECTOR_STEP_DEG / 2 + currentDay * DAY_SECTOR_STEP_DEG,
		hour: hourHandAngle,
		minute: minuteHandAngle,
		second: secondsHandRotation
	};
	const effectiveHandAngle = (hand) => manualHandAngles[hand] ?? liveHandAngles[hand];
	const selectedManualAngle = manualHandAngles[selectedHand];
	const selectedHandAngle = selectedManualAngle !== void 0 && selectedManualAngle >= 0 && selectedManualAngle <= 360 ? selectedManualAngle : (effectiveHandAngle(selectedHand) % 360 + 360) % 360;
	const dateRingSliderAngle = (dateRingRotation % 360 + 360) % 360;
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
	const advanceCalendarHand = (hand, step) => {
		setManualHandAngles((angles) => ({
			...angles,
			[hand]: (angles[hand] ?? liveHandAngles[hand]) + step
		}));
		setSelectedHand(hand);
	};
	const advanceDateWheel = () => {
		const nextDay = dateWheelDay % DATE_WHEEL_CALIBRATION.dayCount + 1;
		const measuredTarget = DATE_WHEEL_CALIBRATION.measuredAnglesDeg[nextDay - 1];
		setDateRingRotation((angle) => {
			let unwrappedTarget = Math.floor(angle / 360) * 360 + measuredTarget;
			if (unwrappedTarget <= angle) unwrappedTarget += 360;
			return unwrappedTarget;
		});
		setDateWheelDay(nextDay);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex flex-col items-center gap-3 ${className}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-pressed": uiVisible,
				"aria-label": "Toggle interface controls",
				title: "Interface controls",
				onClick: () => setUiVisible((visible) => !visible),
				className: "fixed left-3 top-3 z-40 rounded-lg border-2 border-white/40 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
				children: "⚙️"
			}),
			uiVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-black/20 bg-white/90 p-2 shadow-lg backdrop-blur",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						htmlFor: "hand-selector",
						className: "pl-2 text-sm font-semibold text-black",
						children: "Hand"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						id: "hand-selector",
						value: selectedHand,
						onChange: (event) => setSelectedHand(event.target.value),
						className: "rounded-lg border border-black/30 bg-white px-3 py-2 text-sm font-semibold text-black",
						children: HAND_OPTIONS.map((hand) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: hand.value,
							children: hand.label
						}, hand.value))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
						className: "min-w-14 text-right text-sm font-semibold tabular-nums text-black",
						children: [selectedHandAngle.toFixed(1), "°"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": !timeRunning,
						onClick: toggleTimeRunning,
						className: "rounded-lg border border-black/30 bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-zinc-100",
						children: timeRunning ? "Pause" : "Continue"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: manualHandAngles[selectedHand] === void 0,
						onClick: returnSelectedHandToLive,
						className: "rounded-lg border border-black/30 bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-zinc-100 disabled:cursor-default disabled:opacity-40",
						children: "Live"
					})
				]
			}),
			uiVisible && capturedDateRingAngles.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed right-20 top-3 z-30 w-44 rounded-xl border border-black/20 bg-white/90 p-3 text-black shadow-lg backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xs font-semibold",
						children: "Date angles"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setCapturedDateRingAngles([]),
						className: "text-[10px] font-semibold text-black/60 hover:text-black",
						children: "Clear"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "max-h-40 space-y-1 overflow-y-auto text-xs tabular-nums",
					children: capturedDateRingAngles.map((angle, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-black/50",
							children: ["#", index + 1]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [angle.toFixed(1), "°"] })]
					}, `${index}-${angle}`))
				})]
			}),
			uiVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed bottom-3 left-3 top-16 z-30 flex w-12 flex-col items-center gap-1 rounded-xl border border-black/20 bg-white/90 py-2 shadow-lg backdrop-blur",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold tabular-nums text-black",
						children: "0°"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 360,
						step: .1,
						value: dateRingSliderAngle,
						"aria-label": "Rotate date ring",
						onChange: (event) => {
							const angle = Number(event.target.value);
							let closestDay = 1;
							let closestDistance = Number.POSITIVE_INFINITY;
							DATE_WHEEL_CALIBRATION.measuredAnglesDeg.forEach((measuredAngle, index) => {
								const distance = Math.abs((angle - measuredAngle + 540) % 360 - 180);
								if (distance < closestDistance) {
									closestDistance = distance;
									closestDay = index + 1;
								}
							});
							setDateRingRotation(angle);
							setDateWheelDay(closestDay);
						},
						className: "min-h-0 w-7 flex-1 cursor-pointer accent-black",
						style: { writingMode: "vertical-lr" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold tabular-nums text-black",
						children: "360°"
					})
				]
			}),
			uiVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed bottom-3 left-16 top-16 z-30 flex w-12 flex-col items-center gap-1 rounded-xl border border-black/20 bg-white/90 py-2 shadow-lg backdrop-blur",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
						className: "text-[10px] font-semibold tabular-nums text-black",
						children: [Math.round(dateRingRadius), "px"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 600,
						max: 1050,
						step: "any",
						value: dateRingRadius,
						"aria-label": "Resize date ring",
						onChange: (event) => setDateRingRadius(Number(event.target.value)),
						className: "min-h-0 w-7 flex-1 cursor-pointer accent-black",
						style: { writingMode: "vertical-lr" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[10px] font-semibold text-black",
						children: "Size"
					})
				]
			}),
			uiVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed bottom-3 right-3 top-3 z-30 flex w-12 flex-col items-center gap-1 rounded-xl border border-black/20 bg-white/90 py-2 shadow-lg backdrop-blur",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold tabular-nums text-black",
						children: "0°"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 360,
						step: .1,
						value: selectedHandAngle,
						"aria-label": `Rotate ${selectedHand} hand`,
						onChange: (event) => {
							const angle = Number(event.target.value);
							setManualHandAngles((angles) => ({
								...angles,
								[selectedHand]: angle
							}));
						},
						className: "min-h-0 w-7 flex-1 cursor-pointer accent-black",
						style: { writingMode: "vertical-lr" }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-semibold tabular-nums text-black",
						children: "360°"
					})
				]
			}),
			uiVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HemisphereLightControl, {
				brightness: markerLightBrightness,
				dateWindowLight: dateWindowLightSettings,
				position: lightDiskPosition,
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
							src: "/date-ring-overlay.png",
							alt: "",
							"aria-hidden": true,
							draggable: false,
							className: "absolute select-none transition-transform duration-[180ms] ease-[cubic-bezier(0.2,0.85,0.25,1)]",
							style: {
								left: `calc(${(CX - dateRingRadius) / IMG_W * 100}% + ${dateRingOffset.x}px)`,
								top: `calc(${(CY - dateRingRadius) / IMG_H * 100}% + ${dateRingOffset.y}px)`,
								width: `${dateRingRadius * 2 / IMG_W * 100}%`,
								height: `${dateRingRadius * 2 / IMG_H * 100}%`,
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
						src: "/date-window-shadow.png?v=2",
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
								dayHandVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayIndicatorHand, { rotation: dayHandRotation }),
								weekHandVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeekIndicatorHand, { rotation: weekHandRotation }),
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
								secondsHandVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SecondsHand, { rotation: displayedSecondsHandRotation })
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-2",
				children: [
					uiVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setOpacityIdx((i) => (i + 1) % PHOTO_OPACITY.length),
								className: "shrink-0 rounded-lg border-2 border-white/40 bg-white px-3 py-2 text-xs font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: PHOTO_LABEL[opacityIdx]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setReferenceIdx((index) => (index + 1) % REFERENCE_IMAGES.length),
								className: "shrink-0 rounded-lg border-2 border-white/40 bg-white px-3 py-2 text-xs font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: referenceImage.label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setDrawVisible((v) => !v),
								className: "shrink-0 rounded-lg border-2 border-white/40 bg-white px-3 py-2 text-xs font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: drawVisible ? "Drawing: ON" : "Drawing: OFF"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setTextVisible((visible) => !visible),
								className: "shrink-0 rounded-lg border-2 border-white/40 bg-white px-3 py-2 text-xs font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: textVisible ? "Text: ON" : "Text: OFF"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setGuidesVisible((visible) => !visible),
								className: "shrink-0 rounded-lg border-2 border-white/40 bg-white px-3 py-2 text-xs font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: guidesVisible ? "Guides: ON" : "Guides: OFF"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": handsVisible,
								onClick: () => setHandsVisible((visible) => !visible),
								className: "shrink-0 rounded-lg border-2 border-white/40 bg-white px-3 py-2 text-xs font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: handsVisible ? "Hands: ON" : "Hands: OFF"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center justify-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": weekHandVisible,
								onClick: () => setWeekHandVisible((visible) => !visible),
								className: "shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: weekHandVisible ? "Week: ON" : "Week: OFF"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": dayHandVisible,
								onClick: () => setDayHandVisible((visible) => !visible),
								className: "shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: dayHandVisible ? "Day: ON" : "Day: OFF"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": hourHandVisible,
								onClick: () => setHourHandVisible((visible) => !visible),
								className: "shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: hourHandVisible ? "Hour: ON" : "Hour: OFF"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": minuteHandVisible,
								onClick: () => setMinuteHandVisible((visible) => !visible),
								className: "shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: minuteHandVisible ? "Minute: ON" : "Minute: OFF"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": secondsHandVisible,
								onClick: () => setSecondsHandVisible((visible) => !visible),
								className: "shrink-0 rounded-lg border-2 border-white/40 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: secondsHandVisible ? "Second: ON" : "Second: OFF"
							})
						]
					})] }),
					uiVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": markerMode === "3d",
							onClick: () => setMarkerMode((mode) => mode === "flat" ? "3d" : "flat"),
							className: "rounded-lg border-2 border-white/40 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
							children: markerMode === "3d" ? "Markers: 3D" : "Markers: Flat"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => advanceCalendarHand("week", WEEK_STEP_DEG),
								className: "rounded-lg border-2 border-white/40 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: "Week +1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => advanceCalendarHand("day", DAY_SECTOR_STEP_DEG),
								className: "rounded-lg border-2 border-white/40 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: "Day +1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: advanceDateWheel,
								className: "rounded-lg border-2 border-white/40 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: "Date +1"
							})
						] })]
					}),
					uiVisible && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("output", {
								className: "rounded-lg border-2 border-white/40 bg-white px-3 py-2 text-sm font-semibold tabular-nums text-black shadow-lg",
								"aria-label": `Date ring center offset X ${dateRingOffset.x} pixels, Y ${dateRingOffset.y} pixels`,
								children: [
									"X ",
									dateRingOffset.x >= 0 ? "+" : "",
									dateRingOffset.x,
									"px · Y ",
									dateRingOffset.y >= 0 ? "+" : "",
									dateRingOffset.y,
									"px"
								]
							}),
							[
								{
									label: "X−",
									axis: "x",
									delta: -1,
									description: "Move date ring left 1 pixel"
								},
								{
									label: "X+",
									axis: "x",
									delta: 1,
									description: "Move date ring right 1 pixel"
								},
								{
									label: "Y−",
									axis: "y",
									delta: -1,
									description: "Move date ring up 1 pixel"
								},
								{
									label: "Y+",
									axis: "y",
									delta: 1,
									description: "Move date ring down 1 pixel"
								}
							].map(({ label, axis, delta, description }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-label": description,
								title: description,
								onClick: () => setDateRingOffset((offset) => ({
									...offset,
									[axis]: offset[axis] + delta
								})),
								className: "rounded-lg border-2 border-white/40 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: label
							}, label)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setCapturedDateRingAngles((angles) => [...angles, Math.round(dateRingRotation * 10) / 10]),
								className: "rounded-lg border-2 border-white/40 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95",
								children: "Capture angle"
							})
						]
					})
				]
			})
		]
	});
}
function WatchStage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh flex-col items-center justify-center bg-[#f1e9e0] p-3 sm:p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WeeklyCalendarWatch, { className: "h-auto w-full max-w-[min(96vw,720px)]" })
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchStage, {});
}
//#endregion
export { Home as component };
