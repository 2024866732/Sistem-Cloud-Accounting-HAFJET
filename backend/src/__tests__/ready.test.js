const request = require('supertest');

// Try to load the compiled server (dist) so tests run in the container without ts-jest
let app;
try {
  app = require('../../dist/index');
  // if the module exports default, use it
  app = app && app.default ? app.default : app;
} catch (e) {
  // Fall back to loading source (if ts-node is available in the environment)
  try {
    app = require('../index');
  } catch (err) {
    console.error('Failed to load app for tests:', err.message || err);
    throw err;
  }
}

describe('Readiness endpoint (JS wrapper)', () => {
  it('responds with 200 or 503', async () => {
    const res = await request(app).get('/api/ready');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('ready');
  });
});
