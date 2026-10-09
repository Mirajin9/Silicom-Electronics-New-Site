# Instrument catalogue corrections — 7 October 2026

Implemented the user's approved screenshot feedback while retaining the existing React design, routes, category ranges and enquiry flow. No deployment or DNS change is part of this update.

## Selected function generator

**Tektronix AFG31252**, in the AFG31000 family, replaces the separate EDU oscilloscope card. It offers two channels, sine output to 250 MHz, up to 2 GS/s sampling and 14-bit resolution. Its advanced waveform mode, InstaView, ArbBuilder and double-pulse application make it a suitable higher-tier instrument for board and power-device testing. The image illustrates the AFG31000 family and is labelled accordingly.

- [Manufacturer product page](https://www.tek.com/en/products/signal-generators/arbitrary-function-generator/afg31000)
- [Manufacturer datasheet](https://www.tek.com/en/datasheet/arbitrary-function-generators)

## Other corrections and sources

- One 2 Series MSO listing, with education pricing/bundles explained within the card. No unpublished education price is stated.
- EA leads power-supply imagery and featured products. The existing photograph shows a PSI 9080-60 DT, so the featured family is **PSI 9000 DT**, with model-dependent 320–1500 W ratings, rather than a rack instrument. [Manufacturer datasheet](https://download.tek.com/datasheet/datasheet_benchtop_psi9000dt_en.pdf). Existing Keithley 2220/2230 details remain on the power category page.
- Anritsu leads RF/spectrum category imagery using the existing sourced photograph.
- Microtest **5265N** replaces 5465 in featured products and application references. Frequency 10 Hz–200 kHz; 20 test channels; basic accuracy ±0.1%; 100 mA DC bias requires F5620. The manufacturer photograph is explicitly a 5260N family illustration. [Manufacturer specification table](https://www.microtest.com.tw/product_details.php?p_id=458).
- Keithley **DMM6500** and **DAQ6510** lead the meters category. DAQ6510 is described as a data acquisition/logging system; its capacity depends on optional modules. [DMM6500](https://www.tek.com/en/products/keithley/digital-multimeter/dmm6500-6-5-digit-multimeter), [DAQ6510](https://www.tek.com/en/products/keithley/digital-multimeter/keithley-daq6510).
- All 13 categories have individual range headings instead of the repeated product-count slogan.
- Relevant brand pages show the same curated products; all enquiry links carry the selected brand/model.

## Maintenance

Curated product data lives in `prototype/src/content/instrument-updates.ts`, applied by `content/index.ts` after loading extracted content. Re-extracting legacy HTML therefore cannot restore superseded cards. Original JSON remains intact. The migration audit allows only the specific approved replacements and separately verifies the relocated Keithley supply content and new product text.

Original photographs and URLs are recorded in `prototype/image-source/SOURCES.md`; generated WebP derivatives use `prototype/scripts/build-images.py`.
