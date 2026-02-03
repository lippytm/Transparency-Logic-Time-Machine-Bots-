import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createWebhook,
  listWebhooks,
  deleteWebhook,
  getWebhook,
  deliverWebhook,
  getDelivery,
} from '../services/webhook.service';
import { createLogger } from '../telemetry';
import { loadConfig } from '../config';

const logger = createLogger('webhook-routes');
const router = Router();

/**
 * POST /api/webhooks - Create a new webhook
 */
router.post('/', authenticate(), async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, events, secret, active } = req.body;
    const owner = req.apiKey!.owner;

    // Validate required fields
    if (!url || !events) {
      res.status(400).json({ error: 'Missing required fields: url, events' });
      return;
    }

    if (!Array.isArray(events)) {
      res.status(400).json({ error: 'events must be an array' });
      return;
    }

    const webhook = await createWebhook({
      owner,
      url,
      events,
      secret,
      active,
    });

    // Audit log
    logger.info('Webhook created via endpoint', {
      id: webhook.id,
      owner: webhook.owner,
      url: webhook.url,
      events: webhook.events,
    });

    res.status(201).json({
      id: webhook.id,
      owner: webhook.owner,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret,
      active: webhook.active,
      created_at: webhook.created_at,
      updated_at: webhook.updated_at,
    });
  } catch (error) {
    logger.error('Error creating webhook', error instanceof Error ? error : undefined);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/webhooks - List webhooks
 */
router.get('/', authenticate(), async (req: Request, res: Response): Promise<void> => {
  try {
    const owner = req.apiKey!.owner;
    const webhooks = await listWebhooks(owner);

    res.status(200).json(
      webhooks.map((webhook) => ({
        id: webhook.id,
        owner: webhook.owner,
        url: webhook.url,
        events: webhook.events,
        active: webhook.active,
        created_at: webhook.created_at,
        updated_at: webhook.updated_at,
      }))
    );
  } catch (error) {
    logger.error('Error listing webhooks', error instanceof Error ? error : undefined);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/webhooks/:id - Delete a webhook
 */
router.delete('/:id', authenticate(), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const owner = req.apiKey!.owner;

    const success = await deleteWebhook(id, owner);

    if (!success) {
      res.status(404).json({ error: 'Webhook not found' });
      return;
    }

    // Audit log
    logger.info('Webhook deleted via endpoint', { id, owner });

    res.status(200).json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    logger.error('Error deleting webhook', error instanceof Error ? error : undefined);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/webhooks/test - Send a test webhook delivery
 */
router.post('/test', authenticate(), async (req: Request, res: Response): Promise<void> => {
  try {
    const config = loadConfig();
    const deliveryConfig = {
      maxAttempts: config.webhook?.maxAttempts || 3,
      backoffBaseMs: config.webhook?.backoffBaseMs || 1000,
      timeoutMs: config.webhook?.timeoutMs || 5000,
    };

    const owner = req.apiKey!.owner;
    const webhooks = await listWebhooks(owner);

    if (webhooks.length === 0) {
      res.status(404).json({ error: 'No webhooks found' });
      return;
    }

    const testPayload = {
      event: 'delivery.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery',
      },
    };

    const deliveries = await Promise.all(
      webhooks
        .filter((w) => w.active)
        .map((webhook) => deliverWebhook(webhook, 'delivery.test', testPayload, deliveryConfig))
    );

    // Audit log
    logger.info('Test webhooks sent via endpoint', {
      owner,
      count: deliveries.length,
    });

    res.status(200).json({
      message: `Test delivery sent to ${deliveries.length} webhook(s)`,
      deliveries: deliveries.map((d) => ({
        id: d.id,
        webhook_id: d.webhook_id,
        status: d.status,
        attempts: d.attempts,
      })),
    });
  } catch (error) {
    logger.error('Error sending test webhook', error instanceof Error ? error : undefined);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/webhooks/:id/replay - Replay a failed delivery
 */
router.post('/:id/replay', authenticate(), async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { delivery_id } = req.query;
    const owner = req.apiKey!.owner;

    if (!delivery_id || typeof delivery_id !== 'string') {
      res.status(400).json({ error: 'Missing or invalid delivery_id query parameter' });
      return;
    }

    // Get the webhook
    const webhook = await getWebhook(id, owner);
    if (!webhook) {
      res.status(404).json({ error: 'Webhook not found' });
      return;
    }

    // Get the delivery
    const delivery = await getDelivery(delivery_id);
    if (!delivery) {
      res.status(404).json({ error: 'Delivery not found' });
      return;
    }

    if (delivery.webhook_id !== webhook.id) {
      res.status(400).json({ error: 'Delivery does not belong to this webhook' });
      return;
    }

    if (delivery.status === 'success') {
      res.status(400).json({ error: 'Cannot replay successful delivery' });
      return;
    }

    const config = loadConfig();
    const deliveryConfig = {
      maxAttempts: config.webhook?.maxAttempts || 3,
      backoffBaseMs: config.webhook?.backoffBaseMs || 1000,
      timeoutMs: config.webhook?.timeoutMs || 5000,
    };

    // Replay with a generic payload since we don't store the original
    const replayPayload = {
      event: delivery.event_type,
      timestamp: new Date().toISOString(),
      data: {
        message: 'Replayed delivery',
        original_delivery_id: delivery.id,
      },
    };

    const newDelivery = await deliverWebhook(
      webhook,
      delivery.event_type,
      replayPayload,
      deliveryConfig
    );

    // Audit log
    logger.info('Webhook delivery replayed via endpoint', {
      webhookId: webhook.id,
      owner,
      originalDeliveryId: delivery.id,
      newDeliveryId: newDelivery.id,
    });

    res.status(200).json({
      message: 'Delivery replayed',
      delivery: {
        id: newDelivery.id,
        webhook_id: newDelivery.webhook_id,
        event_type: newDelivery.event_type,
        status: newDelivery.status,
        attempts: newDelivery.attempts,
      },
    });
  } catch (error) {
    logger.error('Error replaying webhook delivery', error instanceof Error ? error : undefined);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
