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
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  priceCents: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['wand', 'book', 'ingredient', 'clothing', 'creature', 'other']
  },
  type: {
    type: String,
    enum: ['physical', 'digital'],
    default: 'physical'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  inventory: {
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    trackQuantity: {
      type: Boolean,
      default: true
    }
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  rating: {
    stars: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  keywords: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  attributes: {
    material: String,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inches'],
        default: 'cm'
      }
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['g', 'kg', 'oz', 'lbs'],
        default: 'g'
      }
    },
    color: String,
    size: String,
    sizeChartLink: String
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    requiresSpecialHandling: {
      type: Boolean,
      default: false
    }
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
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
    lowercase: true
  }]
}, {
  timestamps: true
});

// Index for search functionality
productSchema.index({ name: 'text', description: 'text', keywords: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.stars': -1 });
productSchema.index({ isActive: 1 });

// Virtual for formatted price
productSchema.virtual('formattedPrice').get(function() {
  return `$${(this.priceCents / 100).toFixed(2)}`;
});

// Method to update rating
productSchema.methods.updateRating = function(newRating) {
  const totalRatings = this.rating.count + 1;
  const averageRating = ((this.rating.stars * this.rating.count) + newRating) / totalRatings;
  
  this.rating.stars = Math.round(averageRating * 10) / 10;
  this.rating.count = totalRatings;
  
  return this.save();
};

// Method to check if product is in stock
productSchema.methods.isInStock = function(quantity = 1) {
  if (!this.inventory.trackQuantity) return true;
  return this.inventory.quantity >= quantity;
};

// Method to decrease inventory
productSchema.methods.decreaseInventory = function(quantity = 1) {
  if (!this.inventory.trackQuantity) return this;
  
  this.inventory.quantity -= quantity;
  return this.save();
};

// Pre-save middleware to ensure priceCents matches price
productSchema.pre('save', function(next) {
  if (this.isModified('price')) {
    this.priceCents = Math.round(this.price * 100);
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
