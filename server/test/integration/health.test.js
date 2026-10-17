import request from 'supertest';
import { createApp } from '../../src/http/app.js';

describe('GET /health', () => {
  const app = createApp();

  it('returns 200 with status ok and commit sha', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('commit');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Not Found');
  });
});
