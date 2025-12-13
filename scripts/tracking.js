// File: scripts/tracking.js  (only the changed/added lines)
import { getOrderById } from '../data/orders.js';
import { getProduct } from '../data/products.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

function setText(sel, text) { const el = document.querySelector(sel); if (el) el.textContent = text; }
function setImage(sel, src, alt) { const el = document.querySelector(sel); if (el) { el.src = src; if (alt) el.alt = alt; } }

function stageFrom(iso) {
  const h = dayjs().diff(dayjs(iso), 'hour');
  if (h >= 48) return 3; if (h >= 24) return 2; if (h >= 4) return 1; return 0;
}
function renderProgress(stage) {
  const labels = document.querySelectorAll('.progress-labels-container .progress-label');
  labels.forEach((el, i) => el.classList.toggle('current-status', i === stage));
  const widths = ['0%', '33%', '66%', '100%'];
  const bar = document.querySelector('.progress-bar'); if (bar) bar.style.width = widths[stage];
}
const eta = (d) => dayjs().add(d, 'day').format('dddd, MMMM D');

(function init() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');
  const wantedProductId = params.get('productId'); // ✅ NEW
  const order = orderId ? getOrderById(orderId) : null;

  if (!order || !order.items?.length) {
    setText('.delivery-date', `Arriving on ${eta(5)}`);
    setText('.js-product-name', 'Mystery Item');
    setText('.js-product-qty', 'Quantity: 1');
    renderProgress(0);
    return;
  }

 
  const item =
    (wantedProductId && order.items.find(i => i.productId === wantedProductId))
    || order.items[0];

  const product = getProduct(item.productId);
  const optionDays = ({ '1': 7, '2': 3, '3': 1 }[item.deliveryOptionsId]) ?? 5;

  setText('.delivery-date', `Arriving on ${eta(optionDays)}`);
  setText('.js-product-name', product ? product.name : item.productId);
  setText('.js-product-qty', `Quantity: ${item.quantity}`);
  if (product?.image) setImage('.product-image', product.image, product?.name);

  renderProgress(stageFrom(order.placedAt));
})();
