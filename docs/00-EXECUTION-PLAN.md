# Execution plan

Goal: **ceiling 10** = deployed + real outside users + evidence. Everything else (docs 35%, tests 35%, viva 30%) is scored inside that ceiling.

## Rules of the road
1. **Language first.** Every class, file, route, test name uses a term from `UBIQUITOUS_LANGUAGE.md`. New word → add it to the file in the same PR.
2. **Deploy in week 2, not week 14.** Module 0 ends with a live URL. Outside users take weeks to arrive.
3. **Domain core has no imports from Express, Mongoose, or Socket.IO.** Enforced by a lint rule in CI (see `01-ARCHITECTURE.md`).
4. **Write the doc line when you write the code.** Each module ends with "Doc hooks": what to add to DESIGN.md / TESTING.md now, while it's fresh.
5. **Keep AI log.** Append to `docs/AI-LOG.md` whenever you accept or reject an AI suggestion (feeds DESIGN.md "AI use").
6. **Test names are rule names.** `it('R1: rejects a second Pending Application from the same Student')`.

## Modules (Iterative Full-Stack Build Order)
Every feature module delivers both the **domain backend API** and its **interactive frontend UI** together as a vertical slice.

| # | Module | Full-Stack Deliverables (Backend + Frontend) | Rules Owned | Depends on |
|---|---|---|---|---|
| **M0** | Foundation & Scaffold | Monorepo, CI, live `/health` endpoint, ESLint boundary lint, base React shell & design tokens | – | – |
| **M1** | Identity & Profile | **Backend:** Auth API (signup, verify, login, refresh, reset), Profile aggregate, privacy DTOs<br>**Frontend:** Auth modals/forms (Sign Up, Log In, Verify notice), Profile Editor & Skills tagger | **R2**, **R5** | M0 |
| **M2** | Projects & Positions | **Backend:** Project aggregate, Positions capacity, text search & filters<br>**Frontend:** Projects gallery, filter chips, Project details, Create Project with Positions builder | **R2**, **R3**, **R5** | M1 |
| **M3** | Applications & Teams | **Backend:** Application aggregate, atomic concurrency, status transitions (apply, invite, decide, withdraw)<br>**Frontend:** "Apply" drawer, Student Application tracker, Creator Applicant review dashboard | **R1**, **R2**, **R3** | M2 |
| **M4** | Matching Engine | **Backend:** Pluggable Scoring Rules, centralized `weights.js`, deterministic ranking<br>**Frontend:** Smart Matches tab showing Match Score + explicit top-5 Match Reasons breakdown | **R4** | M1, M2, M3 |
| **M5** | Messaging & Notifications | **Backend:** Conversations, Messages, Socket.IO gateway, notification publisher<br>**Frontend:** Real-time 1-on-1 Chat drawer, in-app Notification bell with badge & toasts | – | M1 |
| **M6** | Admin & Moderation | **Backend:** Report queues, account deactivation, project closing<br>**Frontend:** Admin moderation portal to review reports and take disciplinary action | **R2** | M1, M2 |
| **M7** | Mobile Audit & Polish | 375px mobile responsiveness pass, unified theme polish, empty/loading states, feedback widget (feeds M9) | All | M1–M6 |
| **M8** | Seed & Benchmark | Realistic seed generator (500 Students, 150 Projects) + 20 hand-crafted matching benchmark cases | **R4** | M4 |
| **M9** | Outside Users & Evidence | Live deployment, ≥30 external student users, analytics, feedback log, `docs/EVIDENCE.md` | – | M0, M7 |
| **M10**| Docs & Viva Defense | `scripts/check-docs.js` validation, file:line audits, banned-words check, viva drill rehearsal | All | All |

```
M0 (Foundation & Scaffold)
 └─► M1 (Identity: API + UI)
      ├─► M2 (Projects: API + UI) ──► M3 (Applications: API + UI) ──┐
      │         └───────────────────► M4 (Matching Engine: API + UI) ─┤
      ├─► M5 (Messaging/Chat: API + UI) ──────────────────────────────┼─► M7 (Mobile Polish & Audit) ──► M9 (Outside Users) ──► M10 (Viva)
      └─► M6 (Admin: API + UI) ───────────────────────────────────────┘         ▲
                                                                  M4 ──► M8 (Seed & Validation) ──────┘
```

## Timeline (Iterative Delivery)
| Weeks | Deliverable (Full-Stack Iteration) |
|---|---|
| 1 | **M0:** Monorepo, live `/health`, boundary lint active; UL & DESIGN stubs |
| 2–3 | **M1:** Full Identity slice (Backend Auth API + Frontend Auth & Profile screens) |
| 3–5 | **M2 & M3:** Projects & Applications slices (Backend + Browsing, Creation, Application dashboards) |
| 5–7 | **M4 & M5:** Matching Engine (with visual Reasons UI) + Real-time Messaging & Alerts |
| 7–8 | **M6 & M7:** Admin moderation portal + Mobile 375px responsiveness audit + feedback form |
| 8 | **M8:** Seed data generated; **launch platform to outside users** |
| 9–12 | **M9:** Outside user feedback loop, iteration, bug fixes, automated test hardening |
| last 2 | **M10:** Feature freeze; `npm run check:docs`; viva rehearsal drill; tag `project-final` |

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
