import { Routes, Route } from 'react-router-dom';
import DAOSearch from '../DaoSearch';

import DaoCreate from '../DaoCreate';
import DAO from '../Dao';

// @todo refactor route files to own directory
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
        path=":address/*"
        element={<DAO />}
      />
    </Routes>
  );
}

export default DAOs;
