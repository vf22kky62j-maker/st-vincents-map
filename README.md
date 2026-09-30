# Brenan Place Precinct — Accommodation Map (POC)

A minimal, clickable demo that shows how accommodation across the Brenan Place /
St Vincent's precinct could be mapped, filtered and explored:

**precinct buildings → accommodation types → space characteristics → availability → commercial information**

It's a static site: plain HTML/CSS/JS, [Leaflet](https://leafletjs.com) for the map, no build step.
All data is POC/demonstration data (see the caveat in the page footer).

## Run it

```bash
npm start          # or: python3 serve.py
```

Then open http://localhost:8000. (Opening `index.html` directly from Finder won't work,
because browsers block loading the data files from `file://`.)

```bash
npm test           # checks the three demo journeys + data sanity
```

## Where things live

| File | What it's for |
|---|---|
| `data/buildings.json` | One row per building: name, address, organisation, lat/lng |
| `data/spaces.json` | One row per accommodation record, linked to a building by `buildingId` |
| `js/config.js` | **Most edits go here**: filter options, status colours, detail-panel fields, basemaps |
| `js/data.js` | Loads the JSON and joins spaces to their building |
| `js/filters.js` | Pure filter logic (no DOM), used by the app and the tests |
| `js/map.js` | Leaflet map, markers and the property card popup |
| `js/sidebar.js` | Filter chips and the results list |
| `js/templates.js` | HTML for the property card and the detail panel |
| `js/app.js` | Holds the UI state and wires everything together |
| `css/styles.css` | All styling |
| `serve.py` | Tiny local server with caching off, so edits show on refresh |

## Data model

Buildings and spaces are stored separately so a building can hold many spaces
(this is the "space database, not a building map" requirement). Today each of
the 8 POC records is one building + one space. To split a building into suites,
just add more rows to `spaces.json` with the same `buildingId`:

```json
{ "id": "03a", "buildingId": "building-b", "name": "Suite 1", "size": 32, ... },
{ "id": "03b", "buildingId": "building-b", "name": "Suite 2", "size": 44, ... }
```

The map shows one marker per building; its card lists every matching space in it.

Space fields:

| Field | Notes |
|---|---|
| `id` | Unique, shown on the map marker |
| `buildingId` | Must match an `id` in `buildings.json` |
| `name` | Optional label within the building, e.g. "Suite 1" |
| `type` | List of type words, e.g. `["Research", "Laboratory"]` (shown as "Research / Laboratory") |
| `size` | sqm; a number (`650`) or a range (`[32, 44]`) |
| `availability` | One of the statuses in `config.js` (Available, Potential, Historical, Occupied, TBC) |
| `arrangement` | Lease, Licence, Sale or TBC |
| `commercialTerms` | Free text, e.g. `"$650/sqm pa"` |
| `fitout`, `leaseTerm`, `parking`, `source`, `evidenceDate`, `notes` | Free text |

## Common changes

- **Add a filter option** — add a line to `FILTERS` in `js/config.js`, e.g.
  `{ label: 'Research', test: hasType('Research') }`.
- **Change size buckets** — edit the `sizeBetween(min, max)` lines (min inclusive, max exclusive).
- **Show another field in the detail panel** — add it to the space rows in `spaces.json`,
  then add `['Label', 'fieldName']` to `DETAIL_FIELDS`.
- **Move a marker** — edit `lat`/`lng` in `buildings.json`. Current positions are taken from
  the named OpenStreetMap buildings; 20 Nicholson Street is placed on OSM's "18–28 Nicholson Street" footprint.
- **Basemap** — the default is OpenStreetMap (greyscale) with an Esri satellite toggle, both keyless
  and fine for a demo. For heavier/production use, switch `MAP.basemaps` to a keyed provider.

## Future (deliberately not built)

Multiple spaces per building in the real data, live availability, owner/operator login and
direct updates, documents, floor plans, photos, tenancy details, live asking rents, outgoings,
lease expiries, API integrations, enquiries, advanced search, CSV/Excel export.
