// File: scripts/checkout/paymentSummary.js  (UPDATED)
import { cart, clearCart, updateCartQuantity } from '../../data/cart.js';
import { getProduct } from '../../data/products.js';
import { getDeliveryOption } from '../../data/deliveryOptions.js';
import { formatMoney } from '../utils/money.js';
import { createOrderFromCart } from '../../data/orders.js';

export function renderPaymentSummary() {
  let productPriceCents = 0;
  let shippingPriceCents = 0;

  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId);
    if (!product) return; // WHY: stale cart safety
    productPriceCents += product.priceCents * cartItem.quantity;

    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionsId);
    shippingPriceCents += deliveryOption ? deliveryOption.priceCents : 0;
  });

  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
  const taxCents = Math.round(totalBeforeTaxCents * 0.1);
  const totalCents = totalBeforeTaxCents + taxCents;

  const paymentSummaryHTML = `
    <div class="payment-summary-title">Order Summary</div>

    <div class="payment-summary-row">
      <div>Items:</div>
      <div class="payment-summary-money">$${formatMoney(productPriceCents)}</div>
    </div>

    <div class="payment-summary-row">
      <div>Shipping &amp; handling:</div>
      <div class="payment-summary-money">$${formatMoney(shippingPriceCents)}</div>
    </div>

    <div class="payment-summary-row subtotal-row">
      <div>Total before tax:</div>
      <div class="payment-summary-money">$${formatMoney(totalBeforeTaxCents)}</div>
    </div>

    <div class="payment-summary-row">
      <div>Estimated tax (10%):</div>
      <div class="payment-summary-money">$${formatMoney(taxCents)}</div>
    </div>

    <div class="payment-summary-row total-row">
      <div>Order total:</div>
      <div class="payment-summary-money">$${formatMoney(totalCents)}</div>
    </div>

    <button class="place-order-button button-primary js-place-order">Place your order</button>
  `;

  document.querySelector('.js-payment-summary').innerHTML = paymentSummaryHTML;

  const btn = document.querySelector('.js-place-order');
  if (btn) {
    btn.addEventListener('click', () => {
      if (!cart.length) return;

      // Create order first
      const order = createOrderFromCart(cart, {
        productPriceCents,
        shippingPriceCents,
        totalBeforeTaxCents,
        taxCents,
        totalCents
      });

      // Capture first item BEFORE clearing (so we can pass productId to tracking)
      const firstItem = cart[0];

      clearCart();
      updateCartQuantity();

      // Build tracking URL with both orderId and productId for precise item display
      const url = new URL('tracking.html', window.location.origin);
      url.searchParams.set('orderId', order.id);
      if (firstItem?.productId) {
        url.searchParams.set('productId', firstItem.productId);
      }
      window.location.href = url.toString();
    });
  }
}
