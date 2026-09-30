# Bundled fonts

Every font here is downloaded as TTF from Google Fonts (`fonts.googleapis.com/css2` with a
non-woff2 user agent, then `fonts.gstatic.com`). resvg loads them through `fontFiles`, so renders
never depend on system fonts. Every font is licensed under the SIL Open Font License 1.1 (full text
in `OFL.txt`) or the Apache License 2.0 (full text in `APACHE-2.0.txt`). Both licenses allow bundling
fonts and using them in rendered images, including commercial NFT artwork.

| File                              | Family (as used in SVG) | Role on the card                                  | License    | Copyright |
| --------------------------------- | ----------------------- | ------------------------------------------------- | ---------- | --------- |
| `PermanentMarker-Regular.ttf`     | Permanent Marker        | Huge red-pen letter grades, SEE ME, marker notes  | Apache 2.0 | (c) 2010 Font Diner, Inc. |
| `Caveat-Bold.ttf`                 | Caveat                  | Harrow's handwritten Teacher Comment              | OFL 1.1    | (c) 2014 The Caveat Project Authors |
| `RockSalt-Regular.ttf`            | Rock Salt               | Scratchy angry pen marks (WHY, NGMI)              | Apache 2.0 | (c) 2010 Font Diner, Inc DBA Sideshow |
| `GochiHand-Regular.ttf`           | Gochi Hand              | Student's handwriting on doodles                  | OFL 1.1    | (c) 2011 HT Fonts (RFN "Gochi", "Gochi Hand") |
| `Schoolbell-Regular.ttf`          | Schoolbell              | Kid print: forged signatures, crayon              | Apache 2.0 | (c) 2010 Font Diner, Inc. |
| `HomemadeApple-Regular.ttf`       | Homemade Apple          | Adult cursive parent signatures                   | Apache 2.0 | (c) 2010 Font Diner, Inc. |
| `SpecialElite-Regular.ttf`        | Special Elite           | Typewriter forms (carbon copy, referral slips)    | Apache 2.0 | (c) 2010 Brian J. Bonislawsky DBA Astigmatic |
| `CourierPrime-Regular.ttf`        | Courier Prime           | Office-printer form text                          | OFL 1.1    | (c) 2015 The Courier Prime Project Authors |
| `CourierPrime-Bold.ttf`           | Courier Prime (bold)    | Office-printer form labels                        | OFL 1.1    | (c) 2015 The Courier Prime Project Authors |
| `Doto-Bold.ttf`                   | Doto                    | 9-pin dot-matrix printout                         | OFL 1.1    | (c) 2024 The Doto Project Authors |
| `VT323-Regular.ttf`               | VT323                   | CRT / terminal / pager LCD text                   | OFL 1.1    | (c) 2011 The VT323 Project Authors |
| `Anton-Regular.ttf`               | Anton                   | Condensed display: headers, stencils, banners     | OFL 1.1    | (c) 2020 The Anton Project Authors |
| `BlackOpsOne-Regular.ttf`         | Black Ops One           | Stencil (bus numbers, hazard stamps)              | OFL 1.1    | (c) 2022 James Grieshaber, Eben Sorkin (SorkinType/Black-Ops) |
| `AlfaSlabOne-Regular.ttf`         | Alfa Slab One           | Fat slab school headers                           | OFL 1.1    | (c) 2016 The Alfa Slab One Project Authors (RFN "Alfa Slab") |
| `RubikDirt-Regular.ttf`           | Rubik Dirt              | Distressed rubber-stamp lettering                 | OFL 1.1    | (c) 2020 The Rubik Filtered Project Authors |
| `OldStandardTT-Bold.ttf`          | Old Standard TT         | Engraved certificate serif (gold foil, notices)   | OFL 1.1    | (c) 2011 The Old Standard Project Authors |
| `SedgwickAveDisplay-Regular.ttf`  | Sedgwick Ave Display    | Bathroom-stall graffiti, sticker lettering        | OFL 1.1    | (c) 2017 The Sedgwick Ave Project Authors |

Reserved Font Names ("Gochi", "Gochi Hand", "Alfa Slab") only restrict naming modified versions of
the font files. We ship the files unmodified.

Adding a font: download the TTF the same way, drop it here, add a row above, and add its family to
`FONT_FAMILIES` in `collection/src/fonts.ts`.
