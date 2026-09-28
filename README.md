# Claire invitation reconstruction

Nuxt 4 implementation of the Bayu and Hilwa invitation described in the four plans at the workspace root. The public demo is `/invite/demo?to=Guest+Name`.

## Run locally

```bash
bun install --frozen-lockfile
bun run dev
```

Open `http://localhost:3000/invite/demo?to=Guest+Name`. The optional `to` query fills the guest name as text; omitted, empty, or invalid values fall back to `Guest Name`. In the development server only, `?qa=static` skips the timed loader and cover for local inspection.

## Verify

```bash
bun run test
bun run typecheck
bun run build
bun run test:e2e
bun run test:visual
```

The browser suites use the built app with a temporary production preview on localhost:4173, so run `build` first. `test:visual` captures four calibrated checkpoints and an eleven-scene desktop survey. To prepare or refresh visual evidence, use `bun run media:prepare`, `bun run reference:prepare`, and `bun run reference:compare -- tests/visual/reference/2.png tests/visual/candidates/cover.png`. The comparison command writes side by side, half opacity, and difference images under `tests/visual/comparison/`.

The page contains the opening sequence, responsive scenes, scroll reveals, accessible navigation and photo dialogs, wishes pagination, and local RSVP and gift preview forms. Form submissions stay in page memory. The displayed account numbers are demonstrations. The sample wedding date contains `202X`, so the calendar action explains that valid event data is unavailable.

The main hero video is bundled locally. The film button embeds the reference YouTube video when clicked and requires network access. Image roles, source URLs, and generated sizes are recorded in [the asset register](docs/asset-register.md). Browser observations and remaining validation work are in [the validation log](docs/validation-log.md).

The existing protected, unavailable, and unknown shortcode routes retain their separate access states. No backend or payment endpoint is used by this reconstruction.
