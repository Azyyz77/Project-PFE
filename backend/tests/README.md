# 🧪 Backend Testing Suite

This directory contains the automated test suite for the STA Chery Tunisia backend.

## 📁 Directory Structure

- `unit/`: Unit tests that run in isolation (no database or network required). Fast and reliable.
- `integration/`: Tests that verify the interaction between components (API endpoints, database queries).
- `api/`: High-level tests for API endpoints using Supertest.
- `db/`: Tests for database connection and edge cases.
- `load/`: Load and performance tests using Artillery.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- SQL Server (for integration and API tests)
- [Artillery](https://www.artillery.io/) (for load tests): `npm install -g artillery`

### Running Tests

All commands should be run from the `backend/` directory.

#### Run All Tests
```bash
npm test
```

#### Run Unit Tests Only (Fast)
```bash
npm run test:unit
```

#### Run Integration Tests
```bash
npm run test:integration
```

#### Generate Coverage Report
```bash
npm run test:coverage
```
The report will be available in the `coverage/` directory.

#### Run Load Tests
```bash
npm run test:load
```

## 🛠 Configuration

- `jest.config.js`: Main Jest configuration file.
- `tests/setup.js`: Global setup and teardown for Jest tests.
- `tests/load/artillery.yml`: Configuration for Artillery load tests.

## 📝 Best Practices

1. **Write Unit Tests First**: For new logic, start with a unit test in `tests/unit/`.
2. **Mock External Dependencies**: Use `jest.mock()` to isolate the code under test.
3. **Keep Tests Independent**: Each test should be able to run on its own.
4. **Clean Up After Tests**: Ensure any database changes are rolled back or cleaned up in `afterEach` or `afterAll`.
