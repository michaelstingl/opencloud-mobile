# Development Guidelines for OpenCloud Mobile

## About the Project
OpenCloud Mobile is a cross-platform mobile client for iOS and Android that connects to OpenCloud servers. The app allows users to access their cloud files, share content, and sync data between their mobile devices and server.

## Build & Development Commands
- Start development server: `npx expo start` or `expo start`
- Run on iOS simulator: `npx expo run:ios`
- Run on iOS (release): `npx expo run:ios --configuration Release`
- Run on Android emulator: `npx expo run:android`
- Run in web browser: `npx expo start --web`
- Run tests: `jest --watchAll`
- Run single test: `jest -t "test name"`
- Lint code: `npx expo lint`

## Project Structure
- `/app` - Main application screens and navigation (using expo-router)
- `/components` - Reusable UI components
- `/hooks` - Custom React hooks
- `/services` - API services and data handling
- `/utils` - Helper functions and utilities
- `/types` - TypeScript type definitions
- `/assets` - Images, fonts, and other static resources

## Code Style Guidelines
- Use TypeScript with strict type checking
- Follow React Native / Expo best practices with file-based routing (expo-router)
- Use functional components with hooks instead of class components
- Organize imports: React first, then external libraries, then local imports
- Use named exports rather than default exports where appropriate
- Follow consistent naming conventions:
  - Components: PascalCase (e.g., `LoginScreen`, `FileList`)
  - Functions/variables: camelCase
  - Constants: UPPER_SNAKE_CASE
- Handle errors with try/catch and appropriate user feedback
- Use path aliases (@/* instead of relative imports) for cleaner imports
- Keep components focused on a single responsibility
- Store tests in `__tests__` directories with naming pattern `ComponentName-test.tsx`
- Write meaningful comments for complex logic

## Git Workflow
- Create feature branches from `main` branch
- Use descriptive branch names (e.g., `feature/login-screen`, `fix/connection-error`)
- Write clear commit messages that describe what and why
- Create pull requests for code review before merging to `main`