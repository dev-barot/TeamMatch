# TESTING.md

| Rule | Test file:line | If untested — what stops you |
|---|---|---|
| R1 One live Application | `server/test/integration/applications.test.js:137` | |
| R2 Only the owner acts | `server/test/integration/identity.test.js:102`<br>`server/test/integration/projects.test.js:120`<br>`server/test/integration/applications.test.js:186` | |
| R3 Positions never overfill | `server/test/unit/projects.test.js:47`<br>`server/test/integration/applications.test.js:202` | |
| R4 Every Match is explained | `<pending Module 4>` | Module 4 Matching Engine |
| R5 Verify before acting | `server/test/unit/identity.test.js:158`<br>`server/test/integration/projects.test.js:80`<br>`server/test/integration/applications.test.js:120` | |

- **Rules tested:** 4 of 5.
- **Strongest concurrency test:** `server/test/integration/applications.test.js:315` — tests two parallel requests via `Promise.all` competing for the last remaining seat on a project, verifying atomic seat decrement and rejection of the second applicant.
- **Weakest test:** `server/test/unit/applications.test.js:82` — asserts that notification publisher was called, but in-memory test publisher does not verify end-to-end delivery (deferred to M5 Socket.io/email integration).
- **Matching validation:** 0/20 hand-crafted cases pass top-3 (scheduled for Module 4).
- **Honest gaps:** Real-time push delivery of notifications over WebSockets is stubbed via `NotificationPublisher` port; real network transmission covered in Module 5.

> A low count costs less than tests that assert nothing. Break the code on purpose and confirm each cited test fails.
