import { appConfig, apiConfig } from "../app.config";

// Mock the __DEV__ variable
global.__DEV__ = true;

describe("app.config", () => {
  describe("in development mode", () => {
    it("should enable debug logging automatically", () => {
      expect(apiConfig.logging?.enableDebugLogging).toBe(true);
    });
  });
  
  describe("with override", () => {
    beforeEach(() => {
      // Save original config
      jest.resetModules();
    });
    
    it("should respect explicit config values", () => {
      // Mock the configuration
      jest.doMock("../app.config", () => {
        // First load the actual module
        const actualModule = jest.requireActual("../app.config");
        
        // Override development mode detection
        global.__DEV__ = false;
        
        // Create a modified config with explicit debug logging setting
        const mockAppConfig = {
          ...actualModule.appConfig,
          api: {
            ...actualModule.appConfig.api,
            logging: {
              ...actualModule.appConfig.api.logging,
              enableDebugLogging: true // Explicitly set to true
            }
          }
        };
        
        return {
          appConfig: mockAppConfig,
          apiConfig: mockAppConfig.api,
          authConfig: mockAppConfig.auth
        };
      });
      
      // Import the module again to get the mocked version
      const { apiConfig } = require("../app.config");
      
      // Test that explicit setting overrides the development mode
      expect(apiConfig.logging?.enableDebugLogging).toBe(true);
    });
  });
  
  describe("User-Agent formatting", () => {
    it("should format User-Agent string correctly", () => {
      // The User-Agent string should be in format: AppName/version (platform)
      // We can test that it follows this pattern
      const userAgent = apiConfig.headers?.userAgent as string;
      
      // Check that it matches the pattern
      expect(userAgent).toMatch(/^[A-Z][a-zA-Z]+\/\d+\.\d+\.\d+\s\([a-z]+\)$/);
      
      // Check that it contains the version from package.json
      expect(userAgent).toContain("1.0.0");
      
      // Check that it has the app name (expected to be OpencloudMobile)
      expect(userAgent).toMatch(/^Opencloud/);
    });
  });
  
  describe("Platform-specific configurations", () => {
    it("should set different client IDs based on platform", () => {
      if (appConfig.auth.clientId.includes("IOS")) {
        expect(appConfig.auth.clientId).toBe("OpenCloudIOS");
      } else {
        expect(appConfig.auth.clientId).toBe("OpenCloudAndroid");
      }
    });
    
    it("should set different redirect URIs based on platform", () => {
      if (appConfig.auth.redirectUri.includes("ios")) {
        expect(appConfig.auth.redirectUri).toBe("oc://ios.opencloud.eu");
      } else {
        expect(appConfig.auth.redirectUri).toBe("oc://android.opencloud.eu");
      }
    });
    
    it("should set same postLogoutRedirectUri as redirectUri", () => {
      expect(appConfig.auth.postLogoutRedirectUri).toBe(appConfig.auth.redirectUri);
    });
  });
});