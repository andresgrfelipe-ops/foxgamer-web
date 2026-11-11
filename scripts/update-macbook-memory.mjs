import fs from 'node:fs';
import {memoryGB} from './macbook-memory.mjs';
import {replaceStorage, storageLabel} from './apple-storage.mjs';
import {memoryPriceGrid, roundCOP} from './macbook-pricing.mjs';

const store = JSON.parse(fs.readFileSync('data/store.json'));
const market = JSON.parse(fs.readFileSync('data/macbook-memory-market.json'));
const original = structuredClone(store.products);
const slugify = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const conditions = ['Nuevo','Exhibición','Usado'];
const specs = new Map(store.appleStorageModels.map(m => [m.id,m]));
const additions = [];
store.appleMemoryModels = market.models.map(({id,ramGB,sourceUrl,reviewedAt}) => ({id,ramGB,sourceUrl,reviewedAt,
  ...(id==='macbook-air-m1-2020'?{capacitiesByRAM:{16:[256,512,1024,2048]},notes:'128GB educativo se conserva solo con8GB;16/128 no verificado.'}:{})}));

function processor(model, ram, storage) {
  if (model.includes('-m5-max-')) return `CPU de 18 núcleos · GPU de ${ram===36?32:40} núcleos`;
  if (model.includes('-m5-pro-')) return model.includes('-16-') || ram===64 ? 'CPU de 18 núcleos · GPU de 20 núcleos' : 'CPU de 15 núcleos · GPU de 16 núcleos';
  if (model.includes('macbook-pro-14-inch-m5-')) return 'CPU de 10 núcleos · GPU de 10 núcleos';
  if (model.includes('air-') && model.includes('-m5-')) return `CPU de 10 núcleos · GPU de ${model.includes('-15-') || ram>=24 || storage>=1024 ? 10:8} núcleos`;
  if (model.includes('m1-pro-')) return ram===32?'GPU de 16 núcleos':'GPU de 14 núcleos';
  if (model.includes('-13-inch-m3-') && ram>=16) return 'CPU de 8 núcleos · GPU de 10 núcleos';
  return null;
}

for (const model of market.models) {
  const members = original.filter(p => p.appleModel===model.id);
  const spec = specs.get(model.id);
  if (model.id==='macbook-neo-a18-pro-2026') {
    for (const p of store.products.filter(p => p.appleModel===model.id)) p.ramGB=8;
    continue;
  }
  const newPrices = memoryPriceGrid(model,spec.capacitiesGB,market.offers,market.policy,'Nuevo');
  for (const condition of conditions) {
    const ratios = model.catalogueBaselines.filter(p=>p.condition===condition).map(p=>p.priceCOP/model.catalogueBaselines.find(n=>n.condition==='Nuevo' && n.ramGB===p.ramGB && n.storageGB===p.storageGB).priceCOP).sort((a,b)=>a-b);
    const ratio = Math.min(condition==='Exhibición'?.95:.90, ratios[Math.floor(ratios.length/2)]);
    const hasExact = market.offers.some(o=>o.modelId===model.id && o.condition===condition);
    const prices = condition==='Nuevo' ? newPrices : hasExact ? memoryPriceGrid(model,spec.capacitiesGB,market.offers,market.policy,condition)
      : newPrices.map(q=>({...q,price:roundCOP(q.price*ratio),calculation:{...q.calculation,kind:'commercial-estimate',conditionRatio:ratio,
        method:q.calculation.method+` Conversión comercial a ${condition}: proporción histórica FOX GAMER ${ratio}; no es oferta de mercado verificada de esta condición.`}}));
    for (const quote of prices) {
      const {ramGB,storageGB,price,calculation} = quote;
      const match = members.find(p => p.condition===condition && p.storageGB===storageGB
        && (memoryGB(p)===ramGB || (!memoryGB(p) && ramGB===model.baselineRAM)));
      const template = match || members.find(p => p.condition===condition && p.storageGB===storageGB)
        || members.find(p => p.condition===condition);
      let name = replaceStorage(template.name,storageGB);
      if (/\d+ GB RAM/.test(name)) name = name.replace(/\d+ GB RAM/,`${ramGB} GB RAM`);
      else name = name.replace(new RegExp(`${storageLabel(storageGB)}$`), `${ramGB} GB RAM ${storageLabel(storageGB)}`);
      const p = match ? store.products.find(p=>p.slug===match.slug) : {...template,slug:slugify(name+' '+condition)};
      const oldName = template.name;
      const cpu = processor(model.id,ramGB,storageGB);
      const priceNote = calculation.kind==='commercial-estimate' ? market.policy.estimatedPriceNote : 'Precio FOX GAMER actualizado con referencia de mercado.';
      Object.assign(p,{name,ramGB,storageGB,price,appleStorageGroup:`${model.id}--ram-${ramGB}`,
        pricingCalculation:calculation,processorConfiguration:cpu,availability:'inquiry',
        specificationSource:model.sourceUrl,
        description:`${name}. ${cpu?cpu+'. ':''}${priceNote} Configuración de catálogo sujeta a disponibilidad. Confirma color, teclado, accesorios y garantía antes de pagar.`,
        marketSource:`Revisión ${market.checkedAt}. ${calculation.method} Fuentes: ${calculation.sourceOfferIds.map(id=>market.offers.find(o=>o.id===id).url).join(' ') || 'base comercial FOX GAMER documentada; sin oferta exacta de mercado'}. No acredita existencias.`});
      if (!match) {store.products.push(p);additions.push(p.slug);}
      if (!store.verifiedImages.some(v=>v.name===name && v.image===p.image)) {
        const proof = store.verifiedImages.find(v=>v.name===oldName && v.image===p.image);
        if (!proof) throw new Error('Falta imagen del modelo '+oldName);
        store.verifiedImages.push({...proof,name,memoryReference:proof.memoryReference || oldName,
          memorySourceModel:proof.sourceModel, reviewedAt:market.checkedAt,
          evidence:proof.evidence+' RAM configurada según especificaciones oficiales; mismo exterior. No acredita memoria ni existencia de una unidad física.'});
      }
    }
  }
}
fs.writeFileSync('data/store.json',JSON.stringify(store,null,2)+'\n');
console.log(`${additions.length} ofertas añadidas. ${store.products.filter(p=>p.appleModel?.startsWith('macbook')).length} ofertas MacBook con RAM explícita.`);
