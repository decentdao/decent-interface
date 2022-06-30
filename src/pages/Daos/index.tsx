import { Routes, Route } from 'react-router-dom';
import DAOSearch from '../DaoSearch';
import DaoCreate from '../DaoCreate';
import DAOFavorites from '../DaoFavorites';
import DAO from '../Dao';

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
        element={<DAO />}
      />
    </Routes>
  );
}

export default DAOs;
