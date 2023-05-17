import { expect, test } from '@playwright/test';
import { HomePage } from '../models/HomePage';
import { BASE_URL } from '../testUtils';

let home: HomePage;

test.beforeEach(async ({ page }) => {
  home = await new HomePage(page).visit();
});

test('home renders correctly', async () => {
  // TODO update app home spec at HomePage
});

test('home create button works', async ({ page }) => {
  await home.clickCreateAFractal();
  await expect(page).toHaveURL(BASE_URL + '/create');
});
