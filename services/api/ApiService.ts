// Basic ApiService mock for testing
import { HttpUtil } from './HttpUtil';

// Define types used in the API
export interface User {
  id: string;
  displayName: string;
  mail: string;
  userType: string;
}

export interface Drive {
  id: string;
  name: string;
  driveType: string;
  description?: string;
  quota?: {
    used: number;
    total: number;
  };
}

export interface DrivesResponse {
  value: Drive[];
}

export class ApiService {
  private static serverUrl: string | null = null;
  private static token: string | null = null;
  private static mockMode = false;
  
  /**
   * Set credentials for API communications
   * 
   * @param serverUrl The base server URL
   * @param token The auth token to use
   */
  static setCredentials(serverUrl: string, token: string): void {
    this.serverUrl = serverUrl;
    this.token = token;
    this.mockMode = false;
    
    console.log('[API] Credentials set for real API mode');
    console.log('[API] Base URL:', serverUrl);
    console.log('[API] Token available:', !!token);
  }
  
  /**
   * Enable mock data mode for testing
   * 
   * @param mockToken A mock token string
   * @param mockServerUrl A mock server URL
   */
  static enableMockDataMode(mockToken: string, mockServerUrl: string): void {
    this.serverUrl = mockServerUrl;
    this.token = mockToken;
    this.mockMode = true;
    
    console.log('[API] Mock data mode enabled');
    console.log('[API] Mock URL:', mockServerUrl);
  }
  
  /**
   * Check if service is initialized with credentials
   */
  static isInitialized(): boolean {
    return !!this.serverUrl && !!this.token;
  }
  
  /**
   * Check if service is authenticated (alias for isInitialized for better semantics)
   */
  static isAuthenticated(): boolean {
    return this.isInitialized();
  }
  
  /**
   * Check if service is in mock mode
   */
  static isMockMode(): boolean {
    return this.mockMode;
  }
  
  /**
   * Get the configured server URL
   */
  static getServerUrl(): string | null {
    return this.serverUrl;
  }
  
  /**
   * Get the configured token
   */
  static getToken(): string | null {
    return this.token;
  }
  
  /**
   * Get the current user information
   * @returns Promise resolving to User object
   */
  static async getCurrentUser(): Promise<User> {
    if (this.mockMode) {
      // Return mock data
      return {
        id: "mock-user-id",
        displayName: "Mock User",
        mail: "mockuser@example.com",
        userType: "Member"
      };
    }
    
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }
    
    try {
      const url = `${this.serverUrl}/graph/v1.0/me?$expand=memberOf`;
      
      // Use the unified request method with standardized logging
      const response = await HttpUtil.performRequest(url, 'GET', {
        prefix: 'API',
        token: this.token
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[API] Error getting current user:', error);
      throw error;
    }
  }
  
  /**
   * Get drives/spaces for the current user
   * @returns Promise resolving to a DrivesResponse object
   */
  static async getUserDrives(): Promise<DrivesResponse> {
    if (this.mockMode) {
      // Return mock data
      return {
        value: [
          {
            id: "mock-drive-1",
            name: "Personal Drive",
            driveType: "personal",
            description: "Your personal space",
            quota: {
              used: 2.5 * 1024 * 1024 * 1024, // 2.5 GB
              total: 10 * 1024 * 1024 * 1024  // 10 GB
            }
          },
          {
            id: "mock-drive-2",
            name: "Project X",
            driveType: "project",
            description: "Shared project space",
            quota: {
              used: 7.2 * 1024 * 1024 * 1024, // 7.2 GB
              total: 50 * 1024 * 1024 * 1024  // 50 GB
            }
          }
        ]
      };
    }
    
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }
    
    try {
      const url = `${this.serverUrl}/graph/v1.0/drives`;
      
      // Use the unified request method with standardized logging
      const response = await HttpUtil.performRequest(url, 'GET', {
        prefix: 'API',
        token: this.token
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get drives: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[API] Error getting user drives:', error);
      throw error;
    }
  }
}