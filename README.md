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

## Development

The app is built with:

- React Native + Expo
- TypeScript
- Expo Router for navigation
- Modern React patterns (hooks, functional components)

## Build for production

To create a production build:

```bash
# For iOS
npx expo run:ios --configuration Release

# For Android
npx expo run:android --variant release
```
