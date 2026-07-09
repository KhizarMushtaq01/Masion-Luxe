const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createOrder, getMyOrders, getOrder, cancelOrder, requestReturn } = require('../controllers/orderController');

router.use(protect);
router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);
router.put('/:id/return', requestReturn);

module.exports = router;
