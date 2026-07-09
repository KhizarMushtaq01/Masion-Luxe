const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getWishlist, toggleWishlist } = require('../controllers/userController');

router.use(protect);
router.get('/', getWishlist);
router.post('/:productId', toggleWishlist);

module.exports = router;
