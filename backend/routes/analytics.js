const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Order } = require('../models/index');
const Product = require('../models/Product');
const User = require('../models/User');

router.get('/overview', protect, authorize('admin','superadmin'), async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [salesByDay, salesByCategory, userGrowth] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, orderStatus: { $nin: ['cancelled'] } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, orders: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate }, orderStatus: { $nin: ['cancelled'] } } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'category' } },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$category.name', revenue: { $sum: '$items.totalPrice' }, count: { $sum: '$items.quantity' } } },
        { $sort: { revenue: -1 } }
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({ success: true, salesByDay, salesByCategory, userGrowth });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
