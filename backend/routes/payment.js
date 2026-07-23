const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Order } = require('../models/index');
const { confirmOrderPayment } = require('../controllers/orderController');

router.post('/create-intent', protect, async (req, res) => {
  try {
    const { amount, orderId, currency = 'usd' } = req.body;

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe')) {
      return res.json({
        success: true,
        clientSecret: 'mock_client_secret_' + Date.now(),
        paymentIntentId: 'mock_pi_' + Date.now()
      });
    }

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { userId: req.user._id.toString(), orderId: orderId || '' }
    });

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { stripePaymentIntentId: paymentIntent.id });
    }

    res.json({ success: true, clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/stripe/webhook', async (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return res.status(200).json({ success: true, skipped: true });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ success: false, message: `Webhook signature verification failed: ${err.message}` });
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (order) {
        await confirmOrderPayment(order._id.toString(), { paymentStatus: 'paid' });
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object;
      await Order.findOneAndUpdate({ stripePaymentIntentId: paymentIntent.id }, { paymentStatus: 'failed' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
