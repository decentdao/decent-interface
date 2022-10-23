import { DAOCreate } from './DAOCreate';
import { DAOSearch } from './DAOSearch';
import { NavPage } from './NavPage';

export class HomePage extends NavPage {
  async visit() {
    await super.visitPath('');
    return this;
  }

  async clickCreateAFractal() {
    await this.page.click('[data-testid=home-linkCreate]');
    return new DAOCreate(this.page);
  }

  async clickFindAFractal() {
    await this.page.click('[data-testid=home-linkFind]');
    return new DAOSearch(this.page);
  }
}
