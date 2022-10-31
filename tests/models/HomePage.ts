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

  clickFAQNewTab() {
    return this.newTab(this.page.click('[data-testid=home-linkFAQ]'));
  }

  clickDiscordNewTab() {
    return this.newTab(this.page.click('[data-testid=home-linkDiscord]'));
  }

  clickDocsNewTab() {
    return this.newTab(this.page.click('[data-testid=home-linkDocs]'));
  }
}
