const mockCreate = jest.fn();
const mockConstructEvent = jest.fn();
jest.mock('stripe', () => jest.fn(() => ({
  paymentIntents: { create: mockCreate },
  webhooks: { constructEvent: mockConstructEvent }
})));
jest.mock('../controllers/orderController', () => {
  const actual = jest.requireActual('../controllers/orderController');
  return { ...actual, confirmOrderPayment: jest.fn().mockResolvedValue({ _id: 'order1', orderStatus: 'confirmed' }) };
});

const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { createTestUser, authHeaderFor } = require('./testHelpers');
const { Order } = require('../models/index');
const Product = require('../models/Product');
const { Category } = require('../models/index');
const { confirmOrderPayment } = require('../controllers/orderController');

beforeAll(async () => { await connectTestDB(); process.env.STRIPE_SECRET_KEY = 'sk_test_123'; process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'; });
afterAll(async () => { await closeTestDB(); });
afterEach(async () => { await clearTestDB(); jest.clearAllMocks(); });

async function makeOrder(user) {
  const category = await Category.create({ name: 'Bags' });
  const product = await Product.create({ name: 'Bag', description: 'd', category: category._id, basePrice: 100, stock: 5 });
  return Order.create({
    user: user._id,
    items: [{ product: product._id, name: product.name, quantity: 1, price: 100, totalPrice: 100 }],
    shippingAddress: { firstName:'A', lastName:'B', address1:'1', city:'C', state:'S', postalCode:'1', country:'US' },
    paymentMethod: 'card', subtotal: 100, total: 100, orderStatus: 'pending_payment'
  });
}

describe('POST /api/payment/create-intent', () => {
  it('creates a real intent and saves stripePaymentIntentId on the order', async () => {
    mockCreate.mockResolvedValue({ client_secret: 'secret_abc', id: 'pi_123' });
    const user = await createTestUser();
    const order = await makeOrder(user);

    const res = await request(app).post('/api/payment/create-intent').set(authHeaderFor(user)).send({ amount: 100, orderId: order._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.clientSecret).toBe('secret_abc');
    const updated = await Order.findById(order._id);
    expect(updated.stripePaymentIntentId).toBe('pi_123');
  });
});

describe('POST /api/payment/stripe/webhook', () => {
  it('confirms the order on payment_intent.succeeded', async () => {
    const user = await createTestUser();
    const order = await makeOrder(user);
    order.stripePaymentIntentId = 'pi_123';
    await order.save();

    mockConstructEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_123' } }
    });

    const res = await request(app)
      .post('/api/payment/stripe/webhook')
      .set('stripe-signature', 'test-sig')
      .send(Buffer.from(JSON.stringify({ any: 'payload' })));

    expect(res.status).toBe(200);
    expect(confirmOrderPayment).toHaveBeenCalledWith(order._id.toString(), { paymentStatus: 'paid' });
  });
});
