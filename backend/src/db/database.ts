import fs from 'fs';
import path from 'path';
const nodeRequire = typeof require !== 'undefined' ? require : (0, eval)('require');
const { DatabaseSync } = nodeRequire('node:sqlite');
import { config } from '../config/env';
import { initializeSchema } from './schema';

export interface WrappedStatement {
  run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
  get(...params: any[]): any;
  all(...params: any[]): any[];
}

export class AppDatabase {
  private db: any;

  constructor(location: string) {
    this.db = new DatabaseSync(location);
  }

  pragma(sql: string): void {
    this.db.exec(`PRAGMA ${sql};`);
  }

  exec(sql: string): void {
    this.db.exec(sql);
  }

  prepare(sql: string): WrappedStatement {
    const stmt = this.db.prepare(sql);
    return {
      run: (...args: any[]) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return stmt.run(...params);
      },
      get: (...args: any[]) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return stmt.get(...params);
      },
      all: (...args: any[]) => {
        const params = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
        return stmt.all(...params);
      },
    };
  }

  close(): void {
    this.db.close();
  }
}

let dbInstance: AppDatabase | null = null;

export function getDatabase(customPath?: string): AppDatabase {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  const targetPath = customPath || config.DB_PATH;

  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new AppDatabase(targetPath);

  // Configure SQLite pragmas for safety, integrity, and performance
  db.pragma('foreign_keys = ON');

  if (targetPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
  }

  // Initialize schema
  initializeSchema(db);

  if (!customPath) {
    dbInstance = db;
  }

  return db;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
