# M0 — Foundation & first deploy
**Goal:** a live URL serving a trivial page + `/health`, CI green, boundary lint active. **Owner:** all. **Depends on:** nothing.
**Terms:** none yet. **Rules owned:** none (enables all).

## Steps
1. [x] Create repo, add `README.md`, `UBIQUITOUS_LANGUAGE.md` (copy from template), `DESIGN.md`, `TESTING.md` stubs, `docs/`.
2. [x] Monorepo: `server/` (Node 20, Express, Mongoose, Zod, Jest, Supertest, mongodb-memory-server) and `client/` (Vite + React).
3. [x] Create folder skeleton exactly as in `01-ARCHITECTURE.md` (empty `.gitkeep` files are fine).
4. [x] Add ESLint with `no-restricted-imports` for `domain/` and `application/`. Commit a deliberate violation on a throwaway branch, confirm CI fails, delete branch.
5. [x] `GET /health` returns `{status:"ok", commit:<sha>}`.
6. [x] MongoDB Atlas free cluster; connection string in env, never in git. `.env.example` committed.
7. [x] GitHub Actions: install → lint → test → build on every push.
8. [ ] Deploy server (Render/Railway/Fly) and client (Vercel/Netlify/same host). Set CORS to the real client origin.
9. [ ] Put the live URL in `README.md`. Check it from your phone on mobile data.
10. [x] Settle the six "PRD gaps" in `00-EXECUTION-PLAN.md`; record answers in a short `docs/DECISIONS.md` with dates.
11. [x] Create `docs/AI-LOG.md` (date · tool · what for · accepted/rejected · why).

## Done when
`curl <live-url>/health` works, CI is green, README lists ≤5 local-run commands that you tested on a clean clone.

## Doc hooks
- DESIGN.md → Boundary section (draft now, cite lint config `file:line` later).
- README.md → live URL + run commands.

## Viva questions
- Show me the lint rule that protects the core. What happens if I import mongoose in `domain/`?
