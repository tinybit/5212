"""Shared pad-print relief profile for watch-dial texture generation."""

import numpy as np
from scipy.ndimage import distance_transform_edt, gaussian_filter
from skimage.morphology import medial_axis


def rounded_stroke_height(ink_mask: np.ndarray, blur: float = 0.7) -> np.ndarray:
    """Build a rounded capsule cross-section from an antialiased ink mask."""
    stroke = ink_mask > 0.5
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
    normalized_depth = np.zeros_like(ink_mask, dtype=np.float32)
    normalized_depth[stroke] = np.clip(
        edge_distance[stroke] / np.maximum(local_half_width[stroke], 1.0),
        0.0,
        1.0,
    )

    # Quarter-sine dome: finite shoulder at the edge, continuously curved
    # crown, and no flat plateau or narrow bevel ring.
    rounded_dome = np.sin(normalized_depth * np.pi / 2.0)
    height_map = gaussian_filter(rounded_dome * ink_mask, blur)
    maximum = float(height_map.max())
    if maximum > 0:
        height_map /= maximum
    return height_map.astype(np.float32)


def tangent_normal_map(height_map: np.ndarray, relief_strength: float = 6.0) -> np.ndarray:
    """Convert image-space height into an RGB tangent-space normal map."""
    gradient_y, gradient_x = np.gradient(height_map)
    normal_x = -gradient_x * relief_strength
    # Image Y points down while texture +V points up.
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
    return np.clip((normal * 0.5 + 0.5) * 255.0, 0, 255).astype(np.uint8)
