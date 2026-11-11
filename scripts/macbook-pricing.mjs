export const roundCOP = value => Math.max(1000, Math.floor(value / 1000) * 1000);

// An observed competitor offer and an interpolated commercial quote are different
// evidence types. Never substitute another condition, screen size or chip.
export function memoryPriceGrid(model, capacities, offers, policy, condition) {
  const exact = new Map();
  for (const offer of offers.filter(o => o.modelId === model.id && o.condition === condition)) {
    const key = `${offer.ramGB}/${offer.storageGB}`;
    if (!exact.has(key) || exact.get(key).priceCOP > offer.priceCOP) exact.set(key, offer);
  }
  const baselines = model.catalogueBaselines.filter(p => p.condition === condition);
  const points = exact.size ? [...exact.values()].map(o => ({...o, price:roundCOP(o.priceCOP * (1-policy.discountPercent/100)), verified:true}))
    : baselines.map(p => ({...p, price:p.priceCOP, verified:false}));
  if (!points.length) throw new Error(`Falta base comercial ${model.id}/${condition}`);
  const gridSteps = (a,b) => Math.abs(model.ramGB.indexOf(a.ramGB)-model.ramGB.indexOf(b.ramGB))
    + Math.abs(capacities.indexOf(a.storageGB)-capacities.indexOf(b.storageGB));
  let minimumStep = Math.min(...points.map(p=>p.price)) * .04;
  for (const a of points) for (const b of points) {
    if (b.ramGB>=a.ramGB && b.storageGB>=a.storageGB && gridSteps(a,b)>0) {
      if (b.price<=a.price) throw new Error('Anclas no monotónicas: '+model.id);
      minimumStep=Math.min(minimumStep,(b.price-a.price)/gridSteps(a,b)*.8);
    }
  }
  minimumStep=roundCOP(minimumStep);
  const result = [];
  const distance = (a,r,s) => Math.abs(Math.log2(r/a.ramGB)) + Math.abs(Math.log2(s/a.storageGB));
  for (const storageGB of capacities) for (const ramGB of model.ramGB) {
    // The legacy 128GB education listing has no verified 16GB configuration.
    if (model.id === 'macbook-air-m1-2020' && storageGB === 128 && ramGB !== 8) continue;
    const offer = exact.get(`${ramGB}/${storageGB}`);
    const anchor = [...points].sort((a,b) => distance(a,ramGB,storageGB)-distance(b,ramGB,storageGB))[0];
    let price = offer ? roundCOP(offer.priceCOP * (1-policy.discountPercent/100))
      : roundCOP(anchor.price * policy.missingRAMFactorPerDoubling ** Math.log2(ramGB/anchor.ramGB)
        * policy.missingSSDFactorPerDoubling ** Math.log2(storageGB/anchor.storageGB));
    if (!offer) {
      // Respect exact anchors and monotonic RAM/SSD prices. Promotions can make
      // independent percentage extrapolations cross; constrain estimates only.
      const ahead = points.filter(p => p.ramGB >= ramGB && p.storageGB >= storageGB);
      const step = p => minimumStep * gridSteps(p,{ramGB,storageGB});
      if (ahead.length) price = Math.min(price, ...ahead.map(p => p.price-step(p)));
      const behind = result.filter(p => p.ramGB <= ramGB && p.storageGB <= storageGB);
      if (behind.length) price = Math.max(price, ...behind.map(p => p.price+step(p)));
      price = roundCOP(price);
    }
    result.push({ramGB, storageGB, price, calculation:{date:'2026-11-11', kind:offer?'market-reference-discount':'commercial-estimate',
      discountPercent:offer || exact.size ? policy.discountPercent : null,
      sourceOfferIds:offer?[offer.id]:anchor.verified?[anchor.id]:[],
      catalogueAnchorSlugs:anchor.verified?[]:[anchor.slug],
      method:offer?'Precio observado de la misma RAM, SSD y condición × 0.85, redondeado hacia abajo a 1000 COP.'
        :`Estimación desde la referencia más próxima de la misma condición: factor RAM 1.20 por duplicación y SSD 1.15 por duplicación; acotada por las referencias y progresión mínima de ${minimumStep} COP (4% de la base, limitada al80% de la pendiente entre anclas). No es una oferta exacta de mercado.`,
      referencePriceCOP:offer?.priceCOP ?? anchor.price,
      ramFactor:offer?1:policy.missingRAMFactorPerDoubling ** Math.log2(ramGB/anchor.ramGB),
      ssdFactor:offer?1:policy.missingSSDFactorPerDoubling ** Math.log2(storageGB/anchor.storageGB)}});
  }
  return result;
}
