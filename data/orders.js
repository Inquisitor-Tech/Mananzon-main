const ORDERS_KEY = 'orders';

function loadOrders() {
  const raw = localStorage.getItem(ORDERS_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  return Array.isArray(arr) ? arr : [];
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

function genId() {
  return (crypto?.randomUUID?.() ?? `oid-${Date.now()}-${Math.random().toString(16).slice(2)}`);
}

export function createOrderFromCart(cart, totalsCents) {
  const orders = loadOrders();
  const order = {
    id: genId(),
    items: cart.map((c) => ({
      productId: c.productId,
      quantity: c.quantity,
      deliveryOptionsId: c.deliveryOptionsId
    })),
    totalsCents,                 // { productPriceCents, shippingPriceCents, totalBeforeTaxCents, taxCents, totalCents }
    placedAt: new Date().toISOString()
  };
  orders.unshift(order);
  saveOrders(orders);
  return order;
}

export function getOrderById(orderId) {
  return loadOrders().find((o) => o.id === orderId);
}