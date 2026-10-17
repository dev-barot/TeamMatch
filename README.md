# TeamMatch — AI-Assisted Team Formation Platform

**Live:** <PASTE LIVE URL HERE>  
**Evidence of outside use:** [docs/EVIDENCE.md](docs/EVIDENCE.md)

Students post Projects with the Positions they need; other Students apply or get invited; a Match engine ranks Projects and Students and **explains why** with Match Reasons.

## Run locally (≤ 5 commands)
```bash
git clone https://github.com/dev-barot/TeamMatch.git && cd TeamMatch
cp server/.env.example server/.env      # fill MONGODB_URI, JWT_SECRET
npm install --workspaces
npm run seed -w server                   # optional demo data
npm run dev                              # server :4000, client :5173
```
Tests: `npm test`. Docs check: `npm run check:docs`.

## Docs
[UBIQUITOUS_LANGUAGE.md](UBIQUITOUS_LANGUAGE.md) · [DESIGN.md](DESIGN.md) · [TESTING.md](TESTING.md) · [docs/00-EXECUTION-PLAN.md](docs/00-EXECUTION-PLAN.md)
