---
sidebar_position: 4
---

# Authentication Guide

This guide explains how to work with authentication in the OpenCloud Mobile app.

## Authentication Flow

The app uses OpenID Connect (OIDC) for authentication with OpenCloud servers:

1. **Server Connection**: User enters the server URL
2. **WebFinger Discovery**: Discovers OIDC provider capabilities
3. **OIDC Configuration**: Retrieves authentication endpoints
4. **Authorization**: Redirects to browser for login
5. **Token Exchange**: Exchanges authorization code for tokens

## Implementation Details

### Server Connection

When a user enters a server URL, several checks are performed:

- URL normalization (adding https:// if missing)
- Security check for HTTP URLs
- WebFinger discovery to verify OIDC support

```typescript
// Example: Server URL handling
const { url: normalizedUrl, isInsecure } = AuthService.normalizeServerUrl(serverUrl);

// Handle insecure connection warning if needed
if (isInsecure) {
  // Show warning and get user confirmation
}

// Initialize authentication
const { success } = await AuthService.initialize(normalizedUrl);
```

### WebFinger and OIDC Discovery

The app uses WebFinger to discover the OpenID Connect provider:

```typescript
// WebFingerService.discoverOidcIssuer
const webFingerResponse = await this.discover(serverUrl, resource);
const oidcLink = this.findLinkByRel(webFingerResponse, 'http://openid.net/specs/connect/1.0/issuer');
```

Then it fetches the OpenID configuration:

```typescript
// OidcService.fetchConfiguration
const configUrl = `${baseUrl}/.well-known/openid-configuration`;
const response = await fetch(configUrl);
return await response.json();
```

### Authentication Flow

The actual authentication happens through browser redirection:

```typescript
// Get authorization URL
const authUrl = AuthService.getAuthorizationUrl();

// Open browser for authentication
await WebBrowser.openAuthSessionAsync(authUrl, authConfig.redirectUri);
```

After authentication, the app exchanges the authorization code for tokens:

```typescript
// Exchange authorization code for tokens
const tokens = await AuthService.exchangeCodeForTokens(authCode);
```

## Platform-Specific Configuration

The authentication system is configured for different platforms:

- **Client IDs**:
  - iOS: `OpenCloudIOS`
  - Android: `OpenCloudAndroid`

- **Redirect URIs**:
  - iOS: `oc://ios.opencloud.eu`
  - Android: `oc://android.opencloud.eu`

## Implementing Custom Authentication

To customize the authentication flow:

1. **Update Configuration**:
   ```typescript
   // In config/app.config.ts
   auth: {
     clientId: 'your-client-id',
     redirectUri: 'your-custom-scheme://callback',
     defaultScopes: 'openid profile email',
   }
   ```

2. **Register URL Scheme**:
   - Update iOS `Info.plist` and Android `AndroidManifest.xml` as described in the [Configuration Guide](./configuration.md#url-scheme-configuration)
   
3. **Handle Authentication Callback**:
   - Create a route handler for your redirect URI
   - Extract the authorization code from the URL
   - Exchange the code for tokens

4. **Store and Use Tokens**:
   - Securely store the access and refresh tokens
   - Include the access token in API requests
   - Implement token refresh logic

## Testing Authentication

To test authentication during development:

1. Use a real OpenCloud server with OIDC support
2. Enter the server URL in the app
3. Complete the authentication flow
4. Check the logs for token information

For automated testing, you can mock the authentication services.