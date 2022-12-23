import { DAOHome } from './DAOHome';
import { NavPage } from './NavPage';

export class DAOCreate extends NavPage {
  async visit() {
    super.visitPath('/create');
    return this;
  }

  async fillFractalName(text: string) {
    await this.page.locator('data-testid=essentials-daoName').fill(text);
  }

  async clickNextButton() {
    await this.page.click('data-testid=create-nextButton');
  }

  async clickPureGnosisSafe() {
    await this.page.locator('data-testid=choose-multisig').click();
  }

  async fillWalletAddress(text: string) {
    await this.page
      .locator('[placeholder="\\30 x0000000000000000000000000000000000000000"]')
      .fill(text);
  }

  async clickDeployButton() {
    await this.page.click('data-testid=create-deployDAO');
  }

  /*
   * Utility method for creating a new DAO and returning the DAOHome page for it.
   */
  async createTestDAO() {
    await this.fillFractalName('Test Fractal')
      .then(() => this.clickNextButton())
      .then(() => this.clickPureGnosisSafe())
      .then(() => this.clickNextButton())
      .then(() => this.fillWalletAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'))
      .then(() => this.clickDeployButton());
    await this.page.waitForURL(this.baseUrl + '/daos/');
    const url = this.page.url();
    const address = url.substring(url.lastIndexOf('/') + 1);
    return new DAOHome(this.page, address);
  }

  // TODO the rest of the fields / buttons in DAO creation paths
}
