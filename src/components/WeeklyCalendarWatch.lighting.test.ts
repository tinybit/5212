import { describe, expect, it } from "vitest";

import {
  dateWindowLightModel,
  faceNormal,
  lightShadowOffset,
  planeHeightAt,
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
      6180,
    );
    const backlit = shadeMetalFacet(
      { x: 0, y: 0, z: 1 },
      { x: 0, y: 0, z: 0 },
      { x: 1481, y: 1331, z: -10 },
      2,
      6180,
    );

    expect(backlit.fill).toBe(ambient.fill);
  });

  it("projects cast shadows away from the point light", () => {
    const center = { x: 1381, y: 1331 };
    expect(lightShadowOffset({ x: 1381, y: 1331, z: 100 }, 30, center)).toEqual({
      dx: 0,
      dy: 0,
    });
    const sideLight = lightShadowOffset({ x: 2381, y: 1331, z: 100 }, 30, center);
    expect(sideLight.dx).toBeLessThan(0);
    expect(sideLight.dy).toBeCloseTo(0);
  });
});
