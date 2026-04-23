import { products } from './data/products-v2.js';

const root = document.querySelector('#debug-root');

const sample = products
  .filter((product) =>
    product.category === 'libretas' || product.category === 'agendas-y-planeadores'
  )
  .slice(0, 12);

root.innerHTML = sample
  .map(
    (product) => `
      <article style="border:1px solid #ccc;padding:16px;margin-bottom:12px;">
        <h3>${product.name}</h3>
        <p>Categoría: ${product.category}</p>
        <p>Customizable: ${String(product.customizable)}</p>
      </article>
    `
  )
  .join('');
