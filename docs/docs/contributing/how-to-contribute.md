---
sidebar_position: 1
---

# How to Contribute

We're excited that you're interested in contributing to OpenCloud Mobile! This document will guide you through the process of contributing to the project.

## Getting Started

### Prerequisites

Before you begin, make sure you have the following installed:

- Node.js (LTS version recommended)
- npm or yarn
- Git
- Xcode (for iOS development)
- Android Studio (for Android development)

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/opencloud-mobile.git
   cd opencloud-mobile
   ```
3. Add the original repository as a remote:
   ```bash
   git remote add upstream https://github.com/michaelstingl/opencloud-mobile.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/your-bugfix-name
   ```

2. Make your changes and commit them with clear, descriptive commit messages:
   ```bash
   git commit -m "Add feature: your feature description"
   ```

3. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request from your fork to the main repository

## Code Style Guidelines

Please follow the code style guidelines defined in the project:

- Use TypeScript with strict type checking
- Follow React Native / Expo best practices
- Use functional components with hooks instead of class components
- Use named exports rather than default exports where appropriate
- Follow consistent naming conventions:
  - Components: PascalCase (e.g., `LoginScreen`, `FileList`)
  - Functions/variables: camelCase
  - Constants: UPPER_SNAKE_CASE
- Handle errors with try/catch and appropriate user feedback
- Keep components focused on a single responsibility

## Testing

Before submitting your changes, make sure to run the tests:

```bash
npm test
```

### Writing Tests

We use Jest for testing. When adding new features, please include appropriate tests:

1. **Unit Tests** for individual functions and components
2. **Integration Tests** for features that span multiple components
3. **Snapshot Tests** for UI components

Tests should be placed in `__tests__` directories next to the code they're testing. Test files should follow the naming pattern `ComponentName-test.tsx` or `ServiceName-test.ts`.

Example test structure:

```typescript
import { YourService } from '../YourService';

// Mock external dependencies
jest.mock('../OtherService');
global.fetch = jest.fn();

describe('YourService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      // ...
      
      // Act
      const result = YourService.methodName();
      
      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

For examples, see the authentication service tests in `services/__tests__/`.

## Pull Request Process

1. Update the README.md or documentation with details of your changes if needed
2. Make sure your code follows the style guidelines
3. Make sure all tests pass
4. The PR should work for both iOS and Android platforms

## Code of Conduct

Please note that this project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Questions?

If you have any questions, feel free to create an issue or reach out to the maintainers.