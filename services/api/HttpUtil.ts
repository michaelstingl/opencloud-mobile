import { apiConfig } from '../../config/app.config';

/**
 * Shared HTTP utility functions for all API requests
 */
export class HttpUtil {
  /**
   * Generate a UUID v4 for request correlation and tracing
   * @returns A UUID v4 string
   */
  static generateUuid(): string {
    // Simple UUID v4 implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Create standard request headers for all API requests with consistent RequestId
   * 
   * @param requestId The UUID to use for tracing this request
   * @param includeAuth Whether to include Authorization header (defaults to false)
   * @param token Optional auth token if includeAuth is true
   * @param contentType Optional content type (defaults to application/json)
   * @returns Record with standard headers including X-Request-ID
   */
  static createStandardHeadersWithRequestId(
    requestId: string,
    includeAuth: boolean = false, 
    token?: string,
    contentType: string = 'application/json'
  ): Record<string, string> {
    // Create base headers
    const headers: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*',
      'X-Request-ID': requestId
    };

    // Set Content-Type if provided
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    // Add Auth token if needed
    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add User-Agent from config if available
    if (apiConfig.headers?.userAgent) {
      headers['User-Agent'] = apiConfig.headers.userAgent;
    }

    return headers;
  }

  /**
   * Create standard request headers for all API requests
   * @deprecated Use createStandardHeadersWithRequestId instead to ensure consistent request IDs
   * 
   * @param includeAuth Whether to include Authorization header (defaults to false)
   * @param token Optional auth token if includeAuth is true
   * @param contentType Optional content type (defaults to application/json)
   * @returns Record with standard headers
   */
  static createStandardHeaders(
    includeAuth: boolean = false, 
    token?: string,
    contentType: string = 'application/json'
  ): Record<string, string> {
    console.warn('HttpUtil.createStandardHeaders is deprecated. Use createStandardHeadersWithRequestId instead.');
    // Create base headers
    const headers: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*',
    };

    // Set Content-Type if provided
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    // Add Auth token if needed
    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add User-Agent from config if available
    if (apiConfig.headers?.userAgent) {
      headers['User-Agent'] = apiConfig.headers.userAgent;
    }

    // X-Request-ID will be set by the calling service to ensure 
    // the same ID is used for both header and logging

    return headers;
  }

  /**
   * Create fetch options with standard settings for all HTTP requests
   *
   * @param method HTTP method to use
   * @param headers Headers object
   * @param body Optional request body
   * @returns RequestInit object for fetch
   */
  static createRequestOptions(
    method: string = 'GET',
    headers: Record<string, string>,
    body?: string
  ): RequestInit {
    const options: RequestInit = {
      method,
      headers,
      redirect: 'manual', // NEVER follow redirects automatically
    };

    if (body) {
      options.body = body;
    }

    return options;
  }

  /**
   * Generate a curl command for debugging API requests
   * 
   * @param url The URL being requested
   * @param options The fetch options
   * @param redactAuth Whether to redact the auth token (default: true)
   * @returns A curl command string for debugging
   */
  static generateCurlCommand(
    url: string,
    options: RequestInit,
    redactAuth: boolean = true
  ): string {
    let curlHeaders = '';
    const headers = options.headers as Record<string, string>;
    
    // Add all headers
    Object.entries(headers).forEach(([key, value]) => {
      if (redactAuth && key === 'Authorization') {
        // Redact the auth token
        curlHeaders += ` -H "${key}: Bearer YOUR_TOKEN_HERE"`;
      } else {
        curlHeaders += ` -H "${key}: ${value}"`;
      }
    });
    
    // Create curl command with options
    let curlCommand = `curl -v "${url}"${curlHeaders}`;
    
    // Add method if not GET
    if (options.method !== 'GET') {
      curlCommand += ` -X ${options.method}`;
    }
    
    // Add body data if present
    if (options.body) {
      curlCommand += ` -d '${options.body.toString().replace(/'/g, "'\\''")}'`;
    }
    
    return curlCommand;
  }

  /**
   * Log request details with consistent formatting
   * 
   * @param requestId Unique ID for the request
   * @param url URL being requested
   * @param method HTTP method
   * @param headers Headers (will be redacted for sensitive info)
   * @param body Optional request body 
   */
  static logRequest(
    requestId: string,
    prefix: string,
    url: string,
    method: string,
    headers: Record<string, string>,
    body?: string
  ): void {
    console.log(`[${prefix}:${requestId}] Request URL: ${url}`);
    console.log(`[${prefix}:${requestId}] Request method: ${method}`);
    
    // Clone headers for logging but redact sensitive information
    const loggableHeaders = { ...headers };
    if (loggableHeaders['Authorization']) {
      // Replace actual token with placeholder text to avoid security scanning false positives
      const authType = loggableHeaders['Authorization'].split(' ')[0] || 'Bearer';
      loggableHeaders['Authorization'] = `${authType} [REDACTED_FOR_SECURITY]`;
    }
    
    console.log(`[${prefix}:${requestId}] Request headers:`, JSON.stringify(loggableHeaders, null, 2));
    
    if (body) {
      const maxLength = apiConfig.logging?.maxBodyLogLength || 500;
      console.log(`[${prefix}:${requestId}] Request body (first ${maxLength} chars): ${body.substring(0, maxLength)}`);
    }
  }

  /**
   * Log response details with consistent formatting
   * 
   * @param requestId Unique ID for the request
   * @param prefix Log prefix identifier (e.g., 'API', 'OIDC')
   * @param response Fetch response object
   * @param duration Time taken for the request in ms
   */
  static async logResponse(
    requestId: string,
    prefix: string,
    response: Response,
    duration: number
  ): Promise<void> {
    console.log(`[${prefix}:${requestId}] Response received in ${duration}ms`);
    console.log(`[${prefix}:${requestId}] Response status: ${response.status} ${response.statusText}`);
    
    // Check if server returned same request ID (for correlation)
    const responseRequestId = response.headers.get('x-request-id');
    if (responseRequestId) {
      if (responseRequestId === requestId) {
        console.log(`[${prefix}:${requestId}] Server returned matching X-Request-ID`);
      } else {
        console.log(`[${prefix}:${requestId}] Server returned different X-Request-ID: ${responseRequestId}`);
      }
    }
    
    // Only log detailed headers if debug logging is enabled
    if (apiConfig.logging?.enableDebugLogging) {
      // Log all response headers
      const headerEntries = Array.from(response.headers.entries());
      console.log(`[${prefix}:${requestId}] Response headers:`, JSON.stringify(Object.fromEntries(headerEntries), null, 2));
      
      // Log response body if debug logging is enabled
      // Clone the response first because reading the body is a one-time operation
      try {
        const clonedResponse = response.clone();
        const contentType = response.headers.get('content-type') || '';
        const maxLength = apiConfig.logging?.maxBodyLogLength || 1000;
        
        if (contentType.includes('application/json')) {
          const responseJson = await clonedResponse.json();
          console.log(`[${prefix}:${requestId}] Response body (JSON):`, 
            JSON.stringify(responseJson, null, 2).substring(0, maxLength));
          
          if (JSON.stringify(responseJson).length > maxLength) {
            console.log(`[${prefix}:${requestId}] Response body truncated (${JSON.stringify(responseJson).length} chars total)`);
          }
        } else if (contentType.includes('text/')) {
          const responseText = await clonedResponse.text();
          console.log(`[${prefix}:${requestId}] Response body (text, first ${maxLength} chars): ${responseText.substring(0, maxLength)}`);
          
          if (responseText.length > maxLength) {
            console.log(`[${prefix}:${requestId}] Response body truncated (${responseText.length} chars total)`);
          }
        } else {
          console.log(`[${prefix}:${requestId}] Response body not logged (content-type: ${contentType})`);
        }
      } catch (error) {
        console.log(`[${prefix}:${requestId}] Could not log response body: ${error.message}`);
      }
    }
  }

  /**
   * Perform a request with standardized logging for both request and response
   * 
   * @param url URL to request
   * @param method HTTP method to use
   * @param options Additional options:
   *   - prefix: Log prefix identifier (e.g., 'API', 'Auth')
   *   - headers: Additional headers to include
   *   - token: Authorization token (if needed)
   *   - body: Request body (if needed)
   *   - contentType: Content type (defaults to 'application/json')
   * @returns Response object from fetch
   */
  static async performRequest(
    url: string,
    method: string = 'GET',
    options: {
      prefix: string;
      headers?: Record<string, string>;
      token?: string;
      body?: any;
      contentType?: string;
    }
  ): Promise<Response> {
    const {
      prefix,
      headers: additionalHeaders = {},
      token,
      body,
      contentType = 'application/json'
    } = options;

    // Generate a request ID for tracking
    const requestId = this.generateUuid();
    
    // Set up headers with request ID
    const needsAuth = !!token;
    const baseHeaders = this.createStandardHeadersWithRequestId(
      requestId,
      needsAuth,
      token,
      contentType
    );
    
    // Merge with additional headers
    const headers = {
      ...baseHeaders,
      ...additionalHeaders
    };
    
    // Prepare request body if needed
    let bodyContent: string | undefined;
    
    if (body) {
      if (contentType === 'application/json') {
        bodyContent = JSON.stringify(body);
      } else if (contentType === 'application/x-www-form-urlencoded') {
        if (typeof body === 'object') {
          // Convert object to URL params
          const params = new URLSearchParams();
          Object.entries(body).forEach(([key, value]) => {
            params.append(key, String(value));
          });
          bodyContent = params.toString();
        } else {
          bodyContent = String(body);
        }
      } else {
        // For other content types, just stringify
        bodyContent = String(body);
      }
    }
    
    // Create fetch options
    const fetchOptions = this.createRequestOptions(method, headers, bodyContent);
    
    // Log request details
    this.logRequest(requestId, prefix, url, method, headers, bodyContent);
    
    // Generate curl command for debugging if enabled in config
    if (apiConfig.logging?.generateCurlCommands) {
      const curlCommand = this.generateCurlCommand(url, fetchOptions);
      console.log(`[${prefix}:${requestId}] Equivalent curl command for debugging:\n${curlCommand}`);
    }
    
    // Perform the actual request
    const startTime = Date.now();
    let response: Response;
    
    try {
      response = await fetch(url, fetchOptions);
    } catch (error) {
      console.error(`[${prefix}:${requestId}] Request failed: ${error.message}`);
      console.error(`[${prefix}:${requestId}] Error details:`, error);
      throw error;
    }
    
    const duration = Date.now() - startTime;
    
    // Log response details
    await this.logResponse(requestId, prefix, response, duration);
    
    return response;
  }
}