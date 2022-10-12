import { Page } from '@playwright/test';

export class Navbuttons {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async clickFractalLogo() {
    await this.page.click('a[href="#/"]');
  }

  async clickHeaderConnectWallet() {
    await this.page.click('//div[@id="menu:down-arrow"]//*[name()="svg"]');
  }

  async clickCreateAFractal() {
    await this.page.click('(//button[@id="home:link-create"])[1]');
  }

  async clickFindAFractal() {
    await this.page.click('(//button[@id="home:link-find"])[1]');
  }

  async clickConnectWalletMenu() {
    await this.page.click('[data-testid="menu:connect"]');
  }

  async clickDisconnectMenu() {
    await this.page.click('[data-testid="menu:connect"]');
  }

  async clickCopyWalletAddressMenu() {
    await this.page.click('//*[name()="path" and contains(@d,"M7 6V3C7 2")]');
  }

  async clickFavoritesMenu() {
    await this.page.click('[data-testid="menu:favorites"] div:has-text("Favorites")');
  }

  async clickCommunityMenu() {
    await this.page.click('[data-testid="menu:community"]');
  }

  async clickOverviewMenu() {
    await this.page.click('[data-testid="menu:overview"] div:has-text("Overview")');
  }

  async clickFaqMenu() {
    await this.page.click('[data-testid="menu:faq"] div:has-text("FAQ")');
  }

  async clickDocsMenu() {
    await this.page.click('[data-testid="menu:docs"] div:has-text("Docs")');
  }

  async clickLocalWallet() {
    await this.page.click(
      '#WEB3_CONNECT_MODAL_ID div.web3modal-provider-name:has-text("Local Node")'
    );
  }

  async clickNextButton() {
    await this.page.click('button:has-text("* * *Next")');
  }

  async clickDeployButton() {
    await this.page.click('button:has-text("* * *Deploy")');
  }
}
