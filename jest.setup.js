// Mock global variables that might be needed
global.__DEV__ = true;

// Skip mocking native module that might not be available
// jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Setting longer timeout for CI environments
jest.setTimeout(15000);

// Make console output less noisy in tests
global.console = {
  ...console,
  // Uncomment to silence certain console methods during tests
  // log: jest.fn(),
  // info: jest.fn(),
  // debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch globally
global.fetch = jest.fn();

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});