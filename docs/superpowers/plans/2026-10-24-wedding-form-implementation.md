# Wedding Shared Forms Implementation Plan

> Execution: implement inline in the current task, with checkpoints. The user has already authorized planning followed by local implementation; do not pause for another approval or publish this revision.

**Goal:** Bring all wedding form fields and interactions closer to the measured LAIN reference through reusable Vue components, with preserved validation and submission behavior.

**Architecture:** Keep RSVP and GiftDialog as domain owners of drafts, validation, conditional attendance fields and success messages. Extract native field, native radio group, action and status primitives under the existing invitation/shared directory. A decorative desktop companion receives only an active field label.

**Tech stack:** Existing Nuxt 4, Vue 3, TypeScript, CSS, Canvas 2D, Vitest and Playwright. No new dependency or backend API.

## File map and APIs

Create `app/components/invitation/shared/InvitationFormField.vue`.

```ts
// Public shape; parent remains responsible for domain validation.
interface FieldProps {
  id: string; number: string; label: string; modelValue?: string | number;
  type?: 'text' | 'number' | 'textarea'; placeholder?: string; readonly?: boolean;
  required?: boolean; error?: string; help?: string; detail?: string;
  autocomplete?: string; min?: string; max?: string; step?: string; inputmode?: 'decimal' | 'text';
}
// emits update:modelValue(value: string), activate(label: string)
```

Field builds `${id}-error` and `${id}-help`, associates the real label, owns `.is-filled` and focus visuals, passes native numeric attributes, and emits strings as existing inputs do. It must not truncate messages, parse gift amounts, trim payloads or submit.

Create `InvitationFormChoices.vue` with `string | number` typed values: id/number/label/name, `modelValue?: string | number`, options `{value:string | number,label:string}[]`, required/error; emits update:modelValue(string | number) and activate(label). First radio retains existing focus target ID. Each radio shares its native name and error reference. Hidden check glyph is decorative. Long option labels wrap.

Create `InvitationFormAction.vue`: label, busyLabel (Saving…), busy, disabled. Renders native submit button, corner strokes and inner press label. Disabled is `busy || disabled`; action does not own the form's submit handler.

Create `InvitationFormStatus.vue`: message prop; persistent role=status polite region. No duplicate alert for the same success.

Create `InvitationFormCompanion.vue`: text prop restricted by callers to safe field labels. Canvas renders sampled text targets, finite quint interpolation; matchMedia listener paints immediately for reduced motion. Unmount cancels animation/listeners. On mobile it is hidden; canvas is never a focus target or essential instruction.

Modify `RsvpSection.vue`, `GiftDialog.vue`, `app/assets/css/forms.css`, and remove obsolete form-only rules in `app/assets/css/scenes.css`. Keep main.css import from prior revision. Modify browser tests to use semantic radio selection for gift recipient as well as RSVP.

Create `tests/components/form-components.test.ts` and `tests/components/rsvp-form.test.ts` and expand `tests/browser/forms.spec.ts`.

## Task 1: Protect contracts and prepare clean working source

- [ ] Record original git status; preserve existing changes to StoryChapters, invitation fixture, media manifest, types, component/media tests and untracked photographs.
- [ ] Work from a clean tracked-file archive under `/tmp/wedding-interactions-work`; use installed dependencies. Do not deploy this archive.
- [ ] Finish the design and micro-interaction documents before source edits.
- [ ] Reconfirm inventory with `rg -n '<form|<input|<select|<textarea' app -g '*.vue'`.

## Task 2: Extract and verify primitives

- [ ] Implement Field, Choices, Action and Status APIs above. Use actual native controls, explicit IDs and existing payload values.
- [ ] Add unit tests for label association, help+error IDs, empty and filled classes, emitted values, readonly/numeric attributes, radio checked state and stable accessible labels, disabled busy action and persistent status.
- [ ] Test command: `bun run test`; expected all suites pass, including new shared component cases.
- [ ] Implement centralized mono uppercase metadata, 35px desktop/24px narrow text, grayscale placeholders and measured focus/color timing. Keep AA foreground and outline contrast; don't reproduce unreadable reference placeholders.

## Task 3: Migrate every form and side context

- [ ] Replace all RSVP field/choice/action/status markup. Preserve `validateRsvpDraft`, first-error focus IDs, attendance enum and existing 240ms local-save flow. Default Attending; use a blank manual numeric count with min 1/max 2/step 1. Hide count only for Not Attending; retain draft count when switching back. Remove event selector and pass first configured event ID from InvitationExperience. Normalize nonattendance before validation/local preview event so no stale count/event is submitted.
- [ ] Replace all gift form controls, including recipient choice, with shared components. Options derive from original `banks`, value remains bank.id. Preserve positive finite amount validation and synchronous preview message.
- [ ] Add finite particle companion below existing RSVP image and gift bank panel. Set `activeField` from component activate events; never pass draft.name, amount, account or note into companion.
- [ ] Preserve immediate accounts and Copy actions untouched.
- [ ] Remove only obsolete rsvp-field/rsvp-submit and gift field CSS. Keep all non-form scene and bank-list styling.

## Task 4: Test functional flows and motion states

- [ ] Existing browser flows: empty RSVP, default Attending, immediate blank count, count integer/min/max requirements, hide/show and draft preservation, 501-character wishes error, valid message, Saving disabled/aria-busy, success, not-attending path.
- [ ] Gift: empty name/recipient/amount, first-invalid focus, negative amount, valid amount, optional note, synchronous success, close/reopen draft, Escape restores focus.
- [ ] Motion: real hover over field, choice and action; focused rule computed scale; filled state after blur; action mouse-down/up local feedback without production writes.
- [ ] Reduced motion: assert transition durations are 0s, decorative companion settles instantly and remains nonessential.
- [ ] Layout: 320/390/768/1680px; inspect safe local screenshots and geometry. Native radio controls retain Arrow/Space behavior; no control depends on hover.
- [ ] Test command: `bun run typecheck && bun run build && bunx playwright test --config /tmp/wedding-interactions-playwright.config.ts` using installed Chrome because bundled Playwright browser is absent.
- [ ] Do not submit reference forms or production wedding forms.

## Task 5: Apply and report local result

- [ ] Copy only scoped form components/styles/tests and these three plans into original repository after verifying no new overlap.
- [ ] Run `git diff --check`; inspect scoped diff and original unrelated status.
- [ ] Record real results, changed files, evidence limits and local preview location. Report ready for review/publication.
- [ ] No commit, push or deployment in this revision; existing production stays on 004035c.

## Validation snippets and failure handling

```ts
const input = wrapper.get('input')
expect(input.attributes('aria-describedby')).toBe('sample-error sample-help')
await input.setValue('Example')
expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Example'])
```

```ts
await page.locator('#gift-name').focus()
await expect(page.locator('#gift-name')).toBeFocused()
await expect(page.locator('#gift-name')).toHaveAttribute('aria-invalid', 'true')
await page.emulateMedia({ reducedMotion: 'reduce' })
expect(await page.locator('.field-rule').first().evaluate(el => getComputedStyle(el, '::after').transitionDuration)).toBe('0s')
```

If reference browser access fails again, retain measured states and mark unobserved hover/press timing as unverified. Do not substitute invented findings. If a form path fails, repair within the scoped components and rerun relevant tests before broader verification. Never hide a layout problem with page-wide overflow clipping.

## Restoration integration task added by the user

Copy the preserved local fixture, media manifest, StoryChapters array support, ClaireContent chapter-array type and existing content/media tests into the isolated working source. Copy the exact supplied groom, gift, footer and five adventure assets. Do not rewrite the recovered 2025/2026 story or invent a gallery title. Make browser gallery assertions derive the configured gallery count instead of hard-coding 16. Add tests that reject the template Japan narrative and assert the supplied groom/gallery source paths. Apply form changes back alongside the preserved originals, but do not overwrite those originals with older clean-archive versions. Keep these files uncommitted; publication was not requested in this revision.

## Verification record

- Implemented locally and applied to the original wedding repository. No new commit, push or deployment; HEAD remains 004035c.
- 59 unit tests passed in the integrated single-worker suite; the two new restoration tests passed separately, for 61 unique passing tests. Repeated-submission tests passed again after adding the duplicate guard assertion.
- Full source typecheck and final test typecheck passed. Production build passed, including the final groom focal correction.
- Ten form/invitation browser tests passed at 320/390/768/1680px, including actual hover/focus/press endpoints, reduced motion, private-value exclusion from companion, and attendance/gift positive and negative flows.
- One focused restored-content browser test passed for mobile and desktop before the final focal correction. It verified two real story chapters, supplied groom image load, new gallery heading, five images and supplied gallery image load.
- The first restored-content run exhausted its time budget while taking full story screenshots; the bounded rerun without those heavy captures passed. The extra post-crop visual test exceeded its 90-second test budget and failed by timeout; it is not reported as passed. This last crop screenshot is unverified; the unchanged image bytes, crop metadata, unit assertion, rebuilt app and local SSR focal styles were verified.
- Preview: http://127.0.0.1:4180/invite/demo . Loopback only, no production writes.
- `git diff --check` passed. The recovered fixture, story/type support and supplied image bytes match the integrated preview. Original local story and images were retained; only groom crop focus was deliberately corrected based on actual pixels.
- Reference caveats remain: no third-party submission, no measured submit pressed timeline, 390px viewport emulation rather than physical touch-device testing, and no pixel-perfect parity claim.

## Static JSON implementation update

- Canonical assets: `app/assets/data/invitation.json` and `app/assets/data/media.json`.
- Compatibility loaders: `app/data/invitation.fixture.ts` and `app/data/media.manifest.ts` import the assets and expose existing typed exports.
- Preserve semantic equality to both pre-migration objects; the migration equality check passed without logging account values.
- `tests/utils/static-content.test.ts` verifies canonical JSON loading and excludes credential/response-inbox keys. The component test verifies local form review does not mutate invitation data.
- Form labels/status/tests now reflect review-only behavior while response destination remains pending. No collection method, persistence or API was added.
- README documents editing/building public content and explicitly states static JSON cannot receive browser writes.
- Keep all of this local; no additional commit, push or deployment has been requested.

JSON revision verification: all 64 tests in 17 unit suites passed, full typecheck and production build passed, and all five form browser cases passed (320/390/768/1680px plus hover/focus/press/reduced-motion). The pre/post migration equality check confirmed content/media values were preserved. No response delivery or persistence has been enabled.

## Follow-up backend boundary

The user subsequently requested a separate Express 5/Supabase backend. That work belongs to another worker. Public invitation copy/media remain the JSON assets completed here; no backend directory, schema, credentials or persistence route was changed by this frontend task. Frontend delivery is intentionally not connected yet.

Current RSVP integration point: `RsvpSection.submit`, after validation, emits `previewSubmit` with `RsvpDraft`. Attending payload contains attendance=`ATTENDING`, eventId from the first configured event, attendanceCount as integer 1–2, optional note ≤500 Unicode code points. Not Attending normalizes to attendance=`NOT_ATTENDING` and optional note, omitting stale count/event. Query display name and invitation shortcode are not currently part of this emitted draft and must be supplied/validated deliberately at integration.

Current gift integration point: `GiftDialog.submit`, after local validation. Draft keys are name:string, bankId:string, amount:string, note:string. Name must be nonblank; bankId must match an existing public gift record; amount must parse to a finite positive number. The UI currently shows only local review feedback and emits no network request or server response. Existing gift records include a postal-address display row; backend integration should distinguish actual bank recipients instead of assuming every display row is a transfer account. No account number is included in a draft payload.

No API URL, authentication scheme, request envelope or server response schema exists in the frontend yet. Until that contract is established, review actions explicitly say nothing was sent/saved and do not write JSON or storage.
