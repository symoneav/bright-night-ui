# DECISIONS.md

## TL;DR

**Next.js 15 (App Router) + React 19 + TypeScript** app with **MUI** for UI chrome, **Leaflet** for the map (client-only), **MUI X Charts** for site comparison, and **Vitest** for unit tests on pure logic in `src/lib/` plus lightweight component tests.

Fleet data lives in `data/pv_sites_sample.csv` (not `public/`). The server reads and normalizes it at **`GET /api/sites`**; new sites append via **`POST /api/sites`** (single object or array). The client uses **`loadFleet()`** / **`addSiteToFleet()`** / **`addSitesToFleet()`** in `src/data/fleet.ts` — components never touch the CSV directly.

**Run:** `npm install` → `npm run dev` (Node ≥ 20.9) · **Test:** `npm test`

---

## Stack & packages

| Package | Role |
| --- | --- |
| **next** | App framework — App Router, API routes, production build |
| **react** / **react-dom** | UI (v19) |
| **typescript** | Typed models and pure logic |
| **@mui/material** + **@emotion/** + **@mui/material-nextjs** | Dialogs, forms, layout, drawer; `AppRouterCacheProvider` avoids SSR style mismatches |
| **@mui/x-charts** | Comparison bar charts (energy + orientation) |
| **leaflet** + **react-leaflet** | Map (OSM tiles, no API key) |
| **leaflet.markercluster** + **react-leaflet-cluster** | Cluster nearby markers at low zoom |
| **papaparse** | CSV parsing in `src/lib/parse.ts` |
| **sass** | Component-scoped CSS modules |
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
    → sites-store.ts      (in-memory cache after first disk read)
    → loadFleet() / addSiteToFleet() / addSitesToFleet()
      → useFleet()
        → FleetExplorer
          → CompareProvider (compare selection state)
          → MapView (dynamic, ssr: false)
            → NearbySiteMarkers (clustered)
            → FocusedSiteLayer
            → CenterMarker (draggable search pin)
            → SiteMapMarker → Popup (SiteDetailContent)
          → SiteDetailDrawer (full fields + compare checkbox)
          → ComparisonChart (MUI X Charts, 2–5 sites)
          → AddSiteButton (single + bulk modal forms)
```

### End-to-end flows

**Load:** `useFleet()` on mount → `GET /api/sites` → `sites-store` reads CSV once, `parseCsv` + `normalizeFleet` → cached `CleanSite[]` JSON → React state → map + header.

**Add site:** Form → client `validateSiteForm()` → `POST /api/sites` → server re-validates → `normalizeSiteFormInput()` → append CSV row → `setCachedSites()` → return `CleanSite` → client updates state → map focuses new site.

**Compare:** Drawer checkbox → `CompareProvider` (max 5 IDs) → `ComparisonChart` calls `buildComparisonChartData()` + `estimateSiteEnergy()` for kWh and tCO₂ estimates.

### Logic vs view

| Location | Responsibility |
| --- | --- |
| `src/lib/` | Pure functions — parse, normalize, derived, validate, geo filter, compare chart data, energy estimates, date handling, CSV serialize/append. **No React/MUI imports.** (Exception: `marker-icons.ts` imports Leaflet for div icon config.) |
| `src/types/` | `CleanSite`, `RawCsvRow`, form types |
| `src/data/fleet.ts` | Client fetch abstraction; maps API errors to `AddSiteFleetError`; swap implementation for v2 API/DB |
| `src/hooks/useFleet.ts` | Client state orchestration (load, add single, add bulk) |
| `src/context/` | Cross-cutting UI state (`CompareProvider`) |
| `src/utils/` | Leaflet/React map helpers (`fly-to-location`, `initial-location-sync`) |
| `src/components/` | Render pre-cleaned `CleanSite`; explicit `"—"` for nulls; form state only in form components |
| `src/app/api/` | Thin server glue — read file, call lib, return JSON |

Normalization and derived values run **once** on the server (and again on append) before data reaches the UI. Components do not re-interpret sentinels (`-1`, `-9999`) or recompute confidence.

### Server cache (`sites-store.ts`)

- **`loadSitesFromDisk()`** — reads CSV on first call, normalizes, caches; subsequent calls return cache.
- **`setCachedSites()`** — called after successful POST so the cache includes new sites without re-reading disk.
- **`getCachedSites()`** / **`clearCachedSites()`** — exported for reload endpoints, test isolation, or clear-and-reload POST flows; not wired in routes yet.

### Leaflet + SSR

Leaflet needs `window`. Map components use `"use client"` and `dynamic(..., { ssr: false })`. Leaflet CSS is imported in `globals.css`. Default marker icons are patched via CDN URLs in `MapView.tsx`. Map fly-to behavior lives in `src/utils/`.

---

## Scale (~10k records)

We do **not** render all ~10k markers at once.

1. **Geo filter** — `filterSitesWithinRadius()` (haversine, tested) limits the working set to sites within 100 mi of the filter center (user location or draggable pin).
2. **Marker clustering** — `react-leaflet-cluster` groups remaining markers at low zoom.
3. **Missing coords** — sites with `-9999` or out-of-bounds coordinates get `coordinates: null` and are omitted from the map; count shown in the header.

Newly added or focused sites are injected into the nearby set even if outside the radius so they remain visible. When sites are selected for comparison, the map can fit bounds to their coordinates.

---

## Missing / ambiguous data

- Sentinels `-1` / `-1.0` / empty → `null`
- Coordinates `-9999` or outside US bounds → `coordinates: null`
- **Confidence** (0–100): weighted checklist in `src/lib/derived.ts`
- **Flags**: deterministic reviewer hints (missing coords, tracking, old install, etc.)
- UI shows `"—"` for null fields

Form validation lives in `src/lib/validate-site-form.ts` as pure functions, called from the add-site form and server append path. Install dates use `src/lib/date-only.ts` (local calendar dates, no UTC midnight shifts). Client forms reject future dates; server append allows a 1-day grace via `futureDateGraceDays`.

---

## Energy & comparison

- **`src/lib/energy-calculations.ts`** — estimates annual kWh from system size, lat/lng, tilt, azimuth, efficiency, etc.; derives tCO₂ from grid intensity. Returns `null` when inputs are insufficient.
- **`src/lib/compare-sites.ts`** — selection helpers (2–5 sites), `buildComparisonChartData()` for chart rows.
- **`ComparisonChart`** — MUI X bar charts for estimated energy and orientation; missing values omitted from bars (not plotted as zero). Removable site chips in panel header.

---

## UI features

| Feature | Status |
| --- | --- |
| Map + nearby sites | Done — geolocation, draggable search pin, 100 mi radius filter, clustering, recenter button |
| Marker detail | Done — compact Leaflet popup; expand icon opens drawer with full `SiteDetailContent` |
| Detail drawer | Done — MUI drawer with all site fields, confidence, flags, compare checkbox |
| Add site (single) | Done — modal form; client + server validation; persists to CSV; focuses new site on map |
| Bulk add sites | Done — bulk modal; `POST /api/sites` accepts array; validates each row sequentially |
| Compare chart | Done — 2–5 sites via drawer checkbox; energy + orientation charts; map bounds on selection |
| Empty states | Partial — location prompt overlay; no dedicated zero-fleet / zero-nearby / location-denied panels |

---

## Tests

`npm test` runs Vitest on `src/lib/__tests__/` and selected component tests:

- `parse.test.ts` — CSV parsing
- `normalize.test.ts` — sentinel → clean shape + derived integration
- `derived.test.ts` — confidence and flags rules
- `geo.test.ts` — haversine + radius filter
- `date-only.test.ts` — ISO date parse, future-date checks
- `validate-site-form.test.ts` — form validation
- `compare-sites.test.ts` — comparison selection + chart data
- `energy-calculations.test.ts` — solar output and carbon estimates
- `serialize.test.ts` / `append-site.test.ts` — CSV round-trip
- `constants.test.ts` — shared bounds and map constants
- Component smoke tests for map markers, forms, drawer, popup, and layout (Leaflet mocked globally)

---

## Remaining work (timebox order)

1. Empty states — zero fleet, location denied, no nearby sites within radius
2. Compare panel polish — expand/collapse control in chart header is not wired yet
3. Server-side geo query — push radius filter into the API/DB instead of shipping all sites to the client

---

## Top three next steps

1. **Server-side geo query** — push radius filter into the API/DB instead of shipping all sites to the client.
2. **Auth + real persistence** — replace CSV append with a database and authenticated writes.
3. **Cache strategy** — use `clearCachedSites()` for reload flows; proper invalidation for multi-instance deploys.

---

## AI tools

Application scaffolding built with **Cursor**.
