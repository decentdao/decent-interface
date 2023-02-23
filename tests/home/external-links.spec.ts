import { expect, test } from '@playwright/test';
import { HomePage } from '../models/HomePage';

let home: HomePage;

test.beforeEach(async ({ page }) => {
  home = await new HomePage(page).visit();
});

test('FAQ button works', async () => {
  const tab = await home.clickFAQNewTab();
  await expect(tab).toHaveURL(
    'https://docs.fractalframework.xyz/welcome-to-fractal/user-guides/faq'
  );
});

test('Discord button works', async () => {
  const tab = await home.clickDiscordNewTab();
  await expect(tab).toHaveURL('https://discord.com/invite/zARyBCWgZd');
});

test('Docs button works', async () => {
  const tab = await home.clickDocsNewTab();
  await expect(tab).toHaveURL('https://docs.fractalframework.xyz/welcome-to-fractal/');
});
