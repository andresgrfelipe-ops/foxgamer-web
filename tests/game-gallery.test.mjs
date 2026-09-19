import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {gameGallery} from '../scripts/game-gallery.mjs';
test('galería: filtros combinados, orden numérico, paginación y recuperación',()=>{
 const node=()=>({value:'',dataset:{},events:{},addEventListener(k,f){this.events[k]=f;}});
 const ids=['gallery-search','gallery-query','gallery-platform','gallery-condition','gallery-sort','gallery-grid','gallery-count','gallery-more','gallery-empty','gallery-reset','gallery-empty-reset'];const n=Object.fromEntries(ids.map(k=>[k,node()]));
 const cards=Array.from({length:27},(_,i)=>({dataset:{name:i===0?'Grand Theft Auto V · PS5':'Juego '+i,platform:i%2?'PS4':'PS5',condition:'Nuevo',price:String(1000+i*1000),rank:String(i)}}));cards.push({dataset:{name:'Grand Theft Auto V · PS5',platform:'PS5',condition:'Usado',price:'800',rank:'28'}});
 const order=[];n['gallery-grid'].querySelectorAll=()=>cards;n['gallery-grid'].append=c=>order.push(c);n['gallery-condition'].value='Nuevo';n['gallery-sort'].value='featured';
 vm.runInNewContext(fs.readFileSync('assets/game-gallery.js','utf8'),{document:{querySelector:()=>({}),getElementById:id=>n[id]}});
 assert.equal(cards.filter(c=>!c.hidden).length,12);n['gallery-more'].events.click();assert.equal(cards.filter(c=>!c.hidden).length,24);
 n['gallery-query'].value='GTA';n['gallery-query'].events.input();assert.equal(cards.filter(c=>!c.hidden).length,1);assert.equal(cards.find(c=>!c.hidden).dataset.price,'1000');
 n['gallery-condition'].value='Usado';n['gallery-condition'].events.change();assert.equal(cards.find(c=>!c.hidden).dataset.price,'800');
 n['gallery-platform'].value='PS4';n['gallery-platform'].events.change();assert.equal(n['gallery-empty'].hidden,false);
 n['gallery-empty-reset'].events.click();assert.equal(cards.filter(c=>!c.hidden).length,12);n['gallery-sort'].value='price-desc';n['gallery-sort'].events.change();assert.equal(order.at(-27).dataset.price,'27000');
});
test('galería: cada ficha muestra foto, precio y consulta exacta sin duplicar unidades',()=>{
 const store=JSON.parse(fs.readFileSync('data/store.json'));const games=store.products.filter(p=>p.category==='videojuegos');assert(games.every(p=>p.image&&p.price>0));
 const html=gameGallery(store);assert.equal((html.match(/data-game-card/g)||[]).length,new Set(games.map(p=>p.name+'|'+p.condition)).size);
 assert(html.includes('id="juegos"')&&html.includes('id="productos"'));assert(!html.includes('Imagen próximamente')&&!html.includes('Precio por confirmar'));assert(html.includes('Físico'));
 for(const p of games)assert(html.includes(encodeURIComponent('Hola FOX GAMER, me interesa '+p.name+' en formato físico, condición '+p.condition)));
});
