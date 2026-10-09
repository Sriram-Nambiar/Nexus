import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { getDatabase } from '../db/database';
import { config } from '../config/env';
import { aiServiceClient } from '../services/ai-client.service';

export class HealthController {
  public static async getHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Check database status
      let dbStatus = 'connected';
      try {
        const db = getDatabase();
        db.prepare('SELECT 1').get();
      } catch (err) {
        dbStatus = `error: ${(err as Error).message}`;
      }

      // Check upload directory
      let storageStatus = 'available';
      try {
        if (!fs.existsSync(config.UPLOAD_DIR)) {
          fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
        }
        // Test directory writeability
        const testFile = `${config.UPLOAD_DIR}/.healthcheck_${Date.now()}`;
        fs.writeFileSync(testFile, 'ok');
        fs.unlinkSync(testFile);
      } catch (err) {
        storageStatus = `error: ${(err as Error).message}`;
      }

      // Check AI service status asynchronously
      let aiStatus = 'unknown';
      try {
        const aiHealth = await aiServiceClient.checkHealth();
        aiStatus = aiHealth.status;
      } catch (err) {
        aiStatus = `unavailable (${(err as Error).message})`;
      }

      const isHealthy = dbStatus === 'connected' && storageStatus === 'available';

      res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'degraded',
        uptime_seconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        network: {
          host: config.HOST,
          port: config.PORT,
          lan_access_enabled: config.ENABLE_LAN_ACCESS,
          base_url: config.BASE_URL,
        },
        services: {
          database: dbStatus,
          storage: storageStatus,
          ai_service: aiStatus,
        },
        environment: config.NODE_ENV,
      });
    } catch (err) {
      next(err);
    }
  }
}
