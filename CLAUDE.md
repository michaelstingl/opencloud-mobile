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
- `/context` - React context providers for state management
  - `/context/ThemeContext.tsx` - Theme state management (light/dark/system)
- `/hooks` - Custom React hooks
  - `/hooks/useThemeColor.ts` - Hook for accessing theme colors with fallbacks
- `/services` - API services and data handling
  - `/services/WebFingerService.ts` - WebFinger discovery for OpenID Connect
  - `/services/OidcService.ts` - OpenID Connect operations
  - `/services/AuthService.ts` - Authentication coordination
  - `/services/api/ApiService.ts` - API client for server communication
  - `/services/api/HttpUtil.ts` - HTTP utilities for requests, logging, and debugging
- `/themes` - Theme-related definitions
  - `/themes/colors.ts` - Color definitions for light and dark themes
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

### Running Tests with Mocks

- Run specific tests with configuration file: `npm test hooks/__tests__/useThemeColor-test.ts -- --config=jest.config.js`
- Mock modules are defined in the `/__mocks__` directory:
  - `/__mocks__/asyncStorageMock.js` - Simulates AsyncStorage
  - `/__mocks__/useColorSchemeMock.js` - Simulates React Native's useColorScheme
- The Jest config maps module paths to mocks:
  ```javascript
  moduleNameMapper: {
    "@react-native-async-storage/async-storage": "<rootDir>/__mocks__/asyncStorageMock.js",
    "react-native/Libraries/Utilities/useColorScheme": "<rootDir>/__mocks__/useColorSchemeMock.js"
  }
  ```

## API Communication
- All HTTP requests use the unified `HttpUtil.performRequest()` method
- Standard logging for all requests including:
  - Request URL, method, headers, and body
  - Response status, headers, and body
  - Request/response timing
  - Curl command generation for debugging
- Secure handling of sensitive information (tokens are automatically redacted)
- Request IDs are used for request tracking and correlation:
  - Every request automatically gets a unique X-Request-ID header
  - API errors include the Request ID for easier debugging
  - The ApiService.handleApiResponse method provides consistent error handling with Request IDs
  - Error messages in the UI include Request IDs in development mode
- Error handling best practices:
  - Use the ApiError interface for typed error handling
  - Always extract and include Request IDs in error messages
  - Use meaningful user-facing error messages instead of fallback data
  - Follow the DRY principle with shared error handling methods
- Mock data mode with detailed logging:
  - Use `ApiService.enableMockDataMode(mockToken, mockServerUrl)` to enable
  - Mock requests and responses are logged with 🔶 visual markers
  - Mock requests use the same logging format as real requests
  - Detailed logging only shown in development mode
  - Simulated curl commands for mock requests are generated
  - Great for testing without a real server or in demo mode
- Graph API endpoints follow Microsoft Graph API structure
  - User information: `/graph/v1.0/me?$expand=memberOf`
  - Drives/spaces: `/graph/v1.0/drives`

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
- When ESLint indicates unused variables or imports:
  - If they'll be needed in the future or are implicitly used, keep them with appropriate comments
  - Add explanatory ESLint-disable comments to document why rules are ignored
  - Example: `// eslint-disable-next-line @typescript-eslint/no-unused-vars`
- When excluding useEffect dependencies:
  - Document the reason with clear comments explaining the decision
  - Example: `// loadData is intentionally excluded to only load on mount`

## Theming
- The app uses a dynamic theming system supporting 3 modes: Light, Dark, and System
- Theme state is managed through React Context in `/context/ThemeContext.tsx`
- Theme persistence uses AsyncStorage to remember user preferences between sessions
- Color definitions are in `/themes/colors.ts` with matching props in both themes:
  - Base colors: text, background, tint, etc.
  - UI Elements: surface, surfaceVariant, border, etc.
  - Status colors: success, warning, error, info
  - Button variants: regular, disabled, etc.
- Access theme colors using the `useThemeColor` hook:
  ```typescript
  const themeColors = colors[effectiveTheme];
  ```
- For dynamic styling, use style arrays with theme values:
  ```typescript
  <Text style={[styles.title, { color: themeColors.text }]}>Title</Text>
  ```
- Proper fallbacks are implemented for when themes change or system theme is used

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
  - `api`: API communication settings (timeouts, logging, headers)
- Logging configuration:
  - `maxBodyLogLength`: Maximum number of characters to log for request/response bodies
  - `generateCurlCommands`: Automatically enabled in development mode, generates curl commands for API requests
  - `enableDebugLogging`: Automatically enabled in development mode, provides detailed logs
- Import configuration in components:
  ```typescript
  import { authConfig, apiConfig } from '../config/app.config';
  ```

## Git Workflow & Best Practices

### Branch Strategy
- Create feature branches from `main` branch
- Use descriptive branch names with prefixes:
  - `feature/feature-name` for new features
  - `fix/issue-name` for bug fixes
  - `docs/topic-name` for documentation updates
  - `refactor/component-name` for code refactoring
  - `test/component-name` for adding/improving tests

### Pull Request Process
1. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-new-feature main
   ```

2. **Make changes** and run tests locally:
   ```bash
   npm test
   # or for specific tests
   npm run test:fast -- path/to/test.ts
   ```

3. **Commit changes** with clear messages:
   ```bash
   git commit -m "Add feature X that does Y to solve Z"
   ```

4. **Push changes** to GitHub:
   ```bash
   git push origin feature/my-new-feature
   ```

5. **Create a Pull Request** via GitHub UI
   - Add a descriptive title and detailed description
   - Reference any related issues with `#issue-number`
   - GitHub Actions will automatically run tests on your PR

6. **Wait for CI checks** to pass:
   - Tests (Jest)
   - Code coverage thresholds
   - Linting rules

7. **Request reviews** from team members

8. **Address review feedback** with additional commits

9. **Merge only when**:
   - All tests pass in GitHub Actions
   - Code coverage thresholds are met (currently 80%)
   - PR has been approved by at least one reviewer
   - All discussions are resolved

10. **Delete branch** after merging

### Important Rules
- Never push untested code directly to `main`
- Always use pull requests for code changes
- Prefer small, focused pull requests over large ones
- Update tests alongside code changes
- Maintain or improve code coverage
- Document new features in appropriate documentation files

## Security Practices
- Dependencies are regularly updated to fix security vulnerabilities
- Main project uses latest compatible versions of Expo and React Native
- Documentation site uses Docusaurus v3 with current dependencies
- Run `npm audit` periodically to check for new vulnerabilities
- For low risk vulnerabilities in transitive dependencies that cannot be fixed, review case-by-case
- Security updates should be prioritized over feature development