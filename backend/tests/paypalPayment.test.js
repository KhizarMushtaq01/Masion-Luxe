const mockOrdersCreate = jest.fn();
const mockOrdersCapture = jest.fn();
const mockExecute = jest.fn();

jest.mock('@paypal/checkout-server-sdk', () => {
  class OrdersCreateRequest { requestBody() {} }
  class OrdersCaptureRequest { requestBody() {} }
  return {
    core: {
      SandboxEnvironment: jest.fn(),
      LiveEnvironment: jest.fn(),
      PayPalHttpClient: jest.fn().mockImplementation(() => ({ execute: mockExecute }))
    },
    orders: { OrdersCreateRequest, OrdersCaptureRequest }
  };
});

jest.mock('../controllers/orderController', () => {
  const actual = jest.requireActual('../controllers/orderController');
  return { ...actual, confirmOrderPayment: jest.fn().mockResolvedValue({ _id: 'order1', orderStatus: 'confirmed' }) };
});

const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { createTestUser, authHeaderFor } = require('./testHelpers');
const { Order, Category } = require('../models/index');
const Product = require('../models/Product');
const { confirmOrderPayment } = require('../controllers/orderController');

beforeAll(async () => { await connectTestDB(); process.env.PAYPAL_CLIENT_ID = 'test'; process.env.PAYPAL_CLIENT_SECRET = 'test'; });
afterAll(async () => { await closeTestDB(); });
afterEach(async () => { await clearTestDB(); jest.clearAllMocks(); });

async function makeOrder(user) {
  const category = await Category.create({ name: 'Bags' });
  const product = await Product.create({ name: 'Bag', description: 'd', category: category._id, basePrice: 60, stock: 5 });
  return Order.create({
    user: user._id,
    items: [{ product: product._id, name: product.name, quantity: 1, price: 60, totalPrice: 60 }],
    shippingAddress: { firstName:'A', lastName:'B', address1:'1', city:'C', state:'S', postalCode:'1', country:'US' },
    paymentMethod: 'paypal', subtotal: 60, total: 60, orderStatus: 'pending_payment'
  });
}

describe('POST /api/payment/paypal/create-order', () => {
  it('creates a PayPal order and returns its id', async () => {
    mockExecute.mockResolvedValue({ result: { id: 'PAYPAL-ORDER-1' } });
    const user = await createTestUser();
    const order = await makeOrder(user);

    const res = await request(app).post('/api/payment/paypal/create-order').set(authHeaderFor(user)).send({ orderId: order._id.toString() });

    expect(res.status).toBe(200);
    expect(res.body.paypalOrderId).toBe('PAYPAL-ORDER-1');
  });
});

describe('POST /api/payment/paypal/capture-order', () => {
  it('captures payment and confirms the Maison Luxe order', async () => {
    mockExecute.mockResolvedValue({ result: { status: 'COMPLETED' } });
    const user = await createTestUser();
    const order = await makeOrder(user);

    const res = await request(app).post('/api/payment/paypal/capture-order').set(authHeaderFor(user)).send({ paypalOrderId: 'PAYPAL-ORDER-1', orderId: order._id.toString() });

    expect(res.status).toBe(200);
    expect(confirmOrderPayment).toHaveBeenCalledWith(order._id.toString(), { paymentStatus: 'paid' });
  });
});
