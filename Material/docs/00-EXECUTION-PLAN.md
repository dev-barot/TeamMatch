# Execution plan

Goal: **ceiling 10** = deployed + real outside users + evidence. Everything else (docs 35%, tests 35%, viva 30%) is scored inside that ceiling.

## Rules of the road
1. **Language first.** Every class, file, route, test name uses a term from `UBIQUITOUS_LANGUAGE.md`. New word → add it to the file in the same PR.
2. **Deploy in week 2, not week 14.** Module 0 ends with a live URL. Outside users take weeks to arrive.
3. **Domain core has no imports from Express, Mongoose, or Socket.IO.** Enforced by a lint rule in CI (see `01-ARCHITECTURE.md`).
4. **Write the doc line when you write the code.** Each module ends with "Doc hooks": what to add to DESIGN.md / TESTING.md now, while it's fresh.
5. **Keep AI log.** Append to `docs/AI-LOG.md` whenever you accept or reject an AI suggestion (feeds DESIGN.md "AI use").
6. **Test names are rule names.** `it('R1: rejects a second Pending Application from the same Student')`.

## Modules (build order)
| # | Module | Delivers | Depends on | Suggested owner |
|---|---|---|---|---|
| M0 | Foundation & first deploy | repo, CI, live "hello" URL, boundary lint | – | all |
| M1 | Identity | signup, verify, login, refresh, Profile | M0 | A |
| M2 | Projects | create, browse, filter, Positions, status | M1 | B |
| M3 | Applications | apply, invite, decide, withdraw, lifecycle rules | M2 | B |
| M4 | Matching engine | pure Scoring Rules, Reasons, ranking | M1, M2 (M3 for Members) | C |
| M5 | Messaging & notifications | Conversation, Message, Socket.IO, Notification | M1 | B |
| M6 | Admin & moderation | deactivate, close, Reports | M1, M2 | A |
| M7 | Frontend | all screens, mobile 375px | M1–M6 APIs | D |
| M8 | Seed & matching test set | seed script, 20 hand-crafted cases | M4 | C |
| M9 | Outside users & evidence | feedback form, analytics, user list | M0, M7 | all |
| M10 | Docs & viva | file:line pass, check script, rehearsal | all | all |

```
M0 → M1 → M2 → M3 ─┐
          └→ M4 ───┤→ M7 → M9 → M10
     M1 → M5 ──────┤
     M1,M2 → M6 ───┘      M4 → M8
```

## Timeline (adjust to your end-sem date)
| Weeks | Do |
|---|---|
| 1 | M0 incl. live URL; fill UL + draft DESIGN rules |
| 2–3 | M1, start M2 |
| 3–5 | M2, M3, start M4 |
| 5–7 | M4, M5 |
| 6–8 | M7 screens as APIs land; M6 |
| 8 | M8 seed; **start inviting outside users** |
| 9–12 | M9 feedback loop, bug fixes, strengthen tests |
| last 2 | M10; freeze; tag `project-final` |

## PRD gaps to settle in Module 0 (write answers in DESIGN.md notes)
1. **Applications embedded vs separate.** PRD embeds `applicants[]` in Project but also exposes `/api/applications/:id/respond` and admits Mongo can't enforce uniqueness inside an array. Recommendation: separate `applications` collection with a unique index on `(projectId, studentId, active)`. This is a strong DESIGN.md decision.
2. **Withdrawn status** missing in PRD.
3. **"Creator" capability vs `role` enum** — Account Type is only student|admin; Creator is derived from `project.creatorId`.
4. **Rejected → re-apply:** PRD says new entry; define the uniqueness rule as "at most one Pending or Accepted Application per (Project, Student)".
5. **Position closing:** when headcount reached, Position closed; Pending Applicants for it stay Pending (no silent reject).
6. **Email sending in demo:** pick a provider (Resend/Brevo free tier) or console-log fallback — behind a `Mailer` port.

## Definition of Done (every module)
- [ ] Steps checked off in its module file
- [ ] Rules it owns have tests named `Rn: …`
- [ ] Terms used match UL; any new term added
- [ ] Doc hooks written
- [ ] Deployed to the live URL
