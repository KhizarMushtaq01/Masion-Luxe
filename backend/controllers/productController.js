const mongoose = require('mongoose');
const Product = require('../models/Product');
const { Category } = require('../models/index');
const { uploadImage, deleteImage } = require('../utils/cloudinary');

// @desc    Get all products (with filters)
// @route   GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category, gender, minPrice, maxPrice, size, color,
      isOnSale, isFeatured, isNew, isBestseller,
      sort = '-createdAt', page = 1, limit = 24,
      search, tags
    } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (gender) query.gender = gender;
    if (isOnSale === 'true') query.isOnSale = true;
    if (isFeatured === 'true') query.isFeatured = true;
    if (isNew === 'true') query.isNew = true;
    if (isBestseller === 'true') query.isBestseller = true;
    if (size) query.sizes = { $in: Array.isArray(size) ? size : [size] };
    if (color) query['colors.name'] = { $in: Array.isArray(color) ? color : [color] };
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const sortOptions = {
      '-createdAt': { createdAt: -1 },
      'price-asc': { basePrice: 1 },
      'price-desc': { basePrice: -1 },
      '-ratings.average': { 'ratings.average': -1 },
      '-soldCount': { soldCount: -1 },
      '-views': { views: -1 }
    };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-__v');

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Mongoose eagerly casts every branch of an $or, so an _id clause throws
    // a CastError on a non-ObjectId slug before the slug branch is even tried.
    const lookup = mongoose.Types.ObjectId.isValid(id)
      ? { $or: [{ _id: id }, { slug: id }] }
      : { slug: id };

    const product = await Product.findOne({ ...lookup, isActive: true })
      .populate('category', 'name slug').populate('relatedProducts', 'name images basePrice salePrice slug ratings');

    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    // Increment views
    await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } });

    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// @desc    Create product (admin)
// @route   POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
    res.json({ success: true, message: 'Product deactivated.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get featured / new / bestseller collections
exports.getCollections = async (req, res, next) => {
  try {
    const [featured, newArrivals, bestsellers, onSale] = await Promise.all([
      Product.find({ isFeatured: true, isActive: true }).limit(8).populate('category', 'name'),
      Product.find({ isNew: true, isActive: true }).sort('-createdAt').limit(8).populate('category', 'name'),
      Product.find({ isBestseller: true, isActive: true }).limit(8).populate('category', 'name'),
      Product.find({ isOnSale: true, isActive: true }).limit(8).populate('category', 'name')
    ]);
    res.json({ success: true, featured, newArrivals, bestsellers, onSale });
  } catch (err) {
    next(err);
  }
};

// @desc    Search products
// @route   GET /api/products/search
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return res.json({ success: true, products: [] });

    const products = await Product.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { 'category.name': { $regex: q, $options: 'i' } }
      ]
    }).limit(Number(limit)).select('name images basePrice salePrice slug category').populate('category', 'name');

    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload product images
// @route   POST /api/products/:id/images
exports.uploadProductImages = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files provided.' });
    }

    const uploaded = await Promise.all(
      files.map(file => uploadImage(file.buffer, 'maison-luxe/products'))
    );

    uploaded.forEach(({ url, publicId }) => {
      product.images.push({ url, publicId, isPrimary: product.images.length === 0 });
    });

    await product.save();
    res.json({ success: true, images: product.images });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a single product image
// @route   DELETE /api/products/:id/images/:publicId
exports.deleteProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

    const publicId = decodeURIComponent(req.params.publicId);
    product.images = product.images.filter(img => img.publicId !== publicId);
    await product.save();

    // Wrap Cloudinary cleanup in separate try/catch to isolate failure
    if (publicId) {
      try {
        await deleteImage(publicId);
      } catch (cleanupErr) {
        console.error('[PRODUCT IMAGE] Failed to delete Cloudinary asset:', cleanupErr.message);
      }
    }

    res.json({ success: true, images: product.images });
  } catch (err) {
    next(err);
  }
};
