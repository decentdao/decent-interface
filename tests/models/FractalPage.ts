import { expect, Page } from '@playwright/test';
import { BASE_URL } from '../testUtils';

export abstract class FractalPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  pageContext(): Page {
    return this.page;
  }

  abstract visit(): any;

  /**
   * The current URL of the underlying Page. This is not necessarily the URL
   * of the page model, as the user's interactions may have changed it to a
   * different page altogether.
   */
  url() {
    return this.page.url();
  }

  async visitPath(path: string) {
    await this.page.goto(BASE_URL + path, { waitUntil: 'networkidle' });
  }

  async clickBrowserBackButton() {
    await this.page.goBack({ waitUntil: 'networkidle' });
  }

  async clickBrowserReload() {
    await this.page.reload({ waitUntil: 'networkidle' });
  }

  async waitForURLPath(path: string) {
    await this.page.waitForURL(BASE_URL + path);
  }

  async waitForIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  async click(selector: string) {
    const locator = this.page.locator(selector);
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
  }

  async clickTestId(testId: string) {
    await this.click('[data-testid=' + testId + ']');
  }

  async fillText(selector: string, text: string) {
    const locator = this.page.locator(selector);
    await locator.scrollIntoViewIfNeeded();
    await locator.fill(text);
  }

  async fillTextByTestId(testId: string, text: string) {
    await this.fillText('[data-testid=' + testId + ']', text);
  }

  /**
   * Handles clicking a link / button which navigates to a new browser tab.
   * @param click the Promise created by clicking the link to open the tab.
   * @returns the Page object representing the new tab.
   */
  protected async newTab(testId: string) {
    const popupPromise = this.page.waitForEvent('popup');
    await this.click('[data-testid=' + testId + ']');
    const popup = await popupPromise;
    await popup.waitForLoadState();
    return popup;
  }

  expectId(testId: string) {
    return expect(this.page.locator('[data-testid=' + testId + ']'));
  }
}
