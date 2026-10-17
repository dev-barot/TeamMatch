# TESTING.md

| Rule | Test file:line | If untested — what stops you |
|---|---|---|
| R1 One live Application | `<server/test/...:line>` | |
| R2 Only the owner acts | `server/test/integration/identity.test.js:102` | |
| R3 Positions never overfill | `<...>` | |
| R4 Every Match is explained | `<...>` | |
| R5 Verify before acting | `server/test/unit/identity.test.js:158` | |

- **Rules tested:** 2 of 5.
- **Weakest test:** `<file:line>` — <why it is weak, e.g. asserts only that a function was called, not the resulting state>.
- **Matching validation:** <x>/20 hand-crafted cases pass top-3 (`<fixtures file>`).
- **Honest gaps:** <what is not covered and why>.

> A low count costs less than tests that assert nothing. Break the code on purpose and confirm each cited test fails.
