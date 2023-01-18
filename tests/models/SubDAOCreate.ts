import { Page } from '@playwright/test';
import { DAOCreate } from './DAOCreate';

export class SubDAOCreate extends DAOCreate {
  readonly address: string;

  constructor(page: Page);
  constructor(page: Page, address?: string) {
    super(page);
    if (address) {
      this.address = address;
    } else {
      const url = this.url();
      const addressStart = url.lastIndexOf('daos/0x') + 5;
      this.address = url.substring(addressStart, addressStart + 64);
    }
  }

  async visit() {
    await this.visitPath('/daos/' + this.address + '/new');
    return this;
  }

  // TODO subDAO creation buttons
}
