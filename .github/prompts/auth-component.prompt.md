# Authentication Component Generation

Generate a React Native component that uses our OpenID Connect authentication system.

## Requirements:
- Use TypeScript with proper types
- Import from existing services:
  - `import { AuthService } from '../services/AuthService';`
  - Use other services as needed (WebFingerService, OidcService)
- Import configuration:
  - `import { authConfig } from '../config/app.config';`
- Use functional components with hooks
- Implement loading states for async operations
- Proper error handling with user feedback via Alert
- Handle HTTP vs HTTPS URLs with security warnings

## Authentication Flow Reference:
1. Normalize user input URL
2. Check for HTTP (insecure) and show warning if needed
3. Initialize authentication with WebFinger discovery
4. Get authorization URL and redirect to browser
5. Handle redirect back to app
6. Exchange authorization code for tokens

## Example Usage:
```typescript
// URL normalization and security check
const { url: normalizedUrl, isInsecure } = AuthService.normalizeServerUrl(serverUrl);

// Handle insecure connection warning if needed
if (isInsecure) {
  // Show warning and get user confirmation
  // Allow user to continue or cancel
}

// Initialize authentication
const { success } = await AuthService.initialize(normalizedUrl);

// Get authorization URL and open browser
const authUrl = AuthService.getAuthorizationUrl();
await WebBrowser.openAuthSessionAsync(authUrl, authConfig.redirectUri);
```