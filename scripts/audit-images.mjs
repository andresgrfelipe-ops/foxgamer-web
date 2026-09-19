import {readFile, realpath} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateStore} from './catalog.mjs';

// Used by BOTH the CLI and the build, before any HTML is written.
export async function auditImages(store, root = process.cwd()) {
  validateStore(store);
  const hashes = new Map();
  const checked = new Set();
  const withImage = store.products.filter(p => p.image);
  const assetsRoot = withImage.length ? await realpath(path.join(root, 'assets')) : '';
  for (const p of withImage) {
    if (checked.has(p.image)) continue;
    const file = await realpath(path.join(root, p.image.slice(1)));
    const relative = path.relative(assetsRoot, file);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('Imagen fuera de assets: ' + p.slug);
    const bytes = await readFile(file);
    const hash = createHash('sha256').update(bytes).digest('hex');
    const proof = store.verifiedImages.find(v => v.name === p.name && v.image === p.image);
    if (hash !== proof.sha256) throw new Error('Fotografía modificada desde su verificación: ' + p.slug);
    const extension = path.extname(file).toLowerCase();
    const valid = extension === '.webp' ? bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
      : extension === '.png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
      : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    if (!valid) throw new Error('Formato de fotografía no válido: ' + p.image);
    if (hashes.has(hash) && hashes.get(hash) !== p.name) throw new Error('Foto duplicada entre modelos: ' + p.name);
    hashes.set(hash, p.name);
    checked.add(p.image);
  }
  return {products: store.products.length, verified: withImage.length,
    pending: store.products.length - withImage.length, uniqueVerifiedPhotos: hashes.size};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const store = JSON.parse(await readFile('data/store.json', 'utf8'));
  console.log(JSON.stringify(await auditImages(store)));
}
