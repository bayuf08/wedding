# Wedding navigation design plan

## Scope and design read

Reading this as a personal wedding invitation for invited family and friends, with the approved photographic, black/light-neutral and serif wedding design. ENERGY 2 / RHYTHM 2 / MOTION 2. The menu is the single choreographed transition in this task; existing page motion is not redesigned.

Visitors may use a phone outdoors or a desktop at home. Preserve the current colors, typefaces, font sizes, line heights, spacing, menu positions, photo, seven labels and section destinations. The existing burger remains on both desktop and mobile. No LAIN branding, grid lines, agency copy, numbers or contact blocks are added.

## Direct reference evidence

Studied https://lainagency.com/ in Brave on the connected Mac, including a 390x844 viewport. The following are actual browser/DOM observations:

- The visible mobile menu uses five vertical curtain columns. Ten columns exist in the rendered DOM; five are hidden at mobile width.
- Opening columns grow upward from the bottom with non-uniform ordering. An intermediate screenshot showed different column heights before menu text appeared.
- The two-line burger becomes an X. Settled rendered transforms are rotations of +45/-45 degrees with vertical translations +4/-4px in LAIN.
- Text is revealed through clipped letter wrappers. Initial rendered letter translateY is 125%; settled labels are untransformed. Number/details appear later.
- Closing columns have their origin at the top and end with scaleY(0), while the menu becomes hidden. Escape closes it.
- Selecting About navigated to /about and left the menu collapsed.
- A Tab after opening moved to a background recent-work link. This is an observed accessibility friction, not a behavior to copy.

Exact LAIN easing functions and durations are unverified: computed styles expose inline animation transforms but not the JavaScript timeline. No numerical timing below is claimed as measured LAIN timing. The browser observation channel timed out on a later recovery operation; reference behavior above was observed beforehand.

Both supplied Library images resolved. Supported materialization failed with `download failed`; one bounded retry per file also failed. No readable files were obtained. Without readable files there is no pixel-level evidence from those attachments. Static images could not establish duration regardless.

## Adaptation and purpose

| Decision | Purpose |
| --- | --- |
| Existing wedding light neutral for curtains | Continuous entry into the unchanged menu surface |
| Five mobile / ten desktop decorative columns | Transfer the observed directional choreography without new content |
| Reveal whole existing labels through a mask, in sequence | Preserve serif shaping/kerning and seven existing labels rather than split typography into atomic letters |
| Existing photograph appears after curtain starts | Reveal the existing desktop composition, with no new media |
| Shared two-line icon morph | Connect the original trigger to its close state on either breakpoint |
| Native modal remains present through exit | Preserve focus containment and prevent background interaction during animation |
| Reduced-motion and manual-pause instant states | Access to navigation never depends on decorative movement |

## Visitor journey

1. At any scroll position, activate the existing burger by touch, pointer, Enter or Space.
2. Lock the existing document position immediately and show the native modal.
3. Curtain columns reveal the existing menu, then the label sequence and desktop photo. Close control receives focus immediately and remains usable while animation is running.
4. Select an existing section at any time. Retain only the latest destination, run exit, unlock, then scroll/focus that section using current navigation semantics.
5. Escape, close control or empty panel background can dismiss. Dismiss restores focus to the original trigger and the exact saved document scroll position.

## Acceptance and unchanged design

- Settled menu uses the same CSS colors, type, positions, photograph, labels and destinations as baseline 06f476d.
- No horizontal overflow at 320/390/768/1680px. Short screens retain native vertical dialog scrolling.
- Opening and closing have visible intermediate curtain and label states. Endpoints are fully covered/fully closed.
- Repeated toggles reverse from the current presentation without stale completion callbacks closing a reopened menu.
- Resizing while active does not close the menu, lose focus, release scroll lock or leave a partial final state.
- Focus remains in the modal until exit completes. Navigation focuses its destination; dismissal returns to the trigger.
- No changes to forms, calendar, story, assets, guest data, backend configuration, credentials or production.

## Delivery gate

Final evidence must cover Hard Gate (overflow/keyboard/real controls), Purpose (the table above), Liveliness (one navigation sequence consistent with the declared dials) and Craftsmanship (interruptions, accessible alternatives, actual tests/build). Unavailable reference measurements remain explicitly unverified.
