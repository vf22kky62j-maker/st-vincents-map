// Wires data, filters, map and panels together. All UI is re-rendered from `state`.
import { loadData } from './data.js';
import { applyFilters, emptySelection, hasSelection, optionCounts } from './filters.js';
import { createMap } from './map.js';
import { renderFilters, renderResults } from './sidebar.js';
import { detailHtml } from './templates.js';

const $ = sel => document.querySelector(sel);

const state = {
  selection: emptySelection(),
  buildingId: null, // building whose card is open on the map
  detailId: null, // space shown in the detail panel
};

const { buildings, spaces } = await loadData();
const map = createMap($('#map'), buildings, { onSelect: selectBuilding });

function render() {
  const visible = applyFilters(spaces, state.selection);
  if (!visible.some(s => s.buildingId === state.buildingId)) state.buildingId = null;
  if (!visible.some(s => s.id === state.detailId)) state.detailId = null;

  renderFilters($('#filters'), state.selection, optionCounts(spaces, state.selection));
  $('#clear').hidden = !hasSelection(state.selection);
  renderResults($('#results'), visible, spaces.length, state.buildingId);
  renderDetail();
  map.update(visible, state.buildingId);
}

function renderDetail() {
  const space = spaces.find(s => s.id === state.detailId);
  const panel = $('#detail');
  const wasOpen = !panel.hidden;
  panel.hidden = !space;
  panel.innerHTML = space ? detailHtml(space) : '';
  document.body.classList.toggle('has-detail', !!space);
  if (wasOpen !== !!space) map.resize(); // map area changed width
}

function selectBuilding(buildingId, spaceId) {
  state.buildingId = buildingId;
  // If the detail panel is open, follow the selection so you can click through and compare.
  if (state.detailId && buildingId) {
    state.detailId = spaceId ?? applyFilters(spaces, state.selection).find(s => s.buildingId === buildingId)?.id;
  }
  render();
}

// --- Events ---------------------------------------------------------------

$('#filters').addEventListener('click', e => {
  const chip = e.target.closest('[data-group]');
  if (!chip) return;
  const set = state.selection[chip.dataset.group];
  const option = chip.dataset.option;
  if (!option) set.clear();
  else if (set.has(option)) set.delete(option);
  else set.add(option);
  render();
});

$('#clear').addEventListener('click', () => {
  state.selection = emptySelection();
  render();
});

$('#results').addEventListener('click', e => {
  const item = e.target.closest('[data-building]');
  if (item) selectBuilding(item.dataset.building, item.dataset.space);
});

document.addEventListener('click', e => {
  const open = e.target.closest('[data-detail]');
  if (open) {
    state.detailId = open.dataset.detail;
    render();
  }
  if (e.target.closest('[data-close]')) {
    state.detailId = null;
    render();
  }
});

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (state.detailId) state.detailId = null;
  else state.buildingId = null;
  render();
});

render();
