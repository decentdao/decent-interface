import { expect, test } from '@playwright/test';
import { HomePage } from '../models/HomePage';

test.describe('Visit site', async () => {
  test('app renders correctly', async ({ page }) => {
    await new HomePage(page).visit();
    await expect(page.locator('[data-testid=home-pageTitle]')).toContainText('Welcome to Fractal');
    await expect(page.locator('[data-testid=home-linkCreate]')).toContainText('Create a Fractal');
    await expect(page.locator('[data-testid=home-linkFind]')).toContainText('Find a Fractal');
  });
});
