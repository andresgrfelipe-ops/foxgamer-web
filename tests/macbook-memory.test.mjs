import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {memoryGB, memoryChoices,validateMacbookMemory} from '../scripts/macbook-memory.mjs';
import {storageChoices} from '../scripts/apple-storage.mjs';
import {priceLabel,imageIdentity} from '../scripts/catalog.mjs';
import {createStorefront} from '../scripts/storefront.mjs';
import {roundCOP} from '../scripts/macbook-pricing.mjs';

const store = JSON.parse(await readFile('data/store.json','utf8'));
const market = JSON.parse(await readFile('data/macbook-memory-market.json','utf8'));
const ui = createStorefront(store);
const macs = store.products.filter(p=>p.appleModel?.startsWith('macbook'));

test('every supported RAM choice retains model, SSD, condition and a unique priced offer',()=>{
  assert.equal(macs.length,561);
  for (const p of macs) {
    const choices = memoryChoices(store.products,p);
    const expected = p.appleModel==='macbook-air-m1-2020' && p.storageGB===128 ? [8] : store.appleMemoryModels.find(m=>m.id===p.appleModel).ramGB;
    assert.deepEqual(choices.map(memoryGB),expected);
    for (const c of choices) {
      assert.equal(c.appleModel,p.appleModel);assert.equal(c.storageGB,p.storageGB);assert.equal(c.condition,p.condition);
      assert.ok(Number.isSafeInteger(c.price) && c.price>0);
      assert.ok(storageChoices(store.products,c).every(v=>memoryGB(v)===memoryGB(c)));
      assert.equal(store.products.filter(v=>v.appleModel===c.appleModel && v.storageGB===c.storageGB && v.condition===c.condition && memoryGB(v)===memoryGB(c)).length,1);
    }
  }
});

test('RAM is explicit and official limits are enforced',()=>{
  assert.equal(memoryGB({name:'MacBook Air 13 pulgadas M4 256 GB',category:'apple'}),null);
  assert.equal(memoryGB({name:'iPad 16 GB RAM',category:'apple'}),null);
  const p=macs[0];
  assert.deepEqual(memoryChoices([p,{...p,appleModel:'another-chip',ramGB:96},{...p,condition:'Usado',ramGB:96},{...p,storageGB:8192,ramGB:96},{...p,price:null,ramGB:96}],p),[p]);
  assert.deepEqual(memoryChoices(store.products,{...p,name:'MacBook sin RAM especificada',ramGB:undefined}),[]);
  const invalid=structuredClone(store);invalid.products.find(v=>v.slug===p.slug).ramGB=96;
  assert.throws(()=>validateMacbookMemory(invalid),/RAM incompatible/);
  for (const p of macs.filter(p=>p.appleModel.includes('m5-max'))) assert.match(p.processorConfiguration,new RegExp('GPU de '+(p.ramGB===36?32:40)+' núcleos'));
  for (const p of macs.filter(p=>p.appleModel.includes('m5-pro') && p.ramGB===64)) assert.match(p.processorConfiguration,/CPU de 18 núcleos · GPU de 20 núcleos/);
});

test('RAM links use the exact published price in the purchase panel and WhatsApp',()=>{
  for (const p of macs) {
    const {body}=ui.productDetail(p);
    const choices=memoryChoices(store.products,p);
    const nav=body.match(/<nav id="memoria-ram".*?<\/nav>/s)?.[0];
    if (choices.length===1) {assert.equal(nav,undefined);continue;}
    assert.ok(nav);assert.equal((nav.match(/aria-current="page"/g)||[]).length,1);
    assert.equal([...nav.matchAll(/href="\/productos\/([^/]+)\/#memoria-ram"/g)].length,choices.length);
    assert.ok(body.includes(`<p class="product-price">${priceLabel(p)}</p>`));
    const messages=[...body.matchAll(/href="(https:\/\/wa.me\/[^\"]+)"/g)].map(m=>new URL(m[1].replaceAll('&amp;','&')).searchParams.get('text'));
    assert.ok(messages.length>=4);
    for (const message of messages) {assert.ok(message.includes(p.name));assert.ok(message.includes('('+p.condition+')'));assert.ok(message.includes(priceLabel(p)));}
  }
});

test('market anchors receive15% while estimates remain visibly distinguished',()=>{
  const cheapest=new Map();
  for (const o of market.offers) {
    const key=[o.modelId,o.ramGB,o.storageGB,o.condition].join('/');
    if (!cheapest.has(key)||cheapest.get(key).priceCOP>o.priceCOP)cheapest.set(key,o);
  }
  for (const o of cheapest.values()) {
    const p=macs.find(p=>p.appleModel===o.modelId&&p.ramGB===o.ramGB&&p.storageGB===o.storageGB&&p.condition===o.condition);
    assert.equal(p.price,roundCOP(o.priceCOP*.85));
    assert.equal(p.pricingCalculation.kind,'market-reference-discount');
  }
  for (const p of macs.filter(p=>p.pricingCalculation?.date==='2026-11-11')) {
    if (p.pricingCalculation.kind==='commercial-estimate')assert.match(p.description,/Precio comercial calculado\. Sin oferta exacta verificada/);
    assert.equal(p.availability,'inquiry');
    for (const other of memoryChoices(store.products,p))if(other.ramGB>p.ramGB)assert.ok(other.price>=p.price,`${p.slug} -> ${other.slug}`);
    for (const other of storageChoices(store.products,p))if(other.storageGB>p.storageGB)assert.ok(other.price>=p.price,`${p.slug} SSD`);
    const nuevo=macs.find(v=>v.appleModel===p.appleModel&&v.ramGB===p.ramGB&&v.storageGB===p.storageGB&&v.condition==='Nuevo');
    assert.ok(p.price<=nuevo.price,`${p.slug} exceeds new price`);
  }
});

test('RAM image reuse is limited to the exact exterior model',()=>{
  const proof=store.verifiedImages.find(v=>v.memoryReference&&v.name.startsWith('MacBook Air 13 pulgadas M2'));
  const source=store.verifiedImages.find(v=>v.name===proof.memoryReference);
  assert.equal(imageIdentity(proof),imageIdentity(source));
  assert.throws(()=>imageIdentity({...proof,name:proof.name.replace('M2','M3')}),/Modelo oficial no coincide/);
  assert.throws(()=>imageIdentity({...proof,sourceModel:'MacBook Air (M3, 2024)'}),/Modelo oficial no coincide/);
});

test('catalogue links to RAM selection; unrelated Apple and fixed-memory Neo do not show a selector',()=>{
  const catalog=ui.catalog('apple');
  for (const p of macs)if(memoryChoices(store.products,p).length>1)assert.ok(catalog.includes(`href="/productos/${p.slug}/#memoria-ram"`));
  const phone=store.products.find(p=>p.name==='iPhone 15 128 GB');
  assert.doesNotMatch(ui.productDetail(phone).body,/ram-picker|memoria-ram/);
  for (const p of macs.filter(p=>p.appleModel==='macbook-neo-a18-pro-2026'))assert.doesNotMatch(ui.productDetail(p).body,/ram-picker/);
});
