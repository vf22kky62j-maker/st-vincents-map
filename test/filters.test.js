// The three user journeys from the brief, plus a sanity check on the data files.
// Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FILTERS, STATUSES } from '../js/config.js';
import { buildings, spaces } from '../js/data.js';
import { applyFilters, emptySelection } from '../js/filters.js';

const filterBy = (group, ...options) =>
  applyFilters(spaces, { ...emptySelection(), [group]: new Set(options) }).map(s => s.buildingName);

test('Scenario 1: Laboratory shows ACMD and SVI', () => {
  assert.deepEqual(filterBy('type', 'Laboratory'), ['ACMD', 'SVI']);
});

test('Scenario 2: 500–1,000 sqm shows the medium-sized spaces', () => {
  assert.deepEqual(filterBy('size', '500–1,000 sqm'), ['Brenan Place', 'Building C – Healy Wing', 'SVI / Research Premises']);
});

test('Scenario 3: Potential shows Brenan Place, Healy Wing, Daly Wing and 9 Princes Street', () => {
  assert.deepEqual(filterBy('availability', 'Potential'), [
    'Brenan Place',
    'Building C – Healy Wing',
    'Building D – Daly Wing',
    'SVI / Research Premises',
  ]);
});

test('no filters shows all 8 spaces', () => {
  assert.equal(applyFilters(spaces, emptySelection()).length, 8);
});

test('data is consistent with config', () => {
  const arrangements = FILTERS.find(g => g.id === 'arrangement').options.map(o => o.label);
  for (const b of buildings) assert.ok(Number.isFinite(b.lat) && Number.isFinite(b.lng), `building ${b.id} needs lat/lng`);
  for (const s of spaces) {
    assert.ok(STATUSES.some(x => x.label === s.availability), `space ${s.id}: unknown availability "${s.availability}"`);
    assert.ok(arrangements.includes(s.arrangement), `space ${s.id}: unknown arrangement "${s.arrangement}"`);
  }
  assert.equal(new Set(spaces.map(s => s.id)).size, spaces.length, 'space ids must be unique');
});

test('distance label shows metres/km and a rough walking time', async () => {
  const { describeDistance } = await import('../js/geo.js');
  assert.equal(describeDistance(212.4), '212 m · ~3 min walk');
  assert.equal(describeDistance(20), '20 m · ~1 min walk');
  assert.equal(describeDistance(1530), '1.53 km · ~19 min walk');
});

test('car parks and transport stops are valid, and nearest() finds the closest', async () => {
  const { PLACE_TYPES } = await import('../js/config.js');
  const { places } = await import('../js/data.js');
  const { nearest } = await import('../js/geo.js');
  assert.equal(new Set(places.map(p => p.id)).size, places.length, 'place ids must be unique');
  for (const p of places) {
    assert.ok(PLACE_TYPES[p.kind], `place ${p.id}: unknown kind "${p.kind}"`);
    assert.ok(Number.isFinite(p.lat) && Number.isFinite(p.lng), `place ${p.id} needs lat/lng`);
  }
  const acmd = buildings.find(b => b.id === 'acmd');
  assert.equal(nearest(acmd, places.filter(p => p.kind === 'train')).place.name, 'Parliament Station');
  assert.equal(nearest(acmd, []), null);
});
