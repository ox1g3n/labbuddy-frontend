export default {
  // Test environment for React components
  testEnvironment: 'jsdom',

  // Paths to search for tests
  roots: ['<rootDir>/src'],

  // File patterns to match test files
  testMatch: ['**/__tests__/**/*.jsx', '**/?(*.)+(spec|test).jsx'],

  // File extensions to consider
  moduleFileExtensions: ['js', 'jsx', 'json'],

  // Setup files after environment is set up
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Module name mapper for imports
  moduleNameMapper: {
    // Handle CSS imports (without CSS modules)
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',

    // Handle image imports
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',

    // Handle module aliases
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Transform files with Babel
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // Paths to ignore
  testPathIgnorePatterns: ['/node_modules/'],

  // Collect coverage information
  collectCoverage: true,

  // Directory for coverage reports
  coverageDirectory: 'coverage',

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'clover', 'json'],

  // Minimum coverage thresholds
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Test timeout
  testTimeout: 15000,
};
