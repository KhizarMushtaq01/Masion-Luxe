const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { updateProfile, updateAvatar, getAddresses, addAddress, updateAddress, deleteAddress, toggleWishlist, getWishlist, getUserOrders, getActivity } = require('../controllers/userController');

router.use(protect);
router.put('/profile', updateProfile);
router.put('/avatar', upload.single('avatar'), updateAvatar);
router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', toggleWishlist);
router.get('/orders', getUserOrders);
router.get('/activity', getActivity);

module.exports = router;
