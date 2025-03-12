# OpenCloud Mobile

[![Tests and Coverage](https://github.com/michaelstingl/opencloud-mobile/actions/workflows/tests.yml/badge.svg)](https://github.com/michaelstingl/opencloud-mobile/actions/workflows/tests.yml)
[![codecov](https://codecov.io/gh/michaelstingl/opencloud-mobile/branch/main/graph/badge.svg)](https://codecov.io/gh/michaelstingl/opencloud-mobile)

A mobile client for iOS and Android for connecting to OpenCloud servers.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a:

- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Expo Go](https://expo.dev/go) (limited sandbox)

This project uses [file-based routing](https://docs.expo.dev/router/introduction) with Expo Router.

## Documentation

Comprehensive documentation is available at [https://michaelstingl.github.io/opencloud-mobile/](https://michaelstingl.github.io/opencloud-mobile/)

The documentation covers:
- Getting started guides
- Authentication and OpenID Connect implementation
- Configuration and customization
- Architecture overview

## Development

The app is built with:

- React Native + Expo
- TypeScript
- Expo Router for navigation
- Modern React patterns (hooks, functional components)
- Standardized HTTP communication with request tracing
- OpenID Connect (OIDC) authentication with WebFinger discovery

### Testing

Run the test suite:

```bash
npm test
```

For faster test execution during development:

```bash
npm run test:fast -- <file-pattern>
```

Run tests with continuous monitoring:

```bash
npm test -- --watchAll
```

Run tests with coverage report:

```bash
npm run test:coverage
```

Run HTTP utility tests specifically:

```bash
npm run test:http
```

Run tests in CI mode (used by GitHub Actions):

```bash
npm run test:ci
```

Run specific tests:

```bash
npm test -- -t "WebFingerService"
```

We use Jest for testing with a focus on:
- Unit tests for services and utilities (>90% coverage for core services)
- Component tests for UI elements
- Integration tests for complex flows
- Standardized test helpers for consistent patterns

Test files are located next to the code they test in `__tests__` directories.

### Continuous Integration

We use GitHub Actions for continuous integration:
- Automated test runs on pushes to main and PRs
- Code coverage reports via Codecov
- Detailed coverage feedback on pull requests

View the latest [test results](https://github.com/michaelstingl/opencloud-mobile/actions/workflows/tests.yml) or [coverage report](https://codecov.io/gh/michaelstingl/opencloud-mobile).

## HTTP Communication

The app uses a standardized HTTP communication layer:

- Centralized `HttpUtil` for all API requests
- Request tracing with UUID v4 correlation IDs
- Standardized headers and request handling
- Configurable logging for debugging
- Manual redirect handling for security
- Development tools like curl command generation

## Build for production

To create a production build:

```bash
# For iOS
npx expo run:ios --configuration Release

# For Android
npx expo run:android --variant release
```

## Project Structure

- `/app` - Main application screens and navigation (using expo-router)
- `/components` - Reusable UI components
- `/config` - Application configuration including platform-specific settings
- `/hooks` - Custom React hooks
- `/services` - API services and data handling
  - `/services/api` - HTTP communication utilities
  - `/services/WebFingerService.ts` - WebFinger discovery for OpenID Connect
  - `/services/OidcService.ts` - OpenID Connect operations
  - `/services/AuthService.ts` - Authentication coordination
- `/types` - TypeScript type definitions
- `/assets` - Images, fonts, and other static resources
