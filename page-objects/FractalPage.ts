import { Page } from '@playwright/test';

export enum Notification {
  Audit,
  Connected,
  Deploying,
  DAOCreated,
}

export class FractalPage {
  readonly baseUrl = 'http://localhost:3000/#';

  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async visitPath(path: string) {
    await this.page.goto(this.baseUrl + path, { waitUntil: 'networkidle' });
  }

  async clickBrowerBackButton() {
    await this.page.goBack();
  }

  async clickBrowerReload() {
    await this.page.reload();
  }

  notificationLocator(notif: Notification) {
    switch (notif) {
      case Notification.Audit:
        return this.page.locator('div[role="alert"] button:has-text("* * *Accept")');
      case Notification.Connected:
        return this.page.locator('#connected');
      case Notification.Deploying:
        return this.page.locator('#root div:has-text("Deploying Fractal...")').nth(2);
      case Notification.DAOCreated:
        return this.page.locator('#root div:has-text("Gnosis Safe Created")').nth(2);
      default:
        throw new Error('Missing Notification case!');
    }
  }

  async dismissConnectedMessage() {
    await this.notificationLocator(Notification.Connected).click();
  }

  async dismissAuditMessage() {
    await this.notificationLocator(Notification.Audit).click();
  }
}
