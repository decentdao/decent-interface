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
    await this.clickTestId('home-linkFAQ');
    return this.newTab();
  }

  async clickDiscordNewTab() {
    await this.clickTestId('home-linkDiscord');
    return this.newTab();
  }

  async clickDocsNewTab() {
    await this.clickTestId('home-linkDocs');
    return this.newTab();
  }
}
