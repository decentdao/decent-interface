import { expect, test } from '@playwright/test';
import { HomePage } from '../models/HomePage';
import { BASE_URL } from '../testUtils';

let home: HomePage;

test.beforeEach(async ({ page }) => {
  home = await new HomePage(page).visit();
});

test('home renders correctly, connected', async () => {
  home.expectId('home-pageSubtitleConnected').toBeVisible();
  home.expectId('home-linkCreate').toBeVisible();
  home.expectId('home-linkFAQ').toBeVisible();
  home.expectId('home-linkDiscord').toBeVisible();
  home.expectId('home-linkDocs').toBeVisible();

  home.expectId('home-pageTitleDisconnected').toBeHidden();
  home.expectId('home-pageSubtitleDisconnected').toBeHidden();
  home.expectId('home-linkConnect').toBeHidden();
});

test('home renders correctly, disconnected', async () => {
  await home.clickAccountMenu().then(() => home.clickAccountDisconnect());

  home.expectId('home-pageTitleDisconnected').toBeVisible();
  home.expectId('home-pageSubtitleDisconnected').toBeVisible();
  home.expectId('home-linkConnect').toBeVisible();
  home.expectId('home-linkFAQ').toBeVisible();
  home.expectId('home-linkDiscord').toBeVisible();
  home.expectId('home-linkDocs').toBeVisible();

  home.expectId('home-pageSubtitleConnected').toBeHidden();
  home.expectId('home-linkCreate').toBeHidden();
});

test('home create button works', async ({ page }) => {
  await home.clickCreateAFractal();
  await expect(page).toHaveURL(BASE_URL + '/create');
});

test('FAQ button works', async () => {
  const tab = await home.clickFAQNewTab();
  await expect(tab).toHaveURL(
    'https://docs.fractalframework.xyz/welcome-to-fractal/user-guides/faq'
  );
});

test('Discord button works', async () => {
  const tab = await home.clickDiscordNewTab();
  await expect(tab).toHaveURL('https://discord.com/invite/Zh2emKspVF');
});

test('Docs button works', async () => {
  const tab = await home.clickDocsNewTab();
  await expect(tab).toHaveURL('https://docs.fractalframework.xyz/welcome-to-fractal/');
});
