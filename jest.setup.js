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
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch globally
global.fetch = jest.fn();

// Mock necessary modules
// These mocks are configured in package.json with moduleNameMapper

// Mock the expo-router navigation
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(() => true),
  },
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock Expo Constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      buildNumber: "1",
    },
    sdkVersion: "52.0.37",
  },
}));

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});