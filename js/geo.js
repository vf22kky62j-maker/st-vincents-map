// Distance helpers (no map library needed, so they're easy to test).

const EARTH_RADIUS_M = 6371000;
const WALK_METRES_PER_MIN = 80; // ~4.8 km/h

// Straight-line ("as the crow flies") distance between two {lat, lng} points.
export function distanceMetres(a, b) {
  const rad = d => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function describeDistance(metres) {
  const distance = metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(2)} km`;
  const minutes = Math.max(1, Math.round(metres / WALK_METRES_PER_MIN));
  return `${distance} · ~${minutes} min walk`;
}

// The closest of `places` to `from`, as { place, metres }, or null if none.
export function nearest(from, places) {
  let best = null;
  for (const place of places) {
    const metres = distanceMetres(from, place);
    if (!best || metres < best.metres) best = { place, metres };
  }
  return best;
}
