import os from 'os';
import { createApp } from './app';
import { config } from './config/env';
import { getDatabase, closeDatabase } from './db/database';

function getLocalIpAddresses(): string[] {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];
  for (const name of Object.keys(interfaces)) {
    const netList = interfaces[name];
    if (netList) {
      for (const net of netList) {
        if (net.family === 'IPv4' && !net.internal) {
          addresses.push(net.address);
        }
      }
    }
  }
  return addresses;
}

export function startServer() {
  // Initialize Database connection on boot
  getDatabase();

  const app = createApp();

  const server = app.listen(config.PORT, config.HOST, () => {
    console.log(`====================================================`);
    console.log(`  NEXUS AI Backend Server running successfully!     `);
    console.log(`====================================================`);
    console.log(`- Environment : ${config.NODE_ENV}`);
    console.log(`- Bound Host  : ${config.HOST}`);
    console.log(`- Bound Port  : ${config.PORT}`);
    console.log(`- Local URL   : http://localhost:${config.PORT}`);

    if (config.HOST === '0.0.0.0' || config.ENABLE_LAN_ACCESS) {
      console.log(`- LAN Access  : ENABLED (Kiwix Hotspot / Campus Wi-Fi)`);
      const ips = getLocalIpAddresses();
      if (ips.length > 0) {
        console.log(`- Network Access URLs for students on the same hotspot:`);
        ips.forEach((ip) => {
          console.log(`    -> http://${ip}:${config.PORT}`);
        });
      }
    } else {
      console.log(`- LAN Access  : DISABLED (Bound strictly to localhost)`);
    }

    console.log(`- Upload Dir  : ${config.UPLOAD_DIR}`);
    console.log(`- Database    : ${config.DB_PATH}`);
    console.log(`- AI Service  : ${config.AI_SERVICE_URL}`);
    console.log(`====================================================\n`);
  });

  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    console.log(`\nReceived ${signal}. Gracefully shutting down NEXUS server...`);
    server.close(() => {
      console.log('HTTP server closed.');
      closeDatabase();
      console.log('Database connection closed.');
      process.exit(0);
    });

    // Force shutdown after 10s if connections remain open
    setTimeout(() => {
      console.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return server;
}

// Start immediately if executed directly
if (require.main === module) {
  startServer();
}
