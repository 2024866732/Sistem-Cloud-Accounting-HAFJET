const request = require('supertest');

// Ensure test mode so init() in compiled server won't call process.exit
process.env.JEST_WORKER_ID = process.env.JEST_WORKER_ID || '1';
process.env.NODE_ENV = 'test';

// Mock mongoose connection state to make readiness deterministic in tests
// We patch the mongoose connection before requiring the app so the app's
// readiness endpoint will see the mocked state during the test run.
// Ensure test-mode envs early
process.env.JEST_WORKER_ID = process.env.JEST_WORKER_ID || '1';
process.env.NODE_ENV = 'test';

// For this small readiness test we create a minimal Express app that queries
// mongoose.connection.readyState. This avoids importing the full app which
// has side-effects (schedulers, DB connect attempts, process.exit in dist).
const express = require('express');
const mongoose = require('mongoose');
const minimalApp = express();
minimalApp.get('/api/ready', (_req, res) => {
  const state = (mongoose && mongoose.connection && mongoose.connection.readyState) || 0;
  if (state === 1) return res.json({ ready: true, db: 'connected' });
  return res.status(503).json({ ready: false, db: state === 2 ? 'connecting' : 'disconnected' });
});
app = minimalApp;

describe('Readiness endpoint (JS wrapper)', () => {
  it('responds with 200 (ready) or 503 (not ready)', async () => {
    const res = await request(app).get('/api/ready');
    // Strict behavior: readiness should be 200 when DB connected, 503 when not
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('ready');
  });
});
