# OpenCloud Mobile

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

### Testing

Run the test suite:

```bash
npm test
```

Run tests with continuous monitoring:

```bash
npm test -- --watchAll
```

Run tests with coverage report:

```bash
npm test -- --coverage
```

Run specific tests:

```bash
npm test -- -t "WebFingerService"
```

We use Jest for testing with a focus on:
- Unit tests for services and utilities (100% coverage for auth services)
- Component tests for UI elements
- Integration tests for complex flows

Test files are located next to the code they test in `__tests__` directories.

## Build for production

To create a production build:

```bash
# For iOS
npx expo run:ios --configuration Release

# For Android
npx expo run:android --variant release
```
