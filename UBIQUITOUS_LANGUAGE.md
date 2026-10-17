# UBIQUITOUS_LANGUAGE.md

The words this product is about. If a word is not here, it must not appear in code, tests, or the other docs.
"Named in code at" is **planned** until Module 10 converts every entry to a real `file:line` (run `npm run check:docs`).

## Terms

| Term | Definition | Aliases to avoid | Named in code at |
|---|---|---|---|
| **Account** | A login identity: email, password hash, verified flag, active flag, account type. | User, Login | `server/src/domain/identity/Account.js` |
| **Account Type** | Whether an Account is a `student` or an `admin`. Controls what the Account may do platform-wide. | Role, Permission | `server/src/domain/identity/Account.js` |
| **Student** | An Account of type student, together with its Profile. The person who creates, joins, or is matched to Projects. | User, Member, Person, Candidate | `server/src/domain/identity/Student.js` |
| **Admin** | An Account of type admin. Moderates Accounts and Projects; never takes part in Teams. | Superuser, Moderator | `server/src/domain/identity/Account.js` |
| **Profile** | The matching-relevant facts about a Student: Skills, Specialty, Weekly Availability, Timezone, Working Style, Experience Level. | Resume, Bio (bio is one optional field of it) | `server/src/domain/identity/Profile.js` |
| **Skill** | A named technical ability (e.g. React). Compared case-insensitively. | Tag, Technology, Tech | `server/src/domain/shared/Skill.js` |
| **Specialty** | The kind of work a Student prefers: Frontend, Backend, ML, DevOps, UI/UX, Other. | Preferred role, Role | `server/src/domain/identity/Specialty.js` |
| **Working Style** | How a Student likes to work: independent, collaborative, detail-oriented, fast-paced. | Personality, Vibe | `server/src/domain/identity/WorkingStyle.js` |
| **Project** | A posting by a Student describing something to build and the Team it needs. Includes class projects, hackathons, startups. | Post, Listing, Opportunity | `server/src/domain/projects/Project.js` |
| **Creator** | The Student who created a Project. The only person who decides on its Applications. | Owner, Admin of project, Professor, Lead | `server/src/domain/projects/Project.js` (`creatorId`) |
| **Position** | One open seat on a Project: a Specialty plus a headcount (e.g. 2 Backend). | Role, Slot, Opening | `server/src/domain/projects/Position.js` |
| **Required Skill** | A Skill a Project says it needs. | Requirement, Tech stack | `server/src/domain/projects/Project.js` |
| **Commitment Level** | How much time a Project expects: low, medium, high. | Intensity, Workload | `server/src/domain/projects/CommitmentLevel.js` |
| **Course Tag** | Optional course code + term on a Project. Pure metadata; grants no permission. | Class, Assignment flag | `server/src/domain/projects/CourseTag.js` |
| **Project Status** | Open, Filled, or Closed. | State, Phase | `server/src/domain/projects/ProjectStatus.js` |
| **Application** | A Student's request to take a Position on a Project, or a Creator's invitation to do so. One concept with an Origin. | Request, Join request, Invitation (as a separate thing) | `server/src/domain/applications/Application.js` |
| **Origin** | Who started an Application: `applied` (Student) or `invited` (Creator). | initiatedBy, Path, Flow | `server/src/domain/applications/Origin.js` |
| **Application Status** | Pending, Accepted, Rejected, Withdrawn. | State | `server/src/domain/applications/ApplicationStatus.js` |
| **Applicant** | A Student with a Pending Application on a Project. | Candidate | `server/src/domain/applications/Application.js` |
| **Member** | A Student with an Accepted Application on a Project. | Confirmed member, Teammate, Team member | `server/src/domain/applications/Application.js` |
| **Team** | All Members of one Project. | Group, Squad | `server/src/domain/projects/Team.js` |
| **Match** | A scored pairing of one Student and one Project, with Reasons. Computed on request, never stored. | Recommendation, Suggestion, Fit | `server/src/domain/matching/Match.js` |
| **Match Score** | The sum of points from Scoring Rules for a Match. Soft cap ~100. | Percentage, Rating | `server/src/domain/matching/Match.js` |
| **Match Reason** | One human-readable sentence + points explaining a part of a Match Score. Top 5 shown, highest points first. | Explanation, Justification, Tooltip | `server/src/domain/matching/MatchReason.js` |
| **Scoring Rule** | One pluggable rule that awards points and a Reason (skill overlap, gap-fill, specialty, timezone, availability, style). | Bonus, Heuristic, Factor | `server/src/domain/matching/rules/` |
| **Scoring Weights** | The single config object holding every point value. | Constants, Magic numbers | `server/src/domain/matching/weights.js` |
| **Skill Gap** | A Required Skill that no Member lists. | Missing skill | `server/src/domain/matching/rules/fillsSkillGap.js` |
| **Conversation** | A one-to-one thread between exactly two Students. | Chat, Thread, Room | `server/src/domain/messaging/Conversation.js` |
| **Message** | One text sent inside a Conversation (≤ 2000 chars). | DM, Chat text | `server/src/domain/messaging/Message.js` |
| **Notification** | A short in-app notice triggered by a new Message, Application, or Application decision. | Alert, Push | `server/src/domain/notifications/Notification.js` |
| **Report** | A Student's complaint about a Student or Conversation, queued for Admin review. | Flag, Complaint | `server/src/domain/moderation/Report.js` |
| **Email Verification** | Proof an Account owns its email; required before creating or applying. | Activation, Confirmation | `server/src/domain/identity/EmailVerification.js` |

## Flagged ambiguities

| # | Problem in the PRD | Ruling (winner) |
|---|---|---|
| 1 | "Role" means three things: Account permission (student/admin), a Student's preferred work (Frontend…), and an open seat on a Project (`rolesNeeded`). | Three words: **Account Type**, **Specialty**, **Position**. The word "role" is banned in code, tests and docs. |
| 2 | "User", "student", "candidate", "applicant" all point at the same person at different moments. | **Student** (the person), **Applicant** (Pending on a Project), **Member** (Accepted on a Project). "User" and "candidate" are banned. |
| 3 | "Creator", "owner", "project creator", "reviewer". | **Creator**. |
| 4 | "Application" vs "Invitation" are described as two flows but share one status machine and one array. | One term: **Application**, with **Origin** `applied` / `invited`. |
| 5 | "Confirmed member", "team member", "accepted member". | **Member**. |
| 6 | "Match", "recommendation", "score", "candidate list". | **Match** is the pairing; **Match Score** its number; **Match Reason** its explanation. |
| 7 | "Bonus" (PRD) vs "rule". | **Scoring Rule**. Points live in **Scoring Weights**. |
| 8 | "Team" vs "Project" used interchangeably. | **Project** is the posting; **Team** is its Members. |
| 9 | PRD describes withdrawal but has no status for it. | Added **Withdrawn** to Application Status. |
| 10 | "Slot" in lab examples vs "role count" in PRD. | **Position** (headcount lives on it). |
