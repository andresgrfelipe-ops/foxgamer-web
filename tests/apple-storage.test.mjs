import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {storageFromName, storageChoices, replaceStorage, validateAppleStorage} from '../scripts/apple-storage.mjs';
import {createStorefront} from '../scripts/storefront.mjs';
import '../assets/catalog-model.js';

const store = JSON.parse(await readFile('data/store.json','utf8'));
const find = (name, condition='Nuevo') => store.products.find(p => p.name === name && p.condition === condition);

test('cada grupo conserva condición, RAM y conectividad con todas sus capacidades oficiales', () => {
  const models = new Map(store.appleStorageModels.map(m => [m.id,m]));
  const groups = new Map(store.products.filter(p => p.appleStorageGroup).map(p => [p.appleStorageGroup+'|'+p.condition,p]));
  for (const p of groups.values()) {
    const choices = storageChoices(store.products,p);
    assert.deepEqual(choices.map(c => c.storageGB),models.get(p.appleModel).capacitiesGB,p.name+' '+p.condition);
    assert.ok(choices.every(c => c.condition === p.condition && c.appleStorageGroup === p.appleStorageGroup));
  }
  const mac = find('MacBook Air M5 15 pulgadas · 24 GB RAM · SSD 1 TB','Usado');
  assert.ok(storageChoices(store.products,mac).every(p => p.name.includes('24 GB RAM')));
  assert.equal(storageFromName(mac.name),1024);
  assert.equal(replaceStorage(mac.name,4096),'MacBook Air M5 15 pulgadas · 24 GB RAM · SSD 4 TB');
  const cellular = find('iPad Air 13 pulgadas M3 256 GB Cellular');
  assert.ok(storageChoices(store.products,cellular).every(p => p.name.endsWith('Cellular')));
});

test('iPhone 15 estándar ofrece 128, 256 y 512 GB y rechaza 1 TB', () => {
  const p = find('iPhone 15 128 GB');
  assert.deepEqual(storageChoices(store.products,p).map(c => c.storageGB),[128,256,512]);
  assert.throws(() => validateAppleStorage({...store,products:[{...p,name:'iPhone 15 1 TB',storageGB:1024}]}),/Capacidad incompatible/);
});

test('la navegación enlaza capacidades reales manteniendo la condición elegida', () => {
  const p = find('iPhone 15 128 GB','Usado');
  const html = createStorefront(store).productDetail(p).body;
  const nav = html.match(/<nav class="variant-picker storage-picker".*?<\/nav>/s)[0];
  const slugs = [...nav.matchAll(/href="\/productos\/([^/]+)\//g)].map(m => m[1]);
  assert.equal(slugs.length,3);
  assert.equal((nav.match(/aria-current="page"/g)||[]).length,1);
  for (const slug of slugs) assert.equal(store.products.find(p => p.slug===slug).condition,'Usado');
  assert.equal(globalThis.FoxCatalog.normalize('iPhone 15 512GB'),'iphone 15 512 gb');
  assert.equal(globalThis.FoxCatalog.normalize('Mac 1TB'),'mac 1 tb');
});

test('Apple TV diferencia conectividad y las fichas antiguas no inventan capacidad', () => {
  assert.ok(find('Apple TV 4K 3.ª generación 64 GB Wi-Fi'));
  assert.ok(find('Apple TV 4K 3.ª generación 128 GB Wi-Fi + Ethernet'));
  assert.equal(find('Apple TV 4K 3.ª generación').storageGB,null);
  assert.equal(find('iPad Pro 11 pulgadas 3.ª generación').storageGB,null);
});

test('las referencias añadidas documentan precio calculado sin afirmar existencias', () => {
  const newOffers=store.products.filter(p => p.pricingCalculation?.date === '2026-10-25');
  assert.ok(newOffers.length>0);
  for(const p of newOffers) {
    assert.equal(p.availability,'inquiry',p.slug);
    assert.ok(p.pricingCalculation.anchorSlugs.every(slug => store.products.some(a => a.slug===slug)),p.slug);
    assert.match(p.description,/Precio comercial calculado/);
    assert.ok(p.price>0 && Number.isSafeInteger(p.price));
  }
});
