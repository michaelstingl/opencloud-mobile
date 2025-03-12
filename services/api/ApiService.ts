import { authConfig, apiConfig } from '../../config/app.config';
import { HttpUtil } from './HttpUtil';

/**
 * Types for API responses
 */
export interface User {
  id: string;
  displayName: string;
  mail: string;
  givenName?: string;
  surname?: string;
  userType?: string;
  accountEnabled?: boolean;
  preferredLanguage?: string;
}

export interface Drive {
  id: string;
  name: string;
  driveType: 'personal' | 'project' | 'virtual' | 'share';
  driveAlias?: string;
  description?: string;
  webUrl?: string;
  quota?: {
    total: number;
    used: number;
    remaining: number;
    state: string;
  };
}

export interface DrivesResponse {
  value: Drive[];
  '@odata.nextLink'?: string;
}

/**
 * Service for API interactions
 */
export class ApiService {
  private static accessToken: string | null = null;
  private static baseUrl: string | null = null;
  // For development testing purposes
  private static useMockData: boolean = false; // Set to false to use real API data
  private static mockDataLoadedOnce: boolean = false; // To prevent multiple loads

  /**
   * Set the authentication token and base URL
   */
  static setCredentials(accessToken: string, baseUrl: string): void {
    this.accessToken = accessToken;
    this.baseUrl = baseUrl;
    this.useMockData = false; // Default to real data mode
    console.log("[API] Credentials set for real API mode");
    console.log("[API] Base URL:", baseUrl);
    console.log("[API] Token available:", !!accessToken);
  }
  
  /**
   * Enable mock data mode for testing
   */
  static enableMockDataMode(mockToken: string, mockBaseUrl: string): void {
    this.accessToken = mockToken;
    this.baseUrl = mockBaseUrl;
    this.useMockData = true; // Explicitly enable mock data
    this.mockDataLoadedOnce = false; // Reset this flag to get fresh logs
    console.log("[API] MOCK DATA MODE ENABLED");
    console.log("[API] Mock base URL:", mockBaseUrl);
  }

  /**
   * Check if user is authenticated with valid token
   */
  static isAuthenticated(): boolean {
    return !!this.accessToken && !!this.baseUrl;
  }

  /**
   * Perform an authenticated API request
   */
  private static async request<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    data?: any
  ): Promise<T> {
    // Generate unique request ID using UUID v4 format for tracing
    const requestId = this.generateUuid();
    
    // Check if credentials are set
    if (!this.accessToken || !this.baseUrl) {
      console.error(`[API:${requestId}] API service not initialized with credentials`);
      throw new Error('API service not initialized with credentials');
    }
    
    // Log real API requests to help debug
    console.log(`[API:${requestId}] ${method} ${endpoint}`);
    console.log(`[API:${requestId}] Using base URL: ${this.baseUrl}`);
    console.log(`[API:${requestId}] Auth token available: ${!!this.accessToken}`);
    console.log(`[API:${requestId}] Using mock data: ${this.useMockData}`);
    

    // For development testing - return mock data if enabled
    if (this.useMockData) {
      // Log only the first time for any endpoint
      if (!this.mockDataLoadedOnce) {
        console.log(`[MOCK:${requestId}] First data request: ${method} ${endpoint}`);
        this.mockDataLoadedOnce = true;
      }
      
      // Create stable mock data that won't change between requests
      const mockUser = {
        id: "user123",
        displayName: "Max Mustermann",
        mail: "max@example.com",
        userType: "Member",
        givenName: "Max",
        surname: "Mustermann",
        accountEnabled: true,
        preferredLanguage: "de"
      };
      
      // Mock drives data
      const mockDrives = {
        value: [
          {
            id: "drive1",
            name: "Personal",
            driveType: "personal",
            webUrl: "https://example.com/personal",
            description: "Your personal files",
            quota: {
              total: 1073741824, // 1GB
              used: 536870912,   // 512MB
              remaining: 536870912,
              state: "normal"
            }
          },
          {
            id: "drive2",
            name: "Project X",
            driveType: "project",
            webUrl: "https://example.com/projectx",
            description: "Shared project workspace"
          },
          {
            id: "drive3",
            name: "Team Share",
            driveType: "share",
            webUrl: "https://example.com/team"
          }
        ]
      };
      
      // Return appropriate mock data based on endpoint
      if (endpoint === '/v1.0/me') {
        return mockUser as unknown as T;
      } else if (endpoint === '/v1.0/me/drives') {
        return mockDrives as unknown as T;
      } else if (endpoint === '/v1.0/me/drive') {
        return mockDrives.value[0] as unknown as T;
      }
      
      // Default mock response
      return {} as T;
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    // Create standard headers using the shared utility with our requestId
    const headers = HttpUtil.createStandardHeadersWithRequestId(
      requestId,
      true, 
      this.accessToken
    );
    
    // Create request body if data is provided
    const body = data ? JSON.stringify(data) : undefined;
    
    // Create request options using the shared utility
    const options = HttpUtil.createRequestOptions(method, headers, body);

    // Log request details using the shared utility
    HttpUtil.logRequest(requestId, 'API', url, method, headers, body);
    
    // Generate curl command for debugging if enabled in config
    if (apiConfig.logging?.generateCurlCommands) {
      const curlCommand = HttpUtil.generateCurlCommand(url, options);
      console.log(`[API:${requestId}] Equivalent curl command for debugging:\n${curlCommand}`);
    }
    
    const startTime = Date.now();
    const startTimeISO = new Date().toISOString();
    console.log(`[API:${requestId}] Request started at: ${startTimeISO}`);
    
    try {
      // Execute request
      const response = await fetch(url, options);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Log response details using the shared utility
      await HttpUtil.logResponse(requestId, 'API', response, duration);
      
      // Additional API-specific logging
      const serverTiming = response.headers.get('server-timing');
      if (serverTiming) {
        console.log(`[API:${requestId}] Server timing: ${serverTiming}`);
      }
      
      // Clone response for reading both text and JSON
      const responseClone = response.clone();
      
      if (!response.ok) {
        // Try to get the response body to better understand the error
        const errorBody = await responseClone.text();
        console.error(`[API:${requestId}] Error response body (first 500 chars): ${errorBody.substring(0, 500)}`);
        
        // Try to parse as JSON to get detailed error message if available
        try {
          const errorJson = JSON.parse(errorBody);
          if (errorJson.error) {
            console.error(`[API:${requestId}] Server error details:`, JSON.stringify(errorJson.error, null, 2));
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorJson.error.message || 'Unknown error'}`);
          }
        } catch (parseError) {
          // If can't parse JSON, just throw generic error with status
        }
        
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      // Check content type to avoid parsing errors
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        console.log(`[API:${requestId}] Response JSON structure:`, Object.keys(jsonData));
        return jsonData;
      } else {
        // If not JSON, log the issue and return the raw text
        const textResponse = await responseClone.text();
        console.error(`[API:${requestId}] Expected JSON but got ${contentType}`);
        console.error(`[API:${requestId}] Response text (first 500 chars): ${textResponse.substring(0, 500)}`);
        
        // Try to parse as JSON anyway, but in a try/catch
        try {
          return JSON.parse(textResponse);
        } catch (error) {
          console.error(`[API:${requestId}] Failed to parse response as JSON: ${error.message}`);
          throw new Error(`API response is not valid JSON: ${error.message}`);
        }
      }
    } catch (error) {
      // Log network errors or fetch errors
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.error(`[API:${requestId}] Request failed after ${duration}ms: ${error.message}`);
      
      if (error.name === 'AbortError') {
        console.error(`[API:${requestId}] Request timed out`);
      } else if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        console.error(`[API:${requestId}] Network connection error`);
      }
      
      // Rethrow for caller to handle
      throw error;
    }
  }

  /**
   * Get current user information
   */
  static async getCurrentUser(): Promise<User> {
    // Generate operation ID for tracing
    const operationId = this.generateUuid();
    
    try {
      console.log(`[API:${operationId}] Getting current user info`);
      
      // Try the graph endpoint first (matches web app)
      try {
        console.log(`[API:${operationId}] Trying graph endpoint: /graph/v1.0/me`);
        return this.request<User>('/graph/v1.0/me?$expand=memberOf');
      } catch (graphError) {
        console.error(`[API:${operationId}] Graph endpoint failed:`, graphError.message);
        
        // Fallback to regular endpoint
        console.log(`[API:${operationId}] Falling back to regular endpoint: /v1.0/me`);
        return this.request<User>('/v1.0/me');
      }
    } catch (error) {
      console.error(`[API:${operationId}] Failed to get user info:`, error.message);
      console.error(`[API:${operationId}] Error stack:`, error.stack);
      
      // FALLBACK: If this fails and we're in development, return mock data
      if (this.useMockData) {
        console.log(`[API:${operationId}] Falling back to mock user data after API error`);
        return {
          id: "fallback-user-after-error",
          displayName: "Error Recovery User",
          mail: "error-recovery@example.com",
          userType: "Member",
        };
      }
      
      throw error;
    }
  }

  /**
   * Get list of user drives/spaces
   */
  static async getUserDrives(): Promise<DrivesResponse> {
    // Generate operation ID for tracing
    const operationId = this.generateUuid();
    
    try {
      console.log(`[API:${operationId}] Getting user drives`);
      
      // Try graph endpoint first (to match web app)
      try {
        console.log(`[API:${operationId}] Trying graph endpoint: /graph/v1.0/me/drives`);
        return this.request<DrivesResponse>('/graph/v1.0/me/drives');
      } catch (graphError) {
        console.error(`[API:${operationId}] Graph endpoint failed:`, graphError.message);
        
        // Fallback to regular endpoint
        console.log(`[API:${operationId}] Falling back to regular endpoint: /v1.0/me/drives`);
        return this.request<DrivesResponse>('/v1.0/me/drives');
      }
    } catch (error) {
      console.error(`[API:${operationId}] Failed to get user drives:`, error.message);
      console.error(`[API:${operationId}] Error stack:`, error.stack);
      
      // FALLBACK: If this fails and we're in development, return mock data
      if (this.useMockData) {
        console.log(`[API:${operationId}] Falling back to mock drives data after API error`);
        return {
          value: [
            {
              id: "fallback-drive-after-error",
              name: "Error Recovery Drive",
              driveType: "personal",
              description: "Created after API error"
            }
          ]
        };
      }
      
      throw error;
    }
  }

  /**
   * Get personal drive details
   */
  static async getPersonalDrive(): Promise<Drive> {
    // Generate operation ID for tracing
    const operationId = this.generateUuid();
    
    try {
      console.log(`[API:${operationId}] Getting personal drive`);
      
      // Try graph endpoint first (to match web app)
      try {
        console.log(`[API:${operationId}] Trying graph endpoint: /graph/v1.0/me/drive`);
        return this.request<Drive>('/graph/v1.0/me/drive');
      } catch (graphError) {
        console.error(`[API:${operationId}] Graph endpoint failed:`, graphError.message);
        
        // Fallback to regular endpoint
        console.log(`[API:${operationId}] Falling back to regular endpoint: /v1.0/me/drive`);
        return this.request<Drive>('/v1.0/me/drive');
      }
    } catch (error) {
      console.error(`[API:${operationId}] Failed to get personal drive:`, error.message);
      console.error(`[API:${operationId}] Error stack:`, error.stack);
      
      // FALLBACK: If this fails and we're in development, return mock data
      if (this.useMockData) {
        console.log(`[API:${operationId}] Falling back to mock personal drive data after API error`);
        return {
          id: "personal-drive-fallback",
          name: "Personal Drive",
          driveType: "personal",
          description: "Fallback drive after API error"
        };
      }
      
      throw error;
    }
  }
  
  /**
   * Generate a UUID v4 for request correlation
   * Used for X-Request-ID header to enable tracing through systems
   * @returns A UUID v4 string
   */
  private static generateUuid(): string {
    // Import and use the shared utility function
    return HttpUtil.generateUuid();
  }
}