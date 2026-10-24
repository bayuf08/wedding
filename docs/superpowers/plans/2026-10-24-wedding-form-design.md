# Wedding Form Design Plan

Status: written before implementation, 24 October 2026. Reference: https://lainagency.com/contact.

## Intent and boundaries

Wedding guests need to confirm attendance, leave wishes, and optionally confirm a gift. They should recognize one coherent form system across the dark RSVP scene and the light gift dialog. Keep the invitation's photographs, fonts for narrative content, section order, recipient data, copy actions, guest-name rules, and existing submission contracts. The public Guest Wishes feed is a read-only list; its editor is the RSVP Wishes/Message field. There are no other input forms in `app/**/*.vue` at this baseline.

Reading this as a wedding invitation for invited guests, with photographic wedding identity and precise reference-led form typography. ENERGY 2 / RHYTHM 2 / MOTION 2 within the forms. Movement confirms focus and context, never delays input.

The previous revision reproduced underlines but missed small uppercase monospaced metadata, slow focus-rule expansion, compact quiet chips, bracket actions, and field-driven side content. It also duplicated field markup across forms. This revision addresses those concrete gaps.

## Evidence and confidence

Direct desktop interaction study used Brave, Work profile, at 1680px. A separate tab protected the user's existing draft. Empty, focused, filled, blurred, selected and keyboard states were inspected. After Brave's debugger detached, the Mac in-app browser was used for the 390px journey and navigation study. No reference form was submitted. Two user screenshots were inspected by the parent and supplied as verified static observations; their timings cannot be inferred from pixels.

| Property | Direct observation | Interpretation/adaptation |
| --- | --- | --- |
| Input type | Aspekta, 35.28px / 42.336px at 1680px; 24.96px / 29.952px at 390px | Use existing Inter with 24–35px fluid scale; do not acquire a new unlicensed font |
| Metadata | Geist Mono, 11.424px / 18.2784px, uppercase numbered rows | Use a small system monospace stack; retain natural accessible names |
| Empty text | Placeholder rgb(58,58,62); quiet label rgb(106,106,110) | Reference contrast is deliberately dim; wedding placeholder and label must remain readable |
| Typed text | rgb(255,255,255), transparent input | Use existing wedding light/dark text with solid high contrast |
| Focus | Active label becomes white; rule's white after-layer grows from scaleX(0) to scaleX(1) | Shared Field component owns label and rule state |
| Focus timings | Label color 0.4s; rule transform 0.9s cubic-bezier(0.19,1,0.22,1) declared in computed CSS and settled states observed | Reuse those measured values; no claim of frame-exact parity |
| Service chip | 82.65 × 34.27px example; 8px 13px padding; dark rgb(31,31,31), text rgb(154,154,158) | Keep compact appearance but minimum 44px interaction height |
| Selection | White chip, dark text, class is-on; 0.35s background/color transitions | Native radio semantics for wedding single-choice fields; check cue remains aria-hidden |
| Hover | Declared `.cx_chip:hover` text becomes white | Adopt brighten-on-hover with pointer media query |
| Action | Transparent 11px mono uppercase, 6px corner brackets; no solid full-width slab | Shared Action uses corner strokes, keyboard outline, press feedback |
| Action limits | Pointer observation was interrupted; submit was never pressed | Bracket/press timing is an explicit adaptation, not measured reference behavior |
| Companion | Company focus/value changed point lettering to dummy company text; service focus changed it to an abstract ring | Adapt as finite particle text for active field context, never mirror accounts/amounts/messages |
| Mobile | 390px single-column form, smaller heading, side canvas hidden (zero rect); cookie panel initially obscured lower fields | Hide wedding decorative companion below 768px; no consent overlay is introduced |

## Visitor journey

1. Entry: large two-line proposition and minimal header attract attention before fields. On desktop there is substantial space before the first numbered row; mobile compresses this into roughly the first screen. This hierarchy was visually observed, not evaluated through user analytics.
2. Begin: name/company inputs appear as text on a quiet ruled surface rather than boxed controls. The cursor, brighter label and full active underline communicate editing. Numbering supports a sense of progression.
3. Continue: Tab moved Company to Email. Filled Company remained visible after blur while the active rule moved to the next field. Side content changes give feedback to the current context. The service chip buttons were individually tabbable; selection was visually obvious.
4. Scroll: the left form proceeds through identity, service, budget, timeline, message and attachments. The right visual occupies a separate large region. The generous vertical rhythm encourages one group at a time, at the cost of more scroll. Wedding questions remain attendance/event/guest-count/wishes, never agency lead questions.
5. Decide: service/budget/timeline chips expose options without opening menus. Wedding attendance and recipient choices use the same visible-choice treatment; attendee count is a blank manual numeric field, and event selection is absent. Long recipient labels wrap; their IDs/values remain unchanged.
6. Finish: reference has a small bracketed Send Brief and direct-contact alternative. The wedding action retains its truthful local-preview success wording, with a disabled loading state only where the existing RSVP flow is asynchronous.
7. Leave/return: Home link navigated to `/`; Back returned to `/contact` and the dummy Company draft was empty on this run. Forward returned Home and Back returned Contact. This is evidence for this browser session, not a universal persistence guarantee. Wedding dialog drafts should continue to survive close/reopen as before; no new persistent storage is added.
8. Mobile/touch: 390px reference hierarchy stacks and removes the side visual. Desktop viewport emulation is not a physical-device keyboard/touch test. Wedding uses 44px targets, wrapping choices, native inputs, and no hover-only functionality.

## Friction and accessibility decisions

- Do not copy the reference's low placeholder/metadata contrast. Keep a difference between placeholder and value while meeting AA for meaningful text.
- Keep labels programmatically associated; the reference visually rendered metadata as paragraphs, so semantics are intentionally improved.
- Native radios retain Arrow/Space behavior and group names; do not imitate multi-select service buttons for single-choice wedding data.
- All focus cues must be immediate even while the decorative underline animates.
- Error messages remain plain text, linked with aria-describedby and role alert. First invalid control receives focus.
- No animated data echo: companion text is the active field category or safe selection label, not a name, note, bank account or gift amount.
- No autoplay sound, grid wallpaper, new lead-gen steps, file upload, invented testimonials, or navigation redesign.

## Composition and reusable system

`InvitationFormField.vue`: native input/textarea, numbered uppercase label, hint/error/counter, focus/filled state, active underline. Parent owns validation and payload.

`InvitationFormChoices.vue`: labelled fieldset, native radio options, wrapping chips, selected and error cues. Used by RSVP choices and gift recipient selection.

`InvitationFormAction.vue`: bracket submit control, busy/disabled behavior, hover/focus/press styling.

`InvitationFormStatus.vue`: persistent polite live region for local success feedback.

`InvitationFormCompanion.vue`: desktop-only decorative particle typography with finite transitions and reduced-motion endpoint rendering. Appears beside the form under existing RSVP imagery and below gift account information, without replacing either.

`forms.css`: one set of semantic dark/light tokens and component selectors. Remove obsolete form-specific rules from scenes.css so equal-looking forms cannot diverge through competing CSS.

## Acceptance

See the full state matrix in the micro-interaction plan and executable tasks in the implementation plan. Completion requires all controls in both forms to consume shared components, local positive/negative flows, no horizontal form overflow at 320/390/768/1680px, keyboard focus, reduced-motion endpoints, and unchanged account rendering/submission payloads. No new commit, push, or deployment in this revision.

## Latest RSVP acceptance and restored content (supersedes earlier event-choice wording)

Attending is selected initially. Number of Attendance appears immediately, blank, required, integer 1–2 according to existing validation. Not Attending hides the count and its errors. Returning to Attending retains the raw count and revalidates it. No visible event selector remains. The first configured schedule row supplies the existing eventId (`matrimony` in this invitation); no new event record is created. An unconfigured event disables confirmation with an explanation. `normalizeRsvpSubmission` omits count and event keys for nonattendance, matching the current frontend validator. Backend inspection found only Hono GET `/`, so there is no live RSVP API or multi-event backend behavior to claim.

The user's restoration request now includes previously preserved local content. The local two-chapter 2025/2026 story matches the final English copy recovered from https://chatgpt.com/c/6abb796c-9d24-83ec-af1e-ce7f475bc942?messageId=c5d9e4f8-b2f8-4b1b-8ac8-b830b9943767 paragraph for paragraph; do not rewrite it. The local supplied groom asset is `/images/the-groom.jpg`, 4096×2304; actual pixels were inspected and show Bayu wearing glasses in a cafe/shop setting, not the camera/mountain template. Local gallery heading is `Our Little Adventures.` with five supplied adventure images. Local gift and closing assets are also supplied replacements and are included unchanged in the integrated local preview.

Proven drift source: remote commit 004035c and its clean deployment source still contain the three template Japan chapters, camera/mountain groom, 16 template gallery photos, gift placeholder and closing placeholder. Those local fixture/media edits were deliberately preserved but excluded from earlier narrow form commits; this was publication omission, not deletion of the local work. The restoration integrates the exact surviving local files and assets, including the ChapterRecord array change required for two chapters. No checkout/reset or new content invention is needed.

Final visual correction: the surviving groom metadata used centered focal points, which cropped the right-positioned face out of the narrow portrait. After inspecting the actual supplied pixels and local mobile render, both focal points are moved to `100% 50%`; the original photo bytes, dimensions and identity remain unchanged. This is an explicit local crop correction, not a different replacement asset.

## Static JSON architecture update

The latest architecture requirement is frontend-only public JSON assets. `app/assets/data/invitation.json` now owns the complete public invitation model, and `app/assets/data/media.json` owns the media catalogue. The existing TypeScript modules only import/type these JSON documents. Migration was compared against the prior fully evaluated objects and preserves all values, including recovered story, groom crop, gallery, responsive image sources and existing public gift data.

Only public display data belongs in these assets. Query-derived guest names, access keys, form drafts and incoming responses are excluded. Existing static display wishes remain editorial/public seed content; they are not collected submissions. Assets are build-time imports, so content edits require rebuild/publication. A browser cannot persist changes to deployed static JSON. The unused backend scaffold is not connected or expanded.

Response delivery is still awaiting the user's choice. Until then, the actions read `Review RSVP` and `Review Gift Confirmation`, and feedback explicitly says nothing has been sent or saved. Do not add WhatsApp, localStorage or a remote collection endpoint without the pending decision.
