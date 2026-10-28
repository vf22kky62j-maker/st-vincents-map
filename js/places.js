// Map layers for car parks and public transport stops (one toggleable layer per
// PLACE_TYPES entry), each with a popup of details.
import { PLACE_TYPES } from './config.js';
import { placeIcon, placePopupHtml } from './templates.js';

export function createPlaceLayers(map, places, { onClick }) {
  const layers = Object.fromEntries(Object.keys(PLACE_TYPES).map(kind => [kind, L.layerGroup().addTo(map)]));
  const popup = L.popup({ className: 'card-popup', offset: [0, -8], minWidth: 240, maxWidth: 320, autoPanPadding: [24, 24] });
  const markers = new Map();

  for (const place of places) {
    const marker = L.marker([place.lat, place.lng], {
      icon: L.divIcon({ className: 'pin-icon', html: placeIcon(place.kind), iconSize: [20, 20], iconAnchor: [10, 10] }),
      title: place.name,
      zIndexOffset: -1000, // keep accommodation markers on top
    })
      .bindTooltip(place.name, { direction: 'top', offset: [0, -10] })
      .on('click', () => onClick(place));
    marker.addTo(layers[place.kind]);
    markers.set(place.id, marker);
  }

  // Opens a place's popup, turning its layer back on if it was hidden.
  function open(id) {
    const place = places.find(p => p.id === id);
    if (!place) return;
    if (!map.hasLayer(layers[place.kind])) layers[place.kind].addTo(map);
    popup.setLatLng(markers.get(id).getLatLng()).setContent(placePopupHtml(place)).openOn(map);
  }

  // Layer-control entries, labelled with the marker icon so they double as a legend.
  const overlays = Object.fromEntries(
    Object.entries(PLACE_TYPES).map(([kind, t]) => [`${placeIcon(kind)} ${t.label}`, layers[kind]]),
  );

  return { open, overlays };
}
