(() => {
  const KEY='foxgamer-cart-v1';
  const money=n=>new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(n);
  let cart=[]; try{cart=JSON.parse(localStorage.getItem(KEY)||'[]')}catch{}
  const save=()=>{localStorage.setItem(KEY,JSON.stringify(cart));render()};
  const idFor=c=>[c.dataset.title,c.dataset.condition,c.dataset.price].join('|');
  const add=card=>{
    const price=Number(card.dataset.price); if(!price) return;
    const id=idFor(card), found=cart.find(x=>x.id===id);
    if(found) found.qty++; else cart.push({id,name:card.dataset.title,condition:card.dataset.condition,price,qty:1});
    save(); document.querySelector('#fox-cart')?.classList.add('is-open'); document.body.classList.add('cart-open'); document.querySelector('#fox-cart-toggle')?.setAttribute('aria-expanded','true');
  };
  const shell=document.createElement('div');
  shell.innerHTML='<button id="fox-cart-toggle" class="fox-cart-toggle" type="button" aria-controls="fox-cart" aria-expanded="false">🛒 Carrito <span id="fox-cart-count">0</span></button><aside id="fox-cart" class="fox-cart" aria-label="Carrito de compras"><div class="fox-cart-head"><strong>Tu carrito</strong><button type="button" data-cart-close aria-label="Cerrar carrito">×</button></div><div id="fox-cart-items"></div><div class="fox-cart-foot"><div><span>Total</span><strong id="fox-cart-total">$ 0 COP</strong></div><a id="fox-cart-checkout" class="button" target="_blank" rel="noopener noreferrer">Finalizar por WhatsApp</a><button id="fox-cart-clear" class="text-button" type="button">Vaciar carrito</button></div></aside><div class="fox-cart-backdrop" data-cart-close></div>';
  document.body.append(...shell.children);
  document.querySelectorAll('[data-product]').forEach(card=>{
    if(!Number(card.dataset.price)) return;
    const btn=document.createElement('button'); btn.type='button'; btn.className='button fox-add-cart'; btn.textContent='Agregar al carrito';
    btn.addEventListener('click',()=>add(card)); card.append(btn);
  });
  const panel=document.querySelector('#fox-cart'), toggle=document.querySelector('#fox-cart-toggle');
  const close=()=>{panel.classList.remove('is-open');document.body.classList.remove('cart-open');toggle.setAttribute('aria-expanded','false')};
  toggle.addEventListener('click',()=>{const open=!panel.classList.contains('is-open');panel.classList.toggle('is-open',open);document.body.classList.toggle('cart-open',open);toggle.setAttribute('aria-expanded',String(open))});
  document.querySelectorAll('[data-cart-close]').forEach(x=>x.addEventListener('click',close));
  document.querySelector('#fox-cart-clear').addEventListener('click',()=>{cart=[];save()});
  function render(){
    const box=document.querySelector('#fox-cart-items'), count=cart.reduce((s,x)=>s+x.qty,0), total=cart.reduce((s,x)=>s+x.price*x.qty,0);
    document.querySelector('#fox-cart-count').textContent=count; document.querySelector('#fox-cart-total').textContent=money(total);
    box.innerHTML=cart.length?'':'<p class="fox-cart-empty">Tu carrito está vacío.</p>';
    cart.forEach(item=>{
      const row=document.createElement('div'); row.className='fox-cart-item';
      row.innerHTML='<div><strong></strong><small></small><span></span></div><div class="fox-cart-qty"><button type="button" data-minus>−</button><b></b><button type="button" data-plus>+</button><button type="button" data-remove aria-label="Eliminar">×</button></div>';
      row.querySelector('strong').textContent=item.name; row.querySelector('small').textContent=item.condition; row.querySelector('span').textContent=money(item.price); row.querySelector('b').textContent=item.qty;
      row.querySelector('[data-minus]').onclick=()=>{item.qty--;if(item.qty<1)cart=cart.filter(x=>x.id!==item.id);save()};
      row.querySelector('[data-plus]').onclick=()=>{item.qty++;save()}; row.querySelector('[data-remove]').onclick=()=>{cart=cart.filter(x=>x.id!==item.id);save()}; box.append(row);
    });
    const lines=cart.map(x=>`• ${x.name} (${x.condition}) x${x.qty} — ${money(x.price*x.qty)}`).join('\n');
    const msg=`Hola FOX GAMER, quiero finalizar este pedido:\n\n${lines}\n\nTotal: ${money(total)}\n\nQuiero confirmar disponibilidad, envío y método de pago.`;
    const checkout=document.querySelector('#fox-cart-checkout'); checkout.href='https://wa.me/573237267448?text='+encodeURIComponent(msg); checkout.classList.toggle('is-disabled',!cart.length); checkout.setAttribute('aria-disabled',String(!cart.length));
  }
  render();
})();