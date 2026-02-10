/**
 * Cross-Platform Bot Integration Module
 *
 * This module provides comprehensive cross-platform connectivity for:
 * - ManyChat: Popular chatbot platform for Facebook Messenger
 * - BotBuilders: Multi-platform bot building solution
 * - OpenClaw: Open-source bot framework
 * - Moltbook: Data synchronization and messaging platform
 */

export * from './types';
export { ManyChatConnector } from './manychat';
export { BotBuildersConnector } from './botbuilders';
export { OpenClawConnector } from './openclaw';
export { MoltbookConnector } from './moltbook';
export { PlatformManager } from './manager';
