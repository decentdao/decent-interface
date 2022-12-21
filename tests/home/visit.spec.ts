import { expect, test } from '@playwright/test';
import { HomePage } from '../models/HomePage';

let home: HomePage;

test.beforeEach(async ({ page }) => {
  home = await new HomePage(page).visit();
  await home.dismissAuditMessage();
});

test('home renders correctly, disconnected', async ({ page }) => {
  await expect(page.locator('[data-testid=home-pageTitleDisconnected]')).toBeVisible();
  await expect(page.locator('[data-testid=home-pageSubtitleDisconnected]')).toBeVisible();
  await expect(page.locator('[data-testid=home-linkConnect]')).toBeVisible();
  await expect(page.locator('[data-testid=home-linkFAQ]')).toBeVisible();
  await expect(page.locator('[data-testid=home-linkDiscord]')).toBeVisible();
  await expect(page.locator('[data-testid=home-linkDocs]')).toBeVisible();

  await expect(page.locator('[data-testid=home-pageSubtitleConnected]')).toBeHidden();
  await expect(page.locator('[data-testid=home-linkCreate]')).toBeHidden();
});

test('home renders correctly, connected', async ({ page }) => {
  await home.connectToWallet(); // connect via the dropdown menu

  await expect(page.locator('[data-testid=home-pageSubtitleConnected]')).toBeVisible();
  await expect(page.locator('[data-testid=home-linkCreate]')).toBeVisible();
  await expect(page.locator('[data-testid=home-linkFAQ]')).toBeVisible();
  await expect(page.locator('[data-testid=home-linkDiscord]')).toBeVisible();
  await expect(page.locator('[data-testid=home-linkDocs]')).toBeVisible();

  await expect(page.locator('[data-testid=home-pageTitleDisconnected]')).toBeHidden();
  await expect(page.locator('[data-testid=home-pageSubtitleDisconnected]')).toBeHidden();
  await expect(page.locator('[data-testid=home-linkConnect]')).toBeHidden();
});

test('home connection button renders correctly', async ({ page }) => {
  await home.clickConnectWallet().then(() => home.clickWalletLocalNode());

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
  await home.connectToWallet(); // connect via the dropdown menu
  await home.clickCreateAFractal();
  await expect(page).toHaveURL(home.baseUrl + '/create');
});

test('FAQ button works', async () => {
  const tab = await home.clickFAQNewTab();
  await expect(tab).toHaveURL(
    'https://docs.fractalframework.xyz/welcome-to-fractal/user-guides/faq'
  );
});

test('Discord button works', async () => {
  const tab = await home.clickDiscordNewTab();
  await expect(tab).toHaveURL('https://discord.com/invite/decent-dao');
});

test('Docs button works', async () => {
  const tab = await home.clickDocsNewTab();
  await expect(tab).toHaveURL(
    'https://docs.fractalframework.xyz/welcome-to-fractal/the-core-framework/developer-overview'
  );
});
