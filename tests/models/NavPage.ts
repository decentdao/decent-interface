import { FractalPage } from './FractalPage';

export enum MenuItems {
  Network,
  Wallet,
}

export abstract class NavPage extends FractalPage {
  /*
   * Utility method for connecting to the default wallet.
   */
  async connectToWallet() {
    await this.clickHeaderMenuDropdown()
      .then(() => this.clickMenuConnect())
      .then(() => this.clickWalletLocalNode());
  }

  async clickFractalLogo() {
    await this.page.click('a[href="#/"]');
  }

  async clickHeaderMenuDropdown() {
    await this.page.click('data-testid=header-accountMenu');
  }

  async menuLocator(selector: MenuItems) {
    switch (selector) {
      case MenuItems.Network:
        return this.page.locator('[data-testid=accountMenu-network] div div p');
      default:
        return undefined;
    }
  }

  async clickMenuConnect() {
    await this.page.click('[data-testid=accountMenu-connect]');
  }

  async clickMenuDisconnect() {
    await this.page.click('[data-testid=accountMenu-disconnect]');
  }

  async clickMenuCopyWalletAddress() {
    await this.page.click('[data-testid=walletMenu-accountDisplay]');
  }

  async clickHeaderFavorites() {
    await this.page.click('[data-testid=header-favoritesLink]');
  }

  async clickLeftMenuHome() {
    await this.page.click('[data-testid=sidebar-daoHomeLink"]');
  }

  async clickLeftMenuProposals() {
    await this.page.click('[data-testid=sidebar-proposalsLink"]');
  }

  async clickLeftMenuActivity() {
    await this.page.click('[data-testid=sidebar-activityLink"]');
  }

  async clickLeftMenuTreasury() {
    await this.page.click('[data-testid=sidebar-treasuryLink"]');
  }

  async clickLeftMenuSupport() {
    await this.page.click('[data-testid=sidebarExternal-support"]');
  }

  async clickLeftMenuDiscord() {
    await this.page.click('[data-testid=sidebarExternal-discord"]');
  }

  async clickLeftMenuDocs() {
    await this.page.click('[data-testid=sidebarExternal-documentation"]');
  }

  async clickWalletLocalNode() {
    await this.page
      .locator('#WEB3_CONNECT_MODAL_ID div.web3modal-provider-name:has-text("Local Node")')
      .click();
  }
}
