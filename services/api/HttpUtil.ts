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
      loggableHeaders['Authorization'] = 'Bearer [REDACTED]';
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
    }
  }
}