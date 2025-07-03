const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['rings', 'necklaces', 'earrings', 'bracelets', 'pendants', 'chains', 'watches', 'accessories'],
      message: 'Category must be one of: rings, necklaces, earrings, bracelets, pendants, chains, watches, accessories'
    },
    lowercase: true
  },
  imageUrl: {
    type: String,
    trim: true,
    default: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock quantity cannot be negative'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  material: {
    type: String,
    trim: true
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });

// Virtual for availability
productSchema.virtual('inStock').get(function() {
  return this.stockQuantity > 0;
});

// Auto-generate SKU if not provided
productSchema.pre('save', function(next) {
  if (!this.sku && this.isNew) {
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    this.sku = `${categoryCode}${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);