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
     * Post-logout redirect URI for OpenID Connect session end
     */
    postLogoutRedirectUri: string;
    
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

    /**
     * Logging configuration
     */
    logging?: {
      /**
       * Maximum number of characters to log for request/response bodies
       */
      maxBodyLogLength?: number;
      
      /**
       * Whether to generate curl commands in logs for debugging
       */
      generateCurlCommands?: boolean;
      
      /**
       * Enable detailed debug logging
       */
      enableDebugLogging?: boolean;
    };
    
    /**
     * HTTP headers configuration
     */
    headers?: {
      /**
       * User agent string to use for requests
       */
      userAgent?: string;
      
      /**
       * Whether to use X-Request-ID in all requests
       */
      useRequestId?: boolean;
    };
  };
}

/**
 * Default configuration values
 */
// Import package.json for version information
import packageJson from '../package.json';

// App information for User-Agent
const APP_NAME = packageJson.name || 'opencloud-mobile';
const APP_VERSION = packageJson.version || '1.0.0';
const PLATFORM = Platform.OS;
// Convert kebab-case to PascalCase for the app name in the User-Agent
const formattedAppName = APP_NAME.split('-')
  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');
const USER_AGENT = `${formattedAppName}/${APP_VERSION} (${PLATFORM})`;

const defaultConfig: AppConfig = {
  auth: {
    // The client ID will be determined based on platform
    clientId: Platform.OS === 'ios' ? 'OpenCloudIOS' : 'OpenCloudAndroid',
    // Platform-specific redirect URIs
    redirectUri: Platform.OS === 'ios' ? 'oc://ios.opencloud.eu' : 'oc://android.opencloud.eu',
    // Post-logout redirect URI (same as login redirect URI)
    postLogoutRedirectUri: Platform.OS === 'ios' ? 'oc://ios.opencloud.eu' : 'oc://android.opencloud.eu',
    defaultScopes: 'openid profile email',
  },
  api: {
    timeout: 30000, // 30 seconds
    logging: {
      maxBodyLogLength: 1000, // Maximum number of characters to log for request/response bodies
      generateCurlCommands: false, // Default: No curl commands in production, will be enabled in dev mode
      enableDebugLogging: false, // Default: No detailed debug logs in production, will be enabled in dev mode
    },
    headers: {
      userAgent: USER_AGENT, // Default User-Agent for all API requests with version and platform
      useRequestId: true, // Whether to use X-Request-ID in all requests
    }
  },
};

/**
 * Current app configuration
 * This can be extended with environment-specific or build-specific configurations
 */
// Determine if we're in development mode (__DEV__ is provided by React Native)
const isDevelopmentMode = typeof __DEV__ !== 'undefined' && __DEV__;

export const appConfig: AppConfig = {
  ...defaultConfig,
  // Override values from environment variables or build configuration here
  api: {
    ...defaultConfig.api,
    logging: {
      ...defaultConfig.api.logging,
      // Enable debug logging and curl commands automatically in development mode only
      enableDebugLogging: isDevelopmentMode || defaultConfig.api.logging?.enableDebugLogging || false,
      generateCurlCommands: isDevelopmentMode || defaultConfig.api.logging?.generateCurlCommands || false
    }
  }
};

/**
 * Export individual configuration sections for easy importing
 */
export const authConfig = appConfig.auth;
export const apiConfig = appConfig.api;