from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import shutil
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/images/pace';OUT.mkdir(parents=True,exist_ok=True)
for name in ['pace-ads200','pace-blue-tips']:
    im=Image.open(ROOT/'model-source/pace-renders'/(name+'.png')).convert('RGBA')
    im.save(OUT/(name+'.webp'),'WEBP',quality=92,method=6)
sheet=Image.new('RGB',(1600,1590),'#edf2f7')
station=Image.open(ROOT/'model-source/pace-renders/pace-ads200.png').convert('RGBA');station.thumbnail((1540,1090),Image.Resampling.LANCZOS)
sheet.paste(station,((1600-station.width)//2,10),station)
tips=Image.open(ROOT/'model-source/pace-renders/pace-blue-tips.png').convert('RGBA');tips.thumbnail((1510,420),Image.Resampling.LANCZOS)
sheet.paste(tips,((1600-tips.width)//2,1150),tips)
d=ImageDraw.Draw(sheet);font=ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf',35);small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',22)
d.text((66,1035),'PACE ADS200 PLUS',font=font,fill='#102944')
d.text((66,1082),'Station, TD-200 iron and tool stand',font=small,fill='#53697e')
d.text((66,1522),'AccuDrive Blue Series — 16 individually animated tips',font=small,fill='#102944')
sheet.save(OUT/'pace-collection.webp','WEBP',quality=92,method=6)
shutil.copy2(ROOT/'model-source/pace-manifest.json',ROOT/'public/models/pace-manifest.json')
print('PACE web posters and manifest saved.')
