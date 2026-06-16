# Theme pack specification

**Status:** MVP authoring guide  
**Last updated:** 2026-05-29

**Sources:** [PROJECT_DEFINITION.md](./PROJECT_DEFINITION.md) §12 · [ARCHITECTURE.md](./ARCHITECTURE.md) §8 · [MVP_EPIC_ROADMAP.md](./MVP_EPIC_ROADMAP.md) V1

---

## Overview

Theme packs are **versioned on-disk assets** under `api/themes/<themeId>/`. They are **global** to the booth — not scoped to events. The API loads packs at runtime; **prompts never leave the server**.

Guests and operators see: theme name, scene names, taglines, and example image URLs only.

---

## Folder layout

```
api/themes/
  <themeId>/
    manifest.json
    scenes/
      <sceneId>/
        example.png
        prompt.txt
```

| Path | Purpose |
|------|---------|
| `manifest.json` | Theme metadata and scene list (guest-safe fields only) |
| `scenes/<sceneId>/example.png` | Guest-facing preview (static, pre-authored) |
| `scenes/<sceneId>/prompt.txt` | Generation prompt — **server-only**, never exposed via API |

The folder name **must match** `manifest.id`.

---

## Manifest schema

```json
{
  "id": "stub-a",
  "version": "1.0.0",
  "name": "Festa Cartoon",
  "scenes": [
    {
      "id": "beach",
      "name": "Praia",
      "tagline": null,
      "exampleFile": "scenes/beach/example.png"
    }
  ]
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | Stable theme identifier; matches folder name |
| `version` | yes | Semver string for support/logging |
| `name` | yes | Display name (pt-BR) for operator and guest UI |
| `scenes` | yes | **Exactly 3** scenes in MVP |
| `scenes[].id` | yes | Stable scene identifier within theme |
| `scenes[].name` | yes | Display name (pt-BR) |
| `scenes[].tagline` | no | Optional one-line subtitle |
| `scenes[].exampleFile` | yes | Relative path to example PNG from theme root |
| `scenes/<sceneId>/prompt.txt` | yes | Server-only generation prompt (V3+); loaded at runtime, not in manifest |

---

## MVP invariants

| Rule | Value |
|------|--------|
| Scenes per theme | **3** |
| Example aspect ratio | **4:5** (PNG or JPEG; PNG preferred for stubs) |
| Example authoring | **Static**, bundled before the event — not live-generated at picker time |
| Prompts in API responses | **Never** |
| Deliverable aspect (live gen) | **4:5**, no watermark |

---

## Example images

- Pre-generate with the **same prompts/model** intended for live generation when possible.
- Readable at arm’s length on the booth display.
- File name: `example.png` under `scenes/<sceneId>/`.
- Served by API at: `GET /themes/<themeId>/scenes/<sceneId>/example` (public; kiosk `<img>` tags).

---

## Authoring checklist (pre-event)

1. Create folder `api/themes/<themeId>/` with valid `manifest.json`.
2. Author **3 scenes** with distinct PT names, `prompt.txt` per scene, and example images.
3. Generate and QA **example.png** for each scene (4:5, matches intended live look).
4. Verify loader finds pack: theme appears in operator list (after Phase F wiring).
5. Open each example URL in browser; confirm image loads on kiosk dev proxy if applicable.
6. Dry-run one live generation per scene before the party (V8 pilot).

---

## Stub packs (development)

| themeId | name | Scenes |
|---------|------|--------|
| `stub-a` | Festa Cartoon | beach (Praia), city (Cidade), forest (Floresta) |
| `stub-b` | Aventura Épica | castle (Castelo), space (Espaço), jungle (Selva) |

Placeholders use solid-color 4:5 PNGs — sufficient for UI and flow testing until V8 production content.

---

## Related documents

| Document | Purpose |
|----------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Runtime loading and API surface |
| [epics/V1_SCENE_PICK.md](./epics/V1_SCENE_PICK.md) | V1 implementation tasks |

---

## Document history

| Date | Change |
|------|--------|
| 2026-05-29 | Initial MVP theme pack spec (V1 Phase D) |
| 2026-05-29 | Prompts moved from manifest to `scenes/<sceneId>/prompt.txt` |
