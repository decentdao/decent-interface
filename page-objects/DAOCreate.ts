import { DAOHome } from './DAOHome';
import { NavPage } from './NavPage';

export class DAOCreate extends NavPage {
  async visit() {
    super.visitPath('/daos/new');
    return this;
  }

  async fillFractalName(text: string) {
    await this.page.locator('input[type="text"]').fill(text);
  }

  async clickNextButton() {
    await this.page.click('button:has-text("* * *Next")');
  }

  async clickMVDGnosisSafe() {
    await this.page.locator('(//div[@class="flex items-center"])[2]').click();
  }

  async clickPureGnosisSafe() {
    await this.page.locator('(//div[@class="flex items-center"])[3]').click();
  }

  // TODO there can be multiple addresses here, so support adding / removing / filling multiples
  async fillWalletAddress(text: string) {
    await this.page
      .locator('[placeholder="\\30 x0000000000000000000000000000000000000000"]')
      .fill(text);
  }

  async clickDeployButton() {
    await this.page.click('button:has-text("* * *Deploy")');
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
    const url = this.page.url();
    const address = url.substring(url.lastIndexOf('/') + 1);
    return new DAOHome(this.page, address);
  }

  // TODO the rest of the fields / buttons in DAO creation paths
}
