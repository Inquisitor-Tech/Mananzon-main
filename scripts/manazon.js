
import { cart, addToCart, updateCartQuantity } from '../data/cart.js';
import { products } from '../data/products.js';
import { formatMoney } from './utils/money.js';

function renderProducts() {
  const grid = document.querySelector('.js-product-grid');
  let html = '';

  products.forEach((product) => {
    html += `
      <div class="product-container" data-product-id="${product.id}">
        <div class="product-image-container">
          <img class="product-image" src="${product.image}" alt="${product.name}" />
        </div>

        <div class="product-name limit-text-to-2-lines">${product.name}</div>

        <div class="product-rating-container">
          <img class="product-rating-stars" src="images/ratings/rating-${product.rating.stars * 10}.png" alt="${product.rating.stars} stars" />
          <div class="product-rating-count link-primary">${product.rating.count}</div>
        </div>

        <div class="product-price">$${formatMoney(product.priceCents)}</div>

        <div class="product-quantity-container">
          <select class="js-qty">
            ${Array.from({ length: 10 }, (_, i) => i + 1)
              .map((n) => `<option value="${n}" ${n === 1 ? 'selected' : ''}>${n}</option>`)
              .join('')}
          </select>
        </div>

        <div class="product-spacer"></div>

        <div class="added-to-cart js-added" aria-live="polite">
          <img src="images/icons/checkmark.png" alt="" />
          Added
        </div>

        <button class="add-to-cart-button button-primary js-add-to-cart" data-product-id="${product.id}">
          Add to Cart
        </button>
      </div>
    `;
  });

  grid.innerHTML = html;
}

function wireEvents() {
  document.querySelectorAll('.js-add-to-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      const container = btn.closest('.product-container');
      const productId = btn.dataset.productId;
      const qty = Number(container.querySelector('.js-qty').value) || 1;

      addToCart(productId, qty);
      updateCartQuantity(); // Update badge immediately

      // Brief “Added” feedback
      const added = container.querySelector('.js-added');
      added.classList.add('visible'); // assumes CSS transitions
      setTimeout(() => added.classList.remove('visible'), 1200);
    });
  });

  // Initialize cart badge on page load
  updateCartQuantity();
}

renderProducts();
wireEvents();
