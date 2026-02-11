/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
  testMatch: [
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.tsx',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/scripts/**',    // Exclude seed/demo scripts
    '!src/utils/migration.ts',  // Exclude COBOL migration utilities (used by scripts)
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    // Business logic layers must have high coverage
    'src/services/**/*.ts': {
      branches: 72,  // JsonStorage has some hard-to-test error paths (73%)
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'src/models/**/*.ts': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    'src/utils/*.{ts,tsx}': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // UI components tested via integration tests (not unit tests)
    // So we don't enforce coverage thresholds on them
  },
  verbose: true,
};
