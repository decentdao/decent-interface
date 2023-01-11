import { DAOHome } from './DAOHome';
import { NavPage } from './NavPage';
import { accounts } from './mock/data/testSigners';

export class DAOCreate extends NavPage {
  async visit() {
    this.visitPath('/create');
    return this;
  }

  async fillName(text: string) {
    await this.fillTextByTestId('essentials-daoName', text);
  }

  async clickNextButton() {
    await this.clickTestId('create-nextButton');
  }

  async clickPureGnosisSafe() {
    await this.clickTestId('choose-multisig');
  }

  async fillTotalSigners(text: string) {
    await this.fillTextByTestId('gnosisConfig-numberOfSignerInput', text);
  }

  async fillThreshold(text: string) {
    await this.fillTextByTestId('gnosisConfig-thresholdInput', text);
  }

  async fillWalletAddress(index: number, address: string) {
    await this.fillTextByTestId('gnosisConfig-signer-' + index, address);
  }

  async clickDeployButton() {
    await this.clickTestId('create-deployDAO');
  }

  /*
   * Utility method for creating a new DAO and returning the DAOHome page for it.
   */
  async createTestDAO() {
    await this.fillName('Test Fractal')
      .then(() => this.clickNextButton())
      .then(() => this.clickPureGnosisSafe())
      .then(() => this.clickNextButton())
      .then(() => this.fillWalletAddress(0, accounts[0]))
      .then(() => this.clickDeployButton());
    await this.waitForURLPath('/daos/');
    const url = this.url();
    const address = url.substring(url.lastIndexOf('/') + 1);
    return new DAOHome(this.pageContext(), address);
  }

  // TODO the rest of the fields / buttons in DAO creation paths
}
