import request from 'supertest';
import app from '../index';

describe('Readiness endpoint', () => {
  it('responds with 200 or 503 depending on DB connection', async () => {
    const res = await request(app).get('/api/ready');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('ready');
  });
});
