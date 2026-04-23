import { products } from '../../data/products.js';
import { addToCart } from './cart-v2.js';

const searchInput = document.querySelector('#search');
const categorySelect = document.querySelector('#category');
const catalogGrid = document.querySelector('#catalog-grid');

if (!searchInput || !categorySelect || !catalogGrid) {
  throw new Error('Catalog UI elements were not found in index.html');
}

const activeProducts = products.filter((product) => product.active);

const uniqueCategories = [...new Set(activeProducts.map((product) => product.category))]
  .sort((a, b) => a.localeCompare(b, 'es'));

const formatCategoryLabel = (category) =>
  category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const formatPrice = (price, currency) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency
  }).format(price);

const createProductCard = (product) => {
  const article = document.createElement('article');
  article.className = 'product-card';

  const category = document.createElement('p');
  category.textContent = formatCategoryLabel(product.category);

  const title = document.createElement('h3');
  title.textContent = product.name;

  const description = document.createElement('p');
  description.textContent = product.shortDescription;

  const price = document.createElement('p');
  price.textContent = formatPrice(product.price, product.currency);

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Agregar al carrito';
  button.addEventListener('click', () => {
    addToCart(product);
  });

  article.append(category, title, description, price, button);

  return article;
};

const renderCategoryOptions = () => {
  const options = [
    '<option value="all">Todas</option>',
    ...uniqueCategories.map(
      (category) =>
        `<option value="${category}">${formatCategoryLabel(category)}</option>`
    )
  ];

  categorySelect.innerHTML = options.join('');
};

const renderProducts = (filteredProducts) => {
  if (!filteredProducts.length) {
    catalogGrid.innerHTML = `
      <article class="product-card">
        <h3>Sin resultados</h3>
        <p>No encontramos productos con esos filtros.</p>
      </article>
    `;
    return;
  }

  catalogGrid.innerHTML = '';
  filteredProducts.forEach((product) => {
    catalogGrid.appendChild(createProductCard(product));
  });
};

const applyFilters = () => {
  const searchValue = searchInput.value.trim().toLowerCase();
  const selectedCategory = categorySelect.value;

  const filteredProducts = activeProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchValue);
    const matchesCategory =
      selectedCategory === 'all' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  renderProducts(filteredProducts);
};

renderCategoryOptions();
renderProducts(activeProducts);

searchInput.addEventListener('input', applyFilters);
categorySelect.addEventListener('change', applyFilters);
