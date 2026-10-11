#!/usr/bin/env node
// Render the 5212 dial without hands from the offline web build (the macOS
// screensaver page) and write everything the Garmin project derives from the
// device list in manifest.xml:
//   resources-round-<W>x<H>/drawables/dial.png     dial at that screen size (one folder per size)
//   resources-round-<W>x<H>/drawables/date-NN.png  the date window for day NN (1-31)
//   resources-round-<W>x<H>/drawables/dial.xml     resource entries for the above
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
  };
});

const sizes = [...new Set(devices.map((d) => d.size))].sort((a, b) => a - b);
const iconSizes = [...new Set(devices.map((d) => d.icon))].sort((a, b) => a - b);
const targets = sizes.map((size) => ({
  size,
  family: `round-${size}x${size}`,
  // MIP screens get a 4-grey dial (00/55/AA/FF). The dial has no colour of its own,
  // and pre-quantising keeps blended edge pixels from landing on tinted palette entries.
  grey4: devices.some((d) => d.size === size && d.display === "mip"),
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

// Canvas work page: downscale, optionally reduce to 4 greys, and crop the date window.
const work = await browser.newPage();
async function processDial(png, size, crop, grey4) {
  return work.evaluate(
    async ({ dataUrl, size, crop, grey4 }) => {
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

      const dateCanvas = document.createElement("canvas");
      dateCanvas.width = crop.w;
      dateCanvas.height = crop.h;
      dateCanvas
        .getContext("2d")
        .drawImage(out, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);

      return { full: out.toDataURL("image/png"), date: dateCanvas.toDataURL("image/png") };
    },
    {
      dataUrl: `data:image/png;base64,${png.toString("base64")}`,
      size,
      crop,
      grey4,
    },
  );
}

const writeDataUrl = (file, dataUrl) =>
  fs.writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));

// MIP dials are already reduced to the palette's greys, so the resource compiler must not dither them.
const DITHERING = "none";
const dateIds = Array.from({ length: 31 }, (_, i) => `Date${i + 1}`);
const dateFile = (i) => `date-${String(i + 1).padStart(2, "0")}.png`;

for (const t of targets) {
  fs.rmSync(path.dirname(t.drawablesDir), { recursive: true, force: true });
  fs.mkdirSync(t.drawablesDir, { recursive: true });
  fs.mkdirSync(t.previewDir, { recursive: true });
}

for (let day = 1; day <= 31; day++) {
  const png = await renderDial(day);
  const first = day === 1;
  if (first) fs.writeFileSync(path.join(previewDir, "dial-hires.png"), png);
  for (const t of targets) {
    const res = await processDial(png, t.size, t.crop, t.grey4);
    if (first) {
      writeDataUrl(path.join(t.drawablesDir, "dial.png"), res.full);
      writeDataUrl(path.join(t.previewDir, "dial.png"), res.full);
    }
    writeDataUrl(path.join(t.drawablesDir, dateFile(day - 1)), res.date);
  }
  process.stdout.write(`day ${day} `);
}
process.stdout.write("\n");
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
      "</drawables>",
      "",
    ].join("\n"),
  );
}

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
// Drop folders from screen sizes or icon sizes that no device uses any more.
for (const entry of fs.readdirSync(garminDir)) {
  if (/^resources-(round-\d+x\d+|icon-\d+)$/.test(entry) && !written.has(entry)) {
    fs.rmSync(path.join(garminDir, entry), { recursive: true, force: true });
  }
}

fs.writeFileSync(
  path.join(garminDir, "monkey.jungle"),
  [
    generatedHeader("#"),
    "# The dial bitmaps live in resources-round-<W>x<H>/, which the SDK's default.jungle",
    "# already assigns to every device of that screen family. Only the launcher icon",
    "# size differs between devices, so each device gets its icon folder here.",
    "project.manifest = manifest.xml",
    "",
    ...devices.map(
      (d) => `${d.id}.resourcePath = $(${d.id}.resourcePath);resources-icon-${d.icon}`,
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
    sizes: targets.map((t) => ({ size: t.size, dateCrop: t.crop, grey4: t.grey4 })),
    iconSizes,
    dithering: DITHERING,
  }),
);
