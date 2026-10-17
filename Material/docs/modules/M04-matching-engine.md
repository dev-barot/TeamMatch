# M4 — Matching engine (pure domain core)
**Goal:** ranked, explained Matches in both directions, deterministic. **Owner:** C. **Depends on:** M1, M2; Members come from M3.
**Terms:** Match, Match Score, Match Reason, Scoring Rule, Scoring Weights, Skill Gap, Member.
**Rules owned:** **R4**.

## Scoring Rules (from PRD §5.5; points in `weights.js` only)
| Rule file | Points | Reason text example |
|---|---|---|
| `skillOverlap` | 0–50 × matched/required | "Has 3 of 4 required skills (React, Node, SQL)" |
| `fillsSkillGap` | +15 per Skill Gap filled | "Fills skill gap: Docker" |
| `specialtyFitsPosition` | +15 if an open Position matches Specialty | "Fills open Backend position" |
| `timezoneClose` | +10 within ±2h | "Timezone within 2 hours" |
| `availabilityFits` | +10 if ≥50% of Commitment Level | "Available 10h/week for a medium commitment" |
| `workingStyleCompatible` | +10 only when ≥1 Member exists | "Working style complements the Team" |

## Steps
1. [ ] **Domain:** `ScoringRule` interface: `evaluate(student, project, team) → {points, reason}|null`.
2. [ ] Implement each rule as its own file with its own unit test (known input → exact points + reason).
3. [ ] `weights.js` is the only file with numbers. A test greps rule files for numeric literals > 1 to fail the build if weights leak.
4. [ ] **Engine:** `scoreMatch(student, project, team, rules)` sums points and collects Reasons; sorts Reasons by points desc; keeps top 5; no Reason without points, no points without Reason (R4).
5. [ ] **Ranking:** `rankProjectsForStudent` (top 10), `rankStudentsForProject` (top 20). Tie-break: more overlapping Skills → more recent Profile update → alphabetical name. Same inputs → same output.
6. [ ] Skill-Gap and style rules use **Members only** (Accepted), never Applicants.
7. [ ] **Application layer:** `ComputeProjectMatches`, `ComputeStudentMatches`; excludes Projects the Student is Creator of or already has active Application on; excludes Filled/Closed.
8. [ ] Optional caching: pre-compute normalized Skill sets on profile/project save (PRD performance note).
9. [ ] Timing test at seed volume (500 Students, 150 Projects) < ~1s.
10. [ ] HTTP: `/matching/projects`, `/matching/candidates/:projectId` (Creator only — R2).

## Tests
`R4: every point in Match Score has a Reason` · `R4: at most 5 Reasons, descending` · `R4: tie-break is deterministic` · `R4: Applicants do not affect Skill Gap` · each Scoring Rule isolated · the 20-case set from M8.

## Doc hooks
- DESIGN: Decision **OCP** — adding a Scoring Rule needs no engine edit. Before: one function with if-chains and numbers inline. Cite `weights.js:line` and the rule list.
- TESTING: R4 row; a snapshot-only test is the typical "weak test".

## Viva questions
- Add a new Scoring Rule live: which files change?
