const CART_KEYS = ['xijum_cart_v2', 'xijum_cart'];

CART_KEYS.forEach((key) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
});
