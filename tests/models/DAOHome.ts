import { Page } from '@playwright/test';
import { NavPage } from './NavPage';

export class DAOHome extends NavPage {
  readonly address: string;

  constructor(page: Page, address: string) {
    super(page);
    this.address = address;
  }

  async visit() {
    await this.visitPath('/daos/' + this.address);
    return this;
  }

  async clickFavoriteStar() {
    await this.clickTestId('DAOInfo-favorite');
  }
}
