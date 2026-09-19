/* Shared, dependency-free catalogue rules used by the browser and Node tests. */
globalThis.FoxCatalog = (() => {
  const normalize = value => String(value ?? '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
    .replace(/\bps\s*([45])\b/g, 'playstation $1')
    .replace(/[^a-z0-9]+/g, ' ').trim();
  const collator = new Intl.Collator('es', {numeric: true, sensitivity: 'base'});
  function compare(a, b, order) {
    if (order === 'name') return collator.compare(a.title, b.title) || a.index - b.index;
    if (order === 'price-asc' || order === 'price-desc') {
      if (a.price === null && b.price === null) return a.index - b.index;
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return (a.price - b.price) * (order === 'price-desc' ? -1 : 1) || a.index - b.index;
    }
    return a.index - b.index;
  }
  function filter(items, state) {
    const terms = normalize(state.q).split(' ').filter(Boolean);
    return items.filter(item => terms.every(term => item.search.includes(term))
      && (!state.category || item.category === state.category)
      && (!state.condition || item.condition === state.condition)
      && (!state.availability || item.availability === state.availability));
  }
  function params(state, defaultCategory = '') {
    const query = new URLSearchParams();
    if (state.q.trim()) query.set('q', state.q.trim());
    if (state.category && state.category !== defaultCategory) query.set('categoria', state.category);
    if (state.condition) query.set('condicion', state.condition);
    if (state.availability) query.set('disponibilidad', state.availability);
    if (state.sort !== 'featured') query.set('orden', state.sort);
    return query;
  }
  return Object.freeze({normalize, compare, filter, params});
})();
