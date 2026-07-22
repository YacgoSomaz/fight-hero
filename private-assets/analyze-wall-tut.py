"""Audit exact trigger colours in FFDec-exported Wall_tut frames."""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

SOURCE = Path(sys.argv[1])
OUTPUT = Path(sys.argv[2])
TARGETS = {"ff00ff": (255, 0, 255, 255), "9900ff": (153, 0, 255, 255)}


def bounds(image: np.ndarray, colour: tuple[int, int, int, int]) -> list[int] | None:
    y_values, x_values = np.where(np.all(image == colour, axis=2))
    if not x_values.size:
        return None
    return [int(x_values.min()), int(y_values.min()), int(x_values.max()), int(y_values.max()), int(x_values.size)]


audit = {}
for file in sorted(SOURCE.glob("*.png"), key=lambda path: int(path.stem)):
    image = np.asarray(Image.open(file).convert("RGBA"))
    audit[int(file.stem)] = {name: bounds(image, colour) for name, colour in TARGETS.items()}

OUTPUT.write_text(json.dumps(audit, indent=2) + "\n", encoding="utf-8")
