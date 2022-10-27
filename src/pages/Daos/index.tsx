import { Routes, Route } from 'react-router-dom';
import DAOSearch from '../DaoSearch';
import DaoCreate from '../DaoCreate';
import DAOFavorites from '../DaoFavorites';
import DAO from '../Dao';
import { DAOController } from '../../controller/DAOs/DAOController';
import { TreasuryController } from '../../controller/Modules/TreasuryController';
import Treasury from '../Treasury';
function DAOs() {
  return (
    <Routes>
      <Route
        index
        element={<DAOSearch />}
      />
      <Route
        path="new"
        element={<DaoCreate />}
      />
      <Route
        path="favorites"
        element={<DAOFavorites />}
      />
      <Route
        path=":address/*"
        element={
          <DAOController>
            <DAO />
          </DAOController>
        }
      />
      <Route
        path=":address/treasury"
        element={
          <TreasuryController>
            <Treasury />
          </TreasuryController>
        }
      />
    </Routes>
  );
}

export default DAOs;
