module.exports = {
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  coverageDirectory: 'coverage',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./tests/setup.js']
};
