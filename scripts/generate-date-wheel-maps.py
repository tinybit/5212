#!/usr/bin/env python3
"""Generate clean date-wheel albedo, height, and tangent-space normal maps."""

from pathlib import Path
import shutil

import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt, gaussian_filter
from skimage.morphology import medial_axis


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "date-ring-overlay.png"
BACKUP = PUBLIC / "date-ring-overlay.original.png"
ALBEDO = PUBLIC / "date-wheel-albedo.png"
HEIGHT = PUBLIC / "date-wheel-height.png"
NORMAL = PUBLIC / "date-wheel-normal.png"

TEXTURE_MARGIN = 77
PAPER = np.array([249, 249, 249], dtype=np.float32)
INK = np.array([13, 14, 16], dtype=np.float32)


def main() -> None:
    if not BACKUP.exists():
        shutil.copyfile(SOURCE, BACKUP)

    source = np.asarray(Image.open(BACKUP).convert("RGBA"), dtype=np.float32)
    height, width = source.shape[:2]
    if (width, height) != (2300, 2300):
        raise ValueError(f"Expected a 2300×2300 source, got {width}×{height}")

    yy, xx = np.ogrid[:height, :width]
    radius = np.sqrt((xx + 0.5 - width / 2) ** 2 + (yy + 0.5 - height / 2) ** 2)
    luminance = (
        source[..., 0] * 0.2126
        + source[..., 1] * 0.7152
        + source[..., 2] * 0.0722
    )

    # Numerals occupy this radial band. Excluding the original inner/outer
    # boundaries prevents photographed circular seams becoming glyph relief.
    radial_gate = np.clip((radius - 915.0) / 10.0, 0.0, 1.0)
    radial_gate *= np.clip((1140.0 - radius) / 10.0, 0.0, 1.0)
    darkness = np.clip((230.0 - luminance) / 205.0, 0.0, 1.0)
    candidate = (darkness * radial_gate > 0.14) & (source[..., 3] > 100)

    # A lightly antialiased binary silhouette removes all directional shading
    # while preserving the hand-drawn stroke contours.
    ink_mask = np.clip(gaussian_filter(candidate.astype(np.float32), 0.7), 0.0, 1.0)

    # Pad the native artwork without scaling it. Geometry grows by the same
    # ratio in the renderer, so numeral dimensions remain calibrated.
    padded_size = width + TEXTURE_MARGIN * 2
    padded_mask = np.zeros((padded_size, padded_size), dtype=np.float32)
    sl = slice(TEXTURE_MARGIN, TEXTURE_MARGIN + width)
    padded_mask[sl, sl] = ink_mask

    py, px = np.ogrid[:padded_size, :padded_size]
    padded_radius = np.sqrt(
        (px + 0.5 - padded_size / 2) ** 2 + (py + 0.5 - padded_size / 2) ** 2
    )
    disk = padded_radius <= padded_size / 2

    albedo_rgb = (
        PAPER[None, None, :] * (1.0 - padded_mask[..., None])
        + INK[None, None, :] * padded_mask[..., None]
    )
    albedo_rgba = np.zeros((padded_size, padded_size, 4), dtype=np.uint8)
    albedo_rgba[..., :3] = np.clip(albedo_rgb, 0, 255).astype(np.uint8)
    albedo_rgba[..., 3] = np.where(disk, 255, 0).astype(np.uint8)

    # A pad-printed stroke has a rounded capsule cross-section. Normalize each
    # pixel's edge distance by the LOCAL half-width at its nearest medial-axis
    # point, then use a quarter-sine dome: finite rounded shoulder at the edge,
    # continuous curvature across the full stroke, and zero slope at the crown.
    # Unlike the previous saturating profile, this never creates a flat top or
    # a narrow bevel ring.
    stroke = padded_mask > 0.5
    skeleton, edge_distance = medial_axis(stroke, return_distance=True)
    nearest_skeleton = distance_transform_edt(
        ~skeleton,
        return_distances=False,
        return_indices=True,
    )
    local_half_width = edge_distance[
        nearest_skeleton[0],
        nearest_skeleton[1],
    ]
    normalized_depth = np.zeros_like(padded_mask)
    normalized_depth[stroke] = np.clip(
        edge_distance[stroke] / np.maximum(local_half_width[stroke], 1.0),
        0.0,
        1.0,
    )
    rounded_dome = np.sin(normalized_depth * np.pi / 2.0)
    height_map = gaussian_filter(rounded_dome * padded_mask, 0.7)
    if height_map.max() > 0:
        height_map /= height_map.max()

    # Tangent-space normal map. Image Y points down while texture +V points up,
    # hence the opposite signs for X and Y derivatives.
    gradient_y, gradient_x = np.gradient(height_map)
    relief_strength = 6.0
    normal_x = -gradient_x * relief_strength
    normal_y = gradient_y * relief_strength
    normal_z = np.ones_like(height_map)
    normal_length = np.sqrt(normal_x**2 + normal_y**2 + normal_z**2)
    normal = np.stack(
        (
            normal_x / normal_length,
            normal_y / normal_length,
            normal_z / normal_length,
        ),
        axis=-1,
    )
    normal_rgb = np.clip((normal * 0.5 + 0.5) * 255.0, 0, 255).astype(np.uint8)
    normal_rgb[~disk] = np.array([128, 128, 255], dtype=np.uint8)

    Image.fromarray(albedo_rgba, "RGBA").save(ALBEDO, optimize=True)
    Image.fromarray(np.clip(height_map * 255.0, 0, 255).astype(np.uint8), "L").save(
        HEIGHT, optimize=True
    )
    Image.fromarray(normal_rgb, "RGB").save(NORMAL, optimize=True)

    print(f"Saved {BACKUP.relative_to(ROOT)}")
    print(f"Saved {ALBEDO.relative_to(ROOT)}")
    print(f"Saved {HEIGHT.relative_to(ROOT)}")
    print(f"Saved {NORMAL.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
