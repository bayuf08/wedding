# Validation log

## Completed local checks

- `bun run test`: 12 files, 48 tests passed after the fixture and component test migration.
- `bun run typecheck`: passed after the final source edits.
- `bun run build`: passed after the final source edits and asset preparation.
- `bun run test:e2e`: four Chromium tests passed against the production preview. The tests cover opening/video activation; local RSVP, gift, wishes, calendar, film, navigation and gallery interactions; protected/unavailable route isolation; root guest-query forwarding; overflow at seven viewport widths; and the profile aperture/parallax on forward scroll, reverse scroll, and reduced motion.
- `bun run test:visual`: captured four 1680 × 939, DPR 2 production checkpoints: cover, hero, RSVP, and gallery, plus a CSS-resolution survey of eleven other major scenes. Full-resolution bride and closing captures were added to the survey. All 88 supplied screenshots passed the 3584 × 2264 dimension check and were cropped to the specified 3360 × 1878 page region.
- Pixelmatch at a 0.12 threshold reported differences of 1.31% for cover frame 2, 0.64% for bride frame 18, 1.97% for RSVP frame 56, 2.22% for gallery frame 67, and 1.16% for closing frame 87. These scores are diagnostics, not an exact fidelity claim. Hero frame 3 uses a different video timestamp and was inspected for text placement rather than compared as a still image.
- Browser at 390 × 844: local MP4 loaded at readyState 4, 1920 pixel video width, and played after opening. Loader progressed to cover; the cover button removed main inertness and unlocked scrolling.
- Browser forms: required RSVP validation focused attendance; attending revealed event and guest count; a valid attending response showed local preview confirmation. Gift form required name, configured bank, and positive amount, then showed preview confirmation. No external form request was made.
- Browser overlays: menu jump reached RSVP and focused its section; gift and lightbox opened in native modal dialogs; lightbox advanced from image 1 to 2 and Escape restored focus to its opener.
- Scroll motion: the profile aperture and inner photograph reversed at measured positions, and reduced motion cleared both effects. The story slideshow changed image on its own clock after decoding the next image. A fresh reduced-motion load skipped the timed loader.
- Wishes advanced from page 1 to page 2.
- Responsive widths 320, 390, 767, 768, 1024, 1025, and 1680 pixels had no document horizontal overflow in the in-app browser.

## Reference decisions and limitations

- The local hero film and all sixteen gallery images use reference assets. The six story images follow the reference slideshow's DOM order. The wedding film embed ID was read from the reference page's Elementor video settings. The gallery poster is the reference overlay photograph.
- The visible date is the reference's placeholder `202X`, so no downloadable calendar event is fabricated. A valid `CalendarRecord` can produce an ICS file when real dates are supplied.
- RSVP, wishes, account numbers, and gift confirmation are deterministic local preview data. There is no persistent backend, organizer delivery, or payment operation.
- Lausanne was unavailable; the body uses Inter 300. Exact glyph and line wrap matching remains subject to this substitution.
- The supplied 88 screenshot frames were validated and cropped, but only five still checkpoints were compared pixel by pixel. Sticky quote/gallery, photo reveals, responsive typography, and motion formulas need further calibrated comparison before claiming exact visual equivalence.
- Phone and desktop were visually inspected in the in-app browser. Tablet placement and physical device behavior have not been visually certified.
- The eleven-scene desktop survey exposed and corrected the bride role alignment and the closing heading/blessing spacing. These captures provide composition coverage, but their scroll positions and slideshow timestamps are not calibrated to the individual supplied frames.
- The production browser check of the film URL blocks the external YouTube request. With the provider loading, the long end-to-end scenario hit its test deadline while reading the iframe attribute; the full suite then passed with that external request isolated. Actual YouTube playback remains a deployment-network check.

## Remaining verification before publication

- Review every supplied reference frame at the calibrated 1680 × 939 viewport and tune scene geometry, image crops, and motion timing.
- Verify the YouTube film embed on the intended deployment network and obtain asset usage rights.
