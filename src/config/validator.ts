/**
 * Standalone config validator script
 * Can be run via: node dist/config/validator.js
 * This is a smoke test that validates env parsing without network calls
 */

import { loadConfig, validateConfig } from './index';

function runSmokeTest() {
  console.log('Running config validation smoke test...\n');

  try {
    // Test 1: Load config from environment
    console.log('Test 1: Loading config from environment variables...');
    const config = loadConfig();
    console.log('✓ Config loaded successfully');
    console.log('  Environment:', config.app.environment);
    console.log('  Port:', config.app.port);
    console.log('  Log Level:', config.app.logLevel);
    console.log('  Telemetry:', config.telemetry?.enabled ? 'enabled' : 'disabled');
    console.log('');

    // Test 2: Validate a minimal valid config
    console.log('Test 2: Validating minimal config object...');
    const minimalConfig = {
      app: {
        name: 'test-app',
        environment: 'development',
        port: 3000,
        logLevel: 'info',
      },
    };
    const result1 = validateConfig(minimalConfig);
    if (result1.success) {
      console.log('✓ Minimal config validation passed');
    } else {
      console.error('✗ Minimal config validation failed');
      throw new Error('Validation failed');
    }
    console.log('');

    // Test 3: Validate invalid config (should fail)
    console.log('Test 3: Validating invalid config (expected to fail)...');
    const invalidConfig = {
      app: {
        environment: 'invalid-env', // Invalid enum value
        port: 'not-a-number', // Invalid type
      },
    };
    const result2 = validateConfig(invalidConfig);
    if (!result2.success) {
      console.log('✓ Invalid config correctly rejected');
    } else {
      console.error('✗ Invalid config was accepted (should have failed)');
      throw new Error('Validation should have failed');
    }
    console.log('');

    console.log('All smoke tests passed! ✓');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Smoke test failed:', error);
    process.exit(1);
  }
}

// Run the smoke test
runSmokeTest();
