---
sidebar_position: 6
---

# API Request Flow

This documentation explains the complete flow of an API request in the OpenCloud Mobile app, from initiation to response processing.

## Request Flow Overview

A typical API request in the OpenCloud Mobile app goes through the following phases:

1. **Request Initiation**: A component or hook requests data
2. **Header Creation**: Standardized headers are created
3. **Request Preparation**: The request is configured
4. **Logging (Pre-Request)**: The request is logged
5. **Network Request**: The actual HTTP request is sent
6. **Response Processing**: The server response is processed
7. **Logging (Post-Request)**: The response is logged
8. **Error Handling**: Any errors are handled
9. **Data Return**: The processed data is returned

## Detailed Phases

### 1. Request Initiation

API requests are typically initiated from React components via a hook or directly through a service:

```typescript
// Example: Initiation via a hook
function UserProfileScreen() {
  const { userData, loading, error } = useUserData();
  // ...
}

// Example: Direct use of the API service
async function fetchUserData() {
  const userData = await ApiService.getCurrentUser();
  // ...
}
```

### 2. Header Creation

All requests use standardized headers generated via the `HttpUtil.createStandardHeaders()` method:

```typescript
// Create standard headers
const headers = HttpUtil.createStandardHeaders(
  true,               // includeAuth: Include authentication header?
  this.accessToken,   // token: The auth token, if included
  'application/json'  // contentType: Format of the request body
);
```

Headers include:
- `Content-Type`: Defines the request body format (default: 'application/json')
- `Accept`: Defines accepted response formats
- `User-Agent`: Identifies the app version and platform
- `X-Request-ID`: Unique UUID for request correlation
- `Authorization`: Auth token, if authentication is required

### 3. Request Preparation

Request options are created with `HttpUtil.createRequestOptions()`:

```typescript
// Create request options
const options = HttpUtil.createRequestOptions(
  'GET',       // HTTP method
  headers,     // Prepared headers
  requestBody  // Optional: Request body as string
);
```

Important options:
- `method`: HTTP method (GET, POST, PUT, DELETE, etc.)
- `redirect: 'manual'`: Prevents automatic following of redirects
- `headers`: The standardized headers
- `body`: Request body (if present)

### 4. Logging (Pre-Request)

Before sending, the request is logged:

```typescript
// Log request
HttpUtil.logRequest(
  requestId,    // UUID for tracking
  'API',        // Service prefix for logs
  url,          // Target URL
  method,       // HTTP method
  headers,      // Headers (sensitive data is redacted)
  body          // Request body (if present)
);

// Optional: Generate cURL command for debugging
if (apiConfig.logging?.generateCurlCommands) {
  const curlCommand = HttpUtil.generateCurlCommand(url, options);
  console.log(`[API:${requestId}] Equivalent curl command:\n${curlCommand}`);
}
```

### 5. Network Request

The actual HTTP request is sent using the Fetch API:

```typescript
// Start timing
const requestStartTime = Date.now();

// Execute request
const response = await fetch(url, options);

// End timing
const requestDuration = Date.now() - requestStartTime;
```

### 6. Response Processing

The response is processed based on status code and content type:

```typescript
// Log response
await HttpUtil.logResponse(requestId, 'API', response, requestDuration);

// Check status code
if (!response.ok) {
  // Error handling (see point 8)
  throw new Error(`API request failed: ${response.status}`);
}

// Check content type and process response accordingly
const contentType = response.headers.get('content-type');
if (contentType && contentType.includes('application/json')) {
  return await response.json();
} else {
  return await response.text();
}
```

### 7. Logging (Post-Request)

After receipt, the response is logged:

```typescript
// Response logging with HttpUtil
await HttpUtil.logResponse(
  requestId,        // UUID for tracking
  'API',            // Service prefix for logs
  response,         // The complete response
  requestDuration   // Request duration in ms
);
```

Logging includes:
- Response status and status text
- Response headers
- Response time in milliseconds
- With debug logging enabled: Response body (truncated to configured maximum length)

### 8. Error Handling

Errors are handled in a structured way and enriched with context:

```typescript
try {
  // API request...
} catch (error) {
  // Error logging
  console.error(`[API:${requestId}] Request failed after ${requestDuration}ms: ${error.message}`);
  
  // Error classification
  if (error.name === 'AbortError') {
    console.error(`[API:${requestId}] Request timeout`);
  } else if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
    console.error(`[API:${requestId}] Network connection error`);
  }
  
  // Forward error for higher-level handling
  throw error;
}
```

### 9. Data Return

After successful processing, the data is returned:

```typescript
// Return data to the caller
return processedData;
```

## Special Use Cases

### Handling Redirects

For redirect responses (status codes 300-399), these are processed manually:

```typescript
if (response.status >= 300 && response.status < 400) {
  const redirectUrl = response.headers.get('location');
  return { redirectUrl, status: response.status };
}
```

### Authenticated vs. Non-Authenticated Requests

- **Authenticated Requests**: Use the stored access token in the Authorization header
- **Non-Authenticated Requests**: Send no auth headers (e.g., WebFinger or OIDC configuration requests)

### Disabling Logging Functionality

Logging can be controlled via configuration:

```typescript
// In config/app.config.ts
logging: {
  maxBodyLogLength: 1000,
  generateCurlCommands: false, // Set to true to enable curl command generation
  enableDebugLogging: false,   // Set to true to enable detailed logging
}
```

## Example of a Complete Request Flow

Here is a complete example of the API request flow for retrieving user information:

```typescript
async function getCurrentUser() {
  const operationId = HttpUtil.generateUuid();
  
  try {
    console.log(`[API:${operationId}] Retrieving user information`);
    
    // Try different API endpoints (with fallback)
    try {
      console.log(`[API:${operationId}] Trying Graph endpoint: /graph/v1.0/me`);
      
      // Create headers
      const headers = HttpUtil.createStandardHeaders(true, this.accessToken);
      
      // Create request options
      const options = HttpUtil.createRequestOptions('GET', headers);
      
      // Create URL
      const url = `${this.baseUrl}/graph/v1.0/me?$expand=memberOf`;
      
      // Log request
      HttpUtil.logRequest(operationId, 'API', url, 'GET', headers);
      
      // Optional: Generate cURL command
      if (apiConfig.logging?.generateCurlCommands) {
        const curlCommand = HttpUtil.generateCurlCommand(url, options);
        console.log(`[API:${operationId}] Equivalent curl command:\n${curlCommand}`);
      }
      
      // Send request
      const startTime = Date.now();
      const response = await fetch(url, options);
      const duration = Date.now() - startTime;
      
      // Log response
      await HttpUtil.logResponse(operationId, 'API', response, duration);
      
      // Check for errors
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      // Process and return response
      return await response.json();
      
    } catch (graphError) {
      // Fallback to regular endpoint on error
      console.error(`[API:${operationId}] Graph endpoint failed:`, graphError.message);
      
      // Similar process for the fallback endpoint...
      // [...]
    }
  } catch (error) {
    // General error handling
    console.error(`[API:${operationId}] Error retrieving user information:`, error.message);
    throw error;
  }
}
```

## Key Concepts and Best Practices

1. **Uniformity**: All requests use the same utilities and standards
2. **Traceability**: Each request has a unique ID for end-to-end tracking
3. **Security**: Manual redirect control and redaction of sensitive data in logs
4. **Error Handling**: Structured error capture and reporting
5. **Performance Measurement**: Time measurement for each request for performance monitoring
6. **Configurability**: Logging behavior is controllable via configuration
7. **Unified API**: Consider using the new `HttpUtil.performRequest()` method for all requests