# Attendance choice release

The latest request supersedes manual numeric attendance entry. Use the existing shared radio-choice component for 1 or 2 attendees, limited by the verified invitation maximum. Attending remains selected initially, the count starts unselected, Not Attending hides it and submits no stale count, and returning preserves the chosen count.

Apply the established Impeccable/Anti Slop form direction. Local Chrome inspection showed a rectangular text-input focus outline. Replace that text outline with a two-pixel animated underline; preserve label feedback, radio/button focus indicators, reduced motion, and forced-colors outlines. Field borders and wedding content are preserved.

Both supplied Library images resolved, but the supported materialization helper failed to download either file after one bounded retry. No readable local reference image was obtained and screenshot pixels were not verified. Library OCR and local browser rendering are separate evidence, not pixel-parity proof.

Verification on the complete tracked snapshot: 82 unit tests, full typecheck/build, 15 public/admin/content browser tests, and 2 synthetic-backend integration browser tests passed. Coverage includes 320/390/768/1680 widths, keyboard and reduced motion, attendance toggles and maximum-one invitations, gift account visibility/copy, restored two-chapter story, groom photo and five adventures. The browser test loader needed an explicit JSON import attribute; only its test import changed.

Base commit 471b3bd already contains all approved content restorations and frontend integrations. Release preserves those tracked files. Uncommitted package.json/bun.lock additions for the local Vercel CLI are excluded and remain local. No backend directory, .env, credentials or new infrastructure is included. Demo remains review-only and admin/guest persistence fails closed if its private backend is unavailable. Real backend deployment remains outside this release.

Publication is authorized to the existing wedding Vercel project/main branch and existing aliases. The deploy snapshot is exported from the final commit, preserving approved content while excluding unrelated working-tree changes. Production verification must be read-only, including story/media integrity and form state toggles without submitting real data.

## Google Calendar addition

Latest user instruction includes direct Google Calendar navigation in this release. Add to Calendar is a keyboard-accessible link opening a new tab to the Google event-template endpoint. URLSearchParams safely encodes canonical title, location and description; explicit UTC start/end plus ctz=Asia/Jakarta preserve 26 December 2026 08:00–10:00 WIB for the canonical Akad record. The visitor reviews and saves; the site does not access a calendar account or create an event. Missing/ambiguous dates still show an honest unavailable state. Existing ICS serializer remains available to callers but this UI no longer downloads ICS. Tests check decoded parameters and a sandboxed popup destination without saving an event. Unit suite now has 83 passing tests; final browser/type/build results are reported with publication.

Final combined verification: 83 unit tests, typecheck/build, 15 public/admin/content browser tests and 2 synthetic-backend integration browser tests passed. Google Calendar popup navigation was intercepted in the test sandbox and the intended URL/timezone/parameters were verified; no event was saved. The additional calendar screenshot also failed supported Library materialization after a bounded retry. No reference pixels could be inspected. Source/test files staged for release match the verified snapshot; unrelated CLI package edits remain excluded.
