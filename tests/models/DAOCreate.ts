import { DAOHome } from './DAOHome';
import { NavPage } from './NavPage';
import { accounts } from './mock/data/testSigners';

export class DAOCreate extends NavPage {
  async visit() {
    this.visitPath('/create');
    return this;
  }

  async clickNext() {
    await this.clickTestId('create-nextSkipButton');
  }

  async clickSkip() {
    await this.clickTestId('create-skipButton');
  }

  async clickPrev() {
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

  async fillTokenName(name: string) {
    await this.fillTextByTestId('tokenVoting-tokenNameInput', name);
  }

  async fillTokenSymbol(symbol: string) {
    await this.fillTextByTestId('tokenVoting-tokenSymbolInput', symbol);
  }

  async fillTokenSupply(supply: string) {
    await this.fillTextByTestId('tokenVoting-tokenSupplyInput', supply);
  }

  async fillAllocationAddress(index: number, address: string) {
    await this.fillTextByTestId('tokenVoting-tokenAllocationAddressInput-' + index, address);
  }

  async fillAllocationAmount(index: number, amount: string) {
    await this.fillTextByTestId('tokenVoting-tokenAllocationAmountInput-' + index, amount);
  }

  async clickRemoveAllocation(index: number) {
    await this.clickTestId('tokenVoting-tokenAllocationRemoveButton-' + index);
  }

  async clickAddAllocation() {
    await this.clickTestId('tokenVoting-addAllocation');
  }

  async fillVotingPeriod(period: string) {
    await this.fillTextByTestId('govConfig-votingPeriod', period);
  }

  async fillQuorum(quorum: string) {
    await this.fillTextByTestId('govConfig-quorumPercentage', quorum);
  }

  async fillTimelock(timelock: string) {
    await this.fillTextByTestId('govConfig-timelock', timelock);
  }

  async clickDeployButton() {
    await this.clickTestId('create-deployDAO');
  }

  /*
   * Utility method for creating a new multisig DAO and
   * returning the DAOHome page for it.
   */
  async createTestMultisig() {
    await this.fillName('Test Multisig')
      .then(() => this.clickNext())
      .then(() => this.clickMultisig())
      .then(() => this.clickNext())
      .then(() => this.fillMultisigSigner(0, accounts[0]))
      .then(() => this.clickDeployButton());
    await this.waitForURLPath('/daos/');
    return new DAOHome(this.pageContext());
  }

  /*
   * Utility method for creating a new multisig DAO and
   * returning the DAOHome page for it.
   */
  async createTestTokenVoting() {
    await this.fillName('Test Token Voting')
      .then(() => this.clickNext())
      .then(() => this.clickTokenVoting())
      .then(() => this.clickNext())
      .then(() => this.fillTokenName('Test Token'))
      .then(() => this.fillTokenSymbol('TT'))
      .then(() => this.fillTokenSupply('1'))
      .then(() => this.fillAllocationAddress(0, accounts[0]))
      .then(() => this.fillAllocationAmount(0, '1'))
      .then(() => this.clickNext())
      .then(() => this.clickDeployButton());
    await this.waitForURLPath('/daos/');
    return new DAOHome(this.pageContext());
  }
}
