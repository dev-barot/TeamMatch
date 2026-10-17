# Decisions log

| Date | Question | Decision | Who |
|---|---|---|---|
| 2026-10-17 | Applications embedded vs separate collection | Separate `applications` collection with its own `Application` aggregate and unique partial index on `(projectId, studentId)` for active applications. MongoDB cannot enforce uniqueness inside embedded arrays under concurrent requests. | All |
| 2026-10-17 | Withdrawn status added | Added `Withdrawn` to `ApplicationStatus` state machine (`Pending -> Withdrawn` and `Accepted -> Withdrawn`). | All |
| 2026-10-17 | Creator capability vs role enum | `AccountType` is only `student` or `admin`. Creator is not a role; it is dynamically asserted from `project.creatorId == student.id`. | All |
| 2026-10-17 | Re-apply uniqueness rule | At most one `Pending` or `Accepted` Application per `(Project, Student)`. Re-applying after a `Rejected` status creates a new distinct Application aggregate. | All |
| 2026-10-17 | Position closing behavior | When Position headcount is reached, the Position closes. Pending Applicants stay Pending (no silent rejects). Project becomes `Filled` only when all Positions are full, and re-opens if a Member withdraws. | All |
| 2026-10-17 | Email provider / demo fallback | Abstract email delivery behind a `Mailer` port. Provide `ConsoleMailer` for local/offline testing and `ResendMailer` for production/live URL. | All |
