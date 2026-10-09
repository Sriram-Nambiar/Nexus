import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';
import { ParsedStudyPlan, StudyPlan } from '../types';
import { NotFoundError } from '../middleware/error.middleware';

export interface SaveStudyPlanInput {
  title: string;
  goal: string;
  plan: Record<string, unknown>;
  id?: string;
}

export class StudyPlanService {
  public static save(input: SaveStudyPlanInput): ParsedStudyPlan {
    const db = getDatabase();
    const id = input.id || `sp_${uuidv4()}`;
    const now = new Date().toISOString();
    const planJson = JSON.stringify(input.plan);

    const existingStmt = db.prepare('SELECT id, created_at FROM study_plans WHERE id = ?');
    const existing = existingStmt.get(id) as { id: string; created_at: string } | undefined;

    if (existing) {
      const stmt = db.prepare(`
        UPDATE study_plans
        SET title = ?, goal = ?, plan_json = ?, updated_at = ?
        WHERE id = ?
      `);
      stmt.run(input.title.trim(), input.goal.trim(), planJson, now, id);
    } else {
      const stmt = db.prepare(`
        INSERT INTO study_plans (id, title, goal, plan_json, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, input.title.trim(), input.goal.trim(), planJson, now, now);
    }

    return this.getById(id);
  }

  public static getById(id: string): ParsedStudyPlan {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM study_plans WHERE id = ?');
    const record = stmt.get(id) as StudyPlan | undefined;

    if (!record) {
      throw new NotFoundError(`Study plan with id '${id}' not found`);
    }

    let parsedPlan: Record<string, unknown> = {};
    try {
      parsedPlan = JSON.parse(record.plan_json);
    } catch {
      parsedPlan = { raw: record.plan_json };
    }

    return {
      id: record.id,
      title: record.title,
      goal: record.goal,
      plan: parsedPlan,
      created_at: record.created_at,
      updated_at: record.updated_at,
    };
  }

  public static list(limit = 50, offset = 0): { plans: ParsedStudyPlan[]; total: number } {
    const db = getDatabase();
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM study_plans');
    const total = (countStmt.get() as { count: number }).count;

    const stmt = db.prepare('SELECT * FROM study_plans ORDER BY created_at DESC LIMIT ? OFFSET ?');
    const records = stmt.all(limit, offset) as StudyPlan[];

    const plans = records.map((record) => {
      let parsedPlan: Record<string, unknown> = {};
      try {
        parsedPlan = JSON.parse(record.plan_json);
      } catch {
        parsedPlan = { raw: record.plan_json };
      }
      return {
        id: record.id,
        title: record.title,
        goal: record.goal,
        plan: parsedPlan,
        created_at: record.created_at,
        updated_at: record.updated_at,
      };
    });

    return { plans, total };
  }

  public static delete(id: string): void {
    const db = getDatabase();
    this.getById(id);
    const stmt = db.prepare('DELETE FROM study_plans WHERE id = ?');
    stmt.run(id);
  }
}
