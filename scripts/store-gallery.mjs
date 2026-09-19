import {escapeHTML as e, priceLabel, whatsappURL} from './catalog.mjs';

export function storeGallery(store, category) {
 const accessories=category==='accesorios', seen=new Set();
 const photos=(store.gallery||[]).filter(p=>!category||p.category===category).filter(p=>{
  if(!accessories)return true;
  if(!store.accessoryGallery?.includes(p.image)||seen.has(p.image))return false;
  seen.add(p.image);return true;
 });
 if(!photos.length)return '';
 const shown=category?photos:photos.filter((p,i)=>[0,3,4,8,11,16,18,21].includes(i));
 const cards=shown.map(photo=>{
  // Only link a photograph to a product when the exact file/model pairing was verified.
  const product=accessories ? store.products.find(p=>p.category===category&&p.condition==='Nuevo'&&p.image===photo.image&&store.verifiedImages?.some(v=>v.name===p.name&&v.image===photo.image&&v.kind==='original-photo')) : null;
  const title=accessories ? product?.name || photo.title : 'Fotografía de la tienda · '+(photo.source||'FOX GAMER');
  const query=whatsappURL(store.whatsapp,'Hola FOX GAMER, quiero identificar y consultar este accesorio de la galería: '+title+'. Fotografía: '+new URL(photo.large,store.url).href+' Confirma modelo exacto, precio, condición y disponibilidad.');
  const details=product ? '<p>'+e(product.condition)+' · '+priceLabel(product)+'</p><a class="text-link gallery-product-link" href="/productos/'+e(product.slug)+'/">Ver ficha y condiciones</a>' : accessories&&query ? '<p>Confirma modelo, precio y estado de la unidad.</p><a class="text-link gallery-product-link" href="'+e(query)+'" target="_blank" rel="noopener noreferrer" aria-label="Consultar esta fotografía (abre WhatsApp)">Consultar esta fotografía</a>' : '<p>Precio y condición por confirmar</p>';
  return '<figure class="photo-card"><a href="'+e(photo.large)+'" data-gallery-image aria-label="Ampliar fotografía: '+e(title)+'"><img src="'+e(photo.image)+'" alt="'+e(title)+' en FOX GAMER" width="640" height="640" loading="lazy" decoding="async"><span class="photo-zoom" aria-hidden="true"><svg><use href="/assets/icons.svg#search"></use></svg></span></a><figcaption><h3>'+e(title)+'</h3>'+details+'</figcaption></figure>';
 }).join('');
 return '<section class="section wrap photo-gallery" aria-labelledby="gallery-title"><div class="section-top"><div><p class="eyebrow">FOTOGRAFÍAS DE NUESTRA TIENDA</p><h2 id="gallery-title">'+(accessories?'Accesorios de cerca.':'El universo FOX GAMER, de cerca.')+'</h2></div><span class="small">'+shown.length+' fotografías</span></div><p class="gallery-intro">'+(accessories?'Amplía cada foto para ver los detalles. Abre la ficha del modelo identificado o consúltanos por la fotografía; confirma disponibilidad y estado de la unidad.':'Explora nuestras fotografías. Consulta precio, disponibilidad y condición de cada unidad antes de comprar.')+'</p><details class="gallery-disclosure"'+(accessories?' open':'')+'><summary>Ver fotografías de la tienda</summary><div class="photo-grid">'+cards+'</div></details></section><dialog id="photo-dialog" aria-labelledby="photo-dialog-title"><button type="button" class="dialog-close" aria-label="Cerrar fotografía">Cerrar ×</button><img id="photo-dialog-image" alt=""><h2 id="photo-dialog-title">Fotografía de FOX GAMER</h2></dialog>';
}
