import { products } from '../../data/products-v2.js';
import { addToCart } from './cart-v3.js';

const searchInput = document.querySelector('#search');
const categorySelect = document.querySelector('#category');
const catalogGrid = document.querySelector('#catalog-grid');

const customizationOverlay = document.querySelector('#customization-overlay');
const customizationModal = document.querySelector('#customization-modal');
const customizationClose = document.querySelector('#customization-close');
const customizationCancel = document.querySelector('#customization-cancel');
const customizationForm = document.querySelector('#customization-form');
const customizationProductName = document.querySelector('#customization-product-name');
const customizationColor = document.querySelector('#customization-color');
const customizationMaterial = document.querySelector('#customization-material');
const customizationExtras = document.querySelector('#customization-extras');
const customizationNote = document.querySelector('#customization-note');

if (
  !searchInput ||
  !categorySelect ||
  !catalogGrid ||
  !customizationOverlay ||
  !customizationModal ||
  !customizationForm ||
  !customizationProductName ||
  !customizationColor ||
  !customizationMaterial ||
  !customizationExtras ||
  !customizationNote
) {
  throw new Error('Catalog or customization UI elements were not found in index-v2.html');
}

const activeProducts = products.filter((product) => product.active);
let currentCustomProduct = null;

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

const slugify = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const closeCustomizationModal = () => {
  currentCustomProduct = null;
  customizationForm.reset();
  customizationExtras.innerHTML = '';
  customizationOverlay.hidden = true;
  customizationModal.hidden = true;
};

const openCustomizationModal = (product) => {
  currentCustomProduct = product;

  customizationProductName.textContent = product.name;
  customizationColor.innerHTML = '<option value="">Selecciona un color</option>';
  customizationMaterial.innerHTML = '<option value="">Selecciona un material</option>';
  customizationExtras.innerHTML = '';
  customizationNote.value = '';
  customizationNote.disabled = !product.customizationOptions?.allowCustomNote;

  (product.customizationOptions?.colors || []).forEach((color) => {
    const option = document.createElement('option');
    option.value = color;
    option.textContent = color;
    customizationColor.appendChild(option);
  });

  (product.customizationOptions?.materials || []).forEach((material) => {
    const option = document.createElement('option');
    option.value = material;
    option.textContent = material;
    customizationMaterial.appendChild(option);
  });

  (product.customizationOptions?.extras || []).forEach((extra, index) => {
    const wrapper = document.createElement('label');
    wrapper.style.display = 'block';
    wrapper.style.marginBottom = '0.5rem';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'extras';
    input.value = extra;
    input.id = `custom-extra-${index}`;

    wrapper.append(input, ` ${extra}`);
    customizationExtras.appendChild(wrapper);
  });

  customizationOverlay.hidden = false;
  customizationModal.hidden = false;
};

const buildCustomizedProduct = (product) => {
  const selectedColor = customizationColor.value.trim();
  const selectedMaterial = customizationMaterial.value.trim();
  const selectedExtras = [...customizationExtras.querySelectorAll('input[name="extras"]:checked')]
    .map((input) => input.value.trim());
  const note = customizationNote.value.trim();

  if (!selectedColor || !selectedMaterial) {
    alert('Selecciona color y material para continuar.');
    return null;
  }

  const customizationSummaryParts = [
    `Color: ${selectedColor}`,
    `Material: ${selectedMaterial}`
  ];

  if (selectedExtras.length) {
    customizationSummaryParts.push(`Extras: ${selectedExtras.join(', ')}`);
  }

  if (note) {
    customizationSummaryParts.push(`Nota: ${note}`);
  }

  const customizationKey = [
    product.id,
    selectedColor,
    selectedMaterial,
    selectedExtras.join('-'),
    note
  ]
    .map(slugify)
    .filter(Boolean)
    .join('__');

  return {
    ...product,
    id: customizationKey,
    name: `${product.name} · ${customizationSummaryParts.join(' | ')}`,
    customization: {
      color: selectedColor,
      material: selectedMaterial,
      extras: selectedExtras,
      note
    }
  };
};

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

  if (product.customizable) {
    button.textContent = 'Personalizar';
    button.addEventListener('click', () => {
      openCustomizationModal(product);
    });
  } else {
    button.textContent = 'Agregar al carrito';
    button.addEventListener('click', () => {
      addToCart(product);
    });
  }

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

customizationForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!currentCustomProduct) {
    return;
  }

  const customizedProduct = buildCustomizedProduct(currentCustomProduct);

  if (!customizedProduct) {
    return;
  }

  addToCart(customizedProduct);
  closeCustomizationModal();
});

customizationOverlay.addEventListener('click', closeCustomizationModal);
customizationClose.addEventListener('click', closeCustomizationModal);
customizationCancel.addEventListener('click', closeCustomizationModal);

renderCategoryOptions();
renderProducts(activeProducts);

searchInput.addEventListener('input', applyFilters);
categorySelect.addEventListener('change', applyFilters);
