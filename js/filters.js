import { FILTERS } from './config.js';

// A selection maps each filter group id to a Set of chosen option labels.
// An empty Set means "All".
export const emptySelection = () => Object.fromEntries(FILTERS.map(g => [g.id, new Set()]));

export const hasSelection = selection => Object.values(selection).some(set => set.size > 0);

export function matches(space, selection) {
  return FILTERS.every(group => {
    const picked = selection[group.id];
    if (!picked?.size) return true;
    return group.options.some(o => picked.has(o.label) && o.test(space));
  });
}

export const applyFilters = (spaces, selection) => spaces.filter(s => matches(s, selection));

// For each option: how many spaces you'd see if you picked it, given the
// other groups' current selections. Shown as counts on the filter chips.
export function optionCounts(spaces, selection) {
  return Object.fromEntries(
    FILTERS.map(group => {
      const base = applyFilters(spaces, { ...selection, [group.id]: new Set() });
      return [group.id, Object.fromEntries(group.options.map(o => [o.label, base.filter(o.test).length]))];
    }),
  );
}
