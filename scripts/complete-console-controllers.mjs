import fs from 'node:fs';
import crypto from 'node:crypto';

const path = 'data/store.json';
const store = JSON.parse(fs.readFileSync(path, 'utf8'));
const items = [
  {
    name: 'Control Sony DualShock 2 original para PS2', slug: 'control-sony-dualshock-2-original-ps2', brand: 'PlayStation',
    prices: {Nuevo: 134000, Exhibición: 104000, Usado: 89000}, image: '/assets/photos/official/dualshock-2-black.jpg',
    description: 'Control alámbrico Sony DualShock 2 SCPH-10010 con vibración, sticks analógicos y botones sensibles a la presión.',
    compatibility: 'Compatible con PlayStation 2. Algunos juegos de PS1 admiten funciones limitadas.',
    sourceUrl: 'https://dualitygames.de/Sony-PlayStation-2-Original-Controller-DualShock-2-SCPH-10010-Schwarz',
    sourceImageUrl: 'https://dualitygames.de/media/image/product/711/lg/sony-playstation-2-original-controller-dualshock-2-scph-10010-schwarz.jpg',
    evidence: 'Fotografía comercial del modelo exacto Sony DualShock 2 SCPH-10010.',
    market: 'Referencia colombiana reacondicionada: $149.000 COP; precios por condición ajustados para FOX GAMER.'
  },
  {
    name: 'Control Sony DualShock 3 original para PS3', slug: 'control-sony-dualshock-3-original-ps3', brand: 'PlayStation',
    prices: {Nuevo: 144000, Exhibición: 114000, Usado: 99000}, image: '/assets/photos/official/dualshock-3-black.jpg',
    description: 'Control inalámbrico Sony DualShock 3 con SIXAXIS, vibración, Bluetooth y batería recargable.',
    compatibility: 'Compatible con PlayStation 3; carga y sincronización mediante cable Mini-USB compatible.',
    sourceUrl: 'https://cavegamers.com/products/used-playstation-3-dualshock-wireless-controller-black-ps3-video-game-accessories',
    sourceImageUrl: 'https://cavegamers.com/cdn/shop/files/4973_1.jpg?v=1750867273',
    evidence: 'Fotografía comercial del modelo exacto Sony DualShock 3 negro.',
    market: 'Referencia colombiana original: $160.800 COP; precios por condición ajustados para FOX GAMER.'
  },
  {
    name: 'Control Sony DualShock 4 original para PS4', slug: 'control-sony-dualshock-4-original-ps4', brand: 'PlayStation',
    prices: {Nuevo: 125000, Exhibición: 115000, Usado: 109000}, image: '/assets/photos/official/dualshock-4-black.jpg',
    description: 'Control inalámbrico Sony DualShock 4 de segunda generación con panel táctil, barra de luz, altavoz y conector de 3,5 mm.',
    compatibility: 'Compatible con PS4, PS4 Slim, PS4 Pro y PC en juegos compatibles.',
    sourceUrl: 'https://www.dealbuy.co.il/p/שלט_מקורי_אלחוטי_Sony_Playstation_4_PS4_סוני',
    sourceImageUrl: 'https://cdn.cashcow.co.il/images/a58e1460-6397-40a8-86ca-39a524ecb66f.jpg',
    evidence: 'Fotografía comercial del empaque y control Sony DualShock 4 original negro.',
    market: 'Referencia colombiana: $139.800 COP; precio nuevo calculado más de 10% por debajo.'
  },
  {
    name: 'Control inalámbrico original Xbox 360', slug: 'control-inalambrico-original-xbox-360', brand: 'Xbox',
    prices: {Nuevo: 116000, Exhibición: 106000, Usado: 99000}, image: '/assets/photos/official/xbox-360-wireless.jpg',
    description: 'Control inalámbrico Microsoft Xbox 360 con vibración, botón Guide y alimentación mediante baterías AA o kit recargable compatible.',
    compatibility: 'Compatible con Xbox 360. Para PC requiere receptor inalámbrico Xbox 360 compatible.',
    sourceUrl: 'https://www.electrostudio.gr/product/Microsoft_Xeiristirio_paixnidion_Xbox_360_Wireless_Controller_Mayro_NSF-00002',
    sourceImageUrl: 'https://www.electrostudio.gr/image/cache/catalog/migrationpics/22231-800x800.jpg',
    evidence: 'Fotografía comercial del control inalámbrico Microsoft Xbox 360 negro.',
    market: 'Referencia colombiana: $129.890 COP; precio nuevo calculado más de 10% por debajo.'
  },
  {
    name: 'Control inalámbrico original Xbox One', slug: 'control-inalambrico-original-xbox-one', brand: 'Xbox',
    prices: {Nuevo: 287000, Exhibición: 200000, Usado: 112000}, image: '/assets/photos/official/xbox-one-wireless.jpg',
    description: 'Control inalámbrico Microsoft Xbox One modelo 1697 con gatillos de impulso y conector para audífonos de 3,5 mm.',
    compatibility: 'Compatible con Xbox One, Xbox One S, Xbox One X y PC mediante cable o adaptador compatible.',
    sourceUrl: 'https://www.kaufland.de/product/315121965/',
    sourceImageUrl: 'https://media.cdn.kaufland.de/product-images/1024x1024/5a3bf8db76bc782841f79bff22be909a.jpg',
    evidence: 'Fotografía comercial del control inalámbrico Microsoft Xbox One negro.',
    market: 'Referencias colombianas: $319.900 COP nuevo compatible y $125.000 COP usado; precios FOX GAMER reducidos.'
  },
  {
    name: 'Control Nintendo Switch 2 Pro', slug: 'control-nintendo-switch-2-pro', brand: 'Nintendo',
    prices: {Nuevo: 324000, Exhibición: 274000, Usado: 224000}, image: '/assets/photos/official/nintendo-switch-2-pro.png',
    description: 'Control Pro oficial para Nintendo Switch 2 con vibración HD 2, botones GL/GR, botón C, NFC y conector de audio de 3,5 mm.',
    compatibility: 'Compatible con Nintendo Switch 2. Confirma en cada juego las funciones de vibración, movimiento y GameChat.',
    sourceUrl: 'https://store.nintendo.co.za/products/nintendo-switch-2-pro-controller',
    sourceImageUrl: 'https://store.nintendo.co.za/cdn/shop/files/NintendoSwitch2-ProController-03_1918x1918.png?v=1743698406',
    evidence: 'Fotografía oficial de distribuidor Nintendo del Switch 2 Pro Controller.',
    market: 'Mejor referencia encontrada en Colombia: $360.000 COP; precio nuevo calculado 10% por debajo.'
  },
  {
    name: 'Par de controles Nintendo Joy-Con 2 azul y rojo claro', slug: 'controles-nintendo-joy-con-2-azul-rojo-claro', brand: 'Nintendo',
    prices: {Nuevo: 271000, Exhibición: 221000, Usado: 171000}, image: '/assets/photos/official/nintendo-joycon-2.jpg',
    description: 'Par oficial Joy-Con 2 izquierdo y derecho con conexión magnética, vibración HD 2, controles de movimiento, botón C y función de mouse.',
    compatibility: 'Compatible exclusivamente con Nintendo Switch 2.',
    sourceUrl: 'https://www.walmart.ca/en/ip/Joy-Con-2-L-R-Light-Blue-Light-Red/5DP43HZ497J9',
    sourceImageUrl: 'https://i5.walmartimages.com/asr/524b66fa-cc0a-4f0d-b4d7-f07b5b5851da.260a4a22811b5c7f31dfb1c109f105d7.jpeg?odnBg=FFFFFF&odnHeight=2000&odnWidth=2000',
    evidence: 'Fotografía comercial del par oficial Joy-Con 2 azul y rojo claro con correas.',
    market: 'Referencia internacional oficial equivalente cercana a $302.000 COP; precio nuevo calculado 10% por debajo.'
  }
];

const suffix = {Nuevo: 'nuevo', Exhibición: 'exhibicion', Usado: 'usado'};
const existing = new Set(store.products.map(p => `${p.name}|${p.condition}`));
for (const item of items) {
  for (const condition of ['Nuevo', 'Exhibición', 'Usado']) {
    if (existing.has(`${item.name}|${condition}`)) continue;
    store.products.push({
      slug: `${item.slug}-${suffix[condition]}`,
      name: item.name,
      description: `${item.description} ${item.market}`,
      category: 'accesorios', brand: item.brand, condition,
      price: item.prices[condition], availability: 'inquiry',
      conditionNotes: condition === 'Nuevo'
        ? 'Producto nuevo; confirma autenticidad, empaque, color y garantía.'
        : condition === 'Exhibición'
          ? 'Unidad de exhibición; confirma estado estético, batería, sticks, botones y gatillos.'
          : 'Unidad usada; confirma desgaste, drift, batería, botones, gatillos y funcionamiento.',
      includes: 'Confirma cable, baterías, receptor, correas y demás accesorios incluidos según el modelo.',
      warranty: 'Confirma garantía y condiciones con FOX GAMER.',
      image: item.image, importedCatalog: false, compatibility: item.compatibility
    });
  }
  if (!store.verifiedImages.some(v => v.name === item.name)) {
    const local = item.image.replace(/^\//, '');
    store.verifiedImages.push({
      name: item.name, image: item.image, kind: 'original-photo',
      manufacturer: item.brand, sourceModel: item.name,
      sourceUrl: item.sourceUrl, sourceImageUrl: item.sourceImageUrl,
      reviewedAt: '2026-09-20', evidence: item.evidence,
      sha256: crypto.createHash('sha256').update(fs.readFileSync(local)).digest('hex')
    });
  }
}
fs.writeFileSync(path, `${JSON.stringify(store, null, 2)}\n`);
console.log(`Added ${items.length} controller models in three conditions.`);
