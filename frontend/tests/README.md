# 🎭 Frontend E2E Testing Suite

This directory contains the end-to-end (E2E) testing suite for the STA Chery Tunisia frontend using Playwright.

## 📁 Directory Structure

- `e2e/`: End-to-end test specifications.
- `global-setup.ts`: Global setup script to handle pre-authentication and session storage.
- `.auth/`: Directory where session state (cookies/localStorage) is stored (ignored by git).

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Playwright browsers: `npx playwright install`

### Running Tests

All commands should be run from the `frontend/` directory.

#### Run All E2E Tests (Headless)
```bash
npm run test:e2e
```

#### Run Tests in UI Mode (Interactive)
```bash
npm run test:e2e:ui
```

#### Run Tests in a Specific Browser
```bash
npm run test:e2e:chrome
npm run test:e2e:firefox
```

#### Debug Tests
```bash
npm run test:e2e:debug
```

#### View Test Report
```bash
npm run test:e2e:report
```

## 🛠 Configuration

- `playwright.config.ts`: Main Playwright configuration file.
- `tests/global-setup.ts`: Handles test user registration and login to avoid repeating auth in every test.

## 📝 Best Practices

1. **Use Data Attributes**: Prefer `data-testid` for robust locators.
2. **Keep Tests Atomic**: Each test should focus on a single feature or flow.
3. **Handle Flakiness**: Use `page.waitForSelector()` or `expect().toBeVisible()` with appropriate timeouts.
4. **Clean State**: Each test should ideally start with a fresh state or navigate to a known URL.
