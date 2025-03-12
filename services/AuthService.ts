import { WebFingerService } from './WebFingerService';
import { OidcService } from './OidcService';
import { OpenIDConfiguration } from '../types/oidc';
import { authConfig, apiConfig } from '../config/app.config';
import { ApiService } from './api/ApiService';
import { HttpUtil } from './api/HttpUtil';

/**
 * Service for handling authentication
 */
export class AuthService {
  private static oidcConfig: OpenIDConfiguration | null = null;
  private static clientId: string = authConfig.clientId;
  private static redirectUri: string = authConfig.redirectUri;
  private static serverUrl: string | null = null;
  
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
      // Special case for demo mode to bypass discovery
      if (serverUrl.toLowerCase() === 'demo' || serverUrl.toLowerCase() === 'https://demo.opencloud.example') {
        console.log("Using demo mode in AuthService");
        this.serverUrl = 'https://demo.opencloud.example';
        this.oidcConfig = {
          issuer: 'https://demo.opencloud.example',
          authorization_endpoint: 'https://demo.opencloud.example/oauth/authorize',
          token_endpoint: 'https://demo.opencloud.example/oauth/token',
          userinfo_endpoint: 'https://demo.opencloud.example/oauth/userinfo',
          jwks_uri: 'https://demo.opencloud.example/.well-known/jwks.json',
          response_types_supported: ['code'],
          grant_types_supported: ['authorization_code'],
          subject_types_supported: ['public'],
          id_token_signing_alg_values_supported: ['RS256'],
        };
        return { success: true, insecureWarning: false };
      }
      
      // Normalize the server URL
      const { url: normalizedUrl, isInsecure } = this.normalizeServerUrl(serverUrl);
      
      // Store the normalized URL
      this.serverUrl = normalizedUrl;
      
      // Use the server domain for WebFinger resource
      const serverDomain = new URL(normalizedUrl).hostname;
      const resource = `acct:opencloud@${serverDomain}`;
      
      // Discover OIDC configuration
      this.oidcConfig = await OidcService.discoverConfiguration(normalizedUrl, resource);
      return { success: true, insecureWarning: isInsecure };
    } catch (error) {
      console.error('Authentication initialization error:', error);
      this.oidcConfig = null;
      this.serverUrl = null;
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
    
    // Log all parameters for debugging if enabled
    if (apiConfig.logging?.enableDebugLogging) {
      console.log("=== AUTH URL GENERATION ===");
      console.log("Authorization endpoint:", this.oidcConfig.authorization_endpoint);
      console.log("Client ID:", this.clientId);
      console.log("Redirect URI:", this.redirectUri);
      console.log("Scopes:", authConfig.defaultScopes);
      console.log("State:", state);
    }
    
    const authUrl = OidcService.generateAuthorizationUrl(
      this.oidcConfig,
      this.clientId,
      this.redirectUri,
      authConfig.defaultScopes,
      state
    );
    
    if (apiConfig.logging?.enableDebugLogging) {
      console.log("Generated auth URL:", authUrl);
    }
    return authUrl;
  }
  
  /**
   * Exchange authorization code for tokens
   * @param code - The authorization code from callback
   * @returns Promise resolving to the token response
   */
  static async exchangeCodeForTokens(code: string): Promise<any> {
    console.log(`AuthService: Exchanging code for tokens...`);
    
    if (!this.oidcConfig || !this.serverUrl) {
      console.error('AuthService: Not initialized!');
      throw new Error('Auth service not initialized');
    }
    
    const tokenEndpoint = this.oidcConfig.token_endpoint;
    console.log(`AuthService: Using token endpoint: ${tokenEndpoint}`);
    
    // Log exchange parameters (except the code for security)
    console.log(`AuthService: Using client_id: ${this.clientId}`);
    console.log(`AuthService: Using redirect_uri: ${this.redirectUri}`);
    
    try {
      console.log(`AuthService: Sending token request...`);
      
      // Generate a request ID for this request
      const requestId = HttpUtil.generateUuid();
      
      // Create standard headers with specific content type for form data that includes our requestId
      const headers = HttpUtil.createStandardHeadersWithRequestId(
        requestId,
        false, 
        undefined, 
        'application/x-www-form-urlencoded'
      );
      
      const requestStartTime = Date.now();
      // Create the request body
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
      }).toString();
      
      // Create request options using the shared utility
      const options = HttpUtil.createRequestOptions('POST', headers, body);
      
      // Log request details
      HttpUtil.logRequest(requestId, 'Auth', tokenEndpoint, 'POST', headers, body);
      
      const response = await fetch(tokenEndpoint, options);
      const requestDuration = Date.now() - requestStartTime;
      
      // Log response details
      await HttpUtil.logResponse(requestId, 'Auth', response, requestDuration);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AuthService: Token exchange failed: ${response.statusText}`, errorText);
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
      }
      
      const tokenResponse = await response.json();
      console.log(`AuthService: Token received successfully`);
      
      // Initialize API service with token and server URL (using real API mode)
      console.log(`AuthService: Setting real credentials from token exchange`);
      console.log(`AuthService: Server URL: ${this.serverUrl}`);
      console.log(`AuthService: Has access token: ${!!tokenResponse.access_token}`);
      
      // Store ID token for logout if available
      if (tokenResponse.id_token) {
        console.log(`AuthService: Storing ID token for logout`);
        this.idToken = tokenResponse.id_token;
      }
      
      ApiService.setCredentials(tokenResponse.access_token, this.serverUrl);
      
      return tokenResponse;
    } catch (error) {
      console.error(`AuthService: Error during token exchange:`, error);
      throw error;
    }
  }
  
  /**
   * Get the current server URL
   */
  static getServerUrl(): string | null {
    return this.serverUrl;
  }
  
  // Store ID token for logout
  private static idToken: string | null = null;
  
  /**
   * Generate a UUID v4 for request correlation and tracing
   * @returns A UUID v4 string
   */
  private static generateUuid(): string {
    return HttpUtil.generateUuid();
  }
  
  /**
   * Logout the user and clear credentials
   * @param initiateIdpLogout - Whether to also log out from the IdP (defaults to true)
   * @returns A Promise that resolves to either null (if no browser needed) or the URL to open in browser
   */
  static async logout(initiateIdpLogout: boolean = true): Promise<{ redirectUrl: string | null; status: number }> {
    // Store state before clearing
    const storedOidcConfig = this.oidcConfig;
    const storedIdToken = this.idToken;
    const storedClientId = this.clientId;
    
    // Always clear local session data first
    console.log(`[Auth] Clearing local session data`);
    this.serverUrl = null;
    this.oidcConfig = null;
    this.idToken = null;
    ApiService.setCredentials('', '');
    
    // If IdP logout not requested or no configuration available, just return
    if (!initiateIdpLogout || !storedOidcConfig || !storedOidcConfig.end_session_endpoint) {
      return { redirectUrl: null, status: 0 };
    }
    
    // Generate IdP logout URL
    console.log(`[Auth] Generating IdP logout URL`);
    const logoutUrl = OidcService.generateEndSessionUrl(
      storedOidcConfig,
      storedClientId,
      authConfig.postLogoutRedirectUri,
      storedIdToken
    );
    
    if (!logoutUrl) {
      console.log(`[Auth] Failed to generate IdP logout URL`);
      return { redirectUrl: null, status: 0 };
    }
    
    console.log(`[Auth] IdP logout URL generated: ${logoutUrl}`);
    
    try {
      // ====== Now using real implementation instead of test mode ======
      
      // Create and log a curl command for testing
      let curlHeaders = '';
      let curlCommand = '';
      
      // Generate a request ID for this request
      const requestId = HttpUtil.generateUuid();
      
      // Create standard headers with specific Accept type for HTML content that includes our requestId
      const headers = HttpUtil.createStandardHeadersWithRequestId(
        requestId,
        false, 
        undefined
      );
      
      // Override Accept header for HTML content
      headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
      
      // Create request options using the shared utility
      const requestOptions = HttpUtil.createRequestOptions('GET', headers);
      
      // Include cookies if possible
      requestOptions.credentials = 'include';
      
      // Log request details
      HttpUtil.logRequest(requestId, 'Auth', logoutUrl, 'GET', headers);
      
      // Generate curl command for testing if enabled in config
      if (apiConfig.logging?.generateCurlCommands) {
        const curlCommand = HttpUtil.generateCurlCommand(logoutUrl, requestOptions);
        console.log(`[Auth] Equivalent curl command for debugging:\n${curlCommand}`);
      }
      
      // Execute the request
      const requestStartTime = Date.now();
      const response = await fetch(logoutUrl, requestOptions);
      const requestDuration = Date.now() - requestStartTime;
      
      // Log response details
      await HttpUtil.logResponse(requestId, 'Auth', response, requestDuration);
      
      // Try to get response body if debug logging is enabled
      if (apiConfig.logging?.enableDebugLogging) {
        try {
          // Clone the response so we can read it multiple times if needed
          const responseClone = response.clone();
          const contentType = response.headers.get('content-type') || '';
          
          // Get maximum logging length from config
          const maxBodyLength = apiConfig.logging?.maxBodyLogLength || 500;
          
          if (contentType.includes('text/html')) {
            const bodyText = await responseClone.text();
            console.log(`[Auth] Response body (text/html, first ${maxBodyLength} chars): ${bodyText.substring(0, maxBodyLength)}`);
            console.log(`[Auth] Response body length: ${bodyText.length} characters`);
          } else if (contentType.includes('application/json')) {
            const bodyJson = await responseClone.json();
            console.log(`[Auth] Response body (JSON): ${JSON.stringify(bodyJson, null, 2)}`);
          } else if (response.status !== 204) { // No content
            const bodyText = await responseClone.text();
            console.log(`[Auth] Response body (${contentType}, first ${maxBodyLength} chars): ${bodyText.substring(0, maxBodyLength)}`);
            console.log(`[Auth] Response body length: ${bodyText.length} characters`);
          }
        } catch (bodyError) {
          console.log(`[Auth] Could not read response body: ${bodyError.message}`);
        }
      }
      
      // Evaluate the response based on status code
      if (response.status === 200) {
        // If the server returns 200 OK, the logout was successful
        console.log(`[Auth] Server returned 200 OK, logout successful`);
        return { redirectUrl: null, status: response.status };
      } 
      else if (response.status >= 300 && response.status < 400) {
        // If the server returns a redirect, extract the location
        const redirectLocation = response.headers.get('location') || '';
        console.log(`[Auth] Server returned redirect (${response.status}) to: ${redirectLocation}`);
        
        // Return the redirect URL so the caller can decide what to do with it
        // (e.g., ask the user if they want to open it in a browser)
        return { redirectUrl: redirectLocation, status: response.status };
      }
      else if (response.status >= 200 && response.status < 300) {
        // Any other 2xx status is also considered successful
        console.log(`[Auth] Server returned ${response.status}, logout successful`);
        return { redirectUrl: null, status: response.status };
      }
      
      // Any 4xx or 5xx response is considered an error
      console.error(`[Auth] Server returned error status: ${response.status}`);
      return { redirectUrl: null, status: response.status };
      
    } catch (error) {
      // If the direct request failed, return the original logout URL
      console.error(`[Auth] Direct IdP logout request failed:`, error);
      return { redirectUrl: logoutUrl, status: 0 };
    }
  }
}