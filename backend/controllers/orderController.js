const { Order, Cart, ActivityLog } = require('../models/index');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendTemplateEmail } = require('../utils/email');

// @desc    Create order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items, shippingAddress, billingAddress,
      paymentMethod, subtotal, shippingCost, taxAmount,
      discountAmount, couponCode, total, notes
    } = req.body;

    // Validate stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product "${item.name}" is no longer available.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for "${item.name}".` });
      }
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost: shippingCost || 0,
      taxAmount: taxAmount || 0,
      discountAmount: discountAmount || 0,
      couponCode,
      total,
      notes,
      orderStatus: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      statusHistory: [{ status: 'pending', note: 'Order placed', updatedBy: req.user._id }]
    });

    // Update stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, soldCount: item.quantity }
      });
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalOrders: 1, totalSpent: total, loyaltyPoints: Math.floor(total) }
    });

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // Send confirmation email
    await sendTemplateEmail('orderConfirmed', req.user.email, {
      firstName: req.user.firstName,
      ...order.toObject()
    });

    await ActivityLog.create({
      user: req.user._id,
      action: 'order.created',
      resourceId: order._id,
      details: { orderNumber: order.orderNumber, total },
      ip: req.ip
    });

    const populated = await Order.findById(order._id).populate('items.product', 'name images');
    res.status(201).json({ success: true, order: populated });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user._id };
    if (status) query.orderStatus = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('items.product', 'name images slug')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.product', 'name images slug');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'This order cannot be cancelled at this stage.' });
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    order.statusHistory.push({ status: 'cancelled', note: order.cancelReason, updatedBy: req.user._id });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
    }

    await sendTemplateEmail('orderCancelled', req.user.email, {
      firstName: req.user.firstName,
      ...order.toObject()
    });

    res.json({ success: true, message: 'Order cancelled.', order });
  } catch (err) {
    next(err);
  }
};

// @desc    Request return
// @route   PUT /api/orders/:id/return
exports.requestReturn = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned.' });
    }

    order.orderStatus = 'return_requested';
    order.statusHistory.push({ status: 'return_requested', note: req.body.reason || 'Return requested', updatedBy: req.user._id });
    await order.save();

    await sendTemplateEmail('returnRequested', req.user.email, {
      firstName: req.user.firstName,
      ...order.toObject()
    });

    res.json({ success: true, message: 'Return request submitted.', order });
  } catch (err) {
    next(err);
  }
};

// ─── Admin ───────────────────────────────────────────────────────────────────
// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.orderStatus = status;
    if (search) query.orderNumber = { $regex: search, $options: 'i' };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, orders, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note, trackingNumber, trackingUrl, estimatedDelivery } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.orderStatus = status;
    order.statusHistory.push({ status, note: note || `Status updated to ${status}`, updatedBy: req.user._id });

    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (trackingUrl) order.trackingUrl = trackingUrl;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
    if (status === 'delivered') order.deliveredAt = new Date();

    await order.save();

    // Send email notifications for key status changes
    if (status === 'shipped') {
      await sendTemplateEmail('orderShipped', order.user.email, {
        firstName: order.user.firstName,
        ...order.toObject()
      });
    } else if (status === 'delivered') {
      await sendTemplateEmail('orderDelivered', order.user.email, {
        firstName: order.user.firstName,
        ...order.toObject()
      });
    }

    await ActivityLog.create({
      user: req.user._id,
      action: 'admin.order_status_updated',
      resourceId: order._id,
      details: { orderNumber: order.orderNumber, newStatus: status }
    });

    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
};
