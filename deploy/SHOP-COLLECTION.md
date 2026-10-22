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

## Expanded equipment collection

Migration 0013 adds 39 further listings from the remaining supplier offers: HD and IP cameras, plastic/metal/two-way-audio DVR variants, NVRs, a 4TB hard drive, 600–3000VA UPS units, CAT6 cable, router and switches, video intercom, fingerprint terminal, fence energizer, gate opener and solar cameras. Combined with 0012, these account for 51 supplier listings. Duplicate metallic DVR offers are included only once.

Selling prices use the same authorised 1.33 multiplier, rounded to whole KES. Supplier costs and WhatsApp exports remain outside version control. Listings are available to order; unspecified recorder models and UPS watt ratings require confirmation before dispatch. Existing admin products/prices are not overwritten.

### Additional image assets and prompts

Final assets: `public/shop/dealer-00.webp`, `dealer-01-bullet.webp`, `dealer-01-turret.webp`, `dealer-02.webp` through `dealer-16.webp` (no 17), `dealer-18.webp` through `dealer-25.webp`, `ip-exir-bullet.webp`, and `tenda-8port.webp`. Dealer photos show the actual retail packaging where an unboxed product was not provided. Family images are identified in relevant descriptions. The supplied UPS image already had a white background. The Tenda 8-port illustrative image comes from https://www.tendacn.com/product/specification/531 .

Built-in image-generation editing was used, not CLI generation. Prompt set:

> Isolate the specified individual product or complete retail box from the supplier photograph on pure white. Remove other products and shop surroundings. Preserve packaging, printed illustration, logos and existing text. Correct perspective modestly, brighten neutrally and gently sharpen. Never invent an unboxed product from packaging. Square ecommerce composition with white margins.

For physical dome camera: preserve lens, LEDs, dome housing and attached connectors. For fingerprint terminal: rotate the whole device upright, with the complete six-row keypad above the fingerprint reader. For HAWK solar camera: isolate the actual camera and rotate upright, preserving the two lenses, sensor, floodlights, antennas and bracket; do not invent a solar panel in the photo.

Additional manufacturer reference: https://assets.hikvision.com/prd/normal/all/doc/m000077360/DS-2CD1021G0-I_Datasheet_20260409.pdf . The extracted bullet image was edited only to replace black background with white and improve clarity, preserving camera geometry and branding.
