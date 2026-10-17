# M8 — Seed data & hand-crafted matching set
**Goal:** a realistic demo DB and proof the engine ranks sensibly. **Owner:** C. **Depends on:** M4.
**Terms:** Student, Project, Match.

## Steps
1. [ ] `scripts/seed.js`: 50–100 Students, 20–30 Projects (some with Course Tag), a few Applications in each status. Idempotent. Mark seed Accounts (`isSeed`) so they are excluded from usage analytics.
2. [ ] Hand-write **20 cases** in `server/test/fixtures/matching-cases.json`: Student, Project, Team, expected top reasons, expected rank. Reason about each on paper first.
3. [ ] Test: engine's top-3 includes the expected best for ≥ 80% of cases. Report the actual number honestly in TESTING.md.
4. [ ] If a case fails, decide: fix the weights or fix the expectation, and log the reason in `docs/DECISIONS.md`.
5. [ ] Run the seed on the live DB only for demo Projects; real outside users must see mostly real Projects (see M9).

## Doc hooks
TESTING: R4 row cites this file; mention the pass rate.
