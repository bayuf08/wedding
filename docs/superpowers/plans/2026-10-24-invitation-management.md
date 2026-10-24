# Private invitation management: design, UX and implementation plan

Status: local UI/proxy verified. Email/password auth contract aligned; backend origin/hash, invitation storage/list and public lookup integration remain pending. No production writes or publication.

## Design and visitor goal

Reading this as a private wedding guest-management tool for the hosts preparing invitations, using the wedding's neutral surfaces, Inter body text, serif page heading and restrained numbered fields. ENERGY 1 / RHYTHM 2 / MOTION 1. The practical task is to add names and obtain unique invitation links, with clear review before a batch creates records. A quiet light surface fits daytime list editing; no particle decoration or marketing panels are needed here.

Reuse InvitationFormField, InvitationFormAction and InvitationFormStatus. Use one page header, a manual/import switch, a preview region and a guest list. Tables become stacked readable rows on narrow screens. Use 44px targets and existing focus outlines; text/error states supplement colors. Inline confirmation is preferred to another modal.

## Scope and security boundary

Route proposal: `/manage-invitations`. Its data and editing workspace require server-side authorization, not knowledge of that URL or a client boolean. Until the approved backend origin and secure hash are configured, the Nuxt server marks access unavailable and only a locked setup/login state is rendered. An unavailable authentication check cannot grant access. No client secret, hardcoded password, email allowlist, provider setup, login email, Supabase service key or bypass query is introduced.

There is no public guest-data JSON. Public invitation copy/media remain their existing assets. A typed UI gateway is a seam for the agreed backend adapter, not an implemented API or a promise that saving works. Tests may mount the workspace with synthetic gateways; production has no configured gateway yet.

The final selected method is email/password verified by the backend. Do not advertise working login while its private origin/hash configuration is absent. Admin account eligibility is enforced by the backend, never by browser comparison.

## Contract proposal for parent/backend coordination (not an endpoint contract)

The workspace needs these domain operations: list/search authorized guest summaries; create one invitation; import a reviewed set of rows; refresh after mutation. Suggested record fields: id, name, shortcode, guestLimit and enabled. Suggested create fields: clientRowId, name, optional requested shortcode, guestLimit. Suggested mutation key: operationId plus stable per-row clientRowId, with results keyed to each input row and explicit created/duplicate/rejected/unknown statuses. Backend must independently validate uniqueness, limits and admin authorization on every operation. Exact endpoint names, auth transport and response envelopes are intentionally not hardcoded until agreed.

Current invitation model exposes `slug` and name via invitation URL context, while RSVP accepts a maximum of two attendees. Proposed manual/import fields are invitation name (1–100 Unicode code points), optional shortcode (3–64 lowercase ASCII letters/digits/hyphens, excluding reserved demo/protected/state routes), guest limit (1–2, default upper limit 2 displayed explicitly). Default attendee count remains blank on RSVP; guest limit is not a submitted attendance count.

## UX flow

1. Open private route. Show checking state only while a real check runs; show locked/unavailable if no auth adapter. No guest list or import controls are rendered for unauthorized users.
2. After verified access, list/search guests with loading, empty, no-match and retryable-error states.
3. Manual entry validates name, shortcode and limit locally. Server remains authoritative on uniqueness. Generated links are displayed only for confirmed returned records; never claim a proposed link is active.
4. Excel import begins with a downloadable empty `.xlsx` template with literal headers `name`, `shortcode`, `guestLimit` and a separate instructions sheet. No fabricated guest rows are included.
5. Choose one `.xlsx` file, max 2 MiB, first visible worksheet, max 200 data rows and 20 columns. ZIP directory preflight caps declared expanded content at 20 MiB/500 entries and rejects encrypted, ZIP64, macro and external-link parts. Reject any formula/error/hyperlink/rich-text cell rather than using cached formula results. ExcelJS reads workbook data; no macro or formula engine is executed.
6. Map headers explicitly; common literal aliases may preselect a mapping. Require distinct columns and a name column. Preserve source row numbers in every result.
7. Preview valid and invalid rows. Explain row errors, name duplicates, shortcode duplicates within file and collisions with existing authorized records. Names use Unicode NFC/case-folded comparison for duplicate warnings. Distinct names are allowed; duplicates require correction rather than silent overwrite.
8. Confirm count explicitly with a checkbox before Save. Invalid rows are excluded, and the user sees how many will be attempted. No automatic import on file selection.
9. A stable operation ID and stable row IDs survive retries for the same preview. Successful rows become locked as completed. Retry only unresolved/retryable rows, using the same keys; do not automatically resubmit known successes. Changed file/mapping produces a new preview/key.
10. Do not log guest names, workbook content, tokens or raw server errors. Render names as text, never HTML. Template/error export strings are literal text with formula-prefix escaping, and no CSV is opened/executed.

## Implementation sequence

- [ ] Add `app/types/invitation-admin.ts` for the UI domain gateway and row/result types. No API URLs or provider selection.
- [ ] Add ExcelJS as a browser-lazy dependency; keep it out of the public invitation path.
- [ ] Implement `app/utils/invitation-import.ts`: validation, mapping, duplicate checks, template, safe exported text, workbook preflight and parsing limits.
- [ ] Implement `app/components/admin/InvitationWorkspace.vue` with reusable form fields, manual create, file preview, explicit confirmation, per-row results, same-key retry and search/list states.
- [ ] Add server gate, route page and locked component. Fail closed until an approved server authorization adapter is wired. Do not modify the backend worker's files/schema.
- [ ] Unit-test Unicode/XSS strings, invalid counts/shortcodes, duplicates, formulas, macros, ZIP limits, malformed workbook, headers, retry keys and partial results with synthetic data only.
- [ ] Browser-test the locked server response, absence of guest-management data/control exposure, noindex/no-store headers, mobile/desktop layout. Mount the workspace separately with a synthetic gateway for component flows; no real import or production writes.
- [ ] Typecheck/build and inspect diff without staging, committing or deployment. Report backend/provider limitations honestly.

## Acceptance matrix

| State | Acceptance |
| --- | --- |
| Auth unavailable | No workspace/list rendered; non-success server status; no-cache/noindex |
| Unauthenticated/forbidden | Future adapter must deny both route data and mutations; never frontend-only |
| Manual invalid | Linked field errors, focus first invalid input, no gateway call |
| Manual successful | Only confirmed backend record creates list/link; no optimistic false success |
| Import parsing | Disabled submit, bounded file/row sizes, readable failure without data logging |
| Header mapping | Required unique name mapping; revalidation invalidates old confirmation |
| Preview duplicates | Per-row errors for file/existing collisions; no silent overwrite |
| Confirm | Explicit checkbox and eligible count; no file-select mutation |
| Partial import | Created rows stay completed; failures remain actionable |
| Retry uncertain | Same operation/row IDs, server idempotency required; no claim on uncertain results |
| Mobile/keyboard | No form overflow at 320/390px; labelled inputs/table captions; visible focus |
| Reduced motion | No new decorative motion; existing shared controls respect preference |

Limits: workbook ZIP preflight reduces resource risk but is not a sandbox or a malware scanner. Server must repeat all validation and impose its own upload/row/timeout limits when file processing is introduced there. This frontend sends reviewed records rather than a workbook once the contract is connected.

## Coordinated backend contract update

The selected method is single-admin email/password verified only by the backend. No email allowlist or password value is embedded in frontend code. Approved endpoints read from wedding-backend/src/auth.ts are POST `/api/admin/login` with `{email,password}`, GET `/api/admin/session` returning `{authorized:true,csrfToken,expiresIn}`, and POST `/api/admin/logout` returning 204. Browser requests include credentials; mutations require the allowed Origin and X-CSRF-Token. Authentication hash/configuration remains absent until the backend worker sets it securely.

A same-origin Nuxt server boundary under `/manage-invitations/api` forwards only the HttpOnly wedding_admin_session cookie, never unrelated cookies. The backend's cookie Path `/api/admin` is scoped to frontend `/manage-invitations`, covering both the private page and its proxy APIs. There is no localStorage auth token. CSRF stays transient in memory. Private `NUXT_INVITATION_ADMIN_API_BASE` defaults empty and accepts HTTPS or loopback HTTP; it is not a public runtime setting. The server verifies the backend session before rendering the workspace, and unauthenticated/unavailable requests never receive guest information.

Backend invitation schema currently accepts `{externalId,name,maxAttendees}` with max 200 import rows, and its storage/list implementation is not active. Template headers now use those names; internal UI `shortcode`/`guestLimit` map to externalId/maxAttendees only in the future reviewed gateway. The actual create/import API returns atomic counts rather than private record/link DTOs. No fabricated adapter or active storage is wired here. Workspace receives no gateway in production, clearly reports unavailable storage, disables Save, and allows only an authorized administrator to prepare a local Excel preview. Backend list/record responses and transactional import storage must be completed before enabling the gateway. Mixed partial results are blocked from automatic retry to avoid changing a batch under one idempotency key.

The user-authorized backend worker owns hash setup, database/schema and provider/configuration changes. This frontend did not read its secret environment file, create credentials, configure auth, send login emails, mutate production data or deploy.

## Local verification and readiness

The route returns 503 with private/no-store and noindex headers when no authentication backend is configured, including attempts to add admin/role query flags. It does not render the workspace or file input in that state. The server authorization helper requires a verified backend session response and forwards only the dedicated cookie. Foreign-origin mutations are rejected before contacting the backend.

All 77 unit tests across 20 suites passed, full typecheck/build passed, and four admin browser cases passed: locked route at 320/390/1680px; unavailable API/foreign-Origin denial; synthetic login/logout without token storage; and synthetic xlsx worker preview/template download with Save disabled for unavailable storage. Manual/import retry and explicit confirmation are tested through synthetic component gateways. Synthetic imported names are test data only, not real guest records.

Remaining integration: configure private backend origin after target approval, complete secure hash setup, approve/apply invitation tables/RPC, add an authorized list/record response contract, and implement the reviewed UI gateway for transactional writes. These are not claimed active by this local frontend deliverable. No production authentication or guest-data mutation was performed, and nothing was committed, pushed or deployed.

The public invitation resolver is currently a static shortcode map. In addition to private invitation CRUD/list DTOs, the backend/public lookup contract must be connected before new codes can become working guest links; the UI does not claim proposed codes are live. The authorized workspace has no production gateway until all of those capabilities are ready.

## Integration revision: approved backend contracts

This section supersedes earlier scaffold limitations. Parent confirms invitation migration/RPC/storage and password hash are now configured. The frontend does not read credentials or backend environment values.

- Active same-origin private list/import proxies forward only the dedicated cookie. Mutations require same Origin, CSRF and UUID Idempotency-Key. List pagination is exhausted before duplicate checks, with malformed/incomplete responses failing closed.
- Gateway maps Reference Code to backend externalId and guestLimit to maxAttendees. Confirmed creation is resolved from private records after the atomic import. HTTP409 rejects the entire batch; uncertain delivery retains the same request key. Public links use the server-returned 64-hex linkToken, never the reference code.
- Public lookup proxy returns exactly name/maxAttendees. Token routes use no-store/no-referrer/noindex and never use query-string names or a different guest as fallback. Public wedding content remains JSON.
- Real-token RSVP/gift actions submit through same-origin token-verifying server handlers, replacing submitted identity with the verified guest name and enforcing the invitation limit. Demo keeps review-only feedback. Nonattendance omits stale count/event. Client retries retain keys after uncertain delivery; changed payload is blocked until resolved.
- Existing backend submission endpoints still accept self-reported names directly and lack token association in their stored contract. The frontend boundary enforces guest context, but direct backend authorization/guest-level deduplication remains backend follow-up; this integration must not be described as a fully token-protected backend launch.
- Verification uses synthetic local servers/mocks only, no real guest additions or responses. Local backend process/deployment availability is separate from configuration; no publication requested.

Integration verification: 81 unit tests across 21 suites, full typecheck/build, and two same-origin browser integration tests passed against an isolated synthetic local backend. Browser tests exercise actual cookie proxy/login/logout, manual entry, worker xlsx preview and confirmed import, public minimal lookup, invalid token, server identity override, attendance limit, RSVP delivery, and 320/390/1680px overflow. No real guest or response writes. A test initially used the wrong opening-button label; corrected to the existing Let’s Open button and both tests passed.

Local configuration: launch frontend with private process environment `NUXT_INVITATION_ADMIN_API_BASE=http://127.0.0.1:3001` when the real backend is listening and its Origin allowlist matches. The .env read/configuration action was denied by automatic approval review; no .env was read or modified. Runtime/backend production target remains unselected.

Final regression run: all nine additional browser cases passed (five public demo form/focus/reduced-motion cases plus four locked/admin/mock-import cases). Combined current browser verification: 11 passed. git diff --check passed; index empty; HEAD unchanged at 004035c. Integration source/test bytes in repository match the verified working copy. No commit, push, deployment or real guest/response mutation.

## Submission token forwarding correction

The backend bypass caveat above is superseded: inspected backend source now requires X-Invitation-Token, resolves canonical invitation/name/maxAttendees, rejects mismatched names/overlimit counts and hashes the invitation association into idempotency checks. Parent reports 23 backend tests passed; frontend work does not independently claim real persistence verification. Proxy now forwards only the route token already verified by invitationGuest, ignoring any client-supplied token header. Synthetic backend regression rejects missing/wrong forwarded tokens and exercises both RSVP and gift with a forged incoming header. No .env access, credentials, real submissions or deployment.
