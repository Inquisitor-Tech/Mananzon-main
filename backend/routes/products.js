const express = require('express');
const { query } = require('express-validator');
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['wand', 'book', 'ingredient', 'clothing', 'creature', 'other']).withMessage('Invalid category'),
  query('sort').optional().isIn(['name-asc', 'name-desc', 'price-low', 'price-high', 'rating', 'newest']).withMessage('Invalid sort option'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search query must be between 1 and 100 characters'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be a positive number')
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
      page = 1,
      limit = 20,
      category,
      sort = 'name-asc',
      search,
      minPrice,
      maxPrice,
      featured
    } = req.query;

    // Build query
    const query = { isActive: true };

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.priceCents = {};
      if (minPrice) query.priceCents.$gte = Math.round(minPrice * 100);
      if (maxPrice) query.priceCents.$lte = Math.round(maxPrice * 100);
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    let sortOptions = {};
    switch (sort) {
      case 'name-asc':
        sortOptions.name = 1;
        break;
      case 'name-desc':
        sortOptions.name = -1;
        break;
      case 'price-low':
        sortOptions.priceCents = 1;
        break;
      case 'price-high':
        sortOptions.priceCents = -1;
        break;
      case 'rating':
        sortOptions['rating.stars'] = -1;
        sortOptions['rating.count'] = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      default:
        sortOptions.name = 1;
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Execute query
    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('rating'),
      Product.countDocuments(query)
    ]);

    // Calculate pagination info
    const pages = Math.ceil(total / limit);
    const hasNextPage = page < pages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        products: products.map(product => ({
          id: product._id,
          name: product.name,
          description: product.description.substring(0, 200) + '...',
          price: product.price,
          priceCents: product.priceCents,
          formattedPrice: product.formattedPrice,
          category: product.category,
          images: product.images,
          rating: product.rating,
          keywords: product.keywords,
          inventory: product.inventory,
          isFeatured: product.isFeatured,
          tags: product.tags,
          createdAt: product.createdAt
        })),
        pagination: {
          currentPage: parseInt(page),
          pages,
          total,
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        },
        filters: {
          category,
          sort,
          search,
          minPrice,
          maxPrice,
          featured
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching products'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      isActive: true 
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is in user's wishlist (if authenticated)
    let isInWishlist = false;
    if (req.user) {
      const user = await User.findById(req.user._id);
      isInWishlist = user.wishlist.includes(product._id);
    }

    res.json({
      success: true,
      data: {
        product: {
          id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          priceCents: product.priceCents,
          formattedPrice: product.formattedPrice,
          category: product.category,
          type: product.type,
          images: product.images,
          inventory: product.inventory,
          sku: product.sku,
          rating: product.rating,
          keywords: product.keywords,
          attributes: product.attributes,
          shipping: product.shipping,
          tags: product.tags,
          isFeatured: product.isFeatured,
          isInWishlist,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error fetching product'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories with counts
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        categories: categories.map(cat => ({
          name: cat._id,
          count: cat.count,
          displayName: cat._id.charAt(0).toUpperCase() + cat._id.slice(1)
        }))
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching categories'
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .sort({ 'rating.stars': -1, 'rating.count': -1 })
    .limit(12);

    res.json({
      success: true,
      data: {
        products: products.map(product => ({
          id: product._id,
          name: product.name,
          price: product.price,
          priceCents: product.priceCents,
          formattedPrice: product.formattedPrice,
          category: product.category,
          images: product.images,
          rating: product.rating,
          isFeatured: product.isFeatured
        }))
      }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching featured products'
    });
  }
});

// @route   GET /api/products/search/suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/search/suggestions', [
  query('q').isLength({ min: 2, max: 50 }).withMessage('Query must be between 2 and 50 characters')
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

    const { q } = req.query;
    const limit = 10;

    // Search for product names and keywords
    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { keywords: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .select('name keywords category')
    .limit(limit);

    // Extract unique suggestions
    const suggestions = new Set();
    
    products.forEach(product => {
      // Add product name if it matches
      if (product.name.toLowerCase().includes(q.toLowerCase())) {
        suggestions.add(product.name);
      }
      
      // Add matching keywords
      product.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(q.toLowerCase())) {
          suggestions.add(keyword);
        }
      });
    });

    res.json({
      success: true,
      data: {
        suggestions: Array.from(suggestions).slice(0, limit)
      }
    });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching search suggestions'
    });
  }
});

module.exports = router;
