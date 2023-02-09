import { expect, test } from '@playwright/test';
import { HomePage } from '../models/HomePage';
import { BASE_URL } from '../testUtils';

let home: HomePage;

test.beforeEach(async ({ page }) => {
  home = await new HomePage(page).visit();
});

test('home renders correctly, connected', async () => {
  await home.expectId('home-pageSubtitleConnected').toBeVisible();
  await home.expectId('home-linkCreate').toBeVisible();
  await home.expectId('home-linkFAQ').toBeVisible();
  await home.expectId('home-linkDiscord').toBeVisible();
  await home.expectId('home-linkDocs').toBeVisible();

  await home.expectId('home-pageTitleDisconnected').toBeHidden();
  await home.expectId('home-pageSubtitleDisconnected').toBeHidden();
  await home.expectId('home-linkConnect').toBeHidden();
});

test('home renders correctly, disconnected', async () => {
  await home.clickAccountMenu();
  await home.clickAccountDisconnect();
  await home.expectId('home-pageTitleDisconnected').toBeVisible();
  await home.expectId('home-pageSubtitleDisconnected').toBeVisible();
  await home.expectId('home-linkConnect').toBeVisible();
  await home.expectId('home-linkFAQ').toBeVisible();
  await home.expectId('home-linkDiscord').toBeVisible();
  await home.expectId('home-linkDocs').toBeVisible();

  await home.expectId('home-pageSubtitleConnected').toBeHidden();
  await home.expectId('home-linkCreate').toBeHidden();
});

test('home create button works', async ({ page }) => {
  await home.clickCreateAFractal();
  await expect(page).toHaveURL(BASE_URL + '/create');
});
