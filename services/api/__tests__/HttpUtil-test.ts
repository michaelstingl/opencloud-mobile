import { HttpUtil } from "../HttpUtil";
import { apiConfig } from "../../../config/app.config";

// Mock apiConfig
jest.mock("../../../config/app.config", () => ({
  apiConfig: {
    headers: {
      userAgent: "TestAgent/1.0.0",
      useRequestId: true,
    },
    logging: {
      enableDebugLogging: false,
    },
  },
}));

describe("HttpUtil", () => {
  describe("generateUuid", () => {
    it("should generate UUID in correct format", () => {
      // Act
      const uuid = HttpUtil.generateUuid();
      
      // Assert
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
    
    it("should generate unique UUIDs on each call", () => {
      // Act
      const uuid1 = HttpUtil.generateUuid();
      const uuid2 = HttpUtil.generateUuid();
      
      // Assert
      expect(uuid1).not.toEqual(uuid2);
    });
  });
  
  describe("createStandardHeadersWithRequestId", () => {
    it("should create headers with request ID", () => {
      // Arrange
      const requestId = "test-uuid-123";
      
      // Act
      const headers = HttpUtil.createStandardHeadersWithRequestId(requestId);
      
      // Assert
      expect(headers["X-Request-ID"]).toBe(requestId);
      expect(headers["Accept"]).toBe("application/json, text/plain, */*");
      expect(headers["Content-Type"]).toBe("application/json");
      expect(headers["User-Agent"]).toBe("TestAgent/1.0.0");
    });
    
    it("should include auth token when specified", () => {
      // Arrange
      const requestId = "test-uuid-123";
      const token = "test-token-456";
      
      // Act
      const headers = HttpUtil.createStandardHeadersWithRequestId(
        requestId,
        true,
        token
      );
      
      // Assert
      expect(headers["Authorization"]).toBe("Bearer test-token-456");
    });
    
    it("should use custom content type when specified", () => {
      // Arrange
      const requestId = "test-uuid-123";
      const contentType = "application/x-www-form-urlencoded";
      
      // Act
      const headers = HttpUtil.createStandardHeadersWithRequestId(
        requestId,
        false,
        undefined,
        contentType
      );
      
      // Assert
      expect(headers["Content-Type"]).toBe("application/x-www-form-urlencoded");
    });
  });
  
  describe("createStandardHeaders", () => {
    beforeEach(() => {
      jest.spyOn(console, "warn").mockImplementation(() => {});
    });
    
    afterEach(() => {
      jest.restoreAllMocks();
    });
    
    it("should log a deprecation warning", () => {
      // Act
      HttpUtil.createStandardHeaders();
      
      // Assert
      expect(console.warn).toHaveBeenCalledWith(
        "HttpUtil.createStandardHeaders is deprecated. Use createStandardHeadersWithRequestId instead."
      );
    });
    
    it("should create headers without request ID", () => {
      // Act
      const headers = HttpUtil.createStandardHeaders();
      
      // Assert
      expect(headers["X-Request-ID"]).toBeUndefined();
    });
  });
  
  describe("createRequestOptions", () => {
    it("should create GET request options", () => {
      // Arrange
      const headers = { "X-Test": "test-value" };
      
      // Act
      const options = HttpUtil.createRequestOptions("GET", headers);
      
      // Assert
      expect(options.method).toBe("GET");
      expect(options.headers).toEqual(headers);
      expect(options.redirect).toBe("manual");
      expect(options.body).toBeUndefined();
    });
    
    it("should include body for POST requests", () => {
      // Arrange
      const headers = { "X-Test": "test-value" };
      const body = JSON.stringify({ test: "data" });
      
      // Act
      const options = HttpUtil.createRequestOptions("POST", headers, body);
      
      // Assert
      expect(options.method).toBe("POST");
      expect(options.body).toBe(body);
    });
  });
  
  describe("generateCurlCommand", () => {
    it("should generate curl command for GET request", () => {
      // Arrange
      const url = "https://example.com/api";
      const options = {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "X-Request-ID": "test-uuid-123"
        }
      };
      
      // Act
      const curl = HttpUtil.generateCurlCommand(url, options);
      
      // Assert
      expect(curl).toContain("curl -v");
      expect(curl).toContain('"https://example.com/api"');
      expect(curl).toContain('-H "Accept: application/json"');
      expect(curl).toContain('-H "X-Request-ID: test-uuid-123"');
      expect(curl).not.toContain("-X GET"); // Default method is omitted
    });
    
    it("should generate curl command for POST request with body", () => {
      // Arrange
      const url = "https://example.com/api";
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": "test-uuid-123"
        },
        body: JSON.stringify({ test: "data" })
      };
      
      // Act
      const curl = HttpUtil.generateCurlCommand(url, options);
      
      // Assert
      expect(curl).toContain("-X POST");
      expect(curl).toContain("-d '{\"test\":\"data\"}'");
    });
    
    it("should redact auth token", () => {
      // Arrange
      const url = "https://example.com/api";
      const options = {
        method: "GET",
        headers: {
          "Authorization": "Bearer secret-token-123",
          "X-Request-ID": "test-uuid-123"
        }
      };
      
      // Act
      const curl = HttpUtil.generateCurlCommand(url, options);
      
      // Assert
      expect(curl).toContain('-H "Authorization: Bearer YOUR_TOKEN_HERE"');
      expect(curl).not.toContain("secret-token-123");
    });
  });
  
  describe("logRequest", () => {
    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation(() => {});
    });
    
    afterEach(() => {
      jest.restoreAllMocks();
    });
    
    it("should log request details", () => {
      // Arrange
      const requestId = "test-uuid-123";
      const prefix = "TEST";
      const url = "https://example.com/api";
      const method = "GET";
      const headers = { "X-Test": "test-value" };
      
      // Act
      HttpUtil.logRequest(requestId, prefix, url, method, headers);
      
      // Assert
      expect(console.log).toHaveBeenCalledWith(`[${prefix}:${requestId}] Request URL: ${url}`);
      expect(console.log).toHaveBeenCalledWith(`[${prefix}:${requestId}] Request method: ${method}`);
      expect(console.log).toHaveBeenCalledWith(`[${prefix}:${requestId}] Request headers:`, expect.any(String));
    });
    
    it("should redact auth token in headers", () => {
      // Arrange
      const requestId = "test-uuid-123";
      const prefix = "TEST";
      const url = "https://example.com/api";
      const method = "GET";
      const headers = { 
        "X-Test": "test-value",
        "Authorization": "Bearer secret-token-123"
      };
      
      // Act
      HttpUtil.logRequest(requestId, prefix, url, method, headers);
      
      // Assert - check that one of the calls has the redacted token
      expect(console.log).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining("Bearer [REDACTED]")
      );
    });
  });
  
  describe("logResponse", () => {
    beforeEach(() => {
      jest.spyOn(console, "log").mockImplementation(() => {});
    });
    
    afterEach(() => {
      jest.restoreAllMocks();
    });
    
    it("should log response details", async () => {
      // Arrange
      const requestId = "test-uuid-123";
      const prefix = "TEST";
      const response = {
        status: 200,
        statusText: "OK",
        headers: new Headers({
          "Content-Type": "application/json",
          "X-Request-ID": "test-uuid-123"
        })
      } as Response;
      const duration = 123;
      
      // Act
      await HttpUtil.logResponse(requestId, prefix, response, duration);
      
      // Assert
      expect(console.log).toHaveBeenCalledWith(`[${prefix}:${requestId}] Response received in ${duration}ms`);
      expect(console.log).toHaveBeenCalledWith(`[${prefix}:${requestId}] Response status: ${response.status} ${response.statusText}`);
    });
    
    it("should check if server returned matching request ID", async () => {
      // Arrange
      const requestId = "test-uuid-123";
      const prefix = "TEST";
      const response = {
        status: 200,
        statusText: "OK",
        headers: new Headers({
          "Content-Type": "application/json",
          "x-request-id": requestId // Same ID
        })
      } as Response;
      const duration = 123;
      
      // Act
      await HttpUtil.logResponse(requestId, prefix, response, duration);
      
      // Assert
      expect(console.log).toHaveBeenCalledWith(`[${prefix}:${requestId}] Server returned matching X-Request-ID`);
    });
    
    it("should check if server returned different request ID", async () => {
      // Arrange
      const requestId = "test-uuid-123";
      const prefix = "TEST";
      const response = {
        status: 200,
        statusText: "OK",
        headers: new Headers({
          "Content-Type": "application/json",
          "x-request-id": "different-uuid-456" // Different ID
        })
      } as Response;
      const duration = 123;
      
      // Act
      await HttpUtil.logResponse(requestId, prefix, response, duration);
      
      // Assert
      expect(console.log).toHaveBeenCalledWith(`[${prefix}:${requestId}] Server returned different X-Request-ID: different-uuid-456`);
    });
    
    it("should log detailed headers when debug logging is enabled", async () => {
      // Arrange
      const requestId = "test-uuid-123";
      const prefix = "TEST";
      const response = {
        status: 200,
        statusText: "OK",
        headers: new Headers({
          "Content-Type": "application/json",
          "X-Test": "test-value"
        })
      } as Response;
      const duration = 123;
      
      // Override the mock to enable debug logging
      (apiConfig.logging as any).enableDebugLogging = true;
      
      // Act
      await HttpUtil.logResponse(requestId, prefix, response, duration);
      
      // Assert
      expect(console.log).toHaveBeenCalledWith(
        `[${prefix}:${requestId}] Response headers:`,
        expect.stringContaining("content-type")
      );
      
      // Reset the mock
      (apiConfig.logging as any).enableDebugLogging = false;
    });
  });
});