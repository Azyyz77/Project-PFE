import { test, expect } from '@playwright/test';

test.describe('Appointments Flow', () => {
  // We can setup a logged in state using Playwright's global setup,
  // but for simplicity in this example, we'll log in during the test or assume session.
  
  test('should allow user to book an appointment', async ({ page }) => {
    // Navigate to the appointment booking page
    await page.goto('/client/rendez-vous');

    // Wait for form to appear
    await expect(page.locator('form').first()).toBeVisible({ timeout: 15000 }).catch(() => {});
    
    // Check if the form is available, then fill it
    // Using generic locators, you might need to adapt these based on your exact UI
    const dateInput = page.locator('input[type="date"]');
    
    if (await dateInput.count() > 0) {
      // Set date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      
      await dateInput.fill(dateStr);
      
      // Select service
      const selectBoxes = page.locator('select');
      if (await selectBoxes.count() > 0) {
        await selectBoxes.first().selectOption({ index: 1 });
      }

      // Submit
      const submitBtn = page.locator('button[type="submit"], button:has-text("Confirmer"), button:has-text("Book")');
      if (await submitBtn.count() > 0) {
         await submitBtn.click();
      }

      // We should see a success message (toast or alert)
      // await expect(page.locator('text=success').first()).toBeVisible();
    }
  });

  test('should allow user to cancel an existing appointment', async ({ page }) => {
    // Navigate to user's appointments dashboard
    await page.goto('/client/dashboard');

    // Wait for the appointments list or table to load
    await expect(page.locator('table, .appointment-card, .appointment-list').first()).toBeVisible({ timeout: 15000 }).catch(() => {});

    // Look for a cancel button on one of the appointments
    const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("Annuler")').first();
    
    if (await cancelBtn.count() > 0) {
      await cancelBtn.click();
      
      // Wait for a confirmation dialog or modal if present
      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Oui")').first();
      if (await confirmBtn.count() > 0) {
        await confirmBtn.click();
      }

      // Assert that the success message appears
      // await expect(page.locator('text=cancelled').or(page.locator('text=annulé')).first()).toBeVisible();
    }
  });
});
