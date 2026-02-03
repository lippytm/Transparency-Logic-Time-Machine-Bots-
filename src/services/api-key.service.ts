import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import { query } from '../database';
import { createLogger } from '../telemetry';

const logger = createLogger('api-key-service');

export interface ApiKey {
  id: string;
  name: string;
  owner: string;
  scopes: string[];
  prefix: string;
  last_used_at: Date | null;
  created_at: Date;
  revoked_at: Date | null;
}

export interface ApiKeyCreateParams {
  name: string;
  owner: string;
  scopes: string[];
  prefix?: string;
  pepper?: string;
}

export interface ApiKeyWithToken extends ApiKey {
  token: string;
}

/**
 * Generate a secure random API key
 */
function generateApiKey(prefix: string): { token: string; secret: string } {
  const secret = crypto.randomBytes(32).toString('hex');
  const token = `${prefix}_${secret}`;
  return { token, secret };
}

/**
 * Hash the API key secret using argon2
 */
async function hashSecret(secret: string, pepper?: string): Promise<string> {
  const value = pepper ? `${secret}${pepper}` : secret;
  return argon2.hash(value, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Verify an API key secret
 */
async function verifySecret(
  hashedSecret: string,
  secret: string,
  pepper?: string
): Promise<boolean> {
  try {
    const value = pepper ? `${secret}${pepper}` : secret;
    return await argon2.verify(hashedSecret, value);
  } catch (error) {
    logger.error('Error verifying secret', error instanceof Error ? error : undefined);
    return false;
  }
}

/**
 * Create a new API key
 */
export async function createApiKey(params: ApiKeyCreateParams): Promise<ApiKeyWithToken> {
  const prefix = params.prefix || 'tltm';
  const { token, secret } = generateApiKey(prefix);
  const hashedSecret = await hashSecret(secret, params.pepper);

  const result = await query<ApiKey>(
    `INSERT INTO api_keys (name, owner, scopes, hashed_secret, prefix)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, owner, scopes, prefix, last_used_at, created_at, revoked_at`,
    [params.name, params.owner, params.scopes, hashedSecret, prefix]
  );

  const apiKey = result.rows[0];

  logger.info('API key created', {
    id: apiKey.id,
    name: apiKey.name,
    owner: apiKey.owner,
    prefix: apiKey.prefix,
  });

  return {
    ...apiKey,
    token,
  };
}

/**
 * List API keys for an owner
 */
export async function listApiKeys(owner: string): Promise<ApiKey[]> {
  const result = await query<ApiKey>(
    `SELECT id, name, owner, scopes, prefix, last_used_at, created_at, revoked_at
     FROM api_keys
     WHERE owner = $1 AND revoked_at IS NULL
     ORDER BY created_at DESC`,
    [owner]
  );

  return result.rows;
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(id: string, owner: string): Promise<boolean> {
  const result = await query(
    `UPDATE api_keys
     SET revoked_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND owner = $2 AND revoked_at IS NULL`,
    [id, owner]
  );

  if (result.rowCount && result.rowCount > 0) {
    logger.info('API key revoked', { id, owner });
    return true;
  }

  return false;
}

/**
 * Verify an API key token and return the API key if valid
 */
export async function verifyApiKey(token: string, pepper?: string): Promise<ApiKey | null> {
  // Parse the token to extract prefix and secret
  const parts = token.split('_');
  if (parts.length < 2) {
    return null;
  }

  const prefix = parts[0];
  const secret = parts.slice(1).join('_');

  // Find API keys with matching prefix
  const result = await query<ApiKey & { hashed_secret: string }>(
    `SELECT id, name, owner, scopes, prefix, hashed_secret, last_used_at, created_at, revoked_at
     FROM api_keys
     WHERE prefix = $1 AND revoked_at IS NULL`,
    [prefix]
  );

  // Try to verify the secret against each key with matching prefix
  for (const row of result.rows) {
    const isValid = await verifySecret(row.hashed_secret, secret, pepper);
    if (isValid) {
      // Update last_used_at
      await query(`UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1`, [row.id]);

      logger.debug('API key verified', {
        id: row.id,
        owner: row.owner,
        prefix: row.prefix,
      });

      // Return without the hashed_secret
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { hashed_secret, ...apiKey } = row;
      return apiKey;
    }
  }

  return null;
}

/**
 * Check if an API key has the required scope
 */
export function hasScope(apiKey: ApiKey, requiredScope: string): boolean {
  return apiKey.scopes.includes(requiredScope) || apiKey.scopes.includes('*');
}
