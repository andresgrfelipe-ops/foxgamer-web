from PIL import Image
from pathlib import Path
p=Path('assets/photos')
# source: output: crop box in source pixels (left,top,right,bottom)
items={'ps4-fat-real.jpg':(120,250,1120,1450),'ps5-pro-real.jpg':(80,180,1120,1350),'ps5-fat-825-real.jpg':(90,130,1100,1250),'xbox-series-s-512-real.png':(0,25,1024,760),'xbox-series-s-1tb-real.jpg':(120,150,1060,980),'ps5-slim-1tb-real.png':(0,20,1024,720),'ps5-spiderman2-real.jpg':(80,280,1100,1450),'rog-ally-real.jpg':(100,260,1100,1450)}
for name,box in items.items():
 f=p/name
 if not f.exists(): continue
 im=Image.open(f).convert('RGB'); im.crop(box).save(f,quality=92,optimize=True)
 print(name,im.size)
