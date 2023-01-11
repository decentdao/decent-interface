import { FractalPage } from './FractalPage';

export enum MenuItems {
  Network,
  Wallet,
}

export abstract class NavPage extends FractalPage {
  async clickFractalLogo() {
    await this.page.click('a[href="#/"]');
  }

  async clickHeaderMenuDropdown() {
    await this.page.locator('[data-testid="header-accountMenu"]').click();
  }

  async menuLocator(selector: MenuItems) {
    switch (selector) {
      case MenuItems.Network:
        return this.page.locator('[data-testid="accountMenu-network"]');
      default:
        return undefined;
    }
  }

  async clickMenuDisconnect() {
    await this.page.click('[data-testid="accountMenu-disconnect"]');
  }

  async clickMenuCopyWalletAddress() {
    await this.page.click('[data-testid="walletMenu-accountDisplay"]');
  }

  async clickHeaderFavorites() {
    await this.page.click('[data-testid="header-favoritesLink]"');
  }

  async clickLeftMenuHome() {
    await this.page.click('[data-testid="sidebar-daoHomeLink]"');
  }

  async clickLeftMenuProposals() {
    await this.page.click('[data-testid="sidebar-proposalsLink"]');
  }

  async clickLeftMenuActivity() {
    await this.page.click('[data-testid="sidebar-activityLink"]');
  }

  async clickLeftMenuTreasury() {
    await this.page.click('[data-testid="sidebar-treasuryLink"]');
  }

  async clickLeftMenuSupport() {
    await this.page.click('[data-testid="sidebarExternal-faq"]');
  }

  async clickLeftMenuDiscord() {
    await this.page.click('[data-testid="sidebarExternal-discord"]');
  }

  async clickLeftMenuDocs() {
    await this.page.click('[data-testid="sidebarExternal-documentation"]');
  }
}
