import { Locator, Page } from '@playwright/test';

export class Navbuttons {
  readonly page: Page;

  readonly appName: Locator;

  readonly connectWallet: Locator;

  readonly connectMenu: Locator;

  readonly disconnectMenu: Locator;

  readonly copyMenu: Locator;

  readonly favoritesMenu: Locator;

  readonly communityMenu: Locator;

  readonly overviewMenu: Locator;

  readonly faqMenu: Locator;

  readonly docsMenu: Locator;

  readonly localWallet: Locator;

  readonly createDao: Locator;

  readonly findDao: Locator;

  readonly next: Locator;

  readonly deploy: Locator;

  constructor(page: Page) {
    this.page = page;
    this.appName = page.locator('a[href="#/"]');
    this.connectWallet = page.locator('//div[@id="menu:down-arrow"]//*[name()="svg"]');
    this.createDao = page.locator('(//button[@id="home:link-create"])[1]');
    this.findDao = page.locator('(//button[@id="home:link-find"])[1]');
    this.connectMenu = page.locator('button[role="menuitem"]:has-text("Connect")');
    this.disconnectMenu = page.locator('(//button[@id="headlessui-menu-item-:r29:"])[1]');
    this.copyMenu = page.locator('//*[name()="path" and contains(@d,"M7 6V3C7 2")]');
    this.favoritesMenu = page.locator(
      '[id="headlessui-menu-item-:r2r:"] div:has-text("Favorites")'
    );
    this.communityMenu = page.locator(
      '[id="headlessui-menu-item-:r2t:"] div:has-text("Community")'
    );
    this.overviewMenu = page.locator('[id="headlessui-menu-item-:r2v:"] div:has-text("Overview")');
    this.faqMenu = page.locator('[id="headlessui-menu-item-:r31:"] div:has-text("FAQ")');
    this.docsMenu = page.locator('[id="headlessui-menu-item-:r33:"] div:has-text("Docs")');
    this.localWallet = page.locator(
      '#WEB3_CONNECT_MODAL_ID div.web3modal-provider-name:has-text("Local Node")'
    );
    this.next = page.locator('button:has-text("* * *Next")');
    this.deploy = page.locator('button:has-text("* * *Deploy")');
  }

  async clickOnButton(buttonName: any) {
    switch (buttonName) {
      case 'Return to Homepage':
        await this.appName.click();
        break;
      case 'Connect to Wallet on Header':
        await this.connectWallet.click();
        break;
      case 'Create a Fractal - Button':
        await this.createDao.click();
        break;
      case 'Find a Fractal - Button':
        await this.findDao.click();
        break;
      case 'Connect - drop-down Menu':
        await this.connectMenu.click();
        break;
      case 'Disconnect Wallet - drop-down Menu':
        await this.disconnectMenu.click();
        break;
      case 'Copy Wallet Account - drop-down Menu':
        await this.copyMenu.click();
        break;
      case 'Favorites - drop-down Menu':
        await this.favoritesMenu.click();
        break;
      case 'Community - drop-down Menu':
        await this.communityMenu.click();
        break;
      case 'Overview - drop-down Menu':
        await this.overviewMenu.click();
        break;
      case 'FAQ - drop-down Menu':
        await this.faqMenu.click();
        break;
      case 'Documents - drop-down Menu':
        await this.docsMenu.click();
        break;
      case 'Select Local Wallet - Web3':
        await this.localWallet.click();
        break;
      case 'Next Button':
        await this.next.click();
        break;
      case 'Deploy Button':
        await this.deploy.click();
        break;
      default:
        throw new Error('This button can not be found...');
    }
  }
}
