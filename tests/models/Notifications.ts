import { expect, Locator, Page } from '@playwright/test';

export class Notifications {
  readonly page: Page;

  readonly auditMessage: Locator;

  readonly deployMessage: Locator;

  readonly doaCreated: Locator;

  constructor(page: Page) {
    this.page = page;
    this.auditMessage = page.locator('div[role="alert"] button:has-text("* * *Accept")');
    this.deployMessage = page.locator('#root div:has-text("Deploying Fractal...")').nth(2);
    this.doaCreated = page.locator('#root div:has-text("DAO Created") >> nth=2');
  }

  async assertDeployed() {
    await expect(this.deployMessage).toBeVisible();
    await expect(this.deployMessage).toContainText('Deploying Fractal...');
  }

  async assertCreated() {
    await expect(this.doaCreated).toBeVisible();
    await expect(this.doaCreated).toContainText('DAO Created');
  }

  async closeButton(buttonName: any) {
    switch (buttonName) {
      case 'Close Audit Message':
        await this.auditMessage.click();
        break;
      default:
        throw new Error('This message button can not be found...');
    }
  }
}
