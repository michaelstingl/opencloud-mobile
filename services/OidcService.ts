import { OpenIDConfiguration } from '../types/oidc';
import { WebFingerService } from './WebFingerService';

/**
 * Service for handling OpenID Connect operations
 */
export class OidcService {
  /**
   * Fetch OpenID Connect configuration from the provider
   * @param issuerUrl - The URL of the OpenID Connect issuer
   * @returns Promise resolving to OpenID Connect configuration
   */
  static async fetchConfiguration(issuerUrl: string): Promise<OpenIDConfiguration> {
    try {
      // Ensure the issuer URL has the correct format
      const baseUrl = issuerUrl.endsWith('/') ? issuerUrl.slice(0, -1) : issuerUrl;
      
      // Create well-known configuration URL
      const configUrl = `${baseUrl}/.well-known/openid-configuration`;
      
      // Make the request
      const response = await fetch(configUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch OIDC configuration: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('OpenID Connect configuration error:', error);
      throw error;
    }
  }
  
  /**
   * Complete discovery process from server URL to OpenID Connect configuration
   * @param serverUrl - The base URL of the server
   * @param resource - The resource to look up (typically acct:username@domain)
   * @returns Promise resolving to OpenID Connect configuration
   */
  static async discoverConfiguration(serverUrl: string, resource: string): Promise<OpenIDConfiguration> {
    try {
      // First, discover the OpenID Connect issuer using WebFinger
      const issuerUrl = await WebFingerService.discoverOidcIssuer(serverUrl, resource);
      
      if (!issuerUrl) {
        throw new Error('OpenID Connect issuer not found in WebFinger response');
      }
      
      // Then, fetch the OpenID Connect configuration
      return await this.fetchConfiguration(issuerUrl);
    } catch (error) {
      console.error('OpenID Connect discovery error:', error);
      throw error;
    }
  }
  
  /**
   * Generate authorization URL for OpenID Connect authentication
   * @param config - The OpenID Connect configuration
   * @param clientId - The client ID for the application
   * @param redirectUri - The URI to redirect to after authentication
   * @param scopes - The requested scopes (default: 'openid profile email')
   * @param state - Optional state parameter for security
   * @returns The authorization URL to redirect the user to
   */
  static generateAuthorizationUrl(
    config: OpenIDConfiguration,
    clientId: string,
    redirectUri: string,
    scopes: string = 'openid profile email',
    state?: string
  ): string {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
    });
    
    if (state) {
      params.append('state', state);
    }
    
    return `${config.authorization_endpoint}?${params.toString()}`;
  }
}