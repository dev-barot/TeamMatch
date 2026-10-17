# Architecture & boundary

## Layers (dependency points inward only)
```
http (Express routes, Zod DTOs, auth middleware, Socket.IO gateway)
   ↓
application (use cases: ApplyToProject, DecideApplication, ComputeMatches …)
   ↓
domain (entities, value objects, Scoring Rules, rules R1–R5)  ← pure JS, no I/O
   ↑ implements ports
infrastructure (Mongoose repositories, Mailer, Clock, TokenSigner, PasswordHasher)
```

## Folder layout
```
server/src/
  domain/{identity,projects,applications,matching,messaging,notifications,moderation,shared}/
  application/            # use cases, one file each
  ports/                  # ApplicationRepository, ProjectRepository, StudentRepository,
                          # Mailer, Clock, PasswordHasher, TokenSigner, NotificationPublisher
  infrastructure/{mongo,mail,crypto,socket}/
  http/{routes,middleware,dto}/
  main.js                 # composition root: the ONLY place that wires concrete classes
server/test/{unit,integration}/
client/src/{features,components,api}/
scripts/{seed.js,check-docs.js}
docs/
```

## The boundary (for DESIGN.md)
**Core logic = `domain/` + `application/`. Outside world = Express, MongoDB/Mongoose, email provider, Socket.IO, system clock, bcrypt.**
Protects against: **MongoDB/Mongoose** (and Express). Core can be tested with in-memory fakes in milliseconds, and the PRD's own embedded-vs-separate collection question changes only `infrastructure/mongo/`.

Enforce it, don't just claim it:
```js
// .eslintrc: in server/src/domain/** and application/**
"no-restricted-imports": ["error", { "patterns": ["mongoose","express","socket.io","bcrypt*","nodemailer","**/infrastructure/**","**/http/**"] }]
```
Add `dependency-cruiser` to CI as a second check. A failing lint on a deliberate violation is great viva evidence.

## Cross-cutting conventions
- IDs and dates enter the domain via ports (`Clock`, `IdGenerator`) → deterministic tests.
- Domain errors are classes (`DuplicateApplicationError`), mapped to HTTP codes only in `http/`.
- Responses are explicit DTOs; never serialize Mongoose docs (PRD §14).
- Weights live in `domain/matching/weights.js` only.
