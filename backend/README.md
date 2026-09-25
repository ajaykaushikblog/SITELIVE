# Marigold & Maple — Backend (real REST API + PostgreSQL)

A real Node.js + TypeScript backend for the Marigold & Maple CMS and public
site: Express REST API, PostgreSQL via Drizzle ORM, cookie-session
authentication, server-enforced role permissions, media storage abstraction,
and a background scheduled-publish worker.

This package is **self-contained** — it installs and builds on its own so it
can be deployed independently of the frontend.

## Repository layout

```
code/
├─ src/                 # Existing React + Vite frontend (public site + CMS UI) — unchanged root
├─ backend/             # ← this package: API server
│  ├─ src/
│  │  ├─ config/env.ts        # validated env (fails fast on bad config)
│  │  ├─ db/                  # Drizzle client, schema, migrate/seed/reset
│  │  ├─ auth/                # bcrypt password hashing + opaque cookie sessions
│  │  ├─ middleware/          # auth + RBAC, error handling
│  │  ├─ routes/              # /api/* REST routes
│  │  ├─ storage/             # local | s3 media storage abstraction
│  │  └─ jobs/                # scheduled-publish worker
│  └─ drizzle.config.ts
├─ database/
│  ├─ migrations/       # generated SQL migrations (committed)
│  └─ seed/seed-data.json  # snapshot of the demo content used by the seed
└─ shared/src/          # permission model shared conceptually with the frontend
```

> The frontend was intentionally **not** moved into a `frontend/` folder: Figma
> Make and the existing tooling depend on the repo root. `backend/`,
> `database/` and `shared/` sit alongside it.

## Prerequisites

- Node.js ≥ 20, pnpm
- A PostgreSQL 14+ database you control (managed service, or local Docker)

## Setup

```bash
cd backend
cp .env.example .env          # then edit .env — see notes below
pnpm install
```

Fill in `.env`:

- `DATABASE_URL` — your PostgreSQL connection string
- `SESSION_SECRET` — generate with `openssl rand -hex 32`
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — the first admin account
- `CORS_ORIGINS` — the origin serving the frontend (e.g. the Vite preview URL)

### Local Postgres with Docker

```bash
docker run --name mm-pg -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=marigold -p 5432:5432 -d postgres:16
```

## Database

```bash
pnpm db:generate   # regenerate SQL migrations after schema changes (already committed)
pnpm db:migrate    # apply migrations to DATABASE_URL
pnpm db:seed       # load roles, the admin user, and the demo content snapshot
# pnpm db:reset    # DEV ONLY: drop + recreate the public schema
```

The seed is **idempotent** — safe to run repeatedly.

## Run

```bash
pnpm dev     # tsx watch (development)
pnpm build   # tsc → dist/
pnpm start   # node dist/index.js (production)
```

Health checks:

- `GET /api/health` — liveness (no DB)
- `GET /api/health/database` — real DB connectivity + latency

## API surface

| Area | Routes |
|------|--------|
| Auth | `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Content | `GET /api/content/public[?type=]`, `GET /api/content/public/:type/:slug`, `GET /api/content`, `GET/POST/PUT/DELETE /api/content/:id` |
| Taxonomy | `GET /api/taxonomy`, `POST/PUT/DELETE /api/taxonomy/:id` |
| Authors | `GET /api/authors`, `GET /api/authors/:slug`, `POST/PUT` |
| Users/roles | `GET /api/users`, `GET /api/users/roles`, `POST/PUT /api/users/:id` |
| Media | `GET /api/media`, `POST /api/media` (multipart `file`), `PUT/DELETE /api/media/:id` |
| Site | `GET/PUT /api/site/nav/:area`, `GET/PUT /api/site/homepage`, `GET /api/site/settings`, `GET/PUT /api/site/settings/:key` |
| Collections | `GET /api/collections`, `GET /api/collections/:slug`, `POST/PUT` |
| Redirects | `GET/POST/DELETE /api/redirects` |
| Activity | `GET /api/activity` |

## Security

- Passwords hashed with bcrypt (cost 12); plain text never stored or logged.
- Sessions are opaque random tokens in an **HttpOnly** cookie; only the SHA-256
  hash is stored server-side. `SameSite=Lax`, `Secure` when `COOKIE_SECURE=true`.
- **Permissions enforced on the server** from the DB role — the frontend only
  hides controls cosmetically.
- Helmet security headers; CORS restricted to `CORS_ORIGINS` with credentials.
- Global + stricter login rate limiting.
- All input validated with Zod; all queries parameterised by Drizzle (no raw SQL).
- Upload MIME allow-list + max size (`STORAGE_MAX_UPLOAD_MB`).
- No secrets committed; every value in `.env.example` is a placeholder.

## Integration required (not faked)

- **S3 media storage** — `STORAGE_DRIVER=s3` reads `S3_*` env but the driver
  throws until an S3 client is implemented (`src/storage/index.ts`). Use
  `local` until then.
- **Email provider / newsletter sending** — configured in the CMS UI; no
  provider is wired.
- **Analytics, ad/affiliate networks, search-engine submission** — prototype
  UI only.

## Multi-instance note

The scheduled-publish job runs in-process on an interval (fine for a single
instance). For horizontally-scaled deployments, move it to a dedicated worker
or a real queue.
