import { Request, Response, NextFunction } from 'express';
import { verifyApiKey, hasScope, ApiKey } from '../services/api-key.service';
import { createLogger } from '../telemetry';

const logger = createLogger('auth-middleware');

// Extend Express Request type to include apiKey
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKey;
    }
  }
}

export interface AuthOptions {
  pepper?: string;
  requiredScopes?: string[];
}

/**
 * Middleware to authenticate API key from Bearer token
 */
export function authenticate(options: AuthOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization header' });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      const apiKey = await verifyApiKey(token, options.pepper);

      if (!apiKey) {
        logger.warn('Invalid API key attempt', {
          ip: req.ip,
          path: req.path,
        });
        res.status(401).json({ error: 'Invalid API key' });
        return;
      }

      // Check scopes if required
      if (options.requiredScopes && options.requiredScopes.length > 0) {
        const hasRequiredScopes = options.requiredScopes.every((scope) => hasScope(apiKey, scope));

        if (!hasRequiredScopes) {
          logger.warn('Insufficient scopes', {
            owner: apiKey.owner,
            required: options.requiredScopes,
            actual: apiKey.scopes,
          });
          res.status(403).json({ error: 'Insufficient permissions' });
          return;
        }
      }

      // Attach API key to request
      req.apiKey = apiKey;

      logger.debug('API key authenticated', {
        owner: apiKey.owner,
        scopes: apiKey.scopes,
      });

      next();
    } catch (error) {
      logger.error('Authentication error', error instanceof Error ? error : undefined);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

/**
 * Middleware to check for specific scopes
 */
export function requireScopes(...scopes: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.apiKey) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const hasRequiredScopes = scopes.every((scope) => hasScope(req.apiKey!, scope));

    if (!hasRequiredScopes) {
      logger.warn('Insufficient scopes', {
        owner: req.apiKey.owner,
        required: scopes,
        actual: req.apiKey.scopes,
      });
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
