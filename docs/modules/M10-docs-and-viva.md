# M10 — Docs, citations, viva
**Goal:** docs match code exactly; every member can explain any `file:line`. **Owner:** all. **Depends on:** all.
Docs that don't match code are graded as absent, so this module is never optional.

## Steps
1. [ ] **Freeze features** two weeks before the end-sem; only fixes after.
2. [ ] Create `scripts/check-docs.js` (run as `npm run check:docs`): parse every `path:line` in DESIGN.md and TESTING.md, fail if the file or line doesn't exist, and print the cited line for a human check. Add a banned-words check: grep code and docs for `\b(User|Manager|Handler|Util|Helper|Role)\b` outside allowlisted external names.
3. [ ] **UBIQUITOUS_LANGUAGE.md:** replace every planned path with real `file:line`; delete terms never used; add ones you invented (A new word for an existing concept is a finding against you).
4. [ ] **DESIGN.md:** finalise 5 rules (R1–R5 in plain English), 3 Decisions with principle + `file:line` + before/after (from git history, link commit SHAs), 1 Boundary, AI use.
5. [ ] **AI use:** from `docs/AI-LOG.md`, pick tools and uses, and one rejected suggestion with a concrete reason (e.g., "AI put scoring numbers inline in the route; rejected, weights belong in `weights.js` because…").
6. [ ] **TESTING.md:** rule table with `test file:line` or "if untested — what stops you"; count (e.g. "4 of 5"); one weak test and why. Honest gaps cost less than empty tests.
7. [ ] **README.md:** live URL, ≤5 local commands tested on a clean clone, link to evidence.
8. [ ] Run `npm run check:docs` as the last commit before tagging.
9. [ ] `git tag project-final && git push --tags` **before your slot**. Verify the tag in GitHub UI.
10. [ ] Viva rehearsal (below).

## Viva rehearsal drill
Every member, in turn: pick a random line in DESIGN.md/TESTING.md, open the file at that line, explain it without notes, then change a weight or add a Scoring Rule live. Assign each person a primary module but make sure everyone can walk **R1–R5** and the **boundary**.

Expect:
- "Why is this term named X? Show me where it appears in code."
- "Show the test for R3. Break the code; does it fail?"
- "Which dependency does the boundary protect you from, and show the lint that proves it."
- "Which suggestion did the AI give that you rejected?"
