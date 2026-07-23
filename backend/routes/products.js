const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, getCollections, searchProducts, uploadProductImages, deleteProductImage } = require('../controllers/productController');

router.get('/collections', getCollections);
router.get('/search', searchProducts);
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', protect, authorize('admin','superadmin'), createProduct);
router.put('/:id', protect, authorize('admin','superadmin'), updateProduct);
router.delete('/:id', protect, authorize('admin','superadmin'), deleteProduct);
router.post('/:id/images', protect, authorize('admin','superadmin'), upload.array('images', 10), uploadProductImages);
router.delete('/:id/images/:publicId', protect, authorize('admin','superadmin'), deleteProductImage);

module.exports = router;
