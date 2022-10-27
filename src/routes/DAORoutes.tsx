import { Routes, Route } from 'react-router-dom';
import DaoCreate from '../pages/DaoCreate';
import { DAO_ROUTES } from './constants';
import DAOSubRoutes from './DAOSubRoutes';

function DAORoutes() {
  return (
    <Routes>
      {/* <Route
        index
        element={<DAOSearch />}
      /> */}
      <Route
        path={DAO_ROUTES.new.path}
        element={<DaoCreate />}
      />
      {/* <Route
        path="favorites"
        element={<DAOFavorites />}
      /> */}
      <Route
        path={DAO_ROUTES.dao.path}
        element={<DAOSubRoutes />}
      />
    </Routes>
  );
}

export default DAORoutes;
