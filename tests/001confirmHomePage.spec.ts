import { expect, test } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';

test('Go to the Fractal App', async ({ page }) => {
  await new HomePage(page).visit();
  await expect(page.locator('[data-testid=home-pageTitle]')).toContainText('Welcome to Fractal');
  // await expect(page.locator('')).toContainText('What path will you take?'); TODO do we want a testid for this?
  await expect(page.locator('[data-testid=home-linkCreate]')).toContainText('Create a Fractal');
  await expect(page.locator('[data-testid=home-linkFind]')).toContainText('Find a Fractal');
});
