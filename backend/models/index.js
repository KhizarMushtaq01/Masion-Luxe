const mongoose = require('mongoose');

// ─── Category ───────────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, lowercase: true }, // unique creates index automatically
  description: String,
  image: { url: String, publicId: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  gender: { type: String, enum: ['men', 'women', 'unisex', 'kids', 'all'], default: 'all' }
}, { timestamps: true });

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

// ─── Order ───────────────────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  size: String,
  color: String,
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  totalPrice: Number
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  shippingAddress: {
    firstName: String,
    lastName: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  billingAddress: {
    firstName: String,
    lastName: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  paymentMethod: { type: String, enum: ['card', 'paypal', 'cod'], default: 'card' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  stripePaymentIntentId: String,
  orderStatus: {
    type: String,
    enum: ['pending', 'pending_payment', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'],
    default: 'pending'
  },
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  couponCode: String,
  total: { type: Number, required: true },
  notes: String,
  trackingNumber: String,
  trackingUrl: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  statusHistory: [{
    status: String,
    note: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

orderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ML' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  this.items.forEach(item => { item.totalPrice = item.price * item.quantity; });
  next();
});

const Order = mongoose.model('Order', orderSchema);

// ─── Cart ─────────────────────────────────────────────────────────────────────
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 },
    size: String,
    color: String,
    price: Number
  }],
  couponCode: String,
  discountAmount: { type: Number, default: 0 }
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

// ─── Review ───────────────────────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, required: true, maxlength: 100 },
  body: { type: String, required: true, maxlength: 2000 },
  images: [{ url: String, publicId: String }],
  isVerifiedPurchase: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  helpfulVotes: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 }
}, { timestamps: true });

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

// ─── Newsletter ───────────────────────────────────────────────────────────────
const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  isActive: { type: Boolean, default: true },
  subscribedAt: { type: Date, default: Date.now },
  unsubscribedAt: Date,
  source: { type: String, default: 'website' }
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// ─── Coupon ───────────────────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  description: String,
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxUses: Number,
  usedCount: { type: Number, default: 0 },
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  validFrom: { type: Date, default: Date.now },
  validUntil: Date,
  isActive: { type: Boolean, default: true },
  applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

const Coupon = mongoose.model('Coupon', couponSchema);

// ─── Activity Log ─────────────────────────────────────────────────────────────
const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  resource: String,
  resourceId: mongoose.Schema.Types.ObjectId,
  details: mongoose.Schema.Types.Mixed,
  ip: String,
  userAgent: String
}, { timestamps: true });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = { Category, Order, Cart, Review, Newsletter, Coupon, ActivityLog };