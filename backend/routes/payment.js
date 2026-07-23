const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Order } = require('../models/index');
const { confirmOrderPayment } = require('../controllers/orderController');
const paypal = require('@paypal/checkout-server-sdk');

function paypalClient() {
  const environment = process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
    : new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
  return new paypal.core.PayPalHttpClient(environment);
}

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
      await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id, orderStatus: { $ne: 'confirmed' } },
        { paymentStatus: 'failed' }
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/paypal/create-order', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{ amount: { currency_code: 'USD', value: order.total.toFixed(2) }, reference_id: order._id.toString() }]
    });

    const paypalOrder = await paypalClient().execute(request);
    res.json({ success: true, paypalOrderId: paypalOrder.result.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/paypal/capture-order', protect, async (req, res) => {
  try {
    const { paypalOrderId, orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});
    const capture = await paypalClient().execute(request);

    if (capture.result.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'PayPal payment was not completed.' });
    }

    const capturedReferenceId = capture.result.purchase_units?.[0]?.reference_id;
    if (capturedReferenceId !== orderId) {
      return res.status(409).json({ success: false, message: 'This PayPal payment does not match the specified order.' });
    }

    const confirmedOrder = await confirmOrderPayment(orderId, { paymentStatus: 'paid' });
    res.json({ success: true, order: confirmedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
