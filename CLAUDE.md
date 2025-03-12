# Development Guidelines for OpenCloud Mobile

## About the Project
OpenCloud Mobile is a cross-platform mobile client for iOS and Android that connects to OpenCloud servers. The app allows users to access their cloud files, share content, and sync data between their mobile devices and server.

## Build & Development Commands
- Start development server: `npx expo start` or `expo start`
- Run on iOS simulator: `npx expo run:ios`
- Run on iOS (release): `npx expo run:ios --configuration Release`
- Run on Android emulator: `npx expo run:android`
- Run in web browser: `npx expo start --web`
- Run tests: `npm test` or `npm run test`
- Run tests in fast mode: `npm run test:fast -- <file-pattern>`
- Run tests with coverage: `npm run test:coverage`
- Run HttpUtil tests: `npm run test:http`
- Run tests in CI mode: `npm run test:ci`
- Lint code: `npx expo lint`
- Format code: `prettier --write "**/*.{ts,tsx}"`
- Check for security vulnerabilities: `npm audit`
- Fix automatic security issues: `npm audit fix`
- Update OpenAPI specification: `./scripts/update-openapi.sh`

## Documentation
- Documentation is available at: https://michaelstingl.github.io/opencloud-mobile/
- Run documentation locally: `cd docs && npm start`
- Build documentation: `cd docs && npm run build`
- The documentation uses Docusaurus v3 without blog functionality

## Project Structure
- `/app` - Main application screens and navigation (using expo-router)
- `/components` - Reusable UI components
- `/config` - Application configuration including platform-specific settings
- `/hooks` - Custom React hooks
- `/services` - API services and data handling
  - `/services/WebFingerService.ts` - WebFinger discovery for OpenID Connect
  - `/services/OidcService.ts` - OpenID Connect operations
  - `/services/AuthService.ts` - Authentication coordination
- `/utils` - Helper functions and utilities
- `/types` - TypeScript type definitions
  - `/types/webfinger.ts` - WebFinger response types
  - `/types/oidc.ts` - OpenID Connect configuration types
- `/assets` - Images, fonts, and other static resources

## Testing Guidelines

- All new features and bug fixes should include tests
- Follow test-driven development (TDD) when appropriate
- Test files should be placed in `__tests__` directories
- Test files should be named `ComponentName-test.tsx` or `ServiceName-test.ts`
- Use Jest as the testing framework
- Mock external dependencies and API calls
- Create helper functions for commonly reused test code
- Apply DRY principles to test code
- Focus coverage on core business logic and critical paths
- Run `npm run test:coverage` to check test coverage
- Aim for at least 80% coverage for critical service code
- Use descriptive test names that explain what is being tested

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
- Store tests in `__tests__` directories with naming pattern `ComponentName-test.tsx` or `ServiceName-test.ts`
- Write meaningful comments for complex logic

## Authentication
- The app uses OpenID Connect (OIDC) with WebFinger discovery
- Authentication flow:
  1. WebFinger discovery: `/.well-known/webfinger` endpoint
  2. OIDC configuration: `/.well-known/openid-configuration` endpoint
  3. Authorization in browser
  4. Redirect back to app
  5. Token exchange
- Platform-specific client IDs:
  - iOS: `OpenCloudIOS`
  - Android: `OpenCloudAndroid`
- Platform-specific redirect URIs:
  - iOS: `oc://ios.opencloud.eu`
  - Android: `oc://android.opencloud.eu`
- URL schemes must be registered in:
  - iOS: `/ios/opencloudmobile/Info.plist`
  - Android: `/android/app/src/main/AndroidManifest.xml`

## Configuration
- Central configuration in `/config/app.config.ts`
- Platform-specific settings using React Native's `Platform.OS`
- Configuration categories:
  - `auth`: Authentication settings (client IDs, redirect URIs, scopes)
  - `api`: API communication settings (timeouts, etc.)
- Import configuration in components:
  ```typescript
  import { authConfig } from '../config/app.config';
  ```

## Git Workflow
- Create feature branches from `main` branch
- Use descriptive branch names (e.g., `feature/login-screen`, `fix/connection-error`)
- Write clear commit messages that describe what and why
- Create pull requests for code review before merging to `main`

## Security Practices
- Dependencies are regularly updated to fix security vulnerabilities
- Main project uses latest compatible versions of Expo and React Native
- Documentation site uses Docusaurus v3 with current dependencies
- Run `npm audit` periodically to check for new vulnerabilities
- For low risk vulnerabilities in transitive dependencies that cannot be fixed, review case-by-case
- Security updates should be prioritized over feature development