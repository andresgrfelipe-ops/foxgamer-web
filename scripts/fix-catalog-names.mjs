import {readFile,writeFile} from 'node:fs/promises';
const path='data/store.json';const store=JSON.parse(await readFile(path,'utf8'));
const names={
 'playstation-4-slim-1tb':'PlayStation 4 Slim 1 Tera','playstation-4-pro-1tb':'PlayStation 4 Pro 1 Tera',
 'xbox-series-s':'Xbox Serie S','xbox-series-s-1tb':'Xbox Serie S 1 Tera','xbox-series-x-disco':'Xbox Serie X Disco',
 'playstation-5-fat-825gb-1550':'PlayStation 5 Fat 825GB','playstation-5-fat-825gb-1600':'PlayStation 5 Fat 825GB',
 'playstation-5-digital':'PlayStation 5 Digital','playstation-5-slim':'PlayStation 5 Slim','playstation-5-pro-2tb':'PlayStation 5 Pro 2 Teras',
 'meta-quest-3s':'Meta Quest 3S','vr2':'VR2','g29':'G29','monitores':'Monitores','diademas':'Diademas','controles-ps5':'Controles Ps5'
};
for(const p of store.products){for(const [slug,name] of Object.entries(names))if(p.slug.startsWith(slug+'-'))p.name=name;}
await writeFile(path,JSON.stringify(store,null,2)+'\n');console.log('Catalog names synchronized with WhatsApp.');
