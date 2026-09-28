# Claire asset register

The images are copies of publicly served files used by the [Claire reference invitation](https://groovepublic.com/claire/?to=Guest+Name). `app/data/media.manifest.ts` is the authoritative role to file map, with intrinsic dimensions, focal points, descriptions, and source URL for each role. The 22 JPEG originals live in `public/images/claire/`; generated 640, 1200, and 1680 pixel WebP variants are present when smaller than the original width. `bun run media:prepare` reproduces those variants. The hero MP4 is in `public/media/claire/japan-vibe.mp4` and is 7,420,790 bytes.

| Role | Original source | Local usage |
| --- | --- | --- |
| Cover | `dexter-hualin-00146-Large.jpeg` | Opening background |
| Loader and quote | `dexter-hualin-00197-Large.jpeg`, `00206.jpg`, `00195-Large.jpeg` | Loader thumbnail and three photo panels |
| Hero | `japan vibe.mp4`; `00183-Large.jpeg` poster | Muted, looping opening film with still fallback |
| Profiles | `00145-Large.jpeg`, `00183-Large.jpeg` | Bride and groom portraits |
| Story slideshow | `00169.jpg`, `00192.jpg`, `00168.jpg`, `00164.jpg`, `00153-Large.jpeg`, `4975645345rge523.jpg` | Six cycling story photos in reference order |
| Celebration, gift, RSVP | `00198.jpg`, `00179.jpg`, `00216-Large.jpeg` | Countdown portrait, gift photo, Fuji form image |
| Wedding film | `00168.jpg`; YouTube video `BNQj5Muhss4` | Poster and click to play embed |
| Menu and closing | `00153-Large.jpeg`, `00155.jpg` | Navigation background and final inset |
| Gallery | See `gallery-01` through `gallery-16` in the manifest | Sixteen photographs in reference order |

The original JPEGs and MP4 came from `groovepublic.com/wp-content/uploads/2025/` and `is3.cloudhost.id/externalgroovepublic/video groove/`, respectively. Their presence on a public reference page does not establish redistribution rights. Obtain permission from the rights holder before publishing this reconstruction or replacing preview assets with production content.

Typography uses bundled Fontsource Playfair Display, Playfair Display SC, Bodoni Moda, Inter, and Roboto fonts. Lausanne is not available in this workspace; Inter 300 is the documented substitute. Only Latin subsets are imported to limit payload.
