// Leaflet map: one marker per building, one shared popup for the property card.
import { MAP, STATUSES } from './config.js';
import { cardHtml, pin } from './templates.js';

export function createMap(el, buildings, { onSelect }) {
  const map = L.map(el, { maxZoom: MAP.maxZoom });
  const basemaps = Object.fromEntries(MAP.basemaps.map(b => [b.name, L.tileLayer(b.url, b.options)]));
  Object.values(basemaps)[0].addTo(map);
  if (MAP.basemaps.length > 1) L.control.layers(basemaps, null, { collapsed: false }).addTo(map);
  map.fitBounds(buildings.map(b => [b.lat, b.lng]), { padding: [60, 60], maxZoom: MAP.initialMaxZoom });

  const markers = new Map(
    buildings.map(b => [
      b.id,
      L.marker([b.lat, b.lng], { title: b.name, riseOnHover: true })
        .bindTooltip(b.name, { direction: 'top', offset: [0, -14] })
        .on('click', () => onSelect(b.id)),
    ]),
  );

  const popup = L.popup({ className: 'card-popup', offset: [0, -10], minWidth: 260, maxWidth: 300, autoPanPadding: [24, 24] });
  let syncing = false; // ignore popup closes we trigger ourselves
  map.on('popupclose', () => syncing || onSelect(null));

  // Show only buildings with a visible space, and the card for the selected one.
  function update(visibleSpaces, selectedId) {
    syncing = true;
    const byBuilding = Map.groupBy(visibleSpaces, s => s.buildingId);
    for (const [id, marker] of markers) {
      const spaces = byBuilding.get(id);
      if (spaces) marker.setIcon(pinIcon(spaces, id === selectedId)).addTo(map);
      else marker.remove();
    }
    const selected = selectedId && byBuilding.get(selectedId);
    if (selected) {
      popup.setLatLng(markers.get(selectedId).getLatLng()).setContent(cardHtml(selected));
      if (!map.hasLayer(popup)) popup.openOn(map);
    } else {
      map.closePopup();
    }
    syncing = false;
  }

  return { update, resize: () => map.invalidateSize() };
}

// Marker shows the space ID (or a count if a building has several matching
// spaces), coloured by the most "available" status among them.
function pinIcon(spaces, selected) {
  const rank = s => STATUSES.findIndex(x => x.label === s.availability);
  const status = spaces.toSorted((a, b) => rank(a) - rank(b))[0].availability;
  const label = spaces.length > 1 ? spaces.length : spaces[0].id;
  return L.divIcon({
    className: 'pin-icon',
    html: pin(label, status, selected ? 'is-selected' : ''),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}
