import { WebFingerService } from "../WebFingerService";
import { WebFingerResponse } from "../../types/webfinger";

// Mock fetch and console.error to avoid cluttering test output
global.fetch = jest.fn();
console.error = jest.fn();

describe("WebFingerService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("discover", () => {
    it("should make a request to the WebFinger endpoint with correct parameters", async () => {
      // Arrange
      const mockResponse: WebFingerResponse = {
        subject: "acct:user@example.com",
        links: [
          {
            rel: "http://openid.net/specs/connect/1.0/issuer",
            href: "https://example.com/auth",
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const serverUrl = "https://example.com";
      const resource = "acct:user@example.com";

      // Act
      const result = await WebFingerService.discover(serverUrl, resource);

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/.well-known/webfinger?resource=acct%3Auser%40example.com",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            Accept: "application/json",
          }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle trailing slash in server URL", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      // Act
      await WebFingerService.discover(
        "https://example.com/",
        "acct:user@example.com",
      );

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        "https://example.com/.well-known/webfinger?resource=acct%3Auser%40example.com",
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
        WebFingerService.discover(
          "https://example.com",
          "acct:user@example.com",
        ),
      ).rejects.toThrow("WebFinger discovery failed: Not Found");
    });
  });

  describe("findLinkByRel", () => {
    it("should find link by relation", () => {
      // Arrange
      const response: WebFingerResponse = {
        subject: "acct:user@example.com",
        links: [
          {
            rel: "http://example.com/rel/profile",
            href: "https://example.com/profile",
          },
          {
            rel: "http://openid.net/specs/connect/1.0/issuer",
            href: "https://example.com/auth",
          },
        ],
      };

      // Act
      const link = WebFingerService.findLinkByRel(
        response,
        "http://openid.net/specs/connect/1.0/issuer",
      );

      // Assert
      expect(link).toEqual({
        rel: "http://openid.net/specs/connect/1.0/issuer",
        href: "https://example.com/auth",
      });
    });

    it("should return undefined if link not found", () => {
      // Arrange
      const response: WebFingerResponse = {
        subject: "acct:user@example.com",
        links: [
          {
            rel: "http://example.com/rel/profile",
            href: "https://example.com/profile",
          },
        ],
      };

      // Act
      const link = WebFingerService.findLinkByRel(
        response,
        "http://openid.net/specs/connect/1.0/issuer",
      );

      // Assert
      expect(link).toBeUndefined();
    });

    it("should return undefined if links array is not present", () => {
      // Arrange
      const response: WebFingerResponse = {
        subject: "acct:user@example.com",
      };

      // Act
      const link = WebFingerService.findLinkByRel(
        response,
        "http://openid.net/specs/connect/1.0/issuer",
      );

      // Assert
      expect(link).toBeUndefined();
    });
  });

  describe("discoverOidcIssuer", () => {
    it("should return issuer URL when found", async () => {
      // Arrange
      const mockResponse: WebFingerResponse = {
        subject: "acct:user@example.com",
        links: [
          {
            rel: "http://openid.net/specs/connect/1.0/issuer",
            href: "https://example.com/auth",
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const issuer = await WebFingerService.discoverOidcIssuer(
        "https://example.com",
        "acct:user@example.com",
      );

      // Assert
      expect(issuer).toBe("https://example.com/auth");
    });

    it("should return null when issuer URL not found", async () => {
      // Arrange
      const mockResponse: WebFingerResponse = {
        subject: "acct:user@example.com",
        links: [
          {
            rel: "other-rel",
            href: "https://example.com/other",
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      // Act
      const issuer = await WebFingerService.discoverOidcIssuer(
        "https://example.com",
        "acct:user@example.com",
      );

      // Assert
      expect(issuer).toBeNull();
    });

    it("should handle errors during OIDC issuer discovery", async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      // Act & Assert
      await expect(
        WebFingerService.discoverOidcIssuer(
          "https://example.com",
          "acct:user@example.com",
        ),
      ).rejects.toThrow("Network error");

      // Verify the error was logged
      expect(console.error).toHaveBeenCalledWith(
        "OIDC issuer discovery error:",
        expect.any(Error),
      );
    });
  });
});
