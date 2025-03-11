import { OidcService } from "../OidcService";
import { WebFingerService } from "../WebFingerService";
import { OpenIDConfiguration } from "../../types/oidc";

// Mock fetch, console.error, and WebFingerService
global.fetch = jest.fn();
console.error = jest.fn();
jest.mock("../WebFingerService");

describe("OidcService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchConfiguration", () => {
    it("should fetch OpenID Connect configuration from the correct URL", async () => {
      // Arrange
      const mockConfig: OpenIDConfiguration = {
        issuer: "https://example.com/auth",
        authorization_endpoint: "https://example.com/auth/authorize",
        token_endpoint: "https://example.com/auth/token",
        jwks_uri: "https://example.com/auth/jwks",
        response_types_supported: ["code"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      });

      // Act
      const result = await OidcService.fetchConfiguration(
        "https://example.com/auth",
      );

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/auth/.well-known/openid-configuration",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Accept: "application/json",
          }),
        }),
      );
      expect(result).toEqual(mockConfig);
    });

    it("should handle trailing slash in issuer URL", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      // Act
      await OidcService.fetchConfiguration("https://example.com/auth/");

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/auth/.well-known/openid-configuration",
        expect.anything(),
      );
    });

    it("should throw an error when response is not OK", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: "Not Found",
      });

      // Act & Assert
      await expect(
        OidcService.fetchConfiguration("https://example.com/auth"),
      ).rejects.toThrow("Failed to fetch OIDC configuration: Not Found");
    });
  });

  describe("discoverConfiguration", () => {
    it("should discover configuration using WebFinger and then fetch configuration", async () => {
      // Arrange
      const mockConfig: OpenIDConfiguration = {
        issuer: "https://example.com/auth",
        authorization_endpoint: "https://example.com/auth/authorize",
        token_endpoint: "https://example.com/auth/token",
        jwks_uri: "https://example.com/auth/jwks",
        response_types_supported: ["code"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
      };

      (WebFingerService.discoverOidcIssuer as jest.Mock).mockResolvedValueOnce(
        "https://example.com/auth",
      );

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      });

      // Act
      const result = await OidcService.discoverConfiguration(
        "https://example.com",
        "acct:user@example.com",
      );

      // Assert
      expect(WebFingerService.discoverOidcIssuer).toHaveBeenCalledWith(
        "https://example.com",
        "acct:user@example.com",
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/auth/.well-known/openid-configuration",
        expect.anything(),
      );
      expect(result).toEqual(mockConfig);
    });

    it("should throw error when issuer URL is not found", async () => {
      // Arrange
      (WebFingerService.discoverOidcIssuer as jest.Mock).mockResolvedValueOnce(
        null,
      );

      // Act & Assert
      await expect(
        OidcService.discoverConfiguration(
          "https://example.com",
          "acct:user@example.com",
        ),
      ).rejects.toThrow(
        "OpenID Connect issuer not found in WebFinger response",
      );
    });
  });

  describe("generateAuthorizationUrl", () => {
    it("should generate correct authorization URL with required parameters", () => {
      // Arrange
      const config: OpenIDConfiguration = {
        issuer: "https://example.com/auth",
        authorization_endpoint: "https://example.com/auth/authorize",
        token_endpoint: "https://example.com/auth/token",
        jwks_uri: "https://example.com/auth/jwks",
        response_types_supported: ["code"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
      };

      // Act
      const url = OidcService.generateAuthorizationUrl(
        config,
        "client123",
        "oc://app.example.com",
      );

      // Assert
      expect(url).toContain("https://example.com/auth/authorize?");
      expect(url).toContain("client_id=client123");
      expect(url).toContain("redirect_uri=oc%3A%2F%2Fapp.example.com");
      expect(url).toContain("response_type=code");
      expect(url).toContain("scope=openid+profile+email");
    });

    it("should include state parameter when provided", () => {
      // Arrange
      const config: OpenIDConfiguration = {
        issuer: "https://example.com/auth",
        authorization_endpoint: "https://example.com/auth/authorize",
        token_endpoint: "https://example.com/auth/token",
        jwks_uri: "https://example.com/auth/jwks",
        response_types_supported: ["code"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
      };

      // Act
      const url = OidcService.generateAuthorizationUrl(
        config,
        "client123",
        "oc://app.example.com",
        "openid profile",
        "abc123",
      );

      // Assert
      expect(url).toContain("state=abc123");
      expect(url).toContain("scope=openid+profile");
    });
  });
});
