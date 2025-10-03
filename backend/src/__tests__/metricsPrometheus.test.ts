import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';

// We will spin up the express app by importing index (or a lighter app export if available)
// Mock auth middleware to bypass permission & token for the /metrics path tests.

jest.mock('../middleware/auth', () => ({
  __esModule: true,
  authenticateToken: (req: any, _res: any, next: any) => { req.user = { id: 'u1', companyId: 'c1', permissions: ['system.metrics'] }; next(); },
  authorize: (_perm: string) => (_req: any, _res: any, next: any) => next()
}));

// Ensure config flag enabled for this test
jest.mock('../config/config', () => ({ config: { METRICS_PROM_ENABLED: true, JWT_SECRET: 'x', PORT: 0 } }));

// Mock MetricsService snapshot
jest.mock('../services/MetricsService', () => ({
  __esModule: true,
  default: {
    snapshot: () => ({ counters: { 'pos.sync.runs': 3, 'pos.sync.errors': 1 } })
  }
}));

// Import app after mocks applied
import app from '../index';

describe('Prometheus Metrics Endpoint', () => {
  it('returns plain text metrics when enabled', async () => {
    const res = await request(app).get('/api/system/metrics/prom');
  // If route not found test should fail early
  expect(res.status).toBe(200);
  expect(res.headers['content-type']).toMatch(/text\/plain/);
  expect(res.text).toMatch(/pos_sync_runs 3/);
  expect(res.text).toMatch(/pos_sync_errors 1/);
  });
});
