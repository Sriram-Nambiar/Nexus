import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { config } from './config/env';
import apiRouter from './routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { standardRateLimiter } from './middleware/rate-limit';

export function createApp(): Application {
  const app = express();

  // CORS configuration for LAN and cross-origin access
  const corsOrigin = config.CORS_ORIGIN === '*' ? '*' : config.CORS_ORIGIN.split(',').map((s) => s.trim());
  app.use(
    cors({
      origin: corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'Accept'],
      exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length', 'Content-Disposition'],
    })
  );

  // Body parsers with appropriate size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // General rate limiting across endpoints
  app.use('/api', standardRateLimiter);

  // Mount API router under /api
  app.use('/api', apiRouter);

  // Candidate directories for compiled frontend assets
  const candidateFrontendDirs = [
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(process.cwd(), './frontend/dist'),
    path.resolve(process.cwd(), './public'),
  ];
  const frontendDist = candidateFrontendDirs.find((dir) => fs.existsSync(dir));

  if (frontendDist && process.env.NODE_ENV !== 'test') {
    app.use(express.static(frontendDist));
    // SPA Fallback for client-side routing (e.g. /courses, /assistant)
    app.use((req: Request, res: Response, next: NextFunction) => {
      if ((req.method === 'GET' || req.method === 'HEAD') && !req.path.startsWith('/api')) {
        return res.sendFile(path.join(frontendDist, 'index.html'));
      }
      next();
    });
  } else {
    // Root API fallback when frontend build is not found or in test mode
    app.get('/', (_req: Request, res: Response) => {
      res.status(200).json({
        name: 'NEXUS AI Backend API',
        version: '1.0.0',
        description: 'Educational resource management, search, and AI proxy system',
        endpoints: {
          health: '/api/health',
          courses: '/api/courses',
          resources: '/api/resources',
          search: '/api/search?q=deadlocks',
          ai_ask: '/api/ai/ask',
          ai_study_plan: '/api/ai/study-plan',
        },
      });
    });
  }

  // 404 Not Found Handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp;
