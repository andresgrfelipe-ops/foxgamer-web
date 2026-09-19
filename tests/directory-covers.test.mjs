import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {createHash} from 'node:crypto';
const data=JSON.parse(fs.readFileSync('data/game-directory.json')),ctx={URL};vm.runInNewContext(fs.readFileSync('assets/full-game-model.js','utf8'),ctx);const {validCover,mergeEntries,selectEntries}=ctx.FoxGameDirectory;
test('portadas conservan título y plataforma, procedencia y archivos locales íntegros',()=>{
 const local=data.games.filter(g=>g.cover?.kind==='reference-cover');assert.equal(local.length,16);
 for(const g of data.games.filter(g=>g.cover)){assert(validCover(g),g.title+' '+g.platform);assert.match(g.cover.sha256,/^[a-f0-9]{64}$/);if(g.cover.kind==='reference-cover')assert.equal(createHash('sha256').update(fs.readFileSync('.'+g.cover.image)).digest('hex'),g.cover.sha256);assert.equal(g.availability,undefined);}
 assert(data.games.filter(g=>g.cover).length>5000);
});
test('rechaza portada de otra plataforma, título o dominio y hash inválido',()=>{
 const g=data.games.find(g=>g.cover?.provider==='gametdb');assert(g);assert(!validCover({...g,platform:'PS5'}));assert(!validCover({...g,title:g.title+' Remastered'}));assert(!validCover({...g,cover:{...g.cover,image:'https://example.com/cover.jpg'}}));assert(!validCover({...g,cover:{...g.cover,sha256:'z'.repeat(64)}}));
});
test('precios de nuevas fichas: físico, oferta colombiana comparable, 10% menos y sin inventar existencias',()=>{
 const priced=data.games.filter(g=>g.offers?.length);assert(priced.length>150);for(const g of priced){assert(validCover(g));for(const o of g.offers){assert.equal(o.title,g.title);assert.equal(o.platform,g.platform);assert.equal(o.currency,'COP');assert.equal(o.format,'Físico');assert.match(o.sourceUrl,/^https:\/\/gamer4ever\.com\.co\/products\//);assert.equal(o.price,Math.floor(o.referencePrice*.9/1000)*1000);assert(o.price>0);assert.equal(g.availability,undefined);}}
 const g=priced[0],all=mergeEntries([], [g]);assert.equal(selectEntries(all,{condition:g.offers[0].condition})[0].variant.price,g.offers[0].price);const original={title:g.title,platform:g.platform,variants:[{price:123456,condition:'Nuevo'}]};assert.equal(mergeEntries([original],[g])[0],original);
});
