import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import { DAO_ROUTES } from './constants';
import DAORoutes from './DAORoutes';

function FractalRoutes() {
  return (
    <Routes>
      <Route
        index
        element={<Home />}
      />
      <Route
        path={DAO_ROUTES.dao.path}
        element={<DAORoutes />}
      />
    </Routes>
  );
}

export default FractalRoutes;
