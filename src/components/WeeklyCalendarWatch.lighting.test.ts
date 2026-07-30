import { describe, expect, it } from "vitest";

import {
  dateWindowLightModel,
  faceNormal,
  GLOSSY_RED_PAINT,
  planeHeightAt,
  POLISHED_BLACK_PVD,
  shadeGlossyPaintFacet,
  shadeMetalFacet,
  type DateWindowLightSettings,
  type Vec3,
} from "./watchLighting";

const SETTINGS: DateWindowLightSettings = {
  softness: 12.9,
  castDistance: 18.3,
  castStrength: 1.11,
  wallStrength: 1.21,
  bevelStrength: 0.63,
};

function pointPlaneDistance(a: Vec3, b: Vec3, c: Vec3, point: Vec3) {
  const normal = faceNormal(a, b, c);
  return Math.abs(
    normal.x * (point.x - a.x) +
      normal.y * (point.y - a.y) +
      normal.z * (point.z - a.z),
  );
}

describe("date-window light model", () => {
  it("is continuous and has zero offset at the hemisphere zenith", () => {
    const zenith = dateWindowLightModel({ u: 0, v: 0 }, 1.92, SETTINGS);
    const nearZenith = dateWindowLightModel({ u: 0.000001, v: 0 }, 1.92, SETTINGS);

    expect(zenith.castDistance).toBe(0);
    expect(nearZenith.castDistance).toBeLessThan(0.0001);
    expect(Math.abs(zenith.castOpacity - nearZenith.castOpacity)).toBeLessThan(0.000001);
  });

  it("removes directional cast shadow at zero point-light brightness", () => {
    const model = dateWindowLightModel({ u: -0.6664, v: -0.3543 }, 0, SETTINGS);
    expect(model.castOpacity).toBe(0);
  });
});

describe("hour-hand prism geometry", () => {
  it("keeps both tapered side facets planar", () => {
    const ridgeRear = { x: 0, y: 125, z: 30 };
    const positiveBase = { x: 72, y: 15, z: 0 };
    const positiveTip = { x: 3, y: -510, z: 0 };
    const ridgeTip = {
      x: 0,
      y: -510,
      z: planeHeightAt(ridgeRear, positiveTip, positiveBase, 0, -510),
    };
    const negativeBase = { x: -72, y: 15, z: 0 };
    const negativeTip = { x: -3, y: -510, z: 0 };

    expect(pointPlaneDistance(ridgeRear, positiveTip, positiveBase, ridgeTip)).toBeLessThan(
      0.000001,
    );
    expect(pointPlaneDistance(ridgeRear, negativeBase, negativeTip, ridgeTip)).toBeLessThan(
      0.000001,
    );
    expect(faceNormal(ridgeRear, positiveTip, positiveBase).z).toBeGreaterThan(0);
    expect(faceNormal(ridgeRear, negativeBase, negativeTip).z).toBeGreaterThan(0);
  });
});

describe("facet lighting", () => {
  it("does not add specular light to a back-facing surface", () => {
    const ambient = shadeMetalFacet(
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: 0 },
      { x: 1481, y: 1331, z: -10 },
      0,
    );
    const backlit = shadeMetalFacet(
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: 0 },
      { x: 1481, y: 1331, z: -10 },
      2,
    );

    expect(backlit.fill).toBe(ambient.fill);
  });

  it("treats the movable source as an area light without inverse-square falloff", () => {
    const near = shadeMetalFacet(
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: 0 },
      { x: 100, y: 0, z: 100 },
      1.92,
    );
    const far = shadeMetalFacet(
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: 0 },
      { x: 1000, y: 0, z: 1000 },
      1.92,
    );

    expect(far.fill).toBe(near.fill);
  });

  it("keeps polished black facets dark until their reflection aligns", () => {
    const normal = { x: 0.5, y: 0, z: Math.sqrt(0.75) };
    const zenith = shadeMetalFacet(
      normal,
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 1000 },
      1.92,
      POLISHED_BLACK_PVD,
    );
    const aligned = shadeMetalFacet(
      normal,
      { x: 0, y: 0, z: 0 },
      { x: Math.sqrt(0.75) * 1000, y: 0, z: 500 },
      1.92,
      POLISHED_BLACK_PVD,
    );
    const redChannel = (fill: string) => Number(fill.match(/\d+/)?.[0]);

    expect(redChannel(zenith.fill)).toBeLessThan(40);
    expect(redChannel(aligned.fill)).toBeGreaterThan(180);
  });

  it("keeps lit glossy paint red while adding a dielectric highlight", () => {
    const unlit = shadeGlossyPaintFacet(
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 1000 },
      0,
      GLOSSY_RED_PAINT,
    );
    const lit = shadeGlossyPaintFacet(
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 1000 },
      1.92,
      GLOSSY_RED_PAINT,
    );
    const channels = (fill: string) => [...fill.matchAll(/\d+/g)].map(Number);
    const [unlitRed] = channels(unlit.fill);
    const [litRed, litGreen] = channels(lit.fill);

    expect(litRed).toBeGreaterThan(unlitRed);
    expect(litRed).toBeGreaterThan(litGreen);
  });
});
