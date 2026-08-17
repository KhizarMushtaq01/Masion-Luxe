// backend/tests/health.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const { connectTestDB, closeTestDB } = require('./setup');

beforeAll(async () => { await connectTestDB(); });
afterAll(async () => { await closeTestDB(); });

describe('GET /api/health', () => {
  it('returns 200 and status OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.db).toBe('connected');
  });

  it('reports 503 when the database connection is gone', async () => {
    // readyState is a non-configurable getter on Connection.prototype, so
    // jest.spyOn cannot touch it. An own property on the instance shadows it,
    // and deleting that restores the real getter — cheaper and less disruptive
    // than tearing down the shared in-memory database.
    Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });
    try {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(503);
      expect(res.body.status).toBe('DEGRADED');
      expect(res.body.db).toBe('disconnected');
    } finally {
      delete mongoose.connection.readyState;
    }
  });

  it('recovers once the connection is back', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});
