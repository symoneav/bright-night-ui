# DECISIONS.md

## TL;DR

**Next.js 15 (App Router) + React 19 + TypeScript** with **MUI** for UI, **Leaflet** for the map (client-only), **Recharts** for site comparison, and **Vitest** for unit tests on pure logic in `src/lib/`.

Fleet data lives in `data/pv_sites_sample.csv`. The server reads and normalizes it at **`GET /api/sites`**; new sites append via **`POST /api/sites`**. The client uses **`loadFleet()`** / **`addSiteToFleet()`** in `src/data/fleet.ts` — components never touch the CSV directly.

**Run:** `npm install` → `npm run dev` (Node ≥ 20.9) · **Test:** `npm test`

---

## Architecture

```
data/pv_sites_sample.csv
  → GET/POST /api/sites   (server: parse + normalize + cache / append)
    → loadFleet() / addSiteToFleet()
      → useFleet()
        → FleetExplorer
          → MapView (dynamic, ssr: false)
          → SiteDetailDrawer
          → SiteCompareChart
```

### Logic vs view

| Location | Responsibility |
| --- | --- |
| `src/lib/` | Pure functions — parse, normalize, derived, validate, geo filter, compare chart data. **No React/MUI/Leaflet imports.** |
| `src/types/` | `CleanSite`, `RawCsvRow`, form types |
| `src/data/fleet.ts` | Client fetch abstraction |
| `src/hooks/useFleet.ts` | Client state orchestration |
| `src/components/` | Render pre-cleaned `CleanSite`; explicit `"—"` for nulls; form state only in form components |
| `src/app/api/` | Thin server glue |

Normalization and derived values run **once** on the server (and again on append) before data reaches the UI. Components do not re-interpret sentinels (`-1`, `-9999`) or recompute confidence.

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
- UI shows `"—"` for null fields; chart omits null bars (not plotted as zero)

---

## UI features

| Feature | Implementation |
| --- | --- |
| Map + detail | Click marker → **MUI Drawer** with `SiteDetailContent` (confidence + flags) |
| Add site | Modal form; validates client + server; persists to CSV; focuses new site on map |
| Compare | Checkbox in drawer; 2–5 sites → **Recharts** bar chart via `buildComparisonChartData()` |
| Loading / error | Fleet load spinner; API error alert; add-site success/error banners |
| Empty states | Zero fleet sites; location denied; no nearby sites within radius |

---

## Tests

`npm test` runs Vitest on `src/lib/__tests__/`:

- `parse.test.ts` — CSV parsing
- `normalize.test.ts` — sentinel → clean shape + derived integration
- `derived.test.ts` — confidence and flags rules
- `geo.test.ts` — haversine + radius filter
- `validate-site-form.test.ts` — form validation
- `compare-sites.test.ts` — comparison selection + chart data
- `serialize.test.ts` / `append-site.test.ts` — CSV round-trip

---

## Top three next steps

1. **Server-side geo query** — push radius filter into the API/DB instead of shipping all sites to the client.
2. **Compare UX** — dedicated compare tray with metric toggles and export.
3. **Auth + real persistence** — replace CSV append with a database and authenticated writes.

---

## AI tools

Scaffolding built with **Cursor**.
