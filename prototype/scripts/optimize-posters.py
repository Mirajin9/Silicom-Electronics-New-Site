"""Encode the Blender renders as web assets; preserve the source PNGs unchanged."""
from pathlib import Path
from PIL import Image
import sys
root = Path(__file__).resolve().parents[1] / 'public' / 'images'
names = [name + '.png' for name in sys.argv[1:]] if len(sys.argv) > 1 else ['scope-hero.png', 'scope-detail.png', 'scope-rear.png', 'packages.png', 'package-theatre.png']
for png in [*(root / n for n in names), *([] if len(sys.argv) > 1 else sorted((root / 'packages').glob('*.png')))]:
    with Image.open(png) as render:
        render.save(png.with_suffix('.webp'), 'WEBP', quality=88, method=6)
    print(f'{png.relative_to(root)}: {png.stat().st_size:,} to {png.with_suffix(".webp").stat().st_size:,} bytes')
