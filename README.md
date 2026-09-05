# FixSure

Trust-first phone repair & buyback website.

## Branching & releases

See [docs/BRANCHING.md](docs/BRANCHING.md):

`feature/*` → **PR** → `develop` → **PR** → `qa` → **GitHub Release** → `prod`

CI runs ESLint, TypeScript, and production build on every PR. SonarCloud runs when `SONAR_TOKEN` is set.

## Quick start

```bash
npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Admin (hidden from nav): `/admin` — default password `fixsure-admin` (change in Store settings).

## Scripts

```bash
npm run lint
npm run typecheck
npm run build
npm run ci
```
