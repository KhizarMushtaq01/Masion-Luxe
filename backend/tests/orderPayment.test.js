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
});
