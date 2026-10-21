# M3 — Applications (team formation lifecycle)
**Goal:** apply, invite, decide, withdraw, with every edge case in PRD §5.6a. **Owner:** B. **Depends on:** M2.
**Terms:** Application, Origin, Application Status, Applicant, Member, Team, Position.
**Rules owned:** **R1**, **R2** (decide part), **R3**, **R5** (apply).

## Decision to make first (write in docs/DECISIONS.md)
Embedded `applicants[]` (PRD) vs separate `applications` collection. Recommended: **separate**, aggregate `Application`, unique partial index on `(projectId, studentId)` where status ∈ {pending, accepted}. If you start embedded to follow the PRD and later move, keep the commits — that is your honest *before/after* for DESIGN.md.

## Steps
1. [x] **Domain:** `Application` with status machine: Pending → Accepted | Rejected; Accepted → Withdrawn; Pending → Withdrawn (student cancels). Illegal transitions throw.
2. [x] **Domain service:** `TeamFormation` — `accept(project, application)` checks Position headcount (R3), increments filledCount, flips Project to Filled when all Positions full.
3. [x] **Ports:** `ApplicationRepository` (unique-violation surfaces as `DuplicateApplicationError`), `NotificationPublisher`.
4. [x] **Use cases:** `ApplyToProject` (R1, R5; Creator cannot apply to own Project), `InviteStudent` (Creator only), `DecideApplication` (Creator only), `RespondToInvitation` (invited Student only), `WithdrawMembership`, `CloseProject` extension (reject all Pending with reason `project_closed`, notify).
5. [x] **Edge cases from PRD §5.6a — one test each:**
   - Position fills while others Pending → Position closed, Pending stay Pending, Applicants notified, no silent reject.
   - All Positions filled → Project Filled, hidden from default browse.
   - Close with Pending → all Rejected(`project_closed`) + notified.
   - Member withdraws → Position reopens, Project back to Open.
   - Re-apply after Rejected → new Application, old one untouched.
6. [x] **Concurrency:** two accepts racing on the last seat — use atomic update in repository (`findOneAndUpdate` with `filledCount < headcount`) and test with `Promise.all`.
7. [x] **HTTP:** apply, invite, decide, respond, withdraw routes + Zod.
8. [x] Notifications fire via port (real wiring in M5).

## Tests
`R1: second Pending Application is rejected` · `R1: re-apply allowed after Rejected` · `R1: duplicate under concurrent requests` · `R2: non-Creator cannot decide` · `R3: accepting beyond headcount fails` · `R3: Project becomes Filled and reopens on withdrawal` · `R3: closing rejects Pending with project_closed`.

## Doc hooks
- DESIGN: Decision "Application is its own aggregate" (aggregate boundary / SRP) with before/after; Rules R1, R3.
- TESTING: R1, R2, R3 rows; note the concurrency test as strongest, any mock-only test as candidate "weak test".

## Viva questions
- What stops two Creators' accepts or two requests from overfilling a Position?
