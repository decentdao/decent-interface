import { DAOCreate } from './DAOCreate';
import { NavPage } from './NavPage';

export class HomePage extends NavPage {
  async visit() {
    await this.visitPath('');
    return this;
  }

  async clickCreateAFractal() {
    await this.clickTestId('home-linkCreate');
    return new DAOCreate(this.pageContext());
  }
}
