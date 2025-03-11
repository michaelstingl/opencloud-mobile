import { AuthService } from "../AuthService";
import { OidcService } from "../OidcService";
import { authConfig } from "../../config/app.config";
import { OpenIDConfiguration } from "../../types/oidc";

// Mock dependencies
jest.mock("../OidcService");
jest.mock("../../config/app.config", () => ({
  authConfig: {
    clientId: "MockClientId",
    redirectUri: "oc://mock.redirect",
    defaultScopes: "openid profile email",
  },
}));

global.fetch = jest.fn();
console.error = jest.fn();

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("normalizeServerUrl", () => {
    it("should add https:// prefix if missing", () => {
      // Act
      const result = AuthService.normalizeServerUrl("example.com");

      // Assert
      expect(result.url).toBe("https://example.com");
      expect(result.isInsecure).toBe(false);
    });

    it("should mark http:// URLs as insecure", () => {
      // Act
      const result = AuthService.normalizeServerUrl("http://example.com");

      // Assert
      expect(result.url).toBe("http://example.com");
      expect(result.isInsecure).toBe(true);
    });

    it("should keep https:// prefix and mark as secure", () => {
      // Act
      const result = AuthService.normalizeServerUrl("https://example.com");

      // Assert
      expect(result.url).toBe("https://example.com");
      expect(result.isInsecure).toBe(false);
    });

    it("should remove trailing slash", () => {
      // Act
      const result = AuthService.normalizeServerUrl("https://example.com/");

      // Assert
      expect(result.url).toBe("https://example.com");
      expect(result.isInsecure).toBe(false);
    });

    it("should trim whitespace", () => {
      // Act
      const result = AuthService.normalizeServerUrl("  example.com  ");

      // Assert
      expect(result.url).toBe("https://example.com");
      expect(result.isInsecure).toBe(false);
    });
  });

  describe("initialize", () => {
    const mockConfig: OpenIDConfiguration = {
      issuer: "https://example.com/auth",
      authorization_endpoint: "https://example.com/auth/authorize",
      token_endpoint: "https://example.com/auth/token",
      jwks_uri: "https://example.com/auth/jwks",
      response_types_supported: ["code"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
    };

    it("should successfully initialize with valid server", async () => {
      // Arrange
      (OidcService.discoverConfiguration as jest.Mock).mockResolvedValueOnce(
        mockConfig,
      );

      // Act
      const result = await AuthService.initialize("https://example.com");

      // Assert
      expect(result.success).toBe(true);
      expect(result.insecureWarning).toBe(false);
      expect(OidcService.discoverConfiguration).toHaveBeenCalledWith(
        "https://example.com",
        "acct:opencloud@example.com",
      );
    });

    it("should return insecure warning for http URLs", async () => {
      // Arrange
      (OidcService.discoverConfiguration as jest.Mock).mockResolvedValueOnce(
        mockConfig,
      );

      // Act
      const result = await AuthService.initialize("http://example.com");

      // Assert
      expect(result.success).toBe(true);
      expect(result.insecureWarning).toBe(true);
    });

    it("should handle discovery errors", async () => {
      // Arrange
      (OidcService.discoverConfiguration as jest.Mock).mockRejectedValueOnce(
        new Error("Discovery failed"),
      );

      // Act
      const result = await AuthService.initialize("https://example.com");

      // Assert
      expect(result.success).toBe(false);
      expect(result.insecureWarning).toBe(false);
    });
  });

  describe("getAuthorizationUrl", () => {
    const mockConfig: OpenIDConfiguration = {
      issuer: "https://example.com/auth",
      authorization_endpoint: "https://example.com/auth/authorize",
      token_endpoint: "https://example.com/auth/token",
      jwks_uri: "https://example.com/auth/jwks",
      response_types_supported: ["code"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
    };

    it("should return null if not initialized", () => {
      // Act
      const url = AuthService.getAuthorizationUrl();

      // Assert
      expect(url).toBeNull();
    });

    it("should generate authorization URL with configured values", async () => {
      // Arrange
      (OidcService.discoverConfiguration as jest.Mock).mockResolvedValueOnce(
        mockConfig,
      );
      (OidcService.generateAuthorizationUrl as jest.Mock).mockReturnValueOnce(
        "https://example.com/auth/authorize?client_id=MockClientId",
      );

      // Initialize the service first
      await AuthService.initialize("https://example.com");

      // Act
      AuthService.getAuthorizationUrl();

      // Assert
      expect(OidcService.generateAuthorizationUrl).toHaveBeenCalledWith(
        mockConfig,
        authConfig.clientId,
        authConfig.redirectUri,
        authConfig.defaultScopes,
        expect.any(String), // State parameter
      );
    });
  });

  describe("exchangeCodeForTokens", () => {
    const mockConfig: OpenIDConfiguration = {
      issuer: "https://example.com/auth",
      authorization_endpoint: "https://example.com/auth/authorize",
      token_endpoint: "https://example.com/auth/token",
      jwks_uri: "https://example.com/auth/jwks",
      response_types_supported: ["code"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
    };

    const mockTokenResponse = {
      access_token: "access-token-value",
      refresh_token: "refresh-token-value",
      id_token: "id-token-value",
      token_type: "Bearer",
      expires_in: 3600,
    };

    it("should throw error if not initialized", async () => {
      // Make sure the service is not initialized
      (AuthService as any).oidcConfig = null;

      // Act & Assert
      await expect(
        AuthService.exchangeCodeForTokens("auth-code"),
      ).rejects.toThrow("Auth service not initialized");
    });

    it("should exchange code for tokens", async () => {
      // Arrange
      (OidcService.discoverConfiguration as jest.Mock).mockResolvedValueOnce(
        mockConfig,
      );

      // Initialize the service first
      await AuthService.initialize("https://example.com");

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTokenResponse,
      });

      // Act
      const result = await AuthService.exchangeCodeForTokens("auth-code");

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/auth/token",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/x-www-form-urlencoded",
          }),
          body: expect.stringContaining("code=auth-code"),
        }),
      );
      expect(result).toEqual(mockTokenResponse);
    });

    it("should throw error on token exchange failure", async () => {
      // Arrange
      (OidcService.discoverConfiguration as jest.Mock).mockResolvedValueOnce(
        mockConfig,
      );

      // Initialize the service first
      await AuthService.initialize("https://example.com");

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: "Bad Request",
      });

      // Act & Assert
      await expect(
        AuthService.exchangeCodeForTokens("auth-code"),
      ).rejects.toThrow("Token exchange failed: Bad Request");
    });
  });
});
