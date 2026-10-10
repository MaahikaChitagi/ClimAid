"""Draw simple labeled pictures for flood, wildfire, and storm."""

from pathlib import Path

import numpy as np
from PIL import Image

DISASTERS = ["flood", "wildfire", "storm"]
SEVERITIES = ["low", "moderate", "severe"]
SIZE = 96

COVERAGE = {"low": 0.28, "moderate": 0.55, "severe": 0.82}


def _to_image(array):
    clipped = np.clip(array, 0.0, 1.0)
    return Image.fromarray((clipped * 255).astype(np.uint8), mode="RGB")


def render(disaster, severity, rng):
    image = np.zeros((SIZE, SIZE, 3), dtype=np.float32)
    coverage = COVERAGE[severity]
    yy, xx = np.mgrid[0:SIZE, 0:SIZE]

    if disaster == "flood":
        image[:] = (0.32, 0.42, 0.2)
        image += rng.normal(0, 0.02, image.shape)
        water_start = int(SIZE * (1.0 - coverage))
        water_start = int(np.clip(water_start + rng.integers(-4, 5), 0, SIZE - 1))
        phase = rng.uniform(0, 6)
        for y in range(water_start, SIZE):
            ripple = 0.07 * np.sin(xx[y] / 3.2 + y / 2.4 + phase)
            image[y, :, 0] = 0.12 + ripple
            image[y, :, 1] = 0.38 + ripple
            image[y, :, 2] = 0.78 + 0.4 * ripple
    elif disaster == "wildfire":
        image[:] = (0.12, 0.08, 0.06)
        image += rng.normal(0, 0.015, image.shape)
        blob_count = {"low": 2, "moderate": 4, "severe": 7}[severity]
        radius = {"low": 8, "moderate": 12, "severe": 16}[severity]
        for _ in range(blob_count):
            cy = int(rng.integers(8, SIZE - 8))
            cx = int(rng.integers(8, SIZE - 8))
            dist = np.sqrt((yy - cy) ** 2 + (xx - cx) ** 2)
            mask = np.exp(-(dist ** 2) / (2 * radius ** 2))
            color = np.array([0.95, rng.uniform(0.25, 0.55), 0.05], dtype=np.float32)
            image = image * (1 - mask[..., None]) + color * mask[..., None]
        # More damage adds more smoke at the top.
        smoke = np.linspace(coverage, 0, SIZE, dtype=np.float32)[:, None]
        image = image * (1 - 0.45 * smoke[..., None]) + 0.35 * smoke[..., None]
    else:
        tone = 0.55 - 0.28 * coverage
        image[:] = (tone, tone + 0.02, tone + 0.08)
        image += rng.normal(0, 0.02, image.shape)
        streaks = {"low": 18, "moderate": 40, "severe": 70}[severity]
        for _ in range(streaks):
            x0 = int(rng.integers(0, SIZE))
            y0 = int(rng.integers(0, SIZE))
            length = int(rng.integers(10, 28))
            for step in range(length):
                x = x0 + step
                y = y0 + step // 2
                if 0 <= x < SIZE and 0 <= y < SIZE:
                    image[y, x] = (0.85, 0.88, 0.92)

    image += rng.normal(0, 0.01, image.shape)
    return _to_image(image)


def write_split(root, split, per_class, seed):
    rng = np.random.default_rng(seed)
    written = 0
    for disaster in DISASTERS:
        for severity in SEVERITIES:
            folder = Path(root) / split / disaster / severity
            folder.mkdir(parents=True, exist_ok=True)
            for index in range(per_class):
                image = render(disaster, severity, rng)
                image.save(folder / f"{index:03d}.png")
                written += 1
    return written


def build_dataset(root, train_per_class=36, val_per_class=12, seed=7):
    root = Path(root)
    train_count = write_split(root, "train", train_per_class, seed)
    val_count = write_split(root, "val", val_per_class, seed + 1)
    return train_count, val_count


if __name__ == "__main__":
    train_count, val_count = build_dataset(Path(__file__).resolve().parent / "data")
    print(f"wrote {train_count} train and {val_count} val images")
