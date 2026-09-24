# Silicom Electronics logo package

Vector rebuild of the Silicom logo (September 2026). Start with `08-documentation/usage-guide.pdf`.

| Folder | Contents |
|---|---|
| `01-primary` | Full lockup in colour: SVG, PDF, JPG, PNG 256–2048 px. Also a short lockup without "Pvt. Ltd." |
| `02-reverse` | Primary, stacked and symbol for navy/dark backgrounds (primary also as PDF) |
| `03-mono` | One-colour black, white and blue versions of the primary lockup and symbol |
| `04-stacked` | Mark above "Silicom Electronics", for square and narrow spaces |
| `05-symbol` | Arrow and SE monogram only |
| `06-favicon` | `favicon.ico` (16/32/48), `favicon.svg`, PNG favicons, `apple-touch-icon.png`, app icons 192/512 |
| `08-documentation` | Usage guide (HTML and PDF): versions, clear space, minimum sizes, colours, don'ts |

File names follow `{version}-{colour}-{size}.{ext}`. SVG is the master; everything else is generated from it by `prototype/scripts/build-logo.py`.

The wordmark is set in Alegreya, licensed under the SIL Open Font License 1.1 (see `prototype/scripts/fonts/Alegreya-OFL.txt`). Its outlines are embedded, so no font installation is needed.
