import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const ctx={URL};vm.runInNewContext(fs.readFileSync('assets/full-game-model.js','utf8'),ctx);const {mergeEntries,selectEntries}=ctx.FoxGameDirectory;
const known=[{title:'Grand Theft Auto V',platform:'PS5',rank:0,variants:[{condition:'Nuevo',price:100},{condition:'Usado',price:80}]},{title:'Elden Ring: Shadow of the Erdtree Edition',platform:'PS5',rank:1,variants:[{condition:'Nuevo',price:200}]}];
const directory=[{title:'Grand Theft Auto V',platform:'PS5'},{title:'Grand Theft Auto V',platform:'PS3'},{title:'Elden Ring',platform:'PS5'},{title:'Halo 3',platform:'Xbox 360'}];
test('catálogo completo conserva plataforma y edición; no atribuye foto o precio a otra versión',()=>{
 const all=mergeEntries(known,directory);assert.equal(all.length,5);assert.equal(all.filter(g=>g.title==='Grand Theft Auto V'&&g.platform==='PS5').length,1);
 assert.equal(all.find(g=>g.platform==='PS3').variants.length,0);assert.equal(all.find(g=>g.title==='Elden Ring').variants.length,0);
 assert.equal(selectEntries(all,{query:'GTA'}).length,2);assert.equal(selectEntries(all,{query:'GTA',platform:'PS3'})[0].variant,undefined);
 assert.equal(selectEntries(all,{verified:true}).length,2);assert.equal(selectEntries(all,{condition:'Usado'})[0].variant.price,80);
 for(const sort of ['price-asc','price-desc'])assert(selectEntries(all,{sort}).slice(-3).every(g=>!g.variant));
});
test('incluye todas las entradas del directorio real y conserva las 47 fichas comerciales',()=>{
 const store=JSON.parse(fs.readFileSync('data/store.json')),d=JSON.parse(fs.readFileSync('data/game-directory.json')),groups=new Map();
 for(const p of store.products.filter(p=>p.category==='videojuegos')){const [title,platform]=p.name.split(' · '),key=p.name;if(!groups.has(key))groups.set(key,{title,platform,variants:[]});groups.get(key).variants.push({condition:p.condition,price:p.price});}
 const all=mergeEntries([...groups.values()],d.games);assert(selectEntries(all,{verified:true}).length>=47);for(const original of groups.values()){const merged=all.find(g=>g.title===original.title&&g.platform===original.platform);assert.equal(merged,original);}assert(all.length>=d.games.length);
 const keys=new Set(all.map(e=>e.platform+'|'+ctx.FoxGameDirectory.normalize(e.title)));
 for(const g of d.games)assert(keys.has(g.platform+'|'+ctx.FoxGameDirectory.normalize(g.title)),g.title);
 assert.deepEqual([...new Set(all.map(g=>g.platform))].sort(),['PS2','PS3','PS4','PS5','Xbox 360']);
});
