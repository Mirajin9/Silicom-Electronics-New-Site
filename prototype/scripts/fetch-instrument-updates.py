import urllib.request
from pathlib import Path
out=Path(__file__).resolve().parents[1]/'image-source/instruments'
assets={
 'tektronix-afg31000.jpg':'https://www.tek.com/-/media/images/product-series/afg31000/afg31000-front_0.jpg',
 'keithley-dmm6500.jpg':'https://www.tek.com/-/media/images/product-images/dmm6500.jpg',
 'keithley-daq6510.png':'https://www.tek.com/-/media/images/product-series/daq6500/daq6510_frontwfeet_measureplot.png',
 'microtest-5260n.jpg':'https://www.microtest.com.tw/product/20260824155950.jpg',
}
for name,url in assets.items():
 data=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read()
 (out/name).write_bytes(data)
 print(name,len(data))
