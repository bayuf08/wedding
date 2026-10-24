# Wedding navigation implementation plan

## Baseline and constraints

Repository: /Applications/XAMPP/xamppfiles/htdocs/exploration/wedding/frontend. Baseline main 06f476dc769d1bf07f79061c15a42d3f17d78463. Existing unrelated package.json/bun.lock CLI additions must remain untouched. This task authorizes local planning/implementation/verification only, with no commit, push or deploy.

Existing architecture: NavigationDialog currently delegates immediately opening/closing to InvitationDialog; useInvitationExperience owns overlay state and saved document scroll lock. Gift and lightbox also use InvitationDialog. Keep their lifecycle and styling unchanged. Add navigation-specific lifecycle rather than globally changing every dialog.

## Shared component architecture

1. InvitationBurgerIcon: one two-line glyph for outside trigger and inside menu toggle. CSS variables preserve existing desktop/mobile stroke/width; reduced-motion and manual pause remove transitions.
2. NavigationCurtain: decorative ten-column layer, CSS-visible five on mobile, using only the existing menu surface color.
3. useNavigationMenu: owns native dialog lifecycle, intent/phase/presence, cancellable animation tracks, native cancel, guarded outside click, focus return, latest destination and motion-preference cleanup.
4. NavigationDialog: preserves existing photograph/nav/caption markup and settled CSS geometry. Wires shared curtain/glyph/controller and reveal hooks into the existing seven section buttons.
5. InvitationControls: retains its button and playback layout; swaps internal glyph and adds expanded/controls semantics.
6. useInvitationExperience / InvitationExperience: include navigation presence through exit in existing scroll/motion lock; keep original section routing, data and all other overlays.

No animation library or package changes. Web Animations are available in the target browsers; if unavailable, settle instantly to the same accessible endpoint.

## Ordered work

1. Save these three plans before any application edit, grounded in actual Brave observations.
2. Implement glyph and curtain in shared source components, then the controller.
3. Wire navigation/controls/experience with presence and delayed destination dispatch.
4. Add meaningful lifecycle tests (generation invalidation, focus/destination, preference/unmount) and real-browser interruption/state coverage.
5. Generate Nuxt types, run full unit suite, typecheck and production build.
6. Run menu-specific browser tests at 320/390/768/1680, including intermediate-frame screenshots, same-design metric assertions and touch behavior.
7. Run existing form/calendar/content/navigation regression tests and synthetic-backend tests as appropriate to changed lifecycle. No production writes or real data submissions.
8. Inspect screenshots directly, document evidence and caveats, compare tracked content/media hashes against baseline, apply only scoped verified files to the original checkout with original-state guards.
9. Leave original unrelated package/lockfile edits intact and report local readiness.

## Acceptance matrix

| Scenario | Required result | Evidence |
| --- | --- | --- |
| Mobile + desktop open | Intermediate upward columns, ordered labels, final unchanged layout | Frame captures + computed transforms |
| Close control/Escape | Exit visible, dialog/lock persist until final frame | Browser phase/native-open assertions |
| Rapid open-close-open | Latest intent open, no hidden/stale final state | Real animation reversal + unit generation test |
| Repeated dismiss | One close, no restart or duplicate destination | Event assertions |
| Early/repeated destination | Latest valid section focused after exit | Browser focus/scroll |
| Outside click/drag | Empty surface dismisses; drag from content does not | Pointer tests |
| Tab/Shift-Tab | Active element stays in native dialog; dismiss returns trigger | Focus checks |
| Scroll position | Exact saved body styles/scroll restored | Browser capture before/after |
| Breakpoint change | Same open menu, correct visible column count, no overflow | 390 ->1680 ->390 |
| Reduced motion/manual pause | Immediate endpoints, no active decorative tracks | Media/prop tests |
| Unmount/no WAAPI | Cleanup and instant fallback | Unit tests |
| Regression | Approved count choices/calendar/story/photos/gift remain unchanged | Existing suites + content hashes |

## Reporting

Report all three plan paths, actual reference observations versus chosen timing, changed component inventory, exact checks, screenshot paths, unchanged baseline/content evidence and any blocked screenshot transfer/browser operation. Never report measured parity without timing evidence. No bank account values or credentials in reports.

## Final local verification

- Full unit suite: 89 passed across 22 files; typecheck and production build passed.
- Combined browser run: all 17 passed (six menu motion cases and eleven form/calendar/story/media/navigation regressions). After hiding the inert background trigger to eliminate a duplicate glyph during entry, build and all six menu cases passed again, including all seven section destinations.
- Native Web Animations were paused/seeked in the frame-inspection harness at 150/300/600ms for deterministic screenshots. Other focus/touch/preference tests ran normally. Intermediate transforms genuinely vary and the corrected curtain geometry is continuous.
- Baseline 06f476d and final settled menu typography, color, label, image source and bounding boxes match within 0.6px at 390/1680. Pixel comparison excluding the intended close-glyph area found 3/355320 pixels at 390 and 9/1566630 at 1680 beyond an 8/255 channel threshold; mean channel differences were below .001. Screenshots were also viewed directly.
- Scope checks: ten source/test files match the verified working copy; canonical content/media JSON and the groom/five adventure image hashes match the baseline copy. Package/lockfile CLI edits remain untouched. git index unchanged; no commit, push, deployment, production forms or backend changes.
- Both Library attachment transfers failed with `download failed`, including one supported retry per file; no readable local attachment pixels were obtained. Brave provided actual live reference observations. Later reference-browser attachment loss prevented additional inspection and confirmation of the temporary viewport reset; research was stopped rather than retried indefinitely. Precise LAIN easing/durations remain unverified.

## Impeccable + Anti Slop delivery gate

Hard Gate PASS within changed menu scope: 320/390/768/1680 responsive, native keyboard/focus/Escape and all seven real section controls verified; no invented content or dead actions.
Purpose Gate PASS: the design/transition plans record why curtains, stagger, shared glyph and accessibility interruption exist; no unrelated decorative additions.
Liveliness PASS: ENERGY 2 / RHYTHM 2 / MOTION 2, one directional menu gesture; intermediate captures show actual motion while settled wedding identity remains unchanged.
Craftsmanship PASS: cancellation, rapid reversal, latest intent, exact scroll restoration, outside drag, breakpoint changes, touch, reduced motion, fallback and unmount have test evidence. Reference timing/pixel limitations are explicitly unverified, not presented as parity.

Evidence directory: /Users/bayu/Documents/Codex/2026-10-24/task-2/wedding-navigation-evidence. Baseline, opening-150/300/600, settled-open and closing-150 PNGs are available for both 390 and 1680 widths.

## Subsequent publication authorization

The user subsequently authorized commit, push and deployment of this completed navigation work. The earlier local-only restriction describes the implementation phase and is superseded for the scoped navigation source, three plans and two tests. Final source/test bytes were checked against the verified working copy: unchanged since 89 unit tests, typecheck/build, 17 browser cases and the six-case final navigation rerun passed. Approved content/media hashes remain unchanged. Unrelated local CLI package/lockfile changes remain excluded. Publication uses an export of the final commit, not the dirty working tree.
