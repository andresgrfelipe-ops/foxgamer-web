import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {memoryGB, memoryChoices} from '../scripts/macbook-memory.mjs';
import {storageChoices} from '../scripts/apple-storage.mjs';
import {priceLabel} from '../scripts/catalog.mjs';
import {createStorefront} from '../scripts/storefront.mjs';

const store = JSON.parse(await readFile('data/store.json', 'utf8'));
const ui = createStorefront(store);
const air = store.products.filter(p => p.appleModel === 'macbook-air-15-inch-m5-2026');

test('RAM changes retain the exact MacBook model, SSD and condition with catalogue prices', () => {
  assert.equal(air.length, 24);
  for (const product of air) {
    const choices = memoryChoices(store.products, product);
    assert.deepEqual(choices.map(memoryGB), [16, 24]);
    for (const choice of choices) {
      assert.equal(choice.appleModel, product.appleModel);
      assert.equal(choice.storageGB, product.storageGB);
      assert.equal(choice.condition, product.condition);
      assert.equal(choice.price, store.products.find(p => p.slug === choice.slug).price);
      assert.ok(storageChoices(store.products, choice).every(p => memoryGB(p) === memoryGB(choice)));
    }
  }
});

test('do not infer RAM from storage, another chip, unpriced offers or unrelated products', () => {
  assert.equal(memoryGB({name: 'MacBook Air 13 pulgadas M4 256 GB', category: 'apple'}), null);
  assert.equal(memoryGB({name: 'iPad 16 GB RAM', category: 'apple'}), null);
  const p = air[0];
  const candidates = [p,
    {...p, appleModel: 'another-chip', ramGB: 32},
    {...p, condition: 'other-condition', ramGB: 48},
    {...p, storageGB: 8192, ramGB: 64},
    {...p, price: null, ramGB: 96}];
  assert.deepEqual(memoryChoices(candidates, p), [p]);
  assert.deepEqual(memoryChoices(store.products, {...p, name: 'MacBook sin RAM especificada'}), []);
});

test('RAM links lead to the matching price in the purchase panel and every WhatsApp payment option', () => {
  for (const product of air) {
    const {body} = ui.productDetail(product);
    const nav = body.match(/<nav id="memoria-ram".*?<\/nav>/s)?.[0];
    assert.ok(nav);
    assert.equal((nav.match(/aria-current="page"/g) || []).length, 1);
    const links = [...nav.matchAll(/href="\/productos\/([^/]+)\/#memoria-ram"/g)];
    assert.equal(links.length, 2);
    for (const [,slug] of links) {
      const selected = store.products.find(p => p.slug === slug);
      const detail = ui.productDetail(selected).body;
      assert.ok(detail.includes(`<p class="product-price">${priceLabel(selected)}</p>`));
      const messages = [...detail.matchAll(/href="(https:\/\/wa.me\/[^\"]+)"/g)]
        .map(match => new URL(match[1].replaceAll('&amp;', '&')).searchParams.get('text'));
      assert.ok(messages.length >= 4);
      for (const message of messages) {
        assert.ok(message.includes(selected.name));
        assert.ok(message.includes('(' + selected.condition + ')'));
        assert.ok(message.includes(priceLabel(selected)));
      }
    }
  }
});

test('the Apple catalogue exposes RAM selection and leaves products without RAM alternatives unchanged', () => {
  const catalog = ui.catalog('apple');
  for (const product of air) assert.ok(catalog.includes(`href="/productos/${product.slug}/#memoria-ram"`));
  const phone = store.products.find(p => p.name === 'iPhone 15 128 GB');
  assert.doesNotMatch(ui.productDetail(phone).body, /ram-picker|memoria-ram/);
  const single = store.products.find(p => p.name === 'MacBook Pro 14 pulgadas M5 Pro 24 GB RAM 1 TB SSD');
  assert.doesNotMatch(ui.productDetail(single).body, /ram-picker/);
});
