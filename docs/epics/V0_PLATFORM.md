# V0 — Platform slice

**Status:** Ready for implementation  
**Branch:** `feature/v0-platform`  
**Last updated:** 2026-05-29

**Sources:** [PROJECT_DEFINITION.md](../PROJECT_DEFINITION.md) §6 step 1 · [ARCHITECTURE.md](../ARCHITECTURE.md) §4–5, §9 · [MVP_EPIC_ROADMAP.md](../MVP_EPIC_ROADMAP.md) V0

---

## User outcome

Laptop runs API + kiosk; guest sees idle **Attract** screen driven by server state.

**Demo:** `npm run dev` → kiosk fullscreen shows *"Faça seu retrato cartoon"* while `GET /booth` reports `phase: "attract"`.

---

## Slice boundary

### In scope

- NestJS on `127.0.0.1` with `GET /health` and `GET /booth`
- In-memory booth state (`phase: "attract"` only — no SQLite until V1)
- React kiosk polling `/booth`; **Attract** screen rendered from API `phase`
- Dev orchestration script (`scripts/`)
- Strict TDD per task (Jest + supertest in api; Vitest in kiosk)

### Deferred to V1+

- SQLite, theme packs, session routes, operator panel, all `POST` commands
- **Começar** button and phase transitions (`attract` → `scene_pick`)
- Camera, face detection, generation, R2

Kiosk must **not** advance phases locally — only read `phase` from the API.

---

## API contract

All routes bind `127.0.0.1` only. Base URL in dev: `http://127.0.0.1:3000`.

### `GET /health`

```json
{ "status": "ok" }
```

### `GET /booth`

Forward-compatible snapshot shell for later epics:

```json
{
  "phase": "attract",
  "theme": null,
  "scenes": [],
  "config": {},
  "session": null
}
```

| Field | V0 value | Notes |
|-------|----------|-------|
| `phase` | `"attract"` | Server-driven guest screen selector |
| `theme` | `null` | Populated in V1 |
| `scenes` | `[]` | Populated in V1 |
| `config` | `{}` | Countdown settings in V5 |
| `session` | `null` | Populated when guest session starts (V1) |

---

## Target folder structure

```
cabine-ia/
  api/
    src/
      main.ts
      app.module.ts
      health/
      booth/
        booth.module.ts
        booth.controller.ts
        booth.service.ts
        booth.types.ts
    package.json
  kiosk/
    src/
      main.tsx
      App.tsx
      api/boothClient.ts
      hooks/useBoothPolling.ts
      screens/AttractScreen.tsx
      routing/PhaseRouter.tsx
      types/booth.ts
    package.json
    vite.config.ts
  scripts/
    dev.mjs
  package.json          # root: "dev" script only
```

---

## Tasks

Each task: **Red → Green → Refactor**. Update status as work completes.

### Phase A — Setup

| ID | Task | Status |
|----|------|--------|
| V0-00 | Create branch `feature/v0-platform` | done |
| V0-01 | Create this epic spec | done |
| V0-02 | Link from `MVP_EPIC_ROADMAP.md` | done |
| V0-03 | Root `.gitignore` | done |

### Phase B — API (`api/`)

| ID | Task | TDD focus | Status |
|----|------|-----------|--------|
| V0-10 | NestJS scaffold; `main.ts` binds `127.0.0.1` | App boots | done |
| V0-11 | `HealthModule` + `GET /health` | supertest → 200 | done |
| V0-12 | `BoothModule` + in-memory `BoothService` | Unit: returns attract | done |
| V0-13 | `GET /booth` → snapshot DTO | Integration: full JSON shape | done |
| V0-14 | CORS for kiosk dev origin (`localhost:5173`) | Manual or integration verify | done |

### Phase C — Kiosk (`kiosk/`)

| ID | Task | TDD focus | Status |
|----|------|-----------|--------|
| V0-20 | Vite + React + TS scaffold | Vitest runs | pending |
| V0-21 | Dev proxy `/api` → `127.0.0.1:3000` | Config | pending |
| V0-22 | `boothClient.ts` — `fetchBooth()` | Parses mock JSON | pending |
| V0-23 | `useBoothPolling` hook | Mock fetch; state updates | pending |
| V0-24 | `PhaseRouter` — phase → screen | `attract` → AttractScreen | pending |
| V0-25 | `AttractScreen` — PT headline, fullscreen | Renders copy | pending |
| V0-26 | `App.tsx` wire-up + kiosk base styles | Visual demo | pending |

### Phase D — Dev orchestration

| ID | Task | Status |
|----|------|--------|
| V0-30 | `scripts/dev.mjs` — spawn api + kiosk; SIGINT cleanup | pending |
| V0-31 | Root `package.json` with `"dev": "node scripts/dev.mjs"` | pending |

### Phase E — Sign-off

| ID | Task | Status |
|----|------|--------|
| V0-40 | Manual demo (see below) | pending |
| V0-41 | Epic DoD checklist complete | pending |

---

## Open decisions (V0)

| Topic | Choice |
|-------|--------|
| API port | `3000` |
| Poll interval | `1000ms` (constant in hook) |
| Test runners | Jest (Nest default) + Vitest (Vite default) |
| Kiosk dev port | `5173` (Vite default) |

---

## Manual demo script

1. From repo root: `npm run dev`
2. Wait for API (`127.0.0.1:3000`) and kiosk (`localhost:5173`) to start
3. Open kiosk in browser (fullscreen optional)
4. **Expect:** headline *"Faça seu retrato cartoon"* on dark fullscreen UI
5. In another terminal: `curl http://127.0.0.1:3000/booth`
6. **Expect:** JSON with `"phase": "attract"`
7. Stop with Ctrl+C — both processes exit

---

## Definition of Done

- [ ] Failing test first for each behavior task; full suite passes
- [ ] Demoable: `npm run dev` runs api + kiosk together
- [ ] Traces to product §6 step 1 and architecture §4–5
- [ ] API owns `phase`; kiosk does not duplicate FSM
- [ ] No api↔kiosk cross-imports; no secrets in kiosk
- [ ] PT copy on Attract screen
- [ ] Scope limited to V0 — no SQLite, themes, or POST routes

---

## Document history

| Date | Change |
|------|--------|
| 2026-05-29 | Initial V0 epic spec |
