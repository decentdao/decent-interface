import { Page } from '@playwright/test';
import { NavPage } from './NavPage';

export class DAOHome extends NavPage {
  readonly address: string;

  constructor(page: Page, address: string) {
    super(page);
    this.address = address;
  }

  async visit() {
    await super.visitPath('/daos/' + this.address);
    return this;
  }

  selectorDAOInfo = this.page.locator('[data-testid=DAOInfo-name]');

  async clickFavoriteStar() {
    await this.page.click('//div[@class="flex items-center"]//button//*[name()="svg"]');
  }
}
