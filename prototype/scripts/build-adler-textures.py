"""Generate small print atlases from verified ADLER catalogue markings."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'model-source' / 'adler-textures'
OUT.mkdir(parents=True, exist_ok=True)
INK = (28, 36, 39, 255)
def font(size, bold=False):
    return ImageFont.truetype('C:/Windows/Fonts/' + ('arialbd.ttf' if bold else 'arial.ttf'), size)

# Use the existing supplied manufacturer emblem, preserving its silhouette.
source = Image.open(ROOT.parent / 'assets/brand-logos/adler.png').convert('RGBA')
emblem = source.crop((233, 17, 559, 281))
def logo(im, xy, width, color=INK):
    mark = emblem.copy()
    mark.thumbnail((width, int(width * .82)), Image.Resampling.LANCZOS)
    solid = Image.new('RGBA', mark.size, color)
    solid.putalpha(mark.getchannel('A'))
    im.alpha_composite(solid, xy)
    d = ImageDraw.Draw(im)
    d.text((xy[0]+mark.width/2, xy[1]+mark.height+4), 'adler', font=font(int(width*.24)), fill=color, anchor='mt')

for name in ('a94', 'a84'):
    height = 2048 if name == 'a94' else 1280
    im = Image.new('RGBA', (1024, height), (8, 148, 198, 255))
    d = ImageDraw.Draw(im)
    # Printing occupies the front quarter of the wrap, with clear margins at cap edges.
    cy = int(height * .415)
    logo(im, (412, cy-214), 200)
    d.text((512, cy+48), name.upper()+' gPV', font=font(60, True), fill=INK, anchor='mm')
    d.text((512, cy+113), '80A' if name == 'a94' else '32A', font=font(60, True), fill=INK, anchor='mm')
    d.text((512, cy+172), '1500VDC', font=font(32), fill=INK, anchor='mm')
    im.save(OUT / (name+'-wrap.png'))

for name in ('bh300', 'bh400'):
    im = Image.new('RGBA', (2048, 1024))
    d = ImageDraw.Draw(im)
    if name == 'bh300':
        logo(im, (265, 270), 154)
        d.text((1010, 143), 'BH300-02', font=font(56, True), fill=INK, anchor='mm')
        d.text((1010, 203), 'For 1500V Fuse Links', font=font(29, True), fill=INK, anchor='mm')
        for i, line in enumerate(['Rated voltage: 1500 Vdc', 'Rated current: up to 50 A', 'For 10 x 85 / 14 x 85 mm', 'cylindrical fuse links', 'DIN rail mounting']):
            d.text((1475, 410+i*48), line, font=font(25), fill=INK)
        for i,line in enumerate(['PHOTOVOLTAIC FUSE HOLDER', 'Disconnect power before replacing fuse.', 'Use only the specified fuse link.']):
            d.text((580, 682+i*37), line, font=font(24), fill=INK)
        d.text((1460, 775), 'ADLER Electric', font=font(27,True), fill=INK)
    else:
        d.text((480, 140), 'BH400 Series', font=font(52, True), fill=INK)
        for i,line in enumerate(['For cylindrical fuse links', '1500 Vdc / 80 A', '22 x 58 mm', 'DIN rail mounting']):
            d.text((490, 214+i*38), line, font=font(25), fill=INK)
        logo(im,(163,507),155)
        x,y,w,h=605,490,760,312
        d.rectangle((x,y,x+w,y+h),outline=INK,width=3)
        rows=[('FUSE HOLDER','BH400'),('Rated voltage','1500 Vdc'),('Rated current','80 A'),('Fuse dimensions','22 x 58 mm'),('Maximum torque','4 N.m'),('Mounting','DIN rail')]
        for i,(a,b) in enumerate(rows):
            yy=y+i*52
            d.line((x,yy,x+w,yy),fill=INK,width=2)
            d.text((x+18,yy+13),a,font=font(24),fill=INK)
            d.text((x+470,yy+13),b,font=font(24),fill=INK)
        d.line((x+450,y,x+450,y+h),fill=INK,width=2)
        d.text((1510,690),'PHOTOVOLTAIC',font=font(26,True),fill=INK)
        d.text((1510,729),'FUSE HOLDER',font=font(26,True),fill=INK)
        d.text((1510,779),'ADLER Electric',font=font(25),fill=INK)
    im.save(OUT / (name+'-side.png'))

im = Image.new('RGBA',(1024,256))
logo(im,(65,28),135,(245,247,248,255))
d=ImageDraw.Draw(im)
d.text((380,90),'BH300',font=font(66,True),fill='white')
d.text((380,172),'1500 Vdc',font=font(35),fill='white')
im.save(OUT/'bh300-top.png')
im = Image.new('RGBA',(512,512))
logo(im,(162,34),176)
d=ImageDraw.Draw(im)
d.text((256,298),'BH400',font=font(50,True),fill=INK,anchor='mm')
d.text((256,370),'1500 Vdc / 80 A',font=font(31),fill=INK,anchor='mm')
im.save(OUT/'bh400-top.png')
print('ADLER label atlases ready.')
