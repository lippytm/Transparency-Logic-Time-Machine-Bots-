/**
 * Simulation runner for scenario testing
 */

import { Sandbox, SandboxResult } from './index';
import { createLogger } from '../telemetry';

const logger = createLogger('simulation');

/**
 * Simulation scenario configuration
 */
export interface SimulationScenario<TInput = unknown, TOutput = unknown> {
  name: string;
  description: string;
  input: TInput;
  run: (input: TInput) => Promise<TOutput> | TOutput;
  validate?: (output: TOutput) => boolean;
}

/**
 * Simulation result
 */
export interface SimulationResult<TOutput = unknown> {
  scenarioName: string;
  success: boolean;
  output?: TOutput;
  error?: Error;
  duration: number;
  validated?: boolean;
  logs: string[];
}

/**
 * Simulation runner for executing scenario tests
 */
export class SimulationRunner {
  private scenarios: SimulationScenario[] = [];
  private sandbox: Sandbox;

  constructor(name: string = 'simulation-runner') {
    this.sandbox = new Sandbox({
      name,
      timeout: 120000, // 2 minutes for simulations
      logLevel: 'info',
    });
  }

  /**
   * Register a simulation scenario
   */
  registerScenario<TInput, TOutput>(scenario: SimulationScenario<TInput, TOutput>): void {
    this.scenarios.push(scenario as SimulationScenario);
    logger.debug(`Registered simulation scenario: ${scenario.name}`);
  }

  /**
   * Run all registered scenarios
   */
  async runAll(): Promise<SimulationResult[]> {
    logger.info(`Running ${this.scenarios.length} simulation scenarios`);
    const results: SimulationResult[] = [];

    for (const scenario of this.scenarios) {
      const result = await this.runScenario(scenario);
      results.push(result);
    }

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    logger.info('Simulation scenarios completed', {
      total: results.length,
      successful,
      failed,
    });

    return results;
  }

  /**
   * Run a single simulation scenario
   */
  async runScenario<TInput, TOutput>(
    scenario: SimulationScenario<TInput, TOutput>
  ): Promise<SimulationResult<TOutput>> {
    logger.info(`Running scenario: ${scenario.name}`);

    const result: SandboxResult<TOutput> = await this.sandbox.execute(async () => {
      return await scenario.run(scenario.input);
    });

    // Validate output if validator is provided
    let validated: boolean | undefined;
    if (result.success && result.data !== undefined && scenario.validate) {
      try {
        validated = scenario.validate(result.data);
      } catch (error) {
        logger.warn(`Validation failed for scenario: ${scenario.name}`, {
          error: error instanceof Error ? error.message : error,
        });
        validated = false;
      }
    }

    return {
      scenarioName: scenario.name,
      success: result.success && (validated === undefined || validated === true),
      output: result.data,
      error: result.error,
      duration: result.duration,
      validated,
      logs: result.logs,
    };
  }

  /**
   * Get number of registered scenarios
   */
  getScenarioCount(): number {
    return this.scenarios.length;
  }
}

/**
 * Helper function to create and run simulations
 */
export async function runSimulations<TInput, TOutput>(
  scenarios: SimulationScenario<TInput, TOutput>[]
): Promise<SimulationResult[]> {
  const runner = new SimulationRunner();
  scenarios.forEach((scenario) => runner.registerScenario(scenario));
  return runner.runAll();
}
