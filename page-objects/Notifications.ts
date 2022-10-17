import { expect, Locator, Page } from '@playwright/test';

export class Notifications {
  readonly page: Page;

  readonly toasterMessage: Locator;

  readonly auditMessage: Locator;

  readonly deployMessage: Locator;

  readonly doaCreated: Locator;

  constructor(page: Page) {
    this.page = page;
    this.toasterMessage = page.locator('#connected');
    this.auditMessage = page.locator('div[role="alert"] button:has-text("* * *Accept")');
    this.deployMessage = page.locator('#root div:has-text("Deploying Fractal...")').nth(2);
    this.doaCreated = page.locator('#root div:has-text("DAO Created") >> nth=2');
  }

  async assertConnected() {
    await expect(this.toasterMessage).toBeVisible();
    await expect(this.toasterMessage).toContainText('Connected');
    await this.page.waitForLoadState('networkidle');
  }

  async assertDeployed() {
    await expect(this.deployMessage).toBeVisible();
    await expect(this.deployMessage).toContainText('Deploying Fractal...');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async assertCreated() {
    await expect(this.doaCreated).toBeVisible();
    await expect(this.doaCreated).toContainText('DAO Created');
  }

  async closeButton(buttonName: any) {
    switch (buttonName) {
      case 'Close Audit Message':
        await this.auditMessage.click();
        await this.page.waitForLoadState();
        break;
      default:
        throw new Error('This message button can not be found...');
    }
  }
}
