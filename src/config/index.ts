import { z } from 'zod';

/**
 * Configuration schema using Zod for runtime validation
 */
export const ConfigSchema = z.object({
  // Application settings
  app: z.object({
    name: z.string().default('transparency-logic-time-machine-bots'),
    environment: z.enum(['development', 'staging', 'production']).default('development'),
    port: z.coerce.number().int().positive().default(3000),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  }),

  // Telemetry settings (optional)
  telemetry: z
    .object({
      enabled: z.coerce.boolean().default(false),
      serviceName: z.string().optional(),
      endpoint: z.string().url().optional(),
      sampleRate: z.coerce.number().min(0).max(1).default(0.1),
    })
    .optional(),

  // Optional heavy dependencies configuration
  ai: z
    .object({
      enabled: z.coerce.boolean().default(false),
      modelName: z.string().optional(),
    })
    .optional(),

  vectorDb: z
    .object({
      enabled: z.coerce.boolean().default(false),
      type: z.enum(['pinecone', 'weaviate', 'chroma']).optional(),
      apiKey: z.string().optional(),
      endpoint: z.string().url().optional(),
    })
    .optional(),

  // Sandbox settings (optional)
  sandbox: z
    .object({
      enabled: z.coerce.boolean().default(false),
      defaultTimeout: z.coerce.number().int().positive().default(30000),
      logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    })
    .optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Load and validate configuration from environment variables
 * This performs no network operations - only local parsing and validation
 */
export function loadConfig(): Config {
  const rawConfig = {
    app: {
      name: process.env.APP_NAME,
      environment: process.env.NODE_ENV || process.env.APP_ENV,
      port: process.env.PORT,
      logLevel: process.env.LOG_LEVEL,
    },
    telemetry: {
      enabled: process.env.TELEMETRY_ENABLED,
      serviceName: process.env.TELEMETRY_SERVICE_NAME,
      endpoint: process.env.TELEMETRY_ENDPOINT,
      sampleRate: process.env.TELEMETRY_SAMPLE_RATE,
    },
    ai: {
      enabled: process.env.AI_ENABLED,
      modelName: process.env.AI_MODEL_NAME,
    },
    vectorDb: {
      enabled: process.env.VECTOR_DB_ENABLED,
      type: process.env.VECTOR_DB_TYPE,
      apiKey: process.env.VECTOR_DB_API_KEY,
      endpoint: process.env.VECTOR_DB_ENDPOINT,
    },
    sandbox: {
      enabled: process.env.SANDBOX_ENABLED,
      defaultTimeout: process.env.SANDBOX_DEFAULT_TIMEOUT,
      logLevel: process.env.SANDBOX_LOG_LEVEL,
    },
  };

  // Parse and validate configuration
  const result = ConfigSchema.safeParse(rawConfig);

  if (!result.success) {
    const errors = result.error.format();
    console.error('Configuration validation failed:', JSON.stringify(errors, null, 2));
    throw new Error('Invalid configuration');
  }

  return result.data;
}

/**
 * Validate configuration without throwing
 * Returns validation result for testing purposes
 */
export function validateConfig(config: unknown): { success: boolean; errors?: z.ZodError } {
  const result = ConfigSchema.safeParse(config);
  if (!result.success) {
    return { success: false, errors: result.error };
  }
  return { success: true };
}
