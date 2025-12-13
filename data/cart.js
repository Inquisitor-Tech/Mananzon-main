export let cart = JSON.parse(localStorage.getItem('cart'));

if (!Array.isArray(cart)) {
  cart = [
    { productId: 'wand-unicorn-hair-001', quantity: 2, deliveryOptionsId: '1' },
    { productId: 'dragon-egg-001',       quantity: 1, deliveryOptionsId: '2' }
  ];
  saveToStorage();
}

export function saveToStorage() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(productId, quantity = 1) {
  const existing = cart.find((c) => c.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity, deliveryOptionsId: '1' });
  }
  saveToStorage();
  updateCartQuantity(); // keep header badge in sync
}

export function updateCartQuantity() {
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);
  const el = document.querySelector('.js-cart-quantity');
  if (el) el.textContent = String(total);
}

export function removeFromCart(productId) {
  cart = cart.filter((c) => c.productId !== productId);
  saveToStorage();
  updateCartQuantity();
}


export function updateDeliveryOption(productId, deliveryOptionId) {
  const item = cart.find((c) => c.productId === productId);
  if (!item) return; // defensive: stale product
  item.deliveryOptionsId = deliveryOptionId;
  saveToStorage();
}

export function clearCart() {
  cart = [];
  saveToStorage();
  updateCartQuantity();
}