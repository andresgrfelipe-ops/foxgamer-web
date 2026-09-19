import {escapeHTML as e, priceLabel, whatsappURL, CONDITIONS} from './catalog.mjs';
import {gameDirectory} from './games-directory.mjs';

export const jsonLD = data => '<script type="application/ld+json">' + JSON.stringify(data).replace(/</g, '\\u003c') + '</script>';
const icon = name => '<svg aria-hidden="true"><use href="/assets/icons.svg#' + name + '"></use></svg>';
const availability = {available: 'Disponible', inquiry: 'Consultar disponibilidad', soldout: 'Agotado'};
const badge = condition => '<span class="badge" data-condition="' + e(condition) + '">' + e(condition) + '</span>';
const placeholder = '<span class="image-placeholder"><span aria-hidden="true">—</span><strong>Imagen próximamente</strong><small>Consulta la fotografía de esta referencia</small></span>';

export function createStorefront(store) {
  const officialImage = p => store.verifiedImages?.some(v => v.name === p.name && v.image === p.image && v.kind === 'manufacturer');
  const referenceImage = p => store.verifiedImages?.some(v => v.name === p.name && v.image === p.image && v.kind === 'reference-photo');
  const imageClass = p => officialImage(p) || referenceImage(p) ? ' manufacturer-image' : '';
  const productURL = p => store.url + '/productos/' + p.slug + '/';
  const message = p => 'Hola FOX GAMER, quiero consultar ' + p.name + ' (' + p.condition + '). ' + productURL(p)
    + ' Quiero confirmar disponibilidad, precio final, accesorios y envío.';
  const productContact = (p, label = 'Consultar por WhatsApp', cls = 'button') => {
    if (p.availability === 'soldout') return '';
    const url = whatsappURL(store.whatsapp, message(p));
    return url ? '<a class="' + cls + '" href="' + e(url) + '" target="_blank" rel="noopener noreferrer" aria-label="'
      + e(label + ': ' + p.name + ', ' + p.condition + ' (abre otra pestaña)') + '">' + icon('chat') + e(label) + '</a>'
      : '<a class="' + cls + '" href="/#contacto">Consultar contacto</a>';
  };
  function card(p) {
    return `<article class="product-card" data-product data-title="${e(p.name)}" data-name="${e([p.name,p.brand,p.category].join(' '))}" data-category="${p.category}" data-condition="${e(p.condition)}" data-availability="${p.availability}" data-price="${p.price ?? ''}">
      <a href="/productos/${p.slug}/"><div class="product-image${imageClass(p)}">${p.image ? `<img src="${e(p.image)}" alt="${e(p.name)}" width="640" height="480" loading="lazy" decoding="async">` : placeholder}${badge(p.condition)}</div>
      ${officialImage(p) ? '<span class="reference-caption">Imagen de referencia · Apple</span>' : referenceImage(p) ? '<span class="reference-caption">'+(p.classicGame?'Portada de referencia':'Fotografía de referencia del modelo')+'</span>' : ''}
      <div class="product-info"><span class="eyebrow">${e(p.brand || p.category)}</span><h3>${e(p.name)}</h3><p class="availability" data-availability="${p.availability}">${availability[p.availability]}</p><strong class="card-price">${priceLabel(p)}</strong><span class="detail-link">Ver detalles ${icon('arrow')}</span></div></a>
      ${productContact(p, 'Consultar', 'button secondary card-contact')}</article>`;
  }
  function catalog(category) {
    if(category === 'videojuegos') return gameDirectory(store);
    const conditionOrder = {Nuevo: 0, Exhibición: 1, Usado: 2};
    const featuredOrder = {'PlayStation 4 Pro 1 Tera': 0,'PlayStation 4 Fat 500GB': 1,'PlayStation 5 Slim 1 Tera': 2,'PlayStation 5 Fat 825GB': 3,'Xbox Series S 512 GB': 4,'Xbox Series S 1 TB': 5,'Xbox Series X Disco 1 Tera': 6};
    const products = store.products.filter(p => !category || p.category === category).sort((a,b) =>
      (category === 'accesorios' ? Number(!a.image)-Number(!b.image) : 0) || (featuredOrder[a.name] ?? 100) - (featuredOrder[b.name] ?? 100) || a.name.localeCompare(b.name, 'es') || conditionOrder[a.condition] - conditionOrder[b.condition]);
    const categoryName = store.categories.find(c => c.slug === category)?.name;
    return `${category === 'videojuegos' ? gameDirectory(store) : ''}<section class="section wrap" id="productos" aria-labelledby="catalog-title">
      <div class="section-top"><div><p class="eyebrow">ELIGE TU PRÓXIMO EQUIPO</p><h2 id="catalog-title">${category ? 'Catálogo de ' + e(categoryName) : 'Encuentra lo que buscas'}</h2></div><span class="catalog-note">Precios en COP<br>Confirma cada unidad antes de comprar</span></div>
      ${category === 'accesorios' ? '<div class="accessory-guide"><h3>Elige para tu consola.</h3><p>Comprueba la plataforma del accesorio y del juego. En volantes, confirma también pedales, palanca y montaje.</p><nav class="category-tabs" aria-label="Explorar accesorios"><a href="?q=DualSense#productos">Controles PS5</a><a href="?q=G29#productos">G29 · PlayStation / PC</a><a href="?q=G920#productos">G920 · Xbox / PC</a><a href="?q=VR2#productos">PlayStation VR2</a><a href="?q=Quest#productos">Meta Quest</a><a href="?q=Portal#productos">PlayStation Portal</a><a href="?q=PULSE#productos">Audio PULSE Elite</a></nav></div>' : ''}<form class="filters" role="search" aria-label="Filtrar catálogo" action="#productos">
        <label class="search-label">Buscar por modelo o referencia<span>${icon('search')}<input id="search" name="q" type="search" placeholder="${category === 'accesorios' ? 'Prueba G29, DualSense o VR2…' : 'Prueba PS5, iPhone o Nintendo…'}" maxlength="100" autocomplete="off" enterkeyhint="search" aria-controls="product-grid"></span></label>
        <label>Categoría<select id="category" name="categoria"><option value="">Todas las categorías</option>${store.categories.map(c => `<option value="${c.slug}"${category === c.slug ? ' selected' : ''}>${e(c.name)}</option>`).join('')}</select></label>
        <label>Condición<select id="condition" name="condicion"><option value="">Todas las condiciones</option>${CONDITIONS.map(c => '<option>' + c + '</option>').join('')}</select></label>
        <label>Disponibilidad<select id="availability" name="disponibilidad"><option value="">Todos los estados</option><option value="available">Disponible</option><option value="inquiry">Por confirmar</option><option value="soldout">Agotado</option></select></label>
        <label>Ordenar<select id="sort" name="orden"><option value="featured">Destacados</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option><option value="name">Nombre A–Z</option></select></label>
        <button class="button filter-submit" type="submit">Buscar ${icon('arrow')}</button>
      </form>
      <div class="catalog-toolbar"><div><p id="result-count" role="status" aria-live="polite" aria-atomic="true">${products.length} productos</p><p class="small" id="filter-summary">${e(categoryName || 'Todo el catálogo')}</p></div><button class="text-button js-only" id="reset-filters" type="button">Limpiar filtros</button></div>
      <div class="product-grid" id="product-grid">${products.map(card).join('')}</div>
      <div class="empty-state" id="empty-state"${products.length ? ' hidden' : ''}>${icon('search')}<h3>No encontramos productos con esos filtros</h3><p>Prueba el nombre del modelo, quita un filtro o consulta la referencia con nosotros.</p><div class="empty-actions"><button class="button secondary js-only" id="empty-reset" type="button">Ver todos los productos</button><a class="text-link" href="/#contacto">Consultar una referencia ${icon('arrow')}</a></div></div>
      <div class="load-more-wrap"><button class="button secondary" id="load-more" type="button" aria-controls="product-grid" hidden>Cargar más productos</button></div>
      <noscript><p class="small">Estás viendo todos los productos. Los filtros requieren JavaScript; también puedes navegar por las categorías y consultar cada ficha.</p></noscript>
    </section>`;
  }
  function breadcrumbsSchema(p) {
    const c = store.categories.find(c => c.slug === p.category);
    const entries = [{name: 'Inicio', item: store.url + '/'}, {name: c.name, item: store.url + '/categorias/' + c.slug + '/'}];
    if (p.slug) entries.push({name: p.name + ' · ' + p.condition, item: productURL(p)});
    return jsonLD({'@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: entries.map((entry, i) => ({'@type': 'ListItem', position: i + 1, ...entry}))});
  }
  function productDetail(p) {
    const c = store.categories.find(c => c.slug === p.category);
    const variants = store.products.filter(v => v.name === p.name && v.category === p.category && v.brand === p.brand);
    const variantNav = variants.length > 1 ? `<nav class="variant-picker" aria-label="Condición de ${e(p.name)}"><p>Elige la condición</p><div>${variants.sort((a,b) => CONDITIONS.indexOf(a.condition) - CONDITIONS.indexOf(b.condition)).map(v => `<a href="/productos/${v.slug}/"${p.slug === v.slug ? ' aria-current="page"' : ''}><span>${e(v.condition)}</span><small>${priceLabel(v)}</small><small>${availability[v.availability]}</small></a>`).join('')}</div></nav>` : '';
    const schema = {'@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description,
      sku: p.slug, url: productURL(p), brand: p.brand ? {'@type': 'Brand', name: p.brand} : undefined,
      image: p.image ? new URL(p.image, store.url).href : undefined};
    if (p.price != null) schema.offers = {'@type': 'Offer', price: p.price, priceCurrency: 'COP', url: productURL(p),
      availability: p.availability === 'inquiry' ? undefined : 'https://schema.org/' + (p.availability === 'available' ? 'InStock' : 'OutOfStock'),
      itemCondition: 'https://schema.org/' + (p.condition === 'Nuevo' ? 'NewCondition' : 'UsedCondition')};
    const body = `<section class="wrap section product-section"><nav class="breadcrumbs" aria-label="Ruta de navegación"><a href="/">Inicio</a><span aria-hidden="true">/</span><a href="/categorias/${c.slug}/">${e(c.name)}</a><span aria-hidden="true">/</span><span aria-current="page">${e(p.name)} · ${e(p.condition)}</span></nav>
      <div class="product-detail"><div class="product-media"><div class="product-visual${imageClass(p)}">${p.image ? `<img src="${e(p.image)}" alt="${e(p.name)}" width="800" height="600" fetchpriority="high" decoding="async">` : placeholder}</div><p class="small photo-disclaimer">${p.classicGame ? 'Portada de referencia del juego. Solicita fotografías reales de la unidad y confirma región, idioma, edición, discos y estado antes de comprar.' : officialImage(p) ? 'Imagen de referencia del fabricante. Confirma color, accesorios y fotografías del estado de la unidad que vas a comprar.' : referenceImage(p) ? 'Fotografía de referencia del modelo. Confirma fotografías reales, accesorios y estado de la unidad antes de comprar.' : p.image ? 'Fotografía del modelo. Confirma las fotos, accesorios y estado de la unidad que vas a comprar.' : 'Esta referencia aún no tiene una fotografía verificada. Solicítala antes de comprar.'}</p></div>
      <div class="product-summary">${badge(p.condition)}<p class="eyebrow">${e(p.brand || c.name)}</p><h1>${e(p.name)}</h1><p class="product-description">${e(p.description)}</p>
      ${variantNav}<div class="purchase-panel"><p class="product-price">${priceLabel(p)}</p><p class="availability" data-availability="${p.availability}">${availability[p.availability]}</p>${p.availability === 'soldout' ? '<p>Esta unidad no está disponible para compra.</p>' : productContact(p, 'Consultar este producto')}
      <p class="small">Confirma el precio final, la garantía y el costo de envío antes de pagar. La consulta se abre en WhatsApp; no realiza un pago.</p></div>
      <dl class="product-facts">${p.compatibility ? '<div><dt>Compatibilidad</dt><dd>'+e(p.compatibility)+'</dd></div>' : ''}<div><dt>Estado de la unidad</dt><dd>${e(p.conditionNotes)}</dd></div><div><dt>Incluye</dt><dd>${e(p.includes)}</dd></div><div><dt>Garantía</dt><dd>${e(p.warranty)}</dd></div></dl>
      <a class="text-link" href="/categorias/${c.slug}/#productos">Seguir explorando ${e(c.name)} ${icon('arrow')}</a><br><a class="text-link" href="/#pagos">Opciones de pago y envío ${icon('arrow')}</a></div></div></section>
      ${p.availability !== 'soldout' ? `<aside class="mobile-product-contact" aria-label="Consulta de ${e(p.name)}"><span>${e(p.condition)}<strong>${priceLabel(p)}</strong></span>${productContact(p, 'Consultar', 'button')}</aside>` : ''}`;
    return {body, extra: jsonLD(schema) + breadcrumbsSchema(p)};
  }
  return {catalog, productDetail, breadcrumbsSchema};
}
