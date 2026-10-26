# M7 — Frontend
**Goal:** every flow usable on a 375px phone. **Owner:** D. **Depends on:** APIs from M1–M6.
**Terms:** use the same words in UI copy as in the UL (button says "Apply", not "Join request"; "Position", not "Role").

## Steps
1. [x] Vite + React + React Router; `client/src/api/` typed wrappers per backend route; one place handles token refresh.
   - All API wrappers in `client/src/api/` (authApi, projectApi, applicationApi, matchingApi, adminApi, etc.)
2. [x] Screens implemented across M1–M6 (Sign up / verify / login → Profile → Projects browse + detail → Create Project → Apply → My Applications → Creator: Applicants + Invite → Matches with Match Reasons → Conversations → Notifications → Admin Portal).
3. [x] Match Reasons shown next to every Match Score, never a bare number.
   - `MatchScoreBadge` renders `"{score} pts match"` + interactive popover with reason labels, point values (+N), R4 footer.
   - Tested: `client/src/test/MatchScoreBadge.test.jsx` — 8 tests.
4. [x] Empty/loading/error states on each list.
   - Shared `<LoadingSpinner>`, `<EmptyState>`, `<ErrorBanner>`, `<SkeletonCard>` in `client/src/components/ui/States.jsx`.
   - Applied to `ProjectsGallery` (loading/error/empty), all modals have accessible close buttons.
5. [x] Accessibility baseline: labels, keyboard focus, semantic HTML.
   - Skip-to-content link (`<a href="#main-content" className="skip-link">`).
   - `id="main-content"` + `role="main"` on `<main>`.
   - All close buttons have `aria-label`.
   - Hamburger menu: `aria-expanded`, `aria-controls="mobile-menu"`, `role="dialog"`, Escape-to-close.
   - `input[type=search]` with `id` + `aria-label` on project search.
   - `:focus-visible` ring from global CSS.
   - `min-height: 44px` on all buttons (WCAG 2.5.5 tap targets).
   - `prefers-reduced-motion` override in global CSS.
6. [x] Mobile pass at 375px.
   - `.modal-overlay` slides from bottom on xs, centers on sm+.
   - `.modal-sheet` full-width on xs, max-width constrained on sm+.
   - `.grid-responsive` 1→2→3 columns.
   - Responsive Navbar collapses to hamburger below 768px.
   - Fluid typography via `clamp()` on h1/h2/h3.
7. [x] Feedback widget link on every page footer (feeds M9).
   - `<FeedbackWidget>` fixed bottom-right pill, expands to "Share Feedback" link.
   - Target URL from `VITE_FEEDBACK_URL` env var; falls back to mailto in dev.
   - `client/.env.example` documents the variable.
8. [ ] Analytics snippet (privacy-friendly) — deferred to M9 (live deployment needed first).

## Tests
- [x] `MatchScoreBadge.test.jsx` — 8 tests: score label, popover opens with reason text, point values, R4 footer, null/empty guard.
- [x] `ApplyModal.test.jsx` — 7 tests: R5 unverified email guard, Submitting state, error/success callbacks, accessible close button.
- **Total: 15 client component tests passing.**

## Doc hooks
TESTING: MatchScoreBadge renders Reasons (R4 compliance) — `client/src/test/MatchScoreBadge.test.jsx`.
TESTING: ApplyModal unverified guard (R5) — `client/src/test/ApplyModal.test.jsx`.
