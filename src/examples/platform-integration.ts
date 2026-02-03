/**
 * Example: Cross-Platform Bot Integration
 *
 * This example demonstrates how to use the cross-platform bot integration
 * to send messages and handle webhooks across multiple platforms.
 */

import { PlatformManager, PlatformType } from '../platforms';

async function runExample() {
  console.log('=== Cross-Platform Bot Integration Example ===\n');

  // Initialize the platform manager with multiple platforms
  const manager = new PlatformManager({
    manychat: {
      enabled: true,
      apiKey: 'demo-manychat-key',
      webhookUrl: 'https://example.com/webhooks/manychat',
    },
    botbuilders: {
      enabled: true,
      apiKey: 'demo-botbuilders-key',
      apiSecret: 'demo-botbuilders-secret',
      endpoint: 'https://api.botbuilders.example',
    },
    openclaw: {
      enabled: true,
      apiKey: 'demo-openclaw-key',
    },
    moltbook: {
      enabled: true,
      apiKey: 'demo-moltbook-key',
      endpoint: 'https://api.moltbook.example',
    },
  });

  // Initialize all enabled platforms
  console.log('Initializing platform connectors...');
  await manager.initialize();

  const enabledPlatforms = manager.getEnabledPlatforms();
  console.log(
    `✓ Initialized ${enabledPlatforms.length} platforms: ${enabledPlatforms.join(', ')}\n`
  );

  // Example 1: Send a message to a specific platform
  console.log('Example 1: Send message to ManyChat');
  const manychatMessage = await manager.sendMessage(
    PlatformType.MANYCHAT,
    'user123',
    'Hello from ManyChat connector!'
  );
  console.log(`✓ Message sent:`, {
    id: manychatMessage.id,
    platform: manychatMessage.platform,
    text: manychatMessage.text,
  });
  console.log();

  // Example 2: Broadcast a message to all platforms
  console.log('Example 2: Broadcast message to all platforms');
  const broadcastMessages = await manager.broadcastMessage(
    'user456',
    'This is a broadcast message!'
  );
  console.log(`✓ Broadcast sent to ${broadcastMessages.length} platforms:`);
  broadcastMessages.forEach((msg) => {
    console.log(`  - ${msg.platform}: ${msg.id}`);
  });
  console.log();

  // Example 3: Handle incoming webhook from ManyChat
  console.log('Example 3: Handle incoming webhook');
  const webhookPayload = {
    id: 'webhook-msg-789',
    userId: 'webhook-user',
    text: 'User message from ManyChat',
    timestamp: Date.now(),
  };

  const receivedMessage = await manager.handleWebhook(PlatformType.MANYCHAT, webhookPayload);
  if (receivedMessage) {
    console.log(`✓ Webhook processed:`, {
      id: receivedMessage.id,
      platform: receivedMessage.platform,
      userId: receivedMessage.userId,
      text: receivedMessage.text,
    });
  }
  console.log();

  // Example 4: Get user profile
  console.log('Example 4: Get user profile');
  const connector = manager.getConnector(PlatformType.BOTBUILDERS);
  if (connector) {
    const profile = await connector.getUserProfile('user789');
    if (profile) {
      console.log(`✓ User profile retrieved:`, {
        id: profile.id,
        platform: profile.platform,
        name: profile.name,
      });
    }
  }
  console.log();

  // Example 5: Check platform status
  console.log('Example 5: Platform status check');
  enabledPlatforms.forEach((platform) => {
    const isEnabled = manager.isPlatformEnabled(platform);
    console.log(`  - ${platform}: ${isEnabled ? 'enabled' : 'disabled'}`);
  });
  console.log();

  // Cleanup: Shutdown all platform connectors
  console.log('Shutting down platform connectors...');
  await manager.shutdown();
  console.log('✓ All platforms shut down gracefully\n');

  console.log('=== Example completed successfully ===');
}

// Run the example
runExample().catch((error) => {
  console.error('Example failed:', error);
  process.exit(1);
});
