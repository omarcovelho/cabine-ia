# V1 — Scene selection slice

**Status:** In progress  
**Branch:** `feature/v1-scene-pick`  
**Last updated:** 2026-05-29

**Sources:** [PROJECT_DEFINITION.md](../PROJECT_DEFINITION.md) §5 Event/Theme/Scene, §6 steps 2–3, §7 pre-event event + theme, §10 operator event + theme + scene picker, §16 static examples · [ARCHITECTURE.md](../ARCHITECTURE.md) §5, §6, §8–9 · [MVP_EPIC_ROADMAP.md](../MVP_EPIC_ROADMAP.md) V1

---

## User outcome

Operator logs in, selects or creates an **active event**, then selects **theme**; guest taps **Começar** → sees **3 scene cards** (example + name) → picks one → lands on **“Tirar foto”** ready state; can go back and change scene.

**Demo:** `npm run dev` → operator creates/switches event → sets theme → guest completes scene pick → `curl http://127.0.0.1:3000/booth` shows `event`, `phase: "capture_ready"`, and `session.sceneId`.

---

## Slice boundary

### In scope

- Phases: `attract` → `scene_pick` → `capture_ready` (and back to `scene_pick`)
- **Operator-only auth:** PIN from env → JWT; guest routes public; `/operator/*` protected (except login)
- SQLite (Prisma): `Event`, `BoothConfig` (`activeEventId`, `activeThemeId`), `Session` (`eventId`, `sceneId`, `phase`)
- Operator event management: list, create, **explicit activate** (one active event; themes independent)
- Theme loader + two stub packs under `api/themes/`; example images served by API
- Enriched `GET /booth` snapshot (event, theme, scenes, session — **never prompts**)
- Kiosk: Começar, ScenePicker, CaptureReady shells; operator login + event picker + theme picker (hidden long-press entry)

### Deferred to V2+

- Camera, capture, face detection (V2)
- Countdown config UI (V5)
- Pause, retake, skip (V5)
- Event rename, delete, download archive (V6)
- Full remote deployment / CORS hardening (V7)
- `Tirar foto` action (capture starts in V2 — button is a shell in V1)

Kiosk must **not** advance phases locally — only send commands and read `phase` from the API.

---

## Architecture decisions

| Topic | Choice |
|-------|--------|
| ORM | Prisma |
| Auth boundary | Operator-only; guest routes public |
| Auth mechanism | `OPERATOR_PIN` in env → JWT via `POST /operator/login` |
| Event bootstrap | Auto-seed default event + set `activeEventId` on API boot if DB empty; operator-created events require **explicit activate** |
| Themes vs events | Theme packs global on disk; **not** scoped to events; `POST /operator/theme` independent of event routes |
| Stub themes | Two packs (`stub-a`, `stub-b`) for operator switch demo |
| Operator entry | Hidden corner long-press on Attract → login overlay |
| API bind | `127.0.0.1` in dev; `API_HOST` env documented for future remote deploy |
| Phase ownership | `GET /booth.phase` = `currentSession?.phase ?? 'attract'`; only `Session` stores guest phase; `BoothConfig` holds operator config only |

---

## API contract

All routes bind `127.0.0.1` only in dev. Base URL: `http://127.0.0.1:3000`.

### Auth

```http
POST /operator/login
{ "pin": "1234" }
→ 200 { "token": "<jwt>", "expiresIn": 86400 }
→ 401 invalid pin
```

Protected operator calls: `Authorization: Bearer <token>`.

### Guest routes (public)

| Route | Transition |
|-------|------------|
| `GET /booth` | Snapshot: phase, event, theme, scenes, config, session |
| `POST /sessions/start` | `attract` → `scene_pick`; creates session under **active event** |
| `POST /sessions/current/scene` `{ sceneId }` | `scene_pick` → `capture_ready` |
| `POST /sessions/current/back` | `capture_ready` → `scene_pick` (clear sceneId) |

Invalid transitions → **409**.

### Operator routes (protected)

| Route | Purpose |
|-------|---------|
| `GET /operator/events` | List events (id, name, timestamps) |
| `POST /operator/events` `{ name }` | Create event (does **not** auto-activate) |
| `POST /operator/events/:id/activate` | Set active event (409 if guest session in progress; same guard as theme change) |
| `GET /operator/themes` | List installed theme packs (no prompts) |
| `POST /operator/theme` `{ themeId }` | Set active theme (only when **no current session**) |

**Activation guard:** Reject event activate and theme change with **409** when a **current guest session** exists.

### Booth snapshot (V1)

```json
{
  "phase": "scene_pick",
  "event": { "id": "…", "name": "Festa da Ana" },
  "theme": { "id": "stub-a", "name": "Festa Cartoon" },
  "scenes": [
    {
      "id": "beach",
      "name": "Praia",
      "tagline": null,
      "exampleUrl": "/themes/stub-a/scenes/beach/example"
    }
  ],
  "config": {},
  "session": { "id": "…", "sceneId": null, "sceneName": null }
}
```

| Field | Notes |
|-------|-------|
| `phase` | Derived: `currentSession.phase` when session exists, else `'attract'` |
| `event` | Active event summary (id + name); always present when DB seeded |
| `scenes` | Populated from active theme when `phase` is `scene_pick` or later |
| `session.sceneName` | Set when `phase` is `capture_ready` |
| prompts | **Never** in any API response |

---

## Target folder structure

```
cabine-ia/
  api/
    prisma/schema.prisma
    src/
      auth/
      operator/
        events/       # list, create, activate
      sessions/
      themes/
      booth/
      database/
    themes/
      stub-a/
      stub-b/
  kiosk/
    src/
      api/            # boothClient, sessionClient, operatorClient
      auth/           # useOperatorAuth
      screens/        # AttractScreen, ScenePickerScreen, CaptureReadyScreen
      operator/       # OperatorLogin, OperatorEventPicker, OperatorThemePicker
      routing/PhaseRouter.tsx
  docs/
    epics/V1_SCENE_PICK.md
    [THEME_PACK_SPEC.md](../THEME_PACK_SPEC.md)
```

---

## Tasks

Each task: **Red → Green → Refactor**. Update status as work completes.

### Phase A — Setup

| ID | Task | Status |
|----|------|--------|
| V1-00 | Create branch `feature/v1-scene-pick` | done |
| V1-01 | Create this epic spec; link from `MVP_EPIC_ROADMAP.md` | done |
| V1-02 | `api/data/` in `.gitignore`; document `OPERATOR_PIN` + `JWT_SECRET` in `api/.env.example` | done |

### Phase B — Operator auth (foundation)

| ID | Task | TDD focus | Status |
|----|------|-----------|--------|
| V1-10 | `AuthModule`: validate PIN from env; sign JWT | Unit: valid/invalid pin | done |
| V1-11 | `POST /operator/login` | Integration: 200 + token / 401 | done |
| V1-12 | `JwtAuthGuard` on `/operator/*` except login | Integration: protected route 401 without token | done |
| V1-13 | Kiosk `operatorClient.login()` + `useOperatorAuth` | Vitest: stores token, attaches header | done |

### Phase C — Persistence

| ID | Task | TDD focus | Status |
|----|------|-----------|--------|
| V1-20 | Prisma scaffold + `Event`, `BoothConfig`, `Session` models | Migration applies in test DB | done |
| V1-21 | Boot seed: default event + default `activeThemeId` | Integration: fresh DB has one event | done |
| V1-22 | `DatabaseModule` / `PrismaService` wired in AppModule | App boots with SQLite under `api/data/` | done |

### Phase D — Theme packs

| ID | Task | TDD focus | Status |
|----|------|-----------|--------|
| V1-30 | Minimal `THEME_PACK_SPEC.md` | Doc review | done |
| V1-31 | Two stub packs in `api/themes/stub-a`, `stub-b` | Loader finds both | done |
| V1-32 | `ThemeService`: load manifest, guest-safe DTO | Unit: prompts not in DTO | done |
| V1-33 | Serve example images at `/themes/.../example` | Integration: GET returns image | done |

### Phase E — Session FSM + routes

| ID | Task | TDD focus | Status |
|----|------|-----------|--------|
| V1-39 | Refactor `BoothConfig` → singleton with `activeEventId` + `activeThemeId` | Migration + boot seed tests | done |
| V1-40 | `SessionFsmService`: V1 phase transitions | Unit: attract→scene_pick→capture_ready→scene_pick | done |
| V1-41 | `POST /sessions/start` | Integration: phase `scene_pick`, session created with `eventId` | done |
| V1-42 | `POST /sessions/current/scene` | Integration: `capture_ready` + sceneId | done |
| V1-43 | `POST /sessions/current/back` | Integration: back to `scene_pick` | done |
| V1-44 | Reject invalid transitions | Integration: 409 | done |

#### Phase E — Implementation notes

**Architecture:** Singleton [`BoothConfig`](api/prisma/schema.prisma) holds operator config (`activeEventId`, `activeThemeId`). On `POST /sessions/start`, `session.eventId` is copied from `boothConfig.activeEventId`. In-flow routes use the open session — no separate `BoothState` table.

**V1 session phases** (stored on `Session.phase`):

| Phase | Meaning |
|-------|---------|
| `scene_pick` | Guest started; no scene chosen yet |
| `capture_ready` | Scene locked; ready for capture (V2) |

Booth idle = no open session → `resolveBoothPhase` returns `attract`.

**FSM transitions** (`SessionFsmService` — pure, no I/O):

| Command | From | To | Side effects |
|---------|------|-----|--------------|
| `start` | no session (`attract`) | `scene_pick` | Create `Session` with `eventId = boothConfig.activeEventId` |
| `selectScene(sceneId)` | `scene_pick` | `capture_ready` | Set `sceneId` (validated against `boothConfig.activeThemeId`) |
| `back` | `capture_ready` | `scene_pick` | Clear `sceneId` |

**Phase F handoff:** `BoothService.getSnapshot()` reads singleton `BoothConfig` (at attract) or open session (in-flow); `ThemeService.toGuestScenes()` when phase ≥ `scene_pick`. Operator activate updates `boothConfig.activeEventId`.

### Phase F — Operator events, theme + booth snapshot

| ID | Task | TDD focus | Status |
|----|------|-----------|--------|
| V1-50 | `GET /operator/themes` (protected) | Lists packs without prompts | done |
| V1-51 | `POST /operator/theme` (protected) | Snapshot reflects new scenes | done |
| V1-52 | Refactor `BoothService` → snapshot from DB + themes; `phase` via `resolveBoothPhase` | Integration: full JSON per phase | done |
| V1-53 | E2E: login → set theme → guest start → booth scenes | supertest chain | done |
| V1-54 | `GET /operator/events` | Integration: lists seeded + created events | done |
| V1-55 | `POST /operator/events` | Integration: creates event; does not change active | done |
| V1-56 | `POST /operator/events/:id/activate` | Integration: active event updates; 409 when session in progress | done |

#### Phase F — Implementation notes

- **`GET /booth`** returns live snapshot: event, theme, scenes (when in-flow), session with `sceneName` at `capture_ready`.
- **Activation guard:** `POST /operator/theme` and `POST /operator/events/:id/activate` call `SessionsService.assertNoOpenSession()` → 409.
- **`GET /operator/events`** includes `isActive` per event (`id === boothConfig.activeEventId`).
- **Phase G handoff:** kiosk polls `GET /booth`; operator client needs event/theme routes (Phase H).

### Phase G — Kiosk guest flow

| ID | Task | TDD focus | Status |
|----|------|-----------|--------|
| V1-60 | Extend `booth.ts` types for V1 | Typecheck | pending |
| V1-61 | `sessionClient`: start, selectScene, back | Vitest mocks | pending |
| V1-62 | AttractScreen: **Começar** → start session | RTL: button calls client | pending |
| V1-63 | `ScenePickerScreen`: 3 cards, tap → selectScene | RTL: renders scenes | pending |
| V1-64 | `CaptureReadyScreen`: scene name, Voltar, Tirar foto stub | RTL: back calls client | pending |
| V1-65 | `PhaseRouter`: `scene_pick`, `capture_ready` | Vitest routing | pending |

### Phase H — Kiosk operator flow

| ID | Task | TDD focus | Status |
|----|------|-----------|--------|
| V1-70 | Hidden long-press on Attract opens operator overlay | RTL: gesture opens login | pending |
| V1-71 | `OperatorLogin` + `OperatorEventPicker` + `OperatorThemePicker` | RTL: login then list events and themes | pending |
| V1-72 | Theme select → `POST /operator/theme`; poll picks up change | Component test | pending |
| V1-73 | `OperatorEventPicker`: list events, create (name), activate | RTL: create + activate calls client | pending |
| V1-74 | Event flow in operator overlay: event before theme; PT labels | Component test | pending |

### Phase I — Sign-off

| ID | Task | Status |
|----|------|--------|
| V1-80 | Manual demo script (see below) | pending |
| V1-81 | Epic DoD checklist complete | pending |

---

## Environment variables

Copy `api/.env.example` to `api/.env`. Required for V1:

| Variable | Purpose |
|----------|---------|
| `OPERATOR_PIN` | Operator login PIN (never commit real value) |
| `JWT_SECRET` | Secret for signing operator JWTs |
| `DATABASE_URL` | SQLite path (e.g. `file:./data/cabine.db`) — added in Phase C |

Optional (future):

| Variable | Purpose |
|----------|---------|
| `API_HOST` | Bind address override (default `127.0.0.1`; V7 prod) |

---

## Manual demo script

1. From repo root: `npm run dev`
2. Copy `api/.env.example` → `api/.env`; set `OPERATOR_PIN` and `JWT_SECRET`
3. Open kiosk (`localhost:5173`); long-press hidden corner → operator login → enter PIN → create or activate event → pick theme
4. Guest: tap **Começar** → pick a scene card → see **Tirar foto** with scene name
5. Tap **Voltar** → scene picker again
6. `curl http://127.0.0.1:3000/booth` → expect `event`, `phase`, and `session` matching UI
7. Operator creates new event, activates it, switches theme → guest scene cards update on next poll; new sessions belong to new event

---

## Definition of Done

- [ ] Failing test first for each behavior task; full suite passes
- [ ] Demoable: auth + event create/activate + theme switch + guest scene pick path via `npm run dev`
- [ ] Traces to product §6 steps 2–3, §7 pre-event event selection, and §10 operator event + theme + scene picker
- [ ] API owns phase FSM; kiosk does not duplicate FSM
- [ ] Prompts never leak to kiosk or public API responses
- [ ] Operator routes return 401 without valid JWT
- [ ] No api↔kiosk cross-imports; secrets in api only
- [ ] PT copy on new guest screens (Começar, Voltar, Tirar foto; scene names from packs) and operator event UI (PT labels for list/create/activate)

---

## Document history

| Date | Change |
|------|--------|
| 2026-05-29 | Initial V1 epic spec; Phase A complete |
| 2026-05-29 | Phase B complete — operator PIN login, JWT guard, kiosk auth hook |
| 2026-05-29 | Phase C complete — Prisma SQLite, Event/BoothConfig/Session, boot seed |
| 2026-05-29 | Operator event management: list/create/activate, persistence model, API contract, tasks V1-54–56, V1-73–74 |
| 2026-05-29 | Phase ownership: drop `BoothConfig.phase`; derive booth phase from session |
| 2026-05-29 | Phase D complete — theme pack spec, stub packs, ThemeService, example URLs |
| 2026-05-29 | Phase E complete — singleton BoothConfig, SessionFsmService, session routes |
| 2026-05-29 | Phase F complete — operator events/theme routes, live GET /booth snapshot |
