# DESIGN.md
Uses only terms from [UBIQUITOUS_LANGUAGE.md](UBIQUITOUS_LANGUAGE.md). Every `file:line` below must be verified by `npm run check:docs`.

## Five rules the product enforces
1. **R1 — One live Application.** A Student has at most one Pending or Accepted Application per Project. They may apply again only after a Rejection, and that creates a new Application.
2. **R2 — Only the owner acts.** A Student edits only their own Profile; only a Project's Creator can edit it, close it, invite, accept, reject, or remove Members; only an Admin can reach admin routes.
3. **R3 — Positions never overfill.** Accepted Members in a Position never exceed its headcount. The Project becomes Filled when every Position is full and reopens when a Member withdraws. Closing a Project rejects all Pending Applications with reason `project_closed`.
4. **R4 — Every Match is explained.** Each point in a Match Score has a Match Reason; at most five Reasons are shown, highest points first; equal scores are ordered deterministically. Skill Gaps and Working Style fit are judged only against Members, never Applicants.
5. **R5 — Verify before acting.** A Student with an unverified email can browse, but cannot create a Project or apply.

## Three design decisions
> Fill from real git history. If you didn't live the "before", don't write it.

### D1 — Application is its own aggregate (SRP / Aggregate Boundary)
- Principle: Single Responsibility Principle (SRP) & Aggregate Encapsulation
- Where: `server/src/domain/applications/Application.js:29` (aggregate root) and `server/src/infrastructure/mongo/schemas/ApplicationModel.js:24` (partial unique index)
- Before: PRD §5.6 proposed embedding an `applicants[]` array inside the `Project` document with manual check-then-insert.
- Why changed: MongoDB cannot enforce a unique partial index across embedded array elements under concurrent writes, risking duplicate live applications. Modeling `Application` as an independent aggregate isolates the application state machine (`Pending -> Accepted | Rejected | Withdrawn`), guarantees database-level enforcement of Rule R1 via a partial unique compound index on `(projectId, studentId)` where `status ∈ ['Pending', 'Accepted']`, and prevents document contention on the `Project` root during high-traffic application rushes. (Commit `6379588`).

### D2 — Scoring Rules are pluggable (candidate; Open/Closed)
- Principle: <OCP>
- Where: `<file:line>` (engine) and `<file:line>` (rule list / weights)
- Before: <e.g. one scoring function with if-chains and inline numbers> (commit `<sha>`)
- Why changed: <e.g. adding the Working Style rule meant editing six places>

### D3 — Use cases depend on ports (candidate; Dependency Inversion)
- Principle: Dependency Inversion Principle (DIP)
- Where: `server/src/ports/PasswordHasher.js:5` (port) and `server/src/application/identity/LogIn.js:3` (use case using it)
- Before: Use cases imported bcrypt and jwt directly into the business logic.
- Why changed: Coupling use cases to external libraries prevented fast deterministic in-memory testing and leaked infrastructure into application layers.

### D4 — Project invariants encapsulated in aggregate (SRP & Information Expert)
- Principle: Single Responsibility Principle (SRP) & Aggregate Encapsulation
- Where: `server/src/domain/projects/Project.js:132` (assertCreator) and `server/src/domain/projects/Position.js:28` (headcount capacity)
- Before: Express route handlers directly checked `req.user.id !== project.creatorId` and manually compared `filledCount < headcount`.
- Why changed: Leaking invariants into HTTP controllers bypasses domain validation in other interfaces (e.g. CLI, seed scripts, background jobs) and scatters business rules across route files.


## Boundary
Core logic (`server/src/domain`, `server/src/application`) stops at the `ports/` folder. Outside: Express, MongoDB/Mongoose, email provider, Socket.IO, clock, bcrypt.
It protects us from: **Mongoose/MongoDB and Express — changes in storage or transport frameworks do not impact domain rules or use cases**.
Enforced at: `server/eslint.config.js:22`.

## AI use
- Tools used and for what: <tool → tasks>
- One suggestion rejected: <what it proposed> — rejected because <specific reason tied to a principle/rule>. Evidence: `docs/AI-LOG.md#<entry>`
