/**
 * Diagnostic runner for transparency testing
 */

import { Sandbox, SandboxResult } from './index';
import { createLogger } from '../telemetry';

const logger = createLogger('diagnostics');

/**
 * Diagnostic test result
 */
export interface DiagnosticResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  duration: number;
  metadata?: Record<string, unknown>;
}

/**
 * Diagnostic test definition
 */
export interface DiagnosticTest {
  name: string;
  description: string;
  run: () => Promise<boolean> | boolean;
  skip?: boolean;
}

/**
 * Diagnostic runner for executing transparency tests
 */
export class DiagnosticRunner {
  private tests: DiagnosticTest[] = [];
  private sandbox: Sandbox;

  constructor(name: string = 'diagnostic-runner') {
    this.sandbox = new Sandbox({
      name,
      timeout: 60000, // 60s for diagnostics
      logLevel: 'info',
    });
  }

  /**
   * Register a diagnostic test
   */
  registerTest(test: DiagnosticTest): void {
    this.tests.push(test);
    logger.debug(`Registered diagnostic test: ${test.name}`);
  }

  /**
   * Run all registered diagnostic tests
   */
  async runAll(): Promise<DiagnosticResult[]> {
    logger.info(`Running ${this.tests.length} diagnostic tests`);
    const results: DiagnosticResult[] = [];

    for (const test of this.tests) {
      if (test.skip) {
        results.push({
          name: test.name,
          status: 'skip',
          message: 'Test skipped',
          duration: 0,
        });
        continue;
      }

      const result = await this.runTest(test);
      results.push(result);
    }

    const passed = results.filter((r) => r.status === 'pass').length;
    const failed = results.filter((r) => r.status === 'fail').length;
    const skipped = results.filter((r) => r.status === 'skip').length;

    logger.info('Diagnostic tests completed', {
      total: results.length,
      passed,
      failed,
      skipped,
    });

    return results;
  }

  /**
   * Run a single diagnostic test
   */
  private async runTest(test: DiagnosticTest): Promise<DiagnosticResult> {
    const startTime = Date.now();

    try {
      const result: SandboxResult<boolean> = await this.sandbox.execute(async () => {
        return await test.run();
      });

      const duration = Date.now() - startTime;

      if (!result.success) {
        return {
          name: test.name,
          status: 'fail',
          message: result.error?.message || 'Test execution failed',
          duration,
          metadata: { error: result.error },
        };
      }

      return {
        name: test.name,
        status: result.data === true ? 'pass' : 'fail',
        message: result.data === true ? 'Test passed' : 'Test failed',
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        name: test.name,
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
        metadata: { error },
      };
    }
  }

  /**
   * Get number of registered tests
   */
  getTestCount(): number {
    return this.tests.length;
  }
}

/**
 * Helper function to create and run diagnostics
 */
export async function runDiagnostics(tests: DiagnosticTest[]): Promise<DiagnosticResult[]> {
  const runner = new DiagnosticRunner();
  tests.forEach((test) => runner.registerTest(test));
  return runner.runAll();
}
