# Wedding navigation transition plan

## Reference versus adaptation

Observed LAIN directions: bottom-origin column reveal, burger to +/-45-degree X, clipped text reveal, top-origin column exit, delayed secondary content. Exact durations/easing are unverified. The following are chosen wedding timings, not claims of exact source parity.

## Choreography

| Track | Opening | Closing | Easing/purpose |
| --- | --- | --- | --- |
| Curtain columns | 600ms, deterministic non-sequential delay up to 216ms | 420ms, reverse ordering delay up to 108ms | cubic-bezier(.19,1,.22,1), directional surface reveal |
| Seven link labels | 440ms, 200ms lead-in +45ms per label | 160ms, reverse 14ms staggering | same curve, legible order without changing typography |
| Desktop photo | 420ms after 220ms, translateY/opacity | 180ms | existing photo enters after the surface |
| Existing caption | 320ms after 480ms | 120ms | supporting copy follows navigation |
| Shared burger glyph | 300ms between its two stable poses | 300ms | same curve, clear state connection |

Maximum chosen opening sequence is 910ms; maximum exit is 528ms. All ten column tracks run at both breakpoints so a resize cannot expose an uninitialized column. Mobile CSS displays five and desktop ten. Only transform/opacity change; layout, colors and text are not animated.

## Geometry and interruption

Each column uses a top transform origin. Fresh opening starts at translateY(100%) scaleY(0) and ends at the identity; this makes its visible bottom edge remain anchored while it grows upward. Closing ends at translateY(0) scaleY(0), contracting toward the top. This matches the observed directions while permitting continuous interruption.

Before changing direction, capture current computed transform/opacity, cancel previous Web Animations and start the new tracks from those values. A monotonically increasing generation invalidates every stale completion. There is no queued backlog and no timeout-only removal of the dialog. On successful completion, commit final inline presentation and cancel animation objects.

## State machine

| State/event | Result |
| --- | --- |
| closed + open prop | Save return-focus element, native showModal, presence=true, opening |
| opening + toggle | Closing from current presentation |
| closing + toggle | Clear queued destination and reopen from current presentation |
| opening/open + Escape or outside | Clear queued destination, close |
| closing + Escape/outside | Remain closing, clear queued destination, do not restart the same exit |
| any visible state + section | Latest valid destination wins; close once and navigate only after exit |
| opening completion | Commit open endpoint |
| closing completion | Native close, presence=false, restore trigger focus OR emit queued navigation |
| external prop false | Close while retaining presence lock until finished |
| native unexpected close | Synchronize state and parent once |
| reduced-motion/manual-pause change | Cancel tracks and settle immediately to current intended endpoint |
| unmount | Cancel tracks/listeners, native close, release presence; no stale callbacks |

## Accessibility and interaction rules

- Native modal supplies focus containment. Initial focus goes to its close/toggle control, which is available immediately, not delayed until decorative tracks finish.
- The trigger exposes aria-controls and aria-expanded. Decorative columns and burger lines are aria-hidden. Existing section labels remain ordinary accessible button text.
- Native Escape/cancel is intercepted to allow exit completion, with no lost dismissal.
- Outside dismissal applies to empty menu surface only; pointer down and click must both begin/end outside interactive menu/photo content. Dragging out of a link does not dismiss accidentally.
- Body lock is the existing saved-position lock. Modal presence is included in its condition through the closing frame. There is no nested competing body-lock implementation.
- Reduced motion or manual pause skips curtain/label/icon animation, preserving identical final controls and focus behavior.
- No new gestures, hover prerequisites, layout modes, sound or dependencies.

## Evidence required

Capture both settled and intermediate frames on phone/desktop. Check computed transforms at intermediate progress rather than inferring motion from two endpoints. Test early link selection, rapid toggle reversal, repeated Escape, outside drag guard, tab cycling, exact scroll restoration, breakpoint crossing and reduced motion changes mid-flight. Compare settled menu computed design metrics and image source against 06f476d.

## Implementation refinements

Keyboard focus entering a navigation label settles entrance immediately so no keyboard user lands on invisible text. The close control uses the existing light surface color beneath its dark glyph, maintaining contrast before surrounding curtains reach it; at rest the plate blends into the unchanged menu surface. Text/menu contrast measured 15.27:1 and close glyph contrast 14.30:1.

Intermediate-frame tests exposed a singular-matrix interpolation defect at scaleY(0). Curtain start values are now reconstructed as separate translateY/scaleY functions, preserving continuous interpolation and reversal. A dedicated regression guards that case. A stale native close event is ignored if a new modal has already opened. Deterministic frame tests pause actual native Web Animations at creation and seek their real keyframes; other interaction tests run unpaused.
