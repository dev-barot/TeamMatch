# M7 — Frontend
**Goal:** every flow usable on a 375px phone. **Owner:** D. **Depends on:** APIs from M1–M6 (use mocks until they land).
**Terms:** use the same words in UI copy as in the UL (button says "Apply", not "Join request"; "Position", not "Role").

## Steps
1. [ ] Vite + React + React Router; `client/src/api/` typed wrappers per backend route; one place handles token refresh.
2. [ ] Screens, in this order: Sign up / verify / login → Profile form → Projects browse + detail → Create Project (Positions editor) → Apply → My Applications → Creator: Applicants + Invite → Matches list with Match Reasons → Conversations → Notifications → Admin.
3. [ ] Show Match Reasons next to every Match Score, never a bare number.
4. [ ] Empty/loading/error states on each list.
5. [ ] Accessibility baseline: labels, keyboard focus, semantic HTML.
6. [ ] Mobile pass at 375px; test on a real phone.
7. [ ] Feedback widget link on every page footer (feeds M9).
8. [ ] Analytics snippet (privacy-friendly, e.g. Plausible/Umami/GA) installed in production only.

## Tests
Light: 2–3 component tests for the Matches list (renders Reasons) and Apply button states. Don't pad.

## Doc hooks
README screenshots optional; UI vocabulary check against UL.
