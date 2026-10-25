# M6 — Admin & moderation
**Goal:** Admin can list/deactivate Accounts, close Projects, review Reports. **Owner:** A. **Depends on:** M1, M2.
**Terms:** Admin, Account Type, Report, Project Status.
**Rules owned:** R2 (admin-only routes).

## Steps
1. [x] Seed one Admin from env vars at deploy; no public path to admin.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` / `ADMIN_NAME` in `.env`; seeded in `main.js`.
2. [x] `requireAdmin` middleware + domain check in use cases.
   - `server/src/http/middleware/requireAdmin.js` — checks `accountType === 'admin'` from JWT claim.
   - Domain-level R2 check inside each use case (not trusting middleware alone).
3. [x] **Use cases:** `ListAccounts`, `DeactivateAccount` (status only, never edits Profile), `AdminCloseProject` (reuses `Project.forceClose()` → rejects Pending), `ListReports`, `MarkReportReviewed`.
   - All in `server/src/application/moderation/`.
   - Completing M5 step 7: `ReportStudent` and `ReportConversation` also added.
4. [x] Admin cannot read message content proactively; Reports expose only reported target + reason.
   - `Report` domain entity stores only `targetType`, `targetId`, `reason` — no message body.
5. [x] Deactivated Accounts: login blocked, hidden from matching.
   - `DeactivateAccount.execute()` calls `Account.deactivate()` → sets `isActive = false`.
   - `Account.assertCanLogin()` throws `AccountDeactivatedError` on next login attempt.
   - `StudentRepository.findAllVerified()` filters out inactive accounts → hidden from matching.

## Infrastructure
- `InMemoryReportRepository` — dev/test implementation.
- `MongooseReportRepository` + `ReportModel` — production MongoDB implementation.
- `StudentRepository.findAll()` added to port + both In-Memory and Mongoose implementations.

## HTTP Routes
- `GET  /admin/accounts` — list all accounts (paginated)
- `PATCH /admin/accounts/:id/deactivate` — deactivate a Student Account
- `POST  /admin/projects/:id/close` — Admin forcibly closes a Project
- `GET  /admin/reports` — list all Reports (filter by `?status=pending|reviewed`)
- `PATCH /admin/reports/:id/review` — mark a Report as reviewed
- `POST  /moderation/reports/students` — Student files a report on another Student
- `POST  /moderation/reports/conversations` — Student reports a Conversation

## Frontend
- `AdminPortal.jsx` — full moderation portal with Accounts table + Reports queue.
- `Navbar.jsx` — 🛡️ Admin button visible only to admin account type (R2 at UI layer).
- `adminApi.js` — all admin + moderation API client functions.

## Tests
- [x] Student gets 403 on every `/admin/*` (5 R2 boundary checks)
- [x] `/admin/*` requires authentication — returns 401 without token
- [x] Deactivate blocks login — `Account.assertCanLogin()` throws after deactivation
- [x] Admin close rejects all Pending Applications with reason `project_closed`
- [x] Report lifecycle: file → list → review
- [x] Double-review returns 409
- [x] Unit tests: Report aggregate validation, DeactivateAccount invariants (profile unchanged)

**Total: 162 tests passing (16 test suites)**

## Doc hooks
TESTING: RBAC boundary checks — Student gets 403 on every `/admin/*` endpoint (Rule R2).
Table: `requireAdmin` middleware + domain-level check = double guard on all admin use cases.
