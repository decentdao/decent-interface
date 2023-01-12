import { expect, test } from '@playwright/test';
import { HomePage } from '../models/HomePage';
import { BASE_URL } from '../testUtils';

let home: HomePage;

test.beforeEach(async ({ page }) => {
  home = await new HomePage(page).visit();
});

test('home renders correctly, connected', async ({ page }) => {
  await page.waitForSelector('[data-testid=home-pageSubtitleConnected]');
  await expect(page.locator('[data-testid=home-pageSubtitleConnected]')).toBeVisible();
  await expect(page.locator('[data-testid=home-linkCreate]')).toBeVisible();
  await expect(page.locator('[data-testid=home-linkFAQ]')).toBeVisible();
  await expect(page.locator('[data-testid=home-linkDiscord]')).toBeVisible();
  await expect(page.locator('[data-testid=home-linkDocs]')).toBeVisible();

  await expect(page.locator('[data-testid=home-pageTitleDisconnected]')).toBeHidden();
  await expect(page.locator('[data-testid=home-pageSubtitleDisconnected]')).toBeHidden();
  await expect(page.locator('[data-testid=home-linkConnect]')).toBeHidden();
});

test('home create button works', async ({ page }) => {
  await home.clickCreateAFractal();
  await expect(page).toHaveURL(BASE_URL + '/create');
});

test('FAQ button works', async ({ page }) => {
  await page.waitForSelector('[data-testid=home-pageSubtitleConnected]');
  const tab = await home.clickFAQNewTab();
  await expect(tab).toHaveURL(
    'https://docs.fractalframework.xyz/welcome-to-fractal/user-guides/faq'
  );
});

test('Discord button works', async ({ page }) => {
  await page.waitForSelector('[data-testid=home-pageSubtitleConnected]');
  const tab = await home.clickDiscordNewTab();
  await expect(tab).toHaveURL('https://discord.com/invite/decent-dao');
});

test('Docs button works', async ({ page }) => {
  await page.waitForSelector('[data-testid=home-pageSubtitleConnected]');
  const tab = await home.clickDocsNewTab();
  await tab.waitForTimeout(1000);
  await expect(tab).toHaveURL('https://docs.fractalframework.xyz/welcome-to-fractal/');
});
