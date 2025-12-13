import { cart, removeFromCart, updateDeliveryOption } from '../../data/cart.js';
import { getProduct } from '../../data/products.js';
import { deliveryOptions, getDeliveryOption } from '../../data/deliveryOptions.js';
import { formatMoney } from '../utils/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { renderPaymentSummary } from './paymentSummary.js';

function deliveryOptionsHTML(product, cartItem) {
  let html = '';
  deliveryOptions.forEach((deliveryOption) => {
    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
    const priceString = deliveryOption.priceCents === 0 ? 'FREE' : `$${formatMoney(deliveryOption.priceCents)} -`;
    const dateString = deliveryDate.format('dddd, MMMM D');
    const isChecked = deliveryOption.id === cartItem.deliveryOptionsId;

    html += `
      <div class="delivery-option js-delivery-option"
        data-product-id="${cartItem.productId}"
        data-delivery-option-id="${deliveryOption.id}">
        <input type="radio" class="delivery-option-input" name="delivery-option-${product.id}" ${isChecked ? 'checked' : ''}>
        <div>
          <div class="delivery-option-date">${dateString}</div>
          <div class="delivery-option-price">${priceString} Shipping</div>
        </div>
      </div>
    `;
  });
  return html;
}

export function renderOrderSummary() {
  let cartSummaryHTML = '';

  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId);
    if (!product) return;

    let deliveryOption = getDeliveryOption(cartItem.deliveryOptionsId);
    if (!deliveryOption) {
      deliveryOption = deliveryOptions[0];
      updateDeliveryOption(cartItem.productId, deliveryOption.id);
    }

    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
    const formattedDate = deliveryDate.format('dddd, MMMM D');

    cartSummaryHTML += `
      <div class="cart-item-container js-cart-item-container-${product.id}">
        <div class="delivery-date">Delivery date: ${formattedDate}</div>

        <div class="cart-item-details-grid">
          <img class="product-image" src="${product.image}" alt="${product.name}" />
          <div class="cart-item-details">
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${formatMoney(product.priceCents)}</div>
            <div class="product-quantity">
              <span>Quantity: <span class="quantity-label">${cartItem.quantity}</span></span>
              <span class="update-quantity-link link-primary">Update</span>
              <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${product.id}">Delete</span>
            </div>
          </div>
          <div class="delivery-options">
            <div class="delivery-options-title">Choose a delivery option:</div>
            ${deliveryOptionsHTML(product, cartItem)}
          </div>
        </div>
      </div>
    `;
  });

  document.querySelector('.js-order-summary').innerHTML = cartSummaryHTML;

  document.querySelectorAll('.js-delete-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      removeFromCart(productId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });

  document.querySelectorAll('.js-delivery-option').forEach((el) => {
    el.addEventListener('click', () => {
      const { productId, deliveryOptionId } = el.dataset;
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });
}