const User = require('../models/User');
const { sendTemplateEmail } = require('../utils/email');
const { ActivityLog } = require('../models/index');
const { uploadImage, deleteImage } = require('../utils/cloudinary');

// @desc    Update profile
// @route   PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, gender, preferences } = req.body;
    const user = await User.findById(req.user._id);
    const changes = [];

    if (firstName && firstName !== user.firstName) { changes.push(`Name changed to ${firstName} ${lastName || user.lastName}`); user.firstName = firstName; }
    if (lastName && lastName !== user.lastName) { user.lastName = lastName; }
    if (phone !== undefined && phone !== user.phone) { changes.push('Phone number updated'); user.phone = phone; }
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save({ validateBeforeSave: false });

    if (changes.length > 0) {
      await sendTemplateEmail('profileUpdated', user.email, {
        firstName: user.firstName,
        changes
      });
    }

    await ActivityLog.create({
      user: user._id,
      action: 'user.profile_updated',
      details: { changes },
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, message: 'Profile updated successfully.', user });
  } catch (err) {
    next(err);
  }
};

// @desc    Update avatar
// @route   PUT /api/users/avatar
exports.updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const user = await User.findById(req.user._id);
    const previousPublicId = user.avatar?.publicId;

    const { url, publicId } = await uploadImage(req.file.buffer, 'maison-luxe/avatars');

    user.avatar = { url, publicId };
    await user.save({ validateBeforeSave: false });

    if (previousPublicId) {
      await deleteImage(previousPublicId);
    }

    await sendTemplateEmail('avatarChanged', user.email, { firstName: user.firstName });

    await ActivityLog.create({
      user: user._id,
      action: 'user.avatar_changed',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, message: 'Profile photo updated.', avatar: user.avatar });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user addresses
// @route   GET /api/users/addresses
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('addresses');
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// @desc    Add address
// @route   POST /api/users/addresses
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const { isDefault, ...addressData } = req.body;

    if (isDefault) {
      user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    user.addresses.push({ ...addressData, isDefault: isDefault || user.addresses.length === 0 });
    await user.save({ validateBeforeSave: false });

    res.status(201).json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const addr = user.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found.' });

    if (req.body.isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    Object.assign(addr, req.body);
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.id);
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, addresses: user.addresses });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle wishlist
// @route   POST /api/users/wishlist/:productId
exports.toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;
    const idx = user.wishlist.indexOf(productId);

    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(productId);
    }

    await user.save({ validateBeforeSave: false });
    res.json({ success: true, wishlist: user.wishlist, added: idx === -1 });
  } catch (err) {
    next(err);
  }
};

// @desc    Get wishlist
// @route   GET /api/users/wishlist
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      select: 'name images basePrice salePrice isOnSale slug ratings isActive',
      match: { isActive: true }
    });
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    next(err);
  }
};

// @desc    Get user order history
// @route   GET /api/users/orders
exports.getUserOrders = async (req, res, next) => {
  try {
    const { Order } = require('../models/index');
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name images slug')
      .sort('-createdAt');
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

// @desc    Get activity log
// @route   GET /api/users/activity
exports.getActivity = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({ user: req.user._id })
      .sort('-createdAt')
      .limit(50);
    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
};
