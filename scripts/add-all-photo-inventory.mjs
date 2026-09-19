import {readFile,writeFile} from 'node:fs/promises';
import {readdir} from 'node:fs/promises';
const storePath='data/store.json';
const store=JSON.parse(await readFile(storePath,'utf8'));
const known=new Set((store.gallery||[]).map(p=>p.source));
const photos=(await readdir('assets/photos')).filter(n=>n.endsWith('.webp')&&!n.includes('-large'));
for(const file of photos){
 const source=file.replace(/\.webp$/i,'.jpg').toUpperCase();
 if(known.has(source))continue;
 const stem=file.replace(/\.webp$/i,'');
 store.gallery.push({title:`Producto por identificar · ${source}`,category:'accesorios',image:`/assets/photos/${file}`,large:`/assets/photos/${stem}-large.webp`,source});
}
await writeFile(storePath,JSON.stringify(store,null,2)+'\n');
console.log(`Added ${store.gallery.length} photo inventory entries.`);
