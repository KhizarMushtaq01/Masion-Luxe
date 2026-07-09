const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCollections, searchProducts } = require('../controllers/productController');

router.get('/collections', getCollections);
router.get('/search', searchProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('admin','superadmin'), createProduct);
router.put('/:id', protect, authorize('admin','superadmin'), updateProduct);
router.delete('/:id', protect, authorize('admin','superadmin'), deleteProduct);

module.exports = router;
