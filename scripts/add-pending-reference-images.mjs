import {readFile, writeFile, mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.cjs');

const storePath = 'data/store.json';
const outputDir = 'assets/photos/reference';
const items = [
  ['Monitores','monitores','MONITOR','<rect x="230" y="160" width="440" height="250" rx="20"/><path d="M450 410v80m-110 0h220"/>'],
  ['Diademas','diademas','DIADEMAS','<path d="M280 360v-45a170 170 0 0 1 340 0v45"/><rect x="235" y="335" width="85" height="150" rx="35"/><rect x="580" y="335" width="85" height="150" rx="35"/>'],
  ['Simulador de carreras Logitech G923','logitech-g923','VOLANTE G923','<circle cx="450" cy="310" r="155"/><circle cx="450" cy="310" r="58"/><path d="M450 155v95m-148 12 92 31m204-31-92 31M390 465h120"/>'],
  ['Soporte para volante y pedales','soporte-volante-pedales','SOPORTE SIMRACING','<path d="M300 475 390 180h190l70 295M360 285h270M320 410h280"/><rect x="385" y="145" width="205" height="55" rx="12"/>'],
  ['Playseat Challenger simulación','playseat-challenger','SILLA DE SIMULACIÓN','<path d="M345 175h180l45 205H390zM390 380l-90 110m270-110 80 110M300 490h350"/><rect x="520" y="245" width="160" height="45" rx="12"/>'],
  ['Kit simulador VR2 + juego','kit-vr2-juego','KIT VR + JUEGO','<path d="M260 265q190-105 380 0l-30 150q-70 45-160-35-90 80-160 35z"/><circle cx="355" cy="325" r="25"/><circle cx="545" cy="325" r="25"/><rect x="650" y="205" width="105" height="185" rx="12"/>'],
  ['Magic Keyboard iPad Air','magic-keyboard-ipad-air','MAGIC KEYBOARD','<rect x="245" y="145" width="410" height="250" rx="18"/><path d="M245 395h410l70 105H175zM245 455h410"/>'],
  ['MacBook Air Intel 13 pulgadas 256 GB','macbook-air-intel-13','MACBOOK AIR 13','<rect x="245" y="145" width="410" height="260" rx="18"/><path d="M190 475h520l-55-70H245z"/><circle cx="450" cy="275" r="34"/>'],
  ['MacBook Pro Intel 13 pulgadas 256 GB','macbook-pro-intel-13','MACBOOK PRO 13','<rect x="235" y="140" width="430" height="270" rx="16"/><path d="M175 480h550l-60-70H235zM385 452h130"/><circle cx="450" cy="275" r="34"/>'],
  ['MacBook Pro M1 14 pulgadas 512 GB','macbook-pro-m1-14','MACBOOK PRO 14 M1','<rect x="220" y="130" width="460" height="285" rx="17"/><path d="M160 490h580l-60-75H220zM380 458h140"/><circle cx="450" cy="275" r="36"/>']
];

await mkdir(outputDir, {recursive:true});
const store = JSON.parse(await readFile(storePath, 'utf8'));
for (const [name, file, label, drawing] of items) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="675" viewBox="0 0 900 675"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#07121f"/><stop offset="1" stop-color="#14263d"/></linearGradient><linearGradient id="accent" x2="1"><stop stop-color="#ff6b00"/><stop offset="1" stop-color="#ff9d2e"/></linearGradient></defs><rect width="900" height="675" rx="36" fill="url(#bg)"/><path d="M0 610 900 470v205H0z" fill="#0d1d2d"/><g fill="none" stroke="url(#accent)" stroke-width="22" stroke-linecap="round" stroke-linejoin="round">${drawing}</g><text x="450" y="570" fill="#fff" font-family="Arial,sans-serif" font-size="36" font-weight="700" text-anchor="middle">${label}</text><text x="450" y="618" fill="#a9bbca" font-family="Arial,sans-serif" font-size="21" text-anchor="middle">IMAGEN REFERENCIAL · CONFIRMA EL MODELO</text></svg>`;
  const pngPath = `${outputDir}/${file}.png`;
  await sharp(Buffer.from(svg)).png({compressionLevel:9, palette:true}).toFile(pngPath);
  const bytes = await readFile(pngPath);
  const image = `/${pngPath}`;
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  for (const product of store.products.filter(product => product.name === name)) {
    product.image = image;
    if (product.category === 'accesorios' && !product.compatibility) product.compatibility = 'Referencia genérica: confirma por WhatsApp el modelo exacto y la compatibilidad con tu consola o equipo.';
  }
  store.verifiedImages = (store.verifiedImages || []).filter(entry => entry.name !== name);
  store.verifiedImages.push({name, image, kind:'illustration', sourceUrl:'created-for-fox-gamer', reviewedAt:'2026-09-20', evidence:'Ilustración referencial creada para identificar la categoría; no representa una unidad, color o configuración específica.', sha256});
}
await writeFile(storePath, JSON.stringify(store, null, 2) + '\n');
console.log(`Created ${items.length} reference illustrations.`);
