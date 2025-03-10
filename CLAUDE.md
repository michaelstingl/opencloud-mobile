# Development Guidelines for OpenCloud iOS

## Build & Development Commands
- Start development server: `npx expo start` or `expo start`
- Run on iOS simulator: `expo run:ios`
- Run on Android emulator: `expo run:android`
- Run in web browser: `expo start --web`
- Run tests: `jest --watchAll`
- Run single test: `jest -t "test name"`
- Lint code: `expo lint`
- Reset project: `node ./scripts/reset-project.js`

## Code Style Guidelines
- Use TypeScript with strict type checking
- Follow React Native / Expo best practices with file-based routing (expo-router)
- Use functional components with hooks instead of class components
- Organize imports: React first, then external libraries, then local imports
- Use named exports rather than default exports where appropriate
- Follow consistent naming conventions:
  - Components: PascalCase (e.g., ThemedText)
  - Functions/variables: camelCase
  - Constants: UPPER_SNAKE_CASE
- Handle errors with try/catch and appropriate user feedback
- Use path aliases (@/* instead of relative imports) for cleaner imports
- Keep components focused on a single responsibility
- Store tests in `__tests__` directories with naming pattern `ComponentName-test.tsx`
- Write meaningful comments for complex logic