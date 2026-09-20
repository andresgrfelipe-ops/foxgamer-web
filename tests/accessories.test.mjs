import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createStorefront} from '../scripts/storefront.mjs';
const store=JSON.parse(fs.readFileSync('data/store.json')),review=JSON.parse(fs.readFileSync('data/accessories-review.json'));
test('las nuevas fichas separan precios documentados de existencia confirmada',()=>{
 for(const source of review.expansion.products){const p=store.products.find(p=>p.slug===source.slug);assert(p);assert.equal(p.price,Math.floor(source.referencePrice*.9/1000)*1000);assert.equal(p.availability,'inquiry');assert.equal(p.condition,'Nuevo');assert.equal(p.image,source.image);assert.equal(store.verifiedImages.find(i=>i.name===p.name)?.kind,'original-photo');}
 const ui=createStorefront(store);const portal=store.products.find(p=>p.slug==='playstation-portal-midnight-black-nuevo');assert.match(ui.productDetail(portal).body,/consola PS5/);
});
test('la revisión de accesorios conserva precios y condiciones del catálogo del propietario',()=>{
 for(const old of review.protectedCatalog){const p=store.products.find(p=>p.slug===old.slug);assert(p);for(const field of ['price','condition','availability'])assert.equal(p[field],old[field],p.slug+' '+field);}
 const variants=store.products.filter(p=>p.name==='Volante Logitech G920 con pedales'),fresh=variants.find(p=>p.condition==='Nuevo');assert.equal(fresh.price,Math.floor(review.pricing.referencePrice*.9/1000)*1000);assert(variants.every(p=>p.price<=fresh.price));
});
test('accesorios distinguen compatibilidad y usan fotos verificadas de modelos concretos',()=>{
 const ui=createStorefront(store);for(const p of store.products.filter(p=>p.category==='accesorios'&&p.image)){const html=ui.productDetail(p).body;assert(html.includes('Compatibilidad'));assert(!html.includes('Imagen próximamente'));}
 for(const [name,kind] of [['Monitor GameOn Switch X Series GOSX27B','store-photo'],['Xbox Wireless Headset','store-photo'],['Next Level Racing Wheel Stand Lite 2.0','manufacturer']])assert(store.products.filter(p=>p.name===name).every(p=>p.image&&store.verifiedImages.some(v=>v.name===name&&v.image===p.image&&v.kind===kind)));
 for(const p of store.products.filter(p=>p.name==='Simulador de carreras Logitech G923'))assert.match(p.compatibility,/PlayStation\/PC o Xbox\/PC/);
 const html=ui.catalog('accesorios');assert(html.indexOf('Control Sony DualSense')<html.indexOf('<h3>Xbox Wireless Headset</h3>'));assert(html.includes('?q=G920#productos'));
});
