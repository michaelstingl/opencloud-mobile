---
sidebar_position: 7
---

# API Communication

This guide explains how HTTP requests are handled in the OpenCloud Mobile application, focusing on the new unified request system.

## Unified HTTP Request System

OpenCloud Mobile uses a centralized request handling system through the `HttpUtil.performRequest()` method. This approach ensures consistency, proper logging, and error handling across all API communications.

### Key Benefits

- **Standardized Approach**: All HTTP requests follow the same pattern
- **Comprehensive Logging**: Automatic logging of requests and responses
- **Request Tracking**: All requests receive a unique ID for tracing
- **Debugging Support**: Automatic generation of curl commands in development mode
- **Error Handling**: Consistent error processing
- **Security**: Sensitive information is automatically redacted in logs

## Basic Usage

```typescript
// Example: Get user information
async function getCurrentUser() {
  try {
    // Create URL
    const url = `${this.serverUrl}/graph/v1.0/me?$expand=memberOf`;
    
    // Make request with unified logging
    const response = await HttpUtil.performRequest(url, 'GET', {
      prefix: 'API',     // Log prefix
      token: this.token, // Auth token if needed
      contentType: 'application/json'
    });
    
    // Use the standard error handling helper
    this.handleApiResponse(response, 'Failed to get user info');
    
    // Process and return response
    return await response.json();
    
  } catch (error) {
    // Error has been enriched with requestId
    console.error(`Error fetching user information:`, error);
    throw error;
  }
}
```

## performRequest Parameters

The `HttpUtil.performRequest()` method accepts the following parameters:

```typescript
static async performRequest(
  url: string,                  // The URL to request
  method: string = 'GET',       // HTTP method
  options: {
    prefix: string;             // Log prefix (e.g., 'API', 'Auth')
    headers?: Record<string, string>; // Additional headers
    token?: string;             // Authorization token
    body?: any;                 // Request body
    contentType?: string;       // Content type (defaults to 'application/json')
  }
): Promise<Response>
```

## Logging System

The logging system provides detailed information about HTTP requests and responses. Logging behavior is controlled by configuration settings:

```typescript
// In config/app.config.ts
logging: {
  maxBodyLogLength: 1000,     // Max chars to log for request/response bodies
  generateCurlCommands: true, // Only in development mode
  enableDebugLogging: true,   // Only in development mode
}
```

### Log Output Example

```
[API:83503ceb-0765-4e44-b71f-3526ce8cf0ee] Request URL: https://server.com/graph/v1.0/me
[API:83503ceb-0765-4e44-b71f-3526ce8cf0ee] Request method: GET
[API:83503ceb-0765-4e44-b71f-3526ce8cf0ee] Request headers: {
  "Accept": "application/json, text/plain, */*",
  "X-Request-ID": "83503ceb-0765-4e44-b71f-3526ce8cf0ee",
  "Content-Type": "application/json",
  "Authorization": "Bearer [REDACTED_FOR_SECURITY]",
  "User-Agent": "OpencloudMobile/1.0.0 (ios)"
}
[API:83503ceb-0765-4e44-b71f-3526ce8cf0ee] Equivalent curl command for debugging:
curl -v "https://server.com/graph/v1.0/me" -H "Accept: application/json, text/plain, */*" -H "X-Request-ID: 83503ceb-0765-4e44-b71f-3526ce8cf0ee" -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "User-Agent: OpencloudMobile/1.0.0 (ios)"

[API:83503ceb-0765-4e44-b71f-3526ce8cf0ee] Response received in 156ms
[API:83503ceb-0765-4e44-b71f-3526ce8cf0ee] Response status: 200 OK
[API:83503ceb-0765-4e44-b71f-3526ce8cf0ee] Server returned matching X-Request-ID
[API:83503ceb-0765-4e44-b71f-3526ce8cf0ee] Response headers: {
  "content-type": "application/json",
  "date": "Thu, 13 Mar 2025 20:59:20 GMT",
  "x-request-id": "83503ceb-0765-4e44-b71f-3526ce8cf0ee"
}
[API:83503ceb-0765-4e44-b71f-3526ce8cf0ee] Response body (JSON): {
  "id": "user123",
  "displayName": "John Doe",
  "mail": "john@example.com"
}
```

## Request/Response Body Handling

The system handles different content types appropriately:

### JSON Data

For JSON data (`application/json`), objects are automatically stringified:

```typescript
const response = await HttpUtil.performRequest(url, 'POST', {
  prefix: 'API',
  token: this.token,
  body: { name: "John", email: "john@example.com" },
  contentType: 'application/json'
});
```

### Form Data

For form data (`application/x-www-form-urlencoded`), objects are converted to URL parameters:

```typescript
const response = await HttpUtil.performRequest(tokenEndpoint, 'POST', {
  prefix: 'Auth',
  body: {
    grant_type: 'authorization_code',
    code: authCode,
    client_id: clientId,
    redirect_uri: redirectUri
  },
  contentType: 'application/x-www-form-urlencoded'
});
```

## Mock Data Mode

The application provides a mock data mode for development and testing without a real server.

### Enabling Mock Mode

```typescript
// Enable mock data mode
ApiService.enableMockDataMode('mock-token', 'https://demo.opencloud.example');
```

### Mock Request Logging

When in mock mode, simulated API requests and responses are logged in the same format as real requests, but with visual markers. Detailed logging is only available in development mode, just like with real requests:

```
[API:9d503ceb-1765-4e44-a71f-3526ce8cf0ef] 🔶 MOCK REQUEST 🔶
[API:9d503ceb-1765-4e44-a71f-3526ce8cf0ef] Request URL: https://demo.opencloud.example/graph/v1.0/me?$expand=memberOf
[API:9d503ceb-1765-4e44-a71f-3526ce8cf0ef] Request method: GET
[API:9d503ceb-1765-4e44-a71f-3526ce8cf0ef] Request headers: {
  "Accept": "application/json, text/plain, */*",
  "X-Request-ID": "9d503ceb-1765-4e44-a71f-3526ce8cf0ef",
  "Content-Type": "application/json",
  "Authorization": "Bearer [REDACTED_FOR_SECURITY]",
  "User-Agent": "OpencloudMobile/1.0.0 (ios)"
}
[API:9d503ceb-1765-4e44-a71f-3526ce8cf0ef] 🔶 MOCK RESPONSE 🔶
[API:9d503ceb-1765-4e44-a71f-3526ce8cf0ef] Response status: 200 OK
[API:9d503ceb-1765-4e44-a71f-3526ce8cf0ef] Response body (JSON): {
  "id": "mock-user-id",
  "displayName": "Mock User",
  "mail": "mockuser@example.com",
  "userType": "Member"
}
[API:9d503ceb-1765-4e44-a71f-3526ce8cf0ef] 🔶 MOCK curl command for debugging:
curl -v "https://demo.opencloud.example/graph/v1.0/me?$expand=memberOf" -H "Accept: application/json, text/plain, */*" -H "X-Request-ID: 9d503ceb-1765-4e44-a71f-3526ce8cf0ef" -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN_HERE" -H "User-Agent: OpencloudMobile/1.0.0 (ios)"
```

### Benefits of Mock Logging

- Simulate API requests without a real server
- Debug applications in isolation
- Consistent logging across real and mock environments
- Show what API calls would be made in production
- Generate simulated curl commands for understanding request structure

## API Endpoints

The application uses Microsoft Graph API-compatible endpoints:

### User Information

```typescript
// Get current user with group memberships
const url = `${serverUrl}/graph/v1.0/me?$expand=memberOf`;
```

### Drives/Spaces

```typescript
// Get user drives/spaces
const url = `${serverUrl}/graph/v1.0/drives`;
```

## Authentication Flow

For details on the authentication process, see the [Authentication](./authentication.md) guide.

## Error Handling with Request IDs

OpenCloud Mobile uses a standardized error handling approach that incorporates Request IDs to make debugging easier.

### The ApiError Interface

```typescript
// ApiError interface for typed error handling with request IDs
export interface ApiError extends Error {
  requestId?: string; // Stores the x-request-id from response headers
}
```

### Standardized Error Handling

The `handleApiResponse` helper method provides consistent error handling:

```typescript
/**
 * Helper method to handle API response and extract error with request ID
 * @param response Fetch Response object
 * @param errorMessage Error message prefix
 * @throws ApiError with requestId if response is not ok
 */
private static handleApiResponse(response: Response, errorMessage: string): void {
  if (!response.ok) {
    const requestId = response.headers.get('x-request-id') || 'unknown';
    const error = new Error(`${errorMessage}: ${response.status} ${response.statusText}`) as ApiError;
    error.requestId = requestId;
    throw error;
  }
}
```

### Error Handling in Components

Error handling in UI components should show appropriate user messages while preserving debugging information:

```typescript
try {
  // API calls...
} catch (error) {
  console.error('API request failed:', error);
  
  // Extract request ID if available
  const requestId = (error as ApiError).requestId || 'unknown';
  
  // Set error message with debugging information in dev mode only
  setError(`Could not load data. Please try again later.${__DEV__ ? 
    `\n\nError: ${error.message}\nRequest ID: ${requestId}` : ''}`);
}
```

## Best Practices

1. **Use the unified system**: Always use `HttpUtil.performRequest()` for all HTTP requests
2. **Use meaningful prefixes**: Choose a clear prefix for logging (e.g., 'API', 'Auth', 'WebFinger')
3. **Use standard error handling**: Use the `handleApiResponse` helper for error handling
4. **Include Request IDs in errors**: Extract and include Request IDs in all error messages
5. **Show user-friendly messages**: Use descriptive error messages that users can understand
6. **Provide debugging details in dev mode**: Include technical details only in __DEV__ mode
7. **Clone responses when needed**: Remember the response body can only be read once
8. **Respect sensitive data**: Don't log sensitive information like auth tokens
9. **Use configuration options**: Adjust log verbosity based on the environment
10. **Use mock mode for testing**: Use ApiService.enableMockDataMode() for development and testing
11. **Check mock logs**: Review mock request logs to understand API behavior in isolation
12. **Follow DRY principle**: Use shared error handling methods instead of duplicating code