export type Vec3 = { x: number; y: number; z: number };
export type LightDiskPosition = { u: number; v: number };
export type DateWindowLightSettings = {
  softness: number;
  castDistance: number;
  castStrength: number;
  wallStrength: number;
  bevelStrength: number;
};

export function subtract3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function cross3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function dot3(a: Vec3, b: Vec3) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function normalize3(vector: Vec3): Vec3 {
  const length = Math.hypot(vector.x, vector.y, vector.z) || 1;
  return { x: vector.x / length, y: vector.y / length, z: vector.z / length };
}

export function faceNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  return normalize3(cross3(subtract3(b, a), subtract3(c, a)));
}

export function rotateVector(vector: Vec3, angle: number): Vec3 {
  const radians = (angle * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: vector.x * cos - vector.y * sin,
    y: vector.x * sin + vector.y * cos,
    z: vector.z,
  };
}

export function averagePoints(points: Vec3[]): Vec3 {
  const count = points.length;
  return points.reduce(
    (sum, point) => ({
      x: sum.x + point.x / count,
      y: sum.y + point.y / count,
      z: sum.z + point.z / count,
    }),
    { x: 0, y: 0, z: 0 },
  );
}

export function planeHeightAt(a: Vec3, b: Vec3, c: Vec3, x: number, y: number) {
  const normal = cross3(subtract3(b, a), subtract3(c, a));
  if (Math.abs(normal.z) < 1e-8) return a.z;
  return a.z - (normal.x * (x - a.x) + normal.y * (y - a.y)) / normal.z;
}

function srgbToLinear(channel: number) {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(channel: number) {
  const normalized =
    channel <= 0.0031308 ? channel * 12.92 : 1.055 * channel ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(1, Math.max(0, normalized)) * 255);
}

function toneMap(channel: number) {
  return 1 - Math.exp(-Math.max(0, channel) * 1.6);
}

export type PolishedMetalMaterial = {
  baseColor: readonly [number, number, number];
  environmentStrength: number;
  areaSpecularStrength: number;
  highlightExponent: number;
  strokeScale: number;
  facingReflectionStrength?: number;
};

export const BLACKENED_WHITE_GOLD: PolishedMetalMaterial = {
  baseColor: [10, 11, 10],
  environmentStrength: 0.7,
  areaSpecularStrength: 0.3,
  highlightExponent: 5,
  strokeScale: 0.45,
};

export const DEEP_BLACK_PVD: PolishedMetalMaterial = {
  baseColor: [3, 4, 3],
  environmentStrength: 0.5,
  areaSpecularStrength: 0.018,
  highlightExponent: 5,
  strokeScale: 0.45,
};

export const POLISHED_BLACK_PVD: PolishedMetalMaterial = {
  baseColor: [3, 4, 3],
  environmentStrength: 0.5,
  areaSpecularStrength: 0.35,
  highlightExponent: 64,
  strokeScale: 0.45,
  facingReflectionStrength: 0.3,
};

export type GlossyPaintMaterial = {
  baseColor: readonly [number, number, number];
  ambientStrength: number;
  diffuseStrength: number;
  specularStrength: number;
  highlightExponent: number;
};

export const GLOSSY_RED_PAINT: GlossyPaintMaterial = {
  baseColor: [155, 18, 30],
  ambientStrength: 0.55,
  diffuseStrength: 0.55,
  specularStrength: 0.18,
  highlightExponent: 26,
};

export function shadeMetalFacet(
  normal: Vec3,
  center: Vec3,
  lightPosition: Vec3,
  lightBrightness: number,
  material: PolishedMetalMaterial = BLACKENED_WHITE_GOLD,
) {
  const toLight = normalize3(subtract3(lightPosition, center));
  const lightVisibility = Math.max(0, dot3(normal, toLight));
  const halfVector = normalize3({ x: toLight.x, y: toLight.y, z: toLight.z + 1 });
  const areaHighlight =
    Math.pow(
      Math.max(0, dot3(normal, halfVector)),
      material.highlightExponent,
    ) *
    lightVisibility *
    material.areaSpecularStrength *
    Math.max(0, lightBrightness);
  const facingReflection =
    Math.pow(lightVisibility, 4) *
    Math.hypot(toLight.x, toLight.y) *
    (material.facingReflectionStrength ?? 0) *
    Math.max(0, lightBrightness);
  const channels = material.baseColor.map((channel) =>
    linearToSrgb(
      toneMap(
        srgbToLinear(channel) * material.environmentStrength +
          areaHighlight +
          facingReflection,
      ),
    ),
  );
  return {
    fill: `rgb(${channels[0]} ${channels[1]} ${channels[2]})`,
    stroke: `rgb(${Math.round(channels[0] * material.strokeScale)} ${Math.round(channels[1] * material.strokeScale)} ${Math.round(channels[2] * material.strokeScale)})`,
  };
}

export function shadeGlossyPaintFacet(
  normal: Vec3,
  center: Vec3,
  lightPosition: Vec3,
  lightBrightness: number,
  material: GlossyPaintMaterial = GLOSSY_RED_PAINT,
) {
  const toLight = normalize3(subtract3(lightPosition, center));
  const lightVisibility = Math.max(0, dot3(normal, toLight));
  const halfVector = normalize3({ x: toLight.x, y: toLight.y, z: toLight.z + 1 });
  const brightness = Math.max(0, lightBrightness);
  const pigmentLevel =
    material.ambientStrength + material.diffuseStrength * lightVisibility * brightness;
  const specular =
    Math.pow(Math.max(0, dot3(normal, halfVector)), material.highlightExponent) *
    material.specularStrength *
    brightness *
    lightVisibility;
  const channels = material.baseColor.map((channel) =>
    linearToSrgb(toneMap(srgbToLinear(channel) * pigmentLevel + specular)),
  );

  return {
    fill: `rgb(${channels[0]} ${channels[1]} ${channels[2]})`,
    stroke: `rgb(${Math.round(channels[0] * 0.46)} ${Math.round(channels[1] * 0.46)} ${Math.round(channels[2] * 0.46)})`,
  };
}

export function dateWindowLightModel(
  position: LightDiskPosition,
  brightness: number,
  settings: DateWindowLightSettings,
) {
  const horizontalLength = Math.hypot(position.u, position.v);
  const lightHeight = Math.sqrt(Math.max(0, 1 - horizontalLength ** 2));
  const lightX = horizontalLength > 1e-6 ? position.u / horizontalLength : 0;
  const lightY = horizontalLength > 1e-6 ? position.v / horizontalLength : 0;
  const pointLightStrength = Math.min(1, Math.max(0, brightness / 2));
  const shadowSlope = horizontalLength / Math.max(0.12, lightHeight);
  const castDistance = settings.castDistance * Math.min(2.5, shadowSlope);
  const castOpacity = Math.min(
    0.8,
    0.24 *
      settings.castStrength *
      pointLightStrength *
      (0.55 + Math.min(1, shadowSlope) * 0.45),
  );
  return {
    castDistance,
    castOpacity,
    lightHeight,
    lightX,
    lightY,
    pointLightStrength,
  };
}
