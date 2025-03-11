import { WebFingerService } from './WebFingerService';
import { OidcService } from './OidcService';
import { OpenIDConfiguration } from '../types/oidc';
import { authConfig } from '../config/app.config';

/**
 * Service for handling authentication
 */
export class AuthService {
  private static oidcConfig: OpenIDConfiguration | null = null;
  private static clientId: string = authConfig.clientId;
  private static redirectUri: string = authConfig.redirectUri;
  
  /**
   * Initialize authentication by discovering OIDC configuration
   * @param serverUrl - The server URL
   * @returns Promise resolving to an object with success status and insecure warning flag
   */

  /**
   * Ensure the server URL has the correct format
   * @param input - The user input for server URL
   * @returns An object with the normalized URL and a flag indicating if it's insecure (http://)
   */
  static normalizeServerUrl(input: string): { url: string; isInsecure: boolean } {
    // Remove any leading or trailing whitespace
    let url = input.trim();
    let isInsecure = false;
    
    // Check if URL starts with http:// (insecure)
    if (url.startsWith('http://')) {
      isInsecure = true;
      // Keep http:// but mark as insecure
    } 
    // Check if URL doesn't start with http:// or https://
    else if (!url.startsWith('https://') && !url.startsWith('http://')) {
      // Add https:// prefix if missing
      url = `https://${url}`;
    }
    
    // Remove trailing slash if present
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    
    return { url, isInsecure };
  }

  static async initialize(serverUrl: string): Promise<{ success: boolean; insecureWarning: boolean }> {
    try {
      // Normalize the server URL
      const { url: normalizedUrl, isInsecure } = this.normalizeServerUrl(serverUrl);
      
      // Use the server domain for WebFinger resource
      const serverDomain = new URL(normalizedUrl).hostname;
      const resource = `acct:opencloud@${serverDomain}`;
      
      // Discover OIDC configuration
      this.oidcConfig = await OidcService.discoverConfiguration(normalizedUrl, resource);
      return { success: true, insecureWarning: isInsecure };
    } catch (error) {
      console.error('Authentication initialization error:', error);
      this.oidcConfig = null;
      return { success: false, insecureWarning: false };
    }
  }
  
  /**
   * Get the authorization URL for user login
   * @returns The URL to redirect user to for authentication or null if not initialized
   */
  static getAuthorizationUrl(): string | null {
    if (!this.oidcConfig) {
      console.error('Auth service not initialized');
      return null;
    }
    
    // Generate a random state parameter for security
    const state = Math.random().toString(36).substring(2, 15);
    
    return OidcService.generateAuthorizationUrl(
      this.oidcConfig,
      this.clientId,
      this.redirectUri,
      authConfig.defaultScopes,
      state
    );
  }
  
  /**
   * Exchange authorization code for tokens
   * @param code - The authorization code from callback
   * @returns Promise resolving to the token response
   */
  static async exchangeCodeForTokens(code: string): Promise<any> {
    if (!this.oidcConfig) {
      throw new Error('Auth service not initialized');
    }
    
    const tokenEndpoint = this.oidcConfig.token_endpoint;
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
      }).toString(),
    });
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
}