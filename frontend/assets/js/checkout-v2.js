import { FRONTEND_CONFIG } from './config.js';

const checkoutItemsContainer = document.querySelector('#checkout-items');
const checkoutSummaryContainer = document.querySelector('#checkout-summary');

if (!checkoutItemsContainer || !checkoutSummaryContainer) {
  throw new Error('Checkout UI elements were not found in checkout.html');
}

const STORAGE_KEY = 'xijum_cart_v2';

const normalizeCartItem = (item) => {
  const quantity = Number(item?.quantity);
  const price = Number(item?.price);

  return {
    ...item,
    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    price: Number.isFinite(price) ? price : 0,
    currency: item?.currency || 'MXN'
  };
};

const formatPrice = (price, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency
  }).format(price);

const getStoredCart = () => {
  const rawCart = localStorage.getItem(STORAGE_KEY);

  if (!rawCart) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(rawCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart
      .map(normalizeCartItem)
      .filter((item) => item.id && item.name);
  } catch {
    return [];
  }
};

const cart = getStoredCart();

const getSubtotal = () =>
  cart.reduce((total, item) => total + item.price * item.quantity, 0);

const renderItems = () => {
  if (!cart.length) {
    checkoutItemsContainer.innerHTML = `
      <p>No hay productos en tu carrito.</p>
      <p><a href="../index.html#catalogo">Volver al catálogo</a></p>
    `;
    return;
  }

  checkoutItemsContainer.innerHTML = '';

  cart.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'product-card';

    article.innerHTML = `
      <h3>${item.name}</h3>
      <p>Cantidad: ${item.quantity}</p>
      <p>Precio unitario: ${formatPrice(item.price, item.currency)}</p>
      <p>Subtotal: ${formatPrice(item.price * item.quantity, item.currency)}</p>
    `;

    checkoutItemsContainer.appendChild(article);
  });
};

const startCheckout = async () => {
  try {
    const response = await fetch(
      `${FRONTEND_CONFIG.API_BASE_URL}/api/create-checkout-session`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: cart })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error(data.error || 'Unable to start checkout.');
    }

    window.location.href = data.url;
  } catch (error) {
    console.error(error);
    alert('No fue posible iniciar el pago. Intenta de nuevo.');
  }
};

const renderSummary = () => {
  const subtotal = getSubtotal();

  if (!cart.length) {
    checkoutSummaryContainer.innerHTML = `
      <p>Subtotal: ${formatPrice(0)}</p>
      <p>Total: ${formatPrice(0)}</p>
      <button type="button" disabled>Ir al pago seguro</button>
    `;
    return;
  }

  checkoutSummaryContainer.innerHTML = `
    <p>Subtotal: ${formatPrice(subtotal)}</p>
    <p>Total: ${formatPrice(subtotal)}</p>
    <button type="button" id="start-checkout">Ir al pago seguro</button>
  `;

  const startCheckoutButton = document.querySelector('#start-checkout');

  if (startCheckoutButton) {
    startCheckoutButton.addEventListener('click', async () => {
      startCheckoutButton.disabled = true;
      startCheckoutButton.textContent = 'Redirigiendo...';
      await startCheckout();
      startCheckoutButton.disabled = false;
      startCheckoutButton.textContent = 'Ir al pago seguro';
    });
  }
};

renderItems();
renderSummary();
