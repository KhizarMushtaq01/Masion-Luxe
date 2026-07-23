// backend/tests/health.test.js
const request = require('supertest');
const app = require('../app');
const { connectTestDB, closeTestDB } = require('./setup');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await closeTestDB(); });

describe('GET /api/health', () => {
  it('returns 200 and status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});
