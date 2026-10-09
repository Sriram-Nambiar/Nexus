import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import os from 'os';
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

  public static async getOffspotStatus(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Detect Offspot indicators
      const hasOffspotBootConfig = fs.existsSync('/boot/firmware/offspot.yaml');
      const hasOffspotEtc = fs.existsSync('/etc/offspot');
      const hasOffspotSocket = fs.existsSync('/run/offspot/mekhenet.sock');
      const isOffspotConfigured =
        hasOffspotBootConfig || hasOffspotEtc || hasOffspotSocket || process.env.OFFSPOT_INTEGRATION === 'true';

      // 2. Storage metrics & resource counts
      const storageMetrics = {
        upload_dir: config.UPLOAD_DIR,
        database_path: config.DB_PATH,
        status: 'available',
        total_resources: 0,
        total_size_bytes: 0,
        zim_packages_found: 0,
      };

      try {
        const db = getDatabase();
        const countRow = db
          .prepare('SELECT COUNT(*) as count, SUM(file_size) as total_size FROM resources')
          .get() as { count: number; total_size: number } | undefined;
        const zimCountRow = db
          .prepare("SELECT COUNT(*) as count FROM resources WHERE storage_path LIKE '%.zim' OR mime_type = 'application/x-zim'")
          .get() as { count: number } | undefined;

        storageMetrics.total_resources = countRow?.count || 0;
        storageMetrics.total_size_bytes = countRow?.total_size || 0;
        storageMetrics.zim_packages_found = zimCountRow?.count || 0;
      } catch (err) {
        storageMetrics.status = `error: ${(err as Error).message}`;
      }

      // 3. Network & IP Interfaces
      const interfaces = os.networkInterfaces();
      const networkIps: Array<{ interface: string; ip: string; type: string }> = [];
      for (const name of Object.keys(interfaces)) {
        const netList = interfaces[name];
        if (netList) {
          for (const net of netList) {
            if (net.family === 'IPv4' && !net.internal) {
              networkIps.push({
                interface: name,
                ip: net.address,
                type:
                  name.toLowerCase().includes('wi-fi') ||
                  name.toLowerCase().includes('wlan') ||
                  name.toLowerCase().includes('ap')
                    ? 'wireless'
                    : 'ethernet/virtual',
              });
            }
          }
        }
      }

      // 4. AI Service
      let aiStatus = 'unknown';
      try {
        const aiHealth = await aiServiceClient.checkHealth();
        aiStatus = aiHealth.status;
      } catch (err) {
        aiStatus = `unavailable (${(err as Error).message})`;
      }

      res.status(200).json({
        success: true,
        data: {
          backend: {
            status: 'healthy',
            uptime_seconds: Math.floor(process.uptime()),
            environment: config.NODE_ENV,
            lan_access_enabled: config.ENABLE_LAN_ACCESS,
            port: config.PORT,
            host_binding: config.HOST,
          },
          storage: storageMetrics,
          ai_service: {
            url: config.AI_SERVICE_URL,
            status: aiStatus,
            mock_fallback: config.AI_MOCK_FALLBACK,
          },
          network: {
            detected_addresses: networkIps,
            access_urls: networkIps.map((n) => `http://${n.ip}:${config.PORT}`),
          },
          offspot: {
            configured: isOffspotConfigured,
            deployment_mode: isOffspotConfigured
              ? 'Offspot Raspberry Pi Hotspot'
              : 'Local Host / Standalone Network (Mode A)',
            access_point_status: isOffspotConfigured
              ? 'Managed by Offspot Host OS (hostapd / dnsmasq)'
              : 'Not detected in this deployment',
            domain_name: isOffspotConfigured ? process.env.OFFSPOT_DOMAIN || 'nexus.hotspot' : null,
            kiwix_service: {
              url: process.env.KIWIX_SERVICE_URL || (isOffspotConfigured ? 'http://browse.hotspot' : 'Not configured'),
              integrated: storageMetrics.zim_packages_found > 0,
            },
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
