// HTML snippets for the property card (map popup), the detail panel, and the
// car park / transport stop popups.
import { DETAIL_FIELDS, PLACE_TYPES, statusColor } from './config.js';
import { describeDistance } from './geo.js';

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

// `access` is a list of { label, place, metres } (see accessFor in app.js).
export function detailHtml(s, access = []) {
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
    </dl>
    ${access.length ? `
      <h3 class="detail-subhead">Getting here</h3>
      <dl class="detail-fields">
        ${access.map(({ label, place, metres }) => `
          <div>
            <dt>${esc(label)}</dt>
            <dd>
              <button type="button" class="link" data-place="${esc(place.id)}">${esc(place.name)}</button>
              <span class="muted">${place.routes ? `${routesLabel(place)} · ` : ''}${esc(describeDistance(metres))}</span>
            </dd>
          </div>`).join('')}
      </dl>` : ''}`;
}

// --- Car parks and transport stops ------------------------------------------

export const placeIcon = kind =>
  `<span class="poi" style="--c:${PLACE_TYPES[kind].color}">${esc(PLACE_TYPES[kind].glyph)}</span>`;

const routesLabel = p => (p.kind === 'train' ? p.routes.join(', ') : `Routes ${p.routes.join(', ')}`);

const field = (label, value) => (value ? `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>` : '');

export function placePopupHtml(p) {
  const type = PLACE_TYPES[p.kind];
  const source = p.sourceUrl
    ? `<a href="${esc(p.sourceUrl)}" target="_blank" rel="noopener">${esc(p.source)}</a>`
    : esc(p.source);
  const body = p.kind === 'parking'
    ? `
      <dl class="place-facts">
        ${field('Operator', p.operator)}
        ${field('Access', p.access)}
        ${field('Type', p.type)}
        ${field('Spaces', p.spaces)}
        ${field('Hours', p.hours)}
        ${field('Entrance', p.entrance)}
      </dl>
      <p class="card-type">Rates</p>
      <ul class="rates">${p.rates.map(r => `<li>${esc(r)}</li>`).join('')}</ul>
      ${p.notes ? `<p class="card-note">${esc(p.notes)}</p>` : ''}`
    : `
      <p class="card-type">${p.kind === 'train' ? 'Lines' : 'Routes'}</p>
      <p class="routes">${p.routes.map(r => `<span class="route">${esc(r)}</span>`).join('')}</p>`;
  return `
    <article class="card">
      <p class="eyebrow">${placeIcon(p.kind)} ${esc(type.label.replace(/s$/, ''))}</p>
      <h3>${esc(p.name)}</h3>
      ${p.address ? `<p class="muted">${esc(p.address)}</p>` : ''}
      <section class="card-space">${body}</section>
      <p class="card-org">Source: ${source} · ${esc(p.evidenceDate)}</p>
    </article>`;
}
