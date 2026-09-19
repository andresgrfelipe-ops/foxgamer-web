import {readFile,writeFile} from 'node:fs/promises';
const path='data/store.json',store=JSON.parse(await readFile(path,'utf8'));
for(const c of store.categories){
 if(c.slug==='apple')c.description='iPhone, iPad y Mac con configuración, capacidad y condición visibles. Consulta garantía y disponibilidad.';
 if(c.slug==='videojuegos')c.description='Juegos físicos de PlayStation 5, PlayStation 4 y Nintendo Switch, con plataforma y condición visibles.';
}
for(const p of store.products){
 if(p.category==='apple')p.description=p.description.replace('Consulta precio, disponibilidad y detalles de la unidad por WhatsApp.','Confirma capacidad, color, garantía, disponibilidad y precio final por WhatsApp.');
 if(p.category==='videojuegos')p.description=p.description.replace('Consulta precio, disponibilidad y contenido con FOX GAMER.','Confirma plataforma, edición, idioma, estado del disco, caja, precio y disponibilidad con FOX GAMER.');
}
await writeFile(path,JSON.stringify(store,null,2)+'\n');
console.log('Apple and videogame category copy improved.');
