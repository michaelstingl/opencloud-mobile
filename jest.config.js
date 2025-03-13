module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/ios/',
    '/android/',
    'app/test.tsx',
    'app/__tests__/test-test.tsx',
    'services/__tests__/utils/testUtils.ts'
  ],
  collectCoverageFrom: [
    'services/**/*.ts',
    '!services/**/__tests__/**/*.ts',
    'config/**/*.ts',
    '!config/**/__tests__/**/*.ts'
  ],
  coverageReporters: ['text', 'lcov'],
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  // Module mapping for path aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  // Speed optimizations
  maxWorkers: '50%', // Use 50% of available CPU cores
  fakeTimers: {
    enableGlobally: true
  }, // Use fake timers for faster execution
  cache: true, // Enable cache
  watchPathIgnorePatterns: [ // Don't watch these paths in watch mode
    'node_modules',
    'coverage'
  ]
};