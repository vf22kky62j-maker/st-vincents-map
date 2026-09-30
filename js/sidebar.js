// Filter chips and the results list in the side panel.
import { FILTERS } from './config.js';
import { esc, pin, statusPill } from './templates.js';

export function renderFilters(el, selection, counts) {
  const focused = document.activeElement?.closest?.('[data-group]')?.dataset;
  el.innerHTML = FILTERS.map(group => {
    const picked = selection[group.id];
    return `
      <fieldset class="filter">
        <legend>${esc(group.label)}</legend>
        <div class="chips">
          ${chip(group.id, '', 'All', picked.size === 0)}
          ${group.options.map(o => chip(group.id, o.label, o.label, picked.has(o.label), counts[group.id][o.label], o.color)).join('')}
        </div>
      </fieldset>`;
  }).join('');
  // Keep keyboard focus on the chip that was just toggled.
  if (focused) el.querySelector(`[data-group="${focused.group}"][data-option="${CSS.escape(focused.option)}"]`)?.focus();
}

const chip = (group, option, label, on, count, color) => `
  <button type="button" class="chip${on ? ' is-on' : ''}${count === 0 ? ' is-empty' : ''}"
          data-group="${group}" data-option="${esc(option)}" aria-pressed="${on}">
    ${color ? `<i class="dot" style="--c:${color}"></i>` : ''}${esc(label)}${count === undefined ? '' : ` <span class="count">${count}</span>`}
  </button>`;

export function renderResults(el, visible, total, selectedBuildingId) {
  el.innerHTML = `
    <p class="results-count"><strong>${visible.length}</strong> of ${total} spaces</p>
    ${visible.length ? '' : '<p class="muted">No spaces match these filters.</p>'}
    <ol class="results">
      ${visible.map(s => `
        <li>
          <button type="button" class="result${s.buildingId === selectedBuildingId ? ' is-selected' : ''}" data-building="${esc(s.buildingId)}" data-space="${esc(s.id)}">
            ${pin(s.id, s.availability, 'pin-sm')}
            <span class="result-body">
              <span class="result-name">${esc(s.buildingName)}</span>
              <span class="result-meta">${esc(s.typeLabel)} · ${esc(s.sizeLabel)}</span>
              <span class="result-meta">${statusPill(s.availability)} ${esc(s.commercialTerms)}</span>
            </span>
          </button>
        </li>`).join('')}
    </ol>`;
}
