const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size: String,
  color: String,
  colorHex: String,
  sku: { type: String, unique: true, sparse: true },
  stock: { type: Number, default: 0 },
  price: Number,
  images: [{ url: String, publicId: String }]
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, lowercase: true }, // unique creates index automatically
  description: { type: String, required: true },
  shortDescription: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: String,
  brand: { type: String, default: 'Maison Luxe' },
  gender: { type: String, enum: ['men', 'women', 'unisex', 'kids'] },
  basePrice: { type: Number, required: true },
  salePrice: Number,
  isOnSale: { type: Boolean, default: false },
  salePercentage: Number,
  images: [{
    url: { type: String, required: true },
    publicId: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  variants: [variantSchema],
  sizes: [String],
  colors: [{
    name: String,
    hex: String
  }],
  material: String,
  careInstructions: [String],
  features: [String],
  tags: [String],
  isNewProduct: { type: Boolean, default: false }, // Changed from 'isNew' to 'isNewProduct'
  isFeatured: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  weight: Number,
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  views: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  seoTitle: String,
  seoDescription: String
}, { timestamps: true });

// Create slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  if (this.isOnSale && this.salePrice) {
    this.salePercentage = Math.round(((this.basePrice - this.salePrice) / this.basePrice) * 100);
  }
  next();
});

// Indexes - REMOVED duplicate slug index (unique: true already creates it)
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
// productSchema.index({ slug: 1 }); // REMOVED - duplicate of unique:true

module.exports = mongoose.model('Product', productSchema);