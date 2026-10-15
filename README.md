# DocHomoeo

One repository, two independent packages:

| Folder | What | Runs on |
|---|---|---|
| `/` (root) | Next.js 16 storefront and staff panel (`app/`, `components/`, `sections/`, `lib/`) | `http://localhost:3000` |
| `backend/` | Express 5 + Prisma 7 API (PostgreSQL), imported from `The-Angaar-Labs/Dochomeo` (branch `backend`, commit `d735d2b`) | `http://localhost:4000` |

Each package has its own `package.json`, lockfile and `node_modules`; they are not npm workspaces, so installing or deploying one never touches the other. The frontend reaches the API through the `/api/*` and `/uploads/*` rewrites in `next.config.ts` (target: `API_URL`, default `http://localhost:4000`).

`docohomo-prince/` (if present locally) is a read-only reference clone with its own git history. It is gitignored here and never imported.

## Getting started

```bash
# Frontend
npm install
npm run dev                 # http://localhost:3000

# Backend (needs a PostgreSQL database)
npm run backend:install
cp backend/.env.example backend/.env   # then fill in DATABASE_URL, JWT_SECRET, …
npm run backend:db:generate            # Prisma client (src/generated, not committed)
npm run backend:db:migrate             # needs backend/prisma/migrations from the backend developer
npm run backend:db:seed                # optional: first admin account
npm run backend:dev                    # http://localhost:4000, check /api/health
```

The storefront currently runs entirely on local mock repositories and needs no backend. See [DOCHOMO-FINAL-FRONTEND-HANDOFF.md](DOCHOMO-FINAL-FRONTEND-HANDOFF.md) for the integration plan. The staff panel at `/admin` needs the backend running.

## Scripts

| Script | Does |
|---|---|
| `npm run dev` / `build` / `start` / `lint` | Frontend |
| `npm run backend:dev` / `backend:start` | API in watch mode / once |
| `npm run backend:typecheck` | Type-check the API (the root `tsconfig.json` excludes `backend/`) |
| `npm run backend:db:generate` / `backend:db:migrate` / `backend:db:seed` | Prisma client, migrations, seed |

Other backend scripts (legacy import, demo data, etc.) run with `npm --prefix backend run <script>`; see `backend/package.json`.

## What is committed

- `backend/prisma/migrations/` and `*.sql` are **not committed**. Get them from the backend developer (upstream `backend` branch) and place them in `backend/prisma/` before running `backend:db:migrate` or building the Docker image, whose entrypoint runs `prisma migrate deploy`.
- `backend/.env.example` is committed as the setup template. `backend/.env`, `.env.local` and every other `.env*` file stay ignored.
- Generated and runtime files stay ignored: `node_modules/`, `backend/src/generated/`, `backend/uploads/`, `backend/private/`.

## Deployment

- **Frontend:** deploy the repository root (e.g. Vercel). Set `API_URL` to the backend's address once the API is live.
- **Backend:** build `backend/Dockerfile` with `backend/` as the build context. The container applies migrations on start, then serves on `PORT`.

## Updating the backend from upstream

`backend/` is plain files in this repository, not a submodule, so there are no nested-repo or detached-branch states to manage. To take a newer upstream backend:

1. Check out the upstream `backend` branch somewhere outside this repo.
2. Copy its files over `backend/`, keeping our `.gitignore`.
3. Review `git diff backend/` and commit it as one change, naming the upstream commit in the message.
