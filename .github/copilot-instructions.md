We use TypeScript with strict type checking in this React Native/Expo app. Always provide TypeScript solutions with proper interfaces and types.

Our authentication system uses OpenID Connect with WebFinger discovery. When generating authentication-related code, follow the established pattern in our services (WebFingerService, OidcService, AuthService).

We use a centralized configuration system in config/app.config.ts. All configurable parameters should use this system rather than hardcoded values, especially for platform-specific settings like client IDs and redirect URIs.

We have platform-specific configurations for iOS and Android:
- Client IDs: iOS uses 'OpenCloudIOS', Android uses 'OpenCloudAndroid'
- Redirect URIs: iOS uses 'oc://ios.opencloud.eu', Android uses 'oc://android.opencloud.eu'

Handle HTTP vs HTTPS URLs with appropriate security warnings, allowing users to continue with HTTP only after explicit confirmation.

For UI components, use functional components with React hooks, never class components. Implement proper loading and error states for asynchronous operations.

Use async/await instead of Promise chains (.then). Always implement proper error handling with try/catch blocks and provide appropriate user feedback for errors.

Our file structure follows these conventions:
- /app - Main screens using Expo Router file-based routing
- /components - Reusable UI components
- /services - API services and business logic
- /hooks - Custom React hooks
- /types - TypeScript interfaces and type definitions
- /config - Application configuration
- /utils - Helper functions and utilities