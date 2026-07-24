jest.mock('../utils/email', () => ({ sendTemplateEmail: jest.fn().mockResolvedValue({ success: true }) }));

const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { createTestUser, authHeaderFor } = require('./testHelpers');
const { Order, Category } = require('../models/index');
const Product = require('../models/Product');
const { sendTemplateEmail } = require('../utils/email');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await closeTestDB(); });
afterEach(async () => { await clearTestDB(); jest.clearAllMocks(); });

async function makeOrder(customer) {
  const category = await Category.create({ name: 'Bags' });
  const product = await Product.create({ name: 'Bag', description: 'd', category: category._id, basePrice: 100, stock: 5 });
  return Order.create({
    user: customer._id,
    items: [{ product: product._id, name: product.name, quantity: 1, price: 100, totalPrice: 100 }],
    shippingAddress: { firstName: 'A', lastName: 'B', address1: '1', city: 'C', state: 'S', postalCode: '1', country: 'US' },
    paymentMethod: 'cod', subtotal: 100, total: 100, orderStatus: 'confirmed',
    statusHistory: [{ status: 'confirmed', note: 'Order placed', updatedBy: customer._id }]
  });
}

describe('PUT /api/admin/orders/:id/status', () => {
  it.each([
    ['shipped', 'orderShipped'],
    ['delivered', 'orderDelivered'],
    ['cancelled', 'orderCancelled'],
    ['returned', 'returnCompleted'],
  ])('sends %s the %s email to the customer', async (status, expectedTemplate) => {
    const admin = await createTestUser({ role: 'admin' });
    const customer = await createTestUser({ role: 'user' });
    const order = await makeOrder(customer);

    const res = await request(app)
      .put(`/api/admin/orders/${order._id}/status`)
      .set(authHeaderFor(admin))
      .send({ status });

    expect(res.status).toBe(200);
    expect(res.body.order.orderStatus).toBe(status);
    expect(sendTemplateEmail).toHaveBeenCalledTimes(1);
    expect(sendTemplateEmail).toHaveBeenCalledWith(expectedTemplate, customer.email, expect.objectContaining({ firstName: customer.firstName }));
  });

  it('does not send an email for statuses with no customer-facing notification', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const customer = await createTestUser({ role: 'user' });
    const order = await makeOrder(customer);

    const res = await request(app)
      .put(`/api/admin/orders/${order._id}/status`)
      .set(authHeaderFor(admin))
      .send({ status: 'processing' });

    expect(res.status).toBe(200);
    expect(sendTemplateEmail).not.toHaveBeenCalled();
  });

  it('rejects non-admin users', async () => {
    const user = await createTestUser({ role: 'user' });
    const other = await createTestUser({ role: 'user' });
    const order = await makeOrder(other);

    const res = await request(app)
      .put(`/api/admin/orders/${order._id}/status`)
      .set(authHeaderFor(user))
      .send({ status: 'shipped' });

    expect(res.status).toBe(403);
    expect(sendTemplateEmail).not.toHaveBeenCalled();
  });

  it('returns 404 for a non-existent order', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const res = await request(app)
      .put('/api/admin/orders/507f1f77bcf86cd799439011/status')
      .set(authHeaderFor(admin))
      .send({ status: 'shipped' });

    expect(res.status).toBe(404);
  });
});
