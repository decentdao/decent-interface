import { DAOCreate } from './DAOCreate';
import { NavPage } from './NavPage';

export class HomePage extends NavPage {
  async visit() {
    await this.visitPath('');
    return this;
  }

  async clickConnectWallet() {
    await this.clickTestId('home-linkConnect');
  }

  async clickCreateAFractal() {
    await this.clickTestId('home-linkCreate');
    return new DAOCreate(this.pageContext());
  }

  async clickFAQNewTab() {
    const tab = this.newTab(this.clickTestId('home-linkFAQ'));
    return tab;
  }

  async clickDiscordNewTab() {
    const tab = this.newTab(this.clickTestId('home-linkDiscord'));
    return tab;
  }

  async clickDocsNewTab() {
    const tab = await this.newTab(this.clickTestId('home-linkDocs'));
    return tab;
  }
}
