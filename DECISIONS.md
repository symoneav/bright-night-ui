# DECISIONS.md

## TL;DR

**Next.js 15 (App Router) + React 19 + TypeScript** app with **MUI** for UI chrome, **Leaflet** for the map (client-only), and **Vitest** for unit tests on pure logic in `src/lib/` plus lightweight component tests.

Fleet data lives in `data/pv_sites_sample.csv` (not `public/`). The server reads and normalizes it at **`GET /api/sites`**; new sites append via **`POST /api/sites`**. The client uses **`loadFleet()`** / **`addSiteToFleet()`** in `src/data/fleet.ts` — components never touch the CSV directly.

**Run:** `npm install` → `npm run dev` (Node ≥ 20.9) · **Test:** `npm test`

---

## Stack & packages

| Package | Role |
| --- | --- |
| **next** | App framework — App Router, API routes, production build |
| **react** / **react-dom** | UI (v19) |
| **typescript** | Typed models and pure logic |
| **@mui/material** + **@emotion/** + **@mui/material-nextjs** | Dialogs, forms, layout; `AppRouterCacheProvider` avoids SSR style mismatches |
| **leaflet** + **react-leaflet** | Map (OSM tiles, no API key) |
| **leaflet.markercluster** + **react-leaflet-cluster** | Cluster nearby markers at low zoom |
| **papaparse** | CSV parsing in `src/lib/parse.ts` |
| **recharts** | Installed; comparison chart UI not wired yet |
| **vitest** + **@testing-library/react** + **happy-dom** | Lib unit tests + focused component tests |

### Why Next.js over Vite

Vite would be faster to scaffold for a single-page take-home. Next.js was chosen for a clear **scale path** without rewriting core logic:

- **Now:** Route Handler (`/api/sites`) reads CSV server-side and returns normalized JSON.
- **Later:** Same handler backed by a DB; optional SSR; auth middleware; extra pages (`/admin`, etc.).

`src/lib/` stays framework-agnostic so parse/normalize/validate can move server-side or into a separate package unchanged.

---

## Architecture

```
data/pv_sites_sample.csv
  → GET/POST /api/sites   (server: parse + normalize + cache / append)
    → loadFleet() / addSiteToFleet()
      → useFleet()
        → FleetExplorer
          → MapView (dynamic, ssr: false)
            → NearbySiteMarkers (clustered)
            → FocusedSiteLayer
            → SiteMapMarker → Popup (SiteDetailContent)
          → AddSiteButton (modal form)
```

### Logic vs view

| Location | Responsibility |
| --- | --- |
| `src/lib/` | Pure functions — parse, normalize, derived, validate, geo filter, compare chart data. **No React/MUI/Leaflet imports.** |
| `src/types/` | `CleanSite`, `RawCsvRow`, form types |
| `src/data/fleet.ts` | Client fetch abstraction; swap implementation for v2 API/DB |
| `src/hooks/useFleet.ts` | Client state orchestration |
| `src/components/` | Render pre-cleaned `CleanSite`; explicit `"—"` for nulls; form state only in form components |
| `src/app/api/` | Thin server glue — read file, call lib, return JSON |

Normalization and derived values run **once** on the server (and again on append) before data reaches the UI. Components do not re-interpret sentinels (`-1`, `-9999`) or recompute confidence.

### Leaflet + SSR

Leaflet needs `window`. Map components use `"use client"` and `dynamic(..., { ssr: false })`. Leaflet CSS is imported in `globals.css`. Default marker icons are patched via CDN URLs in `MapView.tsx`.

---

## Scale (~10k records)

We do **not** render all ~10k markers at once.

1. **Geo filter** — `filterSitesWithinRadius()` (haversine, tested) limits the working set to sites within 100 mi of the user's location.
2. **Marker clustering** — `react-leaflet-cluster` groups remaining markers at low zoom.
3. **Missing coords** — sites with `-9999` or out-of-bounds coordinates get `coordinates: null` and are omitted from the map; count shown in the header.

Newly added or focused sites are injected into the nearby set even if outside the radius so they remain visible.

---

## Missing / ambiguous data

- Sentinels `-1` / `-1.0` / empty → `null`
- Coordinates `-9999` or outside US bounds → `coordinates: null`
- **Confidence** (0–100): weighted checklist in `src/lib/derived.ts`
- **Flags**: deterministic reviewer hints (missing coords, tracking, old install, etc.)
- UI shows `"—"` for null fields

Form validation lives in `src/lib/validate-site-form.ts` as pure functions, called from the add-site form and server append path.

---

## UI features

| Feature | Status |
| --- | --- |
| Map + nearby sites | Done — location-based radius filter, clustering, focused-site highlight |
| Marker detail | Done — Leaflet popup with `SiteDetailContent` |
| Add site | Done — modal form; client + server validation; persists to CSV; focuses new site on map |
| Detail drawer | Not done — popup only; drawer + expand icon planned |
| Compare chart | Not done — `compare-sites.ts` logic + tests exist; Recharts panel not wired |
| Empty states | Partial — location prompt overlay; no dedicated zero-fleet / zero-nearby panels |

---

## Tests

`npm test` runs Vitest on `src/lib/__tests__/` and selected component tests:

- `parse.test.ts` — CSV parsing
- `normalize.test.ts` — sentinel → clean shape + derived integration
- `derived.test.ts` — confidence and flags rules
- `geo.test.ts` — haversine + radius filter
- `validate-site-form.test.ts` — form validation
- `compare-sites.test.ts` — comparison selection + chart data
- `serialize.test.ts` / `append-site.test.ts` — CSV round-trip
- `constants.test.ts` — shared bounds and map constants
- Component smoke tests for map markers, forms, and layout (Leaflet mocked globally)

---

## Remaining work (timebox order)

1. Detail drawer — expand from popup for full-screen detail view
2. Compare chart UI — wire `buildComparisonChartData()` to Recharts (2–5 sites)
3. Empty states — zero fleet, location denied, no nearby sites within radius

---

## Top three next steps

1. **Detail drawer + compare UX** — finish drawer, comparison checkbox, and chart panel.
2. **Server-side geo query** — push radius filter into the API/DB instead of shipping all sites to the client.
3. **Auth + real persistence** — replace CSV append with a database and authenticated writes.

---

## AI tools

Application Scaffolding built with **Cursor**.
