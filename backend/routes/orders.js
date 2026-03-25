const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/orders
// @desc    Get user's orders with pagination
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    // Build query
    const query = { user: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.product', 'name images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query)
    ]);

    // Calculate pagination info
    const pages = Math.ceil(total / limit);
    const hasNextPage = page < pages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        orders: orders.map(order => ({
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          items: order.items.map(item => ({
            product: {
              id: item.product._id,
              name: item.product.name,
              images: item.product.images
            },
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            formattedSubtotal: `$${(item.subtotal / 100).toFixed(2)}`
          })),
          subtotal: order.subtotal,
          formattedSubtotal: `$${(order.subtotal / 100).toFixed(2)}`,
          shippingCost: order.shippingCost,
          formattedShippingCost: `$${(order.shippingCost / 100).toFixed(2)}`,
          tax: order.tax,
          formattedTax: `$${(order.tax / 100).toFixed(2)}`,
          total: order.total,
          formattedTotal: `$${(order.total / 100).toFixed(2)}`,
          shippingMethod: order.shippingMethod,
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery,
          createdAt: order.createdAt,
          confirmedAt: order.confirmedAt,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt
        })),
        pagination: {
          currentPage: parseInt(page),
          pages,
          total,
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product', 'name images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          items: order.items.map(item => ({
            product: {
              id: item.product._id,
              name: item.product.name,
              description: item.product.description,
              images: item.product.images
            },
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            formattedSubtotal: `$${(item.subtotal / 100).toFixed(2)}`
          })),
          shippingAddress: order.shippingAddress,
          billingAddress: order.billingAddress,
          paymentMethod: {
            type: order.paymentMethod.type,
            cardType: order.paymentMethod.cardType,
            last4: order.paymentMethod.last4,
            status: order.paymentMethod.status
          },
          subtotal: order.subtotal,
          formattedSubtotal: `$${(order.subtotal / 100).toFixed(2)}`,
          shippingCost: order.shippingCost,
          formattedShippingCost: `$${(order.shippingCost / 100).toFixed(2)}`,
          tax: order.tax,
          formattedTax: `$${(order.tax / 100).toFixed(2)}`,
          discount: order.discount,
          formattedDiscount: `$${(order.discount / 100).toFixed(2)}`,
          total: order.total,
          formattedTotal: `$${(order.total / 100).toFixed(2)}`,
          shippingMethod: order.shippingMethod,
          shippingCarrier: order.shippingCarrier,
          trackingNumber: order.trackingNumber,
          estimatedDelivery: order.estimatedDelivery,
          actualDelivery: order.actualDelivery,
          customerNotes: order.customerNotes,
          adminNotes: order.adminNotes,
          refunds: order.refunds,
          createdAt: order.createdAt,
          confirmedAt: order.confirmedAt,
          shippedAt: order.shippedAt,
          deliveredAt: order.deliveredAt,
          cancelledAt: order.cancelledAt
        }
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
});

// @route   POST /api/orders/create
// @desc    Create new order from cart
// @access  Private
router.post('/create', protect, [
  body('shippingAddress.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('shippingAddress.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required'),
  body('shippingAddress.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('paymentMethod.type')
    .isIn(['credit_card', 'debit_card', 'paypal', 'stripe'])
    .withMessage('Invalid payment method'),
  body('shippingMethod')
    .isIn(['standard', 'express', 'overnight'])
    .withMessage('Invalid shipping method')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      shippingAddress,
      billingAddress = shippingAddress,
      paymentMethod,
      shippingMethod = 'standard',
      customerNotes = ''
    } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Check if all items are in stock
    for (const cartItem of cart.items) {
      if (!cartItem.product.isActive) {
        return res.status(400).json({
          success: false,
          message: `${cartItem.product.name} is no longer available`
        });
      }

      if (!cartItem.product.isInStock(cartItem.quantity)) {
        return res.status(400).json({
          success: false,
          message: `${cartItem.product.name} is out of stock or insufficient quantity`
        });
      }
    }

    // Calculate shipping cost (simplified)
    let shippingCost = 0;
    switch (shippingMethod) {
      case 'standard':
        shippingCost = 500; // $5.00
        break;
      case 'express':
        shippingCost = 1500; // $15.00
        break;
      case 'overnight':
        shippingCost = 2500; // $25.00
        break;
    }

    // Calculate tax (simplified - 8%)
    const tax = Math.round(cart.subtotal * 0.08);

    // Calculate total
    const total = cart.subtotal + shippingCost + tax;

    // Create order items
    const orderItems = cart.items.map(cartItem => ({
      product: cartItem.product._id,
      quantity: cartItem.quantity,
      price: cartItem.product.price,
      priceCents: cartItem.product.priceCents,
      subtotal: cartItem.subtotal
    }));

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress,
      paymentMethod: {
        type: paymentMethod.type,
        cardType: paymentMethod.cardType,
        last4: paymentMethod.last4,
        status: 'completed' // Simplified - in real app, this would be verified with payment gateway
      },
      subtotal: cart.subtotal,
      shippingCost,
      tax,
      total,
      shippingMethod,
      customerNotes,
      status: 'confirmed',
      confirmedAt: new Date()
    });

    // Decrease product inventory
    for (const cartItem of cart.items) {
      await cartItem.product.decreaseInventory(cartItem.quantity);
    }

    // Clear cart
    await cart.clearCart();

    // Get populated order
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: {
          id: populatedOrder._id,
          orderNumber: populatedOrder.orderNumber,
          status: populatedOrder.status,
          items: populatedOrder.items.map(item => ({
            product: {
              id: item.product._id,
              name: item.product.name,
              images: item.product.images
            },
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
            formattedSubtotal: `$${(item.subtotal / 100).toFixed(2)}`
          })),
          subtotal: populatedOrder.subtotal,
          formattedSubtotal: `$${(populatedOrder.subtotal / 100).toFixed(2)}`,
          shippingCost: populatedOrder.shippingCost,
          formattedShippingCost: `$${(populatedOrder.shippingCost / 100).toFixed(2)}`,
          tax: populatedOrder.tax,
          formattedTax: `$${(populatedOrder.tax / 100).toFixed(2)}`,
          total: populatedOrder.total,
          formattedTotal: `$${(populatedOrder.total / 100).toFixed(2)}`,
          shippingMethod: populatedOrder.shippingMethod,
          shippingAddress: populatedOrder.shippingAddress,
          createdAt: populatedOrder.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
});

// @route   POST /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.post('/:id/cancel', protect, [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
], async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    await order.updateStatus('cancelled', reason || 'Customer requested cancellation');

    // Restore product inventory
    for (const orderItem of order.items) {
      const product = await Product.findById(orderItem.product);
      if (product) {
        product.inventory.quantity += orderItem.quantity;
        await product.save();
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        order: {
          id: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          cancelledAt: order.cancelledAt
        }
      }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    if (error.message.includes('Invalid status transition')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error cancelling order'
    });
  }
});

module.exports = router;
