import test from 'node:test';
import {Script} from 'node:vm';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const cart=await readFile('assets/cart.js','utf8');

test('cart checkout keeps reference lookup after checkout element lookup',()=>{
  const checkout=cart.indexOf("const checkout=document.querySelector('#fox-cart-checkout')");
  const reference=cart.indexOf("const reference=checkout?.dataset.orderId");
  assert.ok(checkout>=0);
  assert.ok(reference>checkout);
});

test('cart requires core customer fields and validates phone',()=>{
  assert.match(cart,/fox-order-name/);
  assert.match(cart,/fox-order-phone/);
  assert.match(cart,/fox-order-city/);
  assert.match(cart,/digits\.length<7\|\|digits\.length>15/);
});

test('cart sends a structured WhatsApp order with reference and totals',()=>{
  assert.match(cart,/\*ARTÍCULOS\*/);
  assert.match(cart,/\*RESUMEN\*/);
  assert.match(cart,/\*DATOS DEL CLIENTE\*/);
  assert.match(cart,/checkout\.dataset\.orderId\)checkout\.dataset\.orderId=orderId\(\)/);
  assert.match(cart,/wa\.me\/573237267448/);
});

test('cart supports keyboard close and guarded clear',()=>{
  assert.match(cart,/e\.key==='Escape'/);
  assert.match(cart,/confirm\('¿Vaciar todos los artículos del carrito\?'\)/);
});

test('order reference resets whenever the order changes',()=>{
  assert.match(cart,/const resetReference=/);
  assert.match(cart,/resetReference\(\); save\(\); showCartNotice/);
  assert.match(cart,/\[data-plus\].*resetReference\(\)/s);
});

test('cart JavaScript compiles before it is published',()=>{assert.doesNotThrow(()=>new Script(cart));});
