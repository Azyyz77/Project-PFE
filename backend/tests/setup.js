// This file is executed before tests
// Setup environment variables or global mocks here if needed.
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { closeConnection } = require('../config/database');

beforeAll(() => {
  // If you need to establish a global db connection before tests, you could do it here
});

afterAll(async () => {
  // Close database connections
  await closeConnection();
});
