# Tektronix MSO58B reference pack

Collected from Tektronix on 8 November 2026 to refine the existing 5 Series B model. The model remains a reference-based visualisation, rather than manufacturer CAD.

## Manufacturer sources

- [5 Series B product family](https://www.tek.com/en/products/oscilloscopes/5-series-mso)
- [5 Series B datasheet, 48W738510](https://download.tek.com/datasheet/5SeriesB-MSO_Datasheet_48W738510.pdf), downloaded as `datasheet.pdf`.
- [5 Series B Quick Start, 077172300 Rev B](https://download.tek.com/manual/5SeriesB-MSO_QuickStart_077172300_RevB.pdf), downloaded as `quick-start.pdf`.
- [Current specifications](https://www.tek.com/en/manual/oscilloscope/5-series-b-mso-specifications-and-performance-verification-5-series-mso).

The product HTML was blocked by the manufacturer's browser challenge. The official downloadable PDFs were accessible and supplied the photographs and diagrams used here.

| Local file | Manufacturer source | Used for |
|---|---|---|
| `controls-official.jpg` | Datasheet p9, embedded photograph | Keys, multipurpose knobs, trigger bank, two-column channel keys, vertical/horizontal groups |
| `rear-io-official.jpg` | Datasheet p27, embedded photograph | IEC inlet, three BNCs, LAN, stacked USB hosts, USB device and display ports |
| `datasheet-page-9.png` | Rendered datasheet p9 | Front control arrangement |
| `datasheet-page-27.png` | Rendered datasheet p27 | Connectivity photograph and labels |
| `rear-connections.png` | Quick Start PDF p26 | Rear connector diagram and purposes |
| `datasheet-cover.png` | Rendered cover | Whole-product silhouette and handle |

The cover's high-resolution artwork is also retained at `../../image-source/instruments/tektronix-5-series-b-official.jpg`. The four supplied front, angle, side and rear photographs in the workspace's `3d model references/` folder remain secondary references. No generated photograph was used to texture the new model.

## Configuration and UI facts

- MSO58B, 2 GHz configuration, eight FlexChannel inputs.
- Maximum real-time sample rate: 6.25 GS/s on all channels; 62.5 Mpoint standard record length. Resolution depends on acquisition mode and sample rate; the demo makes no claim of 12-bit acquisition at maximum sample rate.
- Each input accepts one analog signal or eight digital signals with an optional TLP058 logic probe, up to 64 digital inputs.
- 15.6-inch, 1920 × 1080 capacitive display.
- Front: two USB 2.0 hosts and one USB 3.0 host. Rear: two USB 2.0 hosts, two USB 3.0 hosts, one USB 3.0 device port, Gigabit LAN.
- Rear reference input: 10 MHz. AFG Out requires the optional generator. DisplayPort and DVI-D are described in current specifications. The older photograph also depicts VGA; it is modelled as pictured but not advertised as a guaranteed output of every revision.

Waveform presets and readouts are a labelled demonstration. The FFT is computed from the same sampled signal used for the time trace, with a Hann window. They do not acquire physical signals.
