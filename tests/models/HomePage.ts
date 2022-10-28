import { DAOCreate } from './DAOCreate';
import { NavPage } from './NavPage';

export class HomePage extends NavPage {
  async visit() {
    await super.visitPath('');
    return this;
  }

  async clickConnectWallet() {
    await this.page.click('[data-testid=home-linkConnect]');
  }

  async clickCreateAFractal() {
    await this.page.click('[data-testid=home-linkCreate]');
    return new DAOCreate(this.page);
  }

  async clickFAQ() {
    await this.page.click('[data-testid=home-linkFAQ]');
  }

  async clickDiscord() {
    await this.page.click('[data-testid=home-linkDiscord]');
  }

  async clickDocs() {
    await this.page.click('[data-testid=home-linkDocs]');
  }
}
