import { OpenIDConfiguration } from '../types/oidc';
import { WebFingerService } from './WebFingerService';
import { apiConfig } from '../config/app.config';
import { HttpUtil } from './api/HttpUtil';

/**
 * Service for handling OpenID Connect operations
 */
export class OidcService {
  /**
   * Generate a UUID v4 for request correlation and tracing
   * @returns A UUID v4 string
   */
  private static generateUuid(): string {
    return HttpUtil.generateUuid();
  }
  /**
   * Fetch OpenID Connect configuration from the provider
   * @param issuerUrl - The URL of the OpenID Connect issuer
   * @returns Promise resolving to OpenID Connect configuration
   */
  static async fetchConfiguration(issuerUrl: string): Promise<OpenIDConfiguration> {
    try {
      if (apiConfig.logging?.enableDebugLogging) {
        console.log("[OIDC] Fetching configuration from issuer");
      }
      
      // Ensure the issuer URL has the correct format
      const baseUrl = issuerUrl.endsWith('/') ? issuerUrl.slice(0, -1) : issuerUrl;
      
      // Create well-known configuration URL
      const configUrl = `${baseUrl}/.well-known/openid-configuration`;
      
      if (apiConfig.logging?.enableDebugLogging) {
        console.log("[OIDC] Configuration URL:", configUrl);
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
        HttpUtil.logRequest(requestId, 'OIDC', configUrl, 'GET', headers);
      }
      
      // Make the request
      const requestStartTime = Date.now();
      const response = await fetch(configUrl, options);
      const requestDuration = Date.now() - requestStartTime;
      
      // Log response details
      await HttpUtil.logResponse(requestId, 'OIDC', response, requestDuration);
      
      if (!response.ok) {
        console.error("[OIDC] Failed to fetch configuration:", response.status, response.statusText);
        const errorText = await response.text();
        console.error("[OIDC] Error response body:", errorText);
        throw new Error(`Failed to fetch OIDC configuration: ${response.status} ${response.statusText}`);
      }
      
      const config = await response.json();
      
      if (apiConfig.logging?.enableDebugLogging) {
        console.log("[OIDC] Configuration successfully retrieved");
        
        // Log important endpoints from the configuration
        const endpoints = {
          issuer: config.issuer,
          authorization_endpoint: config.authorization_endpoint,
          token_endpoint: config.token_endpoint,
          userinfo_endpoint: config.userinfo_endpoint,
          end_session_endpoint: config.end_session_endpoint,
          jwks_uri: config.jwks_uri
        };
        
        console.log("[OIDC] Endpoints:", JSON.stringify(endpoints, null, 2));
      }
      
      return config;
    } catch (error) {
      console.error('[OIDC] Configuration error:', error);
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
      if (apiConfig.logging?.enableDebugLogging) {
        console.log("[OIDC] === DISCOVERY PROCESS ===");
        console.log("[OIDC] Server URL:", serverUrl);
        console.log("[OIDC] Resource:", resource);
      } else {
        console.log("[OIDC] Starting discovery for", serverUrl);
      }
      
      // First, discover the OpenID Connect issuer using WebFinger
      const issuerUrl = await WebFingerService.discoverOidcIssuer(serverUrl, resource);
      
      if (!issuerUrl) {
        console.error("[OIDC] No issuer URL found in WebFinger response");
        throw new Error('OpenID Connect issuer not found in WebFinger response');
      }
      
      console.log("[OIDC] Discovered issuer URL:", issuerUrl);
      
      // Then, fetch the OpenID Connect configuration
      const config = await this.fetchConfiguration(issuerUrl);
      
      console.log("[OIDC] Discovery process completed successfully");
      
      return config;
    } catch (error) {
      console.error('[OIDC] Discovery error:', error);
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
    if (apiConfig.logging?.enableDebugLogging) {
      console.log("[OIDC] Generating authorization URL");
      console.log("[OIDC] Using authorization endpoint:", config.authorization_endpoint);
      console.log("[OIDC] Parameters:", {
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes,
        state: state || '(not provided)'
      });
    }
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
    });
    
    if (state) {
      params.append('state', state);
    }
    
    const url = `${config.authorization_endpoint}?${params.toString()}`;
    
    if (apiConfig.logging?.enableDebugLogging) {
      console.log("[OIDC] Generated authorization URL:", url);
    }
    
    return url;
  }
  
  /**
   * Generate end-session URL for OpenID Connect logout
   * @param config - The OpenID Connect configuration
   * @param clientId - The client ID for the application
   * @param postLogoutRedirectUri - The URI to redirect to after logout (optional)
   * @param idToken - The ID token received during authentication (optional)
   * @returns The end-session URL to redirect the user to, or null if not supported
   */
  static generateEndSessionUrl(
    config: OpenIDConfiguration,
    clientId: string,
    postLogoutRedirectUri?: string,
    idToken?: string
  ): string | null {
    if (apiConfig.logging?.enableDebugLogging) {
      console.log("[OIDC] Generating end-session URL");
    }
    
    // Check if end session endpoint is available
    if (!config.end_session_endpoint) {
      console.warn('[OIDC] End session endpoint not available in OIDC configuration');
      return null;
    }
    
    if (apiConfig.logging?.enableDebugLogging) {
      console.log("[OIDC] Using end session endpoint:", config.end_session_endpoint);
      console.log("[OIDC] Parameters:", {
        client_id: clientId,
        post_logout_redirect_uri: postLogoutRedirectUri || '(not provided)',
        id_token_hint: idToken ? '(provided)' : '(not provided)'
      });
    }
    
    const params = new URLSearchParams({
      client_id: clientId
    });
    
    // Add id_token_hint if available
    if (idToken) {
      params.append('id_token_hint', idToken);
    }
    
    // Add post_logout_redirect_uri if provided
    if (postLogoutRedirectUri) {
      params.append('post_logout_redirect_uri', postLogoutRedirectUri);
    }
    
    const url = `${config.end_session_endpoint}?${params.toString()}`;
    
    if (apiConfig.logging?.enableDebugLogging) {
      // Don't log the full URL with token for security reasons
      console.log("[OIDC] Generated end-session URL:", 
        idToken 
          ? url.replace(idToken, '(id_token_redacted)') 
          : url
      );
    }
    
    return url;
  }
}