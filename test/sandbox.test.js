import { test } from 'node:test';
import assert from 'node:assert';
import { Sandbox, runInSandbox } from '../dist/sandbox/index.js';
import { DiagnosticRunner, runDiagnostics } from '../dist/sandbox/diagnostics.js';
import { SimulationRunner, runSimulations } from '../dist/sandbox/simulation.js';

test('Sandbox - basic execution', async () => {
  const sandbox = new Sandbox({ name: 'test-sandbox' });

  const result = await sandbox.execute(() => {
    return 42;
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data, 42);
  assert.ok(result.duration >= 0);
  assert.ok(Array.isArray(result.logs));
});

test('Sandbox - async execution', async () => {
  const sandbox = new Sandbox({ name: 'async-sandbox' });

  const result = await sandbox.execute(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return 'async-result';
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data, 'async-result');
});

test('Sandbox - timeout handling', async () => {
  const sandbox = new Sandbox({ name: 'timeout-sandbox', timeout: 50 });

  const result = await sandbox.execute(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return 'should-timeout';
  });

  assert.strictEqual(result.success, false);
  assert.ok(result.error);
  assert.match(result.error.message, /timeout/i);
});

test('Sandbox - error handling', async () => {
  const sandbox = new Sandbox({ name: 'error-sandbox' });

  const result = await sandbox.execute(() => {
    throw new Error('Test error');
  });

  assert.strictEqual(result.success, false);
  assert.ok(result.error);
  assert.strictEqual(result.error.message, 'Test error');
});

test('runInSandbox helper', async () => {
  const result = await runInSandbox('helper-test', () => {
    return { value: 123 };
  });

  assert.strictEqual(result.success, true);
  assert.deepStrictEqual(result.data, { value: 123 });
});

test('DiagnosticRunner - run passing tests', async () => {
  const runner = new DiagnosticRunner('test-diagnostics');

  runner.registerTest({
    name: 'test-1',
    description: 'Should pass',
    run: () => true,
  });

  runner.registerTest({
    name: 'test-2',
    description: 'Should also pass',
    run: async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return true;
    },
  });

  const results = await runner.runAll();

  assert.strictEqual(results.length, 2);
  assert.strictEqual(results[0].status, 'pass');
  assert.strictEqual(results[1].status, 'pass');
});

test('DiagnosticRunner - run failing tests', async () => {
  const runner = new DiagnosticRunner('fail-diagnostics');

  runner.registerTest({
    name: 'failing-test',
    description: 'Should fail',
    run: () => false,
  });

  const results = await runner.runAll();

  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].status, 'fail');
});

test('DiagnosticRunner - skip tests', async () => {
  const runner = new DiagnosticRunner('skip-diagnostics');

  runner.registerTest({
    name: 'skipped-test',
    description: 'Should skip',
    run: () => true,
    skip: true,
  });

  const results = await runner.runAll();

  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].status, 'skip');
});

test('runDiagnostics helper', async () => {
  const results = await runDiagnostics([
    {
      name: 'diagnostic-1',
      description: 'Test diagnostic',
      run: () => true,
    },
  ]);

  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].status, 'pass');
});

test('SimulationRunner - basic scenario', async () => {
  const runner = new SimulationRunner('test-simulation');

  runner.registerScenario({
    name: 'scenario-1',
    description: 'Test scenario',
    input: { value: 10 },
    run: (input) => {
      return { result: input.value * 2 };
    },
  });

  const results = await runner.runAll();

  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].success, true);
  assert.deepStrictEqual(results[0].output, { result: 20 });
});

test('SimulationRunner - scenario with validation', async () => {
  const runner = new SimulationRunner('validation-simulation');

  runner.registerScenario({
    name: 'validated-scenario',
    description: 'Scenario with validation',
    input: { value: 5 },
    run: (input) => {
      return { result: input.value + 5 };
    },
    validate: (output) => {
      return output.result === 10;
    },
  });

  const results = await runner.runAll();

  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].success, true);
  assert.strictEqual(results[0].validated, true);
});

test('SimulationRunner - failing validation', async () => {
  const runner = new SimulationRunner('fail-validation-simulation');

  runner.registerScenario({
    name: 'invalid-scenario',
    description: 'Scenario with failing validation',
    input: { value: 5 },
    run: (input) => {
      return { result: input.value + 5 };
    },
    validate: (output) => {
      return output.result === 999; // This will fail
    },
  });

  const results = await runner.runAll();

  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].success, false);
  assert.strictEqual(results[0].validated, false);
});

test('runSimulations helper', async () => {
  const results = await runSimulations([
    {
      name: 'sim-1',
      description: 'Test simulation',
      input: 'test',
      run: (input) => input.toUpperCase(),
    },
  ]);

  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].success, true);
  assert.strictEqual(results[0].output, 'TEST');
});
