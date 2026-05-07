import { chromium, FullConfig } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Playwright Global Setup
 * 
 * Runs ONCE before any test. Registers/logs in a test user and saves
 * the browser storage state so individual tests can reuse it via:
 *   use: { storageState: 'tests/.auth/user.json' }
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = `e2e_setup_${Date.now()}@test.com`;
const TEST_PASSWORD = 'Password123!';

// Save auth state to this file so tests can reference it
export const AUTH_FILE = path.join(__dirname, '.auth', 'user.json');

async function globalSetup(config: FullConfig) {
  // Ensure .auth directory exists
  const authDir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('[Global Setup] Attempting to register test user:', TEST_EMAIL);

  try {
    // ── Step 1: Register via API (direct fetch, faster than UI) ────────────
    const registerRes = await page.request.post(`${BASE_URL}/api/users/register`, {
      data: {
        nom: 'E2E',
        prenom: 'Setup',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        telephone: `55${Math.floor(100000 + Math.random() * 900000)}`
      },
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('[Global Setup] Register status:', registerRes.status());

    // ── Step 2: Login via UI to capture real session cookies/localStorage ──
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    if (await emailInput.count() > 0) {
      await emailInput.fill(TEST_EMAIL);
      await passwordInput.fill(TEST_PASSWORD);
      await submitBtn.click();

      // Wait for redirect after successful login (middleware may redirect to /client or /verify-phone)
      await page.waitForURL(/dashboard|client|verify/, { timeout: 10000 }).catch(() => {});
      console.log('[Global Setup] Login complete, URL:', page.url());
    } else {
      console.warn('[Global Setup] Login form not found, skipping UI login step');
    }

    // ── Step 3: Save storage state ─────────────────────────────────────────
    await context.storageState({ path: AUTH_FILE });
    console.log('[Global Setup] Auth state saved to:', AUTH_FILE);

  } catch (error) {
    console.error('[Global Setup] Error during setup:', error);
    // Don't fail the entire test suite if setup fails
    // Create an empty state file so tests can still run
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }));
  } finally {
    await browser.close();
  }
}

export default globalSetup;
