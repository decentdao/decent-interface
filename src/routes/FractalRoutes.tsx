import { Route, Routes } from 'react-router-dom';
import DaoCreate from '../pages/DaoCreate';
import Home from '../pages/Home';
import DAORoutes from './DAORoutes';
import { BASE_ROUTES, DAO_ROUTES } from './constants';

function FractalRoutes() {
  return (
    <Routes>
      <Route
        index
        element={<Home />}
      />
      <Route
        path={BASE_ROUTES.create}
        element={<DaoCreate />}
      />
      <Route
        path={DAO_ROUTES.daos.path}
        element={<DAORoutes />}
      />
    </Routes>
  );
}

export default FractalRoutes;
