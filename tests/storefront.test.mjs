import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createStorefront} from '../scripts/storefront.mjs';
const store=JSON.parse(await readFile('data/store.json','utf8'));
const ui=createStorefront(store);
test('las imágenes de Apple se presentan como referencias del fabricante',()=>{
  const p=store.products.find(p=>p.name==='iPhone 15 128 GB');
  const body=ui.productDetail(p).body;
  assert.match(body,/Imagen de referencia del fabricante/);
  assert.match(body,/manufacturer-image/);
  assert.doesNotMatch(body,/Imagen próximamente/);
  assert.match(ui.catalog(p.category),/Imagen de referencia · Apple/);
});
const schemas=html=>[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m=>JSON.parse(m[1]));

test('fichas: precio, disponibilidad, imágenes y breadcrumbs fieles a las 450 variantes',()=>{
  for(const p of store.products){
    const {body,extra}=ui.productDetail(p);const [product,breadcrumb]=schemas(extra);
    assert.equal(product.name,p.name);assert.equal(product.sku,p.slug);
    assert.equal(product.offers?.price,p.price??undefined);
    if(p.availability==='inquiry')assert.equal(product.offers?.availability,undefined);
    if(p.price!==null&&p.availability==='available')assert.equal(product.offers.availability,'https://schema.org/InStock');
    if(!p.image){assert.equal(product.image,undefined);assert.ok(body.includes('Imagen próximamente'));}
    else assert.equal(product.image,store.url+p.image);
    assert.equal(breadcrumb.itemListElement.at(-1).item,store.url+'/productos/'+p.slug+'/');
    assert.ok(body.includes(p.condition));
  }
});
test('variantes enlazan solo el mismo modelo y conservan condiciones/precios propios',()=>{
  const p=store.products[0];const {body}=ui.productDetail(p);
  const nav=body.match(/<nav class="variant-picker".*?<\/nav>/s)[0];
  for(const [,slug] of nav.matchAll(/href="\/productos\/([^/]+)\//g)){
    const variant=store.products.find(v=>v.slug===slug);assert.equal(variant.name,p.name);assert.equal(variant.category,p.category);assert.equal(variant.brand,p.brand);
  }
  assert.equal((nav.match(/aria-current="page"/g)||[]).length,1);
});
test('agotados no ofrecen consulta de compra ni CTA fijo; no se inventa WhatsApp',()=>{
  const p={...store.products[0],availability:'soldout'};const {body}=ui.productDetail(p);
  assert.ok(!body.includes('mobile-product-contact'));assert.ok(!body.includes('Consultar este producto'));
  assert.ok(body.includes('Esta unidad no está disponible para compra'));
  const noWA=createStorefront({...store,whatsapp:''}).productDetail(store.products[0]);
  assert.ok(!noWA.body.includes('wa.me'));assert.ok(noWA.body.includes('/#contacto'));
});
test('consulta identifica nombre, condición y enlace; tarjetas tienen etiqueta accesible única',()=>{
  const p=store.products[0];const {body}=ui.productDetail(p);
  const url=body.match(/href="(https:\/\/wa.me\/[^\"]+)"/)[1];
  const message=new URL(url.replaceAll('&amp;','&')).searchParams.get('text');
  assert.ok(message.includes(p.name+' ('+p.condition+')'));
  assert.ok(message.includes('/productos/'+p.slug+'/'));assert.ok(message.includes('precio final'));
  const catalog=ui.catalog();assert.equal((catalog.match(/data-product /g)||[]).length,store.products.length);
  assert.ok(catalog.includes('aria-label="Consultar: '+p.name+', '+p.condition));
});
test('Addi y Sistecrédito abren WhatsApp con producto, condición, precio y requisitos',()=>{
  const p=store.products.find(p=>p.availability!=='soldout'&&p.price!=null);
  const {body}=ui.productDetail(p);
  for(const provider of ['Addi','Sistecrédito']){
    assert.ok(body.includes('Comprar con '+provider+': '+p.name+', '+p.condition));
    const links=[...body.matchAll(/href="(https:\/\/wa.me\/[^\"]+)"/g)].map(match=>new URL(match[1].replaceAll('&amp;','&')).searchParams.get('text'));
    const message=links.find(text=>text.includes('con '+provider));
    assert.ok(message.includes(p.name+' ('+p.condition+')'));
    assert.ok(message.includes('Precio publicado:'));
    assert.ok(message.includes('cuota inicial'));
  }
  assert.ok(body.includes('sujetos a estudio y aprobación'));
});
test('Nequi abre WhatsApp con producto, condición, precio y verificación de pago',()=>{
  const p=store.products.find(p=>p.availability!=='soldout'&&p.price!=null);
  const {body}=ui.productDetail(p);
  assert.ok(body.includes('Pagar con Nequi: '+p.name+', '+p.condition));
  const messages=[...body.matchAll(/href="(https:\/\/wa\.me\/[^\"]+)"/g)].map(match=>new URL(match[1].replaceAll('&amp;','&')).searchParams.get('text'));
  const message=messages.find(text=>text.includes('pagar por Nequi'));
  assert.ok(message.includes(p.name+' ('+p.condition+')'));
  assert.ok(message.includes('Precio publicado:'));
  assert.ok(message.includes('datos oficiales'));
});
test('SEO: metadatos completos, scripts de catálogo solo donde se necesitan',async()=>{
  const p=store.products[0];const home=await readFile('index.html','utf8');
  const detail=await readFile('productos/'+p.slug+'/index.html','utf8');
  assert.ok(home.includes('/assets/catalog-model.js'));assert.ok(!detail.includes('/assets/catalog-model.js'));
  assert.ok(!detail.includes('/assets/gallery.js'));assert.ok(detail.includes('name="twitter:image"'));
  assert.ok(detail.includes('rel="canonical" href="'+store.url+'/productos/'+p.slug+'/"'));
  assert.ok(schemas(detail).some(s=>s['@type']==='BreadcrumbList'));
  assert.ok(!detail.includes('aggregateRating'));assert.ok(!detail.includes('priceValidUntil'));
});
