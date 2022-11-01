import { Locator, Page } from '@playwright/test';

export class DaoSafe {
  readonly page: Page;

  readonly gnosisDao: Locator;

  constructor(page: Page) {
    this.page = page;
    this.gnosisDao = page.locator('(//div[@class="flex items-center"])[2]');
  }

  async selectSafe(fieldName: any) {
    switch (fieldName) {
      case 'Select Gnosis 1:1 Safe':
        await this.gnosisDao.click();
        break;
      default:
        throw new Error('This safe can not be found...');
    }
  }
}
