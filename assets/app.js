document.documentElement.classList.add('js');

// Disclosure navigation: ordinary links, Escape, outside click and focus exit.
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#nav-links');
if (menu && nav) {
  const closeMenu = (returnFocus = false) => {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    if (returnFocus) menu.focus();
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target) && !nav.contains(event.target)) closeMenu();
  });
  document.addEventListener('focusin', event => {
    if (!menu.contains(event.target) && !nav.contains(event.target)) closeMenu();
  });
  window.matchMedia('(min-width: 961px)').addEventListener('change', () => closeMenu());
}

const form = document.querySelector('.filters');
if (form && globalThis.FoxCatalog) {
  const model = globalThis.FoxCatalog;
  const search = document.querySelector('#search');
  const category = document.querySelector('#category');
  const condition = document.querySelector('#condition');
  const availability = document.querySelector('#availability');
  const sort = document.querySelector('#sort');
  const grid = document.querySelector('#product-grid');
  const empty = document.querySelector('#empty-state');
  const count = document.querySelector('#result-count');
  const summary = document.querySelector('#filter-summary');
  const more = document.querySelector('#load-more');
  const reset = document.querySelector('#reset-filters');
  const pageSize = 24;
  let limit = pageSize;
  let debounce;
  let lastSort = 'featured';
  const defaultCategory = category.value;
  const items = [...grid.querySelectorAll('[data-product]')].map((node, index) => ({
    node, index, title: node.dataset.title, search: model.normalize(node.dataset.name),
    category: node.dataset.category, condition: node.dataset.condition,
    availability: node.dataset.availability, price: node.dataset.price === '' ? null : Number(node.dataset.price)
  }));
  const orders = new Map([...sort.options].map(option => [option.value,
    [...items].sort((a, b) => model.compare(a, b, option.value))]));
  const state = () => ({q: search.value, category: category.value, condition: condition.value,
    availability: availability.value, sort: sort.value});
  const updateURL = () => {
    const query = model.params(state(), defaultCategory);
    history.replaceState(null, '', location.pathname + (query.size ? '?' + query : '') + location.hash);
  };
  function apply({append = false, syncURL = true} = {}) {
    clearTimeout(debounce);
    const filters = state();
    if (!append) limit = pageSize;
    const sorted = orders.get(filters.sort) || items;
    const matches = model.filter(sorted, filters);
    const visible = new Set(matches.slice(0, limit));
    const newlyVisible = matches.slice(Math.max(0, limit - pageSize), limit);
    for (const item of sorted) {
      item.node.hidden = !visible.has(item);
      if (lastSort !== filters.sort) grid.append(item.node);
    }
    lastSort = filters.sort;
    const total = matches.length;
    count.textContent = total === 0 ? '0 productos' : 'Mostrando ' + visible.size + ' de ' + total + (total === 1 ? ' producto' : ' productos');
    empty.hidden = total > 0;
    more.hidden = total <= limit;
    more.textContent = 'Cargar ' + Math.min(pageSize, Math.max(0, total - limit)) + ' productos más';
    const labels = [];
    if (filters.q.trim()) labels.push('Búsqueda: “' + filters.q.trim() + '”');
    for (const select of [category, condition, availability]) {
      if (select.value) labels.push([...select.options].find(option => option.value === select.value).textContent);
    }
    summary.textContent = labels.length ? labels.join(' · ') : 'Todo el catálogo';
    reset.disabled = !filters.q && filters.category === defaultCategory && !filters.condition
      && !filters.availability && filters.sort === 'featured';
    if (syncURL) updateURL();
    if (append) newlyVisible[0]?.node.querySelector('a')?.focus({preventScroll: true});
  }
  function restore() {
    const query = new URLSearchParams(location.search);
    search.value = (query.get('q') || '').slice(0, 100);
    for (const [el, key, fallback] of [[category, 'categoria', defaultCategory], [condition, 'condicion', ''],
      [availability, 'disponibilidad', ''], [sort, 'orden', 'featured']]) {
      const value = query.get(key) || fallback;
      el.value = [...el.options].some(option => option.value === value) ? value : fallback;
    }
    // A category document contains only that category; never pretend to filter another one.
    if (defaultCategory) category.value = defaultCategory;
    apply();
  }
  function clearFilters() {
    search.value = '';
    category.value = defaultCategory;
    condition.value = '';
    availability.value = '';
    sort.value = 'featured';
    apply();
    search.focus();
  }
  form.addEventListener('submit', event => {event.preventDefault(); apply();});
  search.addEventListener('input', () => {clearTimeout(debounce); debounce = setTimeout(() => apply(), 150);});
  for (const select of [category, condition, availability, sort]) select.addEventListener('change', () => {
    clearTimeout(debounce);
    if (select === category && defaultCategory && category.value !== defaultCategory) {
      const query = model.params({...state(), category: ''});
      location.href = (category.value ? '/categorias/' + category.value + '/' : '/')
        + (query.size ? '?' + query : '') + '#productos';
    } else apply();
  });
  reset.addEventListener('click', clearFilters);
  document.querySelector('#empty-reset').addEventListener('click', clearFilters);
  more.addEventListener('click', () => {limit += pageSize; apply({append: true, syncURL: false});});
  window.addEventListener('popstate', restore);
  restore();
}

// A failed photo remains neutral; never substitute another product's image.
document.querySelectorAll('.product-image img,.product-visual img').forEach(img => {
  const fallback = () => {
    const label = document.createElement('span');
    label.className = 'image-placeholder';
    label.textContent = 'Imagen próximamente';
    img.replaceWith(label);
  };
  img.addEventListener('error', fallback, {once: true});
  if (img.complete && img.naturalWidth === 0) fallback();
});
