# Prewedding photo replacement implementation plan

## Audit and scope
Reviewed all 194 supplied originals (IMG_9697.JPG–IMG_9890.JPG) against the local manifest. The supplied hero composition, profiles, gift, closing, and five adventure photos remain unchanged. The Claire template photos must no longer be referenced by the manifest. Layout, animation, invitation text, RSVP and deployment remain unchanged. Existing template video is outside this photo-only change and needs a separate owner decision.

## Selection
Traditional portraits establish the cover and story, navy formal portraits add visual variation to quotation and celebration, and the architectural staircase frame supports the RSVP panel. Portraits with clear faces and room around the couple are preferred over near-duplicate exposures. Casual white-shirt portraits provide a quieter story moment.

| Slot | Source | Reason |
|---|---|---|
| cover | IMG_9773.JPG | Full-length traditional couple |
| loader / quote-a | IMG_9718.JPG | Close traditional two-shot |
| quote-b | IMG_9838.JPG | Intimate formal portrait |
| quote-c | IMG_9780.JPG | Clear traditional two-shot |
| story-1 | IMG_9704.JPG | Seated/standing traditional scene |
| story-2 | IMG_9747.JPG | Relaxed medium traditional portrait |
| story-3 | IMG_9761.JPG | Affectionate seated variation |
| story-4 | IMG_9815.JPG | Navy bouquet portrait |
| story-5 / menu | IMG_9830.JPG | Formal close couple portrait |
| story-6 | IMG_9884.JPG | Casual candid portrait |
| celebration | IMG_9827.JPG | Full-length navy formal portrait |
| mountain (RSVP) | IMG_9846.JPG | Architectural staircase frame |
| feature-poster | IMG_9815.JPG | Clear couple poster, video unchanged |

Unused legacy hero/gallery keys will also point to selected supplied photos, preventing future template-photo reuse. Files in the old template asset directory are not deleted.

## Implementation
1. Generate local WebP derivatives at 640, 1200 and 1680px, respecting EXIF rotation and preserving aspect ratio. Strip metadata from derivatives; never alter originals.
2. Replace manifest sources, responsive srcsets, dimensions, alt text, focal points and provenance. Preserve IDs and existing scene configuration.
3. Add regression coverage that all manifest sources exist and no template photo remains referenced. Update only obsolete source-path expectations in existing tests if needed.
4. Run unit tests, typecheck and production build. Review desktop and mobile crops, especially cover and poster. Report any browser-test limitations.

## Acceptance
No Claire photos are referenced by the invitation manifest, existing user-owned assets are unchanged, images have correct intrinsic dimensions and responsive sources, and no layout or functionality changes. No commit, push or deployment in this task.

## Verification completed
- 24 test files, 96 unit/component tests passed.
- Typecheck passed and production build passed.
- Chrome local preview checked at 1440×1000 and 390×844, opened invitation and reviewed quote/story/RSVP/film poster. No broken loaded images reported.
- Adjusted desktop cover focal point to 50% 20% to retain the headdress and mobile story-2 to 25% 38% to retain both faces.
- 32 manifest slots updated (15 active and 17 unused legacy), 16 distinct supplied originals, 48 responsive WebP derivatives, approximately 3.8MB total.
- Existing external YouTube film remains unchanged and loads only after PLAY. It is not a supplied prewedding video and should be replaced or disabled in a separate approved change.
- No original user images deleted, no commit/push/deployment performed.
