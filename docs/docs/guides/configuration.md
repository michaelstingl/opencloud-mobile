---
sidebar_position: 3
---

# Application Configuration

OpenCloud Mobile uses a centralized configuration system that allows for customization, white-labeling, and platform-specific settings.

## Configuration System Overview

The configuration system is built with the following goals:

- **Type Safety**: All configuration options are typed using TypeScript
- **Modularity**: Configuration is separated into logical categories
- **Extensibility**: Easy to add new configuration options
- **White-Labeling**: Support for creating custom branded versions of the app
- **Platform Specificity**: Different settings for iOS and Android when needed

## Configuration Structure

The main configuration file is located at `/config/app.config.ts`. This file exports configuration objects for different parts of the application.

```typescript
// Example from app.config.ts
// Default configuration values
const defaultConfig: AppConfig = {
  auth: {
    clientId: Platform.OS === 'ios' ? 'OpenCloudIOS' : 'OpenCloudAndroid',
    redirectUri: Platform.OS === 'ios' ? 'oc://ios.opencloud.eu' : 'oc://android.opencloud.eu',
    postLogoutRedirectUri: Platform.OS === 'ios' ? 'oc://ios.opencloud.eu' : 'oc://android.opencloud.eu',
    defaultScopes: 'openid profile email',
  },
  api: {
    timeout: 30000, // 30 seconds
    headers: {
      // userAgent is dynamically set from package.json name and version
      // Example: "OpencloudMobile/1.0.0 (ios)" or "OpencloudMobile/1.0.0 (android)"
      useRequestId: true
    },
    logging: {
      maxBodyLogLength: 1000,
      generateCurlCommands: true,
      enableDebugLogging: false
    }
  },
};

// Determine if we're in development mode
const isDevelopmentMode = typeof __DEV__ !== 'undefined' && __DEV__;

// Final configuration with development mode overrides
export const appConfig: AppConfig = {
  ...defaultConfig,
  api: {
    ...defaultConfig.api,
    logging: {
      ...defaultConfig.api.logging,
      // Enable debug logging automatically in development mode
      enableDebugLogging: isDevelopmentMode || defaultConfig.api.logging?.enableDebugLogging || false,
    }
  }
};
```

## Available Configuration Options

### Authentication Configuration

Authentication settings control how the app interacts with OpenID Connect providers:

| Option | Description | Default Value |
|--------|-------------|---------------|
| `clientId` | OAuth client ID | iOS: `OpenCloudIOS`<br/>Android: `OpenCloudAndroid` |
| `redirectUri` | OAuth redirect URI | iOS: `oc://ios.opencloud.eu`<br/>Android: `oc://android.opencloud.eu` |
| `postLogoutRedirectUri` | URI to redirect to after logout | iOS: `oc://ios.opencloud.eu`<br/>Android: `oc://android.opencloud.eu` |
| `defaultScopes` | Default OAuth scopes to request | `openid profile email` |

### API Configuration

Settings for API communication:

| Option | Description | Default Value |
|--------|-------------|---------------|
| `timeout` | Default API request timeout in milliseconds | `30000` (30 seconds) |
| `headers.userAgent` | User-Agent string for all API requests | Dynamically constructed as `${APP_NAME}/${APP_VERSION} (${PLATFORM})` where APP_NAME and APP_VERSION come from package.json |
| `headers.useRequestId` | Whether to use X-Request-ID in all requests | `true` |

### Logging Configuration

Settings for application logging:

| Option | Description | Default Value |
|--------|-------------|---------------|
| `logging.maxBodyLogLength` | Maximum number of characters to log for request/response bodies | `1000` |
| `logging.generateCurlCommands` | Whether to generate curl commands in logs for debugging | `true` |
| `logging.enableDebugLogging` | Enable detailed debug logging, including response headers | `true` in development, `false` in production |

## How to Use Configuration

To use the configuration in your code:

```typescript
import { authConfig, apiConfig } from '../config/app.config';

// Use the authentication configuration
console.log('Client ID:', authConfig.clientId);

// Use the API configuration
console.log('Debug logging enabled:', apiConfig.logging?.enableDebugLogging);

// Debug logging is automatically enabled in development mode (__DEV__ === true)
// but can still be controlled manually in production
```

## White-Labeling

The configuration system is designed to support white-labeled versions of the application.

### Creating a White-Labeled Version

To create a white-labeled version of the app:

1. Create a custom configuration file extending the base configuration
2. Override specific values for your brand
3. Use environment variables or build arguments to select the appropriate configuration

Example of a white-labeled configuration file:

```typescript
// Example: acme-config.ts
import { appConfig as baseConfig } from './app.config';

export const acmeConfig = {
  ...baseConfig,
  auth: {
    ...baseConfig.auth,
    clientId: Platform.OS === 'ios' ? 'AcmeAppIOS' : 'AcmeAppAndroid',
  },
  branding: {
    appName: 'Acme Cloud',
    primaryColor: '#FF5500',
    logoPath: require('../assets/images/acme-logo.png'),
  },
};
```

## Platform-Specific Configuration

The configuration system automatically handles platform-specific values where needed using React Native's `Platform` API:

```typescript
import { Platform } from 'react-native';

// Different client IDs for iOS and Android
clientId: Platform.OS === 'ios' ? 'OpenCloudIOS' : 'OpenCloudAndroid',
```

You can extend this pattern for any configuration value that needs to differ between platforms.

## Build-Time Configuration

For values that should be determined at build time, you can use environment variables:

```typescript
// Example of using environment variables
clientId: process.env.CLIENT_ID || defaultConfig.auth.clientId,
```

When building the app, you would provide these environment variables in your build process.

## URL Scheme Configuration

The app uses custom URL schemes for OAuth authentication redirect handling. These need to be properly configured in both iOS and Android:

### iOS URL Scheme Configuration

The URL scheme must be registered in `ios/opencloudmobile/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <!-- Other URL schemes may be here -->
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>oc</string>
    </array>
  </dict>
</array>
```

### Android URL Scheme Configuration

The URL scheme must be registered in `android/app/src/main/AndroidManifest.xml` within the appropriate `intent-filter`:

```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW"/>
  <category android:name="android.intent.category.DEFAULT"/>
  <category android:name="android.intent.category.BROWSABLE"/>
  <!-- Other URL schemes may be here -->
  <data android:scheme="oc"/>
</intent-filter>
```

### Important Notes

- Any changes to the redirect URI in the configuration must be matched by corresponding URL scheme registrations
- After changing URL schemes, you must rebuild the app for the changes to take effect
- When using white-labeled configurations with different redirect URIs, ensure the appropriate URL schemes are registered
- For testing with Expo Go, you may need to use the "expo-development-client" URL scheme instead