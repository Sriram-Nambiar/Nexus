import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  HOST: z.string().default('127.0.0.1'),
  ENABLE_LAN_ACCESS: z
    .union([z.boolean(), z.string().transform((val) => val === 'true' || val === '1')])
    .default(false),
  BASE_URL: z.string().default('http://localhost:5000'),
  CORS_ORIGIN: z.string().default('*'),

  // Storage paths
  DB_PATH: z.string().default('./data/nexus.sqlite'),
  UPLOAD_DIR: z.string().default('./data/uploads'),

  // File upload constraints
  MAX_FILE_SIZE_BYTES: z.coerce.number().int().positive().default(524288000), // 500 MB default

  // AI Service settings
  AI_SERVICE_URL: z.string().default('http://127.0.0.1:8000'),
  AI_SERVICE_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  AI_SERVICE_API_KEY: z.string().optional().default(''),
  AI_MOCK_FALLBACK: z
    .union([z.boolean(), z.string().transform((val) => val === 'true' || val === '1')])
    .default(process.env.NODE_ENV === 'test'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(120),
  AI_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(30),

  // Security
  ADMIN_API_KEY: z.string().optional().default(''),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  throw new Error('Environment configuration validation failed.');
}

const rawConfig = parsedEnv.data;

// If LAN access is enabled, bind to 0.0.0.0 to accept network connections
const host = rawConfig.ENABLE_LAN_ACCESS ? '0.0.0.0' : rawConfig.HOST;

// Resolve DB path and Upload directory to absolute paths
const dbPath =
  rawConfig.DB_PATH === ':memory:'
    ? ':memory:'
    : path.resolve(process.cwd(), rawConfig.DB_PATH);

const uploadDir = path.resolve(process.cwd(), rawConfig.UPLOAD_DIR);

export const config = {
  ...rawConfig,
  HOST: host,
  DB_PATH: dbPath,
  UPLOAD_DIR: uploadDir,
};

export type Config = typeof config;
