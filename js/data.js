import buildingRows from '../data/buildings.json' with { type: 'json' };
import spaceRows from '../data/spaces.json' with { type: 'json' };
import parkingRows from '../data/parking.json' with { type: 'json' };
import transportRows from '../data/transport.json' with { type: 'json' };
import amenityRows from '../data/amenities.json' with { type: 'json' };

// Buildings and spaces are stored separately (one building → many spaces).
// Here each space gets a reference to its building, plus the building fields
// and display labels the UI needs, so the rest of the app can treat a space
// as one flat record.
export function joinData(buildings, spaces) {
  const byId = new Map(buildings.map(b => [b.id, b]));
  return {
    buildings,
    spaces: spaces.map(space => {
      const building = byId.get(space.buildingId);
      if (!building) throw new Error(`Space ${space.id} points to unknown building "${space.buildingId}"`);
      const [sizeMin, sizeMax = sizeMin] = [].concat(space.size); // 650 or [32, 44]
      return {
        ...space,
        building,
        buildingName: building.name,
        address: building.address,
        organisation: building.organisation,
        endOfTrip: building.endOfTrip,
        onSiteRetail: building.onSiteRetail,
        facilitiesSource: building.facilitiesSource,
        sizeMin,
        sizeMax,
        sizeLabel: sizeMin === sizeMax ? `${sqm(sizeMin)} sqm` : `${sqm(sizeMin)}–${sqm(sizeMax)} sqm`,
        typeLabel: space.type.join(' / '),
      };
    }),
  };
}

const sqm = n => n.toLocaleString('en-AU');

export const { buildings, spaces } = joinData(buildingRows, spaceRows);

// Car parks, transport stops, bike parking and shops/food, as one list. `kind`
// is a key of PLACE_TYPES in config.js.
export const places = [
  ...parkingRows.map(p => ({ ...p, kind: 'parking' })),
  ...transportRows.map(t => ({ ...t, kind: t.mode })),
  ...amenityRows, // already have kind: 'bike' or 'retail'
];
