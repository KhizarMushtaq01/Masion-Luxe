const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { createTestUser, authHeaderFor } = require('./testHelpers');
const { Order, Category } = require('../models/index');
const Product = require('../models/Product');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await closeTestDB(); });
afterEach(async () => { await clearTestDB(); });

describe('GET /api/admin/orders/:id', () => {
  it('returns full order detail with populated fields for admins', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const customer = await createTestUser({ role: 'user' });
    const category = await Category.create({ name: 'Bags' });
    const product = await Product.create({ name: 'Bag', description: 'd', category: category._id, basePrice: 100, stock: 5 });
    const order = await Order.create({
      user: customer._id,
      items: [{ product: product._id, name: product.name, quantity: 1, price: 100, totalPrice: 100 }],
      shippingAddress: { firstName:'A', lastName:'B', address1:'1', city:'C', state:'S', postalCode:'1', country:'US' },
      paymentMethod: 'cod', subtotal: 100, total: 100, orderStatus: 'confirmed',
      statusHistory: [{ status: 'confirmed', note: 'Order placed', updatedBy: customer._id }]
    });

    const res = await request(app).get(`/api/admin/orders/${order._id}`).set(authHeaderFor(admin));

    expect(res.status).toBe(200);
    expect(res.body.order.user.email).toBe(customer.email);
    expect(res.body.order.items[0].product.name).toBe('Bag');
    expect(res.body.order.statusHistory).toHaveLength(1);
  });

  it('returns 404 for a non-existent order', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/admin/orders/${fakeId}`).set(authHeaderFor(admin));
    expect(res.status).toBe(404);
  });

  it('rejects non-admin users', async () => {
    const user = await createTestUser({ role: 'user' });
    const fakeId = '507f1f77bcf86cd799439011';
    const res = await request(app).get(`/api/admin/orders/${fakeId}`).set(authHeaderFor(user));
    expect(res.status).toBe(403);
  });
});
