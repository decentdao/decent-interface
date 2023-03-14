import { Page } from '@playwright/test';
import { NavPage } from './NavPage';

export class DAOHome extends NavPage {
  readonly address: string;

  constructor(page: Page);
  constructor(page: Page, address?: string) {
    super(page);
    if (address) {
      this.address = address;
    } else {
      const url = this.url();
      this.address = url.substring(url.lastIndexOf('/') + 1);
    }
  }

  async visit() {
    await this.visitPath('/daos/' + this.address);
    return this;
  }

  async clickFavoriteStar() {
    await this.clickTestId('DAOInfo-favorite');
  }
}
