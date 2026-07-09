const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon } = require('../controllers/miscController');

router.use(protect);
router.get('/', getCart);
router.post('/', addToCart);
router.put('/item/:itemId', updateCartItem);
router.delete('/item/:itemId', removeFromCart);
router.delete('/', clearCart);
router.post('/coupon', applyCoupon);

module.exports = router;
