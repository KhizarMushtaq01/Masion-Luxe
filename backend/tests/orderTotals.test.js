// backend/tests/orderTotals.test.js
jest.mock('../utils/email', () => ({ sendTemplateEmail: jest.fn().mockResolvedValue({ success: true }) }));

const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { createTestUser, authHeaderFor } = require('./testHelpers');
const Product = require('../models/Product');
const { Category } = require('../models/index');
const Settings = require('../models/Settings');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await closeTestDB(); });
afterEach(async () => { await clearTestDB(); });

const shippingAddress = { firstName:'A', lastName:'B', address1:'1', city:'C', state:'S', postalCode:'1', country:'US' };

describe('POST /api/orders total calculation', () => {
  it('computes shipping/tax/total from Settings, ignoring client-submitted totals', async () => {
    await Settings.create({ taxRate: 0.1, freeShippingThreshold: 1000, standardShippingCost: 20 });
    const user = await createTestUser();
    const category = await Category.create({ name: 'Bags' });
    const product = await Product.create({ name: 'Bag', description: 'd', category: category._id, basePrice: 100, stock: 5 });

    const res = await request(app).post('/api/orders').set(authHeaderFor(user)).send({
      items: [{ product: product._id, name: product.name, quantity: 1, price: 100 }],
      shippingAddress, paymentMethod: 'cod',
      subtotal: 100, shippingCost: 0, taxAmount: 0, discountAmount: 0, total: 100 // client sends wrong/stale numbers
    });

    expect(res.status).toBe(201);
    expect(res.body.order.shippingCost).toBe(20); // below 1000 threshold
    expect(res.body.order.taxAmount).toBeCloseTo(10, 2); // 100 * 0.1
    expect(res.body.order.total).toBeCloseTo(130, 2); // 100 + 20 + 10
  });

  it('applies free shipping above the configured threshold', async () => {
    await Settings.create({ taxRate: 0.1, freeShippingThreshold: 50, standardShippingCost: 20 });
    const user = await createTestUser();
    const category = await Category.create({ name: 'Bags' });
    const product = await Product.create({ name: 'Bag', description: 'd', category: category._id, basePrice: 100, stock: 5 });

    const res = await request(app).post('/api/orders').set(authHeaderFor(user)).send({
      items: [{ product: product._id, name: product.name, quantity: 1, price: 100 }],
      shippingAddress, paymentMethod: 'cod', subtotal: 100, total: 100
    });

    expect(res.body.order.shippingCost).toBe(0);
  });
});
