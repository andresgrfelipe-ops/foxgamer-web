import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateStore} from './catalog.mjs';
const store=validateStore(JSON.parse(await readFile('data/store.json','utf8')));
const hashes=new Map();
for(const p of store.products.filter(p=>p.image)){
 const bytes=await readFile('.'+p.image);
 const hash=createHash('sha256').update(bytes).digest('hex');
 if(hashes.has(hash)&&hashes.get(hash)!==p.name)throw new Error('Foto duplicada entre modelos: '+p.name);
 hashes.set(hash,p.name);
}
console.log(JSON.stringify({products:store.products.length,verified:store.products.filter(p=>p.image).length,pending:store.products.filter(p=>!p.image).length,uniqueVerifiedPhotos:hashes.size}));
