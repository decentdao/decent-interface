import { NavPage } from './NavPage';

export class Favorites extends NavPage {
  async visit() {
    await super.visitPath('/daos/favorites');
    return this;
  }
}
