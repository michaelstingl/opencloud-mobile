---
sidebar_position: 1
---

# Getting Started

This guide will help you get started with OpenCloud Mobile development. We'll cover how to set up your development environment, how to run the app, and how to make your first changes.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
- [Xcode](https://developer.apple.com/xcode/) (for iOS development)
  - Xcode 16.3+ requires specific Expo module versions - see [Compatibility Notes](#compatibility-notes) below
- [Android Studio](https://developer.android.com/studio) (for Android development)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/michaelstingl/opencloud-mobile.git
cd opencloud-mobile
```

2. Install dependencies:

```bash
npm install
```

## Running the App

### Development Server

Start the development server:

```bash
npx expo start
```

This will open the Expo developer tools in your terminal and provide options for running the app on different platforms.

### iOS Simulator

Run the app on an iOS simulator:

```bash
npx expo run:ios
```

For a release build:

```bash
npx expo run:ios --configuration Release
```

### Android Emulator

Run the app on an Android emulator:

```bash
npx expo run:android
```

### Web

Run the app in a web browser:

```bash
npx expo start --web
```

## Connecting to a Server

When you launch the app, you'll need to connect to an OpenCloud server:

1. Enter the server URL (e.g., `https://your-server.com`)
2. Tap "Connect"
3. The app will:
   - Check if the server supports OpenID Connect via WebFinger
   - Fetch the OpenID Connect configuration
   - Redirect you to the server's login page
4. After login, you'll be redirected back to the app

For development and testing, you can use any OpenCloud server that supports OpenID Connect authentication.

## Development Workflow

### Project Structure

The project follows this structure:

```
opencloud-mobile/
├── app/                  # Expo Router pages
├── components/           # Reusable UI components
├── hooks/                # Custom React hooks
├── services/             # API and business logic services
├── utils/                # Helper functions and utilities
├── types/                # TypeScript type definitions
└── assets/               # Static assets like images
```

### Making Changes

1. Create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes to the code

3. Test your changes:

```bash
npm test
```

4. Commit your changes:

```bash
git commit -m "Add your commit message"
```

5. Push your changes:

```bash
git push origin feature/your-feature-name
```

6. Create a pull request on GitHub

## Testing

Run the tests:

```bash
npm test
```

Run a specific test:

```bash
npm test -- -t "test name"
```

## Debugging

### Using React Native Debugger

1. Install [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
2. Run the app in development mode
3. Open React Native Debugger
4. In the app, shake the device or press Cmd+D (iOS) or Ctrl+M (Android) and select "Debug JS Remotely"

### Viewing Logs

You can view logs in the terminal where you started the development server or use the Expo dev tools.

## Compatibility Notes

### Xcode 16.3+ Compatibility

Xcode 16.3 introduced a breaking change in LLVM 19's C++ compiler that affects Expo and React Native applications. If you're using Xcode 16.3 or later, you'll need to make sure you have compatible packages installed:

- React Native 0.77+ fully supports Xcode 16.3
- For React Native 0.76.x (which this project currently uses), you'll need patched versions of these Expo packages:
  - `expo-device@7.0.3` or higher
  - `expo-gl@15.0.5` or higher
  - `expo-dev-client@5.0.18` or higher
  - `expo-dev-menu@6.0.23` or higher
  - `expo-dev-launcher@5.0.33` or higher

To ensure you have the compatible package versions, run:

```bash
npx expo install --fix
```

This will update the affected packages to versions that are compatible with Xcode 16.3.

For more information, see the [Expo changelog](https://expo.dev/changelog/xcode-16-3-patches).

## Next Steps

Now that you have the app running, you can:

1. Explore the codebase to understand how the app works
2. Check out the [API Reference](/docs/api/overview) to learn about the available components and APIs
3. Read about the [Architecture](/docs/architecture/overview) to understand how the app is designed
4. Learn how to [contribute](/docs/contributing/how-to-contribute) to the project