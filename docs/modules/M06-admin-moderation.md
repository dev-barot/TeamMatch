# M6 — Admin & moderation
**Goal:** Admin can list/deactivate Accounts, close Projects, review Reports. **Owner:** A. **Depends on:** M1, M2.
**Terms:** Admin, Account Type, Report, Project Status.
**Rules owned:** R2 (admin-only routes).

## Steps
1. [ ] Seed one Admin from env vars at deploy; no public path to admin.
2. [ ] `requireAdmin` middleware + domain check in use cases.
3. [ ] **Use cases:** `ListAccounts`, `DeactivateAccount` (status only, never edits Profile), `AdminCloseProject` (reuses M3 close → rejects Pending), `ListReports`, `MarkReportReviewed`.
4. [ ] Admin cannot read message content proactively; Reports expose only reported target + reason.
5. [ ] Deactivated Accounts: login blocked, hidden from matching.

## Tests
Student gets 403 on every `/api/admin/*` · Deactivate blocks login · Admin close rejects Pending with `project_closed`.

## Doc hooks
TESTING: RBAC boundary checks table (PRD §13 manual list becomes automated).
