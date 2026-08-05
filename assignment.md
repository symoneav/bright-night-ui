# PV Fleet Explorer

> [!info] At a glance
> **Time box:** 3–4 hours. **Stack:** React + TypeScript.
> **Domain knowledge:** not required — everything you need is below.
> **Data:** we provide `pv_sites_sample.csv` (~10,000 records).

## Goal

Build a single-page app for a human reviewer to **explore a fleet of ~10,000
solar (PV) sites on a map, inspect any site's details, add a new site, and
compare a handful of sites visually.**

This is the UI counterpart to a backend take-home built on the same dataset. We
are not testing solar knowledge. We care about your **judgment on where data
logic lives vs. where the view lives, how you handle a dataset too big to render
naively, how you handle genuinely messy data, and whether your form and
visualizations behave like production code.**

## The key constraint: the data does not fit on screen

The dataset has ~10,000 records. You must **not** dump 10,000 markers onto a map
or 10,000 rows into the DOM and call it done — it will be unusable and slow.

The point of the exercise is that the user has to _explore_: the UI should let
them **narrow, aggregate, or cluster** the fleet and then drill into detail. How
you do that — marker clustering, aggregating to state/region, filtering to a
working set, viewport-based rendering, virtualization — is your call, but a naive
"render everything" approach is a fail. Show us you thought about scale.

## The three things it does

1. **Map + detail.** Plot the sites geographically using the `latitude` /
   `longitude` columns. Clicking a site (or a cluster, then a site) opens a
   **detail panel** showing that site's fields and a few **derived** values (see
   below). Note that a small number of sites have missing coordinates (`-9999`) —
   decide how to handle them (omit from the map, flag them, etc.).
2. **Add a site.** A **real form** to add a new site to the fleet on the fly. It
   validates, and on submit the new site appears on the map and is included in
   comparisons. This is the form we look at hardest — see requirements below.
3. **Compare + visualize.** Let the user pick a small set of sites (2–5) and
   **compare them in a chart** — e.g. system size, tilt/azimuth, or a derived
   orientation/quality metric. The chart must be readable and honest.

## The data

Columns in `pv_sites_sample.csv`:

| column                  | meaning                                                    |
| ----------------------- | ---------------------------------------------------------- |
| `system_ID`             | unique id, e.g. `SITE_00001`                               |
| `state`                 | US state code                                              |
| `zip_code`              | US zip (only location detail besides state)                |
| `system_size_DC`        | system size in kW                                          |
| `azimuth_1`             | panel compass direction, degrees (N=0, E=90, S=180, W=270) |
| `tilt_1`                | panel angle from horizontal (0=flat, 90=vertical)          |
| `module_quantity_1`     | number of modules                                          |
| `efficiency_1`          | module efficiency (fraction)                               |
| `tracking`              | 1 = tracking system, 0 = fixed-tilt                        |
| `installation_date`     | ISO date                                                   |
| `third_party_owned`     | 1 = third-party owned                                      |
| `ground_mounted`        | 1 = ground-mounted (0 = roof)                              |
| `latitude`, `longitude` | map coordinates (`-9999` when missing)                     |

**The data is messy.** Missing values are coded as a sentinel (`-1`, and in the
source dataset sometimes `-9999`) rather than left blank — most sites are missing
`azimuth`/`tilt` entirely, and `system_size_DC` and the flags have missing/
implausible values too. Boolean-ish columns arrive as `-1.0 / 0.0 / 1.0`. Dates
span 1998–2024. **Turning this into a clean, typed shape — and deciding when a
value is trustworthy — is a core part of the exercise.**

## Derived values (deterministic — keep them in tested functions)

Alongside the raw fields, compute a couple of **derived** values in plain code
(not in JSX). At minimum:

- A **data-quality / confidence** signal per site — e.g. how many of the fields
  that matter are present and plausible (azimuth in 0–359, tilt in 0–90, a
  positive size, a non-future date). Surface it in the detail panel.
- A short list of **flags** for things a reviewer should notice — e.g. missing
  orientation, `tracking` system (shouldn't be treated as fixed-tilt), very old
  system, third-party owned, implausible size. Plain rules are fine here.

These are deliberately deterministic. (If you want to layer an LLM-generated
plain-language summary on top, that's a nice-to-have, not required.)

## The form (this is what we look at hardest)

The "add a site" form must behave like production code:

- Sensible fields with **client-side validation** and clear inline errors:
  azimuth 0–359, tilt 0–90, positive size, a real state/zip, no future install
  date, etc.
- Validation logic lives in **tested pure functions**, not tangled in the
  component. An invalid state blocks or disables submit.
- **Submit is explicit** and does real work: validate, normalize to the same
  clean shape as the loaded data, add to the fleet, reflect it on the map.
- Handle the edge cases you'd expect a reviewer to try (out-of-range angles,
  empty required fields, duplicate id).

## Who does what

The single most important thing we want to see is a clean separation:

- **Pure logic (tested):** CSV parsing, normalization of the messy fields,
  the derived confidence/flags, aggregation/clustering math, and the form
  validation rules.
- **Components:** the map, the detail panel, the form's state, the chart, and the
  loading/empty/error UI.

If you find normalization, scoring, or validation rules living inside your JSX,
move them out. If a value can be missing, that decision is made once in the logic
layer and rendered as an explicit placeholder — never `undefined`, `NaN`, or a
crash.

## Required deliverables

1. A running app that does the three things above.
2. **Tests** for the non-UI logic — at minimum: normalization of messy/missing
   records, the derived confidence/flags, and the form validation rules.
3. A short **README**: how to run the app and the tests.
4. A one-page **`DECISIONS.md`**: what lives in pure logic vs components and why;
   how you kept ~10,000 records renderable; how you handled missing/ambiguous
   data; and the top three things you'd do next.

## Ground rules

- **Timebox to 3–4 hours.** If you run out, stub the rest and note what you'd
  have done. Prefer a clean, smaller app over a large unfinished one — say what
  you deprioritized and why.
- **Reproducible setup.** A `package.json` with a committed lockfile; one
  documented command to install, one to run, one to test. Docker is a plus, not
  required.
- **Send a `.zip` that includes the `.git` directory** — we want your **commit
  history**, not one squashed commit. Commit incrementally as you work.
- Prefer libraries you know for the map and charts (react-leaflet/MapLibre/deck.gl,
  Recharts/visx/Chart.js…). **Avoid anything that needs a paid API key** — free
  OSM tiles, or even a plain US map, are fine.
- Use any AI coding tools you like (Claude Code, Cursor, Copilot). **Tell us what
  you used** — model and tools.
- The next round is a **live walkthrough with edits** — make sure you understand
  everything you ship.

## What we evaluate

- Separation of data/logic from view; testable pure functions.
- Handling scale: a map/list of ~10,000 that stays responsive (clustering,
  aggregation, filtering, or virtualization) rather than brute force.
- A form that genuinely validates and submits — real edge cases.
- Handling of missing/inconsistent data — confidence and flags rather than
  confident wrong displays; never crashes.
- Visualizations that are readable and honest — sensible scales, labeled, missing
  values handled.
- Loading / empty / error UX.
- Tests of the non-trivial logic.
- Reproducibility, a clean commit history, and a clear README / DECISIONS.md.
- Taste and creativity in the explore/compare UX — this is where you can shine.

## Resources

- The dataset: `pv_sites_sample.csv` (included).
- react-leaflet: https://react-leaflet.js.org/ · Leaflet marker clustering:
  https://github.com/Leaflet/Leaflet.markercluster
- A CSV parser like PapaParse: https://www.papaparse.com/
