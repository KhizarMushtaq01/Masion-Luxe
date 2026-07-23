const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboardStats, getAllUsers, banUser, manageReviews, approveReview, manageCoupons, createCoupon, updateCoupon, getActivityLogs } = require('../controllers/miscController');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const Settings = require('../models/Settings');

router.use(protect, authorize('admin','superadmin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/ban', banUser);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);
router.get('/reviews', manageReviews);
router.put('/reviews/:id/approve', approveReview);
router.get('/coupons', manageCoupons);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.get('/activity-logs', getActivityLogs);
router.put('/settings', async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();
    Object.assign(settings, req.body);
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) { next(err); }
});

module.exports = router;
