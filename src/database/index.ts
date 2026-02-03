import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { createLogger } from '../telemetry';

const logger = createLogger('database');

let pool: Pool | null = null;

/**
 * Initialize the database connection pool
 */
export function initDatabase(connectionString: string): void {
  if (pool) {
    logger.warn('Database pool already initialized');
    return;
  }

  pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    logger.error('Unexpected error on idle client', err);
  });

  logger.info('Database pool initialized');
}

/**
 * Get the database pool
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

/**
 * Execute a query
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    // Only log query structure, not parameters to avoid exposing sensitive data
    logger.debug('Executed query', { duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Query error', error instanceof Error ? error : undefined);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

/**
 * Close the database pool
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database pool closed');
  }
}
