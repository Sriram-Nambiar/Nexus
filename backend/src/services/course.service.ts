import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';
import { Course, CourseWithResources, Resource, ResourceResponse } from '../types';
import { NotFoundError } from '../middleware/error.middleware';

export interface CreateCourseInput {
  title: string;
  description?: string | null;
  instructor: string;
}

export interface UpdateCourseInput {
  title?: string;
  description?: string | null;
  instructor?: string;
}

export class CourseService {
  public static create(input: CreateCourseInput): Course {
    const db = getDatabase();
    const id = `crs_${uuidv4()}`;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO courses (id, title, description, instructor, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.title.trim(),
      input.description ? input.description.trim() : null,
      input.instructor.trim(),
      now,
      now
    );

    return this.getById(id);
  }

  public static getById(id: string): CourseWithResources {
    const db = getDatabase();
    const courseStmt = db.prepare('SELECT * FROM courses WHERE id = ?');
    const course = courseStmt.get(id) as Course | undefined;

    if (!course) {
      throw new NotFoundError(`Course with id '${id}' not found`);
    }

    const resourcesStmt = db.prepare('SELECT * FROM resources WHERE course_id = ? ORDER BY created_at DESC');
    const resources = resourcesStmt.all(id) as Resource[];

    const formattedResources: ResourceResponse[] = resources.map((res) => ({
      ...res,
      file_url: `/api/resources/${res.id}/file`,
      download_url: `/api/resources/${res.id}/file?download=1`,
    }));

    return {
      ...course,
      resources: formattedResources,
    };
  }

  public static list(search?: string, limit = 50, offset = 0): { courses: Course[]; total: number } {
    const db = getDatabase();

    if (search && search.trim().length > 0) {
      const term = `%${search.trim()}%`;
      const countStmt = db.prepare(`
        SELECT COUNT(*) as count FROM courses 
        WHERE title LIKE ? OR description LIKE ? OR instructor LIKE ?
      `);
      const total = (countStmt.get(term, term, term) as { count: number }).count;

      const stmt = db.prepare(`
        SELECT * FROM courses 
        WHERE title LIKE ? OR description LIKE ? OR instructor LIKE ?
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `);
      const courses = stmt.all(term, term, term, limit, offset) as Course[];

      return { courses, total };
    }

    const countStmt = db.prepare('SELECT COUNT(*) as count FROM courses');
    const total = (countStmt.get() as { count: number }).count;

    const stmt = db.prepare('SELECT * FROM courses ORDER BY created_at DESC LIMIT ? OFFSET ?');
    const courses = stmt.all(limit, offset) as Course[];

    return { courses, total };
  }

  public static update(id: string, input: UpdateCourseInput): Course {
    const db = getDatabase();
    const existing = this.getById(id);
    const now = new Date().toISOString();

    const title = input.title !== undefined ? input.title.trim() : existing.title;
    const description = input.description !== undefined ? (input.description ? input.description.trim() : null) : existing.description;
    const instructor = input.instructor !== undefined ? input.instructor.trim() : existing.instructor;

    const stmt = db.prepare(`
      UPDATE courses 
      SET title = ?, description = ?, instructor = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(title, description, instructor, now, id);

    return this.getById(id);
  }

  public static delete(id: string): void {
    const db = getDatabase();
    // Check existence first
    this.getById(id);

    const stmt = db.prepare('DELETE FROM courses WHERE id = ?');
    stmt.run(id);
  }
}
