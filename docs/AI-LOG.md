# AI log

| Date | Tool | Used for | Accepted / rejected | Why |
|---|---|---|---|---|
| 2026-10-17 | Antigravity AI | Scaffolding Module 0 clean architecture skeleton and boundary lint rule | Accepted | Fully compliant with `01-ARCHITECTURE.md` and enforces `no-restricted-imports` on `domain/` and `application/`. |
| 2026-10-17 | Antigravity AI | Suggestion to import Mongoose model directly inside domain for validation | Rejected | Violates the clean hexagonal architecture boundary; domain models must remain pure JS with zero I/O and zero framework dependencies. |
