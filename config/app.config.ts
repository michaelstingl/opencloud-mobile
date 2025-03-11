import { Platform } from 'react-native';

/**
 * Application configuration
 */
interface AppConfig {
  /**
   * Authentication configuration
   */
  auth: {
    /**
     * Client ID for OpenID Connect
     * Different for iOS and Android to allow platform-specific configurations
     */
    clientId: string;
    
    /**
     * Redirect URI for OpenID Connect authentication
     */
    redirectUri: string;
    
    /**
     * Default scopes to request during authentication
     */
    defaultScopes: string;
  };
  
  /**
   * API related configuration
   */
  api: {
    /**
     * Default timeout for API requests in milliseconds
     */
    timeout: number;
  };
}

/**
 * Default configuration values
 */
const defaultConfig: AppConfig = {
  auth: {
    // The client ID will be determined based on platform
    clientId: Platform.OS === 'ios' ? 'OpenCloudIOS' : 'OpenCloudAndroid',
    // Platform-specific redirect URIs
    redirectUri: Platform.OS === 'ios' ? 'oc://ios.opencloud.eu' : 'oc://android.opencloud.eu',
    defaultScopes: 'openid profile email',
  },
  api: {
    timeout: 30000, // 30 seconds
  },
};

/**
 * Current app configuration
 * This can be extended with environment-specific or build-specific configurations
 */
export const appConfig: AppConfig = {
  ...defaultConfig,
  // Override values from environment variables or build configuration here
};

/**
 * Export individual configuration sections for easy importing
 */
export const authConfig = appConfig.auth;
export const apiConfig = appConfig.api;