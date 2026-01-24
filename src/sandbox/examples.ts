/**
 * Example usage of sandbox functionality
 * This file demonstrates how to use sandboxes for diagnostics and simulations
 */

import { runInSandbox } from './index';
import { runDiagnostics, DiagnosticTest } from './diagnostics';
import { runSimulations, SimulationScenario } from './simulation';
import { createLogger } from '../telemetry';

const logger = createLogger('sandbox-examples');

/**
 * Example 1: Basic sandbox usage
 */
export async function exampleBasicSandbox() {
  logger.info('Running basic sandbox example...');

  const result = await runInSandbox('basic-example', async () => {
    // Simulated transparency check
    const transparencyScore = Math.random();
    return {
      transparent: transparencyScore > 0.5,
      score: transparencyScore,
    };
  });

  if (result.success) {
    logger.info('Transparency check completed', result.data);
  } else {
    logger.error('Transparency check failed', result.error);
  }

  return result;
}

/**
 * Example 2: Diagnostic tests for transparency validation
 */
export async function exampleTransparencyDiagnostics() {
  logger.info('Running transparency diagnostics...');

  const diagnosticTests: DiagnosticTest[] = [
    {
      name: 'config-validation',
      description: 'Validate transparency configuration',
      run: async () => {
        // Check if config is valid
        return true;
      },
    },
    {
      name: 'telemetry-connection',
      description: 'Check telemetry connectivity',
      run: async () => {
        // Simulate connectivity check
        await new Promise((resolve) => setTimeout(resolve, 100));
        return true;
      },
    },
    {
      name: 'data-integrity',
      description: 'Verify data integrity',
      run: () => {
        // Perform integrity checks
        const dataValid = true;
        return dataValid;
      },
    },
  ];

  const results = await runDiagnostics(diagnosticTests);

  const passed = results.filter((r: { status: string }) => r.status === 'pass').length;
  logger.info(`Diagnostics completed: ${passed}/${results.length} passed`);

  return results;
}

/**
 * Example 3: Simulation scenarios for transparency testing
 */
export async function exampleTransparencySimulations() {
  logger.info('Running transparency simulations...');

  const scenarios: SimulationScenario<
    { events: number },
    { processed: number; transparent: boolean }
  >[] = [
    {
      name: 'low-load-scenario',
      description: 'Simulate low event load',
      input: { events: 10 },
      run: async (input) => {
        // Simulate processing events
        await new Promise((resolve) => setTimeout(resolve, 50));
        return {
          processed: input.events,
          transparent: true,
        };
      },
      validate: (output) => {
        return output.processed > 0 && output.transparent === true;
      },
    },
    {
      name: 'high-load-scenario',
      description: 'Simulate high event load',
      input: { events: 1000 },
      run: async (input: { events: number }) => {
        // Simulate processing many events
        await new Promise((resolve) => setTimeout(resolve, 100));
        return {
          processed: input.events,
          transparent: input.events < 10000, // Transparency degrades under extreme load
        };
      },
      validate: (output: { processed: number; transparent: boolean }) => {
        return output.processed === 1000 && output.transparent === true;
      },
    },
    {
      name: 'error-handling-scenario',
      description: 'Simulate error conditions',
      input: { events: 5 },
      run: async (input: { events: number }) => {
        // Simulate error handling
        if (input.events < 10) {
          return {
            processed: input.events,
            transparent: true,
          };
        }
        throw new Error('Too many events');
      },
      validate: (output: { processed: number; transparent: boolean }) => {
        return output.transparent === true;
      },
    },
  ];

  const results = await runSimulations(scenarios);

  const successful = results.filter((r: { success: boolean }) => r.success).length;
  logger.info(`Simulations completed: ${successful}/${results.length} successful`);

  return results;
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  logger.info('=== Running All Sandbox Examples ===');

  try {
    // Example 1: Basic sandbox
    await exampleBasicSandbox();

    // Example 2: Diagnostics
    await exampleTransparencyDiagnostics();

    // Example 3: Simulations
    await exampleTransparencySimulations();

    logger.info('=== All Examples Completed Successfully ===');
  } catch (error) {
    logger.error('Examples failed', error instanceof Error ? error : undefined);
    throw error;
  }
}
