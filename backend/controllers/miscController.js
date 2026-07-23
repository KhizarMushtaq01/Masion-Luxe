const { Cart, Review, Newsletter, Coupon, ActivityLog } = require('../models/index');
const Product = require('../models/Product');
const User = require('../models/User');
const { Order } = require('../models/index');
const { sendTemplateEmail } = require('../utils/email');

// ─── Cart ─────────────────────────────────────────────────────────────────────
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images basePrice salePrice isOnSale stock slug');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    // Filter out inactive products
    cart.items = cart.items.filter(item => item.product && item.product.isActive !== false);
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive) return res.status(404).json({ success: false, message: 'Product not found.' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existing = cart.items.find(i => i.product.toString() === productId && i.size === size && i.color === color);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.stock);
    } else {
      cart.items.push({ product: productId, quantity, size, color, price: product.salePrice || product.basePrice });
    }

    await cart.save();
    await cart.populate('items.product', 'name images basePrice salePrice isOnSale stock slug');
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart.' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.product', 'name images basePrice salePrice isOnSale stock slug');
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });
    cart.items = cart.items.filter(i => i._id.toString() !== req.params.itemId);
    await cart.save();
    await cart.populate('items.product', 'name images basePrice salePrice isOnSale stock slug');
    res.json({ success: true, cart });
  } catch (err) { next(err); }
};

exports.clearCart = async (req, res, next) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], couponCode: null, discountAmount: 0 });
    res.json({ success: true, message: 'Cart cleared.' });
  } catch (err) { next(err); }
};

exports.applyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'basePrice salePrice');
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    if (coupon.validUntil && coupon.validUntil < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired.' });
    }
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit.' });
    }

    const subtotal = cart.items.reduce((sum, item) => sum + (item.price || item.product?.basePrice || 0) * item.quantity, 0);
    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({ success: false, message: `Minimum order amount is $${coupon.minOrderAmount}.` });
    }

    const discount = coupon.discountType === 'percentage'
      ? (subtotal * coupon.discountValue) / 100
      : Math.min(coupon.discountValue, subtotal);

    cart.couponCode = coupon.code;
    cart.discountAmount = discount;
    await cart.save();

    res.json({ success: true, message: 'Coupon applied!', discount, couponCode: coupon.code });
  } catch (err) { next(err); }
};

// ─── Reviews ─────────────────────────────────────────────────────────────────
exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, title, body } = req.body;

    const existing = await Review.findOne({ product: productId, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this product.' });

    // Check if user purchased this product
    const purchased = await Order.findOne({
      user: req.user._id,
      'items.product': productId,
      orderStatus: 'delivered'
    });

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      title,
      body,
      isVerifiedPurchase: !!purchased
    });

    // Update product ratings
    const reviews = await Review.find({ product: productId, isApproved: true });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Product.findByIdAndUpdate(productId, { 'ratings.average': avgRating, 'ratings.count': reviews.length });

    res.status(201).json({ success: true, review });
  } catch (err) { next(err); }
};

exports.getProductReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const reviews = await Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'firstName lastName avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Review.countDocuments({ product: req.params.productId, isApproved: true });
    res.json({ success: true, reviews, total });
  } catch (err) { next(err); }
};

// ─── Newsletter ───────────────────────────────────────────────────────────────
exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existing = await Newsletter.findOne({ email: email?.toLowerCase() });
    if (existing) {
      if (existing.isActive) return res.json({ success: true, message: 'You are already subscribed.' });
      existing.isActive = true;
      existing.subscribedAt = new Date();
      await existing.save();
    } else {
      await Newsletter.create({ email });
    }

    await sendTemplateEmail('newsletterSubscribe', email, {});
    res.json({ success: true, message: 'Thank you for subscribing!' });
  } catch (err) { next(err); }
};

// ─── Admin Controller ─────────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers, totalOrders, totalProducts,
      monthlyOrders, lastMonthOrders,
      recentOrders, lowStockProducts, pendingReviews,
      topProducts, revenueData
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, orderStatus: { $nin: ['cancelled'] } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, orderStatus: { $nin: ['cancelled'] } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$total' } } }
      ]),
      Order.find().populate('user', 'firstName lastName email').sort('-createdAt').limit(10),
      Product.find({ isActive: true, stock: { $lt: 5 } }).select('name stock images').limit(10),
      Review.countDocuments({ isApproved: false }),
      Order.aggregate([
        { $unwind: '$items' },
        { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: '$items.totalPrice' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
        { $unwind: '$product' }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }, orderStatus: { $nin: ['cancelled'] } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    const thisMonth = monthlyOrders[0] || { count: 0, revenue: 0 };
    const lastMonth = lastMonthOrders[0] || { count: 0, revenue: 0 };

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        monthlyRevenue: thisMonth.revenue,
        monthlyOrders: thisMonth.count,
        revenueGrowth: lastMonth.revenue ? ((thisMonth.revenue - lastMonth.revenue) / lastMonth.revenue * 100).toFixed(1) : 0,
        ordersGrowth: lastMonth.count ? ((thisMonth.count - lastMonth.count) / lastMonth.count * 100).toFixed(1) : 0,
        pendingReviews,
        lowStockCount: lowStockProducts.length
      },
      recentOrders,
      lowStockProducts,
      topProducts,
      revenueData
    });
  } catch (err) { next(err); }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -refreshToken -passwordResetToken -emailVerificationToken')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, users, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.banUser = async (req, res, next) => {
  try {
    const { isBanned, banReason } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isBanned, banReason }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (isBanned) {
      await sendTemplateEmail('adminBanUser', user.email, { firstName: user.firstName });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: isBanned ? 'admin.user_banned' : 'admin.user_unbanned',
      resourceId: user._id,
      details: { email: user.email, reason: banReason }
    });

    res.json({ success: true, message: `User ${isBanned ? 'banned' : 'unbanned'}.`, user });
  } catch (err) { next(err); }
};

exports.manageReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, approved } = req.query;
    const query = {};
    if (approved !== undefined) query.isApproved = approved === 'true';

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('user', 'firstName lastName email')
      .populate('product', 'name images')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, reviews, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.approveReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { new: true });
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    // Recalculate product rating
    const reviews = await Review.find({ product: review.product, isApproved: true });
    if (reviews.length > 0) {
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Product.findByIdAndUpdate(review.product, { 'ratings.average': avg, 'ratings.count': reviews.length });
    }

    res.json({ success: true, review });
  } catch (err) { next(err); }
};

exports.manageCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort('-createdAt');
    res.json({ success: true, coupons });
  } catch (err) { next(err); }
};

exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (err) { next(err); }
};

exports.updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, coupon });
  } catch (err) { next(err); }
};

exports.getActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const query = {};
    if (action) query.action = { $regex: action, $options: 'i' };

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .populate('user', 'firstName lastName email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, logs, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be "user" or "admin".' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await ActivityLog.create({
      user: req.user._id,
      action: 'admin.user_role_changed',
      resourceId: user._id,
      details: { email: user.email, newRole: role }
    });

    res.json({ success: true, message: `Role updated to ${role}.`, user });
  } catch (err) { next(err); }
};
