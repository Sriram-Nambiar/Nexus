import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { getDatabase, closeDatabase } from '../src/db/database';

describe('Courses API (/api/courses)', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    getDatabase(':memory:');
    app = createApp();
  });

  afterAll(() => {
    closeDatabase();
  });

  let createdCourseId: string;

  it('POST /api/courses should create a course with valid input', async () => {
    const res = await request(app)
      .post('/api/courses')
      .send({
        title: 'Distributed Systems 101',
        description: 'Introduction to consensus algorithms, Raft, and Paxos',
        instructor: 'Prof. Alan Turing',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toMatch(/^crs_/);
    expect(res.body.data.title).toBe('Distributed Systems 101');
    expect(res.body.data.instructor).toBe('Prof. Alan Turing');
    expect(res.body.data.created_at).toBeDefined();

    createdCourseId = res.body.data.id;
  });

  it('POST /api/courses should reject invalid payload missing title or instructor', async () => {
    const res = await request(app)
      .post('/api/courses')
      .send({
        description: 'Missing title and instructor',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.issues).toBeDefined();
  });

  it('GET /api/courses should list courses', async () => {
    const res = await request(app).get('/api/courses');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/courses/:id should return single course with resources array', async () => {
    const res = await request(app).get(`/api/courses/${createdCourseId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdCourseId);
    expect(Array.isArray(res.body.data.resources)).toBe(true);
  });

  it('PUT /api/courses/:id should update course details', async () => {
    const res = await request(app)
      .put(`/api/courses/${createdCourseId}`)
      .send({
        title: 'Distributed Systems & Cloud Computing',
        instructor: 'Prof. Alan Turing, FRS',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Distributed Systems & Cloud Computing');
    expect(res.body.data.instructor).toBe('Prof. Alan Turing, FRS');
  });

  it('GET /api/courses/:id should return 404 for nonexistent course', async () => {
    const res = await request(app).get('/api/courses/crs_nonexistent_12345');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('DELETE /api/courses/:id should delete the course', async () => {
    const res = await request(app).delete(`/api/courses/${createdCourseId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it is gone
    const getRes = await request(app).get(`/api/courses/${createdCourseId}`);
    expect(getRes.status).toBe(404);
  });
});
