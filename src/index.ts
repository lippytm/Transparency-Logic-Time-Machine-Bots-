/**
 * Main entry point for Transparency Logic Time Machine Bots
 */

import { loadConfig } from './config';
import { initTelemetry, createLogger, shutdownTelemetry } from './telemetry';
import { SearchService } from './search';

const logger = createLogger('main');
let searchService: SearchService | undefined;

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

    // Initialize search service if enabled
    if (config.vectorDb?.enabled) {
      logger.info('Initializing search service...');
      searchService = new SearchService({
        enabled: true,
        type: config.vectorDb.type,
        apiKey: config.vectorDb.apiKey,
        endpoint: config.vectorDb.endpoint,
      });
      await searchService.initialize();
      logger.info('Search service initialized - you can now find items both ways!');
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
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  if (searchService) {
    await searchService.close();
  }
  await shutdownTelemetry();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  if (searchService) {
    await searchService.close();
  }
  await shutdownTelemetry();
  process.exit(0);
});

// Start the application
main();
