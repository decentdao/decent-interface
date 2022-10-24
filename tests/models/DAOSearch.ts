import { NavPage } from './NavPage';

export class DAOSearch extends NavPage {
  async visit() {
    await super.visitPath('/daos');
    return this;
  }
}
