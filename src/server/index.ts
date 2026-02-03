import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiKeysRoutes from '../routes/api-keys.routes';
import webhooksRoutes from '../routes/webhooks.routes';
import { createLogger } from '../telemetry';

const logger = createLogger('server');

/**
 * Create and configure Express application
 */
export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());

  // JSON body parser
  app.use(express.json());

  // Rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // API routes with rate limiting
  app.use('/api/keys', authLimiter, apiKeysRoutes);
  app.use('/api/webhooks', authLimiter, webhooksRoutes);

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler
  app.use((err: Error, req: Request, res: Response, _next: express.NextFunction) => {
    logger.error('Unhandled error', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

/**
 * Start the Express server
 */
export function startServer(app: Application, port: number): void {
  app.listen(port, () => {
    logger.info(`Server listening on port ${port}`);
  });
}
