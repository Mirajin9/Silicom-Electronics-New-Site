"""Web posters and a visual overview for the four ADLER display models."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/images/adler'
RENDERS=ROOT/'model-source/adler-renders'
sheet=Image.new('RGB',(1600,1240),'#f0f4f8')
d=ImageDraw.Draw(sheet)
font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',29)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
items=[('bh300','BH300','PV FUSE HOLDER'),('bh400','BH400','PV FUSE HOLDER'),('a94','A94','22 x 58 mm CYLINDRICAL FUSE'),('a84','A84','14 x 51 mm CYLINDRICAL FUSE')]
for i,(name,title,subtitle) in enumerate(items):
    im=Image.open(RENDERS/(name+'.png')).convert('RGBA')
    im.save(OUT/(name+'.webp'),'WEBP',quality=90,method=6)
    im.thumbnail((760,540),Image.Resampling.LANCZOS)
    x=(i%2)*800; y=(i//2)*620
    sheet.paste(im,(x+(800-im.width)//2,y+12),im)
    d.text((x+45,y+551),title,font=font,fill='#123353')
    d.text((x+45,y+590),subtitle,font=small,fill='#52697e')
sheet.save(OUT/'adler-collection.webp','WEBP',quality=92,method=6)
print('Four web posters and ADLER collection overview saved.')
