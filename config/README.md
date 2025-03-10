# OpenCloud Mobile Configuration

This directory contains the configuration files for the OpenCloud Mobile app.

## App Configuration

The main configuration file is `app.config.ts`, which contains settings for:

- Authentication (client IDs, redirect URIs, scopes)
- API settings (timeouts, endpoints)
- Other app-wide configurations

## Platform-Specific Configuration

The app uses platform-specific configurations for certain values:

- **Client IDs**: Different client IDs are used for iOS (`OpenCloudIOS`) and Android (`OpenCloudAndroid`)
- **Redirect URIs**: Currently the same for both platforms, but can be customized if needed

## White-Labeling

The configuration system is designed to support white-labeled versions of the app:

1. For build-time configurations, modify the `app.config.ts` file
2. For environment-specific configurations, you can override values in the `appConfig` object

### Example: Creating a White-Label Version

To create a white-label version:

1. Create a custom configuration file (e.g., `custom.config.ts`)
2. Import and extend the default configuration
3. Set your custom values (client IDs, app name, theme colors, etc.)
4. Use environment variables or build arguments to select the appropriate configuration

## Environment Variables

In the future, the app can be extended to support configuration through environment variables:

```typescript
// Example of using environment variables for configuration
export const appConfig: AppConfig = {
  ...defaultConfig,
  auth: {
    ...defaultConfig.auth,
    clientId: 
      Platform.OS === 'ios' 
        ? process.env.IOS_CLIENT_ID || defaultConfig.auth.clientId 
        : process.env.ANDROID_CLIENT_ID || defaultConfig.auth.clientId,
  },
};
```