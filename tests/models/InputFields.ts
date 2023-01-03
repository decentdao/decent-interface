import { Locator, Page } from '@playwright/test';
import { accounts } from './mock/data/testSigners';

export class InputFields {
  readonly page: Page;

  readonly fractalName: Locator;

  readonly signers: Locator;

  readonly sigThreshold: Locator;

  readonly trustedAddresses: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fractalName = page.locator('input[type="text"]');
    this.signers = page.locator(
      'text=SignersHow many trusted users for Gnosis Safe >> input[type="text"]'
    );
    this.sigThreshold = page.locator('(//input[@id="form-field"])[2]');
    this.trustedAddresses = page.locator('[placeholder="0x0000...0000"]');
  }

  async fillField(fieldName: any) {
    switch (fieldName) {
      case 'Insert Fractal Name':
        await this.fractalName.fill('Playwright Parent');
        break;
      case 'Select Signers field':
        await this.signers.click();
        break;
      case 'Select Signature Threshold':
        await this.sigThreshold.click();
        break;
      case 'Insert Local Node Wallet':
        await this.trustedAddresses.fill(accounts[0]);
        break;
      default:
        throw new Error('This field can not be found...');
    }
  }
}
