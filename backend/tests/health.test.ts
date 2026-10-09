import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { getDatabase, closeDatabase } from '../src/db/database';

describe('Health Check API (GET /api/health)', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    // In-memory database for testing
    getDatabase(':memory:');
    app = createApp();
  });

  afterAll(() => {
    closeDatabase();
  });

  it('should return 200 with healthy system status and service checks', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.services.database).toBe('connected');
    expect(res.body.services.storage).toBe('available');
    expect(res.body.network).toHaveProperty('host');
    expect(res.body.network).toHaveProperty('port');
  });

  it('should return 200 on root API info endpoint', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('NEXUS AI Backend API');
    expect(res.body.endpoints).toBeDefined();
  });
});
