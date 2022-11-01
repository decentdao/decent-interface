import { Routes, Route } from 'react-router-dom';
import DaoCreate from '../pages/DaoCreate';
import { DAO_ROUTES } from './constants';
import DAOSubRoutes from './DAOSubRoutes';

function DAORoutes() {
  return (
    <Routes>
      <Route
        path={DAO_ROUTES.new.path}
        element={<DaoCreate />}
      />
      <Route
        path={DAO_ROUTES.dao.path}
        element={<DAOSubRoutes />}
      />
    </Routes>
  );
}

export default DAORoutes;
