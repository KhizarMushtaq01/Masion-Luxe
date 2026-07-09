const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReview, getProductReviews } = require('../controllers/miscController');

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);

module.exports = router;
