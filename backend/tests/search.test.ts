import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { getDatabase, closeDatabase } from '../src/db/database';
import { CourseService } from '../src/services/course.service';
import { ResourceService } from '../src/services/resource.service';

describe('Search API (/api/search)', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    getDatabase(':memory:');
    app = createApp();

    // Create seed data
    const osCourse = CourseService.create({
      title: 'Operating Systems & Concurrency',
      description: 'Covers process scheduling, mutexes, and deadlocks in distributed kernels',
      instructor: 'Dr. Dijkstra',
    });

    CourseService.create({
      title: 'Computer Networks',
      description: 'TCP/IP, routing, congestion control, and socket programming',
      instructor: 'Dr. Cerf',
    });

    ResourceService.create({
      course_id: osCourse.id,
      title: 'Deadlocks and Bankers Algorithm Explained',
      description: 'Study guide on resource allocation graphs and safe states',
      resource_type: 'notes',
      storage_path: 'deadlocks_guide.txt',
      mime_type: 'text/plain',
      file_size: 512,
    });
  });

  afterAll(() => {
    closeDatabase();
  });

  it('GET /api/search?q=deadlocks should return matching courses and resources', async () => {
    const res = await request(app).get('/api/search?q=deadlocks');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.query).toBe('deadlocks');
    expect(res.body.data.courses.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.resources.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.total).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/search?q=networks should match network course', async () => {
    const res = await request(app).get('/api/search?q=networks');

    expect(res.status).toBe(200);
    expect(res.body.data.courses[0].title).toContain('Networks');
  });

  it('GET /api/search without query should return 400', async () => {
    const res = await request(app).get('/api/search');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
