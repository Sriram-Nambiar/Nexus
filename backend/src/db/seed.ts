import fs from 'fs';
import path from 'path';
import { getDatabase } from './database';
import { config } from '../config/env';

export function seedDatabase(): void {
  const db = getDatabase();

  console.log('Seeding database with demo courses, videos, and study plans...');

  // Ensure upload directory exists
  if (!fs.existsSync(config.UPLOAD_DIR)) {
    fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
  }

  const now = new Date().toISOString();

  // Helper to safely get file size or 0
  const getFileSize = (filename: string): number => {
    const fullPath = path.resolve(config.UPLOAD_DIR, filename);
    if (fs.existsSync(fullPath)) {
      return fs.statSync(fullPath).size;
    }
    return 10240;
  };

  // 1. Seed Courses
  const insertCourse = db.prepare(`
    INSERT OR REPLACE INTO courses (id, title, description, instructor, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertCourse.run(
    'crs_ml_nptel',
    'Machine Learning (NPTEL)',
    'Comprehensive machine learning curriculum covering supervised learning, classification, linear models, and neural networks.',
    'Prof. Balaraman Ravindran',
    now,
    now
  );

  insertCourse.run(
    'crs_os_deadlocks',
    'Operating Systems & Concurrency',
    'In-depth study of process scheduling, synchronization primitives, deadlocks, and resource allocation graphs.',
    'Dr. Sarah Lin',
    now,
    now
  );

  // 2. Seed Resources
  const insertResource = db.prepare(`
    INSERT OR REPLACE INTO resources (
      id, course_id, title, description, resource_type,
      storage_path, mime_type, file_size, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Demo Video 1: ML NPTEL Supervised Learning
  insertResource.run(
    'res_ml_video_1',
    'crs_ml_nptel',
    'Week 1 Lecture 2 - Supervised Learning | Machine Learning- Balaraman Ravindran',
    'Supervised learning definitions, training sets, loss functions. Accessible offline on local Kiwix hotspot server (or online at https://youtu.be/OTAR0kT1swg?si=1BkIj5iO7gYzKiRD).',
    'video',
    'supervised_learning_lecture.mp4',
    'video/mp4',
    getFileSize('supervised_learning_lecture.mp4'),
    now
  );

  // Demo Kiwix ZIM 1: ML NPTEL Supervised Learning Kiwix Package
  insertResource.run(
    'res_zim_ml_nptel',
    'crs_ml_nptel',
    'Kiwix ZIM Package: Week 1 Lecture 2 Supervised Learning',
    'Complete offline ZIM archive containing NPTEL Supervised Learning video lecture and interactive notes formatted for Kiwix offline distribution hotspot.',
    'other',
    'Week_1_Lecture_2_Supervised_Learning.zim',
    'application/x-zim',
    getFileSize('Week_1_Lecture_2_Supervised_Learning.zim'),
    now
  );

  // Demo PDF 1: ML Notes
  insertResource.run(
    'res_ml_pdf_1',
    'crs_ml_nptel',
    'Week 1 Supervised Learning Lecture Notes & Syllabus',
    'Full lecture notes for Supervised Learning fundamentals, regression versus classification, and generalization bounds.',
    'pdf',
    'demo_ml_notes.pdf',
    'application/pdf',
    getFileSize('demo_ml_notes.pdf'),
    now
  );

  // Demo Video 2: OS Deadlocks (Supervised Learning NPTEL Lecture)
  insertResource.run(
    'res_os_video_deadlocks',
    'crs_os_deadlocks',
    'Operating Systems: Deadlocks & Supervised Resource Allocation',
    'Detailed breakdown of Coffman conditions and resource allocation with NPTEL lecture video stream.',
    'video',
    'supervised_learning_lecture.mp4',
    'video/mp4',
    getFileSize('supervised_learning_lecture.mp4'),
    now
  );

  // Demo PDF 2: Deadlocks Study Guide
  insertResource.run(
    'res_os_pdf_deadlocks',
    'crs_os_deadlocks',
    'Deadlocks and Concurrency Study Guide',
    'Comprehensive study notes on deadlock prevention, detection, and Resource Allocation Graphs (RAG).',
    'pdf',
    'demo_os_deadlocks.pdf',
    'application/pdf',
    getFileSize('demo_os_deadlocks.pdf'),
    now
  );

  // 3. Seed Study Plan
  const insertPlan = db.prepare(`
    INSERT OR REPLACE INTO study_plans (id, title, goal, plan_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertPlan.run(
    'sp_ml_mastery',
    'Machine Learning & Operating Systems Exam Preparation',
    'Master supervised learning algorithms and deadlock prevention for university semester finals',
    JSON.stringify({
      title: 'Machine Learning & Operating Systems Exam Preparation',
      goal: 'Master supervised learning algorithms and deadlock prevention',
      estimated_hours_per_week: 6,
      weeks: [
        {
          week: 1,
          topic: 'Week 1: Supervised Learning & Regression Basics',
          activities: [
            'Watch NPTEL Week 1 Lecture 2 video on local Kiwix hotspot',
            'Read Supervised Learning Lecture Notes PDF',
            'Practice loss function derivation',
          ],
        },
        {
          week: 2,
          topic: 'Week 2: Classification, Decision Trees, and Evaluation Metrics',
          activities: [
            'Review classification metrics (precision, recall, F1)',
            'Implement binary logistic regression',
          ],
        },
        {
          week: 3,
          topic: 'Week 3: Operating Systems Deadlocks and Coffman Conditions',
          activities: [
            'Watch Deadlocks and Bankers Algorithm lecture video',
            'Review Resource Allocation Graphs (RAG) and cycle detection',
          ],
        },
        {
          week: 4,
          topic: 'Week 4: Comprehensive Review and Mock Exam',
          activities: [
            'Run AI interactive practice queries via NEXUS Ask endpoint',
            'Complete timed practice test',
          ],
        },
      ],
    }),
    now,
    now
  );

  console.log('Seeding complete! 2 courses, 4 resources (2 videos + 2 PDFs), and 1 study plan seeded.');
}

// Run directly if script is executed
if (require.main === module) {
  seedDatabase();
}
