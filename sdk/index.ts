/**
 * Main SDK index - exports all adapters
 */

import { AIAdapter, AIAdapterConfig } from './ai/adapter';
import { Web3Adapter, Web3AdapterConfig } from './web3/adapter';
import { MessagingAdapter, MessagingAdapterConfig } from './messaging/adapter';
import { DataAdapter, DataAdapterConfig } from './data/adapter';

export { AIAdapter, AIAdapterConfig };
export { Web3Adapter, Web3AdapterConfig };
export { MessagingAdapter, MessagingAdapterConfig };
export { DataAdapter, DataAdapterConfig };

export interface SDKConfig {
  ai?: any;
  web3?: any;
  messaging?: any;
  data?: any;
}

/**
 * Factory class to create all adapters from environment variables
 */
export class SDK {
  static createFromEnv() {
    return {
      ai: AIAdapter.fromEnv(),
      web3: Web3Adapter.fromEnv(),
      messaging: MessagingAdapter.fromEnv(),
      data: DataAdapter.fromEnv()
    };
  }
}
