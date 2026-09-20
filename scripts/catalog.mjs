export const CONDITIONS = ['Nuevo', 'Usado', 'Exhibición'];
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Storage and refurbishment labels do not change an iPhone's exterior model.
// Only official, explicitly matched iPhone references may share a model image.
export function imageIdentity(proof) {
  const watchModels = {'Apple Watch Series 11':'Apple Watch Series 11 (GPS)', 'Apple Watch Series 11 GPS Cellular 46 mm':'Apple Watch Series 11 (GPS + Cellular) Aluminium'};
  if (proof.kind === 'manufacturer' && watchModels[proof.name]) {
    if (proof.sourceModel !== watchModels[proof.name]) throw new Error('Modelo oficial no coincide: ' + proof.name);
    return 'Apple Watch Series 11 Aluminium';
  }
  if (proof.kind === 'manufacturer' && /^iPad Air 13 pulgadas M3 256 GB(?: Cellular)?$/.test(proof.name)) {
    if (proof.sourceModel !== 'iPad Air 13-inch (M3)') throw new Error('Modelo oficial no coincide: ' + proof.name);
    return proof.sourceModel;
  }
  if (proof.kind === 'manufacturer' && /^iPhone /.test(proof.name)) {
    const model = proof.name.replace(/ \d+ (?:GB|TB)(?: CPO| Exhibición Premium)?$/, '');
    if (proof.sourceModel !== model) throw new Error('Modelo oficial no coincide: ' + proof.name);
    return model;
  }
  return proof.name;
}
export function validateStore(store) {
  if (store.url !== 'https://foxgamer.co') throw new Error('El dominio canónico debe conservarse.');
  if (store.whatsapp && !/^[1-9]\d{7,14}$/.test(store.whatsapp)) throw new Error('WhatsApp debe usar formato internacional, solo dígitos.');
  const imageNames = new Map();
  for (const v of store.verifiedImages || []) {
    if (!v.name || !v.evidence?.trim() || !/^[a-f0-9]{64}$/.test(v.sha256 || '')) throw new Error('Registro de imagen incompleto: ' + v.name);
    if (!/^\/assets\/[a-zA-Z0-9/_-]+\.(webp|png|jpg|jpeg)$/.test(v.image)) throw new Error('La fotografía verificada debe ser local y raster.');
    if (v.kind === 'manufacturer') {
      const officialSources = {
        Apple: {
          page: /^https:\/\/(?:support|www)\.apple\.com\//,
          image: /^https:\/\/(?:cdsassets|www)\.apple\.com\//
        },
        Playseat: {
          page: /^https:\/\/www\.playseat\.com\//,
          image: /^https:\/\/www\.playseat\.com\/cdn\/shop\//
        },
        Logitech: {
          page: /^https:\/\/www\.logitechg\.com\//,
          image: /^https:\/\/resource\.logitechg\.com\//
        },
        PlayStation: {
          page: /^https:\/\/www\.playstation\.com\//,
          image: /^https:\/\/gmedia\.playstation\.com\//
        }
      };
      const source = officialSources[v.manufacturer || 'Apple'];
      if (!v.sourceModel || !source || !source.page.test(v.sourceUrl || '') || !source.image.test(v.sourceImageUrl || '')) {
        throw new Error('Fuente oficial incompleta: ' + v.name);
      }
    }
    const identity = imageIdentity(v);
    if (imageNames.has(v.image) && imageNames.get(v.image) !== identity) throw new Error('Foto duplicada entre modelos: ' + v.name);
    imageNames.set(v.image, identity);
  }
  const slugs = new Set();
  for (const p of store.products) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || slugs.has(p.slug)) throw new Error('Slug de producto inválido o duplicado');
    slugs.add(p.slug);
    if (!p.name || !p.description || !CONDITIONS.includes(p.condition)) throw new Error('Nombre, descripción y condición son obligatorios');
    if (!store.categories.some(c => c.slug === p.category)) throw new Error('Categoría desconocida');
    if (p.price != null && (!Number.isSafeInteger(p.price) || p.price <= 0)) throw new Error('El precio COP debe ser un entero positivo o null');
    if (!['available','inquiry','soldout'].includes(p.availability)) throw new Error('Disponibilidad inválida');
    if (p.image && !(store.verifiedImages || []).some(v => v.name === p.name && v.image === p.image && v.evidence)) throw new Error('Fotografía sin verificación exacta: ' + p.slug);
    if (p.image && !/^\/assets\/[a-zA-Z0-9/_-]+\.(webp|png|jpg|jpeg)$/.test(p.image)) throw new Error('Usa fotografías locales verificadas en WebP, PNG o JPEG.');
    if (!p.conditionNotes || !p.warranty || !p.includes) throw new Error('Indica estado, garantía e incluidos de cada unidad');
  }
  return store;
}
export function whatsappURL(number, message) {
  return number ? 'https://wa.me/' + number + '?text=' + encodeURIComponent(message) : null;
}
export const priceLabel = p => p.price == null ? 'Precio por confirmar' : new Intl.NumberFormat('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0}).format(p.price) + ' COP';
