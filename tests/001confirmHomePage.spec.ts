import { expect, test } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';

test('Go to the Fractal App', async ({ page }) => {
  await new HomePage(page).visit();
  await expect(page.locator('h1')).toContainText('Welcome');
  await expect(page.locator('p')).toContainText('What path will you take?');
  await page.isVisible('id=home:link-create');
  await page.isVisible('id=home:link-find');
});
