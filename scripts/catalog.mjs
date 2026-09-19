export const CONDITIONS = ['Nuevo', 'Usado', 'Exhibición'];
export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function validateStore(store) {
  if (store.url !== 'https://foxgamer.co') throw new Error('El dominio canónico debe conservarse.');
  if (store.whatsapp && !/^[1-9]\d{7,14}$/.test(store.whatsapp)) throw new Error('WhatsApp debe usar formato internacional, solo dígitos.');
  const slugs = new Set();
  for (const p of store.products) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || slugs.has(p.slug)) throw new Error('Slug de producto inválido o duplicado');
    slugs.add(p.slug);
    if (!p.name || !p.description || !CONDITIONS.includes(p.condition)) throw new Error('Nombre, descripción y condición son obligatorios');
    if (!store.categories.some(c => c.slug === p.category)) throw new Error('Categoría desconocida');
    if (p.price != null && (!Number.isSafeInteger(p.price) || p.price <= 0)) throw new Error('El precio COP debe ser un entero positivo o null');
    if (!['available','inquiry','soldout'].includes(p.availability)) throw new Error('Disponibilidad inválida');
    if (p.image && !(store.verifiedImages || []).some(v => v.name === p.name && v.image === p.image && v.evidence)) throw new Error('Fotografía sin verificación exacta: ' + p.slug);
    if (p.image && !(/^\/assets\/[a-zA-Z0-9/_-]+\.(webp|png|jpg|jpeg|svg)$/.test(p.image) || /^https:\/\/(cdn\.dam\.alkosto\.com|mac-center\.com|co\.tiendasishop\.com)\//.test(p.image))) throw new Error('Usa imágenes locales o CDN oficial verificado.');
    if (!p.conditionNotes || !p.warranty || !p.includes) throw new Error('Indica estado, garantía e incluidos de cada unidad');
  }
  return store;
}
export function whatsappURL(number, message) {
  return number ? 'https://wa.me/' + number + '?text=' + encodeURIComponent(message) : null;
}
export const priceLabel = p => p.price == null ? 'Precio por confirmar' : new Intl.NumberFormat('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0}).format(p.price) + ' COP';
