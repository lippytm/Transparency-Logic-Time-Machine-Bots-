import { test } from 'node:test';
import assert from 'node:assert';
import {
  createWebhookSignature,
  verifyWebhookSignature,
} from '../dist/services/webhook.service.js';

test('webhook signature - creates valid HMAC SHA-256 signature', () => {
  const payload = JSON.stringify({ event: 'test', data: { foo: 'bar' } });
  const secret = 'test-secret';

  const signature = createWebhookSignature(payload, secret);

  assert.ok(signature.startsWith('sha256='));
  assert.strictEqual(signature.length, 71); // 'sha256=' + 64 hex chars
});

test('webhook signature - verifies valid signature', () => {
  const payload = JSON.stringify({ event: 'test', data: { foo: 'bar' } });
  const secret = 'test-secret';

  const signature = createWebhookSignature(payload, secret);
  const isValid = verifyWebhookSignature(payload, signature, secret);

  assert.strictEqual(isValid, true);
});

test('webhook signature - rejects invalid signature', () => {
  const payload = JSON.stringify({ event: 'test', data: { foo: 'bar' } });
  const secret = 'test-secret';
  const wrongSecret = 'wrong-secret';

  const signature = createWebhookSignature(payload, wrongSecret);
  const isValid = verifyWebhookSignature(payload, signature, secret);

  assert.strictEqual(isValid, false);
});

test('webhook signature - rejects tampered payload', () => {
  const payload = JSON.stringify({ event: 'test', data: { foo: 'bar' } });
  const tamperedPayload = JSON.stringify({ event: 'test', data: { foo: 'baz' } });
  const secret = 'test-secret';

  const signature = createWebhookSignature(payload, secret);
  const isValid = verifyWebhookSignature(tamperedPayload, signature, secret);

  assert.strictEqual(isValid, false);
});
