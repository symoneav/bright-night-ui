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

Allow browser location access to see nearby sites (100 mi radius). Click a marker for a compact popup, then use the expand icon to open the full detail drawer. Use **Add site** in the header to add a new installation.

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
