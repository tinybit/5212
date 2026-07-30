"""Build the transparent Reference 2 aperture and its extracted shadow frame."""

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "reference-handless.png"
CUTOUT_OUTPUT = ROOT / "public" / "reference-handless-date-cutout.png"
SHADOW_OUTPUT = ROOT / "public" / "date-window-shadow.png"

# Measured in the 2911 × 2683 Reference 2 coordinate system.
APERTURE = (2010, 1256, 2188, 1400)
APERTURE_RADIUS = 12
SHADOW_CROP = (1999, 1245, 2199, 1410)
SHADOW_INNER = (2016, 1263, 2182, 1395)
SUPERSAMPLE = 4


def rounded_mask(
    size: tuple[int, int],
    box: tuple[int, int, int, int],
    radius: int,
) -> Image.Image:
    scale = SUPERSAMPLE
    mask = Image.new("L", (size[0] * scale, size[1] * scale), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(
        tuple(value * scale for value in box),
        radius=radius * scale,
        fill=255,
    )
    return mask.resize(size, Image.Resampling.LANCZOS)


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")

    aperture_mask = rounded_mask(source.size, APERTURE, APERTURE_RADIUS)
    cutout = source.copy()
    cutout.putalpha(
        ImageChops.multiply(source.getchannel("A"), ImageChops.invert(aperture_mask))
    )
    cutout.save(CUTOUT_OUTPUT, optimize=True)

    crop = source.crop(SHADOW_CROP)
    crop_outer = tuple(
        value - SHADOW_CROP[index % 2]
        for index, value in enumerate(APERTURE)
    )
    crop_inner = tuple(
        value - SHADOW_CROP[index % 2]
        for index, value in enumerate(SHADOW_INNER)
    )
    outer_mask = rounded_mask(crop.size, crop_outer, APERTURE_RADIUS)
    inner_mask = rounded_mask(crop.size, crop_inner, 7)
    frame_mask = ImageChops.subtract(outer_mask, inner_mask)
    crop.putalpha(ImageChops.multiply(crop.getchannel("A"), frame_mask))
    crop.save(SHADOW_OUTPUT, optimize=True)


if __name__ == "__main__":
    main()
