import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {gameGallery} from '../scripts/game-gallery.mjs';
import {createStorefront} from '../scripts/storefront.mjs';
test('galería: cada ficha muestra foto, precio y consulta exacta sin duplicar unidades',()=>{
 const store=JSON.parse(fs.readFileSync('data/store.json'));const games=store.products.filter(p=>p.category==='videojuegos');assert(games.every(p=>p.image&&p.price>0));
 const html=gameGallery(store);assert.equal((html.match(/data-game-card/g)||[]).length,new Set(games.map(p=>p.name+'|'+p.condition)).size);
 assert(html.includes('id="juegos"')&&html.includes('id="productos"'));assert(!html.includes('Imagen próximamente')&&!html.includes('Precio por confirmar'));assert(html.includes('Físico'));
 for(const p of games)assert(html.includes(encodeURIComponent('Hola FOX GAMER, me interesa '+p.name+' en formato físico, condición '+p.condition)));
});
test('clásicos: plataforma exacta, portada identificada y ninguna existencia inventada',()=>{
 const store=JSON.parse(fs.readFileSync('data/store.json')),classic=store.products.filter(p=>p.classicGame),html=gameGallery(store);
 assert.equal(classic.length,9);assert.deepEqual([...new Set(classic.map(p=>p.platform))].sort(),['PS2','PS3','Xbox 360']);
 for(const p of classic){
  assert.equal(p.availability,'inquiry');assert.equal(p.condition,'Usado');assert(p.name.endsWith(' · '+p.platform));
  assert(html.includes('data-platform="'+p.platform+'"'));assert.equal(store.verifiedImages.find(v=>v.name===p.name).kind,'reference-photo');
  const detail=JSON.stringify(createStorefront(store).productDetail(p));assert(detail.includes('Portada de referencia'));assert(!detail.includes('https://schema.org/InStock'));
 }
 assert(html.includes('<option>Xbox 360</option>'));assert(html.includes('Todas las condiciones'));
});
