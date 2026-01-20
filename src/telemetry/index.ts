import { trace, Tracer, Span, SpanStatusCode } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

/**
 * Optional OpenTelemetry integration
 * No vendor lock-in - uses standard OpenTelemetry APIs
 * Enable via environment variables:
 * - TELEMETRY_ENABLED=true
 * - TELEMETRY_SERVICE_NAME=your-service-name
 * - TELEMETRY_ENDPOINT=http://your-otel-collector:4318 (optional)
 */

let sdk: NodeSDK | null = null;
let isInitialized = false;

export interface TelemetryConfig {
  enabled: boolean;
  serviceName?: string;
  endpoint?: string;
  sampleRate?: number;
}

/**
 * Initialize OpenTelemetry SDK
 * Call this early in your application startup
 */
export function initTelemetry(config: TelemetryConfig): void {
  if (!config.enabled) {
    console.log('Telemetry disabled');
    return;
  }

  if (isInitialized) {
    console.warn('Telemetry already initialized');
    return;
  }

  const serviceName = config.serviceName || 'transparency-logic-time-machine-bots';

  try {
    sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
      }),
      instrumentations: [getNodeAutoInstrumentations()],
      // Additional exporters can be configured here
      // For example: OTLPTraceExporter, JaegerExporter, etc.
    });

    sdk.start();
    isInitialized = true;
    console.log(`OpenTelemetry initialized for service: ${serviceName}`);
  } catch (error) {
    console.error('Failed to initialize telemetry:', error);
  }
}

/**
 * Shutdown telemetry gracefully
 */
export async function shutdownTelemetry(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    isInitialized = false;
    console.log('Telemetry shutdown complete');
  }
}

/**
 * Get a tracer for creating spans
 * @param name - Name of the tracer (usually your module name)
 */
export function getTracer(name: string): Tracer {
  return trace.getTracer(name);
}

/**
 * Basic logger stub with structured logging support
 * In production, this could be enhanced with Winston, Pino, or another logger
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private log(level: string, message: string, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...meta,
    };
    console.log(JSON.stringify(logEntry));
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this.log('error', message, {
      ...meta,
      error: error?.message,
      stack: error?.stack,
    });
  }
}

/**
 * Create a new logger instance
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Helper to trace a function execution
 */
export async function traceFunction<T>(
  tracerName: string,
  spanName: string,
  fn: (span: Span) => Promise<T>
): Promise<T> {
  const tracer = getTracer(tracerName);
  const span = tracer.startSpan(spanName);

  try {
    const result = await fn(span);
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  } finally {
    span.end();
  }
}
