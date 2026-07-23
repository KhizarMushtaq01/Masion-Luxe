jest.mock('../utils/cloudinary', () => ({
  uploadImage: jest.fn().mockResolvedValue({ url: 'https://res.cloudinary.com/demo/avatar.jpg', publicId: 'maison-luxe/avatars/abc' }),
  deleteImage: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../utils/email', () => ({ sendTemplateEmail: jest.fn().mockResolvedValue({ success: true }) }));

const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { createTestUser, authHeaderFor } = require('./testHelpers');
const { uploadImage, deleteImage } = require('../utils/cloudinary');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await closeTestDB(); });
afterEach(async () => { await clearTestDB(); jest.clearAllMocks(); });

describe('PUT /api/users/avatar', () => {
  it('uploads a file to Cloudinary and saves url+publicId on the user', async () => {
    const user = await createTestUser();
    const res = await request(app)
      .put('/api/users/avatar')
      .set(authHeaderFor(user))
      .attach('avatar', Buffer.from('fake-image-bytes'), 'photo.jpg');

    expect(res.status).toBe(200);
    expect(res.body.avatar).toEqual({ url: 'https://res.cloudinary.com/demo/avatar.jpg', publicId: 'maison-luxe/avatars/abc' });
    expect(uploadImage).toHaveBeenCalledWith(expect.any(Buffer), 'maison-luxe/avatars');
  });

  it('deletes the old Cloudinary image when replacing an existing avatar', async () => {
    const user = await createTestUser({ overrides: { avatar: { url: 'old.jpg', publicId: 'maison-luxe/avatars/old' } } });
    await request(app)
      .put('/api/users/avatar')
      .set(authHeaderFor(user))
      .attach('avatar', Buffer.from('fake-image-bytes'), 'photo.jpg');

    expect(deleteImage).toHaveBeenCalledWith('maison-luxe/avatars/old');
  });

  it('rejects requests with no file', async () => {
    const user = await createTestUser();
    const res = await request(app)
      .put('/api/users/avatar')
      .set(authHeaderFor(user));

    expect(res.status).toBe(400);
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app)
      .put('/api/users/avatar')
      .attach('avatar', Buffer.from('fake-image-bytes'), 'photo.jpg');
    expect(res.status).toBe(401);
  });
});
