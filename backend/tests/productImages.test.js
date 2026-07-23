jest.mock('../utils/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue({ url: 'https://res.cloudinary.com/demo/product.jpg', publicId: 'maison-luxe/products/xyz' }),
  deleteImage: jest.fn().mockResolvedValue(undefined),
}));

const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { createTestUser, authHeaderFor } = require('./testHelpers');
const Product = require('../models/Product');
const { Category } = require('../models/index');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await closeTestDB(); });
afterEach(async () => { await clearTestDB(); jest.clearAllMocks(); });

async function makeProduct() {
  const category = await Category.create({ name: 'Bags' });
  return Product.create({
    name: 'Test Bag', description: 'A bag', category: category._id,
    basePrice: 100, images: [{ url: 'existing.jpg', publicId: 'maison-luxe/products/existing' }]
  });
}

describe('POST /api/products/:id/images', () => {
  it('admin can upload images and append them to the product', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const product = await makeProduct();

    const res = await request(app)
      .post(`/api/products/${product._id}/images`)
      .set(authHeaderFor(admin))
      .attach('images', Buffer.from('fake-bytes'), 'shot1.jpg');

    expect(res.status).toBe(200);
    expect(res.body.images).toHaveLength(2);
    expect(res.body.images[1]).toMatchObject({ url: 'https://res.cloudinary.com/demo/product.jpg', publicId: 'maison-luxe/products/xyz' });
  });

  it('rejects non-admin users', async () => {
    const user = await createTestUser({ role: 'user' });
    const product = await makeProduct();
    const res = await request(app)
      .post(`/api/products/${product._id}/images`)
      .set(authHeaderFor(user))
      .attach('images', Buffer.from('fake-bytes'), 'shot1.jpg');
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/products/:id/images/:publicId', () => {
  it('admin can remove a specific image', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const product = await makeProduct();
    const encodedId = encodeURIComponent('maison-luxe/products/existing');

    const res = await request(app)
      .delete(`/api/products/${product._id}/images/${encodedId}`)
      .set(authHeaderFor(admin));

    expect(res.status).toBe(200);
    expect(res.body.images).toHaveLength(0);
  });
});
