import fs from 'node:fs';
import crypto from 'node:crypto';

const storePath = 'data/store.json';
const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));
const designs = [
  {
    name: 'PlayStation 5 Slim 1 TB Ghost of Yōtei Gold Limited Edition',
    slug: 'playstation-5-slim-ghost-of-yotei-gold', category: 'consolas', brand: 'PlayStation',
    image: '/assets/photos/official/ps5-ghost-yotei-gold.png',
    prices: {Nuevo: 3419000, Exhibición: 3149000, Usado: 2899000},
    description: 'Consola PS5 Slim con unidad de disco, SSD de 1 TB y diseño dorado oficial inspirado en Ghost of Yōtei.',
    compatibility: 'Compatible con juegos de PS5 y con la selección de juegos de PS4 admitidos por retrocompatibilidad.',
    includes: 'Confirma código del juego, DualSense temático, base horizontal, cables y empaque incluidos.',
    sourceUrl: 'https://newark.cl/tienda/consola-sony-ps5-slim-ghost-of-yotei-bundle-gold-edicion-disco/',
    sourceImageUrl: 'https://newark.cl/storage/2025/10/Consola-Sony-PS5-Slim-Ghost-of-Yotei-Bundle-Gold-Edicion-Disco-700x700.png',
    evidence: 'Fotografía comercial identificada como PS5 Slim Ghost of Yōtei Gold con unidad de disco.',
    market: 'Referencia pública colombiana encontrada: $3.799.990 COP; precio nuevo FOX GAMER calculado 10% por debajo.'
  },
  {
    name: 'Nintendo Switch OLED Zelda Tears of the Kingdom Edition',
    slug: 'nintendo-switch-oled-zelda-tears-of-the-kingdom', category: 'consolas', brand: 'Nintendo',
    image: '/assets/photos/official/switch-oled-zelda-totk.jpg',
    prices: {Nuevo: 1399000, Exhibición: 1249000, Usado: 1099000},
    description: 'Nintendo Switch OLED de 64 GB con dock blanco y dorado, Joy-Con temáticos y diseño oficial de The Legend of Zelda: Tears of the Kingdom.',
    compatibility: 'Compatible con el catálogo de Nintendo Switch; confirma compatibilidad individual de accesorios y juegos.',
    includes: 'Confirma consola, dock temático, dos Joy-Con, correas, grip, HDMI, cargador y empaque.',
    sourceUrl: 'https://www.ubuy.co.in/product/8RPKNYFQI-nintendo-switch-oled-model-the-legend-of-zelda-tears-of-the-kingdom-edition',
    sourceImageUrl: 'https://images-cdn.ubuy.co.in/69412188b0e4d99da10d80d9-nintendo-switch-oled-model-the.jpg',
    evidence: 'Fotografía comercial de la consola, dock, Joy-Con y empaque de la edición Zelda Tears of the Kingdom.',
    market: 'Precio basado en referencias públicas vigentes de la edición importada; confirma valor final y disponibilidad con FOX GAMER.'
  },
  {
    name: 'Control Xbox Wireless Remix Special Edition',
    slug: 'control-xbox-wireless-remix-special-edition', category: 'accesorios', brand: 'Xbox',
    image: '/assets/photos/official/xbox-controller-remix.jpg',
    prices: {Nuevo: 306000, Exhibición: 266000, Usado: 226000},
    description: 'Control inalámbrico Xbox Remix Special Edition verde, fabricado parcialmente con materiales recuperados e incluido originalmente con batería recargable y cable USB-C.',
    compatibility: 'Compatible con Xbox Series X|S, Xbox One, Windows 10/11, Android e iOS mediante Xbox Wireless o Bluetooth.',
    includes: 'Confirma batería recargable, cable USB-C y empaque incluidos.',
    sourceUrl: 'https://gamextreme.ph/products/xbox-wireless-controller-remix-special-edition-green',
    sourceImageUrl: 'https://gamextreme.ph/cdn/shop/files/5_a92b77bc-da32-436c-b842-8a89d5e98764.jpg?crop=center&height=740&v=1755156265&width=840',
    evidence: 'Fotografía comercial del control Xbox Wireless Remix Special Edition verde.',
    market: 'Precio nuevo calculado 10% por debajo de una referencia internacional equivalente cercana a $340.000 COP.'
  },
  {
    name: 'Control Xbox Forza Horizon 5 Limited Edition',
    slug: 'control-xbox-forza-horizon-5-limited-edition', category: 'accesorios', brand: 'Xbox',
    image: '/assets/photos/official/xbox-controller-forza-horizon-5.webp',
    prices: {Nuevo: 460000, Exhibición: 400000, Usado: 340000},
    description: 'Control inalámbrico Xbox edición limitada Forza Horizon 5 con carcasa amarilla translúcida y detalles rosa y azul.',
    compatibility: 'Compatible con Xbox Series X|S, Xbox One, Windows 10/11, Android e iOS mediante Xbox Wireless o Bluetooth.',
    includes: 'Confirma baterías, contenido adicional, manuales y empaque incluidos.',
    sourceUrl: 'https://stockx.com/es-us/microsoft-xbox-series-x-s-one-forza-horizon-5-limited-edition-wireless-controller-aus-plug-qau-00060',
    sourceImageUrl: 'https://images.stockx.com/images/Microsoft-Xbox-Series-X-S-One-Forza-Horizon-5-Limited-Edition-Wireless-Controller-AUS-Plug-QAU-00060.jpg?auto=compress&bg=FFFFFF&dpr=2&fit=fill&fm=webp&h=857&q=75&trim=color&updated_at=1639174097&w=1200',
    evidence: 'Fotografía comercial del control Xbox Forza Horizon 5 Limited Edition QAU-00060.',
    market: 'Precio nuevo calculado 10% por debajo de la última referencia pública equivalente cercana a $512.000 COP.'
  }
];

const conditionSlug = {Nuevo: 'nuevo', Exhibición: 'exhibicion', Usado: 'usado'};
for (const design of designs) {
  for (const condition of Object.keys(conditionSlug)) {
    const slug = `${design.slug}-${conditionSlug[condition]}`;
    if (store.products.some(product => product.slug === slug)) continue;
    store.products.push({
      slug, name: design.name,
      description: `${design.description} ${design.market}`,
      category: design.category, brand: design.brand, condition,
      price: design.prices[condition], availability: 'inquiry',
      conditionNotes: condition === 'Nuevo'
        ? 'Producto nuevo; confirma sellos, autenticidad, empaque y garantía.'
        : condition === 'Exhibición'
          ? 'Unidad de exhibición; confirma estado estético, accesorios y funcionamiento.'
          : 'Unidad usada; confirma desgaste, batería, puertos, controles y funcionamiento.',
      includes: design.includes,
      warranty: 'Confirma garantía y condiciones con FOX GAMER.',
      image: design.image, importedCatalog: false, compatibility: design.compatibility
    });
  }
  if (!store.verifiedImages.some(item => item.name === design.name)) {
    const localPath = design.image.replace(/^\//, '');
    store.verifiedImages.push({
      name: design.name, image: design.image, kind: 'original-photo',
      manufacturer: design.brand, sourceModel: design.name,
      sourceUrl: design.sourceUrl, sourceImageUrl: design.sourceImageUrl,
      reviewedAt: '2026-09-20', evidence: design.evidence,
      sha256: crypto.createHash('sha256').update(fs.readFileSync(localPath)).digest('hex')
    });
  }
}

fs.writeFileSync(storePath, `${JSON.stringify(store, null, 2)}\n`);
console.log(`Added ${designs.length} verified official designs in three conditions.`);
