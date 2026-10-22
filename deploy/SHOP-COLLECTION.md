# Shop camera collection — 22 October 2026

Twelve individual listings from the recent supplier offers, including separate bullet and turret models. Selling prices use the authorised multiplier of 1.33, rounded to the nearest KES. Supplier costs are not included in the public catalogue. Availability is on request, not a claim of stock held by Finch. Existing products, including the solar camera, are preserved.

## Product references

- DS-2CE10DF0T-LPFS: https://www.hikvision.com/en/products/Turbo-HD-Products/Turbo-HD-Cameras/ColorVu-Series/ds-2ce10df0t-lpfs/
- DS-2CE70DF0T-LPFS: https://www.hikvision.com/en/products/Turbo-HD-Products/Turbo-HD-Cameras/ColorVu-Series/ds-2ce70df0t-lpfs/
- DS-2CE12DF0T-LFS: https://www.hikvision.com/en/products/Turbo-HD-Products/Turbo-HD-Cameras/ColorVu-Series/ds-2ce12df0t-lfs/
- DS-2CE16D0T-LPFS: https://www.hikvision.com/en/products/Turbo-HD-Products/Turbo-HD-Cameras/Value-Series/ds-2ce16d0t-lpfs/
- DS-2CE76D0T-LPFS image: https://hikvision.tj/en/products/turbo-hd-products/turbo-hd-cameras/value-series/ds-2ce76d0t-lpfs/
- DS-2DE2C400MWG-E: https://www.hikvision.com/en/products/IP-Products/Network-Cameras/value-series/ds-2de2c400mwg-e/
- TY1 Pro: https://www.ezviz.com/product/ty1-pro/56459
- H1c: https://www.ezviz.com/product/H1c/47789
- C1C: https://www.ezviz.com/product/c1c/1425
- C2C: https://m.ezviz.com/product/C2C-1080P/30664 — avoid variant-dependent range claims; supplier caption differs from this current datasheet.
- PTZ: https://assets.hikvision.com/prd/public/all/doc/m000044249/Datasheet-of-DS-2DE4425IW-DES6_V5.6.10_20220714.pdf — listing keeps the supplier's base model, without claiming an unconfirmed revision.
- Wi-Fi kit: https://assets.hikvision.com/prd/normal/all/doc/m000171722/NK844WBH_Datasheet_20260228.pdf — storage/accessories require confirmation.

## Images

Final assets are in `public/shop/`. Six manufacturer/distributor photos were already clean white-background product views and are retained. Six were edited with the built-in image-generation tool, inspected and encoded to WebP; the website serves responsive optimised sizes. No CLI generation used.

Prompt for EZVIZ photos (ty1-pro.webp, h1c.webp, c1c.webp, c2c.webp):

> Edit this exact manufacturer product reference into a clean ecommerce product photo. Keep only the front-view camera shown on the LEFT, remove the side/back view on the right and all dimension annotations and lines. Center the single unchanged camera on a pure white background in a square image with generous 12% margins. Preserve its exact physical shape, proportions, lens, apertures, buttons, base and EZVIZ branding. Modestly improve clarity and edge sharpness without changing product details or inventing features. No extra text, accessories, props or watermark.

Prompt for wifi-kit.webp and ptz-25x.webp:

> Edit this exact product photo: replace the black background with pure white, gently improve clarity and sharpness, keep the exact product shape, design, logos, all parts, counts, proportions and arrangement unchanged. Square ecommerce catalogue image with 12 percent clear white margins, no extra text or accessories, no invented details.

## Administration

The insert-only migration runs once on deployment; normal admin product editing manages all listings thereafter. Do not reapply supplier pricing over admin changes. Shop assets are accepted by the existing image-path validator. The estimate equipment catalogue is separate and unchanged.
