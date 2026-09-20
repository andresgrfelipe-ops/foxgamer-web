import fs from 'node:fs';
import crypto from 'node:crypto';

const storePath = 'data/store.json';
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

const controllers = [
  {
    name: 'Control Sony DualSense Edge para PS5', slug: 'control-sony-dualsense-edge-ps5', brand: 'PlayStation',
    price: 1080000, image: '/assets/photos/official/dualsense-edge.jpg',
    description: 'Control inalámbrico premium DualSense Edge con botones reasignables, gatillos ajustables, perfiles personalizados y piezas intercambiables.',
    compatibility: 'Compatible con PlayStation 5 y PC en juegos y funciones compatibles; confirma requisitos de software antes de comprar.',
    sourceUrl: 'https://www.zonatecno.com.uy/catalogo/joystick-inalambrico-sony-playstation-5-ds-edge-ps5-white_103004_103004',
    sourceImageUrl: 'https://f.fcdn.app/imgs/2f05ef/www.zonatecno.com.uy/zoteuy/3735/original/catalogo/103004_103004_1/2000-2000/joystick-inalambrico-sony-playstation-5-ds-edge-ps5-white-joystick-inalambrico-sony-playstation-5-ds-edge-ps5-white.jpg',
    evidence: 'Fotografía comercial del modelo exacto DualSense Edge blanco.', marketSource: 'Referencia pública en Colombia: $1.200.000 COP; precio FOX GAMER calculado 10% por debajo.'
  },
  {
    name: 'Control Xbox Elite Wireless Series 2', slug: 'control-xbox-elite-wireless-series-2', brand: 'Xbox',
    price: 720000, image: '/assets/photos/official/xbox-elite-series-2.png',
    description: 'Control premium Xbox Elite Wireless Series 2 con tensión ajustable, bloqueos de gatillo, empuñadura de goma y perfiles personalizables.',
    compatibility: 'Compatible con Xbox Series X|S, Xbox One y PC con Windows; confirma conectividad y accesorios incluidos.',
    sourceUrl: 'https://www.xbox.com/en-US/consoles/help-me-choose',
    sourceImageUrl: 'https://assets.xboxservices.com/assets/52/2f/522f2ec1-14ad-42a0-8378-c2b8312aaddb.png?n=XBX_HMC_D_Results1_Controller.png',
    evidence: 'Fotografía oficial de Xbox del Elite Wireless Controller Series 2.', marketSource: 'Referencia pública en Colombia: $801.000 COP; precio FOX GAMER calculado 10% por debajo.'
  },
  {
    name: 'Control inalámbrico Xbox Carbon Black', slug: 'control-inalambrico-xbox-carbon-black', brand: 'Xbox',
    price: 323000, image: '/assets/photos/official/xbox-wireless-carbon-black.jpg',
    description: 'Control inalámbrico Xbox Carbon Black con cruceta híbrida, botón Compartir, agarre texturizado y conexión Xbox Wireless y Bluetooth.',
    compatibility: 'Compatible con Xbox Series X|S, Xbox One, PC, Android e iOS según la versión del sistema.',
    sourceUrl: 'https://ecommerce.datablitz.com.ph/products/xboxone-series-wireless-controller-carbon-black-asian',
    sourceImageUrl: 'https://ecommerce.datablitz.com.ph/cdn/shop/products/84f33bea-0f8d-4332-bbad-402c712f5378_1024x.jpg?v=1676796922',
    evidence: 'Fotografía comercial del modelo exacto Xbox Wireless Controller Carbon Black.', marketSource: 'Referencia pública en Colombia: $359.000 COP; precio FOX GAMER calculado 10% por debajo.'
  },
  {
    name: 'Control Nintendo Switch Pro', slug: 'control-nintendo-switch-pro', brand: 'Nintendo',
    price: 296000, image: '/assets/photos/official/nintendo-pro-controller.jpg',
    description: 'Control Pro oficial para Nintendo Switch con conexión inalámbrica, controles de movimiento, vibración HD y lector NFC para amiibo.',
    compatibility: 'Compatible con Nintendo Switch, Switch OLED y funciones admitidas por cada juego; confirma compatibilidad con Switch 2.',
    sourceUrl: 'https://www.spoutnikgaspesie.ca/en/products/manette-sans-fils-nintendo-switch-official-wireless-pro-controller-nintendo',
    sourceImageUrl: 'https://www.spoutnikgaspesie.ca/cdn/shop/products/76170m_44318m_grande.jpg?v=1634086060',
    evidence: 'Fotografía comercial del Nintendo Switch Pro Controller oficial.', marketSource: 'Referencia pública en Colombia: $329.000 COP; precio FOX GAMER calculado 10% por debajo.'
  },
  {
    name: 'Par de controles Nintendo Joy-Con azul y rojo neón', slug: 'controles-nintendo-joy-con-azul-rojo-neon', brand: 'Nintendo',
    price: 289000, image: '/assets/photos/official/nintendo-joycon-neon.jpg',
    description: 'Par oficial de controles Joy-Con izquierdo y derecho en azul y rojo neón con vibración HD, controles de movimiento y uso independiente.',
    compatibility: 'Compatible con Nintendo Switch y Switch OLED; Switch Lite requiere uso inalámbrico y accesorios adicionales para algunas funciones.',
    sourceUrl: 'https://www.fotosound.je/products/nintendo-switch-joy-con-controller-pair-neon-red-blue',
    sourceImageUrl: 'https://www.fotosound.je/cdn/shop/files/76817.png?v=1769036969&width=480',
    evidence: 'Fotografía comercial del par oficial Joy-Con azul y rojo neón.', marketSource: 'Referencia pública en Colombia: $322.000 COP; precio FOX GAMER calculado más de 10% por debajo.'
  }
];

const suffix = {Nuevo: 'nuevo', Exhibición: 'exhibicion', Usado: 'usado'};
const existing = new Set(store.products.map(product => `${product.name}|${product.condition}`));

for (const controller of controllers) {
  const discounts = controller.price > 400000
    ? {Nuevo: 0, Exhibición: 150000, Usado: 200000}
    : {Nuevo: 0, Exhibición: 50000, Usado: 100000};
  for (const condition of ['Nuevo', 'Exhibición', 'Usado']) {
    if (existing.has(`${controller.name}|${condition}`)) continue;
    store.products.push({
      slug: `${controller.slug}-${suffix[condition]}`,
      name: controller.name,
      description: `${controller.description} ${controller.marketSource}`,
      category: 'accesorios', brand: controller.brand, condition,
      price: controller.price - discounts[condition], availability: 'inquiry',
      conditionNotes: condition === 'Nuevo' ? 'Producto nuevo; confirma color, empaque y garantía.' : condition === 'Exhibición' ? 'Unidad de exhibición; confirma estado estético, botones, sticks y batería.' : 'Unidad usada; confirma desgaste, drift, batería y funcionamiento de todos los botones.',
      includes: 'Confirma cable, receptor, estuche, piezas intercambiables y demás accesorios incluidos según el modelo.',
      warranty: 'Confirma garantía y condiciones con FOX GAMER.', image: controller.image,
      importedCatalog: false, compatibility: controller.compatibility
    });
  }

  if (!store.verifiedImages.some(entry => entry.name === controller.name)) {
    const localPath = controller.image.replace(/^\//, '');
    store.verifiedImages.push({
      name: controller.name, image: controller.image,
      kind: 'original-photo',
      manufacturer: controller.brand, sourceModel: controller.name,
      sourceUrl: controller.sourceUrl, sourceImageUrl: controller.sourceImageUrl,
      reviewedAt: '2026-09-20', evidence: controller.evidence,
      sha256: crypto.createHash('sha256').update(fs.readFileSync(localPath)).digest('hex')
    });
  }
}

fs.writeFileSync(storePath, `${JSON.stringify(store, null, 2)}\n`);
console.log(`Controller models implemented: ${controllers.length}`);
