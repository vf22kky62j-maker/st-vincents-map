// Everything you'd typically want to tweak lives in this file.

export const MAP = {
  maxZoom: 19,
  initialMaxZoom: 18, // the map starts fitted to all buildings, no closer than this
  // Background maps; the first is shown by default, the rest appear in a toggle.
  // Both are free/keyless and fine for a demo. For production, swap in a
  // commercial provider (e.g. CARTO, Stadia, MapTiler) with an API key.
  basemaps: [
    {
      name: 'Map',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        maxZoom: 19,
        className: 'tiles-muted', // greyscale, see styles.css
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    },
    {
      name: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      options: {
        maxZoom: 19,
        attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
      },
    },
  ],
};

// Availability statuses, in order of "opportunity" (used for marker colour when a
// building holds several spaces). Colours are used for markers, pills and chips.
export const STATUSES = [
  { label: 'Available', color: '#15803d' },
  { label: 'Potential', color: '#c2410c' },
  { label: 'Historical', color: '#6d28d9' },
  { label: 'Occupied', color: '#334155' },
  { label: 'TBC', color: '#71717a' },
];

export const statusColor = label =>
  STATUSES.find(s => s.label === label)?.color ?? '#71717a';

// Filter panel. Each group is OR within itself and AND across groups.
// An option is just a label plus a test(space) function, so adding a new
// option or group is a one-liner.
const hasType = (...types) => s => s.type.some(t => types.includes(t));
const sizeBetween = (min, max) => s => s.sizeMax >= min && s.sizeMin < max;
const option = (field, value) => ({ label: value, test: s => s[field] === value });

export const FILTERS = [
  {
    id: 'type',
    label: 'Accommodation type',
    options: [
      { label: 'Office', test: hasType('Office') },
      { label: 'Laboratory', test: hasType('Laboratory') },
      { label: 'Clinical', test: hasType('Clinical') },
      { label: 'Medical / Consulting', test: hasType('Medical', 'Consulting') },
      { label: 'Event / Business', test: hasType('Event', 'Business') },
    ],
  },
  {
    id: 'size',
    label: 'Size',
    options: [
      { label: '<100 sqm', test: sizeBetween(0, 100) },
      { label: '100–500 sqm', test: sizeBetween(100, 500) },
      { label: '500–1,000 sqm', test: sizeBetween(500, 1000) },
      { label: '1,000–5,000 sqm', test: sizeBetween(1000, 5000) },
      { label: '5,000+ sqm', test: sizeBetween(5000, Infinity) },
    ],
  },
  {
    id: 'availability',
    label: 'Availability',
    options: STATUSES.map(s => ({ ...option('availability', s.label), color: s.color })),
  },
  {
    id: 'arrangement',
    label: 'Commercial arrangement',
    options: ['Lease', 'Licence', 'Sale', 'TBC'].map(v => option('arrangement', v)),
  },
];

// Car parks and public transport, shown as extra map layers (toggle them in
// the layer control) and as "Getting here" in the detail panel. `glyph` is the
// letter on the marker; `nearestFrom` limits which places count as "nearest".
export const PLACE_TYPES = {
  parking: { label: 'Car parks', glyph: 'P', color: '#1d4ed8', nearestLabel: 'Nearest visitor car park', nearestFrom: p => p.visitorAccess },
  tram: { label: 'Tram stops', glyph: 'T', color: '#4d7c0f', nearestLabel: 'Nearest tram stop' },
  bus: { label: 'Bus stops', glyph: 'B', color: '#a16207', nearestLabel: 'Nearest bus stop' },
  train: { label: 'Train stations', glyph: 'R', color: '#0e7490', nearestLabel: 'Nearest train station' },
};

// Rows shown in the property detail panel: [label, field on the space record].
// Building fields (address, organisation) are copied onto each space in data.js.
export const DETAIL_FIELDS = [
  ['Accommodation type', 'typeLabel'],
  ['Size', 'sizeLabel'],
  ['Availability', 'availability'],
  ['Commercial terms', 'commercialTerms'],
  ['Commercial arrangement', 'arrangement'],
  ['Fit-out', 'fitout'],
  ['Lease term', 'leaseTerm'],
  ['Parking', 'parking'],
  ['Organisation', 'organisation'],
  ['Source', 'source'],
  ['Evidence date', 'evidenceDate'],
  ['Notes', 'notes'],
];
