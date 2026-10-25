import fs from 'node:fs';
import {storageFromName, storageStem, replaceStorage, storageLabel} from './apple-storage.mjs';

const file = 'data/store.json';
const store = JSON.parse(fs.readFileSync(file));
const original = structuredClone(store.products);
const {models, verifiedAt} = JSON.parse(fs.readFileSync('data/apple-storage-references.json'));
const assets = JSON.parse(fs.readFileSync('data/apple-storage-assets.json'));
const slug = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const round = value => Math.max(1000, Math.floor(value / 1000) * 1000);
const conditions = ['Nuevo', 'Exhibición', 'Usado'];
const median = xs => [...xs].sort((a,b) => a-b)[Math.floor(xs.length/2)];
const additions = [];
const appendOnce = (value, suffix) => value.includes(suffix) ? value : value + suffix;
for (const proof of store.verifiedImages) {
  if (proof.name === 'iPad mini A17 Pro 128 GB Wi-Fi') proof.sourceModel = 'iPad mini (A17 Pro)';
}

// Authorized commercial estimates: existing prices never change. Interpolate
// known capacities; outside them, use a modest 15% step per storage doubling.
function estimate(anchors, capacity, fallbackCapacity) {
  const points = anchors.filter(p => p.condition === 'Nuevo' && p.price > 0)
    .map(p => ({capacity: storageFromName(p.name) || fallbackCapacity, price: p.price, slug: p.slug}))
    .sort((a,b) => a.capacity-b.capacity);
  if (!points.length) throw new Error('Falta precio base: ' + anchors[0]?.name);
  const exact = points.find(p => p.capacity === capacity);
  if (exact) return {price: exact.price, anchors: [exact.slug], method: 'base'};
  const low = points.filter(p => p.capacity < capacity).at(-1);
  const high = points.find(p => p.capacity > capacity);
  if (low && high && high.price >= low.price) {
    const fraction = Math.log2(capacity/low.capacity)/Math.log2(high.capacity/low.capacity);
    return {price: round(low.price + fraction*(high.price-low.price)), anchors:[low.slug,high.slug], method:'interpolación entre capacidades publicadas'};
  }
  const closest = low || high;
  return {price: round(closest.price * 1.15 ** Math.log2(capacity/closest.capacity)), anchors:[closest.slug], method:'15 % por duplicación de almacenamiento desde la capacidad publicada más próxima'};
}

const absent = {
  'iPhone Duo': ['iPhone 18 Pro Max 256 GB', 1999/1299, 'iPhone Duo'],
  'iPad Pro 13 pulgadas M4': ['iPad Pro 13 pulgadas M5 256 GB', .9],
  'iPad Pro 11 pulgadas 4.ª generación': ['iPad Pro 11 pulgadas 3.ª generación', 1.1],
  'iPad Pro 12.9 pulgadas 6.ª generación': ['iPad Pro 12.9 pulgadas 5.ª generación', 1.1],
  'iPad Air 11 pulgadas M2': ['iPad Air 11 pulgadas M3 256 GB', .9],
  'iPad Air 13 pulgadas M2': ['iPad Air 13 pulgadas M3 256 GB', .9],
  'MacBook Air 13-inch M2 (2022)': ['MacBook Air 13 pulgadas M4 256 GB', .81, 'MacBook Air 13 pulgadas M2'],
  'MacBook Air 15-inch M2 (2023)': ['MacBook Air M5 15 pulgadas · 16 GB RAM · SSD 512 GB', .729, 'MacBook Air 15 pulgadas M2'],
  'MacBook Air 13-inch M3 (2024)': ['MacBook Air 13 pulgadas M4 256 GB', .9, 'MacBook Air 13 pulgadas M3'],
  'MacBook Air 15-inch M3 (2024)': ['MacBook Air M5 15 pulgadas · 16 GB RAM · SSD 512 GB', .81, 'MacBook Air 15 pulgadas M3'],
  'MacBook Air 15-inch M4 (2025)': ['MacBook Air M5 15 pulgadas · 16 GB RAM · SSD 512 GB', .9, 'MacBook Air 15 pulgadas M4'],
  'Mac mini M6 (2026)': ['Mac mini M4 256 GB', 1.1, 'Mac mini M6'],
  'Mac mini M5 Pro (2026)': ['Mac mini M4 256 GB', 1.925, 'Mac mini M5 Pro'],
  'Mac mini M4 Pro (2024)': ['Mac mini M4 256 GB', 1.75, 'Mac mini M4 Pro'],
  'iMac 24-inch M4 (2024, four ports)': ['iMac 24 pulgadas M4 16 GB RAM 256 GB SSD', 1.2, 'iMac 24 pulgadas M4 cuatro puertos']
};

store.appleStorageModels = [];
for (const model of models) {
  const id = slug(model.canonical_model);
  store.appleStorageModels.push({id, label:model.canonical_model, capacitiesGB:model.capacities_GB, sourceUrl:model.source_url, verifiedAt, notes:model.notes});
  const members = original.filter(p => model.existing_names.includes(p.name));
  const regular = members.filter(p => !/CPO|Exhibición Premium/.test(p.name));
  const groups = new Map();
  for (const p of regular) {
    const key = storageStem(p.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  const newModel = !members.length;
  if (newModel) {
    const config = absent[model.canonical_model];
    if (!config) throw new Error('Falta referencia comercial para ' + model.canonical_model);
    const anchors = original.filter(p => p.name === config[0]);
    if (!anchors.length) throw new Error('Referencia ausente: '+config[0]);
    groups.set((config[2] || model.canonical_model) + ' {storage}', anchors);
  }
  for (const [groupName, anchors] of groups) {
    const groupId = id+'--'+slug(groupName);
    const sample = anchors.find(p => p.condition === 'Nuevo');
    const minimum = model.capacities_GB[0];
    for (const p of store.products.filter(p => anchors.some(a => a.slug === p.slug) && !newModel)) {
      p.appleModel = id;
      p.appleModelLabel = model.canonical_model;
      p.appleStorageGroup = groupId;
      p.storageGB = storageFromName(p.name);
      if (/iMac 24-inch M1/.test(model.canonical_model)) p.description = appendOnce(p.description, ' Configuración de cuatro puertos y GPU de 8 núcleos; confirma la memoria RAM de la unidad.');
      if (/iMac 24-inch M4.*two ports/.test(model.canonical_model)) p.description = appendOnce(p.description, ' Configuración de dos puertos y chip M4 de 8 núcleos.');
    }
    for (const capacity of model.capacities_GB) {
      let name = newModel ? groupName.replace('{storage}',storageLabel(capacity)) : replaceStorage(sample.name,capacity);
      if (model.canonical_model.startsWith('Apple TV 4K 3rd')) name += capacity === 128 ? ' Wi-Fi + Ethernet' : ' Wi-Fi';
      const calculation = estimate(anchors,capacity,minimum);
      if (newModel) calculation.price = round(calculation.price * absent[model.canonical_model][1]);
      if (model.canonical_model === 'iPhone Duo') {
        const usd = {256:1999,512:2199,1024:2599,2048:3199};
        calculation.price = round(sample.price * usd[capacity]/1299);
        calculation.method = 'proporción de precios oficiales Apple US respecto a iPhone 18 Pro Max 256 GB y precio FOX GAMER existente; no es oferta colombiana verificada';
      }
      for (const condition of conditions) {
        if (store.products.some(p => p.name === name && p.condition === condition)) continue;
        const ratios = anchors.filter(p => p.condition === condition).map(p => {
          const fresh = anchors.find(q => q.name === p.name && q.condition === 'Nuevo');
          return fresh ? p.price/fresh.price : null;
        }).filter(r => r > 0 && r <= 1);
        const ratio = condition === 'Nuevo' ? 1 : Math.min(condition === 'Exhibición' ? .95 : .9, median(ratios) || (condition === 'Exhibición' ? .85 : .7));
        const price = round(calculation.price * ratio);
        const reference = anchors.find(p => p.condition === condition) || sample;
        let description = `${name}. Almacenamiento: ${storageLabel(capacity)}. Consulta color, configuración, estado y disponibilidad de la unidad por WhatsApp.`;
        if (/Intel/.test(model.canonical_model)) description += ' Referencia del año 2020'+(/two Thunderbolt/.test(model.canonical_model) ? ', con dos puertos Thunderbolt 3.' : '.');
        if (/iMac 24-inch M4.*two ports/.test(model.canonical_model)) description += ' Modelo de dos puertos y chip M4 de 8 núcleos.';
        if (/iMac 24-inch M4.*four ports/.test(model.canonical_model)) description += ' Modelo de cuatro puertos y chip M4 de 10 núcleos.';
        if (/iMac 24-inch M1/.test(model.canonical_model)) description += ' Modelo de cuatro puertos y GPU de 8 núcleos; confirma la memoria RAM de la unidad.';
        if (/MacBook Neo/.test(name)) description += capacity === 512 ? ' Teclado con Touch ID.' : ' Teclado sin Touch ID.';
        description += ' Precio comercial calculado por FOX GAMER para esta configuración.';
        const product = {...reference,slug:slug(name+'-'+condition),name,description,price,availability:'inquiry',appleModel:id,appleModelLabel:model.canonical_model,appleStorageGroup:groupId,storageGB:capacity,
          condition,conditionNotes:condition==='Nuevo'?'Referencia nueva; confirma sellado y contenido de la unidad.':condition==='Exhibición'?'Referencia de exhibición; confirma estado y accesorios de la unidad.':'Referencia usada; confirma estado, batería cuando corresponda y accesorios.',
          marketSource:`Precio comercial calculado el ${verifiedAt}, autorizado por el usuario a partir de los precios actuales de FOX GAMER. ${calculation.method}. ${newModel ? 'Factor entre modelos: '+absent[model.canonical_model][1]+'. ' : ''}Condición: proporción ${ratio}. No es una oferta de mercado ni acredita existencias.`,
          pricingCalculation:{date:verifiedAt,kind:'commercial-estimate',anchorSlugs:calculation.anchors,storageMethod:calculation.method,modelFactor:newModel?absent[model.canonical_model][1]:1,conditionRatio:ratio},
          specificationSource:model.source_url};
        const asset = assets.find(a => a.canonical_model === model.canonical_model);
        let proof;
        if (newModel) {
          if (!asset) throw new Error('Falta imagen exacta: '+model.canonical_model);
          product.image = asset.image;
          proof = {...asset};
          delete proof.canonical_model;
        } else {
          proof = store.verifiedImages.find(p => p.name === reference.name && p.image === reference.image);
          if (!proof) throw new Error('Falta evidencia imagen: '+reference.name);
          proof = {...proof};
        }
        proof.name = name;
        proof.storageReference = newModel ? name : reference.name;
        proof.storageSourceModel = proof.sourceModel;
        if (model.canonical_model.startsWith('Apple TV 4K 3rd') && capacity === 128) {
          proof.sourceModel = 'Apple TV 4K (3rd generation) Wi-Fi + Ethernet';
          proof.storageSourceModel = proof.sourceModel;
          proof.sourceUrl = 'https://support.apple.com/en-us/101605';
          proof.evidence = 'Apple publica la misma imagen frontal apple-tv-4k-3gen.png bajo los encabezados Wi-Fi y Wi-Fi + Ethernet de la tercera generación. El modelo de 128 GB incorpora Ethernet y Thread; la imagen no muestra la parte posterior. Verificado el 25/10/2026.';
        }
        proof.evidence += ` Capacidad ${storageLabel(capacity)} verificada en ${model.source_url}; no cambia el exterior del modelo.`;
        proof.reviewedAt = verifiedAt;
        if (!store.verifiedImages.some(p => p.name === name && p.image === product.image)) store.verifiedImages.push(proof);
        store.products.push(product);
        additions.push({slug:product.slug,name,condition,price,model:id,storageGB:capacity});
      }
    }
  }
}
store.appleStoragePricingPolicy = {date:verifiedAt,authorizedChoice:'Calcular con precios actuales',preserveExistingPrices:true,unanchoredDoublingFactor:1.15,description:'Interpolación entre precios existentes; extrapolación del 15 % por duplicación de capacidad. Modelos nuevos usan factores comerciales documentados. Proporciones de condición conservadas desde la referencia.'};
fs.writeFileSync(file,JSON.stringify(store,null,2)+'\n');
fs.mkdirSync('reports',{recursive:true});
const prior = fs.existsSync('reports/apple-storage-additions.json') ? JSON.parse(fs.readFileSync('reports/apple-storage-additions.json')).additions : [];
const recorded = [...new Map([...prior,...additions].map(p => [p.slug,p])).values()];
fs.writeFileSync('reports/apple-storage-additions.json',JSON.stringify({date:verifiedAt,models:models.length,addedOffers:recorded.length,additions:recorded},null,2)+'\n');
console.log(JSON.stringify({models:models.length,addedOffers:additions.length,totalAppleOffers:store.products.filter(p=>p.category==='apple').length}));
