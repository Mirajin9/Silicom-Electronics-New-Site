# -*- coding: utf-8 -*-
"""
generate-brand-pages.py
=======================
Generates one SEO-focused landing page per brand partner (brand-<slug>.html)
at the site root, plus a sitemap.xml and robots.txt.

Each page is written to rank organically for searches like
"<brand> distributor in India", "<brand> dealer India", "buy <brand> price"
and frames Silicom Electronics as the authorised India distributor offering
the best prices, stock and technical support.

Run:  python scripts/generate-brand-pages.py
"""

import html
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = "https://www.silicomindia.com"

# --------------------------------------------------------------------------
# Brand data. Each entry drives one landing page. Profiled brands (those with
# a company profile in uploads/) carry richer, sourced detail; the rest get
# strong category-tailored copy.
# --------------------------------------------------------------------------

BRANDS = [
    # ===================== INSTRUMENTS =====================
    {
        "slug": "tektronix",
        "name": "Tektronix",
        "logo": "assets/brand-logos/tektronix.png",
        "cat": "instruments",
        "cat_label": "Test & Measurement",
        "origin": "United States",
        "tagline": "Oscilloscopes, signal sources, SMUs and power instruments trusted by R&D and production labs worldwide.",
        "products": ["Oscilloscopes", "Arbitrary/Function Generators", "Source Measure Units", "Programmable Power Supplies", "Electronic Loads", "Digital Multimeters", "Battery Testers"],
        "about": [
            "Tektronix is one of the most recognised names in test and measurement, with a portfolio of oscilloscopes, arbitrary/function generators, source measure units, programmable power supplies, electronic loads and bench multimeters used across design verification, embedded development, power electronics and production test.",
            "From entry-level bench oscilloscopes for teaching labs to high-bandwidth mixed-signal instruments for serial-bus and power-integrity work, Tektronix instruments are a default choice for engineering teams that need dependable measurements and long-term calibration support.",
        ],
        "range": [
            ("Oscilloscopes", "2, 4 and 8-channel digital and mixed-signal oscilloscopes from teaching-lab bandwidths up to GHz-class instruments for high-speed serial and power-integrity debug."),
            ("Signal sources", "Arbitrary function generators (AFG) for stimulus, clocking and waveform replay during board bring-up and validation."),
            ("Source & power", "Source measure units (SMU), programmable DC power supplies, electronic loads and battery test instruments for power-electronics and device characterisation."),
            ("Bench DMMs & systems", "Precision digital multimeters and bench instruments that integrate into automated test stations."),
        ],
        "apps": ["Embedded & FPGA bring-up", "Power-electronics validation", "Serial-bus & signal-integrity debug", "EV & battery test", "University & research labs", "Production test stations"],
    },
    {
        "slug": "keithley",
        "name": "Keithley",
        "logo": "assets/brand-logos/keithley.png",
        "cat": "instruments",
        "cat_label": "Precision Measurement",
        "origin": "United States",
        "tagline": "Source measure units, electrometers and low-current instruments for semiconductor and advanced R&D measurement.",
        "products": ["Source Measure Units", "Electrometers", "Parameter Analyzers", "Low-Current Meters", "Nanovoltmeters"],
        "about": [
            "Keithley is the precision-measurement specialist for laboratories that work at the limits of current, voltage and resistance. Its source measure units (SMUs), electrometers, nanovoltmeters and semiconductor parameter analyzers are the reference tools for device characterisation, materials research and semiconductor I-V testing.",
            "Where a general-purpose DMM runs out of resolution, Keithley instruments deliver the femtoamp-class sourcing and measurement accuracy that R&D, university research groups and semiconductor labs depend on.",
        ],
        "range": [
            ("Source Measure Units", "Single and multi-channel SMUs for precise source-and-measure of current and voltage during device and component characterisation."),
            ("Electrometers & low current", "Electrometers, picoammeters and nanovoltmeters for ultra-low current and low-level voltage measurement."),
            ("Semiconductor test", "Parameter analyzers and switching systems for I-V, C-V and semiconductor device characterisation."),
        ],
        "apps": ["Semiconductor device test", "Materials & sensor research", "Low-current / leakage measurement", "University & national research labs", "Solar cell & LED characterisation"],
    },
    {
        "slug": "uni-t",
        "name": "UNI-T",
        "logo": "assets/brand-logos/uni-t.png",
        "cat": "instruments",
        "cat_label": "Test & Measurement",
        "origin": "China",
        "tagline": "Benchtop and handheld test & measurement for labs, QA stations and production lines.",
        "products": ["Oscilloscopes", "Digital Multimeters", "DC Power Supplies", "Electronic Loads", "Spectrum Analyzers", "Clamp Meters"],
        "about": [
            "UNI-T is one of the most widely deployed test-and-measurement brands in India, offering a broad, value-driven range of oscilloscopes, digital multimeters, clamp meters, programmable power supplies, electronic loads and spectrum analyzers.",
            "The portfolio is a practical fit for teaching labs, electronics manufacturing QA stations, service centres and R&D benches that need reliable instruments at an accessible price point — without compromising on the everyday measurements engineers rely on.",
        ],
        "range": [
            ("Oscilloscopes", "Digital storage oscilloscopes from basic 2-channel bench units to higher-bandwidth models for embedded and power work."),
            ("Handheld & bench meters", "Digital multimeters, clamp meters and process meters for the bench, the field and the production line."),
            ("Power & loads", "Programmable DC power supplies and electronic loads for design verification and burn-in."),
            ("RF & spectrum", "Spectrum analyzers and RF tools for basic signal and wireless measurement."),
        ],
        "apps": ["Teaching & training labs", "EMS / manufacturing QA", "Field & service maintenance", "R&D bench measurement", "Power & battery testing"],
    },
    {
        "slug": "scientific",
        "name": "Scientific",
        "logo": "assets/brand-logos/scientific.png",
        "cat": "instruments",
        "cat_label": "Test & Measurement (India)",
        "origin": "India",
        "tagline": "Indian-made test & measurement for institutional, PSU, education and production procurement.",
        "products": ["Oscilloscopes", "DC Power Supplies", "Digital Multimeters", "Hipot Testers", "Function Generators"],
        "about": [
            "Scientific (Scientific Mes-Technik) is a leading Indian test-and-measurement manufacturer, making it a natural fit for institutional, PSU, education and Make-in-India procurement where a domestic brand, local support and GeM availability matter.",
            "The range spans oscilloscopes, programmable power supplies, function generators, digital multimeters and electrical safety testers — a complete bench for engineering colleges, government labs and electronics production lines.",
        ],
        "range": [
            ("Oscilloscopes & generators", "Digital oscilloscopes and function/arbitrary generators for lab benches and teaching."),
            ("Power supplies", "Linear and programmable DC power supplies for design, test and education."),
            ("Meters & safety", "Bench digital multimeters and hipot / electrical-safety testers for QA and compliance."),
        ],
        "apps": ["Engineering colleges & ITIs", "PSU & government labs", "GeM procurement", "Electronics production test", "Make-in-India sourcing"],
    },
    {
        "slug": "microtest",
        "name": "Microtest",
        "logo": "assets/brand-logos/microtest.png",
        "cat": "instruments",
        "cat_label": "Production Test Systems",
        "origin": "Taiwan",
        "tagline": "Production-test specialist for LCR, hipot, transformer, motor, cable and power-analyzer systems.",
        "products": ["LCR Meters", "Hipot Testers", "Transformer Testers", "Motor Testers", "Cable/Harness Testers", "Power Analyzers"],
        "about": [
            "Microtest is a production-test specialist whose instruments are built for the manufacturing floor: LCR meters, hipot and electrical-safety analyzers, transformer and coil testers, motor testers, multi-pin cable/harness testers and power analyzers.",
            "For magnetics makers, wire-harness and USB-C cable producers, motor winding lines and high-volume electronics manufacturers, Microtest provides the fast, repeatable go/no-go measurements that keep a production line moving.",
        ],
        "range": [
            ("LCR & component test", "Benchtop and automated LCR meters for passive component and impedance measurement."),
            ("Transformer & coil", "Transformer/coil analyzers for turns ratio, leakage inductance and winding test."),
            ("Cable & harness", "Multi-pin cable, harness and USB-C / E-marker testers for connectivity and hipot screening."),
            ("Hipot, motor & power", "Electrical-safety (hipot) analyzers, motor testers and power analyzers for end-of-line test."),
        ],
        "apps": ["Transformer & magnetics manufacturing", "Cable & USB-C harness production", "Motor winding test", "Electrical-safety / hipot screening", "End-of-line production test"],
    },
    {
        "slug": "elektro-automatik",
        "name": "Elektro-Automatik",
        "logo": "assets/brand-logos/elektro-automatik.png",
        "cat": "instruments",
        "cat_label": "Programmable DC Power",
        "origin": "Germany",
        "tagline": "Programmable and bidirectional DC power supplies, regenerative electronic loads and grid-simulation.",
        "products": ["Programmable DC Power Supplies", "Bidirectional Supplies", "Regenerative Electronic Loads", "Grid Simulators"],
        "about": [
            "Elektro-Automatik (EA) is a German specialist in programmable DC power — high-power programmable supplies, bidirectional source-and-sink instruments and regenerative electronic loads that feed energy back to the grid instead of dissipating it as heat.",
            "EA instruments are the backbone of EV, battery, fuel-cell, solar-inverter and power-converter test benches, where engineers need autoranging power, fast transient response and energy-recovering loads to test efficiently and sustainably.",
        ],
        "range": [
            ("Programmable DC supplies", "High-power autoranging programmable DC power supplies for converter, battery and component test."),
            ("Bidirectional source/sink", "Two-quadrant instruments that source and sink power for battery cycling and charge/discharge profiles."),
            ("Regenerative loads", "Electronic loads that return absorbed energy to the mains for efficient, low-heat high-power testing."),
            ("Grid & PV simulation", "Function generators and software for grid and photovoltaic profile emulation."),
        ],
        "apps": ["EV & battery test", "Solar inverter & PV simulation", "Fuel cell & energy storage", "Power-converter validation", "Regenerative high-power loading"],
    },
    {
        "slug": "anritsu",
        "name": "Anritsu",
        "logo": "assets/brand-logos/anritsu.svg",
        "cat": "instruments",
        "cat_label": "RF & Telecom Test",
        "origin": "Japan",
        "tagline": "RF, microwave, telecom and field test for signal, cable and antenna validation.",
        "products": ["Spectrum Analyzers", "Vector Network Analyzers", "Cable & Antenna Analyzers", "Signal Generators", "Field Test"],
        "about": [
            "Anritsu is a global leader in RF, microwave and telecom test, with spectrum analyzers, vector network analyzers, signal generators and the field-proven cable & antenna analyzers used to commission and maintain wireless infrastructure.",
            "From 5G and telecom to defence, aerospace and field installation, Anritsu instruments give RF engineers and field technicians the signal, spectrum, cable and antenna measurements they need with handheld portability and lab-grade accuracy.",
        ],
        "range": [
            ("Spectrum & signal analysis", "Benchtop and handheld spectrum analyzers for interference hunting and signal characterisation."),
            ("Vector network analysis", "VNAs for S-parameter, component and material measurement."),
            ("Cable & antenna", "Site Master-class cable and antenna analyzers for tower and feeder commissioning."),
            ("Field & telecom test", "Portable field instruments for installation, maintenance and network validation."),
        ],
        "apps": ["5G & telecom infrastructure", "Cable & antenna commissioning", "RF component & material test", "Defence & aerospace", "Field installation & maintenance"],
    },
    {
        "slug": "metrix",
        "name": "Metrix",
        "logo": "assets/brand-logos/metrix.png",
        "cat": "instruments",
        "cat_label": "Portable Electrical Test",
        "origin": "France",
        "tagline": "Portable electrical measurement tools for field, panel and maintenance teams.",
        "products": ["Digital Multimeters", "Clamp Meters", "Portable Oscilloscopes", "Electrical Testers"],
        "about": [
            "Metrix (part of the Chauvin Arnoux group) builds rugged portable electrical instruments — digital multimeters, clamp meters and portable scopes — designed for field engineers, panel builders and electrical maintenance teams.",
            "Where measurements happen on-site rather than on a bench, Metrix instruments deliver dependable, safety-rated electrical measurement for installation, fault-finding and routine maintenance work.",
        ],
        "range": [
            ("Multimeters & clamps", "Handheld digital multimeters and clamp meters for electrical maintenance and fault diagnosis."),
            ("Portable scopes", "Field-ready portable oscilloscopes for signal checks outside the lab."),
            ("Electrical testers", "Safety-rated instruments for installation and maintenance test."),
        ],
        "apps": ["Field electrical maintenance", "Panel building & switchgear", "Installation testing", "Industrial fault-finding", "Service & repair"],
    },
    {
        "slug": "rishabh",
        "name": "Rishabh",
        "logo": "assets/brand-logos/rishabh.png",
        "cat": "instruments",
        "cat_label": "Electrical Measurement (India)",
        "origin": "India",
        "tagline": "Indian electrical test, panel instrumentation and industrial measurement instruments.",
        "products": ["Digital Multimeters", "Insulation Testers", "Panel Meters", "Clamp Meters", "Electrical Testers"],
        "about": [
            "Rishabh Instruments is an established Indian manufacturer of electrical test and measurement equipment — digital multimeters, insulation testers, clamp meters and panel instrumentation used across power, industrial and electrical-maintenance applications.",
            "As a domestic brand with wide availability and local support, Rishabh is a strong choice for utilities, panel builders, electrical contractors and Make-in-India procurement on GeM and beyond.",
        ],
        "range": [
            ("Test instruments", "Digital multimeters, clamp meters and insulation/continuity testers for electrical work."),
            ("Panel instrumentation", "Analog and digital panel meters and measurement devices for switchboards and panels."),
            ("Industrial measurement", "Electrical measurement tools for utilities and industrial maintenance."),
        ],
        "apps": ["Utilities & power distribution", "Panel & switchgear building", "Electrical contracting", "Industrial maintenance", "GeM / Make-in-India sourcing"],
    },

    # ===================== COMPONENTS =====================
    {
        "slug": "asemi",
        "name": "ASEMI (ASM)",
        "logo": "assets/brand-logos/asemi-asm.png",
        "cat": "components",
        "cat_label": "Diodes & Bridge Rectifiers",
        "origin": "Ningbo, China",
        "tagline": "SMD/DIP diodes and bridge rectifiers for lighting, power supply, new-energy and consumer electronics.",
        "products": ["SMD Diodes", "DIP Diodes", "SMD Bridges", "DIP Bridges", "Schottky Diodes", "Fast Recovery Diodes", "TVS", "Low-VF Bridges", "Small Signal"],
        "about": [
            "ASEMI (Ningbo Asemi Electronic Co.) is a dedicated diode and bridge-rectifier manufacturer. Its sales company is based in Ningbo with manufacturing in Luzhou, Sichuan, employing over 500 people including 100+ technical staff. ASEMI designs, manufactures and sells its own-brand semiconductor devices and also offers OEM/ODM packaging.",
            "The product line covers axial-lead (DIP) diodes, SMD diodes, TO/ITO power diodes, bridge rectifiers, small-signal devices, Schottky and fast-recovery diodes, low-VF bridges and TVS. Quality is backed by ISO 9001 and ISO 14001 systems, with products SGS-tested and compliant to RoHS and REACH.",
        ],
        "range": [
            ("Bridge rectifiers", "SMD and DIP bridge rectifiers including high-efficiency low-VF bridges for compact, efficient input stages."),
            ("Power diodes", "Fast-recovery diodes, Schottky power diodes and TO/ITO packaged power diodes."),
            ("SMD diodes", "Surface-mount Schottky, fast-recovery and low-VF diodes for space-constrained boards."),
            ("Small signal & protection", "Small-signal diodes (SOT-23, SOD-123/323) and TVS for protection."),
        ],
        "apps": ["LED lighting drivers", "SMPS & adapters", "Mobile chargers", "New-energy & automotive", "Consumer electronics"],
    },
    {
        "slug": "jilin-sino",
        "name": "Jilin Sino",
        "logo": "assets/brand-logos/jilin-sino.png",
        "cat": "components",
        "cat_label": "Power Semiconductors",
        "origin": "Jilin, China",
        "tagline": "Full-range power semiconductors — MOSFETs, IGBTs, SiC, Schottky, TVS and diodes for 5G, SMPS, EV and battery management.",
        "products": ["MOSFETs", "IGBT", "SiC SBD", "GaN", "Schottky (SBD)", "FRD", "SCR", "BJT", "Zener", "TVS", "IPM", "LED IC"],
        "about": [
            "Jilin Sino-Microelectronics Co., Ltd (Shanghai Stock Exchange: 600360) is a leading Chinese power-semiconductor manufacturer. Founded as a Jilin semiconductor factory in 1965 and listed in 2001, it was the first listed company in China's power-device industry, with decades of process technology, a CNAS-certified lab and consistent China Top-10 power-semiconductor rankings.",
            "Jilin Sino covers virtually the entire power-device spectrum: MOSFETs (Planar, Super-Junction, Trench & CCT, 40–1500 V), IGBTs (360–1350 V), GaN 650 V, SiC Schottky (650–1200 V), Schottky SBD (30–240 V), FRD (200–1700 V), SCR, BJT, Zener, TVS, IPM modules and LED driver ICs — all under quality systems including IATF 16949, ISO 9001/14001/45001 with AEC-Q101 and JEDEC capability.",
        ],
        "range": [
            ("MOSFETs", "40–1500 V Planar, Super-Junction and Trench/CCT MOSFETs with high-EAS, low conduction and switching loss."),
            ("IGBT & IPM", "Trench-FS IGBTs (360–1350 V) and intelligent power modules with built-in protection and bootstrap."),
            ("SiC & GaN", "SiC Schottky (650–1200 V) and GaN 650 V wide-bandgap devices for high-efficiency switching."),
            ("Diodes & protection", "Schottky SBD, fast-recovery diodes, Zener, SCR, BJT and TVS for the full power and protection path."),
        ],
        "apps": ["5G & communications", "SMPS & adapters", "Battery management", "Automotive & EV", "PV & frequency conversion", "Smart meters"],
    },
    {
        "slug": "shikues",
        "name": "Shikues",
        "logo": "assets/brand-logos/shikues.png",
        "cat": "components",
        "cat_label": "Wide-Bandgap Power & Sensors",
        "origin": "China",
        "tagline": "SiC and GaN wide-bandgap power devices and intelligent sensors for EV, data-centre and smart-grid power systems.",
        "products": ["SiC Diodes", "SiC MOSFETs", "GaN", "PWM ICs", "IGBT", "Intelligent Sensors"],
        "about": [
            "Shikues is a wide-bandgap power and intelligent-sensor manufacturer for which Silicom Electronics is the appointed India principal. Its focus is SiC and GaN devices for the critical power systems behind EVs, data centres, traction inverters and smart grids.",
            "Beyond power switches and SiC diodes — which raise efficiency and, thanks to high voltage tolerance, help shrink PCB size — Shikues also supplies intelligent sensors for applications such as temperature controllers, pressure sensors, WLAN and Bluetooth devices, fingerprint door locks, intelligent gateways and robotic appliances.",
        ],
        "range": [
            ("SiC diodes", "Silicon-carbide Schottky diodes with high voltage tolerance for efficient, compact power stages."),
            ("SiC & GaN switches", "Wide-bandgap MOSFETs and GaN devices for high-frequency, high-efficiency conversion."),
            ("PWM & IGBT", "PWM controllers and IGBTs for the switching power path."),
            ("Intelligent sensors", "Sensor devices for temperature, pressure, connectivity and smart-home applications."),
        ],
        "apps": ["EV & traction inverters", "Data-centre power", "Smart grid & critical power", "Solar inverters", "Smart-home & sensing"],
    },
    {
        "slug": "donghai-wxdh",
        "name": "Donghai / WXDH",
        "logo": "assets/brand-logos/donghai-wxdh.png",
        "cat": "components",
        "cat_label": "MOSFETs, IGBT & Driver ICs",
        "origin": "Jiangsu, China",
        "tagline": "Intelligent-control semiconductors — Trench, SGT and Cool MOSFETs, SiC MOS, IGBTs and modules.",
        "products": ["Trench MOSFET", "SGT MOSFET", "Cool MOS", "SiC MOSFET", "IGBT", "IGBT Modules", "Driver ICs"],
        "about": [
            "Jiangsu DongHai Semiconductor Co., Ltd — brand WXDH — has manufactured power MOSFETs since 2008 and added IGBTs in 2015. It runs ISO 9001, ISO 14001 and IATF 16949 (automotive) quality systems with RoHS-compliant products, backed by a full reliability test and assembly capability.",
            "The portfolio spans Trench MOS (20–200 V), SGT MOS, Cool MOS (500–900 V), SiC MOS (650–1200 V) and Low-VF devices, plus Trench IGBTs and IGBT modules (600–1200 V, 200–1500 V) and gate-driver ICs — packaged across DFN, QFN, TO-220/247/263, SOT and more.",
        ],
        "range": [
            ("Trench & SGT MOSFETs", "Low-voltage Trench (20–200 V) and SGT MOSFETs for efficient switching and synchronous rectification."),
            ("Cool MOS & SiC MOS", "High-voltage Cool MOS (500–900 V) and SiC MOSFETs (650–1200 V) for high-efficiency power conversion."),
            ("IGBT & modules", "Trench IGBTs and IGBT modules (600–1200 V) for motor drive and high-power switching."),
            ("Driver ICs", "Gate-driver ICs to complete the power-stage design."),
        ],
        "apps": ["Solar inverters", "EV & chargers", "Motor drives & BLDC", "Industrial power", "Appliances & white goods"],
    },
    {
        "slug": "mot-inmark",
        "name": "MOT Inmark",
        "logo": "assets/brand-logos/mot-inmark.png",
        "cat": "components",
        "cat_label": "MOSFETs & Rectifiers",
        "origin": "China",
        "tagline": "Trench and high-voltage MOSFETs, rectifiers and SiC diodes with application engineering support.",
        "products": ["Trench MOSFET", "High-Voltage MOSFET", "Rectifiers", "SiC Diodes"],
        "about": [
            "MOT Inmark supplies power MOSFETs, rectifiers and SiC diodes for power-conversion designs, with application engineering support to help select the right device for the switching, thermal and efficiency targets of a board.",
            "The line covers trench MOSFETs, high-voltage MOSFETs, rectifiers and silicon-carbide diodes — a practical building set for adapters, LED drivers, SMPS, solar and EV-charger power stages.",
        ],
        "range": [
            ("Trench MOSFETs", "Low- and mid-voltage trench MOSFETs for synchronous rectification and switching."),
            ("High-voltage MOSFETs", "HV MOSFETs for the primary switch in SMPS, adapters and chargers."),
            ("Rectifiers & SiC diodes", "Fast rectifiers and SiC Schottky diodes for efficient output and boost stages."),
        ],
        "apps": ["SMPS & adapters", "LED lighting", "Solar inverters", "EV chargers", "Industrial power"],
    },
    {
        "slug": "reasunos",
        "name": "Reasunos",
        "logo": "assets/brand-logos/reasunos.png",
        "cat": "components",
        "cat_label": "Cool MOS, SiC & Protection",
        "origin": "China",
        "tagline": "Cool MOS, SiC MOSFETs, high-voltage devices, TVS and power-boosting ICs.",
        "products": ["Cool MOS", "SiC MOSFETs", "High-Voltage Devices", "TVS", "Power ICs"],
        "about": [
            "Reasunos focuses on high-efficiency power switching — superjunction Cool MOS, SiC MOSFETs and high-voltage devices — alongside TVS protection and power-boosting ICs for modern converter and charger designs.",
            "The combination of efficient HV switches and on-board protection makes Reasunos a useful single source for the primary stage of SMPS, GaN/USB-PD chargers, LED drivers and solar-inverter power paths.",
        ],
        "range": [
            ("Cool MOS / superjunction", "High-voltage superjunction MOSFETs for low-loss primary switching."),
            ("SiC MOSFETs", "Silicon-carbide MOSFETs for high-frequency, high-efficiency conversion."),
            ("TVS & power ICs", "TVS protection devices and power-boosting ICs to complete the design."),
        ],
        "apps": ["SMPS & adapters", "Mobile / GaN chargers", "LED lighting", "Solar inverters", "Smart meters"],
    },
    {
        "slug": "surging",
        "name": "Surging",
        "logo": "assets/brand-logos/surging.png",
        "cat": "components",
        "cat_label": "Circuit Protection",
        "origin": "China",
        "tagline": "Over-voltage and over-current protection — MOVs and zinc-oxide varistors.",
        "products": ["MOV", "ZOV Varistors", "Over-voltage Protection", "Over-current Protection"],
        "about": [
            "Surging specialises in circuit-protection components — metal-oxide varistors (MOV) and zinc-oxide varistors (ZOV) that clamp surges and protect electronics from over-voltage and transient events.",
            "For designs exposed to mains transients, lightning-induced surges or outdoor conditions — LED street lighting, smart meters, solar strings and EV chargers — Surging varistors are the front-line protection that keeps boards alive.",
        ],
        "range": [
            ("Metal-oxide varistors", "MOV / ZOV varistors across a wide range of clamping voltages and energy ratings."),
            ("Surge protection", "Components for mains, DC-string and outdoor surge protection."),
        ],
        "apps": ["LED street & outdoor lighting", "Smart meters", "Solar strings", "EV chargers", "Appliances & power inputs"],
    },
    {
        "slug": "adler",
        "name": "Adler EV",
        "logo": "assets/brand-logos/adler.png",
        "cat": "components",
        "cat_label": "Fuses & EV Protection",
        "origin": "International",
        "tagline": "EV fuses, PV/solar fuses, low-voltage block fuses and EV charging protection.",
        "products": ["EV Fuses", "PV / Solar Fuses", "Low-Voltage Block Fuses", "EV Charging Equipment", "Circuit Protection"],
        "about": [
            "Adler is a circuit-protection and fuse specialist for the energy-transition market — EV powertrain and charging fuses, photovoltaic (PV) / solar string fuses and low-voltage block (NH/blade) fuses that protect high-current DC and AC paths.",
            "As EV charging infrastructure and solar installations scale across India, Adler's fuse and protection range gives system designers reliable, correctly-rated over-current protection for batteries, chargers, inverters and PV strings.",
        ],
        "range": [
            ("EV fuses", "High-current DC fuses for EV battery, powertrain and on-board charger protection."),
            ("PV / solar fuses", "String and array fuses rated for photovoltaic DC conditions."),
            ("Low-voltage block fuses", "NH / blade and block fuses for industrial and distribution protection."),
            ("EV charging protection", "Protection components for AC and DC EV charging equipment."),
        ],
        "apps": ["EV battery & powertrain", "EV charging (AC/DC)", "Solar PV strings", "Energy storage", "Industrial distribution"],
    },
    {
        "slug": "mlcc-base",
        "name": "MLCC Base",
        "logo": "assets/brand-logos/mlcc-base.png",
        "cat": "components",
        "cat_label": "Passive Components",
        "origin": "China",
        "tagline": "MLCC capacitors, chip resistors and SMD passives for high-volume manufacturing.",
        "products": ["MLCC", "Chip Resistors", "Capacitors", "SMD Passives"],
        "about": [
            "MLCC Base supplies the passive backbone of every electronic board — multilayer ceramic capacitors (MLCC), chip resistors and SMD passive components — in the volumes and consistency that high-throughput EMS and OEM lines require.",
            "For manufacturers building chargers, lighting, meters, appliances and consumer electronics, MLCC Base is a dependable source for the everyday passives that dominate a bill of materials by line-item count.",
        ],
        "range": [
            ("MLCC capacitors", "Multilayer ceramic capacitors across standard case sizes, dielectrics and voltage ratings."),
            ("Chip resistors", "Thick-film SMD resistors for general-purpose and high-volume use."),
            ("SMD passives", "Capacitors and passive components for surface-mount assembly."),
        ],
        "apps": ["Mobile chargers", "LED lighting", "Smart meters", "Consumer electronics", "High-volume EMS / OEM"],
    },
    {
        "slug": "cdil",
        "name": "CDIL",
        "logo": None,  # tile uses a text wordmark; no logo file
        "cat": "components",
        "cat_label": "Semiconductors (India)",
        "origin": "India",
        "tagline": "Continental Devices India — diodes, transistors, MOSFETs, BLDC drivers, TVS and modules.",
        "products": ["Diodes", "Transistors", "MOSFETs", "BLDC Drivers", "TVS", "Modules"],
        "about": [
            "CDIL (Continental Devices India Ltd.) is one of India's pioneering semiconductor manufacturers, producing discrete diodes, transistors, MOSFETs, BLDC motor-driver devices, TVS and power modules with decades of domestic manufacturing heritage.",
            "As an Indian-made semiconductor source, CDIL is well suited to Make-in-India BOMs, appliance and BLDC motor-control designs, and customers who value local manufacturing, supply security and support.",
        ],
        "range": [
            ("Discrete diodes & transistors", "General-purpose and switching diodes and bipolar transistors."),
            ("MOSFETs & BLDC drivers", "MOSFETs and BLDC motor-driver devices for fans, pumps and appliances."),
            ("Protection & modules", "TVS protection devices and power modules."),
        ],
        "apps": ["BLDC fans & appliances", "Motor control", "Consumer electronics", "Make-in-India BOMs", "General-purpose switching"],
    },
]

# Map logo filename used in brands.html tiles -> slug (for the link-injection pass).
# brands.html references uni-t.jpg even though the asset on disk is uni-t.png.
TILE_LOGO_TO_SLUG = {
    "tektronix.png": "tektronix",
    "microtest.png": "microtest",
    "uni-t.jpg": "uni-t",
    "uni-t.png": "uni-t",
    "scientific.png": "scientific",
    "keithley.png": "keithley",
    "elektro-automatik.png": "elektro-automatik",
    "anritsu.svg": "anritsu",
    "metrix.png": "metrix",
    "rishabh.png": "rishabh",
    "asemi-asm.png": "asemi",
    "donghai-wxdh.png": "donghai-wxdh",
    "jilin-sino.png": "jilin-sino",
    "shikues.png": "shikues",
    "mot-inmark.png": "mot-inmark",
    "reasunos.png": "reasunos",
    "surging.png": "surging",
    "adler.png": "adler",
    "mlcc-base.png": "mlcc-base",
}

BY_SLUG = {b["slug"]: b for b in BRANDS}


# --------------------------------------------------------------------------
# Copy helpers
# --------------------------------------------------------------------------

def e(s):
    return html.escape(s, quote=True)


def make_faqs(b):
    """Build SEO-rich, India-distributor-framed FAQs for a brand."""
    name = b["name"]
    cat = "test & measurement instruments" if b["cat"] == "instruments" else "electronic components"
    return [
        (f"Who is the authorised {name} distributor in India?",
         f"Silicom Electronics Pvt. Ltd. is an authorised distribution partner for {name} in India. Operating since 1994 from New Delhi, we supply {name} {cat} pan-India with genuine products, technical support and competitive pricing. Share your requirement or BOM and our team will respond with availability and the best price."),
        (f"What is the price of {name} products in India?",
         f"Silicom Electronics offers the best prices on {name} in India by sourcing directly as an authorised partner — removing extra margins from the chain. Pricing depends on the exact part numbers and quantities, so send us your model list or BOM and we will share a sharp, current quotation."),
        (f"Does Silicom Electronics stock {name} in India?",
         f"Yes. We hold and source {name} stock for Indian customers and support both prototype quantities and high-volume production schedules with reliable lead times and pan-India delivery from New Delhi."),
        (f"How do I buy {name} {('instruments' if b['cat']=='instruments' else 'components')} in India?",
         f"Simply contact Silicom Electronics with the {name} part numbers or your application. We will confirm availability, pricing and lead time, provide datasheets and technical guidance, and arrange delivery anywhere in India. GeM and institutional procurement are supported."),
    ]


def related_brands(b, n=4):
    same = [x for x in BRANDS if x["cat"] == b["cat"] and x["slug"] != b["slug"]]
    return same[:n]


# --------------------------------------------------------------------------
# HTML template
# --------------------------------------------------------------------------

NAV = """<div class="nav-shell">
  <nav class="nav" aria-label="Primary">
    <a class="nav-brand" href="index.html">
      <span class="nav-brand-mark"></span>
      <span>Silicom <span style="color:var(--ink-3);font-weight:500">Electronics</span></span>
    </a>
    <ul class="nav-links">
      <li class="nav-item"><a class="nav-link" data-route="index.html" href="index.html">Home</a></li>
      <li class="nav-item"><a class="nav-link" data-route="instruments.html" href="instruments.html">Instruments</a></li>
      <li class="nav-item"><a class="nav-link" data-route="components.html" href="components.html">Components</a></li>
      <li class="nav-item"><a class="nav-link active" data-route="brands.html" href="brands.html">Brands</a></li>
      <li class="nav-item"><a class="nav-link" data-route="about.html" href="about.html">About</a></li>
    </ul>
    <button class="nav-theme-toggle" aria-label="Toggle theme"></button>
    <a class="nav-cta" href="contact.html">
      Get in touch
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </a>
  </nav>
</div>"""

FOOTER = """<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="nav-brand" style="margin-bottom:14px">
          <span class="nav-brand-mark"></span>
          <span>Silicom <span style="color:var(--ink-3);font-weight:500">Electronics</span></span>
        </div>
        <p class="muted" style="font-size:13.5px;max-width:34ch">Trusted partner in components and test &amp; measurement equipment supply, since 1994.</p>
        <div style="display:flex;gap:8px;margin-top:14px">
          <span class="chip">ISO 9001:2015</span>
          <span class="chip">GeM Assessed</span>
        </div>
      </div>
      <div><h4>Instruments</h4><ul>
        <li><a href="instruments.html#oscilloscopes">Oscilloscopes</a></li>
        <li><a href="instruments.html#power">Power &amp; Loads</a></li>
        <li><a href="instruments.html#rf">RF &amp; Spectrum</a></li>
        <li><a href="instruments.html#production">Production Test</a></li>
      </ul></div>
      <div><h4>Components</h4><ul>
        <li><a href="components.html#mosfets">MOSFETs &amp; SiC</a></li>
        <li><a href="components.html#diodes">Diodes</a></li>
        <li><a href="components.html#protection">Protection</a></li>
        <li><a href="components.html#passives">Passives</a></li>
      </ul></div>
      <div><h4>Company</h4><ul>
        <li><a href="about.html">About</a></li>
        <li><a href="brands.html">Brand partners</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="mailto:info@silicomindia.com">info@silicomindia.com</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 1994–2026 Silicom Electronics Pvt. Ltd. All rights reserved.</span>
      <span>C-26 DSIDC Complex, Kirti Nagar, New Delhi 110015</span>
    </div>
  </div>
</footer>"""


def logo_block(b, big=False):
    if b["logo"]:
        size = 'width:120px;height:74px' if big else ''
        return f'<img src="{e(b["logo"])}" alt="{e(b["name"])} logo" style="{size}" />'
    # text wordmark fallback (CDIL)
    return f'<div class="brand-logo-accent" style="font-weight:800;font-size:30px;color:var(--accent-ink)">{e(b["name"])}</div>'


def build_page(b):
    name = b["name"]
    slug = b["slug"]
    url = f"{SITE}/brand-{slug}.html"
    cat_word = "Test & Measurement Equipment" if b["cat"] == "instruments" else "Electronic Components"
    noun = "instruments" if b["cat"] == "instruments" else "components"

    title = f"{name} Distributor in India | Best Price — Silicom Electronics"
    meta_desc = (f"{name} authorised distributor in India. Silicom Electronics supplies genuine {name} "
                 f"{noun} ({', '.join(b['products'][:4])}) at the best price, with stock, technical support and "
                 f"pan-India delivery. Since 1994. Get a quote.")
    keywords = ", ".join([
        f"{name} distributor India", f"{name} dealer India", f"{name} supplier India",
        f"{name} price India", f"buy {name} India", f"{name} authorised distributor",
        f"{name} {noun}", "Silicom Electronics",
    ])

    faqs = make_faqs(b)
    rel = related_brands(b)

    # ---- JSON-LD ----
    breadcrumb_ld = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": f"{SITE}/index.html"},
            {"@type": "ListItem", "position": 2, "name": "Brand Partners", "item": f"{SITE}/brands.html"},
            {"@type": "ListItem", "position": 3, "name": name, "item": url},
        ],
    }
    faq_ld = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": a}}
            for q, a in faqs
        ],
    }
    product_ld = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": f"{name} {cat_word}",
        "brand": {"@type": "Brand", "name": name},
        "category": b["cat_label"],
        "description": f"{name} {noun} distributed in India by Silicom Electronics — {b['tagline']}",
        "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "Silicom Electronics Pvt. Ltd.",
                "url": SITE,
                "telephone": "+91-11-45544191",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "C-26, DSIDC Complex, Kirti Nagar",
                    "addressLocality": "New Delhi",
                    "postalCode": "110015",
                    "addressCountry": "IN",
                },
            },
        },
    }

    import json
    ld_blocks = "\n".join(
        f'<script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>'
        for x in (breadcrumb_ld, product_ld, faq_ld)
    )

    # ---- body sections ----
    products_chips = "".join(f'<span class="chip">{e(p)}</span>' for p in b["products"])
    about_paras = "\n      ".join(f'<p class="lede" style="font-size:16px">{e(p)}</p>' for p in b["about"])

    range_rows = "\n".join(
        f"""        <div class="app-cov-row" style="display:grid;grid-template-columns:minmax(160px,210px) 1fr;gap:18px;padding:16px 0;border-bottom:1px solid var(--hairline);align-items:center">
          <div><div class="wordmark" style="font-size:17px">{e(h)}</div></div>
          <div class="muted" style="font-size:14px">{e(d)}</div>
        </div>"""
        for h, d in b["range"]
    )

    apps_chips = "".join(f'<span class="chip">{e(a)}</span>' for a in b["apps"])

    faq_html = "\n".join(
        f"""        <details class="faq-item glass-soft">
          <summary>{e(q)}</summary>
          <div class="faq-body muted">{e(a)}</div>
        </details>"""
        for q, a in faqs
    )

    rel_html = "".join(
        f"""<a class="rel-brand glass-soft" href="brand-{r['slug']}.html">
          <span class="wordmark" style="font-size:16px">{e(r['name'])}</span>
          <span class="muted" style="font-size:12.5px">{e(r['cat_label'])}</span>
        </a>"""
        for r in rel
    )

    page = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="{e(meta_desc)}" />
<meta name="keywords" content="{e(keywords)}" />
<meta name="author" content="Silicom Electronics Pvt. Ltd." />
<meta name="robots" content="index, follow" />
<meta name="theme-color" content="#06b6d4" />
<link rel="canonical" href="{e(url)}" />
<link rel="icon" type="image/png" href="assets/silicom-logo-mark.png" />
<link rel="apple-touch-icon" href="assets/silicom-logo-mark.png" />
<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Silicom Electronics" />
<meta property="og:title" content="{e(name)} Distributor in India — Best Price | Silicom Electronics" />
<meta property="og:description" content="{e(meta_desc)}" />
<meta property="og:url" content="{e(url)}" />
<meta property="og:image" content="{SITE}/assets/silicom-logo-full.png" />
<meta name="twitter:card" content="summary_large_image" />
<title>{e(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Inter+Tight:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="styles.css" />
<style>
  :root {{ --font-display: "Inter Tight", "Inter", system-ui, sans-serif; }}
  .brand-breadcrumb {{ font-size:12.5px; color:var(--ink-3); display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:6px; }}
  .brand-breadcrumb a {{ color:var(--ink-3); }}
  .brand-breadcrumb a:hover {{ color:var(--accent-ink); }}
  .brand-hero-logo {{
    display:flex; align-items:center; justify-content:center;
    padding:22px 28px; border-radius:var(--r-lg);
    background:rgba(255,255,255,0.86); border:1px solid var(--glass-border);
    width:fit-content;
  }}
  .brand-hero-logo img {{ object-fit:contain; }}
  .value-grid {{ display:grid; grid-template-columns:repeat(3,1fr); gap:var(--gap-grid); }}
  .value-card {{ padding:var(--pad-card); border-radius:var(--r-lg); display:grid; gap:8px; }}
  .value-card .vc-icon {{ width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,var(--accent),var(--accent-2));color:#fff;font-weight:800; }}
  .faq-item {{ border-radius:var(--r-md); padding:0 18px; overflow:hidden; }}
  .faq-item + .faq-item {{ margin-top:10px; }}
  .faq-item summary {{ cursor:pointer; padding:16px 0; font-weight:600; font-size:15px; list-style:none;
    display:flex; justify-content:space-between; align-items:center; gap:12px; color:var(--ink-1); }}
  .faq-item summary::-webkit-details-marker {{ display:none; }}
  .faq-item summary::after {{ content:"+"; font-size:20px; color:var(--accent-ink); flex-shrink:0; }}
  .faq-item[open] summary::after {{ content:"–"; }}
  .faq-body {{ padding:0 0 18px; font-size:14px; line-height:1.65; }}
  .rel-brands {{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }}
  .rel-brand {{ padding:18px; border-radius:var(--r-md); display:grid; gap:4px; transition:transform .2s ease; }}
  .rel-brand:hover {{ transform:translateY(-3px); }}
  @media (max-width:900px) {{ .value-grid {{ grid-template-columns:1fr; }} .rel-brands {{ grid-template-columns:1fr 1fr; }} }}
  @media (max-width:640px) {{ .rel-brands {{ grid-template-columns:1fr; }} }}
</style>
{ld_blocks}
</head>
<body data-screen-label="{e(name)}">

<div class="bg-mesh"></div>

{NAV}

<section class="hero">
  <div class="container hero-split">
    <div class="hero-stack">
      <nav class="brand-breadcrumb reveal" aria-label="Breadcrumb">
        <a href="index.html">Home</a> <span>/</span>
        <a href="brands.html">Brands</a> <span>/</span>
        <span>{e(name)}</span>
      </nav>
      <div class="reveal">
        <span class="hero-tag">
          <span class="hero-tag-badge">{e(b['cat_label'].upper())}</span>
          Authorised {e(name)} distributor in India
        </span>
      </div>
      <h1 class="h1 reveal" style="max-width:20ch">
        <span class="hero-grad">{e(name)}</span> distributor in India — best price &amp; support.
      </h1>
      <p class="lede reveal">{e(b['tagline'])} Silicom Electronics supplies genuine {e(name)} {noun} pan-India with stock, sharp pricing and engineering support — since 1994.</p>
      <div class="hero-actions reveal">
        <a class="btn btn-primary btn-arrow" href="contact.html">
          Get the best {e(name)} price
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <a class="btn btn-ghost" href="mailto:info@silicomindia.com">Email a BOM / enquiry</a>
      </div>
      <div class="reveal" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:14px">{products_chips}</div>
    </div>
    <div class="reveal" style="display:grid;gap:16px;align-content:start">
      <div class="brand-hero-logo">{logo_block(b, big=True)}</div>
      <div class="glass-soft" style="padding:18px;border-radius:var(--r-lg);display:grid;gap:6px">
        <div class="eyebrow"><span class="dot"></span>At a glance</div>
        <div class="muted" style="font-size:13.5px"><strong style="color:var(--ink-1)">Category:</strong> {e(b['cat_label'])}</div>
        <div class="muted" style="font-size:13.5px"><strong style="color:var(--ink-1)">Origin:</strong> {e(b['origin'])}</div>
        <div class="muted" style="font-size:13.5px"><strong style="color:var(--ink-1)">India distributor:</strong> Silicom Electronics</div>
      </div>
    </div>
  </div>
</section>

<!-- ABOUT -->
<section class="section-tight">
  <div class="container">
    <div class="section-head reveal">
      <div>
        <div class="eyebrow"><span class="dot"></span>About {e(name)}</div>
        <h2 class="h2" style="margin-top:12px;max-width:24ch">Genuine {e(name)} {noun}, sourced and supported in India.</h2>
      </div>
    </div>
    <div class="glass reveal" style="padding:var(--pad-card-lg);border-radius:var(--r-xl);display:grid;gap:16px;max-width:80ch">
      {about_paras}
    </div>
  </div>
</section>

<!-- PRODUCT RANGE -->
<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <div>
        <div class="eyebrow"><span class="dot"></span>Product range</div>
        <h2 class="h2" style="margin-top:12px">The {e(name)} portfolio we supply in India.</h2>
        <p class="muted" style="font-size:14.5px;max-width:60ch;margin-top:10px">Tell us the part numbers or the application — we'll match the right {e(name)} {noun} and quote the best price.</p>
      </div>
    </div>
    <div class="application-coverage glass-soft reveal" style="padding:var(--pad-card-lg);border-radius:var(--r-xl);display:grid;gap:2px">
{range_rows}
    </div>
  </div>
</section>

<!-- APPLICATIONS -->
<section class="section-tight">
  <div class="container">
    <div class="glass reveal" style="padding:var(--pad-card-lg);border-radius:var(--r-xl);display:grid;gap:14px">
      <div class="eyebrow"><span class="dot"></span>Applications</div>
      <h2 class="h2" style="max-width:26ch">Where engineers in India use {e(name)}.</h2>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px">{apps_chips}</div>
    </div>
  </div>
</section>

<!-- WHY SILICOM -->
<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <div>
        <div class="eyebrow"><span class="dot"></span>Why source {e(name)} from Silicom</div>
        <h2 class="h2" style="margin-top:12px">An authorised India partner — not just a reseller.</h2>
      </div>
    </div>
    <div class="value-grid">
      <div class="value-card glass reveal"><div class="vc-icon">₹</div><div class="wordmark" style="font-size:17px">Best prices in India</div><p class="muted" style="font-size:13.5px">Authorised sourcing means fewer hands in the chain and sharper {e(name)} pricing for your BOM or tender.</p></div>
      <div class="value-card glass reveal"><div class="vc-icon">✓</div><div class="wordmark" style="font-size:17px">Genuine &amp; in stock</div><p class="muted" style="font-size:13.5px">Authentic {e(name)} {noun} with stock support for prototypes and production, delivered pan-India.</p></div>
      <div class="value-card glass reveal"><div class="vc-icon">⚙</div><div class="wordmark" style="font-size:17px">Engineering support</div><p class="muted" style="font-size:13.5px">Selection help, datasheets and application guidance from a team working with {e(name)} every day.</p></div>
      <div class="value-card glass reveal"><div class="vc-icon">★</div><div class="wordmark" style="font-size:17px">Trusted since 1994</div><p class="muted" style="font-size:13.5px">An ISO 9001:2015 and GeM-assessed distributor with three decades in Indian electronics supply.</p></div>
      <div class="value-card glass reveal"><div class="vc-icon">⇄</div><div class="wordmark" style="font-size:17px">Pan-India delivery</div><p class="muted" style="font-size:13.5px">Dispatch from New Delhi to every state, with support for GeM and institutional procurement.</p></div>
      <div class="value-card glass reveal"><div class="vc-icon">↻</div><div class="wordmark" style="font-size:17px">One-window sourcing</div><p class="muted" style="font-size:13.5px">Combine {e(name)} with the wider Silicom line card to consolidate your component and instrument buy.</p></div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section-tight">
  <div class="container">
    <div class="section-head reveal">
      <div>
        <div class="eyebrow"><span class="dot"></span>{e(name)} in India — FAQ</div>
        <h2 class="h2" style="margin-top:12px">Questions buyers ask about {e(name)}.</h2>
      </div>
    </div>
    <div class="reveal" style="max-width:80ch">
{faq_html}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="section">
  <div class="container">
    <div class="glass reveal" style="padding:clamp(36px,5vw,72px);border-radius:var(--r-xl);text-align:center;display:grid;gap:18px;justify-items:center;position:relative;overflow:hidden">
      <div style="position:absolute;inset:-30% -10% auto auto;width:50%;aspect-ratio:1;border-radius:50%;background:radial-gradient(closest-side,color-mix(in oklab,var(--accent) 50%,transparent),transparent 70%);filter:blur(60px);pointer-events:none"></div>
      <div style="position:absolute;inset:auto auto -30% -10%;width:50%;aspect-ratio:1;border-radius:50%;background:radial-gradient(closest-side,color-mix(in oklab,var(--accent-2) 50%,transparent),transparent 70%);filter:blur(60px);pointer-events:none"></div>
      <div class="eyebrow" style="position:relative"><span class="dot"></span>Get a quote</div>
      <h2 class="h2" style="position:relative;max-width:26ch">Looking for {e(name)} in India at the best price?</h2>
      <p class="lede" style="position:relative;max-width:60ch">Send your {e(name)} part numbers, model list or BOM. Silicom Electronics will reply with availability, pricing and lead time — and the technical support to back it up.</p>
      <div class="hero-actions" style="position:relative">
        <a class="btn btn-primary btn-arrow" href="contact.html">Talk to Silicom
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
        <a class="btn btn-ghost" href="brands.html">View all brand partners</a>
      </div>
    </div>
  </div>
</section>

<!-- RELATED -->
<section class="section-tight">
  <div class="container">
    <div class="eyebrow reveal" style="margin-bottom:16px"><span class="dot"></span>Related {e('instrument' if b['cat']=='instruments' else 'component')} brands</div>
    <div class="rel-brands reveal">{rel_html}</div>
  </div>
</section>

{FOOTER}

<script src="site.js"></script>
</body>
</html>"""
    return page


# --------------------------------------------------------------------------
# brands.html link injection
# --------------------------------------------------------------------------

def patch_brands_html():
    path = os.path.join(ROOT, "brands.html")
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()

    # Add tile-link CSS + cursor once.
    if ".brand-tile a.tile-link" not in src:
        src = src.replace(
            "  .brand-tile:hover { transform: translateY(-4px); }",
            "  .brand-tile:hover { transform: translateY(-4px); }\n"
            "  .brand-tile { position: relative; cursor: pointer; }\n"
            "  .brand-tile a.tile-link { position: absolute; inset: 0; z-index: 3; border-radius: inherit;\n"
            "    text-indent: -9999px; overflow: hidden; }\n"
            "  .brand-tile .brand-tile-products { position: relative; z-index: 2; }\n"
            "  .brand-tile-viewlink { position: relative; z-index: 2; font-size: 12.5px; font-weight: 600;\n"
            "    color: var(--accent-ink); display: inline-flex; align-items: center; gap: 4px; margin-top: 2px; }",
        )

    def inject(m):
        article = m.group(0)
        if 'class="tile-link"' in article:
            return article  # already patched
        # find the logo filename or CDIL text
        slug = None
        lm = re.search(r'assets/brand-logos/([^"]+)"', article)
        if lm:
            slug = TILE_LOGO_TO_SLUG.get(lm.group(1))
        if not slug and ">CDIL<" in article:
            slug = "cdil"
        if not slug:
            return article
        b = BY_SLUG.get(slug)
        label = b["name"] if b else slug
        link = (f'<a class="tile-link" href="brand-{slug}.html" '
                f'aria-label="View {html.escape(label)} details">View {html.escape(label)}</a>')
        viewlink = (f'<span class="brand-tile-viewlink">View brand '
                    f'<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" '
                    f'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>')
        # insert stretched link right after the opening <article ...> tag
        article = re.sub(r'(<article class="brand-tile[^"]*"[^>]*>)', r'\1' + link, article, count=1)
        # insert a visible "View brand ->" affordance right before </article>
        article = article.replace("</article>", viewlink + "</article>", 1)
        return article

    src = re.sub(r'<article class="brand-tile.*?</article>', inject, src, flags=re.DOTALL)

    with open(path, "w", encoding="utf-8") as f:
        f.write(src)
    print("patched brands.html")


# --------------------------------------------------------------------------
# sitemap + robots
# --------------------------------------------------------------------------

def write_sitemap():
    core = ["index.html", "instruments.html", "components.html", "brands.html", "about.html", "contact.html"]
    urls = list(core) + [f"brand-{b['slug']}.html" for b in BRANDS]
    items = "\n".join(
        f"  <url><loc>{SITE}/{u}</loc><changefreq>monthly</changefreq>"
        f"<priority>{'1.0' if u=='index.html' else ('0.8' if u in core else '0.7')}</priority></url>"
        for u in urls
    )
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           f"{items}\n</urlset>\n")
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(xml)
    print("wrote sitemap.xml")

    robots = (f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
    with open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(robots)
    print("wrote robots.txt")


def main():
    for b in BRANDS:
        out = os.path.join(ROOT, f"brand-{b['slug']}.html")
        with open(out, "w", encoding="utf-8") as f:
            f.write(build_page(b))
        print(f"wrote brand-{b['slug']}.html")
    patch_brands_html()
    write_sitemap()
    print(f"\nDone — {len(BRANDS)} brand pages generated.")


if __name__ == "__main__":
    main()
