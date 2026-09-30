// HTML snippets for the property card (map popup) and the detail panel.
import { DETAIL_FIELDS, statusColor } from './config.js';

export const esc = value =>
  String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const statusPill = status =>
  `<span class="pill" style="--c:${statusColor(status)}">${esc(status)}</span>`;

export const pin = (label, status, extraClass = '') =>
  `<span class="pin ${extraClass}" style="--c:${statusColor(status)}">${esc(label)}</span>`;

// Card shown when a marker is clicked. `spaces` all sit in the same building
// (one today, but a building can hold several, e.g. individual suites).
export function cardHtml(spaces) {
  const b = spaces[0].building;
  return `
    <article class="card">
      <h3>${esc(b.name)}</h3>
      <p class="muted">${esc(b.address)}</p>
      <p class="card-org">Organisation: ${esc(b.organisation)}</p>
      ${spaces.map(spaceSummary).join('')}
    </article>`;
}

const spaceSummary = s => `
  <section class="card-space">
    <p class="card-type">${esc(s.typeLabel)}${s.name ? ` · ${esc(s.name)}` : ''}</p>
    <dl class="facts">
      <div><dt>Size</dt><dd>${esc(s.sizeLabel)}</dd></div>
      <div><dt>Status</dt><dd>${statusPill(s.availability)}</dd></div>
      <div><dt>Commercial</dt><dd>${esc(s.commercialTerms)}</dd></div>
      <div><dt>Source</dt><dd>${esc(s.source)}</dd></div>
    </dl>
    <button type="button" class="link" data-detail="${esc(s.id)}">View details →</button>
  </section>`;

export function detailHtml(s) {
  return `
    <header class="detail-head">
      <button type="button" class="close" data-close aria-label="Close details">×</button>
      <p class="eyebrow">Space ${esc(s.id)}${s.name ? ` · ${esc(s.name)}` : ''}</p>
      <h2>${esc(s.buildingName)}</h2>
      <p class="muted">${esc(s.address)}</p>
      ${statusPill(s.availability)}
    </header>
    <dl class="detail-fields">
      ${DETAIL_FIELDS.map(([label, key]) => `<div><dt>${esc(label)}</dt><dd>${esc(s[key]) || '—'}</dd></div>`).join('')}
    </dl>`;
}
