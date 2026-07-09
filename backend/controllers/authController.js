const crypto = require('crypto');
const User = require('../models/User');
const { generateTokens, setTokenCookie } = require('../middleware/auth');
const { sendTemplateEmail } = require('../utils/email');
const { ActivityLog } = require('../models/index');

// @desc    Register
// @route   POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000
    });

    // Send welcome email
    await sendTemplateEmail('welcome', email, {
      firstName,
      verificationToken
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    setTokenCookie(res, accessToken);

    await ActivityLog.create({
      user: user._id,
      action: 'user.register',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please verify your email.',
      token: accessToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login
// @route   POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact support.' });
    }

    const loginInfo = { ip: req.ip, userAgent: req.get('User-Agent') };
    user.lastLogin = new Date();
    user.loginHistory.push({ ...loginInfo, timestamp: new Date() });
    if (user.loginHistory.length > 10) user.loginHistory = user.loginHistory.slice(-10);

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Send login notification
    await sendTemplateEmail('signIn', email, {
      firstName: user.firstName,
      ...loginInfo
    });

    setTokenCookie(res, accessToken);

    await ActivityLog.create({
      user: user._id,
      action: 'user.login',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Welcome back.',
      token: accessToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout
// @route   POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }
    res.clearCookie('accessToken');
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name images basePrice salePrice slug');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    await sendTemplateEmail('emailVerified', user.email, { firstName: user.firstName });

    res.json({ success: true, message: 'Email verified successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: 'If this email is registered, you will receive a reset link.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    await sendTemplateEmail('passwordResetRequest', email, {
      firstName: user.firstName,
      resetToken
    });

    res.json({ success: true, message: 'If this email is registered, you will receive a reset link.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    if (!req.body.password || req.body.password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await sendTemplateEmail('passwordChanged', user.email, { firstName: user.firstName });

    await ActivityLog.create({
      user: user._id,
      action: 'user.password_reset',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, message: 'Password reset successfully. Please sign in.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password (authenticated)
// @route   PUT /api/auth/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters.' });
    }

    user.password = newPassword;
    await user.save();

    await sendTemplateEmail('passwordChanged', user.email, { firstName: user.firstName });

    await ActivityLog.create({
      user: user._id,
      action: 'user.password_changed',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
};
