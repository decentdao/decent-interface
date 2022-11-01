import { Routes, Route } from 'react-router-dom';
import { DAOController } from '../controller/DAOs/DAOController';
import DAO from '../pages/Dao';
import DaoCreate from '../pages/DaoCreate';
import { DAO_ROUTES } from './constants';

function DAORoutes() {
  return (
    <Routes>
      <Route
        path={DAO_ROUTES.new.path}
        element={<DaoCreate />}
      />
      <Route
        path={DAO_ROUTES.dao.path}
        element={
          <DAOController>
            <DAO />
          </DAOController>
        }
      />
    </Routes>
  );
}

export default DAORoutes;
