## Cabine IA API

NestJS backend for booth state, operator controls, generation, and delivery.

## Setup

```bash
npm install
cp .env.example .env   # set OPERATOR_PIN and JWT_SECRET (loaded at startup via load-env.ts)
```

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
