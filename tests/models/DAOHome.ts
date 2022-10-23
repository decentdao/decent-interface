import { NavPage } from './NavPage';
import { Page } from '@playwright/test';

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

  async clickFavoriteStar() {
    await this.page.click('//div[@class="flex items-center"]//button//*[name()="svg"]');
  }
}
