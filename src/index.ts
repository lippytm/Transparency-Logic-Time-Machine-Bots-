/**
 * Main entry point for Transparency Logic Time Machine Bots
 */

import { loadConfig } from './config';
import { initTelemetry, createLogger, shutdownTelemetry } from './telemetry';
import { PlatformManager } from './platforms';

const logger = createLogger('main');
let platformManager: PlatformManager | null = null;

async function main() {
  try {
    // Load and validate configuration
    logger.info('Loading configuration...');
    const config = loadConfig();
    logger.info('Configuration loaded successfully', {
      environment: config.app.environment,
      port: config.app.port,
    });

    // Initialize telemetry if enabled
    if (config.telemetry?.enabled) {
      initTelemetry({
        enabled: true,
        serviceName: config.telemetry.serviceName || config.app.name,
        endpoint: config.telemetry.endpoint,
        sampleRate: config.telemetry.sampleRate,
      });
    }

    // Initialize platform manager if platforms are configured
    if (config.platforms) {
      logger.info('Initializing platform connectors...');
      platformManager = new PlatformManager({
        manychat: config.platforms.manychat,
        botbuilders: config.platforms.botbuilders,
        openclaw: config.platforms.openclaw,
        moltbook: config.platforms.moltbook,
      });
      await platformManager.initialize();

      const enabledPlatforms = platformManager.getEnabledPlatforms();
      logger.info('Platform connectors initialized', {
        platforms: enabledPlatforms,
        count: enabledPlatforms.length,
      });
    }

    logger.info('Application started successfully');

    // Your application logic here
    // ...
  } catch (error) {
    logger.error('Application failed to start', error instanceof Error ? error : undefined);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down gracefully...');
  if (platformManager) {
    await platformManager.shutdown();
  }
  await shutdownTelemetry();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the application
main();
