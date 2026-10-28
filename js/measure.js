// "Measure distance" map tool: switch it on, click two markers, and it draws
// a line between them with the straight-line distance and a rough walking time.
import { describeDistance } from './geo.js';
import { esc } from './templates.js';

export function createMeasureTool(map, { onStart }) {
  const layer = L.layerGroup().addTo(map);
  let active = false;
  let picks = []; // buildings clicked so far: [] → [a] → [a, b]

  const control = L.control({ position: 'topleft' });
  control.onAdd = () => {
    const el = L.DomUtil.create('div', 'measure-control leaflet-bar');
    el.innerHTML = `
      <button type="button" class="measure-btn" aria-pressed="false">Measure distance</button>
      <p class="measure-hint" aria-live="polite" hidden></p>`;
    L.DomEvent.disableClickPropagation(el);
    el.querySelector('button').addEventListener('click', () => setActive(!active));
    return el;
  };
  control.addTo(map);
  const el = control.getContainer();

  function setActive(on) {
    active = on;
    picks = [];
    layer.clearLayers();
    el.classList.toggle('is-on', on);
    el.querySelector('button').setAttribute('aria-pressed', on);
    el.querySelector('button').textContent = on ? 'Done measuring' : 'Measure distance';
    map.getContainer().classList.toggle('is-measuring', on);
    hint(on ? 'Click a building, car park or stop to measure from.' : '');
    if (on) onStart();
  }

  // Called by map.js when a marker (building, car park or stop) is clicked while measuring.
  function pick(building) {
    if (picks.length === 2 || picks[0]?.id === building.id) {
      picks = [];
      layer.clearLayers();
    }
    picks.push(building);
    L.circleMarker([building.lat, building.lng], { radius: 20, className: 'measure-ring', interactive: false }).addTo(layer);
    if (picks.length === 1) return hint(`From <strong>${esc(building.name)}</strong>. Now click a second point.`);

    const [a, b] = picks.map(p => L.latLng(p.lat, p.lng));
    const text = describeDistance(map.distance(a, b));
    L.polyline([a, b], { className: 'measure-line', interactive: false })
      .bindTooltip(text, { permanent: true, direction: 'center', className: 'measure-label' })
      .addTo(layer);
    hint(`<strong>${esc(picks[0].name)}</strong> → <strong>${esc(building.name)}</strong><br>${text} (straight line)<br><span class="muted">Click another point to measure again.</span>`);
  }

  function hint(html) {
    const p = el.querySelector('.measure-hint');
    p.hidden = !html;
    p.innerHTML = html;
  }

  return { pick, setActive, isActive: () => active };
}
