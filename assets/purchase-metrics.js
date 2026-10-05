(() => {
  const seen = new Set();
  const record = (event, product = '') => {
    if (!['purchase_click', 'cart_checkout'].includes(event)) return;
    const page = location.pathname;
    const key = [event, product, page].join('|');
    if (seen.has(key)) return;
    seen.add(key);
    const body = new URLSearchParams({'form-name':'foxgamer-purchase-events', event, product:product.slice(0,150), page:page.slice(0,250), 'bot-field':''});
    fetch('/eventos-compra/', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:body.toString(), keepalive:true}).catch(() => {});
  };
  window.FoxPurchaseMetrics = Object.freeze({record});
  document.addEventListener('click', e => {
    const link = e.target.closest?.('a[href]');
    if (!link || link.id === 'fox-cart-checkout') return;
    let url; try { url = new URL(link.href); } catch { return; }
    if (url.hostname !== 'wa.me' || !url.searchParams.has('text')) return;
    const card = link.closest('[data-product]');
    const path = card?.querySelector('a[href^="/productos/"]')?.getAttribute('href') || location.pathname;
    record('purchase_click', path.startsWith('/productos/') ? path.split('/')[2] : 'general');
  });
})();
