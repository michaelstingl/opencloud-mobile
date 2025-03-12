import { WebFingerResponse, WebFingerLink } from '../types/webfinger';
import { apiConfig } from '../config/app.config';
import { HttpUtil } from './api/HttpUtil';

/**
 * Service for handling WebFinger discovery
 */
export class WebFingerService {
  /**
   * Generate a UUID v4 for request correlation and tracing
   * @returns A UUID v4 string
   */
  private static generateUuid(): string {
    return HttpUtil.generateUuid();
  }
  /**
   * Discover OpenID Connect provider using WebFinger
   * @param serverUrl - The base URL of the server
   * @param resource - The resource to look up (typically an email-like identifier)
   * @returns Promise resolving to WebFinger response
   */
  static async discover(serverUrl: string, resource: string): Promise<WebFingerResponse> {
    try {
      if (apiConfig.logging?.enableDebugLogging) {
        console.log("[WebFinger] === WEBFINGER DISCOVERY ===");
      }
      
      // Ensure we have a valid URL
      const baseUrl = serverUrl.endsWith('/') ? serverUrl.slice(0, -1) : serverUrl;
      
      if (apiConfig.logging?.enableDebugLogging) {
        console.log("[WebFinger] Base URL:", baseUrl);
      }
      
      // Create WebFinger URL
      const webFingerUrl = `${baseUrl}/.well-known/webfinger?resource=${encodeURIComponent(resource)}`;
      
      if (apiConfig.logging?.enableDebugLogging) {
        console.log("[WebFinger] URL:", webFingerUrl);
        console.log("[WebFinger] Encoded resource:", encodeURIComponent(resource));
        console.log("[WebFinger] Sending request...");
      }
      
      // Generate a request ID for this request
      const requestId = HttpUtil.generateUuid();
      
      // Create standard headers with JSON Accept type that includes our requestId
      const headers = HttpUtil.createStandardHeadersWithRequestId(
        requestId,
        false, 
        undefined, 
        'application/json'
      );
      
      // Create request options
      const options = HttpUtil.createRequestOptions('GET', headers);
      
      // Log request details
      if (apiConfig.logging?.enableDebugLogging) {
        HttpUtil.logRequest(requestId, 'WebFinger', webFingerUrl, 'GET', headers);
      }
      
      // Make the request
      const requestStartTime = Date.now();
      const response = await fetch(webFingerUrl, options);
      const requestDuration = Date.now() - requestStartTime;
      
      // Log response details
      await HttpUtil.logResponse(requestId, 'WebFinger', response, requestDuration);
      
      if (!response.ok) {
        console.error("[WebFinger] Request failed:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("[WebFinger] Error response body:", errorText);
        throw new Error(`WebFinger discovery failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (apiConfig.logging?.enableDebugLogging) {
        console.log("[WebFinger] Response successfully parsed");
        console.log("[WebFinger] Subject:", data.subject);
        console.log("[WebFinger] Links count:", data.links?.length || 0);
        
        // Log all links if available
        if (data.links && data.links.length > 0) {
          console.log("[WebFinger] Available links:", JSON.stringify(data.links, null, 2));
        }
      }
      
      return data;
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
      console.log("[WebFinger] Discovering OIDC issuer for:", serverUrl);
      const webFingerResponse = await this.discover(serverUrl, resource);
      
      // Look for the OpenID Connect issuer link
      const oidcLink = this.findLinkByRel(webFingerResponse, 'http://openid.net/specs/connect/1.0/issuer');
      
      if (!oidcLink || !oidcLink.href) {
        console.error("[WebFinger] No OIDC issuer link found in WebFinger response");
        
        if (apiConfig.logging?.enableDebugLogging) {
          console.log("[WebFinger] Available links:", JSON.stringify(webFingerResponse.links || []));
        }
        
        // FALLBACK: Try to use the server URL as issuer
        console.log("[WebFinger] Using fallback: server URL as issuer");
        return serverUrl;
      }
      
      console.log("[WebFinger] Found OIDC issuer URL:", oidcLink.href);
      return oidcLink.href;
    } catch (error) {
      console.error('[WebFinger] OIDC issuer discovery error:', error);
      
      // FALLBACK: Try to use the server URL as issuer when WebFinger fails
      console.log("[WebFinger] WebFinger failed, using fallback: server URL as issuer");
      return serverUrl;
    }
  }
}