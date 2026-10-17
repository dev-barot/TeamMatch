# M2 — Projects
**Goal:** Students create, browse, filter, and manage Projects with Positions. **Owner:** B. **Depends on:** M1.
**Terms:** Project, Creator, Position, Required Skill, Commitment Level, Course Tag, Project Status, Team.
**Rules owned:** **R2** (Creator-only edit/delete), **R3** (status transitions, partly), **R5**.

## Steps
1. [ ] **Domain:** `Project` aggregate: title, description, Creator, Required Skills, Positions (specialty + headcount + filledCount), Commitment Level, optional Course Tag, status.
2. [ ] **Domain invariants:** headcount ≥ 1; filledCount ≤ headcount; Course Tag grants nothing; status transitions Open→Filled→Open, Open/Filled→Closed (terminal).
3. [ ] **Ports:** `ProjectRepository` (save, byId, search(filters, cursor), byCreator).
4. [ ] **Use cases:** `CreateProject` (requires verified Student — R5), `UpdateProject`, `CloseProject`, `GetProject`, `BrowseProjects`.
5. [ ] **Browse:** filter by skill/category/commitment; sort newest|most-matched (most-matched delegates to M4 later; stub now); default size 20, max 50; default excludes Filled/Closed.
6. [ ] **Mongo:** text index on title+description+requiredSkills; indexes on status, creatorId.
7. [ ] **HTTP:** PRD §7.1 Projects routes; Creator-only guard is a domain check (`project.assertCreator(studentId)`), not just middleware.
8. [ ] Seed three projects by hand to eyeball in the live app.

## Tests
- Unit: Position invariants; status transitions; Course Tag does not change authorization.
- Integration: `R2: a Student cannot PATCH or DELETE another Student's Project`; `R5: unverified Student cannot create`; pagination max 50.

## Doc hooks
- DESIGN: a Project invariants decision (SRP/encapsulation — rules inside the aggregate, not in the route).
- TESTING: R2 (project part), R5 rows.

## Viva questions
- Where does a Project become Filled? Who calls it?
