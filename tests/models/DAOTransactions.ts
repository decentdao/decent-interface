import { Page } from '@playwright/test';
import { NavPage } from './NavPage';

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
