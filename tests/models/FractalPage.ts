import { Page } from '@playwright/test';

export enum Notification {
  Audit,
  Deploying,
  DAOCreated,
}

export abstract class FractalPage {
  readonly baseUrl = 'http://localhost:3000/#';

  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async visitPath(path: string) {
    await this.page.goto(this.baseUrl + path, { waitUntil: 'networkidle' });
  }

  async clickBrowserBackButton() {
    await this.page.goBack();
  }

  async clickBrowserReload() {
    await this.page.reload();
  }

  notificationLocator(notif: Notification) {
    switch (notif) {
      case Notification.Audit:
        return this.page.locator('[data-testid=toast-audit] button');
      case Notification.Deploying:
        return this.page.locator('#root div:has-text("Deploying Fractal...")').nth(2);
      case Notification.DAOCreated:
        return this.page.locator('#root div:has-text("Gnosis Safe Created")').nth(2);
      default:
        throw new Error('Missing Notification case!');
    }
  }

  async dismissAuditMessage() {
    await this.notificationLocator(Notification.Audit).click();
  }

  /**
   * Handles clicking a link / button which navigates to a new browser tab.
   * @param click the Promise created by clicking the link to open the tab.
   * @returns the Page object representing the new tab.
   */
  async newTab() {
    const newTab = this.page.context();
    const page = await newTab.waitForEvent('page');
    await page.bringToFront();
    return page;
  }
}
