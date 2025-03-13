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
    
    // Check for errors
    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
    }
    
    // Process and return response
    return await response.json();
    
  } catch (error) {
    // Error handling
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

## Best Practices

1. **Use the unified system**: Always use `HttpUtil.performRequest()` for all HTTP requests
2. **Use meaningful prefixes**: Choose a clear prefix for logging (e.g., 'API', 'Auth', 'WebFinger')
3. **Handle errors properly**: Always check response status with `if (!response.ok)`
4. **Clone responses when needed**: Remember the response body can only be read once
5. **Respect sensitive data**: Don't log sensitive information like auth tokens
6. **Use configuration options**: Adjust log verbosity based on the environment