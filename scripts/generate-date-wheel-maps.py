#!/usr/bin/env python3
"""Generate clean date-wheel albedo, height, and tangent-space normal maps."""

from pathlib import Path
import shutil

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

from dial_relief import rounded_stroke_height, tangent_normal_map


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

    height_map = rounded_stroke_height(padded_mask)
    normal_rgb = tangent_normal_map(height_map)
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
