import express, { Application, Request, Response } from 'express';
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

  // Root endpoint with overview
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

  // Mount API router under /api
  app.use('/api', apiRouter);

  // 404 Not Found Handler
  app.use(notFoundHandler);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp;
