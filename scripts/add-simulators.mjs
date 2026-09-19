import fs from 'node:fs';
const p='data/store.json'; const d=JSON.parse(fs.readFileSync(p,'utf8'));
const bases=[
 {name:'Simulador de carreras Logitech G923',brand:'Logitech',price:1450000,image:'/assets/photos/img_2513.webp',description:'Volante con pedales para simulación de carreras en PlayStation, Xbox y PC. Confirma compatibilidad, contenido y disponibilidad por WhatsApp.'},
 {name:'Volante Logitech G920 con pedales',brand:'Logitech',price:1200000,image:'/assets/photos/img_2514.webp',description:'Volante y pedales para Xbox y PC. Confirma compatibilidad, estado y disponibilidad por WhatsApp.'},
 {name:'Volante Thrustmaster T300 RS GT',brand:'Thrustmaster',price:1850000,image:'/assets/photos/img_2515.webp',description:'Set de simulación con volante y pedales para PlayStation y PC. Confirma edición, accesorios y disponibilidad por WhatsApp.'},
 {name:'Soporte para volante y pedales',brand:'FOX GAMER',price:650000,image:'/assets/photos/img_2516.webp',description:'Soporte para montar tu estación de simulación. Confirma medidas, compatibilidad y disponibilidad por WhatsApp.'},
 {name:'Playseat Challenger simulación',brand:'Playseat',price:1350000,image:'/assets/photos/img_2517.webp',description:'Silla/estructura para simulador de carreras. Confirma color, ajustes, contenido y disponibilidad por WhatsApp.'},
 {name:'Kit simulador VR2 + juego',brand:'PlayStation',price:2400000,image:'/assets/photos/img_2518.webp',description:'Experiencia de realidad virtual para juegos compatibles. Confirma visor, accesorios, juego incluido y disponibilidad por WhatsApp.'}
];
const exists=new Set(d.products.map(x=>x.name+'|'+x.condition));
for(const b of bases){for(const [condition,price,note] of [['Nuevo',b.price,'Producto nuevo; confirma garantía y disponibilidad.'],['Exhibición',Math.max(0,b.price-150000),'Unidad de exhibición; confirma detalles estéticos y disponibilidad.'],['Usado',Math.max(0,b.price-200000),'Producto usado; confirma estado, accesorios y disponibilidad.']]){if(exists.has(b.name+'|'+condition)) continue; d.products.push({slug:(b.name+'-'+condition).toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),name:b.name,description:b.description,category:'accesorios',brand:b.brand,condition,price,availability:'inquiry',conditionNotes:note,includes:'Confirma contenido incluido con FOX GAMER.',warranty:'Confirma garantía y condiciones con FOX GAMER.',image:b.image,importedCatalog:false});}}
d.categories.find(x=>x.slug==='accesorios').description='Accesorios, simuladores, volantes, realidad virtual y periféricos para completar tu estación gamer. Consulta compatibilidad y disponibilidad.';
fs.writeFileSync(p,JSON.stringify(d,null,2)+'\\n');
console.log('added simulator variants',bases.length*3,'total',d.products.length);

