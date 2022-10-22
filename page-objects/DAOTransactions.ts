import { NavPage } from './NavPage';
import { Page } from '@playwright/test';

export class DAOTransactions extends NavPage {
  readonly address: string;

  constructor(page: Page, address: string) {
    super(page);
    this.address = address;
  }

  async visit() {
    await super.visitPath('/daos/' + this.address + '/transactions/new');
    return this;
  }
}
