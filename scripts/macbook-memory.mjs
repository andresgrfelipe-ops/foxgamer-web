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
