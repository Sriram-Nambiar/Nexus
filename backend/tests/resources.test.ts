import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { createApp } from '../src/app';
import { getDatabase, closeDatabase } from '../src/db/database';
import { config } from '../src/config/env';

describe('Resources API & Delivery (/api/resources)', () => {
  let app: ReturnType<typeof createApp>;
  let courseId: string;
  let pdfResourceId: string;
  let videoResourceId: string;

  const tempPdfPath = path.resolve(config.UPLOAD_DIR, 'test_sample.pdf');
  const tempVideoPath = path.resolve(config.UPLOAD_DIR, 'test_sample.mp4');
  const tempMaliciousPath = path.resolve(config.UPLOAD_DIR, 'malicious.exe');

  beforeAll(() => {
    getDatabase(':memory:');
    app = createApp();

    if (!fs.existsSync(config.UPLOAD_DIR)) {
      fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
    }

    // Create dummy files for multipart test uploads
    fs.writeFileSync(tempPdfPath, '%PDF-1.4 Fake PDF Content for Unit Testing');
    // Create 1000 bytes dummy MP4 video buffer
    const videoBuffer = Buffer.alloc(1000, 0x7f);
    fs.writeFileSync(tempVideoPath, videoBuffer);
    fs.writeFileSync(tempMaliciousPath, 'MZ fake executable');
  });

  afterAll(() => {
    closeDatabase();
    [tempPdfPath, tempVideoPath, tempMaliciousPath].forEach((file) => {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch {
          // ignore cleanup errors
        }
      }
    });
  });

  it('Setup: Create a course for resource testing', async () => {
    const res = await request(app)
      .post('/api/courses')
      .send({
        title: 'Machine Learning & Neural Networks',
        instructor: 'Prof. Andrew Ng',
      });
    expect(res.status).toBe(201);
    courseId = res.body.data.id;
  });

  it('POST /api/resources should upload a PDF resource successfully (Milestone 1)', async () => {
    const res = await request(app)
      .post('/api/resources')
      .field('course_id', courseId)
      .field('title', 'Lecture 1: Gradient Descent Notes')
      .field('description', 'Comprehensive lecture notes on optimization')
      .attach('file', tempPdfPath);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toMatch(/^res_/);
    expect(res.body.data.resource_type).toBe('pdf');
    expect(res.body.data.mime_type).toBe('application/pdf');
    expect(res.body.data.file_url).toBe(`/api/resources/${res.body.data.id}/file`);

    pdfResourceId = res.body.data.id;
  });

  it('GET /api/resources/:id should retrieve PDF resource metadata', async () => {
    const res = await request(app).get(`/api/resources/${pdfResourceId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Lecture 1: Gradient Descent Notes');
    expect(res.body.data.course_id).toBe(courseId);
  });

  it('GET /api/resources/:id/file should stream PDF with inline browser headers', async () => {
    const res = await request(app).get(`/api/resources/${pdfResourceId}/file`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    expect(res.headers['content-disposition']).toContain('inline');
    expect(res.headers['accept-ranges']).toBe('bytes');
    expect(res.body.toString('utf-8')).toContain('%PDF-1.4');
  });

  it('POST /api/resources should upload a video resource', async () => {
    const res = await request(app)
      .post('/api/resources')
      .field('course_id', courseId)
      .field('title', 'Lecture 2: Backpropagation Video')
      .field('description', 'Video lecture for backpropagation algorithm')
      .attach('file', tempVideoPath);

    expect(res.status).toBe(201);
    expect(res.body.data.resource_type).toBe('video');
    expect(res.body.data.mime_type).toBe('video/mp4');

    videoResourceId = res.body.data.id;
  });

  it('GET /api/resources/:id/file should support HTTP Range request for video seeking (Kiwix hotspot)', async () => {
    const res = await request(app)
      .get(`/api/resources/${videoResourceId}/file`)
      .set('Range', 'bytes=0-99');

    expect(res.status).toBe(206); // Partial Content
    expect(res.headers['content-range']).toBe('bytes 0-99/1000');
    expect(res.headers['content-length']).toBe('100');
    expect(res.headers['content-type']).toBe('video/mp4');
    expect(res.headers['accept-ranges']).toBe('bytes');
  });

  it('GET /api/resources/:id/file should reject out-of-bounds Range with 416', async () => {
    const res = await request(app)
      .get(`/api/resources/${videoResourceId}/file`)
      .set('Range', 'bytes=2000-3000');

    expect(res.status).toBe(416); // Range Not Satisfiable
    expect(res.headers['content-range']).toBe('bytes */1000');
  });

  it('GET /api/courses/:id/resources should list all resources for the course', async () => {
    const res = await request(app).get(`/api/courses/${courseId}/resources`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2);
    expect(res.body.meta.count).toBe(2);
  });

  it('POST /api/resources should reject disallowed executable files', async () => {
    const res = await request(app)
      .post('/api/resources')
      .field('course_id', courseId)
      .field('title', 'Dangerous File')
      .attach('file', tempMaliciousPath);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/resources should reject upload when course_id does not exist', async () => {
    const res = await request(app)
      .post('/api/resources')
      .field('course_id', 'crs_nonexistent_999')
      .field('title', 'Orphan Resource')
      .attach('file', tempPdfPath);

    expect(res.status).toBe(404);
  });

  it('DELETE /api/resources/:id should delete resource and file', async () => {
    const res = await request(app).delete(`/api/resources/${pdfResourceId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const getRes = await request(app).get(`/api/resources/${pdfResourceId}`);
    expect(getRes.status).toBe(404);
  });
});
