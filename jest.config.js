/** @type {import('jest').Config} */
module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // TypeScript support
  preset: 'ts-jest',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.{js,ts}',
    '**/src/**/*.test.{js,ts}',
    '**/__tests__/**/*.{js,ts}',
    '!**/tests/**/setup.{js,ts}',
    '!**/*.vitest.test.{js,ts}',
    '!**/*.mocha.test.{js,ts}'
  ],
  
  // File extensions to process
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Transform configuration
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  
  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/jest/setup.ts'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json',
    'cobertura'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Coverage collection patterns
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/types.ts',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  
  // Test timeout
  testTimeout: 10000,
  
  // Reporter configuration
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'jest-results.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      usePathForSuiteName: true
    }]
  ],
  
  // Global configuration
  globals: {
    'ts-jest': {
      isolatedModules: true,
      useESM: false
    }
  },
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/out/',
    '/coverage/',
    '\\.d\\.ts$'
  ],
  
  // Module paths to ignore for transformation
  transformIgnorePatterns: [
    '/node_modules/(?!(vscode)/)',
  ],
  
  // Mock configuration
  clearMocks: true,
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Error reporting
  errorOnDeprecated: true,
  
  // Watch mode configuration
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/dist/',
    '/out/'
  ],
  
  // Performance configuration
  maxWorkers: '50%',
  
  // VS Code extension specific configuration
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  }
};
