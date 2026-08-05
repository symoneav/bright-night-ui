# PV Fleet Explorer

Explore ~10,000 photovoltaic sites on a map, inspect details, add new sites, and compare a small set visually.

## Requirements

- Node.js **≥ 20.9**
- npm

## Setup

```bash
npm install
```

## Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Allow browser location access to see nearby sites (100 mi radius). Click a marker to open the detail drawer. Check **Include in comparison** on 2–5 sites to show the chart.

## Tests

```bash
npm test
```

Unit tests cover pure logic in `src/lib/`: CSV parsing, normalization, derived confidence/flags, geo filtering, form validation, site comparison data, and CSV append/serialize.

## Other scripts

```bash
npm run lint
npm run format:check
npm run build
```

See `DECISIONS.md` for architecture notes.
