# TESTING.md

| Rule | Test file:line | If untested — what stops you |
|---|---|---|
| R1 One live Application | `server/test/integration/applications.test.js:137` | |
| R2 Only the owner acts | `server/test/integration/identity.test.js:102`<br>`server/test/integration/projects.test.js:120`<br>`server/test/integration/applications.test.js:186` | |
| R2 Admin-only routes (M6) | `server/test/integration/moderation.test.js:107`<br>`server/test/unit/moderation.test.js:100` | |
| R3 Positions never overfill | `server/test/unit/projects.test.js:47`<br>`server/test/integration/applications.test.js:202` | |
| R3 Admin close rejects Pending with `project_closed` | `server/test/integration/moderation.test.js:188` | |
| R4 Every Match is explained | `server/test/unit/matching.test.js:14`<br>`server/test/integration/matching.test.js:106`<br>`server/test/integration/matchingHttp.test.js:68` | |
| R4 Match badge renders Reasons — never a bare number (M7 UI) | `client/src/test/MatchScoreBadge.test.jsx:1` | |
| R5 Verify before acting | `server/test/unit/identity.test.js:158`<br>`server/test/integration/projects.test.js:80`<br>`server/test/integration/applications.test.js:120` | |
| R5 Unverified email blocks Apply button (M7 UI) | `client/src/test/ApplyModal.test.jsx:68` | |

## M6 RBAC Boundary Checks
Student gets 403 on every `/admin/*` endpoint — 5 boundary checks in `server/test/integration/moderation.test.js`:
- `GET /admin/accounts` → 403
- `PATCH /admin/accounts/:id/deactivate` → 403
- `POST /admin/projects/:id/close` → 403
- `GET /admin/reports` → 403
- `PATCH /admin/reports/:id/review` → 403

Deactivate blocks login: `moderation.test.js:153` — `Account.assertCanLogin()` throws `AccountDeactivatedError` after deactivation (double guard: HTTP 409 on re-deactivate + domain throw on login).

## M7 Component Tests
- `client/src/test/MatchScoreBadge.test.jsx` — 8 tests: score label "N pts match", popover opens with reason text, +N point values, R4 footer, null/empty guard.
- `client/src/test/ApplyModal.test.jsx` — 7 tests: R5 unverified guard (submit disabled + warning shown), "Submitting…" in-flight state, error/success callbacks, accessible close button aria-label.

- **Rules tested:** 5 rules, 9 rows (R2, R3, R4, R5 each have module-specific sub-cases).
- **Total tests:** 162 server (Jest/ESM) + 15 client (Vitest/jsdom) = **177 tests passing**.
- **Strongest concurrency test:** `server/test/integration/applications.test.js:315` — tests two parallel requests via `Promise.all` competing for the last remaining seat.
- **Weakest test:** `server/test/unit/applications.test.js:82` — asserts that notification publisher was called, verified end-to-end via in-app notifications and Socket.io gateway in M5.
- **Matching validation:** Validated isolated rules in `server/test/unit/rules.test.js` and engine ranking with tie-breaking in `server/test/unit/matching.test.js`. (Seed dataset benchmark in M8).
- **Honest gaps:** Live WebSocket transmission is tested via `SocketGateway` handshake and room isolation, while use cases test against the `RealtimePublisher` port to maintain 100% deterministic test suite execution without flaky socket timeouts. Analytics (M7 step 8) deferred to M9 (needs live deployment).

> A low count costs less than tests that assert nothing. Break the code on purpose and confirm each cited test fails.
