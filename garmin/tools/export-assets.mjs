#!/usr/bin/env node
// Render the 5212 dial without hands from the offline web build (the macOS
// screensaver page) and write the Garmin bitmaps for every target watch:
//   resources-<device>/drawables/dial.png      dial at the screen size, date window included
//   resources-<device>/drawables/date-NN.png   the date window crop for day NN (1-31)
//   resources-<device>/drawables/dial.xml      resource entries for the above
//   source/Generated.mc                        resource table for the date bitmaps
// The date-crop position is not written anywhere: Face5212View computes it with
// the same formula (dateCropOrigin below), so it stays right for every size.
// Previews (hi-res render, 64-colour quantised versions) go to <preview-dir>/<device>/.
//
// Usage: node tools/export-assets.mjs <5212-web-dir> <garmin-project-dir> <preview-dir>
// <5212-web-dir> (the repo root) must contain a built dist-screensaver/ and node_modules/.
// ../export.sh runs the build and this script.
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [webDir, projectDir, previewDir] = process.argv.slice(2);
if (!webDir || !projectDir || !previewDir) {
  console.error("usage: export-assets.mjs <5212-web-dir> <garmin-project-dir> <preview-dir>");
  process.exit(2);
}
const { chromium } = createRequire(path.join(webDir, "package.json"))("playwright");

// Target watches: device id (as in manifest.xml) and screen size in pixels.
const TARGETS = [
  { device: "fenix6pro", size: 260, palette64: true },
  { device: "fenix9pro47mm", size: 454, palette64: false },
];

// Geometry from src/components/WeeklyCalendarWatch.tsx (photo pixels).
const IMG_W = 2911;
const CX = 1381;
const CY = 1331;
const R_DIAL_EDGE = 1030;
const DATE_WINDOW_CLIP = { left: 2017, top: 1264, right: 2181, bottom: 1394 };

// Same integer formula as Face5212View.dateCropOrigin(): floor((p - edge) * size / 2060).
function dateCrop(size) {
  const span = 2 * R_DIAL_EDGE;
  const x = Math.floor(((DATE_WINDOW_CLIP.left - (CX - R_DIAL_EDGE)) * size) / span);
  const y = Math.floor(((DATE_WINDOW_CLIP.top - (CY - R_DIAL_EDGE)) * size) / span);
  const right = Math.ceil(((DATE_WINDOW_CLIP.right - (CX - R_DIAL_EDGE)) * size) / span);
  const bottom = Math.ceil(((DATE_WINDOW_CLIP.bottom - (CY - R_DIAL_EDGE)) * size) / span);
  return { x, y, w: right - x, h: bottom - y };
}

const HIDE_HANDS_CSS = `
  [data-day-indicator-hand], [data-week-indicator-hand], [data-hour-hand],
  [data-minute-hand], [data-seconds-hand] { display: none !important; }
`;

const pageUrl = pathToFileURL(path.join(webDir, "dist-screensaver", "index.html")).href;
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

// Canvas work page: downscale, crop, and (for previews) quantise to the 64-colour palette.
const work = await browser.newPage();
async function processDial(png, size, crop, wantPreviews) {
  return work.evaluate(
    async ({ dataUrl, size, crop, wantPreviews }) => {
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

      const dateCanvas = document.createElement("canvas");
      dateCanvas.width = crop.w;
      dateCanvas.height = crop.h;
      dateCanvas
        .getContext("2d")
        .drawImage(out, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);

      const result = { full: out.toDataURL("image/png"), date: dateCanvas.toDataURL("image/png") };
      if (!wantPreviews) return result;

      // The fenix 6 palette is the full 4x4x4 cube (00/55/AA/FF per channel),
      // so the nearest palette colour is the per-channel nearest level.
      const level = (v) => Math.min(3, Math.max(0, Math.round(v / 85))) * 85;
      const quantise = (dither) => {
        const c = document.createElement("canvas");
        c.width = size;
        c.height = size;
        const ctx = c.getContext("2d");
        ctx.drawImage(out, 0, 0);
        const im = ctx.getImageData(0, 0, size, size);
        const d = im.data;
        const buf = Float32Array.from(d);
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const i = (y * size + x) * 4;
            for (let ch = 0; ch < 3; ch++) {
              const old = buf[i + ch];
              const q = level(old);
              d[i + ch] = q;
              if (!dither) continue;
              const err = old - q;
              const spread = (dx, dy, w) => {
                const nx = x + dx;
                const ny = y + dy;
                if (nx < 0 || nx >= size || ny >= size) return;
                buf[(ny * size + nx) * 4 + ch] += err * w;
              };
              spread(1, 0, 7 / 16);
              spread(-1, 1, 3 / 16);
              spread(0, 1, 5 / 16);
              spread(1, 1, 1 / 16);
            }
            d[i + 3] = 255;
          }
        }
        ctx.putImageData(im, 0, 0);
        return c.toDataURL("image/png");
      };
      result.plain = quantise(false);
      result.dithered = quantise(true);
      return result;
    },
    {
      dataUrl: `data:image/png;base64,${png.toString("base64")}`,
      size,
      crop,
      wantPreviews,
    },
  );
}

const writeDataUrl = (file, dataUrl) =>
  fs.writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));

const DITHERING = process.env.DIAL_DITHERING || "none";
const dateIds = Array.from({ length: 31 }, (_, i) => `Date${i + 1}`);
const dateFile = (i) => `date-${String(i + 1).padStart(2, "0")}.png`;

for (const t of TARGETS) {
  t.drawablesDir = path.join(projectDir, `resources-${t.device}`, "drawables");
  t.previewDir = path.join(previewDir, t.device);
  t.crop = dateCrop(t.size);
  fs.mkdirSync(t.drawablesDir, { recursive: true });
  fs.mkdirSync(t.previewDir, { recursive: true });
}

for (let day = 1; day <= 31; day++) {
  const png = await renderDial(day);
  const first = day === 1;
  if (first) fs.writeFileSync(path.join(previewDir, "dial-hires.png"), png);
  for (const t of TARGETS) {
    const res = await processDial(png, t.size, t.crop, first);
    if (first) {
      writeDataUrl(path.join(t.drawablesDir, "dial.png"), res.full);
      writeDataUrl(path.join(t.previewDir, "dial.png"), res.full);
      if (t.palette64) {
        writeDataUrl(path.join(t.previewDir, "dial-64colors.png"), res.plain);
        writeDataUrl(path.join(t.previewDir, "dial-64colors-dithered.png"), res.dithered);
      }
    }
    writeDataUrl(path.join(t.drawablesDir, dateFile(day - 1)), res.date);
  }
  process.stdout.write(`day ${day} `);
}
process.stdout.write("\n");
await browser.close();

for (const t of TARGETS) {
  fs.writeFileSync(
    path.join(t.drawablesDir, "dial.xml"),
    [
      "<!-- Generated by tools/export-assets.mjs. Do not edit. -->",
      "<drawables>",
      `    <bitmap id="Dial" filename="dial.png" dithering="${DITHERING}" />`,
      ...dateIds.map(
        (id, i) => `    <bitmap id="${id}" filename="${dateFile(i)}" dithering="${DITHERING}" />`,
      ),
      "</drawables>",
      "",
    ].join("\n"),
  );
}

fs.writeFileSync(
  path.join(projectDir, "source", "Generated.mc"),
  [
    "// Generated by tools/export-assets.mjs. Do not edit.",
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
    "}",
    "",
  ].join("\n"),
);

console.log(
  JSON.stringify({
    targets: TARGETS.map((t) => ({ device: t.device, size: t.size, dateCrop: t.crop })),
    dithering: DITHERING,
  }),
);
