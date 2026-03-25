const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price priceCents images inventory');

    if (!cart) {
      // Create empty cart for user
      cart = await Cart.create({
        user: req.user._id,
        items: []
      });
    }

    // Filter out items with invalid products or out of stock
    const validItems = cart.items.filter(item => {
      if (!item.product) return false;
      if (item.product.inventory.trackQuantity && item.product.inventory.quantity <= 0) return false;
      return true;
    });

    // Update cart if items were filtered out
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json({
      success: true,
      data: {
        cart: {
          id: cart._id,
          items: cart.items.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            priceCents: item.product.priceCents,
            formattedPrice: `$${(item.product.priceCents / 100).toFixed(2)}`,
            quantity: item.quantity,
            subtotal: item.subtotal,
            formattedSubtotal: `$${(item.subtotal / 100).toFixed(2)}`,
            images: item.product.images,
            inventory: item.product.inventory,
            isInStock: item.product.isInStock(item.quantity),
            addedAt: item.addedAt
          })),
          itemCount: cart.getItemCount(),
          subtotal: cart.subtotal,
          formattedSubtotal: `$${(cart.subtotal / 100).toFixed(2)}`,
          tax: cart.tax,
          formattedTax: `$${(cart.tax / 100).toFixed(2)}`,
          shipping: cart.shipping,
          formattedShipping: `$${(cart.shipping / 100).toFixed(2)}`,
          total: cart.total,
          formattedTotal: `$${(cart.total / 100).toFixed(2)}`,
          isEmpty: cart.isEmpty()
        }
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching cart'
    });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', protect, [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10')
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

    const { productId, quantity = 1 } = req.body;

    // Check if product exists and is active
    const product = await Product.findOne({ 
      _id: productId, 
      isActive: true 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is in stock
    if (!product.isInStock(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock or insufficient quantity'
      });
    }

    // Get or create user's cart
    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: []
      });
    }

    // Add item to cart
    await cart.addItem(
      productId, 
      quantity, 
      product.price, 
      product.priceCents
    );

    // Get updated cart with populated items
    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price priceCents images inventory');

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cart: {
          id: updatedCart._id,
          items: updatedCart.items.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            priceCents: item.product.priceCents,
            formattedPrice: `$${(item.product.priceCents / 100).toFixed(2)}`,
            quantity: item.quantity,
            subtotal: item.subtotal,
            formattedSubtotal: `$${(item.subtotal / 100).toFixed(2)}`,
            images: item.product.images,
            inventory: item.product.inventory,
            isInStock: item.product.isInStock(item.quantity)
          })),
          itemCount: updatedCart.getItemCount(),
          subtotal: updatedCart.subtotal,
          formattedSubtotal: `$${(updatedCart.subtotal / 100).toFixed(2)}`,
          total: updatedCart.total,
          formattedTotal: `$${(updatedCart.total / 100).toFixed(2)}`
        }
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding item to cart'
    });
  }
});

// @route   PUT /api/cart/update
// @desc    Update cart item quantity
// @access  Private
router.put('/update', protect, [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10')
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

    const { productId, quantity } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Check if product exists and is active
    const product = await Product.findOne({ 
      _id: productId, 
      isActive: true 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is in stock
    if (!product.isInStock(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock or insufficient quantity'
      });
    }

    // Update item quantity
    await cart.updateItemQuantity(productId, quantity);

    // Get updated cart with populated items
    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price priceCents images inventory');

    res.json({
      success: true,
      message: 'Cart updated successfully',
      data: {
        cart: {
          id: updatedCart._id,
          items: updatedCart.items.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            priceCents: item.product.priceCents,
            formattedPrice: `$${(item.product.priceCents / 100).toFixed(2)}`,
            quantity: item.quantity,
            subtotal: item.subtotal,
            formattedSubtotal: `$${(item.subtotal / 100).toFixed(2)}`,
            images: item.product.images,
            inventory: item.product.inventory,
            isInStock: item.product.isInStock(item.quantity)
          })),
          itemCount: updatedCart.getItemCount(),
          subtotal: updatedCart.subtotal,
          formattedSubtotal: `$${(updatedCart.subtotal / 100).toFixed(2)}`,
          total: updatedCart.total,
          formattedTotal: `$${(updatedCart.total / 100).toFixed(2)}`
        }
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    if (error.message === 'Item not found in cart') {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating cart'
    });
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item from cart
    await cart.removeItem(productId);

    // Get updated cart with populated items
    const updatedCart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price priceCents images inventory');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: {
        cart: {
          id: updatedCart._id,
          items: updatedCart.items.map(item => ({
            id: item.product._id,
            name: item.product.name,
            price: item.product.price,
            priceCents: item.product.priceCents,
            formattedPrice: `$${(item.product.priceCents / 100).toFixed(2)}`,
            quantity: item.quantity,
            subtotal: item.subtotal,
            formattedSubtotal: `$${(item.subtotal / 100).toFixed(2)}`,
            images: item.product.images,
            inventory: item.product.inventory,
            isInStock: item.product.isInStock(item.quantity)
          })),
          itemCount: updatedCart.getItemCount(),
          subtotal: updatedCart.subtotal,
          formattedSubtotal: `$${(updatedCart.subtotal / 100).toFixed(2)}`,
          total: updatedCart.total,
          formattedTotal: `$${(updatedCart.total / 100).toFixed(2)}`
        }
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing item from cart'
    });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', protect, async (req, res) => {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Clear cart
    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: {
        cart: {
          id: cart._id,
          items: [],
          itemCount: 0,
          subtotal: 0,
          formattedSubtotal: '$0.00',
          total: 0,
          formattedTotal: '$0.00',
          isEmpty: true
        }
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error clearing cart'
    });
  }
});

module.exports = router;
