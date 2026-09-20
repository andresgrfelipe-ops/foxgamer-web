import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {validateStore,whatsappURL,escapeHTML} from '../scripts/catalog.mjs';
const base=JSON.parse(await readFile('data/store.json','utf8'));
const product={slug:'unidad-prueba',name:'Consola de prueba <especial>',description:'Solo fixture de pruebas',category:'consolas',brand:'Prueba',condition:'Usado',price:850000,availability:'available',conditionNotes:'Señales visibles de uso',includes:'Control y cable',warranty:'Condición de prueba'};
test('rechaza productos ambiguos y precios inválidos',()=>{
 for(const change of [{condition:''},{price:-1},{price:1.5},{availability:'yes'},{warranty:''},{slug:'../escape'},{image:'https://example.com/x.png'}]){
  assert.throws(()=>validateStore({...base,products:[{...product,...change}]}));
 }
 assert.throws(()=>validateStore({...base,products:[product,product]}));
 assert.doesNotThrow(()=>validateStore({...base,products:[product]}));
});
test('WhatsApp exige un número y escapa el mensaje',()=>{
 assert.equal(whatsappURL('','hola'),null);
 assert.equal(new URL(whatsappURL('573000000000','A & B?')).searchParams.get('text'),'A & B?');
 assert.throws(()=>validateStore({...base,whatsapp:'+57 300'}));
 assert.equal(escapeHTML('<img onerror="x">'),'&lt;img onerror=&quot;x&quot;&gt;');
});
test('build completo con las tres condiciones y disponibilidad real',async()=>{
 const tmp=await mkdtemp(path.join(os.tmpdir(),'fox-catalog-'));
 await mkdir(path.join(tmp,'productos'));
 await mkdir(path.join(tmp,'data'));
 const fixture={...base,whatsapp:'573000000000',products:[
 product,
 {...product,slug:'prueba-nuevo',name:'Equipo nuevo',condition:'Nuevo',price:null,availability:'inquiry'},
 {...product,slug:'prueba-exhibicion',name:'Equipo de exhibición',condition:'Exhibición',price:650000,availability:'soldout'}
 ]};
 await writeFile(path.join(tmp,'data/store.json'),JSON.stringify(fixture));
 execFileSync(process.execPath,[path.resolve('scripts/build.mjs')],{cwd:tmp});
 const home=await readFile(path.join(tmp,'index.html'),'utf8');
 assert.match(home,/Consola de prueba &lt;especial&gt;/);
 for(const condition of ['Nuevo','Usado','Exhibición'])assert.ok(home.includes('data-condition="'+condition+'"'));
 const detail=await readFile(path.join(tmp,'productos/unidad-prueba/index.html'),'utf8');
 const schema=JSON.parse(detail.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 assert.equal(schema.offers.price,850000);
 assert.equal(schema.offers.availability,'https://schema.org/InStock');
 assert.ok(detail.includes('wa.me/573000000000'));
 const unavailable=await readFile(path.join(tmp,'productos/prueba-exhibicion/index.html'),'utf8');
 assert.ok(unavailable.includes('Esta unidad no está disponible'));
 assert.ok(!unavailable.includes('Consultar este producto'));
 const inquiry=await readFile(path.join(tmp,'productos/prueba-nuevo/index.html'),'utf8');
 const inquirySchema=JSON.parse(inquiry.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 assert.ok(!inquirySchema.offers);
 assert.ok(inquiry.includes('Precio por confirmar'));
 const sitemap=await readFile(path.join(tmp,'sitemap.xml'),'utf8');
 assert.ok(sitemap.includes('https://foxgamer.co/productos/unidad-prueba/'));
});
test('todas las rutas internas y anclas públicas existen',async()=>{
 const pages=['index.html','404.html','como-comprar/index.html',...base.categories.map(c=>'categorias/'+c.slug+'/index.html'),...base.products.map(p=>'productos/'+p.slug+'/index.html')];
 for(const page of pages){
  const html=await readFile(page,'utf8');
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
  assert.ok(html.includes('rel="canonical"'));
  for(const [,href]of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   if(!href.startsWith('/')&&!href.startsWith('#'))continue;
   const [pathname,hash]=href.split('#');
   let target=pathname?pathname.slice(1):page;
   if(!target||target.endsWith('/'))target+='index.html';
   const content=await readFile(target,'utf8');
   if(hash)assert.ok(content.includes('id="'+hash+'"'),'Missing '+href+' in '+page);
  }
 }
});

test('guía de compra, SEO y contacto móvil se generan sin procesar pagos',async()=>{
 const home=await readFile('index.html','utf8');
 const guide=await readFile('como-comprar/index.html','utf8');
 assert.ok(home.includes('id="como-comprar"'));
 assert.ok(guide.includes('Confirma estos cinco datos'));
 assert.ok(guide.includes('Este sitio no solicita información bancaria ni procesa pagos en línea'));
 assert.ok(guide.includes('class="floating-whatsapp"'));
 assert.ok(home.includes('SearchAction'));
 assert.ok((await readFile('sitemap.xml','utf8')).includes('/como-comprar/'));
});

test('ninguna fotografía se publica sin correspondencia exacta documentada',()=>{
 assert.doesNotThrow(()=>validateStore(base));
 assert.throws(()=>validateStore({...base,products:[{...product,image:'/assets/photos/img_2452.webp'}]}),/verificación exacta/);
 const verified=base.products.find(p=>p.image);
 assert.throws(()=>validateStore({...base,products:[{...verified,name:'Otro modelo'}]}),/verificación exacta/);
});
test('referencias ilustradas muestran aviso y conservan consultas exactas',async()=>{
 const html=await readFile('index.html','utf8');
 assert.ok(html.includes('Imagen referencial · confirma el modelo'));
 assert.ok(html.indexOf('id="productos"')<html.indexOf('id="gallery-title"'));
 const p=base.products.find(p=>base.verifiedImages.some(v=>v.name===p.name&&v.image===p.image&&v.kind==='illustration'));
 const detail=await readFile('productos/'+p.slug+'/index.html','utf8');
 const schema=JSON.parse(detail.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 assert.ok(schema.image);
 assert.ok(detail.includes('Imagen ilustrativa, no corresponde a una unidad específica'));
 assert.ok(html.includes(encodeURIComponent(p.name+' ('+p.condition+'). '+base.url+'/productos/'+p.slug+'/')));
});
