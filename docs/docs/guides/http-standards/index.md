---
sidebar_position: 4
---

# HTTP Communication Standards

OpenCloud Mobile implements strict standards for all HTTP communications to ensure security, traceability, and consistency across the application. This document outlines these standards and how they are implemented.

## Centralized HTTP Utilities

All HTTP communication in OpenCloud Mobile is standardized through the shared `HttpUtil` class, which provides common functionality for every service making network requests.

### Key Features

- **Request Correlation**: Every request gets a unique UUID v4 identifier
- **Standardized Headers**: Consistent headers across all requests
- **Manual Redirect Handling**: Secure handling of redirects without automatic following
- **Comprehensive Logging**: Configurable logging with security-conscious redaction
- **Debug Tools**: Generation of equivalent curl commands for troubleshooting

## Standard Headers

All requests include these standard headers:

| Header | Description | Example |
|--------|-------------|---------|
| `User-Agent` | Identifies app, version and platform | `OpenCloudMobile/1.0.0 (ios)` |
| `X-Request-ID` | UUID v4 for request correlation | `75d9336d-4f79-459f-b9ef-19ead660f7c8` |
| `Accept` | Indicates preferred response format | `application/json, text/plain, */*` |
| `Content-Type` | Indicates request body format | `application/json` |

## Redirect Handling

All requests use `redirect: 'manual'` to:

- Never automatically follow redirects
- Always evaluate the first response status code
- Give the application control over redirect behavior
- Provide users a choice for viewing redirected pages (e.g., logout confirmation)

## Logging Standards

The HTTP utilities provide consistent logging with:

- Request/response timing measurements
- Standard log prefixes to identify the service (e.g., `[Auth]`, `[OIDC]`, `[API]`)
- Request ID correlation in logs
- Redaction of sensitive information (tokens)
- Configurable logging verbosity through `enableDebugLogging`

Example log:
```
[API:75d9336d-4f79-459f-b9ef-19ead660f7c8] Response received in 237ms
[API:75d9336d-4f79-459f-b9ef-19ead660f7c8] Response status: 200 OK
```

## Security Measures

Security is ensured through:

- Redaction of sensitive information in logs (tokens, credentials)
- Manual handling of redirects to prevent open redirect vulnerabilities
- Request ID tracking for security auditing
- Configuration options to control logging verbosity

## Debugging Capabilities

The HTTP utilities provide debugging capabilities:

- Generation of equivalent curl commands for reproducing requests
- Timing measurements for performance analysis
- Detailed request/response logging when enabled
- Response header analysis

Example curl command generation:
```
curl -v "https://example.com/api/endpoint" -H "Accept: application/json" -H "User-Agent: OpenCloudMobile/1.0.0 (ios)" -H "X-Request-ID: 75d9336d-4f79-459f-b9ef-19ead660f7c8"
```

## Configuration Options

HTTP communication behavior can be configured through `apiConfig` settings:

```typescript
const apiConfig = {
  logging: {
    maxBodyLogLength: 1000,
    generateCurlCommands: true,
    enableDebugLogging: false,
  },
  headers: {
    userAgent: 'OpenCloudMobile/1.0.0 (ios)',
    useRequestId: true,
  }
};
```

## Implementation in Services

All services follow these standards:

- **AuthService**: Authentication and token operations
- **OidcService**: OpenID Connect operations
- **WebFingerService**: WebFinger discovery
- **ApiService**: Data API communication

Each service uses the shared HttpUtil functions to:
1. Create standard headers
2. Set up request options
3. Send requests with proper settings
4. Log and process responses consistently

## Best Practices

When extending the application with new API calls:

1. Always use the HttpUtil for:
   - Creating headers with `createStandardHeaders()`
   - Setting up request options with `createRequestOptions()`
   - Logging requests with `logRequest()`
   - Logging responses with `logResponse()`

2. Never follow redirects automatically

3. Always include proper error handling

4. Use the service prefix in logs (e.g., `[YourService]`)

5. Consider security implications when logging response data