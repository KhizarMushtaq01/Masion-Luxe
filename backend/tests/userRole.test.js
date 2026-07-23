// backend/tests/userRole.test.js
jest.mock('../utils/email', () => ({ sendTemplateEmail: jest.fn().mockResolvedValue({ success: true }) }));

const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { createTestUser, authHeaderFor } = require('./testHelpers');
const User = require('../models/User');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await closeTestDB(); });
afterEach(async () => { await clearTestDB(); });

describe('PUT /api/admin/users/:id/role', () => {
  it('superadmin can promote a user to admin', async () => {
    const superadmin = await createTestUser({ role: 'superadmin' });
    const target = await createTestUser({ role: 'user' });

    const res = await request(app).put(`/api/admin/users/${target._id}/role`).set(authHeaderFor(superadmin)).send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('admin');
    const stored = await User.findById(target._id);
    expect(stored.role).toBe('admin');
  });

  it('rejects a regular admin trying to change roles', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const target = await createTestUser({ role: 'user' });

    const res = await request(app).put(`/api/admin/users/${target._id}/role`).set(authHeaderFor(admin)).send({ role: 'admin' });

    expect(res.status).toBe(403);
  });

  it('rejects an invalid role value', async () => {
    const superadmin = await createTestUser({ role: 'superadmin' });
    const target = await createTestUser({ role: 'user' });

    const res = await request(app).put(`/api/admin/users/${target._id}/role`).set(authHeaderFor(superadmin)).send({ role: 'superadmin' });

    expect(res.status).toBe(400);
  });
});
