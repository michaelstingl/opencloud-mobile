import { ApiService, ApiError } from "../ApiService";
import { HttpUtil } from "../HttpUtil";

// Mock dependencies
jest.mock("../HttpUtil");

describe("ApiService", () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the ApiService state with example test credentials
    ApiService.setCredentials("https://test-server.com", "EXAMPLE_TEST_TOKEN");
  });
  
  describe("handleApiResponse", () => {
    it("should not throw error for successful responses", () => {
      // Arrange
      const response = {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers()
      } as Response;
      
      // Act & Assert - accessing private method for testing
      expect(() => {
        (ApiService as any).handleApiResponse(response, "Test operation");
      }).not.toThrow();
    });
    
    it("should throw ApiError with request ID for failed responses", () => {
      // Arrange
      const response = {
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Headers({
          "x-request-id": "test-request-id-123"
        })
      } as Response;
      
      // Act & Assert
      try {
        (ApiService as any).handleApiResponse(response, "Test operation");
        fail("Expected error was not thrown");
      } catch (error) {
        // Check that the error is an ApiError with the correct properties
        expect(error).toBeInstanceOf(Error);
        expect((error as ApiError).requestId).toBe("test-request-id-123");
        expect(error.message).toBe("Test operation: 404 Not Found");
      }
    });
    
    it("should use 'unknown' as fallback when request ID is missing", () => {
      // Arrange
      const response = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Headers() // No request ID header
      } as Response;
      
      // Act & Assert
      try {
        (ApiService as any).handleApiResponse(response, "Test operation");
        fail("Expected error was not thrown");
      } catch (error) {
        // Check that the error has a fallback request ID
        expect((error as ApiError).requestId).toBe("unknown");
      }
    });
  });
  
  describe("getCurrentUser", () => {
    it("should return mock user in mock mode", async () => {
      // Arrange
      ApiService.enableMockDataMode("EXAMPLE_TEST_TOKEN", "https://mock-server.com");
      jest.spyOn(HttpUtil, "logMockRequest").mockImplementation(() => {});
      
      // Act
      const result = await ApiService.getCurrentUser();
      
      // Assert
      expect(result.displayName).toBe("Mock User");
      expect(HttpUtil.logMockRequest).toHaveBeenCalled();
    });
    
    it("should throw authentication error when not authenticated", async () => {
      // Arrange - set credentials to null
      (ApiService as any).token = null;
      
      // Act & Assert
      await expect(ApiService.getCurrentUser()).rejects.toThrow("Not authenticated");
    });
    
    it("should handle successful API responses", async () => {
      // Arrange
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: "user-123",
          displayName: "Test User",
          mail: "test@example.com",
          userType: "Member"
        }),
        headers: new Headers()
      } as unknown as Response;
      
      (HttpUtil.performRequest as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act
      const result = await ApiService.getCurrentUser();
      
      // Assert
      expect(result.id).toBe("user-123");
      expect(result.displayName).toBe("Test User");
      expect(HttpUtil.performRequest).toHaveBeenCalledWith(
        "https://test-server.com/graph/v1.0/me?$expand=memberOf",
        "GET",
        expect.objectContaining({
          prefix: "API",
          token: "EXAMPLE_TEST_TOKEN"
        })
      );
    });
    
    it("should throw ApiError with request ID on API failure", async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        headers: new Headers({
          "x-request-id": "error-request-id-456"
        })
      } as Response;
      
      (HttpUtil.performRequest as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act & Assert
      try {
        await ApiService.getCurrentUser();
        fail("Expected error was not thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as ApiError).requestId).toBe("error-request-id-456");
        expect(error.message).toBe("Failed to get user info: 401 Unauthorized");
      }
    });
  });
  
  describe("getUserDrives", () => {
    it("should throw ApiError with request ID on API failure", async () => {
      // Arrange
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: "Forbidden",
        headers: new Headers({
          "x-request-id": "drives-error-789"
        })
      } as Response;
      
      (HttpUtil.performRequest as jest.Mock).mockResolvedValue(mockResponse);
      
      // Act & Assert
      try {
        await ApiService.getUserDrives();
        fail("Expected error was not thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as ApiError).requestId).toBe("drives-error-789");
        expect(error.message).toBe("Failed to get drives: 403 Forbidden");
      }
    });
  });
});