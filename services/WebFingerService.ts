import { WebFingerResponse, WebFingerLink } from '../types/webfinger';

/**
 * Service for handling WebFinger discovery
 */
export class WebFingerService {
  /**
   * Discover OpenID Connect provider using WebFinger
   * @param serverUrl - The base URL of the server
   * @param resource - The resource to look up (typically an email-like identifier)
   * @returns Promise resolving to WebFinger response
   */
  static async discover(serverUrl: string, resource: string): Promise<WebFingerResponse> {
    try {
      // Ensure we have a valid URL
      const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
      
      // Create WebFinger URL
      const webFingerUrl = `${baseUrl}/.well-known/webfinger?resource=${encodeURIComponent(resource)}`;
      
      // Make the request
      const response = await fetch(webFingerUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`WebFinger discovery failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('WebFinger discovery error:', error);
      throw error;
    }
  }
  
  /**
   * Find a link with specific relation in WebFinger response
   * @param webFingerResponse - The WebFinger response
   * @param rel - The relation to look for
   * @returns The matching link or undefined if not found
   */
  static findLinkByRel(webFingerResponse: WebFingerResponse, rel: string): WebFingerLink | undefined {
    return webFingerResponse.links?.find(link => link.rel === rel);
  }
  
  /**
   * Discover OpenID Connect provider configuration endpoint
   * @param serverUrl - The base URL of the server
   * @param resource - The resource to look up (typically an email-like identifier)
   * @returns Promise resolving to the OpenID Connect issuer URL or null if not found
   */
  static async discoverOidcIssuer(serverUrl: string, resource: string): Promise<string | null> {
    try {
      const webFingerResponse = await this.discover(serverUrl, resource);
      
      // Look for the OpenID Connect issuer link
      const oidcLink = this.findLinkByRel(webFingerResponse, 'http://openid.net/specs/connect/1.0/issuer');
      
      return oidcLink?.href || null;
    } catch (error) {
      console.error('OIDC issuer discovery error:', error);
      throw error;
    }
  }
}