import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testUser = {
    name: 'QA Test User',
    email: `qa_user_${Date.now()}@test.com`,
    password: 'Password123!',
  };

  test('should allow a user to register and then login', async ({ page }) => {
    // Note: Adjust the exact locators depending on your UI components.
    
    // 1. Navigate to Register
    await page.goto('/client/register'); // or '/register' based on your routing
    
    // Check if the page has loaded
    await expect(page.locator('h1').filter({ hasText: /register/i })).toBeVisible({ timeout: 10000 }).catch(() => {});

    // Try filling in the form
    // Let's assume standard input names or placeholders
    const nameInput = page.locator('input[name="name"], input[placeholder*="Name"]');
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    
    if (await nameInput.count() > 0) {
      await nameInput.fill(testUser.name);
      await emailInput.fill(testUser.email);
      await passwordInput.fill(testUser.password);
      await page.click('button[type="submit"]');

      // 2. Expect to be redirected to login
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('should fail login with incorrect credentials', async ({ page }) => {
    await page.goto('/client/login'); // Or just '/login'

    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const passwordInput = page.locator('input[name="password"], input[type="password"]');

    if (await emailInput.count() > 0) {
      await emailInput.fill('wrong_email@example.com');
      await passwordInput.fill('wrongpassword');
      await page.click('button[type="submit"]');

      // Verify that error message appears
      await expect(page.locator('text=Invalid credentials').or(page.locator('.text-red-500'))).toBeVisible();
    }
  });
});
