#!/usr/bin/env python3
"""Generate height and normal maps for every printed main-dial stroke."""

from math import cos, pi, sin
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter

from dial_relief import rounded_stroke_height, tangent_normal_map


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "reference-handless-date-cutout.png"
HEIGHT = PUBLIC / "main-dial-height.png"
NORMAL = PUBLIC / "main-dial-normal.png"
MATERIAL = PUBLIC / "main-dial-material.png"
MATERIAL_MIRROR = PUBLIC / "main-dial-material-mirror.png"

IMG_W = 2911
IMG_H = 2683
CX = 1381
CY = 1331

R_DAY_IN = 442
R_DAY_OUT = 547
R_MINUTE = 787
MINUTE_OFFSET_DEG = 5.7
MINUTE_STEP_DEG = 6
MINUTE_DOT_RADIUS = 9
R_WEEK_IN = 826
R_WEEK_OUT = 928
R_WEEK_DOT = (R_WEEK_IN + R_WEEK_OUT) / 2
WEEK_DOT_RADIUS = 14.36848875
R_DIAL_EDGE = 1030
WEEK_COUNT = 53
WEEK_STEP_DEG = 360 / WEEK_COUNT
WEEK_OFFSET_DEG = 6.5
MONTH_SECTOR_OFFSET_DEG = 29.75
DAY_SECTOR_OFFSET_DEG = 25.2
DAY_SECTOR_STEP_DEG = 360 / 7
DIAL_STROKE_WIDTH = 9
DATE_WINDOW = (2017, 1264, 2181, 1394)
DATE_WINDOW_CORNER_RADIUS = 14
MINUTE_SKIP = {4, 9, 13, 14, 15, 19, 24, 29, 34, 39, 44, 49, 54, 59}
OUTPUT_SCALE = 2
RAIL_RELIEF_HEIGHT = 5.6
DOT_RELIEF_HEIGHT = 7.5


def point(degrees: float, radius: float) -> tuple[float, float]:
    radians = degrees * pi / 180
    return CX + sin(radians) * radius, CY - cos(radians) * radius


def calibrated_linework_height(
    scale: int = 1,
    *,
    include_rails: bool = True,
    include_dots: bool = True,
) -> np.ndarray:
    """Mirror drawDialLinework() as continuous geometric height fields.

    Raster strokes followed by a distance transform quantize a 9px line into
    only a few constant-slope terraces. Computing distance from the ideal
    circle/segment instead keeps curves and diagonals subpixel-smooth.
    """
    width = IMG_W * scale
    height_px = IMG_H * scale
    center_x = CX * scale
    center_y = CY * scale
    height = np.zeros((height_px, width), dtype=np.float32)
    half_width = DIAL_STROKE_WIDTH * scale / 2

    def profile(depth: np.ndarray) -> np.ndarray:
        # True circular cap. For a straight stroke whose physical height
        # equals its half-width, this yields a semicylinder: tangent-space
        # normals rotate linearly across the stroke instead of settling into
        # the two broad constant-slope bands produced by sine/cosine domes.
        clamped = np.clip(depth, 0.0, 1.0)
        return np.sqrt(clamped * (2.0 - clamped))

    def merge_circle(radius: float) -> None:
        radius *= scale
        extent = int(np.ceil(radius + half_width + 2))
        left = max(0, center_x - extent)
        right = min(width, center_x + extent + 1)
        top = max(0, center_y - extent)
        bottom = min(height_px, center_y + extent + 1)
        yy, xx = np.ogrid[top:bottom, left:right]
        distance = np.abs(np.hypot(xx + 0.5 - center_x, yy + 0.5 - center_y) - radius)
        stroke_height = profile(1.0 - distance / half_width)
        stroke_height[distance > half_width] = 0
        region = height[top:bottom, left:right]
        np.maximum(region, stroke_height, out=region)

    def merge_segment(start: tuple[float, float], end: tuple[float, float]) -> None:
        x0, y0 = (coordinate * scale for coordinate in start)
        x1, y1 = (coordinate * scale for coordinate in end)
        margin = half_width + 2
        left = max(0, int(np.floor(min(x0, x1) - margin)))
        right = min(width, int(np.ceil(max(x0, x1) + margin)) + 1)
        top = max(0, int(np.floor(min(y0, y1) - margin)))
        bottom = min(height_px, int(np.ceil(max(y0, y1) + margin)) + 1)
        yy, xx = np.ogrid[top:bottom, left:right]
        px = xx + 0.5 - x0
        py = yy + 0.5 - y0
        vx = x1 - x0
        vy = y1 - y0
        length_squared = vx * vx + vy * vy
        along = (px * vx + py * vy) / length_squared
        clamped_along = np.clip(along, 0.0, 1.0)
        closest_x = x0 + clamped_along * vx
        closest_y = y0 + clamped_along * vy
        distance = np.hypot(xx + 0.5 - closest_x, yy + 0.5 - closest_y)
        stroke_height = profile(1.0 - distance / half_width)
        stroke_height[distance > half_width] = 0
        region = height[top:bottom, left:right]
        np.maximum(region, stroke_height, out=region)

    def merge_dot(degrees: float, radius: float, dot_radius: float) -> None:
        x, y = point(degrees, radius)
        x *= scale
        y *= scale
        dot_radius *= scale
        extent = int(np.ceil(dot_radius + 2))
        left = max(0, int(np.floor(x - extent)))
        right = min(width, int(np.ceil(x + extent)) + 1)
        top = max(0, int(np.floor(y - extent)))
        bottom = min(height_px, int(np.ceil(y + extent)) + 1)
        yy, xx = np.ogrid[top:bottom, left:right]
        distance = np.hypot(xx + 0.5 - x, yy + 0.5 - y)
        dot_height = profile(1.0 - distance / dot_radius)
        dot_height[distance > dot_radius] = 0
        region = height[top:bottom, left:right]
        np.maximum(region, dot_height, out=region)

    if include_rails:
        cap_inset = DIAL_STROKE_WIDTH / 2
        for radius in (R_DIAL_EDGE, R_WEEK_OUT, R_WEEK_IN, R_DAY_OUT, R_DAY_IN):
            merge_circle(radius)
        for index in range(12):
            degrees = MONTH_SECTOR_OFFSET_DEG + index * 30
            merge_segment(
                point(degrees, R_WEEK_OUT + cap_inset),
                point(degrees, R_DIAL_EDGE - cap_inset),
            )
        for index in range(1, WEEK_COUNT, 2):
            degrees = WEEK_OFFSET_DEG + index * WEEK_STEP_DEG
            merge_segment(
                point(degrees, R_WEEK_IN + cap_inset),
                point(degrees, R_WEEK_OUT - cap_inset),
            )
        for index in range(7):
            degrees = DAY_SECTOR_OFFSET_DEG + index * DAY_SECTOR_STEP_DEG
            merge_segment(
                point(degrees, R_DAY_IN + cap_inset),
                point(degrees, R_DAY_OUT - cap_inset),
            )
    if include_dots:
        for index in range(1, WEEK_COUNT, 2):
            degrees = WEEK_OFFSET_DEG + index * WEEK_STEP_DEG
            merge_dot(degrees, R_WEEK_DOT, WEEK_DOT_RADIUS + DIAL_STROKE_WIDTH / 2)
        for index in range(60):
            if index not in MINUTE_SKIP:
                merge_dot(
                    MINUTE_OFFSET_DEG + index * MINUTE_STEP_DEG,
                    R_MINUTE,
                    MINUTE_DOT_RADIUS,
                )
        merge_dot(0, 0, 37)
    return height


def main() -> None:
    source = np.asarray(Image.open(SOURCE).convert("RGBA"), dtype=np.float32)
    height, width = source.shape[:2]
    if (width, height) != (IMG_W, IMG_H):
        raise ValueError(f"Expected {IMG_W}×{IMG_H} source, got {width}×{height}")

    yy, xx = np.ogrid[:height, :width]
    radius = np.sqrt((xx + 0.5 - CX) ** 2 + (yy + 0.5 - CY) ** 2)
    luminance = (
        source[..., 0] * 0.2126
        + source[..., 1] * 0.7152
        + source[..., 2] * 0.0722
    )

    # Extract only black pad printing from the handless photograph. The radial
    # gate rejects the photographed bezel; the alpha gate rejects the already
    # punched date opening. Calibrated vector rails are merged below.
    dial_gate = np.clip((R_DIAL_EDGE + 7.0 - radius) / 5.0, 0.0, 1.0)
    darkness = np.clip((210.0 - luminance) / 197.0, 0.0, 1.0)
    candidate = (darkness * dial_gate > 0.14) & (source[..., 3] > 100)
    photographed_ink = gaussian_filter(candidate.astype(np.float32), 0.7)

    photographed_height = rounded_stroke_height(photographed_ink)
    aperture = Image.new("L", (IMG_W, IMG_H), 255)
    ImageDraw.Draw(aperture).rounded_rectangle(
        DATE_WINDOW,
        radius=DATE_WINDOW_CORNER_RADIUS,
        fill=0,
    )
    photographed_height *= np.asarray(aperture, dtype=np.float32) / 255.0
    photographed_height *= dial_gate

    output_size = (IMG_W * OUTPUT_SCALE, IMG_H * OUTPUT_SCALE)
    photographed_high = np.array(
        Image.fromarray(photographed_height, "F").resize(
            output_size,
            Image.Resampling.BICUBIC,
        ),
        dtype=np.float32,
    )
    # Exact subpixel primitives keep curves and diagonals stable. Radial
    # segments now use circular end caps; a light convolution merges those
    # caps into the rails without the pointed wedges from butt-ended maxima or
    # the pixel stair-stepping of a binary union distance field.
    rail_high = calibrated_linework_height(OUTPUT_SCALE, include_dots=False)
    gaussian_filter(rail_high, sigma=0.9, output=rail_high)

    # Dots are separate shallow circular deposits laid over their radial rail.
    # Keeping their local radius preserves a dome rather than a flat SDF cap.
    dot_high = calibrated_linework_height(
        OUTPUT_SCALE,
        include_rails=False,
        include_dots=True,
    )
    gaussian_filter(dot_high, sigma=0.65, output=dot_high)

    # Re-punch after smoothing so no relief filter fringe can bridge the hole.
    aperture_high = Image.new("L", output_size, 255)
    ImageDraw.Draw(aperture_high).rounded_rectangle(
        tuple(value * OUTPUT_SCALE for value in DATE_WINDOW),
        radius=DATE_WINDOW_CORNER_RADIUS * OUTPUT_SCALE,
        fill=0,
    )
    aperture_array = np.asarray(aperture_high, dtype=np.float32) / 255.0
    photographed_high *= aperture_array
    rail_high *= aperture_array
    dot_high *= aperture_array

    height_map = np.maximum(photographed_high, rail_high)
    np.maximum(height_map, dot_high, out=height_map)

    # Controlled single-layer ink material:
    #   R = zero clearcoat everywhere (ink is not a coating above the dial)
    #   G = roughness (55% paper, ~18% rails, ~29% dots after scalar)
    #   A = dielectric specular intensity (40% paper, 78% rails, 59% dots)
    def material_coverage(layer_height: np.ndarray) -> np.ndarray:
        coverage = np.array(layer_height, copy=True)
        np.divide(coverage, 0.12, out=coverage)
        np.clip(coverage, 0.0, 1.0, out=coverage)
        native = np.asarray(
            Image.fromarray(np.uint8(coverage * 255.0), "L").resize(
                (IMG_W, IMG_H),
                Image.Resampling.LANCZOS,
            ),
            dtype=np.float32,
        )
        native /= 255.0
        return native

    rail_ink_native = material_coverage(rail_high)
    dot_ink_native = material_coverage(dot_high)
    material_rgba = np.empty((IMG_H, IMG_W, 4), dtype=np.uint8)
    rail_green = 255 - rail_ink_native * 171
    rail_alpha = 102 + rail_ink_native * 98
    material_rgba[..., 0] = 0
    material_rgba[..., 1] = np.uint8(
        rail_green * (1.0 - dot_ink_native) + 135 * dot_ink_native,
    )
    material_rgba[..., 2] = 255
    material_rgba[..., 3] = np.uint8(
        rail_alpha * (1.0 - dot_ink_native) + 150 * dot_ink_native,
    )
    mirror_ink_native = np.maximum(rail_ink_native, dot_ink_native)
    mirror_rgba = np.empty((IMG_H, IMG_W, 4), dtype=np.uint8)
    mirror_rgba[..., 0] = np.uint8(51 + mirror_ink_native * 204)
    mirror_rgba[..., 1] = np.uint8(255 - mirror_ink_native * 220)
    mirror_rgba[..., 2] = 255
    mirror_rgba[..., 3] = np.uint8(102 + mirror_ink_native * 153)
    del (
        rail_ink_native,
        dot_ink_native,
        mirror_ink_native,
        rail_green,
        rail_alpha,
    )

    # Lettering keeps the accepted thick pad-print relief. Rails use a true
    # rounded cross-section with extra height so its glossy crown stands above
    # the paper without reverting to the old two-facet profile.
    normal_rgb = tangent_normal_map(
        photographed_high,
        relief_strength=6.0 * OUTPUT_SCALE,
    )
    rail_normal = tangent_normal_map(
        rail_high,
        relief_strength=RAIL_RELIEF_HEIGHT * OUTPUT_SCALE,
    )

    def blend_normals(layer_normal: np.ndarray, layer_height: np.ndarray) -> None:
        weight = np.clip(layer_height / 0.18, 0.0, 1.0)
        weight *= weight * (3.0 - 2.0 * weight)
        for channel in range(3):
            normal_rgb[..., channel] = np.clip(
                normal_rgb[..., channel] * (1.0 - weight)
                + layer_normal[..., channel] * weight,
                0,
                255,
            ).astype(np.uint8)

    blend_normals(rail_normal, rail_high)
    del rail_normal, rail_high
    dot_normal = tangent_normal_map(
        dot_high,
        relief_strength=DOT_RELIEF_HEIGHT * OUTPUT_SCALE,
    )
    blend_normals(dot_normal, dot_high)
    del dot_normal, dot_high, photographed_high
    dial_mask = Image.new("L", output_size, 0)
    draw = ImageDraw.Draw(dial_mask)
    dial_extent = (R_DIAL_EDGE + 7) * OUTPUT_SCALE
    center_x = CX * OUTPUT_SCALE
    center_y = CY * OUTPUT_SCALE
    draw.ellipse(
        (
            center_x - dial_extent,
            center_y - dial_extent,
            center_x + dial_extent,
            center_y + dial_extent,
        ),
        fill=255,
    )
    normal_rgb[np.asarray(dial_mask) == 0] = np.array([128, 128, 255], dtype=np.uint8)

    Image.fromarray(np.clip(height_map * 255.0, 0, 255).astype(np.uint8), "L").save(
        HEIGHT,
        optimize=True,
    )
    Image.fromarray(normal_rgb, "RGB").save(NORMAL, optimize=True)
    Image.fromarray(material_rgba, "RGBA").save(MATERIAL, optimize=True)
    Image.fromarray(mirror_rgba, "RGBA").save(MATERIAL_MIRROR, optimize=True)

    print(f"Saved {HEIGHT.relative_to(ROOT)}")
    print(f"Saved {NORMAL.relative_to(ROOT)}")
    print(f"Saved {MATERIAL.relative_to(ROOT)}")
    print(f"Saved {MATERIAL_MIRROR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
