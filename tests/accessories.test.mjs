import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import {createStorefront} from '../scripts/storefront.mjs';
const store=JSON.parse(fs.readFileSync('data/store.json')),review=JSON.parse(fs.readFileSync('data/accessories-review.json'));
test('la revisión de accesorios conserva precios y condiciones del catálogo del propietario',()=>{
 for(const old of review.protectedCatalog){const p=store.products.find(p=>p.slug===old.slug);assert(p);for(const field of ['price','condition','availability'])assert.equal(p[field],old[field],p.slug+' '+field);}
 const variants=store.products.filter(p=>p.name==='Volante Logitech G920 con pedales'),fresh=variants.find(p=>p.condition==='Nuevo');assert.equal(fresh.price,Math.floor(review.pricing.referencePrice*.9/1000)*1000);assert(variants.every(p=>p.price<=fresh.price));
});
test('accesorios distinguen compatibilidad y referencia fotográfica sin completar modelos ambiguos',()=>{
 const ui=createStorefront(store);for(const p of store.products.filter(p=>p.category==='accesorios'&&p.image)){const html=ui.productDetail(p).body;assert(html.includes('Compatibilidad'));assert(!html.includes('Imagen próximamente'));}
 for(const name of ['Monitores','Diademas','Soporte para volante y pedales'])assert(store.products.filter(p=>p.name===name).every(p=>p.image===null));
 for(const p of store.products.filter(p=>p.name==='Simulador de carreras Logitech G923'))assert.match(p.compatibility,/PlayStation\/PC o Xbox\/PC/);
 const html=ui.catalog('accesorios');assert(html.indexOf('Control Sony DualSense')<html.indexOf('<h3>Diademas</h3>'));assert(html.includes('?q=G920#productos'));
});
