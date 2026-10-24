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

## Public invitation data

Edit `app/assets/data/invitation.json` for the public invitation copy, configured events, existing public gift details, and static display wishes. Edit `app/assets/data/media.json` for image paths, dimensions, responsive sources and focal points. The small modules under `app/data/` are typed compatibility loaders, not a second content database.

These JSON assets are imported into the frontend build. Rebuild and publish to update the website; a visitor's browser cannot write responses back to deployed static JSON. Do not put credentials, personal access keys, guest lists, incoming RSVP responses, or gift confirmations in these assets. The existing display-wishes seed is public page content, not a response inbox.

RSVP and gift actions currently review and validate page-local drafts only. They explicitly state that nothing has been sent or saved. A response destination has not been selected; no WhatsApp integration, local-device persistence, or backend write is currently wired into this frontend. A separate Express 5/Supabase backend is being handled independently; public invitation content remains JSON and response delivery awaits that integration.

## Private invitation management

`/manage-invitations` is server-gated. The private Nuxt runtime setting `NUXT_INVITATION_ADMIN_API_BASE` must point to the approved backend origin before login is available; its default is empty and fails closed. Do not put this setting, passwords, service keys, or session tokens in public JSON or public runtime config.

Login/session/logout use the backend's email/password and HttpOnly-cookie contract through a same-origin server proxy under `/manage-invitations/api`. Only the dedicated session cookie is forwarded; its browser path is scoped to `/manage-invitations`. Mutations require same-origin requests and the backend CSRF token, held transiently in memory. Admin eligibility and password verification belong to the backend.

The workspace can prepare a local `.xlsx` preview after verified access. ExcelJS 4.4.0 is loaded lazily; parsing runs in a worker with an eight-second budget. Limits are 2 MiB, 200 data rows, 20 columns and declared expanded ZIP content up to 20 MiB. Formula/object cells, macro/external-link parts, encrypted/ZIP64 archives and invalid mappings are rejected. Downloadable template headers are `name`, `externalId`, `maxAttendees`. No real guest data is stored in public assets.

Private invitation list/record DTOs, approved transactional storage/RPC, and public shortcode lookup still need integration. No production gateway is connected, so manual/import Save remains disabled and proposed codes are not claimed to be active invitations. The design/UX/implementation plan and acceptance matrix are in `docs/superpowers/plans/2026-10-24-invitation-management.md`.

### Approved invitation integration

The admin workspace now uses same-origin authenticated list/import proxies and opaque server-issued token links. For local Node backend operation, provide private process environment `NUXT_INVITATION_ADMIN_API_BASE=http://127.0.0.1:3001` when starting Nuxt; keep backend secrets and password hash server-only. The backend must be running and allow the exact frontend Origin. New tokens resolve only name/maxAttendees, and RSVP/gift proxies verify that context before forwarding. Demo remains review-only. RSVP/gift requests forward the validated route token in X-Invitation-Token. Backend source now independently verifies invitation identity/limits and associates stored responses with the invitation. Tests use an isolated synthetic backend and never add real guests.
