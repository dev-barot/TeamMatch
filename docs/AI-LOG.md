# AI log

| Date | Tool | Used for | Accepted / rejected | Why |
|---|---|---|---|---|
| 2026-10-17 | Antigravity AI | Scaffolding Module 0 clean architecture skeleton and boundary lint rule | Accepted | Fully compliant with `01-ARCHITECTURE.md` and enforces `no-restricted-imports` on `domain/` and `application/`. |
| 2026-10-17 | Antigravity AI | Suggestion to import Mongoose model directly inside domain for validation | Rejected | Violates the clean hexagonal architecture boundary; domain models must remain pure JS with zero I/O and zero framework dependencies. |
| 2026-10-21 | Antigravity AI | Checking creator permissions solely in Express route middleware | Rejected | Violates encapsulation / SRP. Rule R2 must be an invariant directly inside `Project.assertCreator()` so domain logic cannot be bypassed by other callers. |
| 2026-10-21 | Antigravity AI | Encapsulating Position capacity invariants (`headcount >= 1`, `filledCount <= headcount`) and status transitions in `Project.js` | Accepted | Directly enforces Rule R3 ("Positions never overfill") within the aggregate root and protects clean architecture boundary. |
