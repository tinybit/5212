import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

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
  dateWheel: -12,
  movementBackdrop: -18,
  dayHand: 6,
  weekHand: 13,
  hourHand: 20,
  minuteHand: 30,
  secondsHand: 52,
} as const;

/**
 * The 2D simulator calibrated the date-ring center offset in rendered CSS
 * pixels at the 720px layout width; convert to photo pixels for the scene.
 */
const DATE_WHEEL_OFFSET_SCALE = G.IMG_W / 720;

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

/** Aperture walls connecting the dial cutout down to the date wheel. */
function dateWindowWallGeometry() {
  const left = G.DATE_WINDOW_CLIP_LEFT - G.CX;
  const right = G.DATE_WINDOW_CLIP_RIGHT - G.CX;
  const top = G.CY - G.DATE_WINDOW_CLIP_TOP;
  const bottom = G.CY - G.DATE_WINDOW_CLIP_BOTTOM;
  const depth = STACK.dateWheel;

  return polygonGeometry([
    [
      [left, top, 0],
      [right, top, 0],
      [right, top, depth],
      [left, top, depth],
    ],
    [
      [right, top, 0],
      [right, bottom, 0],
      [right, bottom, depth],
      [right, top, depth],
    ],
    [
      [right, bottom, 0],
      [left, bottom, 0],
      [left, bottom, depth],
      [right, bottom, depth],
    ],
    [
      [left, bottom, 0],
      [left, top, 0],
      [left, top, depth],
      [left, bottom, depth],
    ],
  ]);
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

type ElementKey = "markers" | "dateWheel" | "week" | "day" | "hour" | "minute" | "second";

const ELEMENT_OPTIONS: { key: ElementKey; label: string }[] = [
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
};

const LIGHT_DISTANCE = 5100;

type SceneHandles = {
  elements: Record<ElementKey, THREE.Object3D>;
  keyLight: THREE.DirectionalLight;
  scene: THREE.Scene;
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
  const sceneRef = useRef<SceneHandles | null>(null);
  const [resetView, setResetView] = useState<(() => void) | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [visibility, setVisibility] = useState<Record<ElementKey, boolean>>({
    markers: true,
    dateWheel: true,
    week: true,
    day: true,
    hour: true,
    minute: true,
    second: true,
  });
  const [light, setLight] = useState<LightSettings>({
    azimuth: 130,
    elevation: 48,
    intensity: 1.4,
    ambient: 1,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1e9e0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environment.texture;

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(-2200, 2600, 3800);
    scene.add(keyLight);

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
    controls.maxDistance = 12_000;
    controls.target.set(0, 0, 0);

    const textureLoader = new THREE.TextureLoader();
    const loadTexture = (fileName: string) => {
      const texture = textureLoader.load(`${import.meta.env.BASE_URL}${fileName}`);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return texture;
    };
    const dateWheelTexture = loadTexture("date-ring-overlay.png");

    // Dial texture: the calibrated photo with the 2D drawing layer composited
    // in. Rendered UNLIT with tone mapping bypassed — the photo already has
    // its lighting baked in, and re-lighting + ACES washed it out.
    const dialMaterial = new THREE.MeshBasicMaterial({ alphaTest: 0.5, toneMapped: false });
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
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xb8b0a4,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });

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
    watch.add(dial);

    // Recessed date wheel, offset and rotated like the 2D overlay. Unlit for
    // the same photo-fidelity reason as the dial.
    const dateWheel = new THREE.Mesh(
      new THREE.CircleGeometry(G.DATE_RING_DEFAULT_RADIUS, 128),
      new THREE.MeshBasicMaterial({
        map: dateWheelTexture,
        alphaTest: 0.4,
        toneMapped: false,
      }),
    );
    dateWheel.position.set(
      G.DATE_RING_OFFSET_X * DATE_WHEEL_OFFSET_SCALE,
      -G.DATE_RING_OFFSET_Y * DATE_WHEEL_OFFSET_SCALE,
      STACK.dateWheel,
    );
    watch.add(dateWheel);

    watch.add(new THREE.Mesh(dateWindowWallGeometry(), wallMaterial));

    const movementBackdrop = new THREE.Mesh(
      new THREE.CircleGeometry(G.R_DIAL_EDGE + 10, 96),
      new THREE.MeshStandardMaterial({
        color: 0x161514,
        roughness: 0.85,
        side: THREE.DoubleSide,
      }),
    );
    movementBackdrop.position.z = STACK.movementBackdrop;
    watch.add(movementBackdrop);

    // Applied hour markers: single batons plus the double baton at 12.
    const markersGroup = new THREE.Group();
    watch.add(markersGroup);
    const sharedBaton = batonGeometry();
    const addBaton = (angleDeg: number, lateralOffset = 0) => {
      const baton = new THREE.Mesh(sharedBaton, polishedBlack);
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
    watch.add(rim);

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
      const wheelDeg = continuousDateWheelAngle(now, anchor.month, G.DATE_WHEEL_UNWRAPPED_ANGLES);

      secondsHand.rotation.z = -secondsDeg * DEG;
      minuteHand.rotation.z = -minuteDeg * DEG;
      hourHand.rotation.z = -hourDeg * DEG;
      weekHand.rotation.z = -weekDeg * DEG;
      dayHand.rotation.z = -dayDeg * DEG;
      dateWheel.rotation.z = -wheelDeg * DEG;
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
        markers: markersGroup,
        dateWheel,
        week: weekHand,
        day: dayHand,
        hour: hourHand,
        minute: minuteHand,
        second: secondsHand,
      },
      keyLight,
      scene,
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
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      dialMaterial.map?.dispose();
      dateWheelTexture.dispose();
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
  }, [visibility]);

  useEffect(() => {
    const handles = sceneRef.current;
    if (!handles) return;
    const azimuth = light.azimuth * DEG;
    const elevation = light.elevation * DEG;
    handles.keyLight.position.set(
      Math.cos(azimuth) * Math.cos(elevation) * LIGHT_DISTANCE,
      Math.sin(azimuth) * Math.cos(elevation) * LIGHT_DISTANCE,
      Math.sin(elevation) * LIGHT_DISTANCE,
    );
    handles.keyLight.intensity = light.intensity;
    handles.scene.environmentIntensity = light.ambient;
  }, [light]);

  const lightSliders: {
    key: keyof LightSettings;
    label: string;
    min: number;
    max: number;
    step: number;
    valueText: string;
  }[] = [
    { key: "azimuth", label: "Direction", min: 0, max: 360, step: 1, valueText: `${Math.round(light.azimuth)}°` },
    { key: "elevation", label: "Elevation", min: 5, max: 85, step: 1, valueText: `${Math.round(light.elevation)}°` },
    { key: "intensity", label: "Intensity", min: 0, max: 3, step: 0.05, valueText: `${Math.round((light.intensity / 1.4) * 100)}%` },
    { key: "ambient", label: "Ambient", min: 0, max: 2, step: 0.05, valueText: `${Math.round(light.ambient * 100)}%` },
  ];

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
          <div className="mb-1 mt-3 border-t border-black/15 pt-2 text-[10px] font-bold">Light</div>
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
