/**
 * Sandbox module for running diagnostics and simulations
 * Provides isolated execution environments for transparency testing
 */

import { createLogger } from '../telemetry';

const logger = createLogger('sandbox');

/**
 * Sandbox configuration options
 */
export interface SandboxOptions {
  name: string;
  timeout?: number; // in milliseconds
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
  isolated?: boolean; // whether to run in isolated context
}

/**
 * Result of a sandbox execution
 */
export interface SandboxResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
  duration: number;
  logs: string[];
}

/**
 * Sandbox class for isolated execution
 */
export class Sandbox {
  private name: string;
  private timeout: number;
  private logLevel: string;
  private isolated: boolean;
  private logs: string[] = [];

  constructor(options: SandboxOptions) {
    this.name = options.name;
    this.timeout = options.timeout || 30000; // 30s default
    this.logLevel = options.logLevel || 'info';
    this.isolated = options.isolated ?? true;

    logger.info(`Sandbox "${this.name}" initialized`, {
      timeout: this.timeout,
      isolated: this.isolated,
    });
  }

  /**
   * Log a message within the sandbox
   */
  private log(level: string, message: string, ...args: unknown[]): void {
    const logEntry = `[${level.toUpperCase()}] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}`;
    this.logs.push(logEntry);

    // Only log to telemetry logger if it should be shown based on log level
    if (this.shouldLog(level)) {
      try {
        switch (level) {
          case 'debug':
            logger.debug(message);
            break;
          case 'info':
            logger.info(message);
            break;
          case 'warn':
            logger.warn(message);
            break;
          case 'error':
            logger.error(message);
            break;
        }
      } catch {
        // Ignore logging errors in sandbox
      }
    }
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevel = levels.indexOf(this.logLevel);
    const messageLevel = levels.indexOf(level);
    return messageLevel >= currentLevel;
  }

  /**
   * Execute a function within the sandbox
   */
  async execute<T>(fn: () => Promise<T> | T): Promise<SandboxResult<T>> {
    const startTime = Date.now();
    this.logs = []; // Reset logs for this execution

    this.log('info', `Starting sandbox execution: ${this.name}`);

    let timeoutId: NodeJS.Timeout | undefined;

    try {
      // Create a timeout promise with cleanup
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Sandbox execution timeout after ${this.timeout}ms`));
        }, this.timeout);
      });

      // Execute the function with timeout
      const result = await Promise.race([Promise.resolve(fn()), timeoutPromise]);

      const duration = Date.now() - startTime;
      this.log('info', `Sandbox execution completed successfully`, { duration });

      return {
        success: true,
        data: result,
        duration,
        logs: [...this.logs],
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const err = error instanceof Error ? error : new Error(String(error));

      this.log('error', `Sandbox execution failed`, { error: err.message });

      return {
        success: false,
        error: err,
        duration,
        logs: [...this.logs],
      };
    } finally {
      // Clean up timeout to prevent memory leaks
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * Get sandbox name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get current logs
   */
  getLogs(): string[] {
    return [...this.logs];
  }
}

/**
 * Create and execute a sandbox with a single function
 */
export async function runInSandbox<T>(
  name: string,
  fn: () => Promise<T> | T,
  options?: Partial<SandboxOptions>
): Promise<SandboxResult<T>> {
  const sandbox = new Sandbox({ name, ...options });
  return sandbox.execute(fn);
}
