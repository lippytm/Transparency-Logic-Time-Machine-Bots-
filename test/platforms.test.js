import { test } from 'node:test';
import assert from 'node:assert';
import { ManyChatConnector } from '../dist/platforms/manychat.js';
import { BotBuildersConnector } from '../dist/platforms/botbuilders.js';
import { OpenClawConnector } from '../dist/platforms/openclaw.js';
import { MoltbookConnector } from '../dist/platforms/moltbook.js';
import { PlatformManager } from '../dist/platforms/manager.js';
import { PlatformType } from '../dist/platforms/types.js';

test('ManyChatConnector - initialization with valid config', async () => {
  const connector = new ManyChatConnector({
    enabled: true,
    apiKey: 'test-api-key',
  });

  await connector.initialize();
  assert.strictEqual(connector.isReady(), true, 'Connector should be ready after initialization');
  await connector.shutdown();
});

test('ManyChatConnector - send message', async () => {
  const connector = new ManyChatConnector({
    enabled: true,
    apiKey: 'test-api-key',
  });

  await connector.initialize();
  const message = await connector.sendMessage('user123', 'Hello from ManyChat!');

  assert.strictEqual(message.platform, PlatformType.MANYCHAT);
  assert.strictEqual(message.userId, 'user123');
  assert.strictEqual(message.text, 'Hello from ManyChat!');
  assert.ok(message.id.startsWith('manychat-'));
  await connector.shutdown();
});

test('ManyChatConnector - receive message', async () => {
  const connector = new ManyChatConnector({
    enabled: true,
    apiKey: 'test-api-key',
  });

  await connector.initialize();
  const payload = {
    id: 'msg-123',
    userId: 'user456',
    text: 'Incoming message',
    timestamp: Date.now(),
  };

  const message = await connector.receiveMessage(payload);
  assert.ok(message);
  assert.strictEqual(message.id, 'msg-123');
  assert.strictEqual(message.userId, 'user456');
  assert.strictEqual(message.text, 'Incoming message');
  await connector.shutdown();
});

test('BotBuildersConnector - initialization with valid config', async () => {
  const connector = new BotBuildersConnector({
    enabled: true,
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
  });

  await connector.initialize();
  assert.strictEqual(connector.isReady(), true);
  await connector.shutdown();
});

test('BotBuildersConnector - send message', async () => {
  const connector = new BotBuildersConnector({
    enabled: true,
    apiKey: 'test-api-key',
    apiSecret: 'test-api-secret',
  });

  await connector.initialize();
  const message = await connector.sendMessage('user789', 'Hello from BotBuilders!');

  assert.strictEqual(message.platform, PlatformType.BOTBUILDERS);
  assert.strictEqual(message.userId, 'user789');
  assert.strictEqual(message.text, 'Hello from BotBuilders!');
  await connector.shutdown();
});

test('OpenClawConnector - initialization and message handling', async () => {
  const connector = new OpenClawConnector({
    enabled: true,
    apiKey: 'test-api-key',
  });

  await connector.initialize();
  assert.strictEqual(connector.isReady(), true);

  const message = await connector.sendMessage('user999', 'Hello from OpenClaw!');
  assert.strictEqual(message.platform, PlatformType.OPENCLAW);
  assert.strictEqual(message.text, 'Hello from OpenClaw!');
  await connector.shutdown();
});

test('MoltbookConnector - initialization and message handling', async () => {
  const connector = new MoltbookConnector({
    enabled: true,
    apiKey: 'test-api-key',
  });

  await connector.initialize();
  assert.strictEqual(connector.isReady(), true);

  const message = await connector.sendMessage('user111', 'Hello from Moltbook!');
  assert.strictEqual(message.platform, PlatformType.MOLTBOOK);
  assert.strictEqual(message.text, 'Hello from Moltbook!');
  await connector.shutdown();
});

test('PlatformManager - initialize multiple platforms', async () => {
  const manager = new PlatformManager({
    manychat: {
      enabled: true,
      apiKey: 'manychat-key',
    },
    botbuilders: {
      enabled: true,
      apiKey: 'botbuilders-key',
      apiSecret: 'botbuilders-secret',
    },
  });

  await manager.initialize();

  const platforms = manager.getEnabledPlatforms();
  assert.strictEqual(platforms.length, 2);
  assert.ok(platforms.includes(PlatformType.MANYCHAT));
  assert.ok(platforms.includes(PlatformType.BOTBUILDERS));

  await manager.shutdown();
});

test('PlatformManager - send message to specific platform', async () => {
  const manager = new PlatformManager({
    manychat: {
      enabled: true,
      apiKey: 'manychat-key',
    },
  });

  await manager.initialize();

  const message = await manager.sendMessage(PlatformType.MANYCHAT, 'user123', 'Test message');
  assert.strictEqual(message.platform, PlatformType.MANYCHAT);
  assert.strictEqual(message.text, 'Test message');

  await manager.shutdown();
});

test('PlatformManager - broadcast message to all platforms', async () => {
  const manager = new PlatformManager({
    manychat: {
      enabled: true,
      apiKey: 'manychat-key',
    },
    openclaw: {
      enabled: true,
      apiKey: 'openclaw-key',
    },
  });

  await manager.initialize();

  const messages = await manager.broadcastMessage('user123', 'Broadcast message');
  assert.strictEqual(messages.length, 2);
  assert.ok(messages.some((m) => m.platform === PlatformType.MANYCHAT));
  assert.ok(messages.some((m) => m.platform === PlatformType.OPENCLAW));

  await manager.shutdown();
});

test('PlatformManager - handle webhook', async () => {
  const manager = new PlatformManager({
    manychat: {
      enabled: true,
      apiKey: 'manychat-key',
    },
  });

  await manager.initialize();

  const payload = {
    id: 'webhook-msg-123',
    userId: 'webhook-user',
    text: 'Webhook message',
  };

  const message = await manager.handleWebhook(PlatformType.MANYCHAT, payload);
  assert.ok(message);
  assert.strictEqual(message.id, 'webhook-msg-123');
  assert.strictEqual(message.platform, PlatformType.MANYCHAT);

  await manager.shutdown();
});

test('PlatformManager - error handling for disabled platform', async () => {
  const manager = new PlatformManager({
    manychat: {
      enabled: true,
      apiKey: 'manychat-key',
    },
  });

  await manager.initialize();

  await assert.rejects(
    async () => {
      await manager.sendMessage(PlatformType.BOTBUILDERS, 'user123', 'Test');
    },
    {
      message: /Platform .* is not enabled or not found/,
    }
  );

  await manager.shutdown();
});

test('Connector - error when not initialized', async () => {
  const connector = new ManyChatConnector({
    enabled: true,
    apiKey: 'test-key',
  });

  // Don't initialize
  await assert.rejects(
    async () => {
      await connector.sendMessage('user123', 'Test');
    },
    {
      message: /not initialized/,
    }
  );
});

test('Connector - disabled connector', async () => {
  const connector = new ManyChatConnector({
    enabled: false,
    apiKey: 'test-key',
  });

  await connector.initialize();
  assert.strictEqual(connector.isReady(), false);
});
