const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const Product = require('../models/Product');
const { Category } = require('../models/index');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await closeTestDB(); });
afterEach(async () => { await clearTestDB(); });

async function makeProduct() {
  const category = await Category.create({ name: 'Bags' });
  return Product.create({
    name: 'Canvas Leather Tote', description: 'A tote', category: category._id,
    basePrice: 250, isActive: true
  });
}

describe('GET /api/products/:id', () => {
  it('finds a product by its ObjectId', async () => {
    const product = await makeProduct();
    const res = await request(app).get(`/api/products/${product._id}`);
    expect(res.status).toBe(200);
    expect(res.body.product._id).toBe(product._id.toString());
  });

  it('finds a product by its slug', async () => {
    const product = await makeProduct();
    expect(product.slug).toBe('canvas-leather-tote');
    const res = await request(app).get(`/api/products/${product.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.product._id).toBe(product._id.toString());
  });

  it('returns 404 (not 500) for a slug that does not exist', async () => {
    const res = await request(app).get('/api/products/no-such-product');
    expect(res.status).toBe(404);
  });

  it('returns 404 for a well-formed but nonexistent ObjectId', async () => {
    const res = await request(app).get('/api/products/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });
});
