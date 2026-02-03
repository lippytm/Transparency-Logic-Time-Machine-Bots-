/**
 * Platform Manager
 * Central coordinator for all platform connectors
 */

import type { PlatformConnector, PlatformManagerConfig, Message } from './types';
import { PlatformType } from './types';
import { ManyChatConnector } from './manychat';
import { BotBuildersConnector } from './botbuilders';
import { OpenClawConnector } from './openclaw';
import { MoltbookConnector } from './moltbook';

export class PlatformManager {
  private connectors: Map<PlatformType, PlatformConnector> = new Map();
  private config: PlatformManagerConfig;

  constructor(config: PlatformManagerConfig) {
    this.config = config;
  }

  /**
   * Initialize all enabled platform connectors
   */
  async initialize(): Promise<void> {
    // Initialize ManyChat
    if (this.config.manychat?.enabled) {
      const connector = new ManyChatConnector(this.config.manychat);
      await connector.initialize();
      this.connectors.set(PlatformType.MANYCHAT, connector);
    }

    // Initialize BotBuilders
    if (this.config.botbuilders?.enabled) {
      const connector = new BotBuildersConnector(this.config.botbuilders);
      await connector.initialize();
      this.connectors.set(PlatformType.BOTBUILDERS, connector);
    }

    // Initialize OpenClaw
    if (this.config.openclaw?.enabled) {
      const connector = new OpenClawConnector(this.config.openclaw);
      await connector.initialize();
      this.connectors.set(PlatformType.OPENCLAW, connector);
    }

    // Initialize Moltbook
    if (this.config.moltbook?.enabled) {
      const connector = new MoltbookConnector(this.config.moltbook);
      await connector.initialize();
      this.connectors.set(PlatformType.MOLTBOOK, connector);
    }
  }

  /**
   * Get a specific platform connector
   */
  getConnector(platform: PlatformType): PlatformConnector | undefined {
    return this.connectors.get(platform);
  }

  /**
   * Get all active platform connectors
   */
  getActiveConnectors(): PlatformConnector[] {
    return Array.from(this.connectors.values());
  }

  /**
   * Send a message to a specific platform
   */
  async sendMessage(platform: PlatformType, userId: string, text: string): Promise<Message> {
    const connector = this.connectors.get(platform);
    if (!connector) {
      throw new Error(`Platform ${platform} is not enabled or not found`);
    }
    return connector.sendMessage(userId, text);
  }

  /**
   * Broadcast a message to all active platforms
   */
  async broadcastMessage(userId: string, text: string): Promise<Message[]> {
    const messages: Message[] = [];
    for (const connector of this.connectors.values()) {
      if (connector.isReady()) {
        try {
          const message = await connector.sendMessage(userId, text);
          messages.push(message);
        } catch (error) {
          console.error('Failed to send message to platform:', error);
        }
      }
    }
    return messages;
  }

  /**
   * Handle incoming webhook from any platform
   */
  async handleWebhook(platform: PlatformType, payload: unknown): Promise<Message | null> {
    const connector = this.connectors.get(platform);
    if (!connector) {
      throw new Error(`Platform ${platform} is not enabled or not found`);
    }
    return connector.receiveMessage(payload);
  }

  /**
   * Get enabled platform types
   */
  getEnabledPlatforms(): PlatformType[] {
    return Array.from(this.connectors.keys());
  }

  /**
   * Check if a platform is enabled
   */
  isPlatformEnabled(platform: PlatformType): boolean {
    return this.connectors.has(platform);
  }

  /**
   * Shutdown all connectors
   */
  async shutdown(): Promise<void> {
    for (const connector of this.connectors.values()) {
      await connector.shutdown();
    }
    this.connectors.clear();
  }
}
