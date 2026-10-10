"""Resize and label disaster photos.

Real photos go in folders like flood/low/ and wildfire/severe/.
If those folders are missing, SyntheticDisasterSet draws simple stand-in images.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance
from torch.utils.data import Dataset
from torchvision import transforms

from model import DISASTER_TYPES, IMAGE_SIZE, SEVERITIES

# Scale pixel values from 0–1 to -1–1.
NORMALIZE = transforms.Normalize(mean=(0.5, 0.5, 0.5), std=(0.5, 0.5, 0.5))

EVAL_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        NORMALIZE,
    ]
)

TRAIN_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(12),
        transforms.ColorJitter(brightness=0.15, contrast=0.15, saturation=0.1),
        transforms.ToTensor(),
        NORMALIZE,
    ]
)


def preprocess_image(image):
"""Resize one photo the same way the model was trained."""
    if image.mode != "RGB":
        image = image.convert("RGB")
    return EVAL_TRANSFORM(image).unsqueeze(0)


class FolderDisasterSet(Dataset):
"""Load photos from disaster/severity folders."""

    def __init__(self, root, train=True):
        self.train = train
        self.samples = []
        root = Path(root)
        for disaster in DISASTER_TYPES:
            for severity in SEVERITIES:
                folder = root / disaster / severity
                if not folder.is_dir():
                    continue
                for path in folder.iterdir():
                    if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
                        self.samples.append(
                            (path, DISASTER_TYPES.index(disaster), SEVERITIES.index(severity))
                        )
        if not self.samples:
            raise FileNotFoundError(
                f"No images under {root}. Expected {DISASTER_TYPES[0]}/{SEVERITIES[0]}/*.jpg and the other class folders."
            )

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        path, disaster_y, severity_y = self.samples[index]
        image = Image.open(path).convert("RGB")
        transform = TRAIN_TRANSFORM if self.train else EVAL_TRANSFORM
        return transform(image), disaster_y, severity_y


def _paint(disaster, severity, seed):
"""Draw a small picture that matches the disaster and severity labels."""
    rng = np.random.default_rng(seed)
    height = width = 96
    image = np.zeros((height, width, 3), dtype=np.float32)
    yy, xx = np.mgrid[0:height, 0:width]
    damage = {"low": 0.22, "moderate": 0.55, "severe": 0.85}[severity]

    if disaster == "flood":
        image[:, :] = (0.55, 0.72, 0.86)
        # More damage means the water covers more of the picture.
        water = int(height * (0.78 - 0.62 * damage))
        water = int(np.clip(water + int(rng.integers(-4, 5)), 4, height - 8))
        ripple = 0.04 * np.sin(xx[water:] / 3.0 + rng.random())
        image[water:, :, 0] = 0.08
        image[water:, :, 1] = 0.32 + ripple
        image[water:, :, 2] = 0.62
        blobs = int(3 + damage * 22)
        for _ in range(blobs):
            cy = int(rng.integers(water, height - 1))
            cx = int(rng.integers(0, width))
            rad = int(rng.integers(2, 4 + int(damage * 6)))
            mask = (yy - cy) ** 2 + (xx - cx) ** 2 <= rad ** 2
            image[mask] = (0.35, 0.22, 0.1)
    elif disaster == "wildfire":
        image[:, :] = (0.15, 0.15, 0.16)
        smoke = int(40 - damage * 10)
        image[:smoke, :, 0] = 0.25
        image[:smoke, :, 1] = 0.25
        image[:smoke, :, 2] = 0.27
        flame = yy / height
        image[:, :, 0] = np.maximum(image[:, :, 0], flame * (0.45 + damage))
        image[:, :, 1] = np.maximum(image[:, :, 1], flame * 0.22 * (1.2 - damage))
        image[:, :, 2] *= 1 - flame
        embers = int(4 + damage * 30)
        for _ in range(embers):
            cy = int(rng.integers(height // 2, height))
            cx = int(rng.integers(0, width))
            rad = int(rng.integers(1, 3))
            mask = (yy - cy) ** 2 + (xx - cx) ** 2 <= rad ** 2
            image[mask] = (0.95, 0.45, 0.05)
    else:
        image[:, :] = (0.45, 0.48, 0.52)
        shade = 0.55 + 0.45 * (1 - yy / height)
        image *= shade[:, :, None]
        streaks = int(8 + damage * 28)
        for _ in range(streaks):
            x0 = int(rng.integers(0, width))
            for step in range(height):
                col = min(width - 1, max(0, x0 + step // 3))
                image[step, col] = (0.75, 0.78, 0.82)
        if damage > 0.4:
            image[70:, :, :] *= 0.45

    image += rng.normal(0, 0.02, image.shape).astype(np.float32)
    image = np.clip(image, 0, 1)
    return (image * 255).astype(np.uint8)


class SyntheticDisasterSet(Dataset):
"""Same labeled pictures every run, so training is repeatable."""

    def __init__(self, n_per_pair=36, train=True, seed=0):
        self.train = train
        self.samples = []
        rng = np.random.default_rng(seed)
        for disaster_index, _disaster in enumerate(DISASTER_TYPES):
            for severity_index, _severity in enumerate(SEVERITIES):
                for _ in range(n_per_pair):
                    self.samples.append((disaster_index, severity_index, int(rng.integers(0, 2**31 - 1))))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, index):
        disaster_y, severity_y, seed = self.samples[index]
        array = _paint(DISASTER_TYPES[disaster_y], SEVERITIES[severity_y], seed)
        image = Image.fromarray(array, mode="RGB")
        if self.train:
            # Slight brightness change so the model does not memorize one shade.
            image = ImageEnhance.Brightness(image).enhance(0.9 + (seed % 5) * 0.04)
        transform = TRAIN_TRANSFORM if self.train else EVAL_TRANSFORM
        return transform(image), disaster_y, severity_y
