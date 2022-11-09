import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import DAORoutes from './DAORoutes';
import { DAO_ROUTES } from './constants';

function FractalRoutes() {
  return (
    <Routes>
      <Route
        index
        element={<Home />}
      />
      <Route
        path={DAO_ROUTES.daos.path}
        element={<DAORoutes />}
      />
    </Routes>
  );
}

export default FractalRoutes;
