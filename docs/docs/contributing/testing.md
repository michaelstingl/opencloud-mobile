---
sidebar_position: 3
---

# Testing & Code Coverage

OpenCloud Mobile uses Jest for unit and integration testing along with @testing-library/react-native for component testing. This document outlines our testing approach, best practices, and how to run tests efficiently.

## Running Tests

We have several npm scripts for different testing scenarios:

```bash
# Run tests in watch mode (default for development)
npm test

# Run tests in fast mode (optimized performance)
npm run test:fast -- <file-pattern>

# Run tests with coverage report
npm run test:coverage

# Run HttpUtil tests only
npm run test:http

# Run tests in CI mode (for continuous integration)
npm run test:ci
```

## Test Structure

Tests are organized in `__tests__` directories next to the files they test:

```
services/
  __tests__/
    AuthService-test.ts
    OidcService-test.ts
    WebFingerService-test.ts
  api/
    __tests__/
      ApiService-test.ts
      HttpUtil-test.ts
  AuthService.ts
  OidcService.ts
  WebFingerService.ts
```

## Writing Effective Tests

### Test File Naming

- Component tests: `ComponentName-test.tsx`
- Service/utility tests: `ServiceName-test.ts`

### Component Testing

For React component testing, we use @testing-library/react-native:

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent />);
    
    // Check for specific text elements
    expect(getByText('Expected Text')).toBeTruthy();
  });
});
```

### Test Structure Example

```typescript
describe('ServiceName', () => {
  // Setup before tests
  beforeEach(() => {
    // Initialize or reset test state
  });

  // Group related tests
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange - set up test preconditions
      const input = 'some input';
      
      // Act - perform the action
      const result = ServiceName.methodName(input);
      
      // Assert - check the results
      expect(result).toBe('expected output');
    });
  });
});
```

### Mocking

Create helper functions for repeated mocks:

```typescript
// Helper functions for creating mock responses
function createMockHeaders(requestId = "test-request-id") {
  return {
    get: (name: string) => {
      if (name.toLowerCase() === 'x-request-id') {
        return requestId;
      }
      return null;
    },
    entries: () => {
      return [['content-type', 'application/json'], ['x-request-id', requestId]];
    }
  };
}

function createSuccessResponse(data: any, status = 200, statusText = "OK") {
  return {
    ok: true,
    status,
    statusText,
    json: async () => data,
    headers: createMockHeaders(),
  };
}
```

## Code Coverage

### Running Coverage Report

```bash
npm run test:coverage
```

This will generate a coverage report showing:

- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

### Coverage Goals

We aim for the following coverage metrics:

- Core services: 90%+ line coverage
- Utility functions: 80%+ line coverage
- UI components: 70%+ line coverage

### Configuration

Our coverage settings are configured in `jest.config.js`:

```javascript
collectCoverageFrom: [
  'services/**/*.ts',
  '!services/**/__tests__/**/*.ts',
  'config/**/*.ts',
  '!config/**/__tests__/**/*.ts'
],
coverageReporters: ['text', 'lcov'],
```

## Testing HTTP Services

When testing HTTP services:

1. Mock the `fetch` API using Jest mocks
2. Create helper functions for standard responses
3. Verify proper headers, request parameters, and error handling
4. Test edge cases like network errors, timeout, and unexpected responses
5. Verify that Request IDs are properly included in error objects

Example:

```typescript
// Mock fetch
global.fetch = jest.fn();

// In test setup
(global.fetch as jest.Mock).mockResolvedValueOnce(
  createSuccessResponse({ name: "test" })
);

// Then test the service
const result = await apiService.fetchData();
expect(result.name).toBe("test");

// Verify fetch was called correctly
expect(global.fetch).toHaveBeenCalledWith(
  "https://api.example.com/data",
  expect.objectContaining({
    method: "GET",
    headers: expect.objectContaining({
      "X-Request-ID": expect.any(String)
    })
  })
);
```

### Testing Error Handling with Request IDs

When testing API error handling, be sure to test that Request IDs are properly captured and included in error objects:

```typescript
describe('handleApiResponse', () => {
  it('should throw ApiError with request ID for failed responses', () => {
    // Arrange
    const response = {
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: new Headers({
        "x-request-id": "test-request-id-123"
      })
    } as Response;
    
    // Act & Assert
    try {
      ApiService.handleApiResponse(response, "Test operation");
      fail("Expected error was not thrown");
    } catch (error) {
      // Check that the error is an ApiError with the correct properties
      expect(error).toBeInstanceOf(Error);
      expect((error as ApiError).requestId).toBe("test-request-id-123");
      expect(error.message).toBe("Test operation: 404 Not Found");
    }
  });
  
  it('should use "unknown" as fallback when request ID is missing', () => {
    // Arrange
    const response = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      headers: new Headers() // No request ID header
    } as Response;
    
    // Act & Assert
    try {
      ApiService.handleApiResponse(response, "Test operation");
      fail("Expected error was not thrown");
    } catch (error) {
      // Check that the error has a fallback request ID
      expect((error as ApiError).requestId).toBe("unknown");
    }
  });
});
```

## Optimizing Test Performance

We've implemented several optimizations to improve test speed:

- `maxWorkers: '50%'` - Uses 50% of available CPU cores
- `--no-watchman` flag for fast runs
- Fake timers for timer-heavy tests
- Caching for faster repeated runs

## Code Quality and Linting

We use ESLint to maintain code quality standards. To run the linter:

```bash
npx expo lint
```

### ESLint Guidelines

- Fix all errors and warnings when possible
- When ESLint indicates unused variables or imports:
  - If they'll be needed in the future, keep them with appropriate comments
  - Use `// eslint-disable-next-line` with explanation comments

Example for documenting intentionally unused imports:
```typescript
// WebFingerService is used for discovery through OidcService's discoverConfiguration function
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { WebFingerService } from './WebFingerService';
```

Example for documenting intentionally excluded useEffect dependencies:
```typescript
useEffect(() => {
  // Effect implementation...
  
  // loadData is intentionally excluded from deps to only load data on mount
  // and prevent unnecessary API requests. Manual refresh is available via pull-to-refresh.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

For large test suites, use the `test:fast` command with a specific pattern:

```bash
npm run test:fast -- services/api
```

## Continuous Integration

The `test:ci` command is optimized for continuous integration environments. It provides:

- No watch mode
- Fail fast behavior
- JUnit report output for CI tools
- Coverage enforcement

This is typically used in GitHub Actions or other CI workflows.