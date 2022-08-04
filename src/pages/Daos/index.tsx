import { Routes, Route } from 'react-router-dom';
import DAOSearch from '../DaoSearch';
import DaoCreate from '../DaoCreate';
import DAOFavorites from '../DaoFavorites';
import DAO from '../Dao';
import { DAOController } from '../../controller/DAOs/DAOController';
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
    </Routes>
  );
}

export default DAOs;
