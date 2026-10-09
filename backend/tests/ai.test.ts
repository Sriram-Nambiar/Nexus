import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { getDatabase, closeDatabase } from '../src/db/database';

describe('AI Proxy API (/api/ai)', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    getDatabase(':memory:');
    app = createApp();
  });

  afterAll(() => {
    closeDatabase();
  });

  it('GET /api/ai/health should return AI service health status', async () => {
    const res = await request(app).get('/api/ai/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBeDefined();
  });

  it('POST /api/ai/ask should return AI response and sources', async () => {
    const res = await request(app)
      .post('/api/ai/ask')
      .send({
        question: 'What are the four necessary conditions for deadlocks?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.answer).toBeDefined();
    expect(res.body.data.answer.length).toBeGreaterThan(10);
    expect(Array.isArray(res.body.data.sources)).toBe(true);
  });

  it('POST /api/ai/ask should reject empty question with 400', async () => {
    const res = await request(app)
      .post('/api/ai/ask')
      .send({
        question: '',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  let savedStudyPlanId: string;

  it('POST /api/ai/study-plan should generate and persist study plan', async () => {
    const res = await request(app)
      .post('/api/ai/study-plan')
      .send({
        goal: 'Prepare for Machine Learning midterm exam',
        duration_weeks: 4,
        save: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.goal).toBe('Prepare for Machine Learning midterm exam');
    expect(res.body.data.plan).toBeDefined();
    expect(res.body.data.study_plan_id).toMatch(/^sp_/);

    savedStudyPlanId = res.body.data.study_plan_id;
  });

  it('GET /api/ai/study-plans should list saved study plans', async () => {
    const res = await request(app).get('/api/ai/study-plans');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/ai/study-plans/:id should retrieve specific study plan', async () => {
    const res = await request(app).get(`/api/ai/study-plans/${savedStudyPlanId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(savedStudyPlanId);
    expect(res.body.data.goal).toBe('Prepare for Machine Learning midterm exam');
  });
});
