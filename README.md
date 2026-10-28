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

## Hosting (GitHub Pages)

The site is served straight from the `main` branch by GitHub Pages; there's no build step.
Push to `main` and the live site updates within a minute or two. Note the site is public.

## Where things live

| File | What it's for |
|---|---|
| `data/buildings.json` | One row per building: name, address, organisation, lat/lng |
| `data/spaces.json` | One row per accommodation record, linked to a building by `buildingId` |
| `data/parking.json` | Car parks: operator, access, spaces, hours, rates, source |
| `data/transport.json` | Tram/bus stops and train stations with the routes serving them |
| `data/amenities.json` | Public bike parking and nearby shops / cafés (`kind`: `bike` or `retail`) |
| `js/config.js` | **Most edits go here**: filter options, status colours, detail-panel fields, basemaps |
| `js/data.js` | Loads the JSON and joins spaces to their building |
| `js/filters.js` | Pure filter logic (no DOM), used by the app and the tests |
| `js/map.js` | Leaflet map, markers and the property card popup |
| `js/places.js` | Car park and transport map layers + their popups |
| `js/geo.js` | Distance, walking time and "nearest" helpers |
| `js/measure.js` | "Measure distance" tool: click two buildings for straight-line distance + walking time |
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

## Parking & transport data

- **Car parks** (`data/parking.json`): St Vincent's car parks, capacities, hours and rates are
  from the hospital's [Visitors Parking page](https://www.svhm.org.au/patients-visitors/campus-information/st-vincents-hospital-melbourne/visitors-parking)
  (rates effective 1 July 2026); 59 Lonsdale St from [First Parking](https://www.firstparking.com.au/locations/59-lonsdale-street/);
  locations and the CMMI car park from OpenStreetMap. Checked Oct 2026. Operators of the
  hospital car parks and anything marked TBC still need confirming.
- **Transport** (`data/transport.json`): generated from the Transport Victoria GTFS feed
  (https://data.ptv.vic.gov.au/downloads/gtfs.zip, Oct 2026): every tram/bus stop within ~320 m
  of the precinct plus Parliament Station, with the routes that actually stop there.
  Re-run when timetables change significantly.

- **Bike parking, shops & food** (`data/amenities.json`): public bike racks, cafés and shops
  from OpenStreetMap (Oct 2026), plus the hospital's own outlets from its
  [Cafes and retail page](https://svhm.org.au/patients-visitors/visiting-hours/cafes-and-retail).
  These layers start switched off; turn them on in the layer control.
- **End-of-trip & on-site retail** (fields on each building in `data/buildings.json`):
  Brenan Place from [IFM Investors](https://www.ifminvestors.com/en-au/capabilities/real-estate/our-real-estate-portfolio/brenan-place)
  (data as at 30 Jun 2026); hospital buildings from the hospital's retail page. Others are TBC.

The detail panel's "Getting here" section picks the nearest of each (car parks only if
`visitorAccess` is true).

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
