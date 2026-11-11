// Use only RAM explicitly recorded for a MacBook. The SSD is not RAM and
// a model's minimum supported memory does not identify the unit being sold.
export function memoryGB(product) {
  if (product.category !== 'apple' || !/^MacBook\b/i.test(product.name)) return null;
  if (Number.isSafeInteger(product.ramGB) && product.ramGB > 0) return product.ramGB;
  const match = product.name.match(/\b(\d+)\s*GB\s+RAM\b/i);
  return match ? Number(match[1]) : null;
}

export function memoryChoices(products, product) {
  if (!product.appleModel || !memoryGB(product) || !Number.isInteger(product.storageGB)) return [];
  const choices = products.filter(candidate => candidate.appleModel === product.appleModel
    && candidate.category === product.category && candidate.brand === product.brand
    && candidate.condition === product.condition && candidate.storageGB === product.storageGB
    && memoryGB(candidate) && Number.isSafeInteger(candidate.price) && candidate.price > 0);
  return [...new Map(choices.map(candidate => [memoryGB(candidate), candidate])).values()]
    .sort((a, b) => memoryGB(a) - memoryGB(b));
}

export function validateMacbookMemory(store) {
  const models = new Map((store.appleMemoryModels || []).map(m=>[m.id,m]));
  for (const p of store.products) {
    if (!p.appleModel?.startsWith('macbook') || !models.size) continue;
    const model = models.get(p.appleModel);
    const ram = memoryGB(p);
    if (!model || !/^https:\/\/(?:support|www)\.apple\.com\//.test(model.sourceUrl)
      || !model.ramGB.includes(ram)) throw new Error('RAM incompatible con el modelo Apple: '+p.slug);
    const named = p.name.match(/\b(\d+) GB RAM\b/);
    if (named && Number(named[1])!==ram) throw new Error('RAM no coincide con el nombre: '+p.slug);
    if (p.appleModel==='macbook-air-m1-2020' && p.storageGB===128 && ram!==8) throw new Error('Configuración educativa sin verificar: '+p.slug);
  }
}
