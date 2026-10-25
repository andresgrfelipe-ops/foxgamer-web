export const storageLabel = gb => gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`;

// The final capacity in a Mac name is its SSD, not its RAM.
export function storageFromName(name) {
  const matches = [...name.matchAll(/\b(\d+)\s+(GB|TB)\b/g)];
  if (!matches.length) return null;
  const match = matches.at(-1);
  return Number(match[1]) * (match[2] === 'TB' ? 1024 : 1);
}

export function replaceStorage(name, gb) {
  const matches = [...name.matchAll(/\b(\d+)\s+(GB|TB)\b/g)];
  const match = matches.at(-1);
  if (!match) return `${name} ${storageLabel(gb)}`;
  return name.slice(0, match.index) + storageLabel(gb) + name.slice(match.index + match[0].length);
}

export function storageStem(name) {
  const matches = [...name.matchAll(/\b(\d+)\s+(GB|TB)\b/g)];
  const match = matches.at(-1);
  return (match ? name.slice(0, match.index) + '{storage}' + name.slice(match.index + match[0].length) : name + ' {storage}').trim();
}

export function storageChoices(products, product) {
  if (!product.appleStorageGroup) return [];
  return products.filter(p => p.appleStorageGroup === product.appleStorageGroup
    && p.condition === product.condition && Number.isInteger(p.storageGB))
    .sort((a, b) => a.storageGB - b.storageGB);
}

export function validateAppleStorage(store) {
  const models = new Map((store.appleStorageModels || []).map(m => [m.id, m]));
  for (const p of store.products) {
    if (!p.appleModel) continue;
    const model = models.get(p.appleModel);
    if (!model || !/^https:\/\/(?:support|www)\.apple\.com\//.test(model.sourceUrl)) {
      throw new Error('Modelo Apple sin especificaciones oficiales: ' + p.slug);
    }
    if (p.storageGB == null) continue; // Original unspecified-capacity listings remain explicit.
    if (!model.capacitiesGB.includes(p.storageGB) || storageFromName(p.name) !== p.storageGB) {
      throw new Error('Capacidad incompatible con el modelo Apple: ' + p.slug);
    }
  }
}
