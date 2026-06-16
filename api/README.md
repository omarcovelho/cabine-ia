## Cabine IA API

NestJS backend for booth state, operator controls, generation, and delivery.

## Setup

```bash
npm install
cp .env.example .env   # set OPERATOR_PIN, JWT_SECRET, DATABASE_URL
```

## Database

SQLite database lives under `api/data/` (gitignored).

| Variable | Example | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `file:../data/cabine.db` | Prisma SQLite connection (path relative to `prisma/schema.prisma`) |

After changing env or cloning fresh:

```bash
npm run prisma:migrate:deploy   # apply migrations
npm run prisma:migrate          # create new migration in dev
```

On API boot, if no events exist, a default event + booth config (`activeThemeId: stub-a`) is seeded automatically. Guest screen phase is not stored on booth config — idle is `attract` (no session); in-flow phase lives on `Session`.

## Theme packs

Theme packs live under `api/themes/<themeId>/` (see [THEME_PACK_SPEC.md](../docs/THEME_PACK_SPEC.md)).

Example images are served publicly (no auth):

```http
GET /themes/stub-a/scenes/beach/example
→ 200 image/png
```

`GET /operator/themes` and `GET /booth` theme/scene metadata are wired in Phase F.

## Run

```bash
npm run start:dev      # watch mode on 127.0.0.1:3000
npm run start          # production start
```

## Tests

```bash
npm test               # unit tests
npm run test:e2e       # HTTP integration tests
npm run build
```

## Operator auth

Operator routes require a JWT obtained via PIN login. Guest routes (`GET /booth`, session commands) stay public.

**Required env vars** (see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `OPERATOR_PIN` | Operator login PIN |
| `JWT_SECRET` | Secret for signing JWTs |

**Login:**

```http
POST /operator/login
Content-Type: application/json

{ "pin": "1234" }
```

Response:

```json
{ "token": "<jwt>", "expiresIn": 86400 }
```

**Protected calls:** send `Authorization: Bearer <token>` on all `/operator/*` routes except login.

Example:

```bash
curl -X POST http://127.0.0.1:3000/operator/login \
  -H 'Content-Type: application/json' \
  -d '{"pin":"YOUR_PIN"}'

curl http://127.0.0.1:3000/operator/themes \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

## License

UNLICENSED — private project.
