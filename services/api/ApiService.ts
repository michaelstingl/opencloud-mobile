// Basic ApiService mock for testing
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
}