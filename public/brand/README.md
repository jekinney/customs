# Brand assets

Drop the three logo files the owner provided into this folder with these exact names so the site
and admin pick them up:

| File | Used for | From the images provided |
| --- | --- | --- |
| `120-gear-gold.png` | favicon, OG/share image, admin icon | the **gold** gear logo on black |
| `120-gear-white.png` | dark backgrounds where white reads better | the **white** gear logo on black |
| `120-shoptruck.png` | hero + "The Shop" illustration | the **Shoptruck** line-art drawing |

Notes:

- The site header/footer/loader use an **inline SVG** recreation of the gear (see
  `src/components/brand/Logo.tsx`), so the nav renders even before these files exist. If you'd
  rather show the exact raster logo there too, we can swap the SVG for `120-gear-gold.png`.
- The Shoptruck illustration on the homepage loads from `120-shoptruck.png`; until it's added, a
  small placeholder shows in its spot.
- PNGs with transparent backgrounds are ideal (all three provided appear to be).
