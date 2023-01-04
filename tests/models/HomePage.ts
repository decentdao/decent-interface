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

  async clickFAQNewTab() {
    await this.page.click('[data-testid=home-linkFAQ]');
    return this.newTab();
  }

  async clickDiscordNewTab() {
    await this.page.click('[data-testid=home-linkDiscord]');
    return this.newTab();
  }

  async clickDocsNewTab() {
    await this.page.click('[data-testid=home-linkDocs]');
    const tab = await this.newTab();
    return tab;
  }
}
