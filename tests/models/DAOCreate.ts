import { DAOHome } from './DAOHome';
import { NavPage } from './NavPage';
import { accounts } from './mock/data/testSigners';

export class DAOCreate extends NavPage {
  async visit() {
    this.visitPath('/create');
    return this;
  }

  async clickNextButton() {
    await this.clickTestId('create-nextSkipButton');
  }

  async clickSkipButton() {
    await this.clickTestId('create-skipButton');
  }

  async clickPrevButton() {
    await this.clickTestId('create-prevButton');
  }

  async fillName(text: string) {
    await this.fillTextByTestId('essentials-daoName', text);
  }

  async clickMultisig() {
    await this.clickTestId('choose-multisig');
  }

  async clickTokenVoting() {
    await this.clickTestId('choose-usul');
  }

  async fillTotalSigners(total: string) {
    await this.fillTextByTestId('gnosisConfig-numberOfSignerInput', total);
  }

  async fillThreshold(threshold: string) {
    await this.fillTextByTestId('gnosisConfig-thresholdInput', threshold);
  }

  async fillMultisigSigner(index: number, address: string) {
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
      .then(() => this.clickMultisig())
      .then(() => this.clickNextButton())
      .then(() => this.fillMultisigSigner(0, accounts[0]))
      .then(() => this.clickDeployButton());
    await this.waitForURLPath('/daos/');
    return new DAOHome(this.pageContext());
  }
}
