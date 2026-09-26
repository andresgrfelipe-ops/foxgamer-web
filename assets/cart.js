(() => {
  const KEY='foxgamer-cart-v1', CUSTOMER_KEY='foxgamer-customer-v1';
  const money=n=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
  let cart=[]; try{cart=JSON.parse(localStorage.getItem(KEY)||'[]')}catch{}\n  let customer={}; try{customer=JSON.parse(localStorage.getItem(CUSTOMER_KEY)||'{}')}catch{}
  const save=()=>{localStorage.setItem(KEY,JSON.stringify(cart));render()};
  const idFor=c=>[c.dataset.title,c.dataset.condition,c.dataset.price].join('|');
  const add=card=>{
    const price=Number(card.dataset.price); if(!price) return;
    const id=idFor(card), found=cart.find(x=>x.id===id);
    if(found) found.qty++; else cart.push({id,name:card.dataset.title,condition:card.dataset.condition,price,qty:1});
    save(); document.querySelector('#fox-cart')?.classList.add('is-open'); document.body.classList.add('cart-open'); document.querySelector('#fox-cart-toggle')?.setAttribute('aria-expanded','true');
  };
  const shell=document.createElement('div');
  shell.innerHTML='<button id="fox-cart-toggle" class="fox-cart-toggle" type="button" aria-controls="fox-cart" aria-expanded="false">🛒 Carrito <span id="fox-cart-count">0</span></button><aside id="fox-cart" class="fox-cart" aria-label="Carrito de compras"><div class="fox-cart-head"><strong>Tu carrito</strong><button type="button" data-cart-close aria-label="Cerrar carrito">×</button></div><div id="fox-cart-items"></div><div class="fox-order-fields"><label>Nombre<input id="fox-order-name" autocomplete="name" placeholder="Tu nombre"></label><label>Teléfono<input id="fox-order-phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="Tu teléfono"></label><label>Ciudad<input id="fox-order-city" autocomplete="address-level2" placeholder="Ciudad"></label><label>Entrega<select id="fox-order-delivery"><option value="Envío a domicilio">Envío a domicilio</option><option value="Recogida / acordar con asesor">Recogida / acordar con asesor</option></select></label><label id="fox-order-address-wrap">Dirección de entrega<input id="fox-order-address" autocomplete="street-address" placeholder="Dirección"></label><label>Método de pago preferido<select id="fox-order-payment"><option value="Por definir">Por definir</option><option value="Nequi">Nequi</option><option value="Addi">Addi</option><option value="Sistecrédito">Sistecrédito</option><option value="Otro / consultar">Otro / consultar</option></select></label></div><div class="fox-cart-foot"><div class="fox-cart-summary"><span><b id="fox-cart-units">0</b> unidades</span><span>Total</span><strong id="fox-cart-total">$ 0 COP</strong></div><a id="fox-cart-checkout" class="button" target="_blank" rel="noopener noreferrer">Enviar carrito por WhatsApp</a><button id="fox-cart-clear" class="text-button" type="button">Vaciar carrito</button></div></aside><div class="fox-cart-backdrop" data-cart-close></div>';
  document.body.append(...shell.children);\n  const customerFields={name:'#fox-order-name',phone:'#fox-order-phone',city:'#fox-order-city',delivery:'#fox-order-delivery',address:'#fox-order-address',payment:'#fox-order-payment'};\n  Object.entries(customerFields).forEach(([key,selector])=>{const el=document.querySelector(selector);if(el && customer[key])el.value=customer[key]});\n  const saveCustomer=()=>{const data={};Object.entries(customerFields).forEach(([key,selector])=>{const el=document.querySelector(selector);if(el)data[key]=el.value.trim()});customer=data;localStorage.setItem(CUSTOMER_KEY,JSON.stringify(data));};
  document.querySelectorAll('[data-product]').forEach(card=>{
    if(!Number(card.dataset.price)) return;
    const btn=document.createElement('button'); btn.type='button'; btn.className='button fox-add-cart'; btn.textContent='Agregar al carrito';
    btn.addEventListener('click',()=>add(card)); card.append(btn);
  });
  // Product detail pages do not use data-product cards. Build the same cart
  // payload from the page's product metadata so customers can add a product
  // without returning to the catalogue first.
  const detail=document.querySelector('.product-detail');
  const purchase=document.querySelector('.purchase-panel');
  if(detail && purchase && !purchase.querySelector('.fox-add-cart')){
    const priceText=purchase.querySelector('.product-price')?.textContent||'';
    const price=Number(priceText.replace(/[^0-9]/g,''));
    const title=document.querySelector('.product-summary h1')?.textContent?.trim();
    const condition=document.querySelector('.product-summary [data-condition]')?.dataset.condition?.trim();
    if(price && title && condition){
      const product={dataset:{price:String(price),title,condition}};
      const btn=document.createElement('button');
      btn.type='button'; btn.className='button fox-add-cart'; btn.textContent='Agregar al carrito';
      btn.addEventListener('click',()=>add(product));
      const consult=purchase.querySelector('a.button');
      if(consult) consult.insertAdjacentElement('beforebegin',btn); else purchase.append(btn);
    }
  }
  const panel=document.querySelector('#fox-cart'), toggle=document.querySelector('#fox-cart-toggle');
  const close=()=>{panel.classList.remove('is-open');document.body.classList.remove('cart-open');toggle.setAttribute('aria-expanded','false')};
  toggle.addEventListener('click',()=>{const open=!panel.classList.contains('is-open');panel.classList.toggle('is-open',open);document.body.classList.toggle('cart-open',open);toggle.setAttribute('aria-expanded',String(open))});
  document.querySelectorAll('[data-cart-close]').forEach(x=>x.addEventListener('click',close));
  document.querySelector('#fox-cart-clear').addEventListener('click',()=>{cart=[];save()});
  function render(){
    const box=document.querySelector('#fox-cart-items'), count=cart.reduce((s,x)=>s+x.qty,0), total=cart.reduce((s,x)=>s+x.price*x.qty,0);
    document.querySelector('#fox-cart-count').textContent=count; document.querySelector('#fox-cart-units').textContent=count; document.querySelector('#fox-cart-total').textContent=money(total);
    box.innerHTML=cart.length?'':'<p class="fox-cart-empty">Tu carrito está vacío.</p>';
    cart.forEach(item=>{
      const row=document.createElement('div'); row.className='fox-cart-item';
      row.innerHTML='<div><strong></strong><small></small><span></span></div><div class="fox-cart-qty"><button type="button" data-minus>−</button><b></b><button type="button" data-plus>+</button><button type="button" data-remove aria-label="Eliminar">×</button></div>';
      row.querySelector('strong').textContent=item.name; row.querySelector('small').textContent=item.condition; row.querySelector('span').textContent=money(item.price); row.querySelector('b').textContent=item.qty;
      row.querySelector('[data-minus]').onclick=()=>{item.qty--;if(item.qty<1)cart=cart.filter(x=>x.id!==item.id);save()};
      row.querySelector('[data-plus]').onclick=()=>{item.qty++;save()}; row.querySelector('[data-remove]').onclick=()=>{cart=cart.filter(x=>x.id!==item.id);save()}; box.append(row);
    });
    const lines=cart.map(x=>`• ${x.name} (${x.condition}) x${x.qty} — ${money(x.price*x.qty)}`).join('\n');
    const name=document.querySelector('#fox-order-name')?.value.trim()||'No indicado';
    const phone=document.querySelector('#fox-order-phone')?.value.trim()||'No indicado';
    const city=document.querySelector('#fox-order-city')?.value.trim()||'No indicada';
    const delivery=document.querySelector('#fox-order-delivery')?.value||'Por definir';
    const address=document.querySelector('#fox-order-address')?.value.trim()||'No indicada';
    const payment=document.querySelector('#fox-order-payment')?.value||'Por definir';
    const addressLine=delivery==='Envío a domicilio'?`\n• Dirección: ${address}`:'';
    const msg=`Hola FOX GAMER, estoy interesado en los siguientes artículos de mi carrito:\n\n${lines}\n\nTotal: ${money(total)}\n\nDatos del pedido:\n• Nombre: ${name}\n• Teléfono: ${phone}\n• Ciudad: ${city}\n• Entrega: ${delivery}${addressLine}\n• Pago preferido: ${payment}\n\nQuiero confirmar disponibilidad de todos los artículos, condiciones, envío y método de pago.`;
    const checkout=document.querySelector('#fox-cart-checkout'); checkout.href='https://wa.me/573237267448?text='+encodeURIComponent(msg); checkout.classList.toggle('is-disabled',!cart.length); checkout.setAttribute('aria-disabled',String(!cart.length));
  }
  const syncDeliveryFields=()=>{const home=document.querySelector('#fox-order-delivery')?.value==='Envío a domicilio';const wrap=document.querySelector('#fox-order-address-wrap');if(wrap)wrap.hidden=!home;};
  document.querySelectorAll('#fox-order-name,#fox-order-phone,#fox-order-city,#fox-order-address,#fox-order-delivery,#fox-order-payment').forEach(el=>el.addEventListener('input',()=>{saveCustomer();syncDeliveryFields();render()}));\n  document.querySelector('#fox-cart-checkout').addEventListener('click',e=>{\n    if(!cart.length){e.preventDefault();return;}\n    const required=['#fox-order-name','#fox-order-phone','#fox-order-city'];\n    if(document.querySelector('#fox-order-delivery')?.value==='Envío a domicilio')required.push('#fox-order-address');\n    const missing=required.map(s=>document.querySelector(s)).find(el=>!el?.value.trim());\n    if(missing){e.preventDefault();missing.focus();missing.setAttribute('aria-invalid','true');alert('Completa los datos del pedido antes de enviarlo por WhatsApp.');return;}\n    required.forEach(s=>document.querySelector(s)?.removeAttribute('aria-invalid'));\n    saveCustomer();render();\n  });
  syncDeliveryFields();
  render();
})();