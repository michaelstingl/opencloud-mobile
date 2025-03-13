import { OpenIDConfiguration } from "../../../types/oidc";
import { WebFingerResponse } from "../../../types/webfinger";

/**
 * Common mock configurations
 */
export const mockOpenIDConfiguration: OpenIDConfiguration = {
  issuer: "https://example.com/auth",
  authorization_endpoint: "https://example.com/auth/authorize",
  token_endpoint: "https://example.com/auth/token",
  jwks_uri: "https://example.com/auth/jwks",
  response_types_supported: ["code"],
  subject_types_supported: ["public"],
  id_token_signing_alg_values_supported: ["RS256"],
};

export const mockTokenResponse = {
  access_token: "access-token-value",
  refresh_token: "refresh-token-value",
  id_token: "id-token-value",
  token_type: "Bearer",
  expires_in: 3600,
};

export const mockWebFingerResponse: WebFingerResponse = {
  subject: "acct:user@example.com",
  links: [
    {
      rel: "http://openid.net/specs/connect/1.0/issuer",
      href: "https://example.com/auth",
    },
  ],
};

/**
 * Mock app config
 */
export const mockAppConfig = {
  authConfig: {
    clientId: "MockClientId",
    redirectUri: "oc://mock.redirect",
    defaultScopes: "openid profile email",
  },
  apiConfig: {
    headers: {
      userAgent: "MockUserAgent",
      useRequestId: true,
    },
    logging: {
      enableDebugLogging: false,
      maxBodyLogLength: 1000,
      generateCurlCommands: false,
    },
  },
};

/**
 * Mock HTTP responses
 */
export function createMockHeaders(requestId = "test-request-id") {
  return {
    get: (name: string) => {
      if (name.toLowerCase() === 'x-request-id') {
        return requestId;
      }
      return null;
    },
    entries: () => {
      return [['content-type', 'application/json'], ['x-request-id', requestId]];
    }
  };
}

export function createSuccessResponse(data: any, status = 200, statusText = "OK") {
  return {
    ok: true,
    status,
    statusText,
    json: async () => data,
    headers: createMockHeaders(),
  };
}

export function createErrorResponse(status = 404, statusText = "Not Found") {
  return {
    ok: false,
    status,
    statusText,
    text: async () => statusText,
    headers: createMockHeaders(),
  };
}

/**
 * Setup utility function
 */
export function setupTestEnvironment() {
  // Setup global mocks
  global.fetch = jest.fn();
  console.error = jest.fn();
  
  // Return a cleanup function
  return () => {
    jest.clearAllMocks();
  };
}

/**
 * Common module mocks
 */
export function mockAppConfigModule() {
  jest.mock("../../../config/app.config", () => mockAppConfig);
}

export function mockOidcService() {
  jest.mock("../../OidcService", () => ({
    OidcService: {
      discoverConfiguration: jest.fn(),
      fetchConfiguration: jest.fn(),
      generateAuthorizationUrl: jest.fn(),
    },
  }));
}

export function mockWebFingerService() {
  jest.mock("../../WebFingerService", () => ({
    WebFingerService: {
      discover: jest.fn(),
      findLinkByRel: jest.fn(),
      discoverOidcIssuer: jest.fn(),
    },
  }));
}

/**
 * Auth helper mocks
 */
export function mockAuthDependencies() {
  mockAppConfigModule();
  mockOidcService();
}

/**
 * WebFinger helper mocks
 */
export function mockWebFingerDependencies() {
  mockAppConfigModule();
}

/**
 * OIDC helper mocks
 */
export function mockOidcDependencies() {
  mockAppConfigModule();
  mockWebFingerService();
}