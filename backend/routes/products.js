const express = require('express');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { validateProduct, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      isActive,
      isFeatured,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 20,
      sort = 'createdAt'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) filter.category = category.toLowerCase();
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    if (search) {
      filter.$text = { $search: search };
    }

    // If not admin, only show active products
    if (!req.user || !req.user.isAdmin) {
      filter.isActive = true;
    }

    // Build sort object
    const sortOptions = {};
    switch (sort) {
      case 'price-asc':
        sortOptions.price = 1;
        break;
      case 'price-desc':
        sortOptions.price = -1;
        break;
      case 'name':
        sortOptions.name = 1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      default:
        sortOptions.createdAt = -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', optionalAuth, validateObjectId, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    
    // If not admin, only show active products
    if (!req.user || !req.user.isAdmin) {
      filter.isActive = true;
    }

    const product = await Product.findOne(filter);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post('/', authenticateToken, requireAdmin, validateProduct, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', authenticateToken, requireAdmin, validateObjectId, validateProduct, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/products/:id/stock
// @desc    Update product stock
// @access  Private/Admin
router.put('/:id/stock', authenticateToken, requireAdmin, validateObjectId, async (req, res) => {
  try {
    const { stockQuantity } = req.body;

    if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
      return res.status(400).json({ error: 'Invalid stock quantity' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stockQuantity },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      message: 'Stock updated successfully',
      product
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/products/categories/list
// @desc    Get all product categories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;