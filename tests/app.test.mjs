import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const modelSource = await readFile('assets/catalog-model.js', 'utf8');
const appSource = await readFile('assets/app.js', 'utf8');

function boot({query = '', defaultCategory = '', size = 55} = {}) {
  const element = (value = '') => ({value, hidden: false, disabled: false, dataset: {}, handlers: {}, attrs: {}, options: [],
    classList: {add(){}, remove(){}, toggle(){}}, contains(target){return target === this;},
    addEventListener(k, fn){this.handlers[k] = fn;}, getAttribute(k){return this.attrs[k];}, setAttribute(k,v){this.attrs[k] = v;},
    focus(){this.focused = true;}});
  const nodes = {};
  for (const key of ['.filters','#search','#category','#condition','#availability','#sort','#product-grid','#empty-state',
    '#result-count','#filter-summary','#reset-filters','#empty-reset','#load-more','.menu-toggle','#nav-links']) nodes[key] = element();
  const setOptions = (key, values) => {nodes[key].options = values.map(([value,textContent]) => ({value,textContent}));};
  setOptions('#category', [['','Todas'],['consolas','Consolas'],['apple','Apple']]);
  setOptions('#condition', [['','Todas'],['Nuevo','Nuevo'],['Usado','Usado'],['Exhibición','Exhibición']]);
  setOptions('#availability', [['','Todos'],['available','Disponible'],['inquiry','Por confirmar'],['soldout','Agotado']]);
  setOptions('#sort', ['featured','price-asc','price-desc','name'].map(s => [s,s]));
  nodes['#category'].value = defaultCategory;
  const items = Array.from({length: size}, (_,i) => {
    const item = element();
    item.dataset = {title: i === 1 ? 'PlayStation 5 edición Slim' : 'Consola '+i,
      name: i === 1 ? 'PlayStation 5 edición Slim' : 'Consola '+i, category:'consolas',
      condition:i%2 ? 'Usado' : 'Nuevo', availability:i%2 ? 'inquiry' : 'available', price:i === size-1 ? '' : String(1000-i)};
    item.link = element();item.querySelector = () => item.link;
    return item;
  });
  nodes['#product-grid'].querySelectorAll = () => items;
  let order = [...items];
  nodes['#product-grid'].append = item => {order = order.filter(x => x !== item);order.push(item);};
  const docEvents = {}, winEvents = {};
  const media = element();
  let url = '', timer;
  const context = {Intl, URLSearchParams, document:{documentElement:{classList:{add(){}}},querySelector:s=>nodes[s]||null,
    querySelectorAll:()=>[],addEventListener:(k,fn)=>docEvents[k]=fn},
    window:{addEventListener:(k,fn)=>winEvents[k]=fn,matchMedia:()=>media},
    location:{search:query,pathname:defaultCategory?'/categorias/'+defaultCategory+'/':'/',hash:'#productos'},
    history:{replaceState(a,b,c){url=c;}},setTimeout:fn=>{timer=fn;return 1;},clearTimeout:()=>{timer=null;}};
  vm.runInNewContext(modelSource+'\n'+appSource,context);
  return {nodes, items, context, docEvents, winEvents, media, order:()=>order, url:()=>url,
    input:value=>{nodes['#search'].value=value;nodes['#search'].handlers.input();timer?.();},
    change:(key,value)=>{nodes[key].value=value;nodes[key].handlers.change();}};
}

test('paginación: 24 resultados, cargar más, foco y todos los registros accesibles', () => {
  const b=boot();
  assert.equal(b.items.filter(p=>!p.hidden).length,24);
  assert.equal(b.nodes['#result-count'].textContent,'Mostrando 24 de 55 productos');
  b.nodes['#load-more'].handlers.click();
  assert.equal(b.items.filter(p=>!p.hidden).length,48);assert.ok(b.items[24].link.focused);
  b.nodes['#load-more'].handlers.click();
  assert.equal(b.items.filter(p=>!p.hidden).length,55);assert.equal(b.nodes['#load-more'].hidden,true);
});
test('buscar por palabras, acentos y abreviatura PS5; estado vacío recuperable', () => {
  const b=boot();b.input('PS5 SLIM edicion');
  assert.equal(b.nodes['#result-count'].textContent,'Mostrando 1 de 1 producto');
  assert.equal(b.items[1].hidden,false);assert.ok(b.url().includes('q=PS5+SLIM+edicion'));
  b.input('<script>no existe</script>');assert.equal(b.nodes['#empty-state'].hidden,false);
  assert.ok(b.nodes['#filter-summary'].textContent.includes('<script>'));
  b.nodes['#empty-reset'].handlers.click();assert.equal(b.items.filter(p=>!p.hidden).length,24);
  assert.ok(b.nodes['#search'].focused);assert.ok(b.nodes['#reset-filters'].disabled);
});
test('condición y disponibilidad se combinan sin inventar stock', () => {
  const b=boot();b.change('#condition','Usado');b.change('#availability','available');
  assert.equal(b.nodes['#result-count'].textContent,'0 productos');
  b.change('#availability','inquiry');assert.equal(b.nodes['#result-count'].textContent,'Mostrando 24 de 27 productos');
  assert.ok(b.url().includes('condicion=Usado'));assert.ok(b.url().includes('disponibilidad=inquiry'));
});
test('orden numérico, precio desconocido al final y vuelta a destacados', () => {
  const b=boot({size:4});b.change('#sort','price-asc');assert.deepEqual(b.order(),[b.items[2],b.items[1],b.items[0],b.items[3]]);
  b.change('#sort','price-desc');assert.equal(b.order().at(-1),b.items[3]);
  b.change('#sort','featured');assert.deepEqual(b.order(),b.items);
});
test('restaura URL válida y descarta opciones inválidas sin ocultar el catálogo', () => {
  const b=boot({query:'?q=PS5&condicion=Usado&disponibilidad=inquiry&orden=price-desc'});
  assert.equal(b.nodes['#result-count'].textContent,'Mostrando 1 de 1 producto');
  b.context.location.search='?categoria=inexistente&orden=mal';b.winEvents.popstate();
  assert.equal(b.nodes['#sort'].value,'featured');assert.equal(b.nodes['#category'].value,'');
  assert.equal(b.items.filter(p=>!p.hidden).length,24);
});
test('cambiar de categoría conserva búsqueda, condición, disponibilidad y orden', () => {
  const b=boot({defaultCategory:'consolas'});b.input('iPhone');b.change('#condition','Usado');b.change('#availability','inquiry');b.change('#sort','price-asc');b.change('#category','apple');
  assert.equal(b.context.location.href,'/categorias/apple/?q=iPhone&condicion=Usado&disponibilidad=inquiry&orden=price-asc#productos');
});
test('menú: Escape devuelve foco, y salida de foco/clic/resolución lo cierran', () => {
  const b=boot(), menu=b.nodes['.menu-toggle'];
  menu.handlers.click();assert.equal(menu.attrs['aria-expanded'],'true');
  b.docEvents.keydown({key:'Escape'});assert.equal(menu.attrs['aria-expanded'],'false');assert.ok(menu.focused);
  for(const action of [()=>b.docEvents.click({target:{}}),()=>b.docEvents.focusin({target:{}}),()=>b.media.handlers.change()]) {
    menu.handlers.click();action();assert.equal(menu.attrs['aria-expanded'],'false');
  }
});
test('una imagen rota se reemplaza por texto neutro, nunca por otra foto', () => {
  let replacement;
  const img={complete:true,naturalWidth:0,addEventListener(){},replaceWith(node){replacement=node;}};
  const context={document:{documentElement:{classList:{add(){}}},querySelector:()=>null,querySelectorAll:()=>[img],createElement:()=>({})}};
  vm.runInNewContext(appSource,context);
  assert.equal(replacement.textContent,'Imagen próximamente');assert.ok(!replacement.src);
});
