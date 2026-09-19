import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, readFile, access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import {validateStore} from '../scripts/catalog.mjs';
import {auditImages} from '../scripts/audit-images.mjs';
const base=JSON.parse(await readFile('data/store.json','utf8'));
test('las referencias sin foto no afirman una identificación fotográfica',()=>{
  for(const p of base.products.filter(p=>!p.image)) {
    assert.doesNotMatch(p.description,/identificada en foto real|Imagen correspondiente a la familia/i,p.slug);
  }
});
const bytes=Buffer.from([255,216,255,224,1,2,3,4]);
const hash=createHash('sha256').update(bytes).digest('hex');
const product={...base.products[0],image:'/assets/photos/test.jpg'};
const proof={name:product.name,image:product.image,evidence:'Fixture de prueba, no inventario real',sha256:hash};
const fixture=()=>({...base,products:[{...product}],verifiedImages:[{...proof}]});
async function directory(){const root=await mkdtemp(path.join(os.tmpdir(),'fox-image-test-'));await mkdir(path.join(root,'assets/photos'),{recursive:true});await writeFile(path.join(root,'assets/photos/test.jpg'),bytes);return root;}

test('auditoría verifica el catálogo actual y conserva los pendientes',async()=>{
  const result=await auditImages(base);
  assert.equal(result.products,base.products.length);
  assert.equal(result.pending,base.products.filter(p=>!p.image).length);
});
test('registro exige evidencia, huella y ruta local; rechaza asignación a otro modelo',()=>{
  for(const update of [{sha256:''},{evidence:' '},{image:'https://example.com/photo.jpg'},{image:'/assets/../photo.jpg'}]) {
    const store=fixture();store.verifiedImages[0]={...proof,...update};assert.throws(()=>validateStore(store));
  }
  const store=fixture();store.products[0].name='Otro modelo';assert.throws(()=>validateStore(store),/verificación exacta/);
});
test('un mismo archivo no puede registrarse como dos modelos',()=>{
  const store=fixture();store.verifiedImages.push({...proof,name:'Otro modelo'});
  assert.throws(()=>validateStore(store),/duplicada/);
});
test('auditoría detecta foto sustituida, archivo ausente y copias con otro nombre',async()=>{
  const root=await directory();const store=fixture();await auditImages(store,root);
  await writeFile(path.join(root,'assets/photos/test.jpg'),Buffer.from('alterada'));
  await assert.rejects(()=>auditImages(store,root),/modificada/);
  await writeFile(path.join(root,'assets/photos/test.jpg'),bytes);
  store.products.push({...product,slug:'otra-referencia',name:'Otro modelo',image:'/assets/photos/copia.jpg'});
  store.verifiedImages.push({...proof,name:'Otro modelo',image:'/assets/photos/copia.jpg'});
  await assert.rejects(()=>auditImages(store,root),/ENOENT/);
  await writeFile(path.join(root,'assets/photos/copia.jpg'),bytes);
  await assert.rejects(()=>auditImages(store,root),/duplicada/);
});
test('el build falla antes de escribir HTML si una foto deja de estar verificada',async()=>{
  const root=await directory();await mkdir(path.join(root,'data'));
  await writeFile(path.join(root,'data/store.json'),JSON.stringify(fixture()));
  await writeFile(path.join(root,'assets/photos/test.jpg'),Buffer.from('imagen alterada'));
  assert.throws(()=>execFileSync(process.execPath,[path.resolve('scripts/build.mjs')],{cwd:root,stdio:'pipe'}),/modificada/);
  await assert.rejects(()=>access(path.join(root,'index.html')));
});
test('un archivo de texto renombrado como foto no pasa aunque su huella coincida',async()=>{
  const root=await directory(),store=fixture(),invalid=Buffer.from('no es una imagen');
  await writeFile(path.join(root,'assets/photos/test.jpg'),invalid);
  store.verifiedImages[0].sha256=createHash('sha256').update(invalid).digest('hex');
  await assert.rejects(()=>auditImages(store,root),/Formato/);
});
