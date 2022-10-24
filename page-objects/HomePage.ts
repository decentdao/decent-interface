import { DAOCreate } from './DAOCreate';
import { DAOSearch } from './DAOSearch';
import { NavPage } from './NavPage';

export class HomePage extends NavPage {
  async visit() {
    await super.visitPath('');
    return this;
  }

  async clickCreateAFractal() {
    await this.page.click('(//button[@id="home:link-create"])[1]');
    return new DAOCreate(this.page);
  }

  async clickFindAFractal() {
    await this.page.click('(//button[@id="home:link-find"])[1]');
    return new DAOSearch(this.page);
  }
}
