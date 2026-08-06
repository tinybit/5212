import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";

import {
  calendarMonthOrdinal,
  continuousDateWheelAngle,
  continuousIsoWeek,
  isoWeekCoordinates,
  localCalendarDayOrdinal,
} from "./watchCalendar";
import { planeHeightAt } from "./watchLighting";
import { WATCH_GEOMETRY as G } from "./WeeklyCalendarWatch";

const DEG = Math.PI / 180;

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
const STACK = {
  // Photo measurement put the printed disc ~34 units (~0.9mm) below the dial
  // face; doubled by design preference for a visibly deeper recess. The air
  // gap is what makes the dial's shadow fall across the date wheel.
  dateWheel: -75,
  movementBackdrop: -85,
  dayHand: 6,
  weekHand: 13,
  hourHand: 20,
  minuteHand: 30,
  secondsHand: 52,
} as const;

/**
 * Dial plate thickness: the aperture walls run this deep; below them the
 * recess opens into the air gap above the date wheel. Real proportion
 * measured from macro photography: the visible cut edge is ~5-8% of the
 * window width.
 */
const DIAL_THICKNESS = 27;

/** Corner radius of the date aperture (~8-10% of window width, per macro). */
const DATE_WINDOW_CORNER_RADIUS = 14;

const STUDIO_AZIMUTH = 130;
const DEFAULT_AZIMUTH = 148;
const DEFAULT_ELEVATION = 60;
const DEFAULT_LIGHT_INTENSITY = 2.55;
const DEFAULT_AMBIENT_INTENSITY = 0.75;

/**
 * Angular footprint of the key softbox, sampled as a light cluster: one ray
 * through the panel center plus a ring across its extent. Half-angle ~12°
 * matches the penumbra measured on the reference photo's date window
 * (gradient runs ~half the shadow band over a 34-unit recess depth).
 */
const AREA_LIGHT_SPREAD_DEG = 12;
const AREA_LIGHT_OFFSETS: [number, number][] = [
  [0, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [0.7, 0.7],
  [-0.7, -0.7],
];

/** Aim the key cluster: each light offset in azimuth/elevation degrees. */
function positionKeyLights(
  lights: THREE.DirectionalLight[],
  azimuthDeg: number,
  elevationDeg: number,
  spreadDeg = AREA_LIGHT_SPREAD_DEG,
  distance = LIGHT_DISTANCE,
) {
  for (let i = 0; i < lights.length; i++) {
    const [offsetAz, offsetEl] = AREA_LIGHT_OFFSETS[i];
    const azimuth = (azimuthDeg + offsetAz * spreadDeg) * DEG;
    const elevation = (elevationDeg + offsetEl * spreadDeg) * DEG;
    lights[i].position.set(
      Math.cos(azimuth) * Math.cos(elevation) * distance,
      Math.sin(azimuth) * Math.cos(elevation) * distance,
      Math.sin(elevation) * distance,
    );
  }
}

function positionLightSourceVisual(
  panel: THREE.Group,
  arrow: THREE.ArrowHelper,
  azimuthDeg: number,
  elevationDeg: number,
  halfAngleDeg: number,
  distance: number,
) {
  const azimuth = azimuthDeg * DEG;
  const elevation = elevationDeg * DEG;
  const direction = new THREE.Vector3(
    Math.cos(azimuth) * Math.cos(elevation),
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
  ).normalize();
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
function buildStudioEnvironment(): THREE.Scene {
  const scene = new THREE.Scene();
  const geometries: THREE.PlaneGeometry[] = [];

  const room = new THREE.Mesh(
    new THREE.BoxGeometry(20, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0x101214, side: THREE.BackSide }),
  );
  scene.add(room);

  const panel = (
    width: number,
    height: number,
    radiance: number,
    position: [number, number, number],
  ) => {
    const geometry = new THREE.PlaneGeometry(width, height);
    geometries.push(geometry);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(radiance, radiance, radiance),
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
    return mesh;
  };

  // Panel radiances are deliberately modest: the environment provides fill
  // and reflections only. The shadow-casting directional key carries most of
  // the illumination — if the env dominates, shadows fade into a shadowless
  // wash (IBL cannot occlude) and the scene goes flat.
  // Key softbox (up-left-front, authored near STUDIO_AZIMUTH),
  // with a dimmer halo panel behind it faking diffusion falloff.
  panel(7, 5, 4, [-4.5, 5.5, 6]);
  panel(9.5, 7, 1.5, [-4.9, 6, 6.5]);
  // Fill softbox (right-front, low), much dimmer: lifts the shadow side.
  panel(6, 4.5, 1.2, [6.5, -1.5, 5.5]);
  // Overhead strip light: the long elegant highlight across polished bezels.
  panel(16, 1.6, 4, [0.5, 8.5, 1.5]);
  // Floor bounce card: weak warm lift from below.
  panel(12, 8, 0.5, [0, -8.5, 2]);

  return scene;
}

/**
 * The 2D simulator calibrated the date-ring center offset in rendered CSS
 * pixels at the 720px layout width; convert to photo pixels for the scene.
 */
const DATE_WHEEL_OFFSET_SCALE = G.IMG_W / 720;
// date-ring-overlay.png is 2300² (radius 1150); its original white band is
// 255px wide. Add 77px (~30%) of unscaled paper outside the artwork.
const DATE_RING_TEXTURE_RADIUS = 1150;
const DATE_RING_TEXTURE_MARGIN = 77;
const DATE_WHEEL_RADIUS_SCALE =
  (DATE_RING_TEXTURE_RADIUS + DATE_RING_TEXTURE_MARGIN) / DATE_RING_TEXTURE_RADIUS;
const DATE_WHEEL_OUTER_RADIUS = G.DATE_RING_DEFAULT_RADIUS * DATE_WHEEL_RADIUS_SCALE;

const FLAT_HAND_DEPTH = 4;

type Vec = [number, number, number];

/** Triangle-fan mesh from a list of flat convex polygons (hand space). */
function polygonGeometry(polygons: Vec[][]) {
  const positions: number[] = [];
  for (const polygon of polygons) {
    for (let i = 1; i + 1 < polygon.length; i++) {
      positions.push(...polygon[0], ...polygon[i], ...polygon[i + 1]);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

function outlineGeometry(outline: [number, number][], depth: number) {
  const shape = new THREE.Shape();
  outline.forEach(([x, y], index) => {
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
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
  const hw = G.BATON_HALF_W;
  const ridgeHeight = G.MARKER_PRISM_HEIGHT;
  const eaveHeight = G.MARKER_BASE_HEIGHT;
  const diamondSlope =
    (ridgeHeight - eaveHeight) / (G.R_BATON_IN_APEX - G.R_BATON_IN);
  const tipHeight = eaveHeight - diamondSlope * (G.R_BATON_IN - G.R_BATON_IN_APEX_MIRROR);

  const outerLeftBottom: Vec = [-hw, G.R_BATON_OUT, 0];
  const outerRightBottom: Vec = [hw, G.R_BATON_OUT, 0];
  const outerLeftEave: Vec = [-hw, G.R_BATON_OUT, eaveHeight];
  const outerRightEave: Vec = [hw, G.R_BATON_OUT, eaveHeight];
  const innerLeftBottom: Vec = [-hw, G.R_BATON_IN, 0];
  const innerRightBottom: Vec = [hw, G.R_BATON_IN, 0];
  const innerLeftEave: Vec = [-hw, G.R_BATON_IN, eaveHeight];
  const innerRightEave: Vec = [hw, G.R_BATON_IN, eaveHeight];
  const outerRidge: Vec = [0, G.R_BATON_OUT - G.BATON_OUTER_END_DEPTH, ridgeHeight];
  const innerRidge: Vec = [0, G.R_BATON_IN_APEX, ridgeHeight];
  const facetTip: Vec = [0, G.R_BATON_IN_APEX_MIRROR, tipHeight];
  const slabTip: Vec = [0, G.R_BATON_IN_APEX_MIRROR, 0];

  return polygonGeometry([
    // Top facets.
    [outerLeftEave, outerRightEave, outerRidge],
    [outerLeftEave, outerRidge, innerRidge, innerLeftEave],
    [outerRightEave, innerRightEave, innerRidge, outerRidge],
    // Flat diamond: facet tip, both eave corners, and ridge end share one plane.
    [facetTip, innerLeftEave, innerRidge, innerRightEave],
    // Vertical base walls around the footprint.
    [outerLeftBottom, outerRightBottom, outerRightEave, outerLeftEave],
    [outerLeftBottom, outerLeftEave, innerLeftEave, innerLeftBottom],
    [outerRightBottom, innerRightBottom, innerRightEave, outerRightEave],
    // Vertical arrow walls rising to the diamond's raised tip edges.
    [slabTip, innerLeftBottom, innerLeftEave, facetTip],
    [slabTip, facetTip, innerRightEave, innerRightBottom],
  ]);
}

/** Two-facet Dauphine hour hand with the solved planar ridge tip. */
function hourHandGeometry() {
  const ridgeRear = { x: 0, y: G.HOUR_HAND_REAR_RADIUS, z: G.HOUR_HAND_PRISM_HEIGHT };
  const positiveBase = { x: G.HOUR_HAND_HALF_WIDTH, y: G.HOUR_HAND_BASE_RADIUS, z: 0 };
  const positiveTip = { x: G.HOUR_HAND_TIP_HALF_WIDTH, y: G.HOUR_HAND_TIP_RADIUS, z: 0 };
  const ridgeTipHeight = planeHeightAt(ridgeRear, positiveTip, positiveBase, 0, G.HOUR_HAND_TIP_RADIUS);
  const rr: Vec = [ridgeRear.x, ridgeRear.y, ridgeRear.z];
  const ridgeTip: Vec = [0, G.HOUR_HAND_TIP_RADIUS, ridgeTipHeight];
  const posBase: Vec = [positiveBase.x, positiveBase.y, 0];
  const posTip: Vec = [positiveTip.x, positiveTip.y, 0];
  const negBase: Vec = [-positiveBase.x, positiveBase.y, 0];
  const negTip: Vec = [-positiveTip.x, positiveTip.y, 0];

  return polygonGeometry([
    [rr, posBase, posTip, ridgeTip],
    [rr, ridgeTip, negTip, negBase],
  ]);
}

/** Two-facet Dauphine minute hand (full-height ridge to the pointed tip). */
function minuteHandGeometry() {
  const ridgeRear: Vec = [0, G.MINUTE_HAND_REAR_RADIUS, G.MINUTE_HAND_PRISM_HEIGHT];
  const ridgeTip: Vec = [0, G.MINUTE_HAND_TIP_RADIUS, G.MINUTE_HAND_PRISM_HEIGHT];
  const negativeBase: Vec = [-G.MINUTE_HAND_HALF_WIDTH, G.MINUTE_HAND_BASE_RADIUS, 0];
  const positiveBase: Vec = [G.MINUTE_HAND_HALF_WIDTH, G.MINUTE_HAND_BASE_RADIUS, 0];

  return polygonGeometry([
    [ridgeRear, negativeBase, ridgeTip],
    [ridgeRear, ridgeTip, positiveBase],
  ]);
}

/** Red annular-sector hammer head, concentric with its dial rail. */
function hammerHeadGeometry(headRadius: number, halfLength: number, halfThickness: number, depth: number) {
  const halfAngle = halfLength / headRadius;
  const start = Math.PI / 2 - halfAngle;
  const end = Math.PI / 2 + halfAngle;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, headRadius + halfThickness, start, end, false);
  shape.absarc(0, 0, headRadius - halfThickness, end, start, true);
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 24 });
}

/**
 * Rounded-rect outline of the date aperture in watch coords (y up), traced
 * clockwise when seen from the front. Shared contract with the texture punch
 * in `punchDateWindow` so walls and hole coincide exactly.
 */
function dateWindowOutline(cornerDivisions = 16): THREE.Vector2[] {
  const left = G.DATE_WINDOW_CLIP_LEFT - G.CX;
  const right = G.DATE_WINDOW_CLIP_RIGHT - G.CX;
  const top = G.CY - G.DATE_WINDOW_CLIP_TOP;
  const bottom = G.CY - G.DATE_WINDOW_CLIP_BOTTOM;
  const r = DATE_WINDOW_CORNER_RADIUS;

  const shape = new THREE.Shape();
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
const EMITTER_HALF_ANGLE_DEG = 19;

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
function bakeDateWheelShading(
  canvas: HTMLCanvasElement,
  azimuthDeg: number,
  elevationDeg: number,
  keyTerm: number,
  ambientTerm: number,
  emitterHalfAngleDeg = EMITTER_HALF_ANGLE_DEG,
  dialThickness = DIAL_THICKNESS,
  dateWheelDepth = -STACK.dateWheel,
): number {
  const SIZE = canvas.width;
  const radius = G.DATE_RING_DEFAULT_RADIUS;
  const wheelCenterX = G.DATE_RING_OFFSET_X * DATE_WHEEL_OFFSET_SCALE;
  const wheelCenterY = -G.DATE_RING_OFFSET_Y * DATE_WHEEL_OFFSET_SCALE;

  const left = G.DATE_WINDOW_CLIP_LEFT - G.CX;
  const right = G.DATE_WINDOW_CLIP_RIGHT - G.CX;
  const top = G.CY - G.DATE_WINDOW_CLIP_TOP;
  const bottom = G.CY - G.DATE_WINDOW_CLIP_BOTTOM;
  const corner = DATE_WINDOW_CORNER_RADIUS;
  const depth = dateWheelDepth;
  const margin = 120; // beyond this the disc is sealed under the dial anyway

  const insideAperture = (x: number, y: number) => {
    if (x < left || x > right || y < bottom || y > top) return false;
    const dx = Math.max(0, Math.max(left + corner - x, x - (right - corner)));
    const dy = Math.max(0, Math.max(bottom + corner - y, y - (top - corner)));
    return dx * dx + dy * dy <= corner * corner;
  };

  // Irrational R2 sequence: dense deterministic sampling without rows,
  // columns, or diagonals that can become visible in the penumbra.
  const plastic = 1.324717957244746;
  const r2x = 1 / plastic;
  const r2y = 1 / (plastic * plastic);
  const fract = (value: number) => value - Math.floor(value);

  // --- Key term: high-density square-emitter integration.
  const azimuth = azimuthDeg * DEG;
  const elevation = elevationDeg * DEG;
  const d = new THREE.Vector3(
    Math.cos(azimuth) * Math.cos(elevation),
    Math.sin(azimuth) * Math.cos(elevation),
    Math.sin(elevation),
  );
  const u = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 0, 1)).normalize();
  const v = new THREE.Vector3().crossVectors(u, d).normalize();
  const spread = Math.tan(emitterHalfAngleDeg * DEG) * 1.35;

  // Every sample is tested against the exact analytic rounded rectangle at
  // both faces of the dial plate. No polygon or fractional-edge approximation.
  // The raised-cosine profile reaches zero at the physical source boundary.
  const EMITTER_SAMPLES = 4096;
  const faceOffsetX = new Float64Array(EMITTER_SAMPLES);
  const faceOffsetY = new Float64Array(EMITTER_SAMPLES);
  const plateOffsetX = new Float64Array(EMITTER_SAMPLES);
  const plateOffsetY = new Float64Array(EMITTER_SAMPLES);
  const weights = new Float64Array(EMITTER_SAMPLES);
  let unoccluded = 0;
  const sample = new THREE.Vector3();
  for (let i = 0; i < EMITTER_SAMPLES; i++) {
    const a = (fract(0.5 + (i + 1) * r2x) - 0.5) * 2;
    const b = (fract(0.5 + (i + 1) * r2y) - 0.5) * 2;
    const window =
      (0.5 + 0.5 * Math.cos(a * Math.PI)) * (0.5 + 0.5 * Math.cos(b * Math.PI));
    sample
      .copy(d)
      .addScaledVector(u, a * spread)
      .addScaledVector(v, b * spread)
      .normalize();
    if (sample.z <= 0.02) continue;
    const tFace = depth / sample.z;
    const tPlate = (depth - dialThickness) / sample.z;
    faceOffsetX[i] = tFace * sample.x;
    faceOffsetY[i] = tFace * sample.y;
    plateOffsetX[i] = tPlate * sample.x;
    plateOffsetY[i] = tPlate * sample.y;
    weights[i] = window * sample.z;
    unoccluded += weights[i];
  }
  const keyFraction = (px: number, py: number) => {
    let sum = 0;
    for (let i = 0; i < EMITTER_SAMPLES; i++) {
      if (
        weights[i] > 0 &&
        insideAperture(px + faceOffsetX[i], py + faceOffsetY[i]) &&
        insideAperture(px + plateOffsetX[i], py + plateOffsetY[i])
      ) {
        sum += weights[i];
      }
    }
    return sum / unoccluded;
  };

  // --- Ambient term: high-density view-factor integration over the same
  // exact rounded rectangle. The analytic area keeps normalization exact.
  const APERTURE_SAMPLES = 2048;
  const apertureSamples: [number, number][] = [];
  for (let i = 0; apertureSamples.length < APERTURE_SAMPLES; i++) {
    const ax = left + fract(0.173 + (i + 1) * r2x) * (right - left);
    const ay = bottom + fract(0.619 + (i + 1) * r2y) * (top - bottom);
    if (insideAperture(ax, ay)) apertureSamples.push([ax, ay]);
  }
  const apertureArea =
    (right - left) * (top - bottom) - (4 - Math.PI) * corner * corner;
  const sampleArea = apertureArea / APERTURE_SAMPLES;
  const viewFactor = (px: number, py: number) => {
    let sum = 0;
    for (const [ax, ay] of apertureSamples) {
      const rx = ax - px;
      const ry = ay - py;
      const r2 = rx * rx + ry * ry + depth * depth;
      sum += (depth * depth) / (Math.PI * r2 * r2);
    }
    return sum * sampleArea;
  };
  const centerVF = viewFactor((left + right) / 2, (top + bottom) / 2);

  // --- Combine, normalized so the map's white equals `scale` irradiance.
  const scale = keyTerm + ambientTerm;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgb(0,0,0)";
  ctx.fillRect(0, 0, SIZE, SIZE);
  const image = ctx.getImageData(0, 0, SIZE, SIZE);
  const data = image.data;
  const x0 = Math.floor(((left - margin - wheelCenterX) / (2 * radius) + 0.5) * SIZE);
  const x1 = Math.ceil(((right + margin - wheelCenterX) / (2 * radius) + 0.5) * SIZE);
  // Canvas rows run top-down while UV v runs bottom-up (flipY upload).
  const rowFor = (y: number) => (0.5 - (y - wheelCenterY) / (2 * radius)) * SIZE;
  const y0 = Math.floor(rowFor(top + margin));
  const y1 = Math.ceil(rowFor(bottom - margin));

  for (let row = y0; row <= y1; row++) {
    const y = wheelCenterY + (0.5 - (row + 0.5) / SIZE) * 2 * radius;
    for (let col = x0; col <= x1; col++) {
      const x = wheelCenterX + ((col + 0.5) / SIZE - 0.5) * 2 * radius;
      const value =
        (keyFraction(x, y) * keyTerm + Math.min(1, viewFactor(x, y) / centerVF) * ambientTerm) /
        scale;
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
  const positions: number[] = [];
  const colors: number[] = [];
  // Physical lacquer color, not baked lighting. Only a mild warm contact
  // gradient remains at the bottom; illumination comes from the live key,
  // environment fill, and wheel-bounce approximation.
  const topColor = new THREE.Color(0xeee8e0);
  const bottomColor = new THREE.Color(0xd8d0c5);

  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    positions.push(a.x, a.y, 0, b.x, b.y, 0, b.x, b.y, -dialThickness);
    positions.push(a.x, a.y, 0, b.x, b.y, -dialThickness, a.x, a.y, -dialThickness);
    colors.push(...topColor.toArray(), ...topColor.toArray(), ...bottomColor.toArray());
    colors.push(...topColor.toArray(), ...bottomColor.toArray(), ...bottomColor.toArray());
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
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
function punchDateWindow(ctx: CanvasRenderingContext2D) {
  const margin = 24; // clears the old feathered hole + halo; nearest print is ~44px away
  const left = G.DATE_WINDOW_CLIP_LEFT;
  const top = G.DATE_WINDOW_CLIP_TOP;
  const width = G.DATE_WINDOW_CLIP_RIGHT - G.DATE_WINDOW_CLIP_LEFT;
  const height = G.DATE_WINDOW_CLIP_BOTTOM - G.DATE_WINDOW_CLIP_TOP;

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
function cleanBezelShadow(ctx: CanvasRenderingContext2D) {
  const R_INNER = 998; // feather start: untouched inside this radius
  const R_SOLID = 1010; // fully replaced from here outward
  const R_OUTER = G.R_DIAL_EDGE + 8; // meets the flat bezel cover
  const INK_MAX = 150; // darker than this = printed ink (or its halo)
  const PROTECT = 2; // px halo kept around ink so letter antialiasing survives
  const CREAM = [238, 232, 224]; // #eee8e0, same as the bezel cover fill

  const size = (Math.ceil(R_OUTER) + PROTECT + 1) * 2;
  const x0 = Math.round(G.CX) - size / 2;
  const y0 = Math.round(G.CY) - size / 2;
  const image = ctx.getImageData(x0, y0, size, size);
  const data = image.data;

  const ink = new Uint8Array(size * size);
  for (let i = 0; i < ink.length; i++) {
    const p = i * 4;
    if (Math.max(data[p], data[p + 1], data[p + 2]) < INK_MAX) ink[i] = 1;
  }

  for (let y = 0; y < size; y++) {
    const dy = y0 + y + 0.5 - G.CY;
    for (let x = 0; x < size; x++) {
      const dx = x0 + x + 0.5 - G.CX;
      const r = Math.hypot(dx, dy);
      if (r < R_INNER || r > R_OUTER) continue;
      const idx = y * size + x;
      if (ink[idx]) continue;
      let nearInk = false;
      for (let oy = -PROTECT; oy <= PROTECT && !nearInk; oy++) {
        const row = (y + oy) * size + x;
        for (let ox = -PROTECT; ox <= PROTECT; ox++) {
          if (ink[row + ox]) {
            nearInk = true;
            break;
          }
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
function drawDialLinework(ctx: CanvasRenderingContext2D) {
  const point = (deg: number, radius: number) => ({
    x: G.CX + Math.sin(deg * DEG) * radius,
    y: G.CY - Math.cos(deg * DEG) * radius,
  });
  ctx.strokeStyle = "#000000";
  ctx.fillStyle = "#000000";
  ctx.lineWidth = G.DIAL_STROKE_WIDTH;

  const circle = (radius: number, fill = false) => {
    ctx.beginPath();
    ctx.arc(G.CX, G.CY, radius, 0, Math.PI * 2);
    if (fill) ctx.fill();
    else ctx.stroke();
  };
  const radialLine = (deg: number, r0: number, r1: number) => {
    const from = point(deg, r0);
    const to = point(deg, r1);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };
  const dot = (deg: number, radius: number, dotRadius: number) => {
    const center = point(deg, radius);
    ctx.beginPath();
    ctx.arc(center.x, center.y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  };

  circle(G.R_DIAL_EDGE);
  circle(G.R_WEEK_OUT);
  circle(G.R_WEEK_IN);
  circle(G.R_DAY_OUT);
  circle(G.R_DAY_IN);

  for (let k = 0; k < 12; k++) {
    radialLine(G.MONTH_SECTOR_OFFSET_DEG + k * 30, G.R_WEEK_OUT, G.R_DIAL_EDGE);
  }
  for (let k = 1; k < G.WEEK_COUNT; k += 2) {
    const deg = G.WEEK_OFFSET_DEG + k * G.WEEK_STEP_DEG;
    radialLine(deg, G.R_WEEK_IN, G.R_WEEK_OUT);
    dot(deg, G.R_WEEK_DOT, G.WEEK_DOT_RADIUS + G.DIAL_STROKE_WIDTH / 2);
  }
  for (let k = 0; k < 7; k++) {
    radialLine(G.DAY_SECTOR_OFFSET_DEG + k * G.DAY_SECTOR_STEP_DEG, G.R_DAY_IN, G.R_DAY_OUT);
  }
  for (let k = 0; k < 60; k++) {
    if (G.MINUTE_SKIP.has(k)) continue;
    dot(G.MINUTE_OFFSET_DEG + k * G.MINUTE_STEP_DEG, G.R_MINUTE, G.MINUTE_DOT_RADIUS);
  }
  circle(37, true);
}

type Props = {
  className?: string;
};

type ElementKey =
  | "dial"
  | "markers"
  | "dateWheel"
  | "week"
  | "day"
  | "hour"
  | "minute"
  | "second";

const ELEMENT_OPTIONS: { key: ElementKey; label: string }[] = [
  { key: "dial", label: "Main dial" },
  { key: "markers", label: "Markers" },
  { key: "dateWheel", label: "Date wheel" },
  { key: "week", label: "Week" },
  { key: "day", label: "Day" },
  { key: "hour", label: "Hour" },
  { key: "minute", label: "Minute" },
  { key: "second", label: "Second" },
];

const HAND_KEYS: ElementKey[] = ["week", "day", "hour", "minute", "second"];

type LightSettings = {
  azimuth: number;
  elevation: number;
  intensity: number;
  ambient: number;
  /** Angular half-size of the square key emitter, in degrees. */
  size: number;
  /** Distance from the center of the dial, in scene units. */
  distance: number;
};

type DateDiskSettings = {
  /** Additional offsets in the 720px calibration coordinate system. */
  x: number;
  y: number;
  dayOffset: number;
  scale: number;
};

const DEFAULT_DATE_DISK: DateDiskSettings = {
  x: 24,
  y: 0,
  dayOffset: 25,
  scale: 0.889,
};

type DateStructureSettings = {
  dialThickness: number;
  dateWheelGap: number;
};

const DEFAULT_DATE_STRUCTURE: DateStructureSettings = {
  dialThickness: DIAL_THICKNESS,
  dateWheelGap: -STACK.dateWheel - DIAL_THICKNESS,
};

type DateWheelBandSettings = {
  x: number;
  y: number;
  /** Centerline radius as a share of the wheel's outer radius. */
  radius: number;
  /** Full band width as a share of its centerline radius. */
  width: number;
};

const DEFAULT_DATE_WHEEL_BAND: DateWheelBandSettings = {
  x: -1,
  y: -2,
  radius: 0.83,
  width: 0.42,
};

type DateWheelSqueezeSettings = {
  axisAngle: number;
  scale: number;
};

const DEFAULT_DATE_WHEEL_SQUEEZE: DateWheelSqueezeSettings = {
  axisAngle: 0,
  scale: 0.995,
};

const SHOW_DATE_CALIBRATION_CONTROLS = false;

const LIGHT_DISTANCE = 5000;

type SceneHandles = {
  elements: Record<ElementKey, THREE.Object3D>;
  keyLights: THREE.DirectionalLight[];
  lightSource: THREE.Group;
  lightSourcePanel: THREE.Group;
  lightSourceArrow: THREE.ArrowHelper;
  camera: THREE.PerspectiveCamera;
  controls: TrackballControls;
  scene: THREE.Scene;
  setDialOcclusion: (enabled: boolean) => void;
  setDateWheelBandVisible: (visible: boolean) => void;
  updateDateStructure: (settings: DateStructureSettings) => void;
  updateDateWheelBand: (settings: DateWheelBandSettings) => void;
  updateWallLighting: (
    ambient: number,
    keyIntensity: number,
    elevationDeg: number,
  ) => void;
  updateWheelLight: (
    azimuthDeg: number,
    elevationDeg: number,
    intensity: number,
    ambient: number,
    emitterHalfAngleDeg: number,
    dialThickness: number,
    dateWheelDepth: number,
  ) => void;
};

function toggleButtonClass(active: boolean) {
  return `rounded-lg border px-2 py-1.5 text-xs font-semibold transition active:scale-95 ${
    active
      ? "border-black bg-black text-white hover:bg-zinc-800"
      : "border-black/25 bg-white text-black hover:bg-zinc-100"
  }`;
}

export function Watch3D({ className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lightTrackballRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneHandles | null>(null);
  const dateDiskRef = useRef<DateDiskSettings>({ ...DEFAULT_DATE_DISK });
  const dateStructureRef = useRef<DateStructureSettings>({ ...DEFAULT_DATE_STRUCTURE });
  const dateWheelSqueezeRef = useRef<DateWheelSqueezeSettings>({
    ...DEFAULT_DATE_WHEEL_SQUEEZE,
  });
  const [resetView, setResetView] = useState<(() => void) | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"elements" | "light">("elements");
  const [showLightSource, setShowLightSource] = useState(true);
  const [showDateWheelBand, setShowDateWheelBand] = useState(false);
  // Realism rebuild in progress: start from just the dial + date wheel and
  // re-enable elements as each one is brought up to standard.
  const [visibility, setVisibility] = useState<Record<ElementKey, boolean>>({
    dial: true,
    markers: false,
    dateWheel: true,
    week: false,
    day: false,
    hour: false,
    minute: false,
    second: false,
  });
  const [light, setLight] = useState<LightSettings>({
    azimuth: DEFAULT_AZIMUTH,
    elevation: DEFAULT_ELEVATION,
    intensity: DEFAULT_LIGHT_INTENSITY,
    ambient: DEFAULT_AMBIENT_INTENSITY,
    size: EMITTER_HALF_ANGLE_DEG,
    distance: LIGHT_DISTANCE,
  });
  const [dateDisk, setDateDisk] = useState<DateDiskSettings>({ ...DEFAULT_DATE_DISK });
  const [dateStructure, setDateStructure] = useState<DateStructureSettings>({
    ...DEFAULT_DATE_STRUCTURE,
  });
  const [dateWheelBand, setDateWheelBand] = useState<DateWheelBandSettings>({
    ...DEFAULT_DATE_WHEEL_BAND,
  });
  const [dateWheelSqueeze, setDateWheelSqueeze] = useState<DateWheelSqueezeSettings>({
    ...DEFAULT_DATE_WHEEL_SQUEEZE,
  });
  dateDiskRef.current = dateDisk;
  dateStructureRef.current = dateStructure;
  dateWheelSqueezeRef.current = dateWheelSqueeze;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Balanced so the lit dial cream lands on the 2D view's tone (~240).
    renderer.toneMappingExposure = 1.22;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    // PCF (not PCFSoft) so shadow.radius works: the reference photos show a
    // clearly feathered penumbra on the date disc, not a hard edge.
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1e9e0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(buildStudioEnvironment(), 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = DEFAULT_AMBIENT_INTENSITY;
    scene.environmentRotation.set(0, 0, (DEFAULT_AZIMUTH - STUDIO_AZIMUTH) * DEG);

    // Key "area light": the softbox has real angular size, so a single
    // directional light can never reproduce its shadows — they'd be uniform
    // gray bands with one blurred edge. Instead the key is a cluster of
    // jittered shadow-casting directionals spanning the softbox's angular
    // extent; their summed binary shadows build the physically-correct
    // penumbra: darkest deep in a cavity where the whole panel is hidden,
    // brightening progressively as more of the panel becomes visible.
    const keyLights: THREE.DirectionalLight[] = [];
    for (let i = 0; i < AREA_LIGHT_OFFSETS.length; i++) {
      const keyLight = new THREE.DirectionalLight(
        0xffffff,
        DEFAULT_LIGHT_INTENSITY / AREA_LIGHT_OFFSETS.length,
      );
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(2048, 2048);
      keyLight.shadow.camera.left = -1300;
      keyLight.shadow.camera.right = 1300;
      keyLight.shadow.camera.top = 1300;
      keyLight.shadow.camera.bottom = -1300;
      keyLight.shadow.camera.near = 2000;
      keyLight.shadow.camera.far = 9000;
      // DirectionalLightShadow never refreshes its projection on its own —
      // without this the shadow camera keeps its default ±5 unit frustum and
      // the whole watch falls outside the (empty) shadow map.
      keyLight.shadow.camera.updateProjectionMatrix();
      keyLight.shadow.bias = -0.0002;
      keyLight.shadow.normalBias = 4;
      keyLight.shadow.radius = 4;
      scene.add(keyLight);
      keyLights.push(keyLight);
    }
    positionKeyLights(keyLights, DEFAULT_AZIMUTH, DEFAULT_ELEVATION);

    // Visible proxy for the physically sampled softbox. Its center, plane,
    // angular size, and distance use the same parameters as the lighting rig.
    // It is deliberately non-lighting geometry: the photon bake and key
    // cluster remain the source of illumination, avoiding double lighting.
    const lightSource = new THREE.Group();
    lightSource.name = "Key softbox visualization";
    const lightSourcePanel = new THREE.Group();
    const sourcePlaneGeometry = new THREE.PlaneGeometry(1, 1);
    const sourceFabric = new THREE.Mesh(
      sourcePlaneGeometry,
      new THREE.MeshBasicMaterial({
        color: 0xfff8df,
        side: THREE.FrontSide,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    const sourceBacking = new THREE.Mesh(
      sourcePlaneGeometry,
      new THREE.MeshBasicMaterial({
        color: 0x171717,
        side: THREE.BackSide,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        toneMapped: false,
      }),
    );
    const sourceOutline = new THREE.LineSegments(
      new THREE.EdgesGeometry(sourcePlaneGeometry),
      new THREE.LineBasicMaterial({ color: 0xff6a00, toneMapped: false }),
    );
    sourceOutline.position.z = 2;
    const sourceFrameMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6a00,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const sourceFrame = new THREE.Group();
    const addFrameBar = (width: number, height: number, x: number, y: number) => {
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(width, height), sourceFrameMaterial);
      bar.position.set(x, y, 3);
      sourceFrame.add(bar);
    };
    addFrameBar(1, 0.025, 0, 0.4875);
    addFrameBar(1, 0.025, 0, -0.4875);
    addFrameBar(0.025, 0.95, 0.4875, 0);
    addFrameBar(0.025, 0.95, -0.4875, 0);
    lightSourcePanel.add(sourceFabric, sourceBacking, sourceOutline, sourceFrame);
    lightSource.add(lightSourcePanel);

    const lightSourceArrow = new THREE.ArrowHelper(
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, 30),
      LIGHT_DISTANCE,
      0xff6a00,
      180,
      90,
    );
    lightSource.add(lightSourceArrow);
    scene.add(lightSource);
    positionLightSourceVisual(
      lightSourcePanel,
      lightSourceArrow,
      DEFAULT_AZIMUTH,
      DEFAULT_ELEVATION,
      EMITTER_HALF_ANGLE_DEG,
      LIGHT_DISTANCE,
    );

    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / Math.max(1, container.clientHeight),
      10,
      40_000,
    );
    // Straight-on default: dial facing the camera, 12 o'clock up. Reset view
    // restores exactly this framing (TrackballControls captures it).
    camera.position.set(0, 0, 4300);

    // Trackball (not orbit) controls: free tumbling with no pole lock, so the
    // watch can be flipped over and inspected from the back. Right-drag pans
    // the camera target for framing close-ups.
    const controls = new TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 3;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.dynamicDampingFactor = 0.12;
    controls.minDistance = 400;
    controls.maxDistance = 30_000;
    controls.target.set(0, 0, 0);
    if (import.meta.env.DEV) {
      // Dev-only handle for scripted QA framing (not part of the product UI).
      (window as unknown as Record<string, unknown>).__watch3dQA = { camera, controls, scene, renderer };
    }

    const textureLoader = new THREE.TextureLoader();
    const dateWheelTexture = textureLoader.load(
      `${import.meta.env.BASE_URL}date-wheel-albedo.png`,
    );
    dateWheelTexture.colorSpace = THREE.SRGBColorSpace;
    dateWheelTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const dateWheelNormalMap = textureLoader.load(
      `${import.meta.env.BASE_URL}date-wheel-normal.png`,
    );
    dateWheelNormalMap.colorSpace = THREE.NoColorSpace;
    dateWheelNormalMap.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Dial: the composited photo is now treated as albedo on a lit lacquer
    // material, so the dial responds to the studio rig (sheen sweeps as the
    // watch tilts). Specular is kept deliberately tame: near-white albedo
    // plus softbox reflections veiled the artwork at oblique angles, so the
    // sheen must stay a whisper, never a wash.
    const dialMaterial = new THREE.MeshPhysicalMaterial({
      alphaTest: 0.5,
      metalness: 0,
      roughness: 0.55,
      specularIntensity: 0.4,
      clearcoat: 0.2,
      clearcoatRoughness: 0.5,
      // The dial is a flat single-sided disc: with the default shadowSide
      // (back faces only) a plane renders NOTHING into the shadow map and
      // casts no shadow at all — this is what killed the date-window shadow.
      shadowSide: THREE.DoubleSide,
    });
    textureLoader.load(
      `${import.meta.env.BASE_URL}reference-handless-date-cutout.png`,
      (photo) => {
        const canvas = document.createElement("canvas");
        canvas.width = G.IMG_W;
        canvas.height = G.IMG_H;
        const ctx = canvas.getContext("2d");
        let composed: THREE.Texture;
        if (ctx) {
          ctx.drawImage(photo.image as CanvasImageSource, 0, 0);
          // Recut the date aperture crisply, aligned with the wall geometry.
          punchDateWindow(ctx);
          // Erase the photo's baked-in bezel shadow just inside the dial edge
          // (patchy after hand inpainting, so it shows as a broken gray arc).
          cleanBezelShadow(ctx);
          // Cover the photographed case bezel with clean dial cream: its gray
          // starts ~13px outside the dial edge and bleeds inward as a gray
          // rim arc under mipmapped sampling. 1036 clears the 9px edge ring
          // stroke (ends at 1034.5); the nearest print is far inside.
          ctx.fillStyle = "#eee8e0";
          ctx.beginPath();
          ctx.rect(0, 0, canvas.width, canvas.height);
          ctx.arc(G.CX, G.CY, G.R_DIAL_EDGE + 6, 0, Math.PI * 2, true);
          ctx.fill();
          drawDialLinework(ctx);
          composed = new THREE.CanvasTexture(canvas);
          photo.dispose();
        } else {
          composed = photo;
        }
        composed.colorSpace = THREE.SRGBColorSpace;
        composed.anisotropy = renderer.capabilities.getMaxAnisotropy();
        dialMaterial.map = composed;
        dialMaterial.needsUpdate = true;
      },
    );

    const polishedBlack = new THREE.MeshPhysicalMaterial({
      color: 0x111312,
      metalness: 1,
      roughness: 0.16,
      side: THREE.DoubleSide,
    });
    const deepBlack = new THREE.MeshPhysicalMaterial({
      color: 0x090a09,
      metalness: 1,
      roughness: 0.34,
      side: THREE.DoubleSide,
    });
    const steel = new THREE.MeshPhysicalMaterial({
      color: 0xd8dadb,
      metalness: 1,
      roughness: 0.17,
      side: THREE.DoubleSide,
    });
    const redPaint = new THREE.MeshPhysicalMaterial({
      color: 0x9b121e,
      metalness: 0,
      roughness: 0.34,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
      side: THREE.DoubleSide,
    });
    const graphiteShaft = new THREE.MeshPhysicalMaterial({
      color: 0x35322d,
      metalness: 0.85,
      roughness: 0.42,
      side: THREE.DoubleSide,
    });
    // Lacquered cut edge of the dial plate. The explicit environment map lets
    // us drive cavity fill independently from scene.environmentIntensity;
    // updateWallLighting below reconnects it to the Ambient control and adds
    // a small key-dependent bounce term from the white date wheel.
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      metalness: 0,
      roughness: 0.68,
      envMap: environment.texture,
      envMapIntensity: 0.36,
      emissive: 0x8a8175,
      emissiveIntensity: 0.08,
      side: THREE.DoubleSide,
    });
    const updateWallLighting = (
      ambient: number,
      keyIntensity: number,
      elevationDeg: number,
    ) => {
      const keyIrradiance = keyIntensity * Math.sin(elevationDeg * DEG);
      const wheelBounce = keyIrradiance * 0.04;
      wallMaterial.envMapIntensity = THREE.MathUtils.clamp(
        0.06 + ambient * 0.28 + wheelBounce,
        0.04,
        0.8,
      );
      wallMaterial.emissiveIntensity = THREE.MathUtils.clamp(
        0.02 + ambient * 0.04 + keyIrradiance * 0.015,
        0.01,
        0.18,
      );
    };
    updateWallLighting(
      DEFAULT_AMBIENT_INTENSITY,
      DEFAULT_LIGHT_INTENSITY,
      DEFAULT_ELEVATION,
    );

    const watch = new THREE.Group();
    scene.add(watch);

    // Dial face with the calibrated dial-only photo; the date aperture is
    // transparent in the texture, so alphaTest punches a real hole. The disc
    // extends slightly past the printed edge ring so the ring renders whole
    // (not cut at the silhouette) with clean cream on both sides.
    const dialGeometry = new THREE.CircleGeometry(G.R_DIAL_EDGE + 10, 160);
    {
      const positions = dialGeometry.attributes.position;
      const uvs = dialGeometry.attributes.uv;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        uvs.setXY(i, (G.CX + x) / G.IMG_W, 1 - (G.CY - y) / G.IMG_H);
      }
    }
    const dial = new THREE.Mesh(dialGeometry, dialMaterial);
    // The dial both receives (marker/hand shadows) and casts: its aperture
    // edge throws the recess shadow onto the date wheel below. The shadow
    // depth pass honors the material's alphaTest, so the hole is real there.
    dial.castShadow = true;
    dial.receiveShadow = true;
    const dialAssembly = new THREE.Group();
    dialAssembly.add(dial);
    watch.add(dialAssembly);

    // Recessed date wheel: rendered UNLIT — its entire illumination is the
    // photon-computed bake (square-emitter key + view-factor ambient), so
    // neither the directional cluster nor its shadow maps ever touch it.
    const wheelShadingTerms = (elevationDeg: number, intensity: number, ambient: number) => ({
      keyTerm: intensity * Math.sin(elevationDeg * DEG),
      ambientTerm: ambient * 0.45,
    });
    const lightMapCanvas = document.createElement("canvas");
    lightMapCanvas.width = 1024;
    lightMapCanvas.height = 1024;
    const initialTerms = wheelShadingTerms(
      DEFAULT_ELEVATION,
      DEFAULT_LIGHT_INTENSITY,
      DEFAULT_AMBIENT_INTENSITY,
    );
    const initialScale = bakeDateWheelShading(
      lightMapCanvas,
      DEFAULT_AZIMUTH,
      DEFAULT_ELEVATION,
      initialTerms.keyTerm,
      initialTerms.ambientTerm,
    );
    const dateWheelLightMap = new THREE.CanvasTexture(lightMapCanvas);
    dateWheelLightMap.center.set(0.5, 0.5);
    dateWheelLightMap.matrixAutoUpdate = false;
    const initialLightDirection = new THREE.Vector3(
      Math.cos(DEFAULT_AZIMUTH * DEG) * Math.cos(DEFAULT_ELEVATION * DEG),
      Math.sin(DEFAULT_AZIMUTH * DEG) * Math.cos(DEFAULT_ELEVATION * DEG),
      Math.sin(DEFAULT_ELEVATION * DEG),
    ).normalize();
    const dateWheelMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: dateWheelTexture },
        uNormalMap: { value: dateWheelNormalMap },
        uLightMap: { value: dateWheelLightMap },
        uLightMapMatrix: { value: dateWheelLightMap.matrix },
        uLightMapIntensity: { value: initialScale },
        uLightDirection: { value: initialLightDirection },
        uDialOcclusion: { value: 1 },
        uNormalStrength: { value: 1 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vViewPosition;

        void main() {
          vUv = uv;
          vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = viewPosition.xyz;
          gl_Position = projectionMatrix * viewPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D uMap;
        uniform sampler2D uNormalMap;
        uniform sampler2D uLightMap;
        uniform mat3 uLightMapMatrix;
        uniform float uLightMapIntensity;
        uniform vec3 uLightDirection;
        uniform float uDialOcclusion;
        uniform float uNormalStrength;
        uniform mat3 normalMatrix;

        varying vec2 vUv;
        varying vec3 vViewPosition;

        void main() {
          vec4 albedoSample = texture2D(uMap, vUv);
          if (albedoSample.a < 0.4) discard;

          vec3 tangentNormal = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
          tangentNormal.xy *= uNormalStrength;
          tangentNormal = normalize(tangentNormal);

          vec3 normalView = normalize(normalMatrix * tangentNormal);
          vec3 flatNormalView = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
          vec3 lightView = normalize(mat3(viewMatrix) * uLightDirection);
          vec3 viewDirection = normalize(-vViewPosition);
          vec3 halfDirection = normalize(lightView + viewDirection);

          float flatDiffuse = max(dot(flatNormalView, lightView), 0.08);
          float reliefDiffuse = max(dot(normalView, lightView), 0.0);
          float reliefRatio = clamp(reliefDiffuse / flatDiffuse, 0.45, 1.65);

          vec2 lightUv = (uLightMapMatrix * vec3(vUv, 1.0)).xy;
          float bakedIrradiance =
            texture2D(uLightMap, lightUv).r * uLightMapIntensity;
          float illumination = mix(1.0, bakedIrradiance, uDialOcclusion);

          float albedoLuminance = dot(
            albedoSample.rgb,
            vec3(0.2126, 0.7152, 0.0722)
          );
          float inkMask = 1.0 - smoothstep(0.08, 0.72, albedoLuminance);
          float relief = mix(1.0, reliefRatio, 0.88 * inkMask);
          float visibility = mix(
            1.0,
            clamp(bakedIrradiance / max(uLightMapIntensity, 0.001), 0.0, 1.0),
            uDialOcclusion
          );
          float inkSpecular =
            pow(max(dot(normalView, halfDirection), 0.0), 20.0) *
            0.1 *
            inkMask *
            visibility;

          vec3 outgoingLight =
            albedoSample.rgb * illumination * relief +
            vec3(inkSpecular);
          gl_FragColor = vec4(outgoingLight, albedoSample.a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }
      `,
      toneMapped: true,
    });
    const dateWheelGeometry = new THREE.CircleGeometry(DATE_WHEEL_OUTER_RADIUS, 192);
    const dateWheelFace = new THREE.Mesh(dateWheelGeometry, dateWheelMaterial);
    const initialBandRadius = DATE_WHEEL_OUTER_RADIUS * DEFAULT_DATE_WHEEL_BAND.radius;
    const initialBandWidth = initialBandRadius * DEFAULT_DATE_WHEEL_BAND.width;
    const dateWheelBandMesh = new THREE.Mesh(
      new THREE.RingGeometry(
        initialBandRadius - initialBandWidth / 2,
        initialBandRadius + initialBandWidth / 2,
        256,
      ),
      new THREE.MeshBasicMaterial({
        color: 0x006cff,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    );
    dateWheelBandMesh.position.set(
      DEFAULT_DATE_WHEEL_BAND.x * DATE_WHEEL_OFFSET_SCALE,
      -DEFAULT_DATE_WHEEL_BAND.y * DATE_WHEEL_OFFSET_SCALE,
      2,
    );
    dateWheelBandMesh.visible = false;
    const setDateWheelBandVisible = (visible: boolean) => {
      dateWheelBandMesh.visible = visible;
    };
    let currentBandRadius = DEFAULT_DATE_WHEEL_BAND.radius;
    let currentBandWidth = DEFAULT_DATE_WHEEL_BAND.width;
    const updateDateWheelBand = (settings: DateWheelBandSettings) => {
      dateWheelBandMesh.position.set(
        settings.x * DATE_WHEEL_OFFSET_SCALE,
        -settings.y * DATE_WHEEL_OFFSET_SCALE,
        2,
      );
      if (settings.radius === currentBandRadius && settings.width === currentBandWidth) return;
      const radius = DATE_WHEEL_OUTER_RADIUS * settings.radius;
      const width = radius * settings.width;
      const previousGeometry = dateWheelBandMesh.geometry;
      dateWheelBandMesh.geometry = new THREE.RingGeometry(
        radius - width / 2,
        radius + width / 2,
        256,
      );
      previousGeometry.dispose();
      currentBandRadius = settings.radius;
      currentBandWidth = settings.width;
    };
    const dateWheelSqueezeOuter = new THREE.Group();
    const dateWheelSqueezeInner = new THREE.Group();
    dateWheelSqueezeOuter.add(dateWheelSqueezeInner);
    dateWheelSqueezeInner.add(dateWheelFace);

    const squeezeAxisDirection = new THREE.Vector3(1, 0, 0);
    const dateWheelSqueezeAxis = new THREE.ArrowHelper(
      squeezeAxisDirection,
      new THREE.Vector3(0, 0, 4),
      DATE_WHEEL_OUTER_RADIUS * 0.48,
      0xff2d55,
      42,
      22,
    );
    dateWheelSqueezeAxis.visible = SHOW_DATE_CALIBRATION_CONTROLS;
    const dateWheelRotation = new THREE.Group();
    dateWheelRotation.add(
      dateWheelSqueezeOuter,
      dateWheelBandMesh,
      dateWheelSqueezeAxis,
    );
    const dateWheel = new THREE.Group();
    dateWheel.add(dateWheelRotation);

    const setDialOcclusion = (enabled: boolean) => {
      dateWheelMaterial.uniforms.uDialOcclusion.value = enabled ? 1 : 0;
    };

    // Re-bake the photon integral when the light rig moves. Intensity changes
    // apply immediately through the map scale.
    let bakeTimer: ReturnType<typeof setTimeout> | undefined;
    const updateWheelLight = (
      azimuthDeg: number,
      elevationDeg: number,
      intensity: number,
      ambient: number,
      emitterHalfAngleDeg: number,
      dialThickness: number,
      dateWheelDepth: number,
    ) => {
      const { keyTerm, ambientTerm } = wheelShadingTerms(elevationDeg, intensity, ambient);
      dateWheelMaterial.uniforms.uLightMapIntensity.value = keyTerm + ambientTerm;
      const azimuth = azimuthDeg * DEG;
      const elevation = elevationDeg * DEG;
      (
        dateWheelMaterial.uniforms.uLightDirection.value as THREE.Vector3
      ).set(
        Math.cos(azimuth) * Math.cos(elevation),
        Math.sin(azimuth) * Math.cos(elevation),
        Math.sin(elevation),
      );
      clearTimeout(bakeTimer);
      bakeTimer = setTimeout(() => {
        bakeDateWheelShading(
          lightMapCanvas,
          azimuthDeg,
          elevationDeg,
          keyTerm,
          ambientTerm,
          emitterHalfAngleDeg,
          dialThickness,
          dateWheelDepth,
        );
        dateWheelLightMap.needsUpdate = true;
      }, 120);
    };
    dateWheel.position.set(
      G.DATE_RING_OFFSET_X * DATE_WHEEL_OFFSET_SCALE,
      -G.DATE_RING_OFFSET_Y * DATE_WHEEL_OFFSET_SCALE,
      STACK.dateWheel,
    );
    watch.add(dateWheel);

    const apertureWalls = new THREE.Mesh(dateWindowWallGeometry(), wallMaterial);
    apertureWalls.castShadow = true;
    apertureWalls.receiveShadow = true;
    dialAssembly.add(apertureWalls);

    // Sealed floor of the enclosure behind the dial. Env map assigned
    // directly (r185 override, see wall material) and nearly off: the space
    // behind the dial is closed — the only light in there should be what
    // enters through the date aperture.
    const movementBackdrop = new THREE.Mesh(
      new THREE.CircleGeometry(G.R_DIAL_EDGE + 10, 96),
      new THREE.MeshStandardMaterial({
        color: 0x161514,
        roughness: 0.85,
        envMap: environment.texture,
        envMapIntensity: 0.1,
        side: THREE.DoubleSide,
      }),
    );
    movementBackdrop.receiveShadow = true;
    movementBackdrop.position.z = STACK.movementBackdrop;
    watch.add(movementBackdrop);

    // Applied hour markers: single batons plus the double baton at 12.
    const markersGroup = new THREE.Group();
    watch.add(markersGroup);
    const sharedBaton = batonGeometry();
    const addBaton = (angleDeg: number, lateralOffset = 0) => {
      const baton = new THREE.Mesh(sharedBaton, polishedBlack);
      baton.castShadow = true;
      const group = new THREE.Group();
      baton.position.x = lateralOffset;
      group.add(baton);
      group.rotation.z = -angleDeg * DEG;
      markersGroup.add(group);
    };
    for (const hour of G.SINGLE_BATON_HOURS) addBaton(G.hourAngleDeg(hour));
    addBaton(0, -G.BATON_12_LATERAL);
    addBaton(0, G.BATON_12_LATERAL);

    // Central post under the hand stack.
    const centerPost = new THREE.Mesh(
      new THREE.CylinderGeometry(37, 37, STACK.secondsHand, 48),
      deepBlack,
    );
    centerPost.rotation.x = Math.PI / 2;
    centerPost.position.z = STACK.secondsHand / 2;
    watch.add(centerPost);

    // Calendar indicator hands: flat shaft plus red annular hammer head.
    const buildIndicatorHand = (config: {
      headRadius: number;
      shaftStartRadius: number;
      shaftHalfWidth: number;
      headHalfLength: number;
      headHalfThickness: number;
      baseHeight: number;
    }) => {
      const group = new THREE.Group();
      const shaft = new THREE.Mesh(
        outlineGeometry(
          [
            [-config.shaftHalfWidth, config.shaftStartRadius],
            [-config.shaftHalfWidth, config.headRadius],
            [config.shaftHalfWidth, config.headRadius],
            [config.shaftHalfWidth, config.shaftStartRadius],
          ],
          FLAT_HAND_DEPTH,
        ),
        graphiteShaft,
      );
      const head = new THREE.Mesh(
        hammerHeadGeometry(
          config.headRadius,
          config.headHalfLength,
          config.headHalfThickness,
          FLAT_HAND_DEPTH + 3,
        ),
        redPaint,
      );
      group.add(shaft);
      group.add(head);
      group.position.z = config.baseHeight;
      watch.add(group);
      return group;
    };

    const dayHand = buildIndicatorHand({
      headRadius: G.DAY_HAND_HEAD_RADIUS,
      shaftStartRadius: G.DAY_HAND_SHAFT_START_RADIUS,
      shaftHalfWidth: G.DAY_HAND_SHAFT_HALF_WIDTH,
      headHalfLength: G.DAY_HAND_HEAD_HALF_LENGTH,
      headHalfThickness: G.DAY_HAND_HEAD_HALF_THICKNESS,
      baseHeight: STACK.dayHand,
    });
    const weekHand = buildIndicatorHand({
      headRadius: G.WEEK_HAND_HEAD_RADIUS,
      shaftStartRadius: G.WEEK_HAND_SHAFT_START_RADIUS,
      shaftHalfWidth: G.WEEK_HAND_SHAFT_HALF_WIDTH,
      headHalfLength: G.WEEK_HAND_HEAD_HALF_LENGTH,
      headHalfThickness: G.WEEK_HAND_HEAD_HALF_THICKNESS,
      baseHeight: STACK.weekHand,
    });

    const hourHand = new THREE.Group();
    hourHand.add(new THREE.Mesh(hourHandGeometry(), polishedBlack));
    hourHand.position.z = STACK.hourHand;
    watch.add(hourHand);

    const minuteHand = new THREE.Group();
    minuteHand.add(new THREE.Mesh(minuteHandGeometry(), polishedBlack));
    minuteHand.position.z = STACK.minuteHand;
    watch.add(minuteHand);

    // Seconds hand: flat blade, counterweight, and steel hub stack.
    const secondsHand = new THREE.Group();
    const bladeAlong = (y: number) => G.CY - y;
    secondsHand.add(
      new THREE.Mesh(
        outlineGeometry(
          [
            [-G.SECOND_HAND_TIP_HALF_W, bladeAlong(G.SECOND_HAND_TIP_Y)],
            [G.SECOND_HAND_TIP_HALF_W, bladeAlong(G.SECOND_HAND_TIP_Y)],
            [G.SECOND_HAND_NECK_HALF_W, bladeAlong(G.SECOND_HAND_NECK_Y)],
            [-G.SECOND_HAND_NECK_HALF_W, bladeAlong(G.SECOND_HAND_NECK_Y)],
          ],
          3,
        ),
        deepBlack,
      ),
    );
    secondsHand.add(
      new THREE.Mesh(
        outlineGeometry(
          [
            [-G.SECOND_HAND_TAIL_SHOULDER_HALF_W, bladeAlong(G.SECOND_HAND_TAIL_SHOULDER_Y)],
            [G.SECOND_HAND_TAIL_SHOULDER_HALF_W, bladeAlong(G.SECOND_HAND_TAIL_SHOULDER_Y)],
            [G.SECOND_HAND_TAIL_END_HALF_W, bladeAlong(G.SECOND_HAND_TAIL_END_Y)],
            [0, bladeAlong(G.SECOND_HAND_TAIL_POINT_Y)],
            [-G.SECOND_HAND_TAIL_END_HALF_W, bladeAlong(G.SECOND_HAND_TAIL_END_Y)],
          ],
          3,
        ),
        deepBlack,
      ),
    );
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(G.SECOND_HAND_HUB_RADIUS, G.SECOND_HAND_HUB_RADIUS, 10, 48),
      steel,
    );
    hub.rotation.x = Math.PI / 2;
    hub.position.z = 2;
    secondsHand.add(hub);
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(10, 10, 16, 32), steel);
    pin.rotation.x = Math.PI / 2;
    pin.position.z = 6;
    secondsHand.add(pin);
    secondsHand.position.z = STACK.secondsHand;
    watch.add(secondsHand);

    // Every hand floats above the dial; their cast shadows are the strongest
    // depth cue the scene has once they're visible.
    for (const handGroup of [dayHand, weekHand, hourHand, minuteHand, secondsHand]) {
      handGroup.traverse((node) => {
        if (node instanceof THREE.Mesh) node.castShadow = true;
      });
    }
    centerPost.castShadow = true;

    // Slim dark rim closing the gap between the dial edge and the backdrop,
    // so the caseless watch reads as a solid object from the side and back.
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(
        G.R_DIAL_EDGE + 10,
        G.R_DIAL_EDGE + 10,
        -STACK.movementBackdrop,
        128,
        1,
        true,
      ),
      new THREE.MeshStandardMaterial({ color: 0x1b1a19, roughness: 0.7, side: THREE.DoubleSide }),
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.z = STACK.movementBackdrop / 2;
    // The rim participates in shadowing so grazing key light can't sneak
    // under the dial edge into the sealed enclosure.
    rim.castShadow = true;
    rim.receiveShadow = true;
    watch.add(rim);

    let currentStructure = { ...DEFAULT_DATE_STRUCTURE };
    const updateDateStructure = (settings: DateStructureSettings) => {
      if (settings.dialThickness !== currentStructure.dialThickness) {
        const previousWalls = apertureWalls.geometry;
        apertureWalls.geometry = dateWindowWallGeometry(settings.dialThickness);
        previousWalls.dispose();
      }

      const dateWheelDepth = settings.dialThickness + settings.dateWheelGap;
      const enclosureDepth = dateWheelDepth + 10;
      movementBackdrop.position.z = -enclosureDepth;
      if (
        settings.dialThickness !== currentStructure.dialThickness ||
        settings.dateWheelGap !== currentStructure.dateWheelGap
      ) {
        const previousRim = rim.geometry;
        rim.geometry = new THREE.CylinderGeometry(
          G.R_DIAL_EDGE + 10,
          G.R_DIAL_EDGE + 10,
          enclosureDepth,
          128,
          1,
          true,
        );
        previousRim.dispose();
        rim.position.z = -enclosureDepth / 2;
      }
      currentStructure = { ...settings };
    };

    // Live local-time synchronization, anchored like the 2D simulator.
    const mountDate = new Date();
    const anchor = {
      isoWeekYear: isoWeekCoordinates(mountDate).year,
      weekday: mountDate.getDay(),
      ordinal: localCalendarDayOrdinal(mountDate),
      month: calendarMonthOrdinal(mountDate),
    };

    const updateHands = () => {
      const now = new Date();
      const nowMs = now.getTime();
      const secondsWithMs = now.getSeconds() + now.getMilliseconds() / 1000;
      const secondsDeg =
        Math.floor((nowMs % 60_000) / G.SECOND_HAND_TICK_MS) * G.SECOND_HAND_DEGREES_PER_TICK;
      const minuteDeg = (now.getMinutes() + secondsWithMs / 60) * 6;
      const hourDeg =
        ((now.getHours() % 12) + now.getMinutes() / 60 + secondsWithMs / 3600) * 30;
      const week = continuousIsoWeek(now, anchor.isoWeekYear, G.WEEK_COUNT);
      const weekDeg = G.WEEK_OFFSET_DEG + (week - 1) * G.WEEK_STEP_DEG;
      const dayIndex = anchor.weekday + localCalendarDayOrdinal(now) - anchor.ordinal;
      const dayDeg =
        G.DAY_SECTOR_OFFSET_DEG - G.DAY_SECTOR_STEP_DEG / 2 + dayIndex * G.DAY_SECTOR_STEP_DEG;
      const disk = dateDiskRef.current;
      const diskDate = new Date(now);
      diskDate.setDate(diskDate.getDate() + disk.dayOffset);
      const wheelDeg = continuousDateWheelAngle(
        diskDate,
        anchor.month,
        G.DATE_WHEEL_UNWRAPPED_ANGLES,
      );
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
      dateWheel.position.set(
        G.DATE_RING_OFFSET_X * DATE_WHEEL_OFFSET_SCALE + diskDeltaX,
        -G.DATE_RING_OFFSET_Y * DATE_WHEEL_OFFSET_SCALE + diskDeltaY,
        -dateWheelDepth,
      );
      dateWheel.scale.setScalar(disk.scale);
      dateWheelSqueezeOuter.rotation.z = squeezeAxis;
      dateWheelSqueezeOuter.scale.set(squeeze.scale, 1, 1);
      dateWheelSqueezeInner.rotation.z = -squeezeAxis;
      dateWheelRotation.rotation.z = -wheelDeg * DEG;
      squeezeAxisDirection.set(Math.cos(squeezeAxis), Math.sin(squeezeAxis), 0);
      dateWheelSqueezeAxis.setDirection(squeezeAxisDirection);

      // Exact affine UV transform keeps the baked aperture lighting fixed in
      // world space while the wheel-local corrected shape rotates as one
      // physical disk, then translates and uniformly scales.
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
      const qx = diskDeltaX / (2 * G.DATE_RING_DEFAULT_RADIUS);
      const qy = diskDeltaY / (2 * G.DATE_RING_DEFAULT_RADIUS);
      dateWheelLightMap.matrix.set(
        m11,
        m12,
        0.5 + qx - 0.5 * (m11 + m12),
        m21,
        m22,
        0.5 + qy - 0.5 * (m21 + m22),
        0,
        0,
        1,
      );
    };

    renderer.setAnimationLoop(() => {
      controls.update();
      updateHands();
      renderer.render(scene, camera);
    });

    setResetView(() => () => {
      controls.reset();
      // Clear residual drag momentum: TrackballControls' damping keeps
      // applying pending rotate/zoom/pan deltas after reset() and would
      // immediately throw the camera off again.
      const internals = controls as unknown as {
        _movePrev: THREE.Vector2;
        _moveCurr: THREE.Vector2;
        _zoomStart: THREE.Vector2;
        _zoomEnd: THREE.Vector2;
        _panStart: THREE.Vector2;
        _panEnd: THREE.Vector2;
      };
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
        second: secondsHand,
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
      updateWallLighting,
      updateWheelLight,
    };

    // Debug hook for automated QA: lets tooling frame the camera precisely.
    (window as unknown as Record<string, unknown>).__watch3d = { camera, controls };

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
        if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      dialMaterial.map?.dispose();
      dateWheelTexture.dispose();
      dateWheelNormalMap.dispose();
      dateWheelLightMap.dispose();
      clearTimeout(bakeTimer);
      environment.texture.dispose();
      pmrem.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const handles = sceneRef.current;
    if (!handles) return;
    for (const { key } of ELEMENT_OPTIONS) {
      handles.elements[key].visible = visibility[key];
    }
    handles.setDialOcclusion(visibility.dial);
  }, [visibility]);

  useEffect(() => {
    sceneRef.current?.updateDateStructure(dateStructure);
  }, [dateStructure]);

  useEffect(() => {
    const handles = sceneRef.current;
    if (!handles) return;
    // The shadow-map cluster spread scales with the emitter size so hand and
    // marker shadows on the dial soften in step with the recess bake.
    const clusterSpread = AREA_LIGHT_SPREAD_DEG * (light.size / EMITTER_HALF_ANGLE_DEG);
    positionKeyLights(
      handles.keyLights,
      light.azimuth,
      light.elevation,
      clusterSpread,
      light.distance,
    );
    positionLightSourceVisual(
      handles.lightSourcePanel,
      handles.lightSourceArrow,
      light.azimuth,
      light.elevation,
      light.size,
      light.distance,
    );
    for (const keyLight of handles.keyLights) {
      keyLight.intensity = light.intensity / handles.keyLights.length;
    }
  }, [light.azimuth, light.distance, light.elevation, light.intensity, light.size]);

  useEffect(() => {
    const handles = sceneRef.current;
    if (!handles) return;
    handles.updateWallLighting(light.ambient, light.intensity, light.elevation);
    handles.updateWheelLight(
      light.azimuth,
      light.elevation,
      light.intensity,
      light.ambient,
      light.size,
      dateStructure.dialThickness,
      dateStructure.dialThickness + dateStructure.dateWheelGap,
    );
    handles.scene.environmentIntensity = light.ambient;
    // Swing the whole studio around the dial normal so reflections and sheen
    // track the direction slider together with the shadow-casting key.
    handles.scene.environmentRotation.set(0, 0, (light.azimuth - STUDIO_AZIMUTH) * DEG);
  }, [
    dateStructure.dateWheelGap,
    dateStructure.dialThickness,
    light.ambient,
    light.azimuth,
    light.elevation,
    light.intensity,
    light.size,
  ]);

  useEffect(() => {
    const handles = sceneRef.current;
    if (!handles) return;
    handles.lightSource.visible = showLightSource;
  }, [showLightSource]);

  useEffect(() => {
    sceneRef.current?.updateDateWheelBand(dateWheelBand);
  }, [dateWheelBand]);

  useEffect(() => {
    sceneRef.current?.setDateWheelBandVisible(showDateWheelBand);
  }, [showDateWheelBand]);

  const lightSliders: {
    key: keyof LightSettings;
    label: string;
    min: number;
    max: number;
    step: number;
    valueText: string;
  }[] = [
    { key: "intensity", label: "Intensity", min: 0, max: 7, step: 0.05, valueText: `${Math.round((light.intensity / 3.5) * 100)}%` },
    { key: "ambient", label: "Ambient", min: 0, max: 2, step: 0.05, valueText: `${Math.round(light.ambient * 100)}%` },
    { key: "size", label: "Source size", min: 6, max: 40, step: 1, valueText: `${Math.round(light.size)}°` },
    {
      key: "distance",
      label: "Source distance",
      min: 2500,
      max: 9000,
      step: 100,
      valueText: `${(light.distance / (G.R_DIAL_EDGE * 2)).toFixed(1)}× dial`,
    },
  ];

  const trackballRadius = Math.cos(light.elevation * DEG);
  const trackballPosition = {
    // Match the straight-on 3D view: world +X is screen-right and world +Y
    // is screen-up (CSS +Y runs down). The dot therefore sits exactly where
    // the rendered source appears around the dial.
    u: Math.cos(light.azimuth * DEG) * trackballRadius,
    v: -Math.sin(light.azimuth * DEG) * trackballRadius,
  };
  const setLightFromTrackball = (u: number, v: number) => {
    const maxRadius = Math.cos(5 * DEG);
    const radius = Math.hypot(u, v);
    const scale = radius > maxRadius ? maxRadius / radius : 1;
    const nextU = u * scale;
    const nextV = v * scale;
    const nextRadius = Math.hypot(nextU, nextV);
    const azimuth = ((Math.atan2(-nextV, nextU) / DEG) + 360) % 360;
    const elevation = Math.asin(Math.sqrt(Math.max(0, 1 - nextRadius * nextRadius))) / DEG;
    setLight((current) => ({ ...current, azimuth, elevation }));
  };
  const updateLightFromPointer = (clientX: number, clientY: number) => {
    const bounds = lightTrackballRef.current?.getBoundingClientRect();
    if (!bounds) return;
    setLightFromTrackball(
      ((clientX - bounds.left) / bounds.width) * 2 - 1,
      ((clientY - bounds.top) / bounds.height) * 2 - 1,
    );
  };

  const frameLightSource = () => {
    const handles = sceneRef.current;
    if (!handles) return;
    handles.lightSource.visible = true;
    setShowLightSource(true);

    const sourcePosition = handles.lightSourcePanel.position.clone();
    const frameCenter = sourcePosition.multiplyScalar(0.5);
    const panelHalfDiagonal = (handles.lightSourcePanel.scale.x * Math.SQRT2) / 2;
    const radius =
      light.distance / 2 + Math.max(G.R_DIAL_EDGE + 120, panelHalfDiagonal);
    const viewDirection = handles.camera.position.clone().sub(handles.controls.target).normalize();
    const framingDistance = Math.min(
      28_000,
      Math.max(5_000, (radius / Math.sin((handles.camera.fov * DEG) / 2)) * 1.08),
    );

    handles.controls.target.copy(frameCenter);
    handles.camera.position.copy(frameCenter).addScaledVector(viewDirection, framingDistance);
    handles.camera.lookAt(frameCenter);
    handles.controls.update();
  };
  const pixelOffsetText = (value: number) =>
    `${value > 0 ? "+" : ""}${Math.abs(value) < 0.0001 ? "0.00" : value.toFixed(2)} px`;
  const selectedDiskDate = new Date();
  selectedDiskDate.setDate(selectedDiskDate.getDate() + dateDisk.dayOffset);
  const selectedDiskDateText = selectedDiskDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const dayOffsetText =
    dateDisk.dayOffset === 0
      ? `${selectedDiskDateText} · Today`
      : `${selectedDiskDateText} · ${dateDisk.dayOffset > 0 ? "+" : "−"}${Math.abs(dateDisk.dayOffset)}d`;

  return (
    <div ref={containerRef} className={`h-dvh w-full ${className}`}>
      <button
        type="button"
        aria-pressed={panelOpen}
        aria-label="Toggle 3D view settings"
        title="3D view settings"
        onClick={() => setPanelOpen((open) => !open)}
        className="absolute left-3 top-3 z-10 rounded-lg border-2 border-white/40 bg-white px-4 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-zinc-100 active:scale-95"
      >
        ⚙️
      </button>

      {panelOpen && (
        <div className="absolute left-3 top-16 z-10 w-56 rounded-xl border border-black/20 bg-white/90 p-3 text-black shadow-lg backdrop-blur">
          <div
            role="tablist"
            aria-label="3D settings groups"
            className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-black/10 p-1"
          >
            {(["elements", "light"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={settingsTab === tab}
                onClick={() => setSettingsTab(tab)}
                className={`rounded-md px-2 py-1 text-[11px] font-semibold capitalize transition ${
                  settingsTab === tab ? "bg-black text-white" : "text-black hover:bg-black/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {settingsTab === "elements" && (
          <div role="tabpanel">
          <div className="mb-1 text-[10px] font-bold">Elements</div>
          <div className="grid grid-cols-2 gap-1">
            {ELEMENT_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed={visibility[key]}
                onClick={() =>
                  setVisibility((current) => ({ ...current, [key]: !current[key] }))
                }
                className={toggleButtonClass(visibility[key])}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={HAND_KEYS.every((key) => visibility[key])}
              onClick={() =>
                setVisibility((current) => {
                  const show = !HAND_KEYS.every((key) => current[key]);
                  const next = { ...current };
                  for (const key of HAND_KEYS) next[key] = show;
                  return next;
                })
              }
              className={toggleButtonClass(HAND_KEYS.every((key) => visibility[key]))}
            >
              All hands
            </button>
          </div>
          <div className="mb-1 mt-3 border-t border-black/15 pt-2 text-[10px] font-bold">
            Structure
          </div>
          <label className="mt-1.5 block text-[10px] font-semibold">
            <span className="flex items-center justify-between gap-2">
              <span>Main dial thickness</span>
              <output className="tabular-nums">{dateStructure.dialThickness.toFixed(0)} px</output>
            </span>
            <input
              type="range"
              min={2}
              max={40}
              step={1}
              value={dateStructure.dialThickness}
              onChange={(event) =>
                setDateStructure((current) => ({
                  ...current,
                  dialThickness: Number(event.target.value),
                }))
              }
              className="mt-0.5 w-full cursor-pointer accent-black"
              aria-label="Main dial thickness"
            />
          </label>
          <label className="mt-1.5 block text-[10px] font-semibold">
            <span className="flex items-center justify-between gap-2">
              <span>Date wheel gap</span>
              <output className="tabular-nums">{dateStructure.dateWheelGap.toFixed(0)} px</output>
            </span>
            <input
              type="range"
              min={0}
              max={120}
              step={1}
              value={dateStructure.dateWheelGap}
              onChange={(event) =>
                setDateStructure((current) => ({
                  ...current,
                  dateWheelGap: Number(event.target.value),
                }))
              }
              className="mt-0.5 w-full cursor-pointer accent-black"
              aria-label="Distance between date wheel and dial"
            />
          </label>
          </div>
          )}
          {settingsTab === "light" && (
          <div role="tabpanel">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold">Light</span>
            <span className="flex gap-1">
              <button
                type="button"
                onClick={frameLightSource}
                className="rounded-md border border-black/25 bg-white px-2 py-1 text-[10px] font-semibold text-black transition hover:bg-zinc-100"
              >
                Frame
              </button>
              <button
                type="button"
                aria-pressed={showLightSource}
                onClick={() => setShowLightSource((visible) => !visible)}
                className={`rounded-md border px-2 py-1 text-[10px] font-semibold transition ${
                  showLightSource
                    ? "border-orange-600 bg-orange-500 text-white"
                    : "border-black/25 bg-white text-black hover:bg-zinc-100"
                }`}
              >
                {showLightSource ? "Hide" : "Show"}
              </button>
            </span>
          </div>
          <div
            ref={lightTrackballRef}
            role="slider"
            tabIndex={0}
            aria-label="Key light position"
            aria-valuemin={5}
            aria-valuemax={90}
            aria-valuenow={Math.round(light.elevation)}
            aria-valuetext={`${Math.round(light.azimuth)} degrees direction, ${Math.round(light.elevation)} degrees elevation`}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              updateLightFromPointer(event.clientX, event.clientY);
            }}
            onPointerMove={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                updateLightFromPointer(event.clientX, event.clientY);
              }
            }}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 0.02 : 0.06;
              const movement: Record<string, [number, number]> = {
                ArrowLeft: [-step, 0],
                ArrowRight: [step, 0],
                ArrowUp: [0, -step],
                ArrowDown: [0, step],
              };
              const delta = movement[event.key];
              if (!delta) return;
              event.preventDefault();
              setLightFromTrackball(
                trackballPosition.u + delta[0],
                trackballPosition.v + delta[1],
              );
            }}
            className="relative mx-auto mt-2 h-28 w-28 touch-none rounded-full border-2 border-black/40 bg-[radial-gradient(circle_at_center,#fff_0%,#e7e7e7_58%,#a8a8a8_100%)] shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-px bg-black/15" />
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-black/15" />
            <div
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-black shadow-md"
              style={{
                left: `${(trackballPosition.u + 1) * 50}%`,
                top: `${(trackballPosition.v + 1) * 50}%`,
              }}
            />
          </div>
          <div className="mt-1 text-center text-[10px] tabular-nums text-black">
            Direction {Math.round(light.azimuth)}° · Elevation {Math.round(light.elevation)}°
          </div>
          {lightSliders.map((slider) => (
            <label key={slider.key} className="mt-1.5 block text-[10px] font-semibold">
              <span className="flex items-center justify-between gap-2">
                <span>{slider.label}</span>
                <output className="tabular-nums">{slider.valueText}</output>
              </span>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={light[slider.key]}
                onChange={(event) =>
                  setLight((current) => ({
                    ...current,
                    [slider.key]: Number(event.target.value),
                  }))
                }
                className="mt-0.5 w-full cursor-pointer accent-black"
                aria-label={`Light ${slider.label.toLowerCase()}`}
              />
            </label>
          ))}
          </div>
          )}
        </div>
      )}

      {SHOW_DATE_CALIBRATION_CONTROLS && (
      <div className="absolute right-3 top-16 z-10 w-56 rounded-xl border border-black/20 bg-white/90 p-3 text-black shadow-lg backdrop-blur">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold">Date disk</span>
          <button
            type="button"
            onClick={() => {
              setDateDisk({ ...DEFAULT_DATE_DISK });
              setDateStructure({ ...DEFAULT_DATE_STRUCTURE });
              setDateWheelBand({ ...DEFAULT_DATE_WHEEL_BAND });
              setDateWheelSqueeze({ ...DEFAULT_DATE_WHEEL_SQUEEZE });
            }}
            className="rounded-md border border-black/25 bg-white px-2 py-1 text-[10px] font-semibold transition hover:bg-zinc-100"
          >
            Reset
          </button>
        </div>
        {(["x", "y"] as const).map((axis) => (
          <label key={axis} className="mt-1.5 block text-[10px] font-semibold">
            <span className="flex items-center justify-between gap-2">
              <span>{axis.toUpperCase()} position</span>
              <output className="tabular-nums">{pixelOffsetText(dateDisk[axis])}</output>
            </span>
            <input
              type="range"
              min={-150}
              max={150}
              step={1}
              value={Math.round(dateDisk[axis] * 3)}
              onChange={(event) =>
                setDateDisk((current) => ({
                  ...current,
                  [axis]: Number(event.target.value) / 3,
                }))
              }
              className="mt-0.5 w-full cursor-pointer accent-black"
              aria-label={`Date disk ${axis.toUpperCase()} position`}
              aria-valuemin={-50}
              aria-valuemax={50}
              aria-valuenow={dateDisk[axis]}
              aria-valuetext={pixelOffsetText(dateDisk[axis])}
            />
          </label>
        ))}
        <label className="mt-1.5 block text-[10px] font-semibold">
          <span className="flex items-center justify-between gap-2">
            <span>Day</span>
            <output className="tabular-nums">{dayOffsetText}</output>
          </span>
          <input
            type="range"
            min={-45}
            max={45}
            step={1}
            value={dateDisk.dayOffset}
            onChange={(event) =>
              setDateDisk((current) => ({
                ...current,
                dayOffset: Math.round(Number(event.target.value)),
              }))
            }
            className="mt-0.5 w-full cursor-pointer accent-black"
            aria-label="Date disk day offset"
          />
        </label>
        <label className="mt-1.5 block text-[10px] font-semibold">
          <span className="flex items-center justify-between gap-2">
            <span>Scale</span>
            <output className="tabular-nums">{(dateDisk.scale * 100).toFixed(1)}%</output>
          </span>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.001}
            value={dateDisk.scale}
            onChange={(event) =>
              setDateDisk((current) => ({
                ...current,
                scale: Number(event.target.value),
              }))
            }
            className="mt-0.5 w-full cursor-pointer accent-black"
            aria-label="Date disk scale"
          />
        </label>
        <div className="mb-1 mt-3 flex items-center justify-between border-t border-black/15 pt-2">
          <span className="text-[10px] font-bold">Blue band</span>
          <button
            type="button"
            aria-pressed={showDateWheelBand}
            onClick={() => setShowDateWheelBand((visible) => !visible)}
            className={`rounded-md border px-2 py-1 text-[10px] font-semibold transition ${
              showDateWheelBand
                ? "border-blue-700 bg-blue-600 text-white"
                : "border-black/25 bg-white text-black hover:bg-zinc-100"
            }`}
          >
            {showDateWheelBand ? "Hide" : "Show"}
          </button>
        </div>
        {(["x", "y"] as const).map((axis) => (
          <label key={`band-${axis}`} className="mt-1.5 block text-[10px] font-semibold">
            <span className="flex items-center justify-between gap-2">
              <span>{axis.toUpperCase()} position</span>
              <output className="tabular-nums">
                {pixelOffsetText(dateWheelBand[axis])}
              </output>
            </span>
            <input
              type="range"
              min={-150}
              max={150}
              step={1}
              value={Math.round(dateWheelBand[axis] * 3)}
              onChange={(event) =>
                setDateWheelBand((current) => ({
                  ...current,
                  [axis]: Number(event.target.value) / 3,
                }))
              }
              className="mt-0.5 w-full cursor-pointer accent-blue-600"
              aria-label={`Blue band ${axis.toUpperCase()} position`}
            />
          </label>
        ))}
        <label className="mt-1.5 block text-[10px] font-semibold">
          <span className="flex items-center justify-between gap-2">
            <span>Radius</span>
            <output className="tabular-nums">
              {(dateWheelBand.radius * 100).toFixed(1)}%
            </output>
          </span>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.005}
            value={dateWheelBand.radius}
            onChange={(event) =>
              setDateWheelBand((current) => ({
                ...current,
                radius: Number(event.target.value),
              }))
            }
            className="mt-0.5 w-full cursor-pointer accent-blue-600"
            aria-label="Blue band radius"
          />
        </label>
        <label className="mt-1.5 block text-[10px] font-semibold">
          <span className="flex items-center justify-between gap-2">
            <span>Width</span>
            <output className="tabular-nums">
              {(dateWheelBand.width * 100).toFixed(1)}%
            </output>
          </span>
          <input
            type="range"
            min={0.01}
            max={0.5}
            step={0.005}
            value={dateWheelBand.width}
            onChange={(event) =>
              setDateWheelBand((current) => ({
                ...current,
                width: Number(event.target.value),
              }))
            }
            className="mt-0.5 w-full cursor-pointer accent-blue-600"
            aria-label="Blue band width"
          />
        </label>
        <div className="mb-1 mt-3 border-t border-black/15 pt-2 text-[10px] font-bold">
          Wheel squeeze
        </div>
        <label className="mt-1.5 block text-[10px] font-semibold">
          <span className="flex items-center justify-between gap-2">
            <span>Axis angle</span>
            <output className="tabular-nums">
              {Math.round(dateWheelSqueeze.axisAngle)}°
            </output>
          </span>
          <input
            type="range"
            min={0}
            max={180}
            step={1}
            value={dateWheelSqueeze.axisAngle}
            onChange={(event) =>
              setDateWheelSqueeze((current) => ({
                ...current,
                axisAngle: Number(event.target.value),
              }))
            }
            className="mt-0.5 w-full cursor-pointer accent-rose-500"
            aria-label="Date wheel squeeze axis"
          />
        </label>
        <label className="mt-1.5 block text-[10px] font-semibold">
          <span className="flex items-center justify-between gap-2">
            <span>Squeeze</span>
            <output className="tabular-nums">
              {(dateWheelSqueeze.scale * 100).toFixed(1)}%
            </output>
          </span>
          <input
            type="range"
            min={0.4}
            max={1.6}
            step={0.005}
            value={dateWheelSqueeze.scale}
            onChange={(event) =>
              setDateWheelSqueeze((current) => ({
                ...current,
                scale: Number(event.target.value),
              }))
            }
            className="mt-0.5 w-full cursor-pointer accent-rose-500"
            aria-label="Date wheel squeeze amount"
          />
        </label>
      </div>
      )}

      <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
        <div className="whitespace-nowrap rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-black/70 shadow backdrop-blur">
          Drag to rotate · Scroll to zoom · Right-drag to pan
        </div>
        <button
          type="button"
          onClick={() => resetView?.()}
          className="pointer-events-auto rounded-lg border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-semibold text-black shadow backdrop-blur transition hover:bg-white active:scale-95"
        >
          Reset view
        </button>
      </div>
    </div>
  );
}
