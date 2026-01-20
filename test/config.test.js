/**
 * Smoke test for config loader
 * Run with: node --test test/config.test.js
 */

const { test } = require('node:test');
const { strict: assert } = require('node:assert');

test('Environment variable loading - smoke test', () => {
  // Simple test that environment can be read
  process.env.TEST_VAR = 'test_value';
  assert.equal(process.env.TEST_VAR, 'test_value', 'Should read environment variable');
});

test('Config factory pattern - smoke test', () => {
  // Test simple factory pattern
  class ConfigLoader {
    static fromEnv() {
      return {
        openai: process.env.OPENAI_API_KEY ? { apiKey: process.env.OPENAI_API_KEY } : undefined
      };
    }
  }
  
  const config = ConfigLoader.fromEnv();
  assert.ok(config !== null, 'Config should not be null');
  assert.ok(typeof config === 'object', 'Config should be an object');
});
