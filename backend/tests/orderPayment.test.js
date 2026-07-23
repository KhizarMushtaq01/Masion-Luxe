// backend/tests/orderPayment.test.js
jest.mock('../utils/email', () => ({ sendTemplateEmail: jest.fn().mockResolvedValue({ success: true }) }));

const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { createTestUser, authHeaderFor } = require('./testHelpers');
const Product = require('../models/Product');
const { Category, Order } = require('../models/index');
const User = require('../models/User');
const { confirmOrderPayment } = require('../controllers/orderController');
const { sendTemplateEmail } = require('../utils/email');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await closeTestDB(); });
afterEach(async () => { await clearTestDB(); jest.clearAllMocks(); });

async function makeProduct(stock = 10) {
  const category = await Category.create({ name: 'Shoes' });
  return Product.create({ name: 'Test Shoe', description: 'desc', category: category._id, basePrice: 50, stock });
}

const shippingAddress = { firstName: 'A', lastName: 'B', address1: '1 St', city: 'C', state: 'S', postalCode: '1', country: 'US' };

describe('POST /api/orders (payment method behavior)', () => {
  it('creates a cod order as confirmed', async () => {
    const user = await createTestUser();
    const product = await makeProduct();
    const res = await request(app).post('/api/orders').set(authHeaderFor(user)).send({
      items: [{ product: product._id, name: product.name, quantity: 1, price: 50 }],
      shippingAddress, paymentMethod: 'cod', subtotal: 50, total: 50
    });
    expect(res.status).toBe(201);
    expect(res.body.order.orderStatus).toBe('confirmed');
  });

  it('creates a card order as pending_payment', async () => {
    const user = await createTestUser();
    const product = await makeProduct();
    const res = await request(app).post('/api/orders').set(authHeaderFor(user)).send({
      items: [{ product: product._id, name: product.name, quantity: 1, price: 50 }],
      shippingAddress, paymentMethod: 'card', subtotal: 50, total: 50
    });
    expect(res.status).toBe(201);
    expect(res.body.order.orderStatus).toBe('pending_payment');
  });
});

describe('confirmOrderPayment', () => {
  it('marks a pending_payment order confirmed and updates user stats', async () => {
    const user = await createTestUser();
    const product = await makeProduct();
    const order = await Order.create({
      user: user._id,
      items: [{ product: product._id, name: product.name, quantity: 1, price: 50, totalPrice: 50 }],
      shippingAddress, paymentMethod: 'card', subtotal: 50, total: 50, orderStatus: 'pending_payment'
    });

    const updated = await confirmOrderPayment(order._id, { paymentStatus: 'paid' });

    expect(updated.orderStatus).toBe('confirmed');
    expect(updated.paymentStatus).toBe('paid');
    const refreshedUser = await User.findById(user._id);
    expect(refreshedUser.totalOrders).toBe(1);
    expect(refreshedUser.totalSpent).toBe(50);
  });

  it('is idempotent: calling it again on an already-confirmed order does not double-count stats or history', async () => {
    const user = await createTestUser();
    const product = await makeProduct();
    const order = await Order.create({
      user: user._id,
      items: [{ product: product._id, name: product.name, quantity: 1, price: 50, totalPrice: 50 }],
      shippingAddress, paymentMethod: 'card', subtotal: 50, total: 50, orderStatus: 'pending_payment'
    });

    await confirmOrderPayment(order._id, { paymentStatus: 'paid' });
    const second = await confirmOrderPayment(order._id, { paymentStatus: 'paid' });

    expect(second.orderStatus).toBe('confirmed');

    const refreshedUser = await User.findById(user._id);
    expect(refreshedUser.totalOrders).toBe(1);
    expect(refreshedUser.totalSpent).toBe(50);
    expect(refreshedUser.loyaltyPoints).toBe(50);

    const refreshedOrder = await Order.findById(order._id);
    const confirmedEntries = refreshedOrder.statusHistory.filter((h) => h.status === 'confirmed');
    expect(confirmedEntries.length).toBe(1);

    expect(sendTemplateEmail).toHaveBeenCalledTimes(1);
  });

  it('throws when the order does not exist', async () => {
    await expect(confirmOrderPayment('507f1f77bcf86cd799439011', { paymentStatus: 'paid' }))
      .rejects.toThrow();
  });

  it('does not double-increment stats when two confirmations race concurrently', async () => {
    const user = await createTestUser();
    const product = await makeProduct();
    const order = await Order.create({
      user: user._id,
      items: [{ product: product._id, name: product.name, quantity: 1, price: 50, totalPrice: 50 }],
      shippingAddress, paymentMethod: 'card', subtotal: 50, total: 50, orderStatus: 'pending_payment'
    });

    const [first, second] = await Promise.all([
      confirmOrderPayment(order._id, { paymentStatus: 'paid' }),
      confirmOrderPayment(order._id, { paymentStatus: 'paid' }),
    ]);

    expect(first.orderStatus).toBe('confirmed');
    expect(second.orderStatus).toBe('confirmed');

    const refreshedUser = await User.findById(user._id);
    expect(refreshedUser.totalOrders).toBe(1);
    expect(refreshedUser.totalSpent).toBe(50);

    const refreshedOrder = await Order.findById(order._id);
    expect(refreshedOrder.orderStatus).toBe('confirmed');
    expect(refreshedOrder.statusHistory.filter((h) => h.status === 'confirmed')).toHaveLength(1);

    expect(sendTemplateEmail).toHaveBeenCalledTimes(1);
  });
});
