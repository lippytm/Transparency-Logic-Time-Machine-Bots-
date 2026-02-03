import * as crypto from 'crypto';
import { query } from '../database';
import { createLogger } from '../telemetry';

const logger = createLogger('webhook-service');

export interface Webhook {
  id: string;
  owner: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event_type: string;
  status: string;
  attempts: number;
  response_code: number | null;
  response_ms: number | null;
  payload_digest: string | null;
  created_at: Date;
  last_attempt_at: Date | null;
}

export interface WebhookCreateParams {
  owner: string;
  url: string;
  events: string[];
  secret?: string;
  active?: boolean;
}

export interface DeliveryConfig {
  maxAttempts: number;
  backoffBaseMs: number;
  timeoutMs: number;
}

/**
 * Generate a secure webhook secret
 */
function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create HMAC signature for webhook payload
 */
export function createWebhookSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  return `sha256=${hmac.digest('hex')}`;
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createWebhookSignature(payload, secret);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Create a new webhook
 */
export async function createWebhook(params: WebhookCreateParams): Promise<Webhook> {
  const secret = params.secret || generateWebhookSecret();
  const active = params.active !== undefined ? params.active : true;

  const result = await query<Webhook>(
    `INSERT INTO webhooks (owner, url, events, secret, active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, owner, url, events, secret, active, created_at, updated_at`,
    [params.owner, params.url, params.events, secret, active]
  );

  const webhook = result.rows[0];

  logger.info('Webhook created', {
    id: webhook.id,
    owner: webhook.owner,
    url: webhook.url,
    events: webhook.events,
  });

  return webhook;
}

/**
 * List webhooks for an owner
 */
export async function listWebhooks(owner: string): Promise<Webhook[]> {
  const result = await query<Webhook>(
    `SELECT id, owner, url, events, secret, active, created_at, updated_at
     FROM webhooks
     WHERE owner = $1
     ORDER BY created_at DESC`,
    [owner]
  );

  return result.rows;
}

/**
 * Get a webhook by ID
 */
export async function getWebhook(id: string, owner: string): Promise<Webhook | null> {
  const result = await query<Webhook>(
    `SELECT id, owner, url, events, secret, active, created_at, updated_at
     FROM webhooks
     WHERE id = $1 AND owner = $2`,
    [id, owner]
  );

  return result.rows[0] || null;
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(id: string, owner: string): Promise<boolean> {
  const result = await query(`DELETE FROM webhooks WHERE id = $1 AND owner = $2`, [id, owner]);

  if (result.rowCount && result.rowCount > 0) {
    logger.info('Webhook deleted', { id, owner });
    return true;
  }

  return false;
}

/**
 * Create a webhook delivery record
 */
export async function createDelivery(
  webhookId: string,
  eventType: string,
  payloadDigest: string
): Promise<WebhookDelivery> {
  const result = await query<WebhookDelivery>(
    `INSERT INTO webhook_deliveries (webhook_id, event_type, status, payload_digest)
     VALUES ($1, $2, $3, $4)
     RETURNING id, webhook_id, event_type, status, attempts, response_code, response_ms, payload_digest, created_at, last_attempt_at`,
    [webhookId, eventType, 'pending', payloadDigest]
  );

  return result.rows[0];
}

/**
 * Update delivery status
 */
export async function updateDeliveryStatus(
  deliveryId: string,
  status: string,
  responseCode?: number,
  responseMs?: number
): Promise<void> {
  await query(
    `UPDATE webhook_deliveries
     SET status = $1, 
         attempts = attempts + 1,
         response_code = $2,
         response_ms = $3,
         last_attempt_at = CURRENT_TIMESTAMP
     WHERE id = $4`,
    [status, responseCode, responseMs, deliveryId]
  );
}

/**
 * Get delivery by ID
 */
export async function getDelivery(deliveryId: string): Promise<WebhookDelivery | null> {
  const result = await query<WebhookDelivery>(
    `SELECT id, webhook_id, event_type, status, attempts, response_code, response_ms, payload_digest, created_at, last_attempt_at
     FROM webhook_deliveries
     WHERE id = $1`,
    [deliveryId]
  );

  return result.rows[0] || null;
}

/**
 * Deliver a webhook
 */
export async function deliverWebhook(
  webhook: Webhook,
  eventType: string,
  payload: Record<string, unknown>,
  config: DeliveryConfig
): Promise<WebhookDelivery> {
  const payloadString = JSON.stringify(payload);
  const payloadDigest = crypto.createHash('sha256').update(payloadString).digest('hex');
  const signature = createWebhookSignature(payloadString, webhook.secret);

  const delivery = await createDelivery(webhook.id, eventType, payloadDigest);

  let lastError: Error | null = null;
  let attempt = 0;

  while (attempt < config.maxAttempts) {
    attempt++;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': signature,
          'X-Delivery-ID': delivery.id,
          'X-Event-Type': eventType,
        },
        body: payloadString,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const responseMs = Date.now() - startTime;

      if (response.ok) {
        await updateDeliveryStatus(delivery.id, 'success', response.status, responseMs);
        logger.info('Webhook delivered successfully', {
          webhookId: webhook.id,
          deliveryId: delivery.id,
          eventType,
          status: response.status,
          responseMs,
        });
        return (await getDelivery(delivery.id)) as WebhookDelivery;
      } else {
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        await updateDeliveryStatus(delivery.id, 'failed', response.status, responseMs);
      }
    } catch (error) {
      const responseMs = Date.now() - startTime;
      lastError = error instanceof Error ? error : new Error('Unknown error');
      await updateDeliveryStatus(delivery.id, 'failed', undefined, responseMs);

      logger.warn('Webhook delivery attempt failed', {
        webhookId: webhook.id,
        deliveryId: delivery.id,
        attempt,
        error: lastError.message,
      });
    }

    // Exponential backoff
    if (attempt < config.maxAttempts) {
      const backoffMs = config.backoffBaseMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  logger.error('Webhook delivery failed after all attempts', lastError || undefined, {
    webhookId: webhook.id,
    deliveryId: delivery.id,
    eventType,
    attempts: config.maxAttempts,
  });

  return (await getDelivery(delivery.id)) as WebhookDelivery;
}

/**
 * Trigger webhooks for an event
 */
export async function triggerWebhooks(
  eventType: string,
  payload: Record<string, unknown>,
  config: DeliveryConfig
): Promise<void> {
  const result = await query<Webhook>(
    `SELECT id, owner, url, events, secret, active, created_at, updated_at
     FROM webhooks
     WHERE active = true AND $1 = ANY(events)`,
    [eventType]
  );

  const webhooks = result.rows;

  logger.info('Triggering webhooks', {
    eventType,
    count: webhooks.length,
  });

  // Deliver webhooks in parallel
  await Promise.all(webhooks.map((webhook) => deliverWebhook(webhook, eventType, payload, config)));
}
