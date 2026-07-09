const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

router.post('/create-intent', protect, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe')) {
      // Mock response for development
      return res.json({ 
        success: true, 
        clientSecret: 'mock_client_secret_' + Date.now(),
        paymentIntentId: 'mock_pi_' + Date.now()
      });
    }
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { amount, currency = 'usd' } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { userId: req.user._id.toString() }
    });
    res.json({ success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
