const STORAGE_KEY = 'xijum_cart';

const getStoredCart = () => {
  const rawCart = localStorage.getItem(STORAGE_KEY);

  if (!rawCart) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(rawCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
};

const cart = getStoredCart();

const cartItemsContainer = document.querySelector('.cart-items');
const summaryContent = document.querySelector('.summary-content');

if (!cartItemsContainer || !summaryContent) {
  throw new Error('Cart UI elements were not found in index.html');
}

const saveCart = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
};

const formatPrice = (price, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency
  }).format(price);

const getSubtotal = () =>
  cart.reduce((total, item) => total + item.price * item.quantity, 0);

const renderSummary = () => {
  const subtotal = getSubtotal();

  summaryContent.innerHTML = `
    <p>Subtotal: ${formatPrice(subtotal)}</p>
    <p>Total: ${formatPrice(subtotal)}</p>
    <button type="button" id="go-to-checkout" ${cart.length ? '' : 'disabled'}>
      Continuar al pago
    </button>
  `;

  const goToCheckoutButton = document.querySelector('#go-to-checkout');

  if (goToCheckoutButton && cart.length) {
    goToCheckoutButton.addEventListener('click', () => {
      window.location.href = './pages/checkout.html';
    });
  }
};

export const renderCart = () => {
  if (!cart.length) {
    cartItemsContainer.innerHTML = '<p>Tu carrito está vacío.</p>';
    renderSummary();
    return;
  }

  cartItemsContainer.innerHTML = '';

  cart.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'product-card';

    article.innerHTML = `
      <h3>${item.name}</h3>
      <p>Cantidad: ${item.quantity}</p>
      <p>Precio unitario: ${formatPrice(item.price, item.currency)}</p>
      <p>Subtotal: ${formatPrice(item.price * item.quantity, item.currency)}</p>
    `;

    cartItemsContainer.appendChild(article);
  });

  renderSummary();
};

export const addToCart = (product) => {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
};

renderCart();
