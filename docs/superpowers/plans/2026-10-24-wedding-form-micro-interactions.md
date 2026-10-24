# Wedding Form Micro Interaction Plan

Written before implementation, 24 October 2026. Read alongside the design evidence and implementation plan.

## Evidence labels

M = measured computed CSS with observed state endpoints. O = visually or through keyboard observed. A = proposed wedding adaptation. U = unverified reference behavior. Durations below are not claimed from screenshots.

| Interaction | Reference evidence | Wedding behavior | Timing and easing | Reduced motion |
| --- | --- | --- | --- | --- |
| Focus field | M: label color 400ms; rule 900ms cubic-bezier(.19,1,.22,1) | Label brightens and foreground rule expands left to right. Keyboard outline appears immediately | 400ms color / 900ms transform | Immediate endpoint, visible outline retained |
| Blur empty/filled | O: active label follows next field, typed value remains | Rule retracts on blur; filled text stays at primary contrast | Same CSS rule; no delayed state update | Immediate |
| Pointer hover field | U: exact pointer endpoint not captured | Lighten rule/label only for hover-capable pointers | A: 200ms color, no layout movement | Immediate |
| Choose option | M/O: quiet dark chip becomes white/dark, 350ms transitions | Native radio updates synchronously; inverse selected color and hidden-from-AT check indicator | 350ms color/background | Immediate |
| Hover option | M declared CSS: white text on `.cx_chip:hover` | Brighter text/border, selected contrast preserved | 350ms | Immediate |
| Keyboard group | O reference Tab reaches each service button | Wedding uses radio Arrow/Space/Tab conventions because fields are single-choice | No JS keyboard imitation | Identical functionality |
| Action hover/focus | O bracket structure; U complete pointer movement | Corner strokes move outward 2px and text brightens; outline on keyboard focus | A: 220ms quint-out | Static brackets/outline |
| Action press | U intentionally not pressed on third-party submit | Inner label moves down 1px while pointer/key is active; no action until normal native submit | A: 100ms quint-out | No movement |
| RSVP saving | Existing wedding behavior | Busy lock/disabled action, Saving label; success announced after existing 240ms local flow | Preserve 240ms contract | Same state semantics, no spinner |
| Gift success | Existing synchronous preview confirmation | Immediate local success announcement, no invented network/loading wait | Synchronous | Same |
| Error | Existing validation contract | Error text appears; focus moves to first invalid control; error rule uses semantic error color | Immediate, no shake | Same |
| Companion | O Company typed value appeared as particle text; services changed shape | Morph safe active-field titles, not private field values; finite point interpolation stops when settled | A: 450ms quint-out, opacity fade optional | Draw endpoint once; no frame loop |
| Conditional RSVP groups | Existing attending logic | Count starts visible and blank under default Attending; hide only for Not Attending and restore its typed value on return. No event selector, no animated height or postponed focus | No layout animation | Same |
| Close/reopen dialog | Existing dialog behavior | Escape restores trigger focus; draft state remains in component | Existing dialog contract | Same |

## State and acceptance matrix

| State | Field | Choice | Action/status | Acceptance evidence |
| --- | --- | --- | --- | --- |
| Empty | Readable placeholder; number/label present | No false default selection | Enabled truthful CTA | Component render test and browser screenshot |
| Hover | Quiet-to-bright line, no movement | Text/border brighten | Brackets expand, cursor clear | Browser computed styles before/after real hover |
| Focus | Active rule scaleX(1); associated label | Visible frame around full target | Visible outline | Tab/Shift-Tab and focused CSS assertions |
| Filled | Value preserved after blur, `.is-filled` | Selected value preserved | No premature success | Model update and blur test |
| Selected | Not applicable | Native checked state, inverse color and non-color check cue | No automatic submit | Arrow/Space and click tests |
| Press | Native caret/selection | Native toggle | 1px text press only, no duplicate request | Local mouse down/up state assertion |
| Readonly | URL guest name remains readonly | Not applicable | Can still continue | RSVP name test |
| Invalid | Linked error, invalid attr, correct first focus | Error describes group; focus first option | No success retained after invalid submit | Empty and 501-character negative flows |
| Busy | Existing fields remain accessible | Existing choices unchanged | Disabled and aria-busy; no duplicate submit | Controlled local clock test |
| Success | Input values retained | Selection retained | Polite live region, exact existing preview message | Positive RSVP and gift flows |
| Clipboard failure | Existing account numbers selectable | Not applicable | Existing fallback message preserved | Existing gift-copy test |
| Narrow viewport | Controls and text wrap, no clipping | Chips wrap, ≥44px targets | Action wraps label, no overflow | 320/390px geometry plus visual inspection |
| Tablet | No squashed two-column form | Same controls | Same behavior | 768px form geometry |
| Reduced motion | No rule/color transition delay | No transition | No press transform | Computed durations and endpoint assertions |
| Companion idle/active | Only active category mirrored | Only safe context label mirrored | No bank/amount/note/name echo | Context change test; canvas endpoint checks |
| No JS visual | Fields still ordinary DOM controls | Native radios | Native form semantics remain | Canvas is decorative and optional |
| Dialog reopened | Draft persists as before | Recipient persists | Close returns focus | Local close/reopen test |

## Performance and privacy

Only transform, opacity and colors are animated. No animated dimensions, global mouse followers, sound, perpetual particle loops, network calls, storage of drafts, or mirroring of sensitive values. Canvas work is bounded to a small desktop region, device pixel ratio capped at two, old requestAnimationFrame cancelled on new context/unmount. Runtime changes to prefers-reduced-motion must cancel movement and paint the destination.

## Known reference limits

Brave disconnected while observing the Send Brief hover. Its bracket structure and focus CSS were read, but an exact action-hover timeline and pressed reference state remain unverified. The third-party action was deliberately never activated. Mobile study used a 390px viewport, not a physical touch device or OS virtual keyboard. No pixel-perfect claim is justified by these observations.

## Latest RSVP state additions

| State | Required behavior | Verification |
| --- | --- | --- |
| Initial RSVP | Attending selected; count visible, empty; no event selector | Browser and component tests |
| Invalid count | Empty, 0, 3, fractional values rejected under existing 1–2 policy | Browser negative cases |
| Not Attending | Count hidden and count/event errors removed; normalized submission excludes stale values | Component payload and browser tests |
| Switch back | Keep raw typed count; revalidate, retaining invalid feedback if needed | Toggle tests |
| Repeated submit | Busy guard prevents duplicate preview events; later corrected/repeated submissions still work | Timed component/browser tests |

## Pending response destination

The loading label is `Checking…`, not Saving. The existing short local validation feedback and duplicate-action guard remain, but completion means only `RSVP details checked on this page. Nothing has been sent or saved.` or the equivalent gift message. Review actions do not write JSON, persist device data, send WhatsApp, or call a backend. The busy/success acceptance rows above now mean local review completion, never durable saving or delivery.
