from pathlib import Path
from PIL import Image,ImageOps
src=Path('../fox-originals');dst=Path('assets/photos');dst.mkdir(exist_ok=True)
for p in src.glob('*'):
    stem=p.stem.lower()
    if stem.startswith('img_') and not (dst/f'{stem}.webp').exists():
        try:
            im=ImageOps.exif_transpose(Image.open(p)).convert('RGB'); im.thumbnail((640,640)); im.save(dst/f'{stem}.webp',quality=82,method=6)
        except Exception: pass
print('Prepared local game photos.')
