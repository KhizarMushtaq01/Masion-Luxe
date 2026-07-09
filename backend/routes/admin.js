const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getDashboardStats, getAllUsers, banUser, manageReviews, approveReview, manageCoupons, createCoupon, updateCoupon, getActivityLogs } = require('../controllers/miscController');
const { getAllOrders, updateOrderStatus } = require('../controllers/orderController');

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

module.exports = router;
