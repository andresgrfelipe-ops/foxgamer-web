import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync('assets/game-directory.js','utf8');
async function boot(fail=false){
 const node=()=>({value:'',children:[],events:{},dataset:{whatsapp:'573237267448'},append(...x){this.children.push(...x);},replaceChildren(){this.children=[];},addEventListener(k,f){this.events[k]=f;},setAttribute(k,v){this[k]=v;},focus(){this.focused=true;},scrollIntoView(){}});
 const names=['.games-directory','#games-search','#game-title','#game-platform','#games-results','#games-count','#games-pagination','#games-prev','#games-next','#games-page','#games-sources'];const nodes=Object.fromEntries(names.map(n=>[n,node()]));
 const games=Array.from({length:55},(_,i)=>({title:i===0?'Grand Theft Auto: San Andreas':i===1?'<script>test</script>':'Juego '+i,platform:i%2?'PS3':'PS2'}));
 vm.runInNewContext(source,{document:{querySelector:k=>nodes[k],createElement:node},setTimeout:f=>f(),clearTimeout(){},encodeURIComponent,decodeURIComponent,fetch:async()=>({ok:!fail,json:async()=>({games,sources:[]})})});
 await new Promise(resolve=>setImmediate(resolve));return nodes;
}
test('directorio: paginación limitada, plataforma, abreviaturas y consulta exacta',async()=>{
 const n=await boot();assert.equal(n['#games-results'].children.length,24);
 assert.equal(n['#games-results'].children[1].children[1].textContent,'<script>test</script>');
 n['#games-next'].events.click();assert.match(n['#games-page'].textContent,/2 de 3/);
 n['#game-platform'].value='PS3';n['#game-platform'].events.change();assert(n['#games-results'].children.every(c=>c.children[0].textContent==='PS3'));
 n['#game-platform'].value='PS2';n['#game-title'].value='GTA';n['#games-search'].events.submit({preventDefault(){}});
 assert.equal(n['#games-results'].children.length,1);assert.match(decodeURIComponent(n['#games-results'].children[0].children[2].href),/San Andreas para PS2/);
 n['#games-search'].events.reset();assert.equal(n['#games-results'].children.length,24);
});
test('directorio: fallo de carga conserva una salida útil',async()=>{const n=await boot(true);assert.match(n['#games-count'].textContent,/no pudo cargar/);});
test('directorio: cinco plataformas, títulos únicos y referencias clásicas correctas',()=>{
 const d=JSON.parse(fs.readFileSync('data/game-directory.json'));assert.deepEqual([...new Set(d.games.map(g=>g.platform))].sort(),['PS2','PS3','PS4','PS5','Xbox 360']);
 assert.equal(new Set(d.games.map(g=>g.platform+'|'+g.title.toLowerCase())).size,d.games.length);
 for(const [title,platform] of [['Halo 3','Xbox 360'],['God of War II','PS2'],['God of War III','PS3'],['Astro Bot','PS5']])assert(d.games.some(g=>g.title===title&&g.platform===platform));
 assert(d.games.every(g=>d.sources[g.source]&&g.title.length>0&&!g.price&&!g.availability));
});
