const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB, clearTestDB } = require('./setup');
const { createTestUser, authHeaderFor } = require('./testHelpers');
const Settings = require('../models/Settings');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await closeTestDB(); });
afterEach(async () => { await clearTestDB(); });

describe('GET /api/settings', () => {
  it('returns default settings when none exist yet', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    expect(res.body.settings.taxRate).toBe(0.08);
    expect(res.body.settings.freeShippingThreshold).toBe(500);
  });
});

describe('PUT /api/admin/settings', () => {
  it('admin can update settings', async () => {
    const admin = await createTestUser({ role: 'admin' });
    const res = await request(app).put('/api/admin/settings').set(authHeaderFor(admin)).send({ taxRate: 0.1, freeShippingThreshold: 300 });
    expect(res.status).toBe(200);
    expect(res.body.settings.taxRate).toBe(0.1);
    expect(res.body.settings.freeShippingThreshold).toBe(300);

    const stored = await Settings.getSettings();
    expect(stored.taxRate).toBe(0.1);
  });

  it('rejects non-admin users', async () => {
    const user = await createTestUser({ role: 'user' });
    const res = await request(app).put('/api/admin/settings').set(authHeaderFor(user)).send({ taxRate: 0.5 });
    expect(res.status).toBe(403);
  });
});
