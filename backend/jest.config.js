module.exports = {
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  forceExit: true,
  testTimeout: 30000,

  // ── Test Discovery ──────────────────────────────────────────────────────
  testMatch: [
    '**/tests/unit/**/*.test.js',
    '**/tests/integration/**/*.test.js',
    '**/tests/api/**/*.test.js',
    '**/tests/db/**/*.test.js',
  ],

  // ── Setup ───────────────────────────────────────────────────────────────
  setupFilesAfterEnv: ['./tests/setup.js'],

  // ── Coverage ────────────────────────────────────────────────────────────
  collectCoverageFrom: [
    'middleware/**/*.js',
    'controllers/**/*.js',
    'services/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!**/*.config.js',
    '!server.js',       // Entry point — tested via integration, not unit
    '!**/migrations/**',
    '!**/scripts/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches:   5,
      functions:  5,
      lines:      5,
      statements: 5,
    },
  },

  // ── Projects: separate unit tests (fast, always run) from integration ───
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/tests/unit/**/*.test.js'],
      testEnvironment: 'node',
      clearMocks: true,
    },
    {
      displayName: 'integration',
      testMatch: [
        '**/tests/api/**/*.test.js',
        '**/tests/integration/**/*.test.js',
        '**/tests/db/**/*.test.js',
      ],
      testEnvironment: 'node',
      clearMocks: true,
      setupFilesAfterEnv: ['./tests/setup.js'],
      testTimeout: 30000,
    },
  ],
};
