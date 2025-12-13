// File: scripts/orders-render.js (NEW)
import { getProduct } from '../data/products.js';
import { getDeliveryOption } from '../data/deliveryOptions.js';
import { formatMoney } from './utils/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

// Load orders from localStorage (created by createOrderFromCart)
function loadOrders() {
  try {
    const raw = localStorage.getItem('orders');
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function formatDate(isoOrDate) {
  const d = dayjs(isoOrDate);
  return d.isValid() ? d.format('MMMM D') : '—';
}

function renderOrders() {
  const grid = document.querySelector('.js-orders-grid');
  const empty = document.querySelector('.js-no-orders');
  const orders = loadOrders();

  if (!orders.length) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  const html = orders.map((order) => {
    // Order header totals (optional; using saved totals if present)
    const totals = order.totalsCents || {};
    const orderPlaced = order.placedAt || new Date().toISOString();
    const totalMoney = totals.totalCents != null ? `$${formatMoney(totals.totalCents)}` : '—';

    const itemsHTML = (order.items || []).map((it) => {
      const p = getProduct(it.productId);
      const img = p?.image ?? 'images/products/placeholder.png';
      const name = p?.name ?? it.productId;
      const qty = it.quantity ?? 1;
      const delivery = getDeliveryOption(it.deliveryOptionsId) || { deliveryDays: 5 };
      // Fake ETA similar to tracking logic
      const eta = dayjs(orderPlaced).add((delivery.deliveryDays ?? 5), 'day').format('MMMM D');

      return `
        <div class="product-image-container">
          <img src="${img}" alt="${name}" />
        </div>

        <div class="product-details">
          <div class="product-name">${name}</div>
          <div class="product-delivery-date">Arriving on: ${eta}</div>
          <div class="product-quantity">Quantity: ${qty}</div>
          <button class="buy-again-button button-primary js-buy-again" data-product-id="${it.productId}">
            <img class="buy-again-icon" src="images/icons/buy-again.png" alt="" />
            <span class="buy-again-message">Buy it again</span>
          </button>
        </div>

        <div class="product-actions">
          <button
            class="track-package-button button-secondary js-track"
            data-order-id="${order.id}"
            data-product-id="${it.productId}">
            Track package
          </button>
        </div>
      `;
    }).join('');

    return `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${formatDate(orderPlaced)}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div>${totalMoney}</div>
            </div>
          </div>
          <div class="order-header-right-section">
            <div class="order-header-label">Order ID:</div>
            <div>${order.id}</div>
          </div>
        </div>

        <div class="order-details-grid">
          ${itemsHTML}
        </div>
      </div>
    `;
  }).join('');

  grid.innerHTML = html;

  // Wire “Track package” → tracking.html?orderId=...&productId=...
  grid.querySelectorAll('.js-track').forEach((btn) => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.orderId;
      const productId = btn.dataset.productId;
      const url = new URL('tracking.html', window.location.origin);
      if (orderId) url.searchParams.set('orderId', orderId);
      if (productId) url.searchParams.set('productId', productId);
      window.location.href = url.toString();
    });
  });

  // (Optional) Wire “Buy it again” to add to cart
  // If you want this live, import addToCart & updateCartQuantity from data/cart.js and call them here.
}

renderOrders();
