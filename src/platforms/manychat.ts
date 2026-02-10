/**
 * ManyChat Platform Connector
 * Provides integration with ManyChat's API for cross-platform bot communication
 */

import type { PlatformConnector, PlatformConfig, Message, UserProfile } from './types';
import { PlatformType } from './types';

export class ManyChatConnector implements PlatformConnector {
  private config: PlatformConfig;
  private ready: boolean = false;

  constructor(config: PlatformConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    // Validate required configuration
    if (!this.config.apiKey) {
      throw new Error('ManyChat API key is required');
    }

    // Initialize ManyChat connection
    // This would typically involve setting up webhooks and validating the API key
    this.ready = true;
  }

  async sendMessage(userId: string, text: string): Promise<Message> {
    if (!this.ready) {
      throw new Error('ManyChat connector not initialized');
    }

    // In a real implementation, this would call the ManyChat API
    // Example: POST to https://api.manychat.com/fb/sending/sendContent
    const message: Message = {
      id: `manychat-${Date.now()}`,
      platform: PlatformType.MANYCHAT,
      userId,
      text,
      timestamp: new Date(),
      metadata: {
        apiKey: this.config.apiKey?.substring(0, 8) + '...',
      },
    };

    return message;
  }

  async receiveMessage(payload: unknown): Promise<Message | null> {
    if (!this.ready) {
      throw new Error('ManyChat connector not initialized');
    }

    // Parse ManyChat webhook payload
    // ManyChat sends messages in a specific format
    const data = payload as Record<string, unknown>;

    if (!data || !data.text || !data.id) {
      return null;
    }

    const message: Message = {
      id: String(data.id),
      platform: PlatformType.MANYCHAT,
      userId: String(data.userId || data.user_id || 'unknown'),
      text: String(data.text),
      timestamp: new Date(String(data.timestamp || Date.now())),
      metadata: data,
    };

    return message;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!this.ready) {
      throw new Error('ManyChat connector not initialized');
    }

    // In a real implementation, this would call the ManyChat API
    // Example: GET https://api.manychat.com/fb/subscriber/getInfo
    const profile: UserProfile = {
      id: userId,
      platform: PlatformType.MANYCHAT,
      name: `ManyChat User ${userId}`,
      metadata: {
        source: 'manychat',
      },
    };

    return profile;
  }

  isReady(): boolean {
    return this.ready;
  }

  async shutdown(): Promise<void> {
    this.ready = false;
  }
}
