#!/usr/bin/env node
// Render the 5212 dial without hands from the offline web build (the macOS
// screensaver page) and write everything the Garmin project derives from the
// device list in manifest.xml:
//   resources-round-<W>x<H>/drawables/dial.png     dial at that screen size (one folder per size)
//   resources-round-<W>x<H>/drawables/date-NN.png  the date window for day NN (1-31)
//   resources-round-<W>x<H>/drawables/dial.xml     resource entries for the above
//   resources-hands-<W>/drawables/hand-*.png       hour, minute and seconds hands, rotated on the watch (the fēnix
//                                                  9 Pro models); resources-hands-none holds a placeholder for
//                                                  every other watch, which draws polygon hands
//   resources-icon-<N>/drawables/                  launcher icon at each icon size the devices use
//   monkey.jungle                                  per-device icon folder assignments
//   source/Generated.mc                            resource table for the date bitmaps
//   README.md                                      the "Supported watches" table (between markers)
// Screen size, icon size, display type and names come from the Connect IQ SDK's
// device files, so adding a watch is one line in manifest.xml plus a re-export.
// The Connect IQ build picks resources-round-<W>x<H> for every device of that
// screen family by itself (see bin/default.jungle in the SDK).
//
// Usage: node tools/export-assets.mjs <repo-root> <garmin-dir> <preview-dir>
// <repo-root> must contain a built dist-screensaver/ and node_modules/.
// CIQ_DEVICES_DIR overrides the SDK device folder (default: the SDK Manager's macOS path).
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [repoDir, garminDir, previewDir] = process.argv.slice(2);
if (!repoDir || !garminDir || !previewDir) {
  console.error("usage: export-assets.mjs <repo-root> <garmin-dir> <preview-dir>");
  process.exit(2);
}
const { chromium } = createRequire(path.join(repoDir, "package.json"))("playwright");

const devicesDir =
  process.env.CIQ_DEVICES_DIR ||
  path.join(os.homedir(), "Library/Application Support/Garmin/ConnectIQ/Devices");

// Geometry from src/components/WeeklyCalendarWatch.tsx (photo pixels).
const IMG_W = 2911;
const CX = 1381;
const CY = 1331;
const R_DIAL_EDGE = 1030;
const DATE_WINDOW_CLIP = { left: 2017, top: 1264, right: 2181, bottom: 1394 };

// ---------------------------------------------------------------------------
// Devices: read manifest.xml, then each device's compiler.json from the SDK.

const manifest = fs.readFileSync(path.join(garminDir, "manifest.xml"), "utf8");
const deviceIds = [...manifest.matchAll(/<iq:product id="([^"]+)"/g)].map((m) => m[1]);
if (deviceIds.length === 0) throw new Error("manifest.xml lists no <iq:product> entries");

const devices = deviceIds.map((id) => {
  const file = path.join(devicesDir, id, "compiler.json");
  if (!fs.existsSync(file)) {
    throw new Error(`device "${id}" is not in ${devicesDir}; install it with the SDK Manager`);
  }
  const d = JSON.parse(fs.readFileSync(file, "utf8"));
  const { width, height } = d.resolution;
  if (!d.deviceFamily.startsWith("round-") || width !== height) {
    throw new Error(
      `${id}: screen family ${d.deviceFamily} is not round; the dial needs a round screen`,
    );
  }
  if (d.bitsPerPixel < 8) {
    // The Forerunner 55 class: 8 colours, no greys. The dial is unreadable there.
    throw new Error(
      `${id}: ${d.bitsPerPixel}-bit screen with ${d.palette?.colors?.length ?? "few"} colours; the dial needs at least 64`,
    );
  }
  const memory = Object.fromEntries(d.appTypes.map((a) => [a.type, a.memoryLimit]));
  if (!memory.watchFace) throw new Error(`${id} does not run watch faces`);
  return {
    id,
    name: d.displayName.replace(/[®™]/g, ""),
    family: d.deviceFamily,
    size: width,
    display: d.displayType,
    icon: d.launcherIcon.width,
    memory: memory.watchFace,
    pngResources: Array.isArray(d.imageFormats) && d.imageFormats.includes("png"),
  };
});

const sizes = [...new Set(devices.map((d) => d.size))].sort((a, b) => a - b);
const iconSizes = [...new Set(devices.map((d) => d.icon))].sort((a, b) => a - b);
// Rotated hand bitmaps: only the watches this was built and tested on, the fēnix 9 Pro
// models. They also need an AMOLED screen (the beat runs there) and a resource compiler
// that keeps PNG resources as PNG, so the hands keep their 8-bit alpha; the default packing
// reduces alpha to on/off and leaves jagged edges after rotation (the Forerunner 165/70 and
// Instinct 3 AMOLED have no PNG packing). Every other watch gets the placeholder folder and
// draws polygon hands, as before.
const IMAGE_HAND_DEVICES = new Set(["fenix9pro43mm", "fenix9pro47mm", "fenix9pro51mm"]);
const HANDS_NONE = "resources-hands-none";
for (const d of devices) {
  d.imageHands = IMAGE_HAND_DEVICES.has(d.id) && d.display !== "mip" && d.pngResources;
  d.handsDir = d.imageHands ? `resources-hands-${d.size}` : HANDS_NONE;
}
for (const id of IMAGE_HAND_DEVICES) {
  if (!devices.some((d) => d.id === id && d.imageHands)) {
    throw new Error(`${id} should get image hands but does not qualify or is not in the manifest`);
  }
}
const handSizes = [...new Set(devices.filter((d) => d.imageHands).map((d) => d.size))].sort(
  (a, b) => a - b,
);
// Always-on dial brightness (AMOLED): the inverted dial's white level, 153/255 = 60%.
// Garmin blanks an always-on face that uses more than 10% of the screen's luminance;
// the simulator's burn-in test measures the whole always-on frame at about 9.8%.
const AOD_WHITE = 153;

const targets = sizes.map((size) => ({
  size,
  family: `round-${size}x${size}`,
  // MIP screens get a 4-grey dial (00/55/AA/FF). The dial has no colour of its own,
  // and pre-quantising keeps blended edge pixels from landing on tinted palette entries.
  grey4: devices.some((d) => d.size === size && d.display === "mip"),
  // AMOLED screens also get the always-on dial: the same dial inverted to grey on black.
  aod: !devices.some((d) => d.size === size && d.display === "mip"),
  drawablesDir: path.join(garminDir, `resources-round-${size}x${size}`, "drawables"),
  previewDir: path.join(previewDir, `round-${size}x${size}`),
  crop: dateCrop(size),
}));

// Same integer formula as Face5212View.onLayout(): floor((p - edge) * size / 2060).
function dateCrop(size) {
  const span = 2 * R_DIAL_EDGE;
  const x = Math.floor(((DATE_WINDOW_CLIP.left - (CX - R_DIAL_EDGE)) * size) / span);
  const y = Math.floor(((DATE_WINDOW_CLIP.top - (CY - R_DIAL_EDGE)) * size) / span);
  const right = Math.ceil(((DATE_WINDOW_CLIP.right - (CX - R_DIAL_EDGE)) * size) / span);
  const bottom = Math.ceil(((DATE_WINDOW_CLIP.bottom - (CY - R_DIAL_EDGE)) * size) / span);
  return { x, y, w: right - x, h: bottom - y };
}

// ---------------------------------------------------------------------------
// Hand bitmaps (AMOLED sizes). fillPolygon on the watch rounds every vertex to a
// whole pixel, so polygon hands jump a pixel at a time and a thin blade changes
// thickness as it turns. These hands are drawn here once, pointing at 12 with the
// lit facet on the +lateral (right) side, and the watch rotates the bitmap about
// the pin with drawBitmap2 and bilinear filtering (Hands.drawBitmapHand).
// Geometry in photo pixels: the same constants as source/Hands.mc.

const HAND = {
  hour: { tip: 510, rear: -125, base: -15, halfWidth: 72, tipHalfWidth: 3 },
  minute: { tip: 786, rear: -105, base: -25, halfWidth: 60 },
  seconds: {
    tip: 795,
    neck: 44,
    tipHalfWidth: 3.84912,
    neckHalfWidth: 6.29856,
    shoulder: -27,
    tailEnd: -287,
    tailPoint: -312,
    shoulderHalfWidth: 13.5,
    tailEndHalfWidth: 27,
  },
};
// The web app's flat hand colours, as Hands.setup() uses them on full-colour screens.
const HAND_COLOURS = { facetLit: "#8F908C", facetDark: "#20211F", seconds: "#1A1A19" };
// Hands are drawn at this multiple of the bitmap scale and box-filtered down.
const HAND_SUPERSAMPLE = 4;
// The hand bitmaps hold this many pixels per screen pixel; the watch shrinks them by the
// same factor while rotating. Measured on the fēnix 9 Pro 51 mm simulator: a 1:1 bitmap
// comes out softer than the polygon hands (edge 2.1 px against 1.7), a 2x bitmap at least
// as sharp (1.5 px). 4x would make the filter skip pixels.
const HAND_SCALE = 2;

// Bitmap size, pivot (the pin, at a whole-pixel corner) and polygons for the three
// hands at one screen size. Thin parts keep a half-width of at least 0.75 screen px,
// like Hands.halfWidth().
function handSpecs(size) {
  const s = size / (2 * R_DIAL_EDGE);
  const hw = (w) => Math.max(w, 0.75 / s);
  const sb = s * HAND_SCALE; // photo px -> bitmap px
  const margin = 2 * HAND_SCALE;
  const make = (name, tip, rear, maxHalfWidth, polys) => {
    const width = 2 * Math.ceil(maxHalfWidth * sb + margin);
    const px = width / 2;
    const py = margin + Math.ceil(tip * sb);
    const height = py + Math.ceil(-rear * sb) + margin;
    const map = ([along, lateral]) => [px + lateral * sb, py - along * sb];
    return {
      name,
      width,
      height,
      px,
      py,
      polys: polys.map((p) => ({ color: p.color, points: p.points.map(map) })),
    };
  };
  const h = HAND.hour;
  const m = HAND.minute;
  const q = HAND.seconds;
  return [
    // Dark silhouette first, lit facet on top: same stacking as Hands.drawHourFaceted().
    make("hour", h.tip, h.rear, h.halfWidth, [
      {
        color: HAND_COLOURS.facetDark,
        points: [
          [h.rear, 0],
          [h.base, h.halfWidth],
          [h.tip, h.tipHalfWidth],
          [h.tip, -h.tipHalfWidth],
          [h.base, -h.halfWidth],
        ],
      },
      {
        color: HAND_COLOURS.facetLit,
        points: [
          [h.rear, 0],
          [h.base, h.halfWidth],
          [h.tip, h.tipHalfWidth],
          [h.tip, 0],
        ],
      },
    ]),
    make("minute", m.tip, m.rear, m.halfWidth, [
      {
        color: HAND_COLOURS.facetDark,
        points: [
          [m.rear, 0],
          [m.base, m.halfWidth],
          [m.tip, 0],
          [m.base, -m.halfWidth],
        ],
      },
      {
        color: HAND_COLOURS.facetLit,
        points: [
          [m.rear, 0],
          [m.tip, 0],
          [m.base, m.halfWidth],
        ],
      },
    ]),
    make("seconds", q.tip, q.tailPoint, Math.max(q.tailEndHalfWidth, hw(q.neckHalfWidth)), [
      {
        color: HAND_COLOURS.seconds,
        points: [
          [q.tip, -hw(q.tipHalfWidth)],
          [q.tip, hw(q.tipHalfWidth)],
          [q.neck, hw(q.neckHalfWidth)],
          [q.neck, -hw(q.neckHalfWidth)],
        ],
      },
      {
        color: HAND_COLOURS.seconds,
        points: [
          [q.shoulder, -q.shoulderHalfWidth],
          [q.shoulder, q.shoulderHalfWidth],
          [q.tailEnd, q.tailEndHalfWidth],
          [q.tailPoint, 0],
          [q.tailEnd, -q.tailEndHalfWidth],
        ],
      },
    ]),
  ];
}

// ---------------------------------------------------------------------------
// Rendering.

const HIDE_HANDS_CSS = `
  [data-day-indicator-hand], [data-week-indicator-hand], [data-hour-hand],
  [data-minute-hand], [data-seconds-hand] { display: none !important; }
`;

const pageUrl = pathToFileURL(path.join(repoDir, "dist-screensaver", "index.html")).href;
const browser = await chromium.launch({ channel: "chrome", headless: true });

// Render the dial for one calendar day; returns a hi-res PNG of the dial disc.
async function renderDial(day) {
  const context = await browser.newContext({
    viewport: { width: 1200, height: 1200 },
    deviceScaleFactor: 3,
  });
  const page = await context.newPage();
  // January 2026 has 31 days, so every date-wheel position is reachable.
  await page.clock.setFixedTime(new Date(2026, 0, day, 10, 10, 0));
  await page.goto(pageUrl, { waitUntil: "load" });
  await page.addStyleTag({ content: HIDE_HANDS_CSS });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
  );
  await page.waitForTimeout(800); // let the 180-200 ms CSS transitions settle
  const box = await page.locator('img[alt$="weekly calendar dial"]').boundingBox();
  if (!box) throw new Error("dial image not found");
  const s = box.width / IMG_W;
  const clip = {
    x: box.x + (CX - R_DIAL_EDGE) * s,
    y: box.y + (CY - R_DIAL_EDGE) * s,
    width: 2 * R_DIAL_EDGE * s,
    height: 2 * R_DIAL_EDGE * s,
  };
  const png = await page.screenshot({ clip, type: "png" });
  await context.close();
  return png;
}

// Canvas work page: downscale, optionally reduce to 4 greys, crop the date window,
// and (aodWhite > 0) build the inverted always-on dial and its date crop.
const work = await browser.newPage();
async function processDial(png, size, crop, grey4, aodWhite) {
  return work.evaluate(
    async ({ dataUrl, size, crop, grey4, aodWhite }) => {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      let src = document.createElement("canvas");
      src.width = img.width;
      src.height = img.height;
      src.getContext("2d").drawImage(img, 0, 0);
      // Halve repeatedly, then do the last step, for a clean high-quality reduction.
      while (src.width / 2 >= size) {
        const half = document.createElement("canvas");
        half.width = Math.round(src.width / 2);
        half.height = Math.round(src.height / 2);
        const ctx = half.getContext("2d");
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(src, 0, 0, half.width, half.height);
        src = half;
      }
      const out = document.createElement("canvas");
      out.width = size;
      out.height = size;
      const octx = out.getContext("2d");
      octx.imageSmoothingQuality = "high";
      octx.drawImage(src, 0, 0, size, size);

      if (grey4) {
        // Luminance, then the nearest of the MIP palette's four greys.
        const im = octx.getImageData(0, 0, size, size);
        const d = im.data;
        for (let i = 0; i < d.length; i += 4) {
          const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
          const q = Math.min(3, Math.max(0, Math.round(lum / 85))) * 85;
          d[i] = d[i + 1] = d[i + 2] = q;
          d[i + 3] = 255;
        }
        octx.putImageData(im, 0, 0);
      }

      const cropOf = (canvas) => {
        const c = document.createElement("canvas");
        c.width = crop.w;
        c.height = crop.h;
        c.getContext("2d").drawImage(canvas, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
        return c.toDataURL("image/png");
      };
      const result = { full: out.toDataURL("image/png"), date: cropOf(out) };

      if (aodWhite > 0) {
        // Inverted dial: cream background -> black, black print -> aodWhite grey.
        // The background level is the 90th-percentile luminance, so cream maps to
        // exactly black and adds no luminance.
        const im = octx.getImageData(0, 0, size, size);
        const d = im.data;
        const n = size * size;
        const lum = new Float32Array(n);
        for (let i = 0; i < n; i++) {
          lum[i] = 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2];
        }
        const bg = Float32Array.from(lum).sort()[Math.floor(n * 0.9)];
        const aod = document.createElement("canvas");
        aod.width = size;
        aod.height = size;
        const actx = aod.getContext("2d");
        const aim = actx.createImageData(size, size);
        for (let i = 0; i < n; i++) {
          const v = Math.max(0, (bg - lum[i]) / bg) * aodWhite;
          const q = Math.round(v);
          aim.data[i * 4] = aim.data[i * 4 + 1] = aim.data[i * 4 + 2] = q;
          aim.data[i * 4 + 3] = 255;
        }
        actx.putImageData(aim, 0, 0);
        result.aodFull = aod.toDataURL("image/png");
        result.aodDate = cropOf(aod);
      }
      return result;
    },
    {
      dataUrl: `data:image/png;base64,${png.toString("base64")}`,
      size,
      crop,
      grey4,
      aodWhite,
    },
  );
}

// A 1x1 black PNG: the always-on resource ids must exist on MIP devices too, where they are never drawn.
async function blackPixel() {
  return work.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1, 1);
    return c.toDataURL("image/png");
  });
}

// One hand bitmap: the polygons filled on a transparent canvas at HAND_SUPERSAMPLE
// times the screen scale, then halved down to the screen scale.
async function renderHand(spec) {
  return work.evaluate(
    ({ spec, factor }) => {
      let c = document.createElement("canvas");
      c.width = spec.width * factor;
      c.height = spec.height * factor;
      const ctx = c.getContext("2d");
      for (const poly of spec.polys) {
        ctx.fillStyle = poly.color;
        ctx.beginPath();
        poly.points.forEach(([x, y], i) =>
          i === 0 ? ctx.moveTo(x * factor, y * factor) : ctx.lineTo(x * factor, y * factor),
        );
        ctx.closePath();
        ctx.fill();
      }
      while (c.width > spec.width) {
        const half = document.createElement("canvas");
        half.width = c.width / 2;
        half.height = c.height / 2;
        const hctx = half.getContext("2d");
        hctx.imageSmoothingQuality = "high";
        hctx.drawImage(c, 0, 0, half.width, half.height);
        c = half;
      }
      return c.toDataURL("image/png");
    },
    { spec, factor: HAND_SUPERSAMPLE },
  );
}

const writeDataUrl = (file, dataUrl) =>
  fs.writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));

// MIP dials are already reduced to the palette's greys, so the resource compiler must not dither them.
const DITHERING = "none";
const dateIds = Array.from({ length: 31 }, (_, i) => `Date${i + 1}`);
const dateAodIds = Array.from({ length: 31 }, (_, i) => `DateAod${i + 1}`);
const dateFile = (i) => `date-${String(i + 1).padStart(2, "0")}.png`;
const dateAodFile = (i) => `date-aod-${String(i + 1).padStart(2, "0")}.png`;
const AOD_PLACEHOLDER = "aod-placeholder.png";

for (const t of targets) {
  fs.rmSync(path.dirname(t.drawablesDir), { recursive: true, force: true });
  fs.mkdirSync(t.drawablesDir, { recursive: true });
  fs.mkdirSync(t.previewDir, { recursive: true });
}

const placeholder = await blackPixel();
for (let day = 1; day <= 31; day++) {
  const png = await renderDial(day);
  const first = day === 1;
  if (first) fs.writeFileSync(path.join(previewDir, "dial-hires.png"), png);
  for (const t of targets) {
    const res = await processDial(png, t.size, t.crop, t.grey4, t.aod ? AOD_WHITE : 0);
    if (first) {
      writeDataUrl(path.join(t.drawablesDir, "dial.png"), res.full);
      writeDataUrl(path.join(t.previewDir, "dial.png"), res.full);
      if (t.aod) {
        writeDataUrl(path.join(t.drawablesDir, "dial-aod.png"), res.aodFull);
        writeDataUrl(path.join(t.previewDir, "dial-aod.png"), res.aodFull);
      } else {
        writeDataUrl(path.join(t.drawablesDir, AOD_PLACEHOLDER), placeholder);
      }
    }
    writeDataUrl(path.join(t.drawablesDir, dateFile(day - 1)), res.date);
    if (t.aod) writeDataUrl(path.join(t.drawablesDir, dateAodFile(day - 1)), res.aodDate);
  }
  process.stdout.write(`day ${day} `);
}
process.stdout.write("\n");

// Hand bitmaps: one folder per screen size that has image-hand watches, plus the placeholder
// folder for every other watch. Pivots go into Generated.mc.
const handIds = { hour: "HandHour", minute: "HandMinute", seconds: "HandSeconds" };
const handFile = (name) => `hand-${name}.png`;
const HAND_PLACEHOLDER = "hand-placeholder.png";
const handsDir = (size) => path.join(garminDir, `resources-hands-${size}`, "drawables");
const noneDir = path.join(garminDir, HANDS_NONE, "drawables");
const handsBySize = new Map();
for (const size of handSizes) {
  fs.rmSync(path.dirname(handsDir(size)), { recursive: true, force: true });
  fs.mkdirSync(handsDir(size), { recursive: true });
  const specs = handSpecs(size);
  handsBySize.set(size, specs);
  const preview = targets.find((t) => t.size === size).previewDir;
  for (const spec of specs) {
    const png = await renderHand(spec);
    writeDataUrl(path.join(handsDir(size), handFile(spec.name)), png);
    writeDataUrl(path.join(preview, handFile(spec.name)), png);
  }
}
fs.rmSync(path.dirname(noneDir), { recursive: true, force: true });
fs.mkdirSync(noneDir, { recursive: true });
writeDataUrl(path.join(noneDir, HAND_PLACEHOLDER), placeholder);
await browser.close();

// ---------------------------------------------------------------------------
// Generated files.

const generatedHeader = (comment) =>
  `${comment} Generated by tools/export-assets.mjs. Do not edit.`;

for (const t of targets) {
  fs.writeFileSync(
    path.join(t.drawablesDir, "dial.xml"),
    [
      `<!-- ${generatedHeader("")}-->`.replace("<!--  ", "<!-- "),
      "<drawables>",
      `    <bitmap id="Dial" filename="dial.png" dithering="${DITHERING}" />`,
      ...dateIds.map(
        (id, i) => `    <bitmap id="${id}" filename="${dateFile(i)}" dithering="${DITHERING}" />`,
      ),
      // Always-on dial and date crops (AMOLED); a 1x1 placeholder elsewhere.
      `    <bitmap id="DialAod" filename="${t.aod ? "dial-aod.png" : AOD_PLACEHOLDER}" dithering="none" />`,
      ...dateAodIds.map(
        (id, i) =>
          `    <bitmap id="${id}" filename="${t.aod ? dateAodFile(i) : AOD_PLACEHOLDER}" dithering="none" />`,
      ),
      "</drawables>",
      "",
    ].join("\n"),
  );
}

// Hand bitmap entries. drawBitmap2 with a transform refuses palettised sources ("Source
// must not use a color palette"), and the resource compiler palettises a few-colour PNG
// unless told not to; "png" packing keeps the 8-bit alpha that smooth rotated edges need.
const handsXml = (lines) =>
  [
    `<!-- ${generatedHeader("")}-->`.replace("<!--  ", "<!-- "),
    "<drawables>",
    ...lines,
    "</drawables>",
    "",
  ].join("\n");
for (const size of handSizes) {
  fs.writeFileSync(
    path.join(handsDir(size), "hands.xml"),
    handsXml(
      Object.entries(handIds).map(
        ([name, id]) =>
          `    <bitmap id="${id}" filename="${handFile(name)}" dithering="none" packingFormat="png" automaticPalette="false" />`,
      ),
    ),
  );
}
fs.writeFileSync(
  path.join(noneDir, "hands.xml"),
  handsXml(
    Object.values(handIds).map(
      (id) => `    <bitmap id="${id}" filename="${HAND_PLACEHOLDER}" dithering="none" />`,
    ),
  ),
);

// Launcher icon per icon size: the base icon scaled to the device's icon box.
const baseIcon = fs.readFileSync(
  path.join(garminDir, "resources", "drawables", "launcher_icon.svg"),
  "utf8",
);
const written = new Set(targets.map((t) => path.basename(path.dirname(t.drawablesDir))));
for (const n of iconSizes) {
  const dirName = `resources-icon-${n}`;
  const dir = path.join(garminDir, dirName, "drawables");
  fs.rmSync(path.join(garminDir, dirName), { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "launcher_icon.svg"),
    baseIcon.replace(/width="\d+" height="\d+"/, `width="${n}" height="${n}"`),
  );
  fs.writeFileSync(
    path.join(dir, "launcher.xml"),
    [
      `<!-- ${generatedHeader("")}-->`.replace("<!--  ", "<!-- "),
      "<drawables>",
      '    <bitmap id="LauncherIcon" filename="launcher_icon.svg" dithering="none" />',
      "</drawables>",
      "",
    ].join("\n"),
  );
  written.add(dirName);
}
for (const size of handSizes) written.add(`resources-hands-${size}`);
written.add(HANDS_NONE);
// Drop folders from screen sizes, icon sizes or hand sizes that no device uses any more.
for (const entry of fs.readdirSync(garminDir)) {
  if (/^resources-(round-\d+x\d+|icon-\d+|hands-(\d+|none))$/.test(entry) && !written.has(entry)) {
    fs.rmSync(path.join(garminDir, entry), { recursive: true, force: true });
  }
}

fs.writeFileSync(
  path.join(garminDir, "monkey.jungle"),
  [
    generatedHeader("#"),
    "# The dial bitmaps live in resources-round-<W>x<H>/, which the SDK's default.jungle",
    "# already assigns to every device of that screen family. Each device gets its launcher",
    "# icon folder here, and its hand folder: rotated hand bitmaps for the fēnix 9 Pro models,",
    "# the placeholder (polygon hands) for every other watch.",
    "project.manifest = manifest.xml",
    "",
    ...devices.map(
      (d) =>
        `${d.id}.resourcePath = $(${d.id}.resourcePath);resources-icon-${d.icon};${d.handsDir}`,
    ),
    "",
  ].join("\n"),
);

fs.writeFileSync(
  path.join(garminDir, "source", "Generated.mc"),
  [
    generatedHeader("//"),
    "import Toybox.Lang;",
    "",
    "module Generated {",
    "    // Resource id of the date-window bitmap for day 1..31 (index 0..30).",
    "    function dateBitmapId(day as Number) as ResourceId {",
    "        var ids = [",
    ...dateIds.map((id) => `            Rez.Drawables.${id},`),
    "        ] as Array<ResourceId>;",
    "        return ids[day - 1];",
    "    }",
    "",
    "    // Same for the inverted always-on date window (AMOLED devices).",
    "    function dateAodBitmapId(day as Number) as ResourceId {",
    "        var ids = [",
    ...dateAodIds.map((id) => `            Rez.Drawables.${id},`),
    "        ] as Array<ResourceId>;",
    "        return ids[day - 1];",
    "    }",
    "",
    "    // Pin position inside the hand bitmaps for a screen width, as",
    "    // [hourX, hourY, minuteX, minuteY, secondsX, secondsY]; null for screen sizes",
    "    // without hand bitmaps. A watch that got the placeholder bitmaps instead draws",
    "    // polygon hands; the view tells by the placeholder's 1-pixel width.",
    "    function handPivots(width as Number) as Array<Number>? {",
    ...[...handsBySize.entries()].map(
      ([size, specs]) =>
        `        if (width == ${size}) { return [${specs.map((h) => `${h.px}, ${h.py}`).join(", ")}] as Array<Number>; }`,
    ),
    "        return null;",
    "    }",
    "",
    "    // Bitmap pixels per screen pixel in the hand bitmaps (the watch shrinks them by this).",
    "    function handBitmapScale() as Number {",
    `        return ${HAND_SCALE};`,
    "    }",
    "}",
    "",
  ].join("\n"),
);

// Supported-watches table in garmin/README.md, between the markers.
const readmeFile = path.join(garminDir, "README.md");
const readme = fs.readFileSync(readmeFile, "utf8");
const start = "<!-- devices:start -->";
const end = "<!-- devices:end -->";
if (!readme.includes(start) || !readme.includes(end)) {
  throw new Error(`README.md needs the markers ${start} and ${end}`);
}
const tableRows = devices
  .slice()
  .sort((a, b) => a.size - b.size || a.id.localeCompare(b.id))
  .map((d) => `| \`${d.id}\` | ${d.name} | ${d.size} × ${d.size} ${d.display.toUpperCase()} |`);
const table = [
  start,
  `${devices.length} watches on ${sizes.length} screen sizes. The release zip \`5212-Weekly-Calendar-<version>-garmin.zip\` holds one file per watch,`,
  "named `5212-Weekly-Calendar-<version>-garmin-<device id>.prg`.",
  "",
  "| Device id | Watch | Screen |",
  "| --- | --- | --- |",
  ...tableRows,
  end,
].join("\n");
fs.writeFileSync(
  readmeFile,
  readme.slice(0, readme.indexOf(start)) + table + readme.slice(readme.indexOf(end) + end.length),
);

console.log(
  JSON.stringify({
    devices: devices.length,
    sizes: targets.map((t) => ({
      size: t.size,
      dateCrop: t.crop,
      grey4: t.grey4,
      hands: handsBySize
        .get(t.size)
        ?.map((h) => `${h.name} ${h.width}x${h.height} pin ${h.px},${h.py}`),
    })),
    handScale: HAND_SCALE,
    imageHands: devices.filter((d) => d.imageHands).map((d) => d.id),
    iconSizes,
    dithering: DITHERING,
  }),
);
