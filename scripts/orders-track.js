// File: scripts/orders-track.js  (NEW)
import { getOrderById } from '../data/orders.js';

// Grab the latest order (the one you just placed from cart)
function getLatestOrder() {
  try {
    const raw = localStorage.getItem('orders');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) && arr.length ? arr[0] : null; // newest was unshifted
  } catch {
    return null;
  }
}

const latest = getLatestOrder();

document.querySelectorAll('.js-track').forEach((btn) => {
  btn.addEventListener('click', () => {
    const productId = btn.dataset.productId;
    if (!latest) {
     
      window.location.href = 'tracking.html';
      return;
    }
   
    window.location.href = `tracking.html?orderId=${encodeURIComponent(latest.id)}&productId=${encodeURIComponent(productId)}`;
  });
});
