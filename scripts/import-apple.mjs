import {readFile,writeFile} from 'node:fs/promises';
const path='data/store.json',store=JSON.parse(await readFile(path,'utf8'));
const apple=[
 {slug:'iphone-17-256gb',name:'iPhone 17 256 GB',price:4599000,description:'iPhone 17 de 256 GB, 5G, pantalla Super Retina XDR y cámara Fusion. Precio competitivo sugerido para FOX GAMER.',image:'https://cdn.dam.alkosto.com/products/195950644081/195950644081-001.webp/iphone17-256gb-5g-morado-lavanda?w=900'},
 {slug:'ipad-air-m3-13-256gb',name:'iPad Air 13 pulgadas M3 256 GB',price:4899000,description:'iPad Air de 13 pulgadas con chip M3 y 256 GB Wi‑Fi. Precio competitivo sugerido para FOX GAMER.',image:'https://mac-center.com/cdn/shop/files/IMG-16741486_8189cf43-17ed-45cd-a2ea-0f49efbfcc1b.jpg?crop=center&height=900&v=1741104650&width=900'},
 {slug:'macbook-air-m5-13-512gb',name:'MacBook Air 13 pulgadas M5 512 GB',price:6899000,description:'MacBook Air de 13 pulgadas con chip M5, 16 GB y 512 GB SSD. Precio competitivo sugerido para FOX GAMER.',image:'https://co.tiendasishop.com/cdn/shop/files/IMG-19266131_m_jpeg_1_a75eba0b-8681-4e13-be43-f3104905bc5a_1500x.jpg?v=1772750860'}
];
const products=[];
for(const p of apple) for(const [condition,discount,suffix,note] of [['Nuevo',0,'nuevo','Producto nuevo con precio competitivo sugerido.'],['Exhibición',150000,'exhibicion','Unidad de exhibición; confirma señales y accesorios antes de comprar.'],['Usado',200000,'usado','Unidad usada; confirma batería, estado y garantía antes de comprar.']]) products.push({slug:`${p.slug}-${suffix}`,name:p.name,description:p.description,category:'apple',brand:'Apple',condition,price:p.price-discount,availability:'inquiry',conditionNotes:note,includes:'Confirma contenido incluido con FOX GAMER.',warranty:'Confirma garantía y condiciones con FOX GAMER.',image:p.image,marketSource:'Precio comparado con referencias públicas colombianas consultadas en septiembre de 2026.'});
store.products=[...store.products.filter(p=>!p.marketSource),...products];
await writeFile(path,JSON.stringify(store,null,2)+'\n');
console.log(`Imported ${products.length} Apple variants.`);
