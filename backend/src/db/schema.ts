import Database from 'better-sqlite3';

export function initializeSchema(db: Database.Database): void {
  // Enforce foreign key constraints
  db.pragma('foreign_keys = ON');

  // Courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      instructor TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Resources table
  db.exec(`
    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      resource_type TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
  `);

  // Study plans table
  db.exec(`
    CREATE TABLE IF NOT EXISTS study_plans (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      goal TEXT NOT NULL,
      plan_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Performance and search indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_resources_course_id ON resources(course_id);
    CREATE INDEX IF NOT EXISTS idx_resources_resource_type ON resources(resource_type);
    CREATE INDEX IF NOT EXISTS idx_courses_title ON courses(title);
    CREATE INDEX IF NOT EXISTS idx_resources_title ON resources(title);
    CREATE INDEX IF NOT EXISTS idx_study_plans_goal ON study_plans(goal);
  `);
}
