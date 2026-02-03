import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createApiKey, listApiKeys, revokeApiKey } from '../services/api-key.service';
import { createLogger } from '../telemetry';

const logger = createLogger('api-key-routes');
const router = Router();

// Store for idempotency keys (in production, use Redis or database)
const idempotencyStore = new Map<string, unknown>();

/**
 * POST /api/keys - Create a new API key
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, owner, scopes, prefix, pepper } = req.body;

    // Validate required fields
    if (!name || !owner || !scopes) {
      res.status(400).json({ error: 'Missing required fields: name, owner, scopes' });
      return;
    }

    if (!Array.isArray(scopes)) {
      res.status(400).json({ error: 'scopes must be an array' });
      return;
    }

    // Handle idempotency
    const idempotencyKey = req.headers['idempotency-key'] as string;
    if (idempotencyKey) {
      const cachedResponse = idempotencyStore.get(idempotencyKey);
      if (cachedResponse) {
        logger.debug('Returning cached response for idempotency key', { idempotencyKey });
        res.status(200).json(cachedResponse);
        return;
      }
    }

    const apiKey = await createApiKey({ name, owner, scopes, prefix, pepper });

    // Audit log
    logger.info('API key created via endpoint', {
      id: apiKey.id,
      name: apiKey.name,
      owner: apiKey.owner,
      scopes: apiKey.scopes,
    });

    const response = {
      id: apiKey.id,
      name: apiKey.name,
      owner: apiKey.owner,
      scopes: apiKey.scopes,
      prefix: apiKey.prefix,
      token: apiKey.token, // Only returned once
      created_at: apiKey.created_at,
    };

    // Store for idempotency
    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, response);
      // Clean up after 24 hours
      setTimeout(() => idempotencyStore.delete(idempotencyKey), 24 * 60 * 60 * 1000);
    }

    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating API key', error instanceof Error ? error : undefined);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/keys - List API keys
 */
router.get('/', authenticate(), async (req: Request, res: Response): Promise<void> => {
  try {
    const owner = req.apiKey!.owner;
    const apiKeys = await listApiKeys(owner);

    const response = apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      owner: key.owner,
      scopes: key.scopes,
      prefix: key.prefix,
      last_used_at: key.last_used_at,
      created_at: key.created_at,
    }));

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error listing API keys', error instanceof Error ? error : undefined);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/keys/:id - Revoke an API key
 */
router.delete('/:id', authenticate(), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const owner = req.apiKey!.owner;

    // Handle idempotency
    const idempotencyKey = req.headers['idempotency-key'] as string;
    if (idempotencyKey) {
      const cachedResponse = idempotencyStore.get(idempotencyKey);
      if (cachedResponse) {
        logger.debug('Returning cached response for idempotency key', { idempotencyKey });
        res.status(200).json(cachedResponse);
        return;
      }
    }

    const success = await revokeApiKey(id, owner);

    if (!success) {
      res.status(404).json({ error: 'API key not found or already revoked' });
      return;
    }

    // Audit log
    logger.info('API key revoked via endpoint', { id, owner });

    const response = { message: 'API key revoked successfully' };

    // Store for idempotency
    if (idempotencyKey) {
      idempotencyStore.set(idempotencyKey, response);
      // Clean up after 24 hours
      setTimeout(() => idempotencyStore.delete(idempotencyKey), 24 * 60 * 60 * 1000);
    }

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error revoking API key', error instanceof Error ? error : undefined);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
