/**
 * Common types for cross-platform bot integrations
 */

/**
 * Platform types supported by the system
 */
export enum PlatformType {
  MANYCHAT = 'manychat',
  BOTBUILDERS = 'botbuilders',
  OPENCLAW = 'openclaw',
  MOLTBOOK = 'moltbook',
}

/**
 * Message structure for cross-platform communication
 */
export interface Message {
  id: string;
  platform: PlatformType;
  userId: string;
  text: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

/**
 * User profile information
 */
export interface UserProfile {
  id: string;
  platform: PlatformType;
  name?: string;
  email?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Platform connector configuration
 */
export interface PlatformConfig {
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  endpoint?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Base interface for all platform connectors
 */
export interface PlatformConnector {
  /**
   * Initialize the platform connector
   */
  initialize(): Promise<void>;

  /**
   * Send a message to the platform
   */
  sendMessage(userId: string, message: string): Promise<Message>;

  /**
   * Receive messages from the platform (webhook handler)
   */
  receiveMessage(payload: unknown): Promise<Message | null>;

  /**
   * Get user profile from the platform
   */
  getUserProfile(userId: string): Promise<UserProfile | null>;

  /**
   * Check if the connector is ready
   */
  isReady(): boolean;

  /**
   * Shutdown the connector
   */
  shutdown(): Promise<void>;
}

/**
 * Platform manager configuration
 */
export interface PlatformManagerConfig {
  manychat?: PlatformConfig;
  botbuilders?: PlatformConfig;
  openclaw?: PlatformConfig;
  moltbook?: PlatformConfig;
}
