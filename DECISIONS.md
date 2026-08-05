# DECISIONS.md

## TL;DR

**Next.js 15 (App Router) + React 19 + TypeScript** app with **MUI** for UI chrome, **Leaflet** for the map (client-only), and **Vitest** for unit tests on pure logic in `src/lib/`.

Fleet data lives in `data/pv_sites_sample.csv` (not `public/`). The server reads and normalizes it at **`GET /api/sites`**; the client calls **`loadFleet()`** in `src/data/fleet.ts` — components never touch the CSV directly.

**Run:** `npm install` → `npm run dev` (Node ≥ 20.9)

---

## Stack & packages

| Package                                                      | Role                                                                                  |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| **next**                                                     | App framework — App Router, API routes, production build                              |
| **react** / **react-dom**                                    | UI (v19)                                                                              |
| **typescript**                                               | Typed models and pure logic                                                           |
| **@mui/material** + **@emotion/** + **@mui/material-nextjs** | Drawers, dialogs, forms, layout; `AppRouterCacheProvider` avoids SSR style mismatches |
| **leaflet** + **react-leaflet**                              | Map (OSM tiles, no API key)                                                           |
| **leaflet.markercluster** + **react-leaflet-cluster**        | Cluster ~10k markers (wired in a later phase)                                         |
| **papaparse**                                                | CSV parsing in `src/lib/parse.ts`                                                     |
| **recharts**                                                 | Site comparison charts (later phase)                                                  |
| **vitest**                                                   | Tests for `src/lib/**` only — no DOM, no Next.js test runner                          |

### Why Next.js over Vite

Vite would be faster to scaffold for a single-page take-home. Next.js was chosen for a clear **scale path** without rewriting core logic:

- **Now:** Route Handler (`/api/sites`) reads CSV server-side and returns normalized JSON.
- **Later:** Same handler backed by a DB; optional SSR; auth middleware; extra pages (`/admin`, etc.).

`src/lib/` stays framework-agnostic so parse/normalize/validate can move server-side or into a separate package unchanged.

---

## Architecture

```
data/pv_sites_sample.csv
  → GET /api/sites          (server: parse + normalize + cache)
    → loadFleet()           (client data access)
      → useFleet()          (React state: loading, error, sites)
        → FleetExplorer     (MUI layout)
          → MapView         (Leaflet, dynamic import, ssr: false)
```

### Logic vs view

| Location                | Responsibility                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `src/lib/`              | Pure functions — parse, normalize, derived (confidence/flags). **No React/MUI/Leaflet imports.** |
| `src/types/`            | `CleanSite`, `RawCsvRow`, form types                                                             |
| `src/data/fleet.ts`     | Single fetch abstraction; swap implementation for v2 API/DB                                      |
| `src/hooks/useFleet.ts` | Client state orchestration                                                                       |
| `src/components/`       | Render pre-cleaned `CleanSite` objects; explicit `"—"` for nulls (as features land)              |
| `src/app/api/`          | Thin server glue — read file, call lib, return JSON                                              |

Normalization and derived values run **once** on the server before data reaches the UI. Components should not re-interpret sentinels (`-1`, `-9999`) or recompute confidence.

### Leaflet + SSR

Leaflet needs `window`. Map components use `"use client"` and `dynamic(..., { ssr: false })`. Leaflet CSS is imported in `globals.css`. Default marker icons are patched via CDN URLs in `MapView.tsx`.

---

## Data handling

- **Sentinels:** `-1` / `-1.0` / empty → `null`; coords `-9999` or out of US bounds → `coordinates: null`.
- **Confidence:** 0–100 weighted checklist in `src/lib/derived.ts`.
- **Flags:** Deterministic reviewer hints (missing coords, missing orientation, tracking, old install, etc.).
- **Missing coords:** Omitted from map; count surfaced in the header (~140 sites).

Form validation will live in `src/lib/validate.ts` as pure functions (not yet implemented).

---

## Tests

`npm test` runs Vitest against `src/lib/__tests__/**/*.test.ts`. Tests are planned for normalize, derived, and validate — **not written yet**.

---

## Not done yet (timebox order)

1. Marker clustering on the map
2. Detail drawer, add-site dialog, compare chart
3. `validate.ts` + form wiring
4. Unit tests for lib layer
5. README polish

---

## AI tools

Scaffolding built with **Cursor** (Claude).
