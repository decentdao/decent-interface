import { FractalPage } from './FractalPage';

export class NavPage extends FractalPage {
  /*
   * Utility method for connecting to the default wallet.
   */
  async connectToWallet() {
    await this.clickHeaderMenuDropdown()
      .then(() => this.clickMenuConnectWallet())
      .then(() => this.clickWalletLocalNode());
  }

  async clickFractalLogo() {
    await this.page.click('a[href="#/"]');
  }

  async clickHeaderMenuDropdown() {
    await this.page.click('//div[@id="menu:down-arrow"]//*[name()="svg"]');
  }

  async clickMenuConnectWallet() {
    await this.page.click('[data-testid="menu:connect"]');
  }

  async clickMenuDisconnect() {
    await this.page.click('[data-testid="menu:connect"]');
  }

  async clickMenuCopyWalletAddress() {
    await this.page.click('//*[name()="path" and contains(@d,"M7 6V3C7 2")]');
  }

  async clickMenuFavorites() {
    await this.page.click('[data-testid="menu:favorites"] div:has-text("Favorites")');
  }

  async clickMenuCommunity() {
    await this.page.click('[data-testid="menu:community"]');
  }

  async clickMenuOverview() {
    await this.page.click('[data-testid="menu:overview"] div:has-text("Overview")');
  }

  async clickMenuFaq() {
    await this.page.click('[data-testid="menu:faq"] div:has-text("FAQ")');
  }

  async clickMenuDocs() {
    await this.page.click('[data-testid="menu:docs"] div:has-text("Docs")');
  }

  async clickWalletLocalNode() {
    await this.page
      .locator('#WEB3_CONNECT_MODAL_ID div.web3modal-provider-name:has-text("Local Node")')
      .click();
  }
}
