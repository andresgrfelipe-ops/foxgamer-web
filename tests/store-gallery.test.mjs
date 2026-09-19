import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {storeGallery} from '../scripts/store-gallery.mjs';
const store=JSON.parse(fs.readFileSync('data/store.json'));
test('galería de accesorios visible: solo enlaza foto y precio del modelo verificado',()=>{
 const html=storeGallery(store,'accesorios');
 assert.match(html,/<details class="gallery-disclosure" open>/);
 assert.equal((html.match(/<figure /g)||[]).length,25);
 assert.match(html,/productos\/sony-pulse-elite-blanco-nuevo/);
 assert.match(html,/494\.000/);
 assert(!html.includes('IMG_2293'));
 assert(!html.includes('/productos/diademas-nuevo/'));
 assert(!html.includes('/productos/g29-nuevo/'));
 assert.match(html,/Consultar esta fotografía/);
 assert.match(html,/img_2460-large.webp/);
});
test('una asociación no verificada no hereda un precio y el resto de galerías conserva su presentación',()=>{
 const copy=structuredClone(store);copy.verifiedImages=[];
 assert(!storeGallery(copy,'accesorios').includes('Ver ficha y condiciones'));
 assert(!storeGallery(store,'consolas').includes('gallery-disclosure" open'));
 const photo=copy.gallery.find(p=>p.image==='/assets/photos/img_2293.webp');photo.title='<modelo & especial>';
 assert(storeGallery(copy,'accesorios').includes('&lt;modelo &amp; especial&gt;'));
});
