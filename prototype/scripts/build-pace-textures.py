"""PACE product-label and sponge textures. No product photos are baked onto geometry."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random, math
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'model-source/pace-textures'; OUT.mkdir(parents=True,exist_ok=True)
def font(n,bold=False,italic=False):
    return ImageFont.truetype('C:/Windows/Fonts/'+('arialbi.ttf' if italic else 'arialbd.ttf' if bold else 'arial.ttf'),n)

im=Image.new('RGB',(1536,1152)); px=im.load()
for y in range(1152):
    for x in range(1536):
        t=x/1536; v=y/1152
        glow=math.exp(-((t-.13)**2+(v-.19)**2)/.16)
        wave=v > .86-.20*math.sin(t*2.9)
        px[x,y]=(int(4+8*wave),int(27+55*glow+7*wave),int(125+51*glow+27*wave))
im.save(OUT/'panel-color.png')
labels=Image.new('RGBA',im.size);d=ImageDraw.Draw(labels)
d.text((100,641),'ADS',font=font(95,True),fill='white')
d.text((292,648),'200',font=font(82),fill='white')
d.rectangle((105,745,420,790),fill='white')
d.text((262,768),'Plus',font=font(32,True),fill='#167dd4',anchor='mm')
d.text((1117,558),'AccuDrive',font=font(63,italic=True),fill='white',anchor='mm')
d.text((1320,529),'®',font=font(24),fill='white')
labels.save(OUT/'panel-print.png')

# Reuse the supplied PACE logo; its transparent white artwork matches the front badge.
logo=Image.open(ROOT/'image-source/pace/logo.png').convert('RGBA')
logo.save(OUT/'pace-logo.png')

rng=random.Random(212)
im=Image.new('RGB',(512,512),'#e8cb20');d=ImageDraw.Draw(im)
for i in range(22500):
    x,y=rng.randrange(512),rng.randrange(512); r=rng.choice([1,1,1,2,2,3])
    v=rng.randrange(80,180)
    d.ellipse((x-r,y-r,x+r,y+r),fill=(min(250,v+70),min(235,v+53),rng.randrange(2,39)))
im=im.filter(ImageFilter.GaussianBlur(.35)); im.save(OUT/'sponge.png')
print('PACE textures generated.')
